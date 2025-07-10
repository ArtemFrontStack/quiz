(function () {
    const Test = {
        quiz: null,
        currentQuestionIndex: 1,
        optionsElement: null,
        nextBtnElement: null,
        prevBtnElement: null,
        passElement: null,
        questionTitleElement: null,
        progressBarElement:null,
        userResult: [],
        init() {
            checkUserData();
            const url = new URL(location.href);
            const testId = url.searchParams.get("id");
            if (testId) {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", `http://testologia.site/get-quiz?id=${testId}`, false);
                xhr.send();
                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.quiz = JSON.parse(xhr.responseText);
                    } catch (err) {
                        location.href = 'index.html';
                    }
                    this.startQuiz();
                } else {
                    location.href = 'index.html';
                }
            } else {
                location.href = "index.html";
            }
        },
        startQuiz() {
            console.log(this.quiz);
            this.progressBarElement = document.getElementById("progress-bar");
            this.questionTitleElement = document.getElementById("title");
            this.optionsElement = document.getElementById("options");
            this.nextBtnElement = document.getElementById("next");
            this.nextBtnElement.onclick = this.move.bind(this, 'next');
            this.passElement = document.getElementById("pass");
            this.passElement.onclick = this.move.bind(this, 'pass');
            document.getElementById('pre-title').textContent = this.quiz.name;

            this.prevBtnElement = document.getElementById("previous");
            this.prevBtnElement.onclick = this.move.bind(this, 'prev');


            this.prepareProgressBar()
            this.showQuestion();

            const timerElement = document.getElementById("timer");
            let second = 59;
            timerElement.textContent = second.toString();
            const interval = setInterval(function(){
                second--;
                timerElement.textContent = second.toString();
                if(second === 0){
                    clearInterval(interval);
                    this.complete();
                    return;
                }
            }.bind(this), 1000);
        },
        prepareProgressBar(){
            for (let i = 0; i < this.quiz.questions.length; i++) {
                const itemElement = document.createElement("div");
                itemElement.className = "test-progress-bar-item" + (i === 0 ? ' active' : '');

                const itemCircleElement = document.createElement("div");
                itemCircleElement.className = "test-progress-bar-item-circle";

                const itemTextElement = document.createElement("div");
                itemTextElement.className = "test-progress-bar-item-text";
                itemTextElement.textContent = 'Вопрос ' + (i+1);

                itemElement.appendChild(itemCircleElement);
                itemElement.appendChild(itemTextElement);

                this.progressBarElement.appendChild(itemElement);
            }
        },
        showQuestion() {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            this.questionTitleElement.innerHTML = `<span>Вопрос ` + this.currentQuestionIndex + `: </span>` + activeQuestion.question;
            this.optionsElement.innerHTML = ``;
            const that = this;
            const chosenOption =  this.userResult.find(item=> item.questionId === activeQuestion.id);

            // Сбрасываем состояние ссылки "Пропустить" для нового вопроса
            if (this.passElement) {
                this.passElement.classList.remove('disabled');
            }
            activeQuestion.answers.forEach((answer) => {
                const optionElement = document.createElement("div");
                optionElement.className = 'test-question-option';

                const inputId = 'answer-' + answer.id;
                const inputElement = document.createElement("input");
                inputElement.className = 'option-answer';
                inputElement.setAttribute('id', inputId);
                inputElement.setAttribute('type', 'radio');
                inputElement.setAttribute('name', 'answer');
                inputElement.setAttribute('value', answer.id);

                if(chosenOption && chosenOption.chosenAnswerId === answer.id) {
                    inputElement.setAttribute('checked', 'checked');
                }

                inputElement.addEventListener("change", function () {
                    that.chooseAnswer();
                })

                const labelElement = document.createElement('label');
                labelElement.setAttribute('for', inputId);
                labelElement.textContent = answer.answer;
                optionElement.appendChild(inputElement);
                optionElement.appendChild(labelElement);
                this.optionsElement.appendChild(optionElement);
            });
            if(chosenOption && chosenOption.chosenAnswerId){
                this.nextBtnElement.removeAttribute('disabled');
                // Если ответ уже был выбран, делаем ссылку "Пропустить" неактивной
                if (this.passElement) {
                    this.passElement.classList.add('disabled');
                }
            }else{
                this.nextBtnElement.setAttribute('disabled', 'disabled');
            }
            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextBtnElement.textContent = 'Завершить ';
            } else {
                this.nextBtnElement.textContent = 'Дальше';
            }
            if (this.currentQuestionIndex > 1) {
                this.prevBtnElement.removeAttribute('disabled');
            } else {
                this.prevBtnElement.setAttribute('disabled', 'disabled');
            }
        },
        chooseAnswer() {
            this.nextBtnElement.removeAttribute('disabled');
            // Делаем ссылку "Пропустить" неактивной при выбранном ответе
            if (this.passElement) {
                this.passElement.classList.add('disabled');
                console.log('Ссылка "Пропустить" стала неактивной');
            }
        },
        move(action) {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];

            const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find(element => {
                return element.checked;
            });
            let chosenAnswerId = null;
            if (chosenAnswer && chosenAnswer.value) {
                chosenAnswerId = +chosenAnswer.value;
            }

            const existingResult = this.userResult.find(item => {
                return item.questionId === activeQuestion.id;
            });
            if(existingResult){
                existingResult.chosenAnswerId = chosenAnswerId;
            }else{
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId,
                });
            }


            if (action === "next" || action === "pass") {
                this.currentQuestionIndex++;
            } else {
                this.currentQuestionIndex--;
            }

            if(this.currentQuestionIndex > this.quiz.questions.length) {
                this.complete();
                return;
            }
            Array.from(this.progressBarElement.children).forEach((item, index)=>{
                const currentItemIndex = index + 1;
                item.classList.remove('complete');
                item.classList.remove('active');
                if(currentItemIndex === this.currentQuestionIndex) {
                    item.classList.add('active');
                }else if(currentItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complete');
                }
            })

            this.showQuestion();
        },
        complete(){
            const url = new URL(location.href);
            const id = url.searchParams.get("id");
            const name = url.searchParams.get("name");
            const lastName = url.searchParams.get("last-name");
            const email = url.searchParams.get("email");

            // Сохраняем результаты пользователя в localStorage
            localStorage.setItem('userResult', JSON.stringify(this.userResult));

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `http://testologia.site/pass-quiz?id=${id}`,false);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify({
                name:name,
                lastName:lastName,
                email:email,
                results: this.userResult,
            }));
            if (xhr.status === 200 && xhr.responseText) {
                let result = null;
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (err) {
                    location.href = 'index.html';
                }
                if(result){
                    location.href = 'result.html?id=' + id + '&score=' + result.score + '&total=' + result.total + '&name=' + name + '&last-name=' + lastName + '&email=' + email;
                }
            } else {
                location.href = 'index.html';
            }
        }
    }
    Test.init();
})();
