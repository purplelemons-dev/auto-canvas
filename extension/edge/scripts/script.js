if (window.location.href.match(/https?:\/\/collin\.instructure\.com\/courses\/\d+\/quizzes\/\d+\/take/)) {
    const questions = document.getElementById("questions").querySelectorAll("[role='region']");
    const button = document.createElement("input");
    button.type = "button";
    button.value = "Get Answer";
    button.style.position = "absolute";
    button.style.top = "0";
    button.style.right = "0";
    button.style.zIndex = "999";
    for (let question of questions) {
        question.appendChild(button.cloneNode(true)).addEventListener("click", async () => {
            const question_text = question.querySelector(".question_text").innerText;
            const options = Array.from(question.querySelectorAll(".answer")).map((option, idx) => {
                return {
                    text: option.innerText,
                    letter: String.fromCharCode('A'.charCodeAt(0) + idx),
                    object: option
                };
            });

            const model_answer = await fetch("http://localhost:2048/v1/autocanvas/gpt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: question_text,
                    options: options.map(({ text, letter }) => ({ text, letter }))
                })
            }).then(res => res.json()).then(data => data.model_answer);

            console.log(`Model Answer: ${JSON.stringify(model_answer)}`);
            options.map(({ letter, object }) => {
                console.log(`${letter}:`);
                console.log(object);
            });
            for (let option of options) {
                for (let answer of model_answer) {
                    if (option.letter === answer.letter.toUpperCase()) {
                        option.object.style.backgroundColor = "green";
                        option.object.querySelector("span.answer_input").click();

                    }
                    let infoIcon = document.createElement('div');
                    infoIcon.className = 'autocanvas-info-icon';
                    infoIcon.innerHTML = '<span>?</span>';

                    infoIcon.addEventListener('click', () => {
                        const popup = document.createElement('div');
                        popup.className = 'autocanvas-popup';
                        popup.innerText = model_answer.map(({ letter, reason }) => `${letter}: ${reason}`).join('\n');
                        option.object.appendChild(popup);
                    });

                    option.object.appendChild(infoIcon);
                }

            }
        });
    }
}
