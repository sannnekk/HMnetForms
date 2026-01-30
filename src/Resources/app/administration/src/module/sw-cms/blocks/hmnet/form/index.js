/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register(
	'hmnet-form-block-preview',
	() => import('./preview'),
)

/**
 * @private
 * @package buyers-experience
 */
Shopware.Component.register(
	'sw-cms-block-hmnet-form',
	() => import('./component'),
)

/**
 * @private
 * @package buyers-experience
 */
Shopware.Service('cmsService').registerCmsBlock({
	name: 'hmnet-form',
	category: 'hmnet-theme-blocks',
	label: 'hmnet-forms.blocks.form.label',
	component: 'sw-cms-block-hmnet-form',
	previewComponent: 'hmnet-form-block-preview',
	defaultConfig: {
		marginBottom: '20px',
		marginTop: '20px',
		marginLeft: '',
		marginRight: '',
		sizingMode: 'boxed',
	},
	slots: {
		content: 'hmnet-form',
	},
})
