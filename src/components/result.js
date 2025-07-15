import checkUserData from '../utils/url-manager.js'
export default class Result {
	constructor() {
		checkUserData()
		const id = sessionStorage.getItem('test-id')
		const score = sessionStorage.getItem('score')
		const total = sessionStorage.getItem('total')
		const name = sessionStorage.getItem('name') || ''
		const lastName = sessionStorage.getItem('last-name') || ''
		document.getElementById('result-user').textContent = name + ' ' + lastName
		document.getElementById('result-scope').textContent = score + '/' + total
		document.getElementById('answers-link').addEventListener('click', () => {
			location.href = '#/answers'
		})
	}
}
