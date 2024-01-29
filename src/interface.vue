<template>
	<div v-if="mode" :style="customCss">
		<span class="prefix">{{ prefix }}</span>
		<span class="computed-value">{{ computedValue }}</span>
		<span class="suffix">{{ suffix }}</span>
	</div>
	<v-input
		v-else
		v-bind="$attrs"
		:field="field"
		:collection="collection"
		:primary-key="primaryKey"
		:model-value="value"
		@update:model-value="onInput"
	/>
	<v-notice v-if="errorMsg" type="danger">{{ errorMsg }}</v-notice>
</template>

<script lang="ts">
import { ComputedRef, defineComponent, inject, ref, watch, toRefs } from 'vue';
import { parseExpression } from './operations';
import { useDeepValues, useCollectionRelations } from './utils';
import { useCollection } from '@directus/extensions-sdk';

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
		type: {
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
		debugMode: {
			type: Boolean,
			default: false,
		},
		computeIfEmpty: {
			type: Boolean,
			default: false,
		},
		initialCompute: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const defaultValues = useCollection(props.collection).defaults
		const computedValue = ref<string | number | null>(props.value);
		const relations = useCollectionRelations(props.collection);
		const { collection, field, primaryKey } = toRefs(props)
		const isComputedEditing = ref(true);

		const values = useDeepValues(
			inject<ComputedRef<Record<string, any>>>('values')!,
			relations,
			collection,
			field,
			primaryKey,
			props.template
		);
		const errorMsg = ref<string | null>(null);

		if (values) {
			watch(values, () => {
				if (isComputedEditing.value) {
					isComputedEditing.value = false
					return
				}

				const newValue = compute();
				computedValue.value = newValue;

				if (props.mode === 'displayonly') {
					return;
				}
				if (newValue !== props.value) {
					setTimeout(() => {
						emit('input', newValue);
					}, 1);
				}
			}, {
				immediate: props.initialCompute ||
					(props.computeIfEmpty && (props.value === null || props.value === undefined)),
			});
		}

		return {
			computedValue,
			errorMsg,
			onInput,
		};

		function compute() {
			try {
				const res = props.template.replace(/{{.*?}}/g, (match) => {
					const expression = match.slice(2, -2).trim();
					return parseExpression(expression, values.value, defaultValues.value, props.debugMode);
				});

				errorMsg.value = null;

				if (['integer', 'decimal', 'bigInteger'].includes(props.type)) {
					return parseInt(res) || 0;
				}
				if (['float'].includes(props.type)) {
					return parseFloat(res) || 0;
				}
				return res;
			} catch (err) {
				errorMsg.value = err.message ?? 'Unknown error';
				return null;
			}
		}

		function onInput(value: string) {
			isComputedEditing.value = true;
			emit('input', value);
		}
	},
});
</script>
