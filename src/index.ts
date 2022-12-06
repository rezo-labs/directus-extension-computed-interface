import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'computed',
	name: 'Computed',
	icon: 'calculate',
	description: 'Perform computed value based on other fields',
	component: InterfaceComponent,
	types: ['string', 'text', 'integer', 'decimal', 'bigInteger', 'float', 'boolean', 'alias'],
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
			field: 'mode',
			name: 'Field Mode',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'select-dropdown',
				options: {
					allowNone: true,
					choices: [
						{ text: 'Display Only', value: 'displayonly' },
						{ text: 'Read Only', value: 'readonly' },
					],
				},
			},
		},
		{
			field: 'prefix',
			name: 'Prefix',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'system-input-translated-string',
				options: {
					trim: false,
				},
			},
		},
		{
			field: 'suffix',
			name: 'Suffix',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'system-input-translated-string',
				options: {
					trim: false,
				},
			},
		},
		{
			field: 'customCss',
			name: 'Custom CSS',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'input-code',
				options: {
					language: 'json',
				},
			},
		},
	],
});
