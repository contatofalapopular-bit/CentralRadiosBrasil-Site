const btnProjeto = document.getElementById("btn-projeto");
const btnRadio = document.getElementById("btn-radio");

const msgProjeto = document.getElementById("mensagem-projeto");
const msgRadio = document.getElementById("mensagem-radio");

btnProjeto.addEventListener("click", () => {

    msgProjeto.classList.toggle("hidden");

    msgRadio.classList.add("hidden");

});

btnRadio.addEventListener("click", () => {

    msgRadio.classList.toggle("hidden");

    msgProjeto.classList.add("hidden");

});
