import template from './cms-el-config-hmnet-form.html.twig'

const { Mixin } = Shopware

/**
 * @private
 * @package buyers-experience
 */
export default {
	template,

	mixins: [Mixin.getByName('cms-element')],

	created() {
		this.initElementConfig('hmnet-form')
	},
}
