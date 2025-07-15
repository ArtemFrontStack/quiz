import Form from './components/form.js'
import Choice from './components/choice.js'
import Test from './components/test.js'
import Result from './components/result.js'
import Answers from './components/answers.js'
export default class Router {
	constructor() {
		this.routes = [
			{
				route: '#/',
				title: 'Главная',
				template: 'templates/index.html', // путь к файлy,
				styles: 'styles/style.css',
				load: () => {},
			},
			{
				route: '#/form',
				title: 'Регистрация',
				template: 'templates/form.html', // путь к файлy,
				styles: 'styles/form.css',
				load: () => {
					new Form()
				},
			},
			{
				route: '#/choice',
				title: 'Выбор теста',
				template: 'templates/choice.html', // путь к файлy,
				styles: 'styles/choice.css',
				load: () => {
					new Choice()
				},
			},
			{
				route: '#/test',
				title: 'Тест',
				template: 'templates/test.html', // путь к файлy,
				styles: 'styles/test.css',
				load: () => {
					new Test()
				},
			},
			{
				route: '#/result',
				title: 'Результат Теста',
				template: 'templates/result.html', // путь к файлy,
				styles: 'styles/result.css',
				load: () => {
					new Result()
				},
			},
			{
				route: '#/answers',
				title: 'Результат Теста',
				template: 'templates/answers.html', // путь к файлy,
				styles: 'styles/answers.css',
				load: () => {
					new Answers()
				},
			},
		]
	}
	async openRoute() {
		const newRoute = this.routes.find(item => {
			return item.route === window.location.hash;
		})
        console.log(newRoute)
		if (!newRoute) {
			window.location.hash = '#/'
			return
		}

		document.getElementById('content').innerHTML = await fetch(
			newRoute.template
		).then(res => res.text())
		document.getElementById('styles').setAttribute('href', newRoute.styles)
		newRoute.load();
        document.getElementById('titlePage').textContent = newRoute.title;
	}
}
