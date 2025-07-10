(function () {
    const Choice = {
        quizzes: [],
        init() {
            checkUserData();
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `http://testologia.site/get-quizzes`, false);
            xhr.send();
            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.quizzes = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
                this.processQuizzes();
            }else{
                location.href = 'index.html';
            }
        },
        processQuizzes(){
            const choiceOptionsElement = document.getElementById('choice-options');
            if(this.quizzes && this.quizzes.length > 0){
                this.quizzes.forEach(quiz=> {
                    const that = this;
                    const choiceOptionElement = document.createElement('div');
                    choiceOptionElement.className ='choice-option';
                    choiceOptionElement.setAttribute('data-id', quiz.id);
                    choiceOptionElement.addEventListener('click', function(){
                        that.chooseQuiz(this);
                    });
                    const choiceOptionTextElement = document.createElement('div');
                    choiceOptionTextElement.className ='choice-option-text';
                    choiceOptionTextElement.textContent = quiz.name;

                    const choiceOptionArrowElement = document.createElement('div');
                    choiceOptionArrowElement.className ='choice-option-arrow';

                    const choiceOptionArrowSvgElement = document.createElement('img');
                    choiceOptionArrowSvgElement.setAttribute('src', '../../assets/arrow.svg');
                    choiceOptionArrowElement.appendChild(choiceOptionArrowSvgElement);
                    choiceOptionElement.appendChild(choiceOptionTextElement);
                    choiceOptionElement.appendChild(choiceOptionArrowElement);

                    choiceOptionsElement.appendChild(choiceOptionElement);
                });
            }
        },
        chooseQuiz(element){
            const dataId = element.getAttribute("data-id");
            if(dataId){
                sessionStorage.setItem('test-id', dataId);
                location.href = "test.html";
            }
        },


    }
    Choice.init();
})();
