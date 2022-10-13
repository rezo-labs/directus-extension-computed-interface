import { watch, ref } from 'vue';
import type { Ref } from 'vue';
import { useApi, useStores } from '@directus/extensions-sdk';

export function checkFieldInTemplate(template: string, field: string) {
	const matches = template.match(/{{.*?}}/g);
	return (matches || []).some((m) => m.includes(field));
}

export const useCollectionRelations = (collection: string): Ref<any[]> => {
	const { useRelationsStore } = useStores();
	const { getRelationsForCollection } = useRelationsStore();
	return ref(getRelationsForCollection(collection));
};

interface IRelationUpdate<T = unknown> {
	create: T[];
	update: { owner: string; id: number | string }[];
	delete: (number | string)[];
}

export const useDeepValues = (
	values: Ref<Record<string, any>>,
	relations: Ref<any[]>,
	collection: string,
	pk: string,
	template: string
) => {
	const api = useApi();
	const finalValues = ref<Record<string, any>>(values.value);
	watch(values, async () => {
		Object.keys(values.value).forEach(async (key) => {
			const relation = relations.value.find((rel) => rel.meta?.one_field === key);

			if (!relation || !checkFieldInTemplate(template, key)) {
				return;
			}

			const fieldName = relation.meta.one_field;
			const fieldChanges = values.value[fieldName] as IRelationUpdate;

			if (!fieldChanges) {
				return;
			}

			let arrayOfIds: (string | number)[] = [];
			let arrayOfData: unknown[] = [];
			if (pk !== '+') {
				const {
					data: { data },
				} = await api.get(`items/${collection}/${pk}`, {
					params: {
						fields: [fieldName],
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

			finalValues.value = { ...finalValues.value, [key]: arrayOfData };
		});
	});

	return finalValues;
};
