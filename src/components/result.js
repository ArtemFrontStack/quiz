import config from '../../config/config.js'
import { Auth } from '../services/auth.js'
import { CustomHTTPResponse } from '../services/custom-http.js'
import { UrlManager } from '../utils/url-manager.js'
import {Links} from "../utils/createLink.js";

export default class Result {
	constructor() {
		this.routeParams = UrlManager.getQueryParams()
		this.containerResult = document.querySelector('.result-container')
		this.resultScore = document.getElementById('result-scope')
		this.init()
	}

	async init() {
		const userInfo = Auth.getUserInfo()
		if (!userInfo) {
			location.href = '#/'
		}
		if (this.routeParams.id) {
			try {
				const result = await CustomHTTPResponse.request(
					config.host +
						'/tests/' +
						this.routeParams.id +
						'/result?userId=' +
						userInfo.userId
				)
				if (result) {
					if (result.error) {
						throw new Error(result.error)
					}

					this.resultScore.textContent =
						result.score + '/' + result.total
					const linkAnswers = Links.defaultLink(this.routeParams.id,'answers');
					this.containerResult.appendChild(linkAnswers);
					return
				}
			} catch (error) {
				console.error(error)
			}
		} 
	}
}
