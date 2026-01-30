import template from './hmnet-forms-detail.html.twig'

const { Component, Mixin } = Shopware
const { Criteria, EntityCollection } = Shopware.Data

Component.register('hmnet-forms-detail', {
	template,

	mixins: [Mixin.getByName('notification')],

	metaInfo() {
		return {
			title: this.$createTitle(this.identifier),
		}
	},

	inject: ['repositoryFactory'],

	data() {
		return {
			form: null,
			fieldIdsToDelete: [],
			isLoading: false,
			processSuccess: false,
		}
	},

	computed: {
		formRepository() {
			return this.repositoryFactory.create('hmnet_form')
		},

		languageRepository() {
			return this.repositoryFactory.create('language')
		},

		formFieldRepository() {
			return this.repositoryFactory.create('hmnet_form_field')
		},

		identifier() {
			return this.form !== null ? this.form.name : ''
		},

		formId() {
			return this.$route.params.id
		},

		isCreateMode() {
			return !this.formId
		},

		hasFields() {
			return !!this.form?.fields?.length
		},

		currentLanguageId() {
			if (Shopware.Store && Shopware.Store.get('context')) {
				return Shopware.Store.get('context').api.languageId
			}

			return Shopware.Context.api.languageId
		},

		fieldTypeOptions() {
			return [
				{
					value: 'text',
					label: this.$tc('hmnet-forms.detail.fieldTypeText'),
				},
				{
					value: 'textarea',
					label: this.$tc('hmnet-forms.detail.fieldTypeTextarea'),
				},
				{
					value: 'phone',
					label: this.$tc('hmnet-forms.detail.fieldTypePhone'),
				},
				{
					value: 'email',
					label: this.$tc('hmnet-forms.detail.fieldTypeEmail'),
				},
				{
					value: 'address',
					label: this.$tc('hmnet-forms.detail.fieldTypeAddress'),
				},
				{
					value: 'checkbox',
					label: this.$tc('hmnet-forms.detail.fieldTypeCheckbox'),
				},
			]
		},

		tooltipSave() {
			const systemKey = this.$device.getSystemKey()

			return {
				message: `${systemKey} + S`,
				appearance: 'light',
			}
		},

		tooltipCancel() {
			return {
				message: 'ESC',
				appearance: 'light',
			}
		},
	},

	watch: {
		formId() {
			this.createdComponent()
		},

		currentLanguageId() {
			if (!this.formId) {
				return
			}

			this.createdComponent()
		},
	},

	created() {
		this.createdComponent()
	},

	methods: {
		abortOnLanguageChange() {
			if (!this.form) {
				return false
			}

			return this.formRepository.hasChanges(this.form)
		},

		saveOnLanguageChange() {
			return this.onClickSave()
		},

		onChangeLanguage(languageId) {
			if (Shopware.Store && Shopware.Store.get('context')) {
				Shopware.Store.get('context').setApiLanguageId(languageId)
			}

			this.loadLanguage(languageId)
			this.createdComponent()
		},

		async loadLanguage(newLanguageId) {
			if (!this.languageRepository) {
				return
			}

			Shopware.Store.get('context').api.language =
				await this.languageRepository.get(newLanguageId, {
					...Shopware.Context.api,
					inheritance: true,
				})
		},

		createdComponent() {
			if (this.isCreateMode) {
				this.form = this.createEmptyForm()
				return
			}

			this.isLoading = true
			const criteria = new Criteria()
			criteria.addAssociation('fields')

			this.formRepository
				.get(this.formId, Shopware.Context.api, criteria)
				.then((form) => {
					this.form = form
					this.ensureFieldCollection()
				})
				.finally(() => {
					this.isLoading = false
				})
		},

		createEmptyForm() {
			const form = this.formRepository.create(Shopware.Context.api)
			form.name = ''
			form.technicalName = ''
			form.description = ''
			form.privacyAgreement = ''
			form.notificationEmails = []
			form.fields = this.createEmptyFieldCollection()
			return form
		},

		createEmptyFieldCollection() {
			return new EntityCollection(
				this.formFieldRepository.route,
				this.formFieldRepository.entityName,
				Shopware.Context.api,
			)
		},

		ensureFieldCollection() {
			if (!this.form.fields) {
				this.form.fields = this.createEmptyFieldCollection()
			}
		},

		onAddField() {
			this.ensureFieldCollection()
			const field = this.formFieldRepository.create(Shopware.Context.api)
			field.type = 'text'
			field.isRequired = false
			field.formId = this.form.id ?? null
			this.form.fields.add(field)
		},

		onRemoveField(fieldId) {
			if (!this.form?.fields) {
				return
			}

			const field = this.form.fields.find((item) => item.id === fieldId)
			this.form.fields.remove(fieldId)
			if (field && !field._isNew) {
				this.fieldIdsToDelete.push(fieldId)
			}
		},

		onClickSave() {
			if (!this.form) {
				return Promise.resolve()
			}

			this.isLoading = true
			this.processSuccess = false
			this.form.notificationEmails = this.form.notificationEmails || []

			return this.formRepository
				.save(this.form, Shopware.Context.api)
				.then(() => {
					if (this.form?.fields?.length) {
						this.form.fields.forEach((field) => {
							field.formId = this.form.id
						})

						return this.formFieldRepository.saveAll(
							this.form.fields,
							Shopware.Context.api,
						)
					}

					return Promise.resolve()
				})
				.then(() => {
					if (this.fieldIdsToDelete.length) {
						const ids = this.fieldIdsToDelete.map((id) => ({ id }))
						this.fieldIdsToDelete = []
						return this.formFieldRepository.delete(ids, Shopware.Context.api)
					}

					return Promise.resolve()
				})
				.then(() => {
					this.processSuccess = true
					if (this.isCreateMode) {
						this.$router.push({
							name: 'hmnet.forms.detail',
							params: { id: this.form.id },
						})
						return
					}

					this.createdComponent()
				})
				.catch(() => {
					this.createNotificationError({
						title: this.$tc('hmnet-forms.detail.errorTitle'),
					})
				})
				.finally(() => {
					this.isLoading = false
				})
		},

		onClickCancel() {
			this.$router.push({ name: 'hmnet-forms.list' })
		},
	},
})
