// Aguarda o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todas as palavras que serão animadas
    const words = document.querySelectorAll('.word');
    
    // Inicializa as palavras
    words.forEach((word) => {
        // Divide cada palavra em letras
        const letters = word.textContent.split('');
        word.textContent = '';
        // Cria spans para cada letra
        letters.forEach((letter) => {
            const span = document.createElement('span');
            span.textContent = letter;
            span.className = 'letter';
            word.appendChild(span);
        });
    });

    let currentWordIndex = 0;
    const maxWordIndex = words.length - 1;
    words[currentWordIndex].style.opacity = '1';

    const changeText = () => {
        const currentWord = words[currentWordIndex];
        const nextWord = currentWordIndex === maxWordIndex ? words[0] : words[currentWordIndex + 1];

        // Anima as letras da palavra atual para sair
        Array.from(currentWord.children).forEach((letter, i) => {
            setTimeout(() => {
                letter.className = 'letter out';
            }, i * 80);
        });

        // Prepara e anima a próxima palavra
        nextWord.style.opacity = '1';
        Array.from(nextWord.children).forEach((letter, i) => {
            letter.className = 'letter behind';
            setTimeout(() => {
                letter.className = 'letter in';
            }, 340 + i * 80);
        });

        // Atualiza o índice para a próxima palavra
        currentWordIndex = currentWordIndex === maxWordIndex ? 0 : currentWordIndex + 1;
    };

    // Inicia a animação
    changeText();
    // Define o intervalo para trocar o texto (3 segundos)
    setInterval(changeText, 3000);
});

// circle skill ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const circles = document.querySelectorAll(".circle");

circles.forEach(elem => {
    const dots = parseInt(elem.getAttribute("data-dots")); // Quantidade total de pontos
    const marked = parseInt(elem.getAttribute("data-percent")); // Percentual de pontos coloridos
    const percent = Math.floor((dots * marked) / 100); // Calculando a quantidade de pontos a serem coloridos
    let points = "";
    const rotate = 360 / dots; // Ângulo para cada ponto

    // Gerar os pontos do círculo
    for (let i = 0; i < dots; i++) {
        points += `<div class="points" style="--i:${i}; --rot:${rotate}deg"></div>`;
    }

    // Adicionar os pontos ao círculo
    elem.innerHTML = points;

    // Colorir os pontos de acordo com o percentual
    const pointsMarked = elem.querySelectorAll(".points");

    // Colorir os pontos até o valor do percentual
    for (let i = 0; i < percent; i++) {
        pointsMarked[i].classList.add("marked"); // Marca os pontos que precisam ser coloridos
    }

    // Adiciona a animação apenas para os pontos marcados
    pointsMarked.forEach((point, i) => {
        if (i < percent) {
            point.style.animation = `glow 0.5s linear forwards ${i * 0.1}s`; // A animação começa com um pequeno delay para cada ponto
        }
    });
});


// mixit up portfolio section

var mixer = mixitup('.portfolio-gallery');

// active skill ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let menuLi = document.querySelectorAll('header ul li a');  // Ajuste para 'a' dentro de 'li'
let sections = document.querySelectorAll('section');  // Ajuste para 'section'

function activeMenu(){
    let len = sections.length;
    while (--len && window.scrollY + 97 < sections[len].offsetTop){}  // Ajuste no cálculo de rolagem
    menuLi.forEach(link => link.classList.remove("active"));
    menuLi[len] && menuLi[len].classList.add("active");
}

window.addEventListener("scroll", activeMenu);
activeMenu();  // Inicializa o efeito ao carregar a página


// active skill ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const header = document.querySelector("header");
window.addEventListener("scroll",function(){
    header.classList.toggle("sticky",window.scrollY > 50)
})

//toggle icon navbar /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let menuIcon = document.querySelector("#menu-icon");
let navList = document.querySelector(".navlist");

if (menuIcon && navList) {
    menuIcon.onclick = () => {
        menuIcon.classList.toggle("bx-x");  // Altera o ícone de menu
        navList.classList.toggle("open");  // Abre/fecha o menu
    }
}

window.onscroll = () => {
    menuIcon.classList.remove("bx-x");  // Altera o ícone de menu
    navList.classList.remove("open");  // Abre/fecha o menu
}

//// parallax  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const observers = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show-items");
        } else {
            entry.target.classList.remove("show-items");
        }
    });
});

const scrollScale = document.querySelectorAll(".scroll-scale");
scrollScale.forEach((el)=>observers.observe(el));

const scrollBottom = document.querySelectorAll(".scroll-bottom");
scrollBottom.forEach((el)=>observers.observe(el));

const scrollTop = document.querySelectorAll(".scroll-top");
scrollTop.forEach((el)=>observers.observe(el));

//// contact  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById('contact-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Previne o envio padrão do formulário

    // Coletar os valores dos campos
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const endereco = document.getElementById('endereco').value;
    const numero = document.getElementById('numero').value;
    const mensagem = document.getElementById('mensagem').value;

    // Verificar o valor do email
    console.log(email);  // Verifique se o valor do email está correto

    // Validar se todos os campos estão preenchidos (opcional)
    if (!nome || !email || !endereco || !numero || !mensagem) {
        alert('Todos os campos são obrigatórios!');
        return;
    }

    // Validar o email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        alert('Email inválido!');
        return;
    }

    // Enviar os dados para o backend via axios
    try {
        const response = await axios.post('http://localhost:5000/api/contact', {
            nome,
            email,
            endereco,
            numero,
            mensagem
        });

        // Exibir a resposta do servidor
        alert(response.data.message);  // Sucesso
    } catch (error) {
        console.log(error); // Exibe o erro completo no console
        alert('Erro ao enviar a mensagem. Tente novamente!');
    }
});
