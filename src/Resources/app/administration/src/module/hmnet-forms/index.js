import './page/hmnet-forms-list'
import './page/hmnet-forms-detail'
import './page/hmnet-forms-create'

Shopware.Module.register('hmnet-forms', {
	type: 'plugin',
	name: 'hmnet-forms',
	title: 'hmnet-forms.general.mainMenuItemGeneral',
	description: 'hmnet-forms.general.descriptionTextModule',
	color: '#ff3d58',
	icon: 'window-terminal',

	routes: {
		list: {
			component: 'hmnet-forms-list',
			path: 'list',
		},
		detail: {
			component: 'hmnet-forms-detail',
			path: 'detail/:id',
			meta: {
				parentPath: 'hmnet.forms.list',
			},
		},
		create: {
			component: 'hmnet-forms-create',
			path: 'create',
			meta: {
				parentPath: 'hmnet.forms.list',
			},
		},
	},

	navigation: [
		{
			id: 'hmnet-forms',
			label: 'hmnet-forms.general.mainMenuItemGeneral',
			color: '#ff3d58',
			path: 'hmnet.forms.list',
			icon: 'window-terminal',
			parent: 'sw-catalogue',
			position: 100,
		},
	],
})
