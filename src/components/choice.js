import config from '../../config/config.js'
import { Auth } from '../services/auth.js'
import { CustomHTTPResponse } from '../services/custom-http.js'

export default class Choice {
	constructor() {
		this.quizzes = []
		this.init()
		this.testResults = null
	}

	async init() {
		try {
			const result = await CustomHTTPResponse.request(config.host + '/tests')

			if (result) {
				if (result.error) {
					throw new Error(result.error)
				}
				this.quizzes = result
			}
		} catch (error) {
			return console.error(error)
		}

		const userInfo = Auth.getUserInfo()
		if (userInfo) {
			try {
				const result = await CustomHTTPResponse.request(
					config.host + '/tests/results?userId=' + userInfo.userId
				)

				if (result) {
					if (result.error) {
						throw new Error(result.error)
					}
					this.testResults = result
				}
			} catch (error) {
				return console.error(error)
			}
		}
		this.processQuizzes()
	}
	processQuizzes() {
		const choiceOptionsElement = document.getElementById('choice-options')
		if (this.quizzes && this.quizzes.length > 0) {
			this.quizzes.forEach(quiz => {
				const that = this
				const choiceOptionElement = document.createElement('div')
				choiceOptionElement.className = 'choice-option'
				choiceOptionElement.setAttribute('data-id', quiz.id)
				choiceOptionElement.addEventListener('click', function () {
					that.chooseQuiz(this)
				})
				const choiceOptionTextElement = document.createElement('div')
				choiceOptionTextElement.className = 'choice-option-text'
				choiceOptionTextElement.textContent = quiz.name

				const choiceOptionArrowElement = document.createElement('div')
				choiceOptionArrowElement.className = 'choice-option-arrow'

				const result = this.testResults.find(item => item.testId === quiz.id)
				if (result) {
					const choiceOptionResultElement = document.createElement('div')
					choiceOptionResultElement.className = 'choice-option-result'
					choiceOptionResultElement.innerHTML = '<div>Результат</div><div>' +result.score + '/' + result.total +'</div>'
					choiceOptionElement.appendChild(choiceOptionResultElement)
				}

				const choiceOptionArrowSvgElement = document.createElement('img')
				choiceOptionArrowSvgElement.setAttribute(
					'src',
					'../../assets/images/arrow.svg'
				)
				choiceOptionArrowElement.appendChild(choiceOptionArrowSvgElement)
				choiceOptionElement.appendChild(choiceOptionTextElement)
				choiceOptionElement.appendChild(choiceOptionArrowElement)
				

				choiceOptionsElement.appendChild(choiceOptionElement)
			})
		}
	}
	chooseQuiz(element) {
		const dataId = element.getAttribute('data-id')
		if (dataId) {
			location.href = '#/test?id=' + dataId
		}
	}
}
