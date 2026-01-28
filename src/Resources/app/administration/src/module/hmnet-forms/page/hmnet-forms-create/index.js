import template from './hmnet-forms-create.html.twig'

const { Component } = Shopware

Component.extend('hmnet-forms-create', 'hmnet-forms-detail', {
	template,

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

	methods: {
		onClickSave() {
			// Will be implemented with backend
			this.createNotificationInfo({
				title: 'Info',
				message: 'Backend not implemented yet',
			})
		},
	},
})
