(function () {
    const Result = {
        init() {
            checkUserData();
            const url = new URL(location.href);
            const id = url.searchParams.get("id");
            document.getElementById('result-scope').textContent = url.searchParams.get('score') + '/' + url.searchParams.get('total');
            document.getElementById('answers-link').addEventListener('click', () => {
                location.href = 'answers.html?id=' + id;
            });
        },
    }
    Result.init();
})();
