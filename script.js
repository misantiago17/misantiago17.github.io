// Adiciona funcionalidade para fixar a navegação durante o scroll
const nav = document.querySelector('.nav-main');
const navSpacer = document.querySelector('.nav-spacer');
const navHeight = nav.offsetHeight;

// Efeito de digitação para o texto da hero section
document.addEventListener('DOMContentLoaded', function() {
    const typedTextElement = document.querySelector('.typed-text');
    
    if (typedTextElement) {
        const texts = [
            'Unity Specialist',
            'Game Developer',
            'C# Programmer',
            'Unreal Engine Developer',
            'Criadora de Experiências',
            'Mobile Game Developer'
        ];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        // Adiciona o cursor
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        typedTextElement.parentNode.insertBefore(cursor, typedTextElement.nextSibling);
        
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
                typingSpeed = 2000; // Pausa antes de começar a deletar
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
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
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

// Gerenciamento do portfólio
document.addEventListener('DOMContentLoaded', function() {
    // Gerenciamento do modal para jogos clicáveis
    const modal = document.getElementById('game-modal');
    const closeModal = document.querySelector('.close-modal');
    const gameIframe = document.getElementById('game-iframe');
    
    // Adiciona evento de clique para cada projeto playable
    const playableProjects = document.querySelectorAll('.filter-playables');
    if (playableProjects.length > 0 && modal && gameIframe) {
        playableProjects.forEach(project => {
            project.addEventListener('click', function() {
                // Carrega o URL do jogo específico do atributo data-game-url
                const gameUrl = this.getAttribute('data-game-url') || 'https://example.com/game-placeholder';
                gameIframe.src = gameUrl;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Previne rolagem da página
            });
        });
        
        // Fecha o modal quando clica no X
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                modal.classList.remove('active');
                gameIframe.src = '';
                document.body.style.overflow = 'auto'; // Reativa a rolagem
            });
        }
        
        // Fecha o modal quando clica fora dele
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                gameIframe.src = '';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Navegação horizontal pelas setas
    setupHorizontalScroll('pontuais-scroll');
    setupHorizontalScroll('playables-scroll');
    setupHorizontalScroll('pessoais-scroll');

    // Observa as estatísticas para animação
    observeStats();

    // Inicializar botão de download
    initDownloadButton();

    // Inicializa o player de jogo embutido
    initGamePlayer();
});

// Configura a navegação horizontal para cada container de portfólio
function setupHorizontalScroll(scrollContainerId) {
    const scrollContainer = document.getElementById(scrollContainerId);
    if (!scrollContainer) return;
    
    const nextBtn = scrollContainer.parentElement.querySelector('.next');
    const prevBtn = scrollContainer.parentElement.querySelector('.prev');
    
    // Tamanho fixo para cada card para calcular a rolagem
    const cardWidth = 320; // Largura aproximada de um card + gap
    
    // Obtém o número total de itens
    const items = scrollContainer.querySelectorAll('.project-card');
    // Número de itens visíveis simultaneamente (aproximado)
    const visibleItems = Math.floor(scrollContainer.clientWidth / cardWidth);
    
    // Posição atual do scroll (em termos de índice)
    let currentIndex = 0;
    
    // Verifica se há botões de navegação
    if (nextBtn && prevBtn) {
        // Configuração para o botão "próximo"
        nextBtn.addEventListener('click', function() {
            // Avança para o próximo conjunto de itens
            currentIndex = Math.min(currentIndex + visibleItems, items.length - visibleItems);
            scrollTo(currentIndex);
            checkScrollButtons();
        });
        
        // Configuração para o botão "anterior"
        prevBtn.addEventListener('click', function() {
            // Retrocede para o conjunto anterior de itens
            currentIndex = Math.max(currentIndex - visibleItems, 0);
            scrollTo(currentIndex);
            checkScrollButtons();
        });
        
        // Função para rolar até um índice específico
        function scrollTo(index) {
            const position = Math.min(index * cardWidth, scrollContainer.scrollWidth - scrollContainer.clientWidth);
            scrollContainer.scrollTo({
                left: position,
                behavior: 'smooth'
            });
        }
        
        // Função para verificar o estado dos botões
        function checkScrollButtons() {
            // Botão anterior fica desativado se estiver no início
            if (currentIndex <= 0) {
                prevBtn.style.opacity = '0.5';
                prevBtn.style.pointerEvents = 'none';
            } else {
                prevBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
            }
            
            // Botão próximo fica desativado se estiver no fim
            if (currentIndex >= items.length - visibleItems) {
                nextBtn.style.opacity = '0.5';
                nextBtn.style.pointerEvents = 'none';
            } else {
                nextBtn.style.opacity = '1';
                nextBtn.style.pointerEvents = 'auto';
            }
        }
        
        // Verifica o estado inicial dos botões
        checkScrollButtons();
        
        // Adiciona um ouvinte de redimensionamento para ajustar os botões conforme necessário
        window.addEventListener('resize', function() {
            const newVisibleItems = Math.floor(scrollContainer.clientWidth / cardWidth);
            if (newVisibleItems !== visibleItems) {
                // Recalcular a posição atual se a quantidade de itens visíveis mudar
                currentIndex = Math.min(currentIndex, items.length - newVisibleItems);
                checkScrollButtons();
            }
        });
    }
}

// Verifica quando a seção de estatísticas está visível e inicia a animação
const observeStats = () => {
    const statsContainer = document.querySelector('.stats-container');
    
    if (statsContainer) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Se a seção de estatísticas estiver visível, inicia a animação
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target); // Executa apenas uma vez
                }
            });
        }, { threshold: 0.3 }); // Reduzido para 0.3 para iniciar a animação mais cedo
        
        observer.observe(statsContainer);
    }
};

