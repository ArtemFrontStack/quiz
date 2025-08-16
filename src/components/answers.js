import {UrlManager} from "../utils/url-manager.js";
import {CustomHTTPResponse} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";
import {Links} from "../utils/createLink.js";

export default class Answers {
    constructor() {
        this.quiz = null
        this.container = document.querySelector('.test-container');
        this.testQuestionsElement = document.querySelector(".test-question");
        this.testUserInfoElement = document.getElementById("user-info");
        this.testNameElement = document.getElementById("test-name");
        this.routeParams = UrlManager.getQueryParams();
        this.init()
    }

    async init() {
        const userInfo = Auth.getUserInfo()
        if (this.routeParams.id) {
            try {
                const result = await CustomHTTPResponse.request(
                    config.host + `/tests/${this.routeParams.id}/result/details?userId=` + userInfo.userId
                )
                if (result) {
                    if (result.error) {
                        throw new Error(result.error)
                    }
                    this.testNameElement.innerText = result.test.name;
                    this.testUserInfoElement.innerText = `${userInfo.fullName}, ${userInfo.email}`;
                    this.quiz = result.test.questions;

                    this.showQuestions()

                }
            } catch (error) {
                console.error(error)
            }
        } else {
            location.href = '#/'
        }
    }

    showLink() {
        const link = Links.defaultLink(this.routeParams.id, 'result');
        this.container.appendChild(link);
    }

    showQuestions() {
        if (this.quiz) {
            let count = 1;
            this.quiz.forEach(item => {

                const questionTitleElement = document.createElement('div');
                const questionOptions = document.createElement("div");
                questionOptions.classList.add("answers-question-options");

                questionTitleElement.classList.add("question-title");
                questionTitleElement.classList.add('test-question-title');
                questionTitleElement.innerHTML = `<span>Вопрос ` + count++ + `: </span>` + item.question;
                item.answers.forEach(question => {
                    const optionElement = document.createElement('div')
                    optionElement.className = 'test-question-option'


                    const inputElement = document.createElement('input')
                    inputElement.className = 'option-answer'
                    inputElement.setAttribute('type', 'radio')
                    inputElement.setAttribute('name', 'answer')

                    if (question.hasOwnProperty('correct')) {
                        if (question.correct === true) {
                            optionElement.classList.add('correct')
                            inputElement.classList.add('correct')
                        } else {
                            optionElement.classList.add('uncorrect')
                            inputElement.classList.add('uncorrect')
                        }
                    }
                    const labelElement = document.createElement('label')
                    labelElement.setAttribute('for', question.id)
                    labelElement.textContent = question.answer;
                    optionElement.appendChild(inputElement)
                    optionElement.appendChild(labelElement)


                    questionOptions.appendChild(optionElement)
                })
                this.testQuestionsElement.appendChild(questionTitleElement);
                this.testQuestionsElement.appendChild(questionOptions);

            })
        }
        this.showLink();
    }

}
