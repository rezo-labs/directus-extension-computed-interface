import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'computed',
	name: 'Computed',
	icon: 'calculate',
	description: 'Perform computed value based on other fields',
	component: InterfaceComponent,
	types: ['string', 'text', 'integer', 'decimal', 'bigInteger', 'float', 'boolean'],
	group: 'other',
	options: [
		{
			field: 'template',
			name: 'Template',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
		{
			field: 'displayOnly',
			name: 'Display Only',
			type: 'boolean',
			schema: {
				default_value: false,
			},
			meta: {
				interface: 'boolean',
				width: 'half',
			},
		},
	],
});