// Contador animado para as estatísticas
function animateCounters() {
    const counters = document.querySelectorAll('.count-up');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const duration = 2000; // Duração em milissegundos
        const step = Math.ceil(target / (duration / 30)); // 30 fps
        
        let current = 0;
        const updateCounter = () => {
            current += step;
            
            if (current < target) {
                counter.textContent = current;
                setTimeout(updateCounter, 30);
            } else {
                counter.textContent = target + "+";
                
                // Adiciona efeito de destaque quando a contagem termina
                counter.style.textShadow = "0 0 15px rgba(255, 107, 0, 0.7)";
                setTimeout(() => {
                    counter.style.textShadow = "none";
                }, 500);
            }
        };
        
        updateCounter();
    });
}

// Função para animar o botão de download do CV
function initDownloadButton() {
    const downloadBtn = document.querySelector('.download-cv-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('mouseenter', function() {
            this.innerHTML = '<i class="fas fa-download"></i> Baixando...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Pronto para download!';
            }, 500);
        });
        
        downloadBtn.addEventListener('mouseleave', function() {
            this.innerHTML = '<i class="fas fa-download"></i> Download CV';
        });
    }
}

// Inicializa o player de jogo embutido
function initGamePlayer() {
    const gameFrame = document.getElementById('game-frame');
    const loadingOverlay = document.querySelector('.game-loading-overlay');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const soundToggleBtn = document.getElementById('sound-toggle');
    const gamePlayerWrapper = document.querySelector('.game-player-wrapper');
    const gameTitleArea = document.querySelector('.game-title-area');
    const prevGameBtn = document.querySelector('.prev-game');
    const nextGameBtn = document.querySelector('.next-game');
    const carouselDots = document.querySelectorAll('.carousel-dot');
    const carouselTitle = document.querySelector('.carousel-title');
    
    if (!gameFrame) return;
    
    // Lista de jogos disponíveis
    const availableGames = [
        {
            id: 'afksoccer1',
            title: 'AFK Soccer (2023/05/01)',
            type: 'Soccer',
            icon: 'fas fa-futbol',
            url: 'playables/afksoccer_p_202305_01_auto_applovin-75cdaab8-62ea-4c0f-8f3b-ddb4cd844d10.html',
            instructions: [
                { icon: 'fas fa-mouse-pointer', text: 'Clique ou toque para chutar a bola' },
                { icon: 'fas fa-arrows-alt', text: 'Arraste para direcionar o chute' },
                { icon: 'fas fa-trophy', text: 'Marque o máximo de gols possível' }
            ]
        },
        {
            id: 'afksoccer2',
            title: 'AFK Soccer (2023/05/10)',
            type: 'Soccer',
            icon: 'fas fa-futbol',
            url: 'playables/afksoccer_p_202305_10_auto_applovin-0bcd3f67-0389-4e56-b5ec-3b98e3e7c4b1.html',
            instructions: [
                { icon: 'fas fa-mouse-pointer', text: 'Clique ou toque para chutar a bola' },
                { icon: 'fas fa-arrows-alt', text: 'Arraste para direcionar o chute' },
                { icon: 'fas fa-trophy', text: 'Marque o máximo de gols possível' }
            ]
        },
        {
            id: 'battletanks1',
            title: 'Battle Tanks (2021/12)',
            type: 'Tanks',
            icon: 'fas fa-shield-alt',
            url: 'playables/battletanks_p_202112_03_auto_applovin-564d1749-6ece-4ff4-ad39-c390ba84f89e.html',
            instructions: [
                { icon: 'fas fa-keyboard', text: 'Use WASD ou setas para mover' },
                { icon: 'fas fa-mouse-pointer', text: 'Mouse para mirar' },
                { icon: 'fas fa-hand-pointer', text: 'Clique para atirar' }
            ]
        },
        {
            id: 'battletanks2',
            title: 'Battle Tanks (2022/06 v4)',
            type: 'Tanks',
            icon: 'fas fa-shield-alt',
            url: 'playables/battletanks_p_202206_04_auto_applovin-75a4ec4a-fd70-4e15-b870-eaf16e33b30f.html',
            instructions: [
                { icon: 'fas fa-keyboard', text: 'Use WASD ou setas para mover' },
                { icon: 'fas fa-mouse-pointer', text: 'Mouse para mirar' },
                { icon: 'fas fa-hand-pointer', text: 'Clique para atirar' }
            ]
        },
        {
            id: 'battletanks3',
            title: 'Battle Tanks (2022/06 v9)',
            type: 'Tanks',
            icon: 'fas fa-shield-alt',
            url: 'playables/battletanks_p_202206_09_auto_applovin-8cf38937-bd0e-4542-9907-7e68e13cdcdf.html',
            instructions: [
                { icon: 'fas fa-keyboard', text: 'Use WASD ou setas para mover' },
                { icon: 'fas fa-mouse-pointer', text: 'Mouse para mirar' },
                { icon: 'fas fa-hand-pointer', text: 'Clique para atirar' }
            ]
        }
    ];
    
    // Índice do jogo atual
    let currentGameIndex = 0;
    
    // Configura eventos para os controles do carrossel já existentes no HTML
    if (nextGameBtn) {
        nextGameBtn.addEventListener('click', nextGame);
    }
    
    if (prevGameBtn) {
        prevGameBtn.addEventListener('click', prevGame);
    }
    
    // Configura os eventos para os pontos indicadores
    if (carouselDots.length > 0) {
        carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                currentGameIndex = parseInt(this.dataset.index);
                changeGame(currentGameIndex);
            });
        });
    }
    
    // Atualiza o título e instruções do jogo atual
    updateGameInfo(availableGames[currentGameIndex]);
    
    // Carrega o primeiro jogo automaticamente
    loadGame(availableGames[currentGameIndex].url);
    
    // Implementa a funcionalidade de tela cheia
    if (fullscreenBtn && gamePlayerWrapper) {
        fullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                // Entra em modo de tela cheia
                if (gamePlayerWrapper.requestFullscreen) {
                    gamePlayerWrapper.requestFullscreen();
                } else if (gamePlayerWrapper.mozRequestFullScreen) { // Firefox
                    gamePlayerWrapper.mozRequestFullScreen();
                } else if (gamePlayerWrapper.webkitRequestFullscreen) { // Chrome, Safari, Opera
                    gamePlayerWrapper.webkitRequestFullscreen();
                } else if (gamePlayerWrapper.msRequestFullscreen) { // IE/Edge
                    gamePlayerWrapper.msRequestFullscreen();
                }
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                // Sai do modo de tela cheia
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        });
        
        // Monitora mudanças no estado de tela cheia
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
        document.addEventListener('mozfullscreenchange', updateFullscreenButton);
        document.addEventListener('MSFullscreenChange', updateFullscreenButton);
        
        function updateFullscreenButton() {
            if (document.fullscreenElement) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        }
    }
    
    // Implementa a funcionalidade de ligar/desligar som
    if (soundToggleBtn && gameFrame) {
        let soundOn = true;
        
        soundToggleBtn.addEventListener('click', function() {
            soundOn = !soundOn;
            
            // Atualiza o ícone do botão
            if (soundOn) {
                soundToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
            
            // Envia mensagem para o iframe do jogo para desligar o som
            try {
                gameFrame.contentWindow.postMessage({ type: 'sound', value: soundOn }, '*');
            } catch (error) {
                console.error('Erro ao enviar mensagem para o iframe:', error);
            }
        });
    }
    
    // Carrega um jogo
    function loadGame(gameUrl) {
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        
        // Inicia o carregamento do jogo
        gameFrame.src = gameUrl;
        
        // Detecta quando o jogo terminou de carregar
        gameFrame.onload = function() {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        };
        
        // Tratamento de erro de carregamento
        gameFrame.onerror = function() {
            if (loadingOverlay) {
                const loadingText = loadingOverlay.querySelector('p');
                if (loadingText) loadingText.textContent = 'Erro ao carregar o jogo. Tente novamente.';
                
                // Adiciona botão de tentar novamente
                const retryButton = document.createElement('button');
                retryButton.textContent = 'Tentar Novamente';
                retryButton.className = 'retry-btn';
                retryButton.onclick = function() {
                    loadGame(gameUrl);
                };
                
                // Remove botão anterior se existir
                const existingRetryBtn = loadingOverlay.querySelector('.retry-btn');
                if (existingRetryBtn) existingRetryBtn.remove();
                
                loadingOverlay.appendChild(retryButton);
            }
        };
    }
    
    // Função para mudar para o próximo jogo
    function nextGame() {
        currentGameIndex = (currentGameIndex + 1) % availableGames.length;
        changeGame(currentGameIndex);
    }
    
    // Função para mudar para o jogo anterior
    function prevGame() {
        currentGameIndex = (currentGameIndex - 1 + availableGames.length) % availableGames.length;
        changeGame(currentGameIndex);
    }
    
    // Função para mudar o jogo atual
    function changeGame(index) {
        const game = availableGames[index];
        updateGameInfo(game);
        loadGame(game.url);
        updateGameIndicators();
    }
    
    // Atualiza os indicadores do carrossel
    function updateGameIndicators() {
        carouselDots.forEach((dot, index) => {
            if (index === currentGameIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Função para atualizar as informações do jogo
    function updateGameInfo(game) {
        // Atualiza o título do jogo
        const gameTitle = document.querySelector('.game-title-area h4');
        if (gameTitle) gameTitle.textContent = game.title;
        
        // Atualiza os badges do jogo
        const gameBadges = document.querySelector('.game-badges');
        if (gameBadges) {
            // Limpa os badges existentes
            gameBadges.innerHTML = '';
            
            // Adiciona novos badges
            const typeBadge = document.createElement('span');
            typeBadge.className = 'game-badge';
            typeBadge.innerHTML = `<i class="${game.icon}"></i> ${game.type}`;
            gameBadges.appendChild(typeBadge);
            
            const htmlBadge = document.createElement('span');
            htmlBadge.className = 'game-badge';
            htmlBadge.innerHTML = '<i class="fab fa-html5"></i> HTML5';
            gameBadges.appendChild(htmlBadge);
        }
    }
}

// Função para tentar carregar imagens de jogos de múltiplas fontes
document.addEventListener('DOMContentLoaded', function() {
    // Lista de possíveis URLs para a imagem do Dash Dash Attack
    const dashDashAttackUrls = [
        'assets/images/dash-dash-attack.jpg',
        'https://nestgamestudio.files.wordpress.com/2018/10/screenshot-1-2.png',
        'https://img.itch.zone/aW1hZ2UvNDI0MjM1LzIxMjMzMzAucG5n/original/0WEcgq.png',
        'https://img.itch.zone/aW1nLzIxMjMzMzAucG5n/original/KrGfe2.png'
    ];
    
    // Encontra o card do Dash Dash Attack percorrendo todos os h3
    const headings = document.querySelectorAll('.project-card .project-content h3');
    let dashDashCard = null;
    
    headings.forEach(heading => {
        if (heading.textContent.trim() === 'Dash Dash Attack') {
            dashDashCard = heading;
        }
    });
    
    if (dashDashCard) {
        // Navegue até a raiz do card e então encontre a imagem
        const cardElement = dashDashCard.closest('.project-card');
        const cardImage = cardElement.querySelector('.game-thumbnail');
        
        // Função para tentar a próxima URL
        function tryNextImage(index) {
            if (index >= dashDashAttackUrls.length) return; // Todas as URLs falharam
            
            const img = new Image();
            img.onload = function() {
                cardImage.src = dashDashAttackUrls[index];
                cardImage.classList.add('loaded');
            };
            img.onerror = function() {
                tryNextImage(index + 1);
            };
            img.src = dashDashAttackUrls[index];
        }
        
        // Inicia a tentativa com a primeira URL
        tryNextImage(0);
    }
});
