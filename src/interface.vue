<template>
	<div v-if="displayOnly">{{ computedValue }}</div>
	<v-input v-else v-model="value" />
</template>

<script lang="ts">
import { ComputedRef, defineComponent, inject, ref, watch } from 'vue';
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

		const computedValue = ref('');

		if (values) {
			if (props.displayOnly) {
				computedValue.value = compute();
			}

			watch(values, (val, oldVal) => {
				if (shouldUpdate(val, oldVal)) {
					if (props.displayOnly) {
						computedValue.value = compute();
					} else {
						const newValue = compute();
						if (newValue !== props.value) {
							emit('input', newValue);
						}
					}
				}
			});
		}

		return {
			computedValue,
		};

		/** Simple check which fields are used */
		function shouldUpdate(val: Record<string, any>, oldVal: Record<string, any>) {
			for (const key of Object.keys(val)) {
				if (key !== props.field && checkFieldInTemplate(key) && val[key] !== oldVal[key]) {
					return true;
				}
			}
			return false;
		}

		function checkFieldInTemplate(field: string) {
			const matches = props.template.match(/{{.*?}}/g);
			return (matches || []).some((m) => m.includes(field));
		}

		function compute() {
			return props.template.replace(/{{.*?}}/g, (match) => {
				const expression = match.slice(2, -2).trim();
				return parseExpression(expression, values);
			});
		}
	},
});
</script>
