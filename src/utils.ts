import { watch, ref, computed } from 'vue';
import type { Ref } from 'vue';
import { useApi, useStores } from '@directus/extensions-sdk';
import { Relation } from '@directus/shared/types';

export function checkFieldInTemplate(template: string, field: string) {
	const matches = template.match(/{{.*?}}/g);
	return (matches || []).some((m) => m.includes(field));
}

/** Simple check which fields are used */
function shouldUpdate(template: string, computedField: string, val: Record<string, any>, oldVal: Record<string, any>) {
	for (const key of Object.keys(val)) {
		if (
			key !== computedField &&
			checkFieldInTemplate(template, key) &&
			val[key] !== oldVal[key] &&
			JSON.stringify(val[key]) !== JSON.stringify(oldVal[key])
		) {
			return true;
		}
	}
	return false;
}

export const useCollectionRelations = (collection: string): Ref<Relation[]> => {
	const { useRelationsStore } = useStores();
	const { getRelationsForCollection } = useRelationsStore();
	return ref(getRelationsForCollection(collection));
};

interface IRelationUpdate {
	create: Record<string, any>[];
	update: Record<string, any>[];
	delete: (string | number)[];
}

export const useDeepValues = (
	values: Ref<Record<string, any>>,
	relations: Ref<Relation[]>,
	collection: string,
	computedField: string,
	pk: string,
	template: string
) => {
	const api = useApi();
	const finalValues = ref<Record<string, any>>({});
	// Directus store o2m value as reference so when o2m updated, val & oldVal in watch are the same.
	// This will serialize values so when o2m fields are updated, their changes can be seen.
	const cloneValues = computed(() => JSON.stringify(values.value));

	watch(cloneValues, async (val, oldVal) => {
		if (!shouldUpdate(template, computedField, JSON.parse(val), JSON.parse(oldVal))) {
			return;
		}

		const relationalData: Record<string, any> = {};

		for (const key of Object.keys(values.value)) {
			const relation = relations.value.find((rel) => rel.meta?.one_field === key && rel.related_collection === collection);

			if (!relation || !checkFieldInTemplate(template, key)) {
				continue;
			}

			const fieldChanges = values.value[key] as IRelationUpdate;

			if (!fieldChanges) {
				continue;
			}

			let arrayOfIds: (string | number)[] = [];
			let arrayOfData: unknown[] = [];
			if (pk !== '+') {
				const {
					data: { data },
				} = await api.get(`items/${collection}/${pk}`, {
					params: {
						fields: [key],
					},
				});
				arrayOfIds = arrayOfIds.concat(data[key]);
			}

			if (fieldChanges.update) {
				arrayOfIds = arrayOfIds.concat(fieldChanges.update.map(({ id }) => id));
			}

			if (fieldChanges.delete) {
				arrayOfIds = arrayOfIds.filter((id) => !fieldChanges.delete.includes(id));
			}

			if (arrayOfIds.length) {
				const {
					data: { data },
				} = await api.get(`items/${relation.collection}`, {
					params: { filter: { id: { _in: arrayOfIds } } },
				});

				// merging item updates
				arrayOfData = data.map((item: any) => ({
					...item,
					...fieldChanges.update?.find(({ id }) => item.id === id),
				}));
			}

			// must concat after request, created items doenst have ids
			if (fieldChanges.create) {
				arrayOfData = arrayOfData.concat(fieldChanges.create);
			}

			relationalData[key] = arrayOfData;
		}

		finalValues.value = { ...values.value, ...relationalData };
	}, {
		deep: false,
	});

	return finalValues;
};
