import template from './hmnet-forms-list.html.twig'

const { Component } = Shopware

Component.register('hmnet-forms-list', {
	template,

	data() {
		return {
			forms: [],
			isLoading: false,
			total: 0,
		}
	},

	metaInfo() {
		return {
			title: this.$createTitle(),
		}
	},

	computed: {
		columns() {
			return [
				{
					property: 'name',
					dataIndex: 'name',
					label: this.$tc('hmnet-forms.list.columnName'),
					routerLink: 'hmnet-forms.detail',
					allowResize: true,
					primary: true,
				},
				{
					property: 'active',
					dataIndex: 'active',
					label: this.$tc('hmnet-forms.list.columnActive'),
					allowResize: true,
					align: 'center',
				},
				{
					property: 'createdAt',
					dataIndex: 'createdAt',
					label: this.$tc('hmnet-forms.list.columnCreatedAt'),
					allowResize: true,
				},
			]
		},
	},

	methods: {
		onChangeLanguage() {
			// Will be implemented with backend
		},
	},
})
