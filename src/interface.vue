<template>
	<div v-if="displayOnly">{{ computedValue }}</div>
	<v-input v-else v-model="value" />
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, watch } from 'vue';
import { parseExpression } from './operations';

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
		template: {
			type: String,
			default: '',
		},
		displayOnly: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const values = inject<ComputedRef<Record<string, any>>>('values');

		const computedValue = computed(() => {
			if (values) {
				return compute();
			}
			return '';
		});

		if (!props.displayOnly && values) {
			watch(values, (val, oldVal) => {
				if (val[props.field] !== oldVal[props.field]) return;

				const newValue = compute();
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
				return parseExpression(expression, values);
			});
		}
	},
});
</script>
