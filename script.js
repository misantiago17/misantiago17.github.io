// Adiciona funcionalidade para fixar a navegação durante o scroll
const nav = document.querySelector('.nav-main');
const navSpacer = document.querySelector('.nav-spacer');
const navHeight = nav.offsetHeight;

// Efeito de digitação para o texto da hero section
document.addEventListener('DOMContentLoaded', function() {
    const typedTextElement = document.querySelector('.typed-text');
    
    if (typedTextElement) {
        const texts = ['Game Developer', 'Unity Developer', 'Unreal Developer', 'C# Programmer'];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;
        
        function typeEffect() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                // Deletando texto
                typedTextElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50; // Velocidade mais rápida ao deletar
            } else {
                // Digitando texto
                typedTextElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 150; // Velocidade normal ao digitar
            }
            
            // Gerencia a lógica de digitação/deleção
            if (!isDeleting && charIndex === currentText.length) {
                // Pausa quando terminar de digitar
                isDeleting = true;
                typingSpeed = 1500; // Pausa antes de começar a deletar
            } else if (isDeleting && charIndex === 0) {
                // Muda para o próximo texto quando terminar de deletar
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingSpeed = 500; // Pausa antes de digitar o próximo texto
            }
            
            setTimeout(typeEffect, typingSpeed);
        }
        
        // Inicia o efeito de digitação
        setTimeout(typeEffect, 1000);
    }
});

window.addEventListener('scroll', function() {
    // Controla o botão de voltar ao topo
    var backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
    
    // Muda a aparência da navegação durante o scroll
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
        nav.style.padding = '12px 40px';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        nav.style.padding = '15px 40px';
    }
    
    // Identifica qual seção está visível e destaca o link correspondente
    highlightNavigation();
});

// Rolagem suave para as âncoras
document.querySelectorAll('.nav-main a, .scroll-down a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove a classe 'active' de todos os links
        document.querySelectorAll('.nav-main a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Adiciona a classe 'active' ao link clicado
        if (this.classList.contains('nav-main')) {
            this.classList.add('active');
        }
        
        // Rola até a seção
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - navHeight;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Função que destaca o link da navegação correspondente à seção visível
function highlightNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-main a');
    const scrollPosition = window.scrollY + nav.offsetHeight + 50; // Ajuste para considerar a navegação fixa
    
    let currentSection = '';
    
    sections.forEach(section => {
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        }
    });
    
    // Trata casos especiais de seções que não têm link direto na navegação
    if (currentSection === 'playables') {
        currentSection = 'jogos-pontuais'; // Associa os playables à seção de projetos
    }
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Botão voltar ao topo
const backToTopButton = document.querySelector('.back-to-top');
if (backToTopButton) {
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Adiciona o botão de voltar ao topo se não existir no HTML
if (!backToTopButton) {
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTop);
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Funcionalidades do Carrossel de Jogos
document.addEventListener('DOMContentLoaded', function() {
    // Elementos de controle do carrossel
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const gameIframe = document.getElementById('game-iframe');
    const gameTitle = document.getElementById('game-title');
    const gameDescription = document.getElementById('game-description');
    const indicators = document.querySelectorAll('.game-indicator');
    
    // Verifique se os elementos existem para evitar erros
    if (!prevButton || !nextButton || !gameIframe || !gameTitle || !gameDescription || !indicators.length) {
        return;
    }
    
    // Dados dos jogos
    const games = [
        {
            title: "AFK Soccer 1",
            url: "playables/afksoccer_p_202305_01_auto_applovin-75cdaab8-62ea-4c0f-8f3b-ddb4cd844d10.html",
            description: "Jogo de futebol casual com mecânicas simples e diversão garantida."
        },
        {
            title: "AFK Soccer 2",
            url: "playables/afksoccer_p_202305_10_auto_applovin-0bcd3f67-0389-4e56-b5ec-3b98e3e7c4b1.html",
            description: "Nova versão do jogo de futebol com recursos adicionais e melhor jogabilidade."
        },
        {
            title: "Battle Tanks 1",
            url: "playables/battletanks_p_202112_03_auto_applovin-564d1749-6ece-4ff4-ad39-c390ba84f89e.html",
            description: "Controle tanques em batalhas intensas com estratégia e ação."
        },
        {
            title: "Battle Tanks 2",
            url: "playables/battletanks_p_202206_04_auto_applovin-75a4ec4a-fd70-4e15-b870-eaf16e33b30f.html",
            description: "Versão atualizada do Battle Tanks com novos mapas e veículos."
        },
        {
            title: "Battle Tanks 3",
            url: "playables/battletanks_p_202206_09_auto_applovin-8cf38937-bd0e-4542-9907-7e68e13cdcdf.html",
            description: "A mais recente versão do Battle Tanks com gráficos aprimorados e mais desafios."
        }
    ];
    
    let currentIndex = 0;
    
    // Função para carregar um jogo específico
    function loadGame(index) {
        // Implementa o loop no carrossel
        if (index < 0) {
            index = games.length - 1; // Se tentar ir para trás do primeiro, vai para o último
        } else if (index >= games.length) {
            index = 0; // Se tentar ir além do último, volta para o primeiro
        }
        
        currentIndex = index;
        
        // Atualiza o iframe com o novo jogo
        gameIframe.src = games[index].url;
        
        // Atualiza as informações do jogo
        gameTitle.textContent = games[index].title;
        gameDescription.textContent = games[index].description;
        
        // Atualiza os indicadores
        indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Eventos dos botões de navegação
    prevButton.addEventListener('click', function() {
        loadGame(currentIndex - 1);
    });
    
    nextButton.addEventListener('click', function() {
        loadGame(currentIndex + 1);
    });
    
    // Adiciona eventos aos indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            loadGame(index);
        });
    });
    
    // Inicializa o carrossel
    loadGame(0);
});
