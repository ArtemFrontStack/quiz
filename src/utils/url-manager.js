export default function checkUserData() {
	const name = sessionStorage.getItem('name')
	const lastName = sessionStorage.getItem('last-name')
	const email = sessionStorage.getItem('email')

	if (!name || !lastName || !email) {
		location.href = '#/'
	}
}
