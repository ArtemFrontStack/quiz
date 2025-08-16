import Answers from './components/answers.js'
import Choice from './components/choice.js'
import Form from './components/form.js'
import Result from './components/result.js'
import Test from './components/test.js'
import { Auth } from './services/auth.js'
export default class Router {
	constructor() {
		this.contentElement = document.getElementById('content')
		this.stylesElement = document.getElementById('styles')
		this.titleElement = document.getElementById('titlePage')
		this.profileElement = document.getElementById('profile')
		this.profileFullNameElement = document.getElementById('profile-fullName')

		this.routes = [
			{
				route: '#/',
				title: 'Главная',
				template: 'templates/index.html',
				styles: 'styles/style.css',
				load: () => {},
			},
			{
				route: '#/signup',
				title: 'Регистрация',
				template: 'templates/signup.html',
				styles: 'styles/form.css',
				load: () => {
					new Form('signup')
				},
			},
			{
				route: '#/login',
				title: 'Вход',
				template: 'templates/login.html',
				styles: 'styles/form.css',
				load: () => {
					new Form('login')
				},
			},
			{
				route: '#/choice',
				title: 'Выбор теста',
				template: 'templates/choice.html',
				styles: 'styles/choice.css',
				load: () => {
					new Choice()
				},
			},
			{
				route: '#/test',
				title: 'Тест',
				template: 'templates/test.html',
				styles: 'styles/test.css',
				load: () => {
					new Test()
				},
			},
			{
				route: '#/result',
				title: 'Результат Теста',
				template: 'templates/result.html',
				styles: 'styles/result.css',
				load: () => {
					new Result()
				},
			},
			{
				route: '#/answers',
				title: 'Результат Теста',
				template: 'templates/answers.html',
				styles: 'styles/answers.css',
				load: () => {
					new Answers()
				},
			},
		]
	}
	async openRoute() {
		const urlRoute = window.location.hash.split('?')[0];

		if (urlRoute === '#/logout') {
			await Auth.logout()
			window.location.href = '#/'
			return;
		}
	
		const newRoute = this.routes.find(item => {
			return item.route === urlRoute
		})
		if (!newRoute) {
			window.location.hash = '#/'
			return
		}

		this.contentElement.innerHTML = await fetch(newRoute.template).then(res =>
			res.text()
		)
		this.stylesElement.setAttribute('href', newRoute.styles)
		this.titleElement.textContent = newRoute.title
		const userInfo = Auth.getUserInfo()
		const accessToken = localStorage.getItem(Auth.accessTokenKey)
		if (userInfo && accessToken) {
			this.profileElement.style.display = 'flex'
			this.profileFullNameElement.innerHTML = userInfo.fullName
		} else {
			this.profileElement.style.display = 'none'
		}
		newRoute.load()
	}
}
