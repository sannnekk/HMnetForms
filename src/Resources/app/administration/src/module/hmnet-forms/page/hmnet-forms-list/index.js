import template from './hmnet-forms-list.html.twig'
import './hmnet-forms-list.scss'

const { Component } = Shopware
const { Criteria } = Shopware.Data

Component.register('hmnet-forms-list', {
	template,

	inject: ['repositoryFactory'],

	data() {
		return {
			forms: null,
			isLoading: false,
			total: 0,
			page: 1,
			limit: 25,
			sortBy: 'createdAt',
			sortDirection: 'DESC',
		}
	},

	metaInfo() {
		return {
			title: this.$createTitle(),
		}
	},

	computed: {
		formRepository() {
			return this.repositoryFactory.create('hmnet_form')
		},

		columns() {
			return [
				{
					property: 'name',
					dataIndex: 'name',
					label: this.$tc('hmnet-forms.list.columnName'),
					routerLink: 'hmnet.forms.detail',
					allowResize: true,
					primary: true,
				},
				{
					property: 'technicalName',
					dataIndex: 'technicalName',
					label: this.$tc('hmnet-forms.list.columnTechnicalName'),
					allowResize: true,
				},
				{
					property: 'createdAt',
					dataIndex: 'createdAt',
					label: this.$tc('hmnet-forms.list.columnCreatedAt'),
					allowResize: true,
				},
				{
					property: 'updatedAt',
					dataIndex: 'updatedAt',
					label: this.$tc('hmnet-forms.list.columnUpdatedAt'),
					allowResize: true,
				},
			]
		},
	},

	created() {
		this.getList()
	},

	methods: {
		onChangeLanguage() {
			this.getList()
		},

		onPageChange({ page, limit }) {
			this.page = page
			this.limit = limit
			this.getList()
		},

		getList() {
			this.isLoading = true
			const criteria = new Criteria(this.page, this.limit)
			criteria.addSorting(Criteria.sort(this.sortBy, this.sortDirection, false))

			return this.formRepository
				.search(criteria, Shopware.Context.api)
				.then((result) => {
					this.forms = result
					this.total = result.total
				})
				.finally(() => {
					this.isLoading = false
				})
		},
	},
})
