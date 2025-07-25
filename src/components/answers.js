export default class Answers {
	constructor() {
		this.quiz = null
		this.rightAnswerIds = []
		this.currentQuestionIndex = 1
		this.optionsElement = null
		this.nextBtnElement = null
		this.prevBtnElement = null
		this.passElement = null
		this.questionTitleElement = null
		this.progressBarElement = null
		this.userResult = []
		this.loadQuiz()
	}

	loadQuiz() {
		const testId = sessionStorage.getItem('test-id')
		if (testId) {
			// Загружаем вопросы теста
			const xhr = new XMLHttpRequest()
			xhr.open('GET', `http://testologia.site/get-quiz?id=${testId}`, false)
			xhr.send()
			if (xhr.status === 200 && xhr.responseText) {
				try {
					this.quiz = JSON.parse(xhr.responseText)
					this.loadRightAnswers(testId)
				} catch (err) {
					console.error('Ошибка при загрузке теста:', err)
					location.href = '#/'
				}
			} else {
				location.href = '#/'
			}
		} else {
			location.href = '#/'
		}
	}
	loadRightAnswers(testId) {
		// Загружаем правильные ответы
		const xhr = new XMLHttpRequest()
		xhr.open('GET', `http://testologia.site/get-quiz-right?id=${testId}`, false)
		xhr.send()
		if (xhr.status === 200 && xhr.responseText) {
			try {
				this.rightAnswerIds = JSON.parse(xhr.responseText)
				// Получаем результаты пользователя из localStorage
				this.userResult = JSON.parse(localStorage.getItem('userResult') || '[]')
				this.startAnswers()
			} catch (err) {
				location.href = '#/'
			}
		} else {
			location.href = '#/'
		}
	}
	startAnswers() {
		this.progressBarElement = document.getElementById('progress-bar')
		this.questionTitleElement = document.getElementById('title')
		this.optionsElement = document.getElementById('options')
		this.nextBtnElement = document.getElementById('next')
		this.nextBtnElement.onclick = this.move.bind(this, 'next')
		this.prevBtnElement = document.getElementById('previous')
		this.prevBtnElement.onclick = this.move.bind(this, 'prev')

		document.getElementById('pre-title').textContent = this.quiz.name

		this.prepareProgressBar()
		this.showQuestion()
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

		const userAnswer = this.userResult.find(
			item => +item.questionId === +activeQuestion.id
		)

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
			inputElement.setAttribute('disabled', 'disabled')

			const isRightAnswer = this.rightAnswerIds.includes(+answer.id)

			const isUserAnswer =
				userAnswer && +userAnswer.chosenAnswerId === +answer.id

			if (isUserAnswer) {
				if (isRightAnswer) {
					optionElement.classList.add('correct-answer')
				} else {
					optionElement.classList.add('incorrect-answer')
				}
			} else if (isRightAnswer) {
				optionElement.classList.add('correct-answer')
			}

			if (isUserAnswer) {
				inputElement.setAttribute('checked', 'checked')
			}

			const labelElement = document.createElement('label')
			labelElement.setAttribute('for', inputId)
			labelElement.textContent = answer.answer

			optionElement.appendChild(inputElement)
			optionElement.appendChild(labelElement)
			this.optionsElement.appendChild(optionElement)
		})

		this.nextBtnElement.removeAttribute('disabled')

		if (this.currentQuestionIndex === this.quiz.questions.length) {
			this.nextBtnElement.textContent = 'Вернуться на главную'
		} else {
			this.nextBtnElement.textContent = 'Дальше'
		}

		if (this.currentQuestionIndex > 1) {
			this.prevBtnElement.removeAttribute('disabled')
		} else {
			this.prevBtnElement.setAttribute('disabled', 'disabled')
		}
	}
	move(action) {
		if (action === 'next') {
			this.currentQuestionIndex++
		} else {
			this.currentQuestionIndex--
		}

		if (this.currentQuestionIndex > this.quiz.questions.length) {
			location.href = '#/'
			sessionStorage.clear()
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
}
