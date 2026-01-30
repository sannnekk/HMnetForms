/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register(
	'cms-el-preview-hmnet-form',
	() => import('./preview'),
)

/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register(
	'cms-el-config-hmnet-form',
	() => import('./config'),
)

/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register('cms-el-hmnet-form', () => import('./component'))

/**
 * @private
 * @package buyers-experience
 */
Shopware.Service('cmsService').registerCmsElement({
	name: 'hmnet-form',
	label: 'hmnet-forms.elements.form.label',
	category: 'hmnet-theme-blocks',
	component: 'cms-el-hmnet-form',
	configComponent: 'cms-el-config-hmnet-form',
	previewComponent: 'cms-el-preview-hmnet-form',
	defaultConfig: {
		representation: {
			source: 'static',
			value: 'button',
		},
		formId: {
			source: 'static',
			value: null,
		},
	},
})
