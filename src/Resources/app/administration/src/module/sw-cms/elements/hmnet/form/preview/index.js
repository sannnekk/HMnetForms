import template from './cms-el-preview-hmnet-form.html.twig'

const { Context } = Shopware

/**
 * @private
 * @package buyers-experience
 */
export default {
	template,

	inject: ['repositoryFactory'],

	data() {
		return {
			formName: null,
		}
	},

	computed: {
		formRepository() {
			return this.repositoryFactory.create('hmnet_form')
		},
	},

	watch: {
		'element.config.formId.value': {
			handler() {
				this.loadFormName()
			},
			immediate: true,
		},
	},

	methods: {
		async loadFormName() {
			const formId = this.element?.config?.formId?.value
			if (!formId) {
				this.formName = null
				return
			}

			try {
				const form = await this.formRepository.get(formId, Context.api)
				this.formName = form?.name || null
			} catch (error) {
				this.formName = null
			}
		},
	},
}
