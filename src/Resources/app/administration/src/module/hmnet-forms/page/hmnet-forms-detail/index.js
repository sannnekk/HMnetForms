import template from './hmnet-forms-detail.html.twig'
import './hmnet-forms-detail.scss'

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
			sendClientEmail: false,
			fieldIdsToDelete: [],
			isLoading: false,
			processSuccess: false,
			activeTab: 'form',
			submissions: [],
			submissionSearchTerm: '',
			submissionsLoading: false,
			submissionTotal: 0,
			submissionPage: 1,
			submissionLimit: 25,
			selectedSubmission: null,
			submissionToDelete: null,
			dragFieldId: null,
		}
	},

	computed: {
		formRepository() {
			return this.repositoryFactory.create('hmnet_form')
		},

		languageRepository() {
			return this.repositoryFactory.create('language')
		},

		mailTemplateCriteria() {
			const criteria = new Criteria(1, 25)
			criteria.addAssociation('mailTemplateType')
			return criteria
		},

		formFieldRepository() {
			return this.repositoryFactory.create('hmnet_form_field')
		},

		formSubmissionRepository() {
			return this.repositoryFactory.create('hmnet_form_submission')
		},

		filteredSubmissions() {
			if (!this.submissionSearchTerm) {
				return this.submissions
			}

			const term = this.submissionSearchTerm.toLowerCase()

			return this.submissions.filter((submission) => {
				if (!Array.isArray(submission.data)) {
					return false
				}

				return submission.data.some((entry) => {
					if (entry.type === 'address' && typeof entry.value === 'object') {
						const addr = `${entry.value.street} ${entry.value.zip} ${entry.value.city}`
						return addr.toLowerCase().includes(term)
					}

					if (entry.type === 'current_page_link') {
						return String(entry.value ?? '').toLowerCase().includes(term)
					}

					const val = String(entry.value ?? '')
					return val.toLowerCase().includes(term) || (entry.title && entry.title.toLowerCase().includes(term))
				})
			})
		},

		paginatedSubmissions() {
			const start = (this.submissionPage - 1) * this.submissionLimit
			return this.filteredSubmissions.slice(start, start + this.submissionLimit)
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

		sortedFields() {
			if (!this.form?.fields) {
				return []
			}

			return [...this.form.fields].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
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
				{
					value: 'current_page_link',
					label: this.$tc('hmnet-forms.detail.fieldTypeCurrentPageLink'),
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

		twigEmbedCode() {
			return `{{ hmnet_form('${this.form?.id || ''}') }}`
		},

		twigButtonCode() {
			return `{{ hmnet_form('${this.form?.id || ''}', 'button') }}`
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

		activeTab(newTab) {
			if (newTab === 'submissions' && !this.isCreateMode) {
				this.loadSubmissions()
			}
		},

		sendClientEmail(val) {
			if (!val && this.form) {
				this.form.mailTemplateId = null
			}
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
			criteria.getAssociation('fields').addSorting(Criteria.sort('position', 'ASC'))

			this.formRepository
				.get(this.formId, Shopware.Context.api, criteria)
				.then((form) => {
					this.form = form
					this.sendClientEmail = !!form.mailTemplateId
					this.ensureFieldCollection()
					this.loadSubmissionCount()
				})
				.finally(() => {
					this.isLoading = false
				})
		},

		loadSubmissionCount() {
			if (!this.formId) {
				return
			}

			const criteria = new Criteria(1, 1)
			criteria.addFilter(Criteria.equals('formId', this.formId))
			criteria.setTotalCountMode(1)

			this.formSubmissionRepository
				.search(criteria, Shopware.Context.api)
				.then((result) => {
					this.submissionTotal = result.total ?? 0
				})
		},

		createEmptyForm() {
			const form = this.formRepository.create(Shopware.Context.api)
			form.name = ''
			form.technicalName = ''
			form.description = ''
			form.privacyAgreement = ''
			form.notificationEmails = []
			form.mailTemplateId = null
			form.fields = this.createEmptyFieldCollection()
			this.sendClientEmail = false
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
			field.position = this.form.fields ? this.form.fields.length : 0
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

		onTabChange(tabName) {
			const name = typeof tabName === 'object' ? tabName.name : tabName
			this.activeTab = name

			if (name === 'submissions' && !this.isCreateMode && !this.submissions.length) {
				this.loadSubmissions()
			}
		},

		loadSubmissions() {
			if (!this.formId) {
				return Promise.resolve()
			}

			this.submissionsLoading = true

			const criteria = new Criteria(1, 500)
			criteria.addFilter(Criteria.equals('formId', this.formId))
			criteria.addSorting(Criteria.sort('createdAt', 'DESC'))

			return this.formSubmissionRepository
				.search(criteria, Shopware.Context.api)
				.then((result) => {
					this.submissions = result
					this.submissionTotal = result.total ?? result.length
				})
				.finally(() => {
					this.submissionsLoading = false
				})
		},

		onSubmissionSearch(searchTerm) {
			this.submissionSearchTerm = searchTerm || ''
			this.submissionPage = 1
		},

		onSubmissionPageChange({ page }) {
			this.submissionPage = page
		},

		getSubmissionSummary(submission) {
			if (!Array.isArray(submission.data)) {
				return '—'
			}

			return submission.data
				.slice(0, 3)
				.map((entry) => {
					const label = entry.title || ''
					let value = ''

					if (entry.type === 'address' && typeof entry.value === 'object') {
						value = [entry.value.street, entry.value.zip, entry.value.city].filter(Boolean).join(', ')
					} else if (entry.type === 'checkbox') {
						value = entry.value ? '✓' : '✗'
					} else {
						value = String(entry.value ?? '')
					}

					if (value.length > 40) {
						value = value.substring(0, 40) + '…'
					}

					return `${label}: ${value}`
				})
				.join(' | ')
		},

		formatDate(dateString) {
			if (!dateString) {
				return '—'
			}

			const date = new Date(dateString)

			return date.toLocaleString('de-DE', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})
		},

		onViewSubmission(submission) {
			this.selectedSubmission = submission
		},

		onCloseSubmissionModal() {
			this.selectedSubmission = null
		},

		onDeleteSubmission(submissionId) {
			this.submissionToDelete = submissionId
		},

		onCloseDeleteModal() {
			this.submissionToDelete = null
		},

		onConfirmDeleteSubmission() {
			const submissionId = this.submissionToDelete
			this.submissionToDelete = null
			this.submissionsLoading = true

			this.formSubmissionRepository
				.delete(submissionId, Shopware.Context.api)
				.then(() => {
					this.createNotificationSuccess({
						title: this.$tc('hmnet-forms.detail.submissionDeletedTitle'),
						message: this.$tc('hmnet-forms.detail.submissionDeletedMessage'),
					})
					return this.loadSubmissions()
				})
				.catch(() => {
					this.createNotificationError({
						title: this.$tc('hmnet-forms.detail.submissionDeleteErrorTitle'),
					})
					this.submissionsLoading = false
				})
		},

		onFieldDragStart(fieldId) {
			this.dragFieldId = fieldId
		},

		onFieldDragOver(event, targetFieldId) {
			event.preventDefault()
			if (this.dragFieldId === targetFieldId) {
				return
			}

			const sorted = this.sortedFields
			const fromIndex = sorted.findIndex((f) => f.id === this.dragFieldId)
			const toIndex = sorted.findIndex((f) => f.id === targetFieldId)

			if (fromIndex === -1 || toIndex === -1) {
				return
			}

			// Reorder by updating positions
			const reordered = [...sorted]
			const [moved] = reordered.splice(fromIndex, 1)
			reordered.splice(toIndex, 0, moved)

			reordered.forEach((field, idx) => {
				field.position = idx
			})
		},

		onFieldDrop() {
			this.dragFieldId = null
		},

		onFieldDragEnd() {
			this.dragFieldId = null
		},
	},
})
