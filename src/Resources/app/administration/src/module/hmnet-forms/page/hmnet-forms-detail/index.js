import template from './hmnet-forms-detail.html.twig'

const { Component, Mixin } = Shopware
const { Criteria } = Shopware.Data

Component.register('hmnet-forms-detail', {
	template,

	mixins: [Mixin.getByName('notification')],

	metaInfo() {
		return {
			title: this.$createTitle(this.identifier),
		}
	},

	data() {
		return {
			form: {
				name: '',
				active: true,
				description: '',
				recipientEmail: '',
				emailSubject: '',
				successMessage: '',
			},
			isLoading: false,
			processSuccess: false,
		}
	},

	computed: {
		identifier() {
			return this.form !== null ? this.form.name : ''
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

	methods: {
		onClickSave() {
			// Will be implemented with backend
			this.createNotificationInfo({
				title: 'Info',
				message: 'Backend not implemented yet',
			})
		},

		onClickCancel() {
			this.$router.push({ name: 'hmnet-forms.list' })
		},
	},
})
