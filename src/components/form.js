export default class Form {
	constructor() {
		this.agreeElem = null
		this.processElem = null
		this.fields = [
			{
				name: 'name',
				id: 'name',
				element: null,
				regex: /^[A-ZА-ЯЁ][а-яёa-z]+\s*$/,
				valid: false,
			},
			{
				name: 'last-name',
				id: 'last-name',
				element: null,
				regex: /^[A-ZА-ЯЁ][а-яёa-z]+\s*$/,
				valid: false,
			},
			{
				name: 'email',
				id: 'email',
				element: null,
				regex: /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i,
				valid: false,
			},
		]
        const that = this
		this.fields.forEach(field => {
			field.element = document.getElementById(field.name)
			field.element.addEventListener('change', function () {
				that.validateField.call(that, field, this)
			})
		})
		this.processElem = document.getElementById('process')
		this.processElem.addEventListener('click', function () {
			that.processForm()
		})
		this.agreeElem = document.getElementById('agree')
		this.agreeElem.addEventListener('change', function () {
			that.validateForm()
		})
	}
	validateField(field, element) {
		if (!element.value || !element.value.match(field.regex)) {
			element.parentNode.style.borderColor = 'red'
			field.valid = false
		} else {
			element.parentNode.removeAttribute('style')
			field.valid = true
		}
		this.validateForm()
	}
	validateForm() {
		const validForm = this.fields.every(field => field.valid)
		const isValidate = this.agreeElem.checked && validForm
		if (isValidate) {
			this.processElem.removeAttribute('disabled')
		} else {
			this.processElem.setAttribute('disabled', 'disabled')
		}
		return isValidate
	}
	processForm() {
		if (this.validateForm()) {
			this.fields.forEach(field => {
				sessionStorage.setItem(field.name, field.element.value)
			})
			location.href = '#/choice'
		}
	}
}
