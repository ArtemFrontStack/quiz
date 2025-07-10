(function () {
    const Answers = {
        quiz: null,
        rightAnswerIds: [],
        currentQuestionIndex: 1,
        optionsElement: null,
        nextBtnElement: null,
        prevBtnElement: null,
        passElement: null,
        questionTitleElement: null,
        progressBarElement:null,
        userResult: [],

        init(){
            this.loadQuiz();
        },
        loadQuiz() {
            const url = new URL(location.href);
            const testId = url.searchParams.get("id");
            console.log('Загружаем тест с ID:', testId);
            if (testId) {
                // Загружаем вопросы теста
                const xhr = new XMLHttpRequest();
                xhr.open("GET", `http://testologia.site/get-quiz?id=${testId}`, false);
                xhr.send();
                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.quiz = JSON.parse(xhr.responseText);
                        console.log('Данные теста:', this.quiz);
                        this.loadRightAnswers(testId);
                    } catch (err) {
                        console.error('Ошибка при загрузке теста:', err);
                        location.href = 'index.html';
                    }
                } else {
                    location.href = 'index.html';
                }
            } else {
                location.href = "index.html";
            }
        },
        loadRightAnswers(testId) {
            console.log('Загружаем правильные ответы для теста:', testId);
            // Загружаем правильные ответы
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `http://testologia.site/get-quiz-right?id=${testId}`, false);
            xhr.send();
            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.rightAnswerIds = JSON.parse(xhr.responseText);
                    console.log('Правильные ID ответов с сервера:', this.rightAnswerIds);
                    // Получаем результаты пользователя из localStorage
                    this.userResult = JSON.parse(localStorage.getItem('userResult') || '[]');
                    console.log('Результаты пользователя из localStorage:', this.userResult);
                    this.startAnswers();
                } catch (err) {
                    console.error('Ошибка при загрузке данных:', err);
                    location.href = 'index.html';
                }
            } else {
                location.href = 'index.html';
            }
        },
        startAnswers() {
            this.progressBarElement = document.getElementById("progress-bar");
            this.questionTitleElement = document.getElementById("title");
            this.optionsElement = document.getElementById("options");
            this.nextBtnElement = document.getElementById("next");
            this.nextBtnElement.onclick = this.move.bind(this, 'next');
            this.prevBtnElement = document.getElementById("previous");
            this.prevBtnElement.onclick = this.move.bind(this, 'prev');

            document.getElementById('pre-title').textContent = this.quiz.name;

            this.prepareProgressBar();
            this.showQuestion();
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

            // Получаем ответ пользователя для текущего вопроса
            const userAnswer = this.userResult.find(item => +item.questionId === +activeQuestion.id);

            // Отладочная информация
            console.log('Вопрос ID:', activeQuestion.id);
            console.log('Правильные ID ответов:', this.rightAnswerIds);
            console.log('Ответ пользователя:', userAnswer);

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
                inputElement.setAttribute('disabled', 'disabled');

                // Проверяем, является ли этот ответ правильным
                const isRightAnswer = this.rightAnswerIds.includes(+answer.id);

                // Проверяем, выбрал ли пользователь этот ответ
                const isUserAnswer = userAnswer && +userAnswer.chosenAnswerId === +answer.id;

                // Отладочная информация для каждого ответа
                console.log('Ответ ID:', answer.id, 'Правильный:', isRightAnswer, 'Выбран пользователем:', isUserAnswer);

                // Определяем класс для подсветки
                // Подсвечиваем только ответ пользователя и правильный ответ
                if (isUserAnswer) {
                    // Если пользователь выбрал правильный ответ
                    if (isRightAnswer) {
                        optionElement.classList.add('correct-answer');
                        console.log('Пользователь выбрал правильный ответ:', answer.id);
                    } else {
                        // Если пользователь выбрал неправильный ответ
                        optionElement.classList.add('incorrect-answer');
                        console.log('Пользователь выбрал неправильный ответ:', answer.id);
                    }
                } else if (isRightAnswer) {
                    // Если это правильный ответ, но пользователь его не выбрал
                    optionElement.classList.add('correct-answer');
                    console.log('Правильный ответ (не выбран пользователем):', answer.id);
                }

                if (isUserAnswer) {
                    inputElement.setAttribute('checked', 'checked');
                }

                const labelElement = document.createElement('label');
                labelElement.setAttribute('for', inputId);
                labelElement.textContent = answer.answer;

                optionElement.appendChild(inputElement);
                optionElement.appendChild(labelElement);
                this.optionsElement.appendChild(optionElement);
            });

            this.nextBtnElement.removeAttribute('disabled');

            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextBtnElement.textContent = 'Вернуться на главную';
            } else {
                this.nextBtnElement.textContent = 'Дальше';
            }

            if (this.currentQuestionIndex > 1) {
                this.prevBtnElement.removeAttribute('disabled');
            } else {
                this.prevBtnElement.setAttribute('disabled', 'disabled');
            }
        },
        move(action) {
            if (action === "next") {
                this.currentQuestionIndex++;
            } else {
                this.currentQuestionIndex--;
            }

            if(this.currentQuestionIndex > this.quiz.questions.length) {
                location.href = 'index.html';
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
            });

            this.showQuestion();
        }
    }
    Answers.init();
})();
