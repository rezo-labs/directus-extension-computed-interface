<template>
	<div v-if="mode" :style="customCss">
		<span class="prefix">{{ prefix }}</span>
		<span class="computed-value">{{ computedValue }}</span>
		<span class="suffix">{{ suffix }}</span>
	</div>
	<v-input v-else v-model="value" />
	<v-notice v-if="errorMsg" type="danger">{{ errorMsg }}</v-notice>
</template>

<script lang="ts">
import { ComputedRef, defineComponent, inject, ref, watch } from 'vue';
import { parseExpression } from './operations';
import { useDeepValues, useCollectionRelations } from './utils';

export default defineComponent({
	props: {
		value: {
			type: [String, Number],
			default: null,
		},
		field: {
			type: String,
			default: null,
		},
		collection: {
			type: String,
			default: '',
		},
		primaryKey: {
			type: [String, Number],
			default: '',
		},
		template: {
			type: String,
			default: '',
		},
		mode: {
			type: String,
			default: null,
		},
		prefix: {
			type: String,
			default: null,
		},
		suffix: {
			type: String,
			default: null,
		},
		customCss: {
			type: Object,
			default: null,
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const computedValue = ref(props.value);
		const relations = useCollectionRelations(props.collection);
		const values = useDeepValues(
			inject<ComputedRef<Record<string, any>>>('values')!,
			relations,
			props.collection,
			props.field,
			props.primaryKey,
			props.template
		);
		const errorMsg = ref<string | null>(null);

		if (values) {
			watch(values, () => {
				const newValue = compute();
				computedValue.value = newValue;

				if (props.mode === 'displayonly') {
					return;
				}
				if (newValue !== props.value) {
					emit('input', newValue);
				}
			});
		}

		return {
			computedValue,
			errorMsg,
		};

		function compute() {
			try {
				return props.template.replace(/{{.*?}}/g, (match) => {
					const expression = match.slice(2, -2).trim();
					return parseExpression(expression, values.value);
				});
			} catch (err) {
				errorMsg.value = err.message ?? 'Unknown error';
				return '';
			}
		}
	},
});
</script>
