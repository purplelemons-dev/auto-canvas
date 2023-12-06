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
            const options = Array.from(question.querySelectorAll(".answer")).map((option) => {
                return {
                    text: option.innerText,
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
                    options: options
                })
            }).then(res => res.json()).then(data => data["model_answer"]);

            console.log(`Model Answer: ${model_answer}`);
            if (model_answer !== "No answer found :(") {
                for (let option of options) {
                    if (option.text === model_answer) {
                        option.object.querySelector("span.answer_input").click();
                        option.object.style.backgroundColor = "green";
                        break;
                    }
                }
            }


            /*(await fetch("http://localhost:2048/v1/autocanvas/google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: question_text,
                    options: options
                })
            })).json().then(data => {
                console.log(data);
                const box = document.createElement("textarea");
                box.readOnly = true;
                box.style.position = "absolute";
                box.style.top = "0";
                box.style.left = "100%";
                box.style.zIndex = "999";
                box.style.backgroundColor = "white";
                box.style.width = "100%";
                box.style.height = "100%";
                box.style.overflow = "scroll";
                box.style.padding = "10px";
                box.style.boxSizing = "border-box";
                box.style.fontFamily = "Arial";
                box.style.fontSize = "14px";
                box.style.color = "black";
                box.style.textAlign = "left";
                box.style.lineHeight = "1.5";
                box.style.fontWeight = "normal";
                box.style.border = "1px solid black";
                box.style.borderRadius = "10px";
                box.style.boxShadow = "0px 0px 10px black";
                if (data.length > 0) {
                    let box_obj = question.appendChild(box);
                    for (let option of data) {
                        box_obj.value += `${option}\n`;
                    }
                } else {
                    question.appendChild(box).value = "No answer found :(";
                }
            });*/
        });
    }
}
