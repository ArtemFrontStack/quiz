export class UrlManager {
	static  getQueryParams() {  
		const url = document.location.hash
		const paramArr = url.slice(url.indexOf('?') + 1).split('&');  
		const params = {};  
		paramArr.map(param => {  
			const [key, val] = param.split('=');  
			params[key] = decodeURIComponent(val);  
		})  
		return params;  
	}  
}
