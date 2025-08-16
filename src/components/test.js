import config from '../../config/config.js'
import { Auth } from '../services/auth.js'
import { CustomHTTPResponse } from '../services/custom-http.js'
import { UrlManager } from '../utils/url-manager.js'

export default class Test {
	constructor() {
		this.quiz = null
		this.currentQuestionIndex = 1
		this.optionsElement = null
		this.nextBtnElement = null
		this.prevBtnElement = null
		this.passElement = null
		this.questionTitleElement = null
		this.progressBarElement = null
		this.userResult = []
		this.routeParams = UrlManager.getQueryParams()
		this.interval = null;
		this.init()
	}

	async init() {
		if (this.routeParams.id) {
			try {
				const result = await CustomHTTPResponse.request(
					config.host + '/tests/' + this.routeParams.id
				)

				if (result) {
					if (result.error) {
						throw new Error(result.error)
					}
					this.quiz = result
					this.startQuiz()
				}
			} catch (error) {
				console.error(error)
			}
		}else{
			location.href = '#/'
		}
	}

	startQuiz() {
		this.progressBarElement = document.getElementById('progress-bar')
		this.questionTitleElement = document.getElementById('title')
		this.optionsElement = document.getElementById('options')
		this.nextBtnElement = document.getElementById('next')
		this.nextBtnElement.onclick = this.move.bind(this, 'next')
		this.passElement = document.getElementById('pass')
		this.passElement.onclick = this.move.bind(this, 'pass')
		document.getElementById('pre-title').textContent = this.quiz.name

		this.prevBtnElement = document.getElementById('previous')
		this.prevBtnElement.onclick = this.move.bind(this, 'prev')

		this.prepareProgressBar()
		this.showQuestion()

		const timerElement = document.getElementById('timer')
		let second = 59
		timerElement.textContent = second.toString()
		this.interval = setInterval(
			function () {
				second--
				timerElement.textContent = second.toString()
				if (second === 0) {
					clearInterval(this.interval)
					this.complete()
					return
				}
			}.bind(this),
			1000
		)
	}
	prepareProgressBar() {
		for (let i = 0; i < this.quiz.questions.length; i++) {
			const itemElement = document.createElement('div')
			itemElement.className =
				'test-progress-bar-item' + (i === 0 ? ' active' : '')

			const itemCircleElement = document.createElement('div')
			itemCircleElement.className = 'test-progress-bar-item-circle'

			const itemTextElement = document.createElement('div')
			itemTextElement.className = 'test-progress-bar-item-text'
			itemTextElement.textContent = 'Вопрос ' + (i + 1)

			itemElement.appendChild(itemCircleElement)
			itemElement.appendChild(itemTextElement)

			this.progressBarElement.appendChild(itemElement)
		}
	}
	showQuestion() {
		const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1]
		this.questionTitleElement.innerHTML =
			`<span>Вопрос ` +
			this.currentQuestionIndex +
			`: </span>` +
			activeQuestion.question
		this.optionsElement.innerHTML = ``
		const that = this
		const chosenOption = this.userResult.find(
			item => item.questionId === activeQuestion.id
		)

		// Сбрасываем состояние ссылки "Пропустить" для нового вопроса
		if (this.passElement) {
			this.passElement.classList.remove('disabled')
		}
		activeQuestion.answers.forEach(answer => {
			const optionElement = document.createElement('div')
			optionElement.className = 'test-question-option'

			const inputId = 'answer-' + answer.id
			const inputElement = document.createElement('input')
			inputElement.className = 'option-answer'
			inputElement.setAttribute('id', inputId)
			inputElement.setAttribute('type', 'radio')
			inputElement.setAttribute('name', 'answer')
			inputElement.setAttribute('value', answer.id)

			if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
				inputElement.setAttribute('checked', 'checked')
			}

			inputElement.addEventListener('change', function () {
				that.chooseAnswer()
			})

			const labelElement = document.createElement('label')
			labelElement.setAttribute('for', inputId)
			labelElement.textContent = answer.answer
			optionElement.appendChild(inputElement)
			optionElement.appendChild(labelElement)
			this.optionsElement.appendChild(optionElement)
		})
		if (chosenOption && chosenOption.chosenAnswerId) {
			this.nextBtnElement.removeAttribute('disabled')
			// Если ответ уже был выбран, делаем ссылку "Пропустить" неактивной
			if (this.passElement) {
				this.passElement.classList.add('disabled')
			}
		} else {
			this.nextBtnElement.setAttribute('disabled', 'disabled')
		}
		if (this.currentQuestionIndex === this.quiz.questions.length) {
			this.nextBtnElement.textContent = 'Завершить '
		} else {
			this.nextBtnElement.textContent = 'Дальше'
		}
		if (this.currentQuestionIndex > 1) {
			this.prevBtnElement.removeAttribute('disabled')
		} else {
			this.prevBtnElement.setAttribute('disabled', 'disabled')
		}
	}
	chooseAnswer() {
		this.nextBtnElement.removeAttribute('disabled')
		// Делаем ссылку "Пропустить" неактивной при выбранном ответе
		if (this.passElement) {
			this.passElement.classList.add('disabled')
		}
	}
	move(action) {
		const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1]

		const chosenAnswer = Array.from(
			document.getElementsByClassName('option-answer')
		).find(element => {
			return element.checked
		})
		let chosenAnswerId = null
		if (chosenAnswer && chosenAnswer.value) {
			chosenAnswerId = +chosenAnswer.value
		}

		const existingResult = this.userResult.find(item => {
			return item.questionId === activeQuestion.id
		})
		if (existingResult) {
			existingResult.chosenAnswerId = chosenAnswerId
		} else {
			this.userResult.push({
				questionId: activeQuestion.id,
				chosenAnswerId: chosenAnswerId,
			})
		}

		if (action === 'next' || action === 'pass') {
			this.currentQuestionIndex++
		} else {
			this.currentQuestionIndex--
		}

		if (this.currentQuestionIndex > this.quiz.questions.length) {
			clearInterval(this.interval);
			this.complete()
			return
		}
		Array.from(this.progressBarElement.children).forEach((item, index) => {
			const currentItemIndex = index + 1
			item.classList.remove('complete')
			item.classList.remove('active')
			if (currentItemIndex === this.currentQuestionIndex) {
				item.classList.add('active')
			} else if (currentItemIndex < this.currentQuestionIndex) {
				item.classList.add('complete')
			}
		})

		this.showQuestion()
	}
	async complete() {
		try {
			const userInfo = Auth.getUserInfo()
			if (!userInfo) {
				location.href = '#/'
			}
			const result = await CustomHTTPResponse.request(
				config.host + '/tests/' + this.routeParams.id + '/pass',
				'POST',
				{
					userId: userInfo.userId,
					results: this.userResult,
				}
			)
			if (result) {
				if (result.error) {
					throw new Error(result.error)
				}
				location.href = '#/result?id=' + this.routeParams.id
			}
		} catch (error) {
			console.log(error);
		}
	}
}
