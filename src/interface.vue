<template>
	<div v-if="mode">{{ prefix }}{{ computedValue }}{{ suffix }}</div>
	<v-input v-else v-model="value" />
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
		};

		function compute() {
			return props.template.replace(/{{.*?}}/g, (match) => {
				const expression = match.slice(2, -2).trim();
				return parseExpression(expression, values.value);
			});
		}
	},
});
</script>
