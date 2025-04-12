// Utilitários avançados
const utils = {
    // Função de debounce para otimizar eventos de scroll
    debounce: (func, delay = 100) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    // Função de throttle para limitar a frequência de execução de funções
    throttle: (func, limit = 100) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Verifica se um elemento existe no DOM
    exists: (element) => element !== null && element !== undefined,
    
    // Método seguro para adicionar event listeners
    addEvent: (element, event, handler) => {
        if (utils.exists(element)) {
            element.addEventListener(event, handler);
            return true;
        }
        return false;
    },
    
    // Carrega imagem com fallback e retry
    loadImage: (img, src, fallbacks = [], onSuccess = null, onError = null, retryCount = 0, maxRetries = 3) => {
        if (!img || !src) return false;
        
        const tryLoad = () => {
            img.onload = function() {
                img.classList.add('loaded');
                if (onSuccess) onSuccess(img);
            };
            
            img.onerror = function() {
                // Se temos fallbacks, tentamos o próximo
                if (fallbacks.length > 0 && retryCount < fallbacks.length) {
                    utils.loadImage(img, fallbacks[retryCount], fallbacks, onSuccess, onError, retryCount + 1, maxRetries);
                } else if (retryCount < maxRetries) {
                    // Tenta novamente com atraso exponencial
                    setTimeout(() => {
                        utils.loadImage(img, src, fallbacks, onSuccess, onError, retryCount + 1, maxRetries);
                    }, Math.pow(2, retryCount) * 1000);
                } else if (onError) {
                    img.classList.add('error');
                    onError(img);
                }
            };
            
            img.src = src;
        };
        
        // Inicia carregamento com prioridade
        if ('loading' in HTMLImageElement.prototype && retryCount === 0) {
            img.loading = 'lazy';
        }
        
        tryLoad();
        return true;
    },
    
    // Adiciona tratamento de erros para recursos externos
    safeExecute: (fn, fallbackFn = null, context = null, ...args) => {
        try {
            return fn.apply(context, args);
        } catch (error) {
            console.error('Erro ao executar função:', error);
            if (fallbackFn) {
                try {
                    return fallbackFn.apply(context, args);
                } catch (fallbackError) {
                    console.error('Erro ao executar fallback:', fallbackError);
                }
            }
            return null;
        }
    }
};

// Adiciona funcionalidade para fixar a navegação durante o scroll
const nav = document.querySelector('.nav-main');
const navSpacer = document.querySelector('.nav-spacer');
const navHeight = nav?.offsetHeight || 0;

// Efeito de digitação para o texto da hero section
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa gerenciamento de memória e performance
    initPerformanceMonitoring();
    
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
        
        // Implementa efeito de digitação com tratamento de erros
        const typeEffect = () => {
            utils.safeExecute(() => {
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
            }, () => {
                // Fallback em caso de erro: exibe o texto estático
                typedTextElement.textContent = texts[0];
                console.error('Erro no efeito de digitação, usando texto estático');
            });
        };
        
        // Inicia o efeito de digitação
        setTimeout(typeEffect, 1000);
    }

    // Inicializa as funcionalidades do site
    initNavigation();
    initScrollBehavior();
    setupPortfolio();
    observeStats();
    initDownloadButton();
    initGamePlayer();
    initLazyLoading();
    enhanceAccessibility();
    fixScrollArrow();
    fixGameCards();
});

// Monitoramento de performance
function initPerformanceMonitoring() {
    // Evita vazamento de memória em event listeners
    const cleanupRegistry = new Set();
    
    // Substitui o método addEvent para registrar para limpeza
    const originalAddEvent = utils.addEvent;
    utils.addEvent = (element, event, handler) => {
        if (utils.exists(element)) {
            element.addEventListener(event, handler);
            // Registra para limpeza posterior se necessário
            cleanupRegistry.add({ element, event, handler });
            return true;
        }
        return false;
    };
    
    // Adiciona método para limpar event listeners
    utils.cleanup = () => {
        cleanupRegistry.forEach(registration => {
            const { element, event, handler } = registration;
            if (utils.exists(element)) {
                element.removeEventListener(event, handler);
            }
        });
        cleanupRegistry.clear();
    };
    
    // Detecta problemas de performance
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    // Alerta para long tasks (tarefas que bloqueiam a thread principal)
                    if (entry.duration > 100) {
                        console.warn(`Tarefa longa detectada: ${entry.name} (${Math.round(entry.duration)}ms)`);
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            console.error('PerformanceObserver não suportado:', e);
        }
    }
    
    // Limpa recursos ao desmontar a página
    window.addEventListener('beforeunload', () => {
        utils.cleanup();
    });
}

// Melhorias de acessibilidade
function enhanceAccessibility() {
    // Adiciona atributos ARIA para melhorar acessibilidade
    document.querySelectorAll('.nav-main a').forEach(link => {
        if (!link.hasAttribute('aria-label')) {
            link.setAttribute('aria-label', link.textContent.trim());
        }
    });
    
    // Foco visível para navegação por teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Assegura que elementos interativos tenham roles apropriados
    document.querySelectorAll('.filter-playables').forEach(item => {
        if (!item.hasAttribute('role')) {
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            
            // Suporte para ativação por teclado
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        }
    });
}

// Inicializa a navegação
function initNavigation() {
// Rolagem suave para as âncoras
document.querySelectorAll('.nav-main a, .scroll-down a').forEach(anchor => {
        utils.addEvent(anchor, 'click', function(e) {
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
        
            if (targetElement && nav) {
            const offsetTop = targetElement.offsetTop - navHeight;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});
}

// Inicializa o comportamento de scroll
function initScrollBehavior() {
// Função que destaca o link da navegação correspondente à seção visível
function highlightNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-main a');
        const scrollPosition = window.scrollY + (navHeight || 0) + 50;
    
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

    // Adiciona o botão de voltar ao topo se não existir no HTML
    const addBackToTopButton = () => {
        let backToTopButton = document.querySelector('.back-to-top');
        
        if (!backToTopButton) {
            backToTopButton = document.createElement('div');
            backToTopButton.className = 'back-to-top';
            backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
            backToTopButton.setAttribute('aria-label', 'Voltar ao topo');
            backToTopButton.setAttribute('role', 'button');
            backToTopButton.setAttribute('tabindex', '0');
            document.body.appendChild(backToTopButton);
            
            // Suporte para ativação por teclado
            backToTopButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
                }
            });
        }
        
        utils.addEvent(backToTopButton, 'click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
        
        return backToTopButton;
    };
    
    const backToTopButton = addBackToTopButton();
    
    // Usa throttle para otimizar o evento de scroll (melhor para animações)
    const handleScroll = utils.throttle(() => {
        // Controla o botão de voltar ao topo
        if (backToTopButton) {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }
        
        // Muda a aparência da navegação durante o scroll
        if (nav) {
            if (window.scrollY > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    }, 50);
    
    // Usa debounce para a detecção de seção ativa (menos crítico em termos de performance)
    const handleNavigationHighlight = utils.debounce(highlightNavigation, 100);
    
    // Registra os eventos separadamente para melhor performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleNavigationHighlight, { passive: true });
}

// Inicializa o lazy loading para todos os recursos
function initLazyLoading() {
    // Lazy loading para imagens
    if ('IntersectionObserver' in window) {
        // Configuração para imagens com atributo data-src
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    utils.loadImage(
                        img, 
                        img.dataset.src, 
                        [], // sem fallbacks
                        () => {
                            // Trigger animação de carregamento
                            setTimeout(() => {
                                img.style.opacity = '1';
                            }, 50);
                        },
                        () => {
                            // Fallback para imagens com erro
                            img.src = 'assets/images/placeholder.jpg';
                        }
                    );
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px', // Pré-carrega imagens 100px antes delas entrarem na viewport
            threshold: 0.1
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
        
        // Configuração para background images com data-background
        const lazyBackgrounds = document.querySelectorAll('[data-background]');
        const bgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.style.backgroundImage = `url(${element.dataset.background})`;
                    element.removeAttribute('data-background');
                    bgObserver.unobserve(element);
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });
        
        lazyBackgrounds.forEach(bg => {
            bgObserver.observe(bg);
        });
    } else {
        // Fallback para navegadores que não suportam Intersection Observer
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
        
        document.querySelectorAll('[data-background]').forEach(element => {
            element.style.backgroundImage = `url(${element.dataset.background})`;
            element.removeAttribute('data-background');
        });
    }
}

// Configura o portfólio
function setupPortfolio() {
    // Gerenciamento do modal para jogos clicáveis
    const modal = document.getElementById('game-modal');
    const closeModal = document.querySelector('.close-modal');
    const gameIframe = document.getElementById('game-iframe');
    
    // Adiciona evento de clique para cada projeto playable
    const playableProjects = document.querySelectorAll('.filter-playables');
    if (playableProjects.length > 0 && modal && gameIframe) {
        playableProjects.forEach(project => {
            utils.addEvent(project, 'click', function() {
                // Carrega o URL do jogo específico do atributo data-game-url
                const gameUrl = this.getAttribute('data-game-url') || 'https://example.com/game-placeholder';
                
                // Mostra carregamento primeiro
                const loadingOverlay = modal.querySelector('.game-loading-overlay') || 
                    createLoadingOverlay();
                
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'flex';
                    modal.appendChild(loadingOverlay);
                }
                
                // Mostra o modal
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Previne rolagem da página
                
                // Carrega o iframe após mostrar o modal e overlay de carregamento
                setTimeout(() => {
                    gameIframe.src = gameUrl;
                }, 50);
                
                // Adiciona tratamento de erros para iframes
                gameIframe.onerror = function() {
                    handleIframeError(loadingOverlay, gameUrl);
                };
                
                // Adiciona tratamento para quando o jogo carrega
                gameIframe.onload = function() {
                    if (loadingOverlay) {
                        loadingOverlay.style.display = 'none';
                    }
                };
            });
        });
        
        // Cria overlay de carregamento se não existir
        function createLoadingOverlay() {
            const overlay = document.createElement('div');
            overlay.className = 'game-loading-overlay';
            overlay.innerHTML = `
                <div class="loader"></div>
                <p>Carregando jogo...</p>
            `;
            return overlay;
        }
        
        // Trata erros de carregamento do iframe
        function handleIframeError(loadingOverlay, gameUrl) {
            if (loadingOverlay) {
                const loadingText = loadingOverlay.querySelector('p');
                if (loadingText) {
                    loadingText.textContent = 'Erro ao carregar o jogo. Tente novamente.';
                }
                
                // Adiciona botão de tentar novamente
                const retryButton = document.createElement('button');
                retryButton.textContent = 'Tentar Novamente';
                retryButton.className = 'retry-btn';
                retryButton.onclick = function() {
                    gameIframe.src = gameUrl;
                    loadingText.textContent = 'Carregando jogo...';
                    this.remove();
                };
                
                // Remove botão anterior se existir
                const existingRetryBtn = loadingOverlay.querySelector('.retry-btn');
                if (existingRetryBtn) existingRetryBtn.remove();
                
                loadingOverlay.appendChild(retryButton);
            }
        }
        
        // Fecha o modal quando clica no X
        if (closeModal) {
            utils.addEvent(closeModal, 'click', function() {
                closeGameModal();
            });
            
            // Adiciona suporte para tecla Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeGameModal();
                }
            });
        }
        
        // Função para fechar o modal com segurança
        function closeGameModal() {
            // Adiciona classe de animação de saída
            modal.classList.add('closing');
            
            // Espera a animação completar antes de esconder
            setTimeout(() => {
                modal.classList.remove('active');
                modal.classList.remove('closing');
                
                // Limpa o src do iframe para parar o jogo e liberar recursos
                setTimeout(() => {
                gameIframe.src = '';
                }, 50);
                
                document.body.style.overflow = 'auto'; // Reativa a rolagem
            }, 300); // Duração da animação
        }
        
        // Fecha o modal quando clica fora dele
        utils.addEvent(window, 'click', function(e) {
            if (e.target === modal) {
                closeGameModal();
            }
        });
    }

    // Navegação horizontal pelas setas
    setupHorizontalScroll('pontuais-scroll');
    setupHorizontalScroll('playables-scroll');
    setupHorizontalScroll('pessoais-scroll');
}

// Configura a navegação horizontal para cada container de portfólio
function setupHorizontalScroll(scrollContainerId) {
    const scrollContainer = document.getElementById(scrollContainerId);
    if (!scrollContainer) return;
    
    const nextBtn = scrollContainer.parentElement.querySelector('.next');
    const prevBtn = scrollContainer.parentElement.querySelector('.prev');
    
    // Usa ResizeObserver para detectar mudanças no tamanho do container
    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(utils.debounce(() => {
            updateScrollButtons();
        }, 200));
        
        resizeObserver.observe(scrollContainer);
    }
    
    // Tamanho fixo para cada card para calcular a rolagem
    const cardWidth = 320; // Largura aproximada de um card + gap
    
    // Obtém o número total de itens
    const items = scrollContainer.querySelectorAll('.project-card');
    
    // Smooth scrolling para o container
    scrollContainer.style.scrollBehavior = 'smooth';
    
    // Configuração melhorada para detectar quando o scroll não é mais possível
    let isScrolling = false;
    let scrollTimeout;
    let currentPosition = 0;
    
    // Calculamos o número de itens visíveis dinamicamente
    function getVisibleItems() {
        return Math.max(1, Math.floor(scrollContainer.clientWidth / cardWidth));
    }
        
        // Função para rolar até um índice específico
    function scrollTo(position) {
        isScrolling = true;
        
        // Suaviza o scroll para a posição desejada
            scrollContainer.scrollTo({
                left: position,
                behavior: 'smooth'
            });
        
        // Adiciona um timeout para resetar o estado de scrolling após a animação
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            updateScrollButtons(); // Atualiza os botões após o scroll terminar
        }, 500); // 500ms é aproximadamente o tempo da animação de scroll
    }
    
    // Adiciona listener de scroll para atualizar os botões quando o usuário rola manualmente
    scrollContainer.addEventListener('scroll', function() {
        // Atualiza os botões enquanto o usuário está rolando
        if (!isScrolling) {
            updateScrollButtons();
        }
    });
    
    // Função aprimorada para verificar o estado dos botões
    function updateScrollButtons() {
        if (!nextBtn || !prevBtn) return;
        
        const scrollLeft = scrollContainer.scrollLeft;
        const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth - 5; // 5px margem de erro
        
        // Verifica se podemos rolar para esquerda (quando já rolou para direita)
        if (scrollLeft <= 5) { // 5px margem de erro
                prevBtn.style.setProperty('opacity', '0.4', 'important');
                prevBtn.style.setProperty('pointer-events', 'none', 'important');
                prevBtn.setAttribute('aria-disabled', 'true');
            } else {
                prevBtn.style.setProperty('opacity', '1', 'important');
                prevBtn.style.setProperty('pointer-events', 'auto', 'important');
                prevBtn.setAttribute('aria-disabled', 'false');
            }
            
        // Verifica se podemos rolar para direita (quando ainda não chegou ao fim)
        if (scrollLeft >= maxScrollLeft) {
                nextBtn.style.setProperty('opacity', '0.4', 'important');
                nextBtn.style.setProperty('pointer-events', 'none', 'important');
                nextBtn.setAttribute('aria-disabled', 'true');
            } else {
                nextBtn.style.setProperty('opacity', '1', 'important');
                nextBtn.style.setProperty('pointer-events', 'auto', 'important');
                nextBtn.setAttribute('aria-disabled', 'false');
            }
    }
    
    // Botões touch-friendly para mobile
    function makeTouchFriendly(button) {
        if (!button) return;
        
        // Adiciona tratamento de touch events
        button.addEventListener('touchstart', function() {
            this.classList.add('active');
        }, { passive: true });
        
        button.addEventListener('touchend', function() {
            this.classList.remove('active');
        }, { passive: true });
        
        // Aumenta a área de toque
        button.style.minWidth = '44px';
        button.style.minHeight = '44px';
    }
    
    makeTouchFriendly(nextBtn);
    makeTouchFriendly(prevBtn);
    
    // Verifica se há botões de navegação
    if (nextBtn && prevBtn) {
        // Configuração para o botão "próximo"
        utils.addEvent(nextBtn, 'click', function() {
            if (isScrolling) return;
            
            const visibleItems = getVisibleItems();
            // Avança exatamente o número de itens visíveis
            scrollTo(currentPosition + (visibleItems * cardWidth));
        });
        
        // Suporte para ativação por teclado
        nextBtn.setAttribute('role', 'button');
        nextBtn.setAttribute('aria-label', 'Próximos itens');
        nextBtn.setAttribute('tabindex', '0');
        nextBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                nextBtn.click();
            }
        });
        
        // Configuração para o botão "anterior"
        utils.addEvent(prevBtn, 'click', function() {
            if (isScrolling) return;
            
            const visibleItems = getVisibleItems();
            // Retrocede exatamente o número de itens visíveis
            scrollTo(currentPosition - (visibleItems * cardWidth));
        });
        
        // Suporte para ativação por teclado
        prevBtn.setAttribute('role', 'button');
        prevBtn.setAttribute('aria-label', 'Itens anteriores');
        prevBtn.setAttribute('tabindex', '0');
        prevBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                prevBtn.click();
            }
        });
        
        // Atualiza o estado dos botões quando o usuário rola manualmente
        scrollContainer.addEventListener('scroll', utils.throttle(() => {
            if (!isScrolling) { // Apenas se não estiver em uma rolagem programada
                currentPosition = scrollContainer.scrollLeft;
                updateScrollButtons();
            }
        }, 100), { passive: true });
        
        // Verifica o estado inicial dos botões
        updateScrollButtons();
    }
    
    // Atualiza scroll ao redimensionar
    window.addEventListener('resize', utils.debounce(() => {
        if (items.length > 0) {
            updateScrollButtons();
        }
    }, 200), { passive: true });
    
    // Adiciona navegação por teclado para o contêiner de scroll
    scrollContainer.setAttribute('tabindex', '0');
    scrollContainer.setAttribute('role', 'region');
    scrollContainer.setAttribute('aria-label', 'Carrossel de projetos');
    
    scrollContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' && nextBtn && !nextBtn.getAttribute('aria-disabled') !== 'true') {
            nextBtn.click();
        } else if (e.key === 'ArrowLeft' && prevBtn && !prevBtn.getAttribute('aria-disabled') !== 'true') {
            prevBtn.click();
        }
    });
    
    return {
        container: scrollContainer,
        updateButtons: updateScrollButtons
    };
}

// Verifica quando a seção de estatísticas está visível e inicia a animação
const observeStats = () => {
    const statsContainer = document.querySelector('.stats-container');
    
    if (statsContainer && 'IntersectionObserver' in window) {
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
    } else {
        // Fallback quando IntersectionObserver não é suportado
        window.addEventListener('scroll', utils.debounce(() => {
            const rect = statsContainer?.getBoundingClientRect();
            if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
                animateCounters();
                window.removeEventListener('scroll', this);
            }
        }, 200), { passive: true });
    }
};

// Contador animado para as estatísticas
function animateCounters() {
    const counters = document.querySelectorAll('.count-up');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        if (isNaN(target)) return;
        
        const duration = 2000; // Duração em milissegundos
        const step = Math.ceil(target / (duration / 30)); // 30 fps
        
        let current = 0;
        const updateCounter = () => {
            current += step;
            
            if (current < target) {
                counter.textContent = current;
                // Usando requestAnimationFrame para melhor performance
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + "+";
                
                // Adiciona efeito de destaque quando a contagem termina
                counter.style.textShadow = "0 0 15px rgba(255, 107, 0, 0.7)";
                setTimeout(() => {
                    counter.style.textShadow = "none";
                }, 500);
            }
        };
        
        requestAnimationFrame(updateCounter);
    });
}

// Função para animar o botão de download do CV
function initDownloadButton() {
    const downloadBtn = document.querySelector('.download-cv-btn');
    if (!downloadBtn) return;
    
    let isAnimating = false;
    
    utils.addEvent(downloadBtn, 'mouseenter', function() {
        if (isAnimating) return;
        isAnimating = true;
        
            this.innerHTML = '<i class="fas fa-download"></i> Baixando...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Pronto para download!';
            isAnimating = false;
            }, 500);
        });
        
    utils.addEvent(downloadBtn, 'mouseleave', function() {
        if (isAnimating) return;
            this.innerHTML = '<i class="fas fa-download"></i> Download CV';
        });
    
    // Adiciona suporte para teclado
    downloadBtn.setAttribute('role', 'button');
    downloadBtn.setAttribute('tabindex', '0');
    downloadBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Simula o evento real que o link teria
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            downloadBtn.dispatchEvent(event);
        }
    });
}

// Inicializa o player de jogo embutido
function initGamePlayer() {
    const gameFrame = document.getElementById('game-frame');
    if (!gameFrame) return;
    
    const loadingOverlay = document.querySelector('.game-loading-overlay');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const soundToggleBtn = document.getElementById('sound-toggle');
    const gamePlayerWrapper = document.querySelector('.game-player-wrapper');
    const prevGameBtn = document.querySelector('.prev-game');
    const nextGameBtn = document.querySelector('.next-game');
    const carouselDots = document.querySelectorAll('.carousel-dot');
    
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
    let isChangingGame = false;
    
    // Implementa cache para jogos pré-carregados
    const gameCache = new Map();
    
    // Pré-carrega o próximo jogo
    function preloadNextGame() {
        const nextIndex = (currentGameIndex + 1) % availableGames.length;
        const nextGame = availableGames[nextIndex];
        
        if (!gameCache.has(nextGame.id)) {
            // Cria um iframe oculto para pré-carregar
            const preloadFrame = document.createElement('iframe');
            preloadFrame.style.display = 'none';
            preloadFrame.src = nextGame.url;
            
            // Armazena no cache quando o jogo terminar de carregar
            preloadFrame.onload = () => {
                gameCache.set(nextGame.id, true);
                // Removemos o iframe após o carregamento
                document.body.removeChild(preloadFrame);
            };
            
            // Adiciona temporariamente ao body para iniciar o carregamento
            document.body.appendChild(preloadFrame);
        }
    }
    
    // Configura eventos para os controles do carrossel já existentes no HTML
    if (nextGameBtn) {
        utils.addEvent(nextGameBtn, 'click', nextGame);
        nextGameBtn.setAttribute('aria-label', 'Próximo jogo');
        nextGameBtn.setAttribute('role', 'button');
        nextGameBtn.setAttribute('tabindex', '0');
    }
    
    if (prevGameBtn) {
        utils.addEvent(prevGameBtn, 'click', prevGame);
        prevGameBtn.setAttribute('aria-label', 'Jogo anterior');
        prevGameBtn.setAttribute('role', 'button');
        prevGameBtn.setAttribute('tabindex', '0');
    }
    
    // Configura os eventos para os pontos indicadores
    if (carouselDots.length > 0) {
        carouselDots.forEach((dot, index) => {
            utils.addEvent(dot, 'click', function() {
                const targetIndex = parseInt(this.dataset.index);
                if (!isNaN(targetIndex) && targetIndex !== currentGameIndex) {
                    changeGame(targetIndex);
                }
            });
            
            // Melhora acessibilidade
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Selecionar jogo ${index + 1}`);
            dot.setAttribute('tabindex', '0');
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dot.click();
                }
            });
        });
    }
    
    // Atualiza o título e instruções do jogo atual
    updateGameInfo(availableGames[currentGameIndex]);
    
    // Carrega o primeiro jogo automaticamente
    loadGame(availableGames[currentGameIndex].url);
    
    // Tenta pré-carregar o próximo jogo
    setTimeout(preloadNextGame, 3000);
    
    // Implementa a funcionalidade de tela cheia
    if (fullscreenBtn && gamePlayerWrapper) {
        utils.addEvent(fullscreenBtn, 'click', function() {
            toggleFullscreen(gamePlayerWrapper, fullscreenBtn);
        });
        
        // Melhora acessibilidade
        fullscreenBtn.setAttribute('role', 'button');
        fullscreenBtn.setAttribute('aria-label', 'Alternar tela cheia');
        fullscreenBtn.setAttribute('tabindex', '0');
        fullscreenBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fullscreenBtn.click();
            }
        });
        
        // Monitora mudanças no estado de tela cheia
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
        document.addEventListener('mozfullscreenchange', updateFullscreenButton);
        document.addEventListener('MSFullscreenChange', updateFullscreenButton);
        
        function updateFullscreenButton() {
            const isFullScreen = !!document.fullscreenElement;
            fullscreenBtn.innerHTML = isFullScreen
                ? '<i class="fas fa-compress"></i>'
                : '<i class="fas fa-expand"></i>';
            fullscreenBtn.setAttribute('aria-label', isFullScreen ? 'Sair da tela cheia' : 'Entrar em tela cheia');
        }
    }
    
    // Implementa a funcionalidade de ligar/desligar som
    if (soundToggleBtn && gameFrame) {
        let soundOn = true;
        
        utils.addEvent(soundToggleBtn, 'click', function() {
            soundOn = !soundOn;
            
            // Atualiza o ícone do botão
            this.innerHTML = soundOn 
                ? '<i class="fas fa-volume-up"></i>'
                : '<i class="fas fa-volume-mute"></i>';
            
            // Atualiza label acessível
            this.setAttribute('aria-label', soundOn ? 'Desativar som' : 'Ativar som');
            
            // Envia mensagem para o iframe do jogo para desligar o som
            try {
                gameFrame.contentWindow.postMessage({ type: 'sound', value: soundOn }, '*');
            } catch (error) {
                console.error('Erro ao enviar mensagem para o iframe:', error);
            }
        });
        
        // Melhora acessibilidade
        soundToggleBtn.setAttribute('role', 'button');
        soundToggleBtn.setAttribute('aria-label', 'Desativar som');
        soundToggleBtn.setAttribute('tabindex', '0');
        soundToggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                soundToggleBtn.click();
            }
        });
    }
    
    // Carrega um jogo com tratamento de erros aprimorado
    function loadGame(gameUrl) {
        if (isChangingGame) return;
        
        isChangingGame = true;
        
        // Verifica se o jogo está no cache
        const gameId = availableGames.find(game => game.url === gameUrl)?.id;
        const isCached = gameId && gameCache.has(gameId);
        
        // Mostra o overlay de carregamento
            if (loadingOverlay) {
                const loadingText = loadingOverlay.querySelector('p');
            if (loadingText) {
                loadingText.textContent = isCached 
                    ? 'Carregando jogo (pré-carregado)...' 
                    : 'Carregando jogo...';
            }
            loadingOverlay.style.display = 'flex';
        }
        
        // Contador de tempo para carregar
        let loadingTime = 0;
        const loadingTimer = setInterval(() => {
            loadingTime += 500;
            // Após 10 segundos, mostra mensagem de carregamento lento
            if (loadingTime === 10000 && loadingOverlay) {
                const loadingText = loadingOverlay.querySelector('p');
                if (loadingText) {
                    loadingText.textContent = 'O carregamento está demorando mais que o esperado...';
                }
            }
        }, 500);
        
        // Gerenciamento de recursos para manter a performance
        if (gameFrame.src) {
            // Libera memória do jogo atual antes de carregar o novo
            try {
                gameFrame.contentWindow.postMessage({ type: 'pause' }, '*');
            } catch (e) {
                // Ignora erros de comunicação de postMessage
            }
        }
        
        // Reset dos estados do iframe
        gameFrame.onload = null;
        gameFrame.onerror = null;
        
        // Cria um timeout para casos de carregamento muito lento ou com falha
        const loadTimeout = setTimeout(() => {
            if (loadingOverlay && loadingOverlay.style.display === 'flex') {
                handleLoadingError();
            }
        }, 30000);
        
        // Trata sucesso de carregamento
        utils.addEvent(gameFrame, 'load', function onGameLoad() {
            clearInterval(loadingTimer);
            clearTimeout(loadTimeout);
            
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            isChangingGame = false;
            
            // Remove o event listener após ser chamado
            gameFrame.removeEventListener('load', onGameLoad);
            
            // Tenta pré-carregar o próximo jogo após um intervalo
            setTimeout(preloadNextGame, 3000);
        });
        
        // Trata erro de carregamento
        gameFrame.onerror = handleLoadingError;
        
        function handleLoadingError() {
            clearInterval(loadingTimer);
            clearTimeout(loadTimeout);
            
            if (loadingOverlay) {
                const loadingText = loadingOverlay.querySelector('p');
                if (loadingText) {
                    loadingText.textContent = 'Erro ao carregar o jogo. Tente novamente.';
                }
                
                // Adiciona botão de tentar novamente
                const retryButton = document.createElement('button');
                retryButton.textContent = 'Tentar Novamente';
                retryButton.className = 'retry-btn';
                retryButton.onclick = function() {
                    // Tenta carregar novamente
                    loadGame(gameUrl);
                };
                
                // Remove botão anterior se existir
                const existingRetryBtn = loadingOverlay.querySelector('.retry-btn');
                if (existingRetryBtn) existingRetryBtn.remove();
                
                loadingOverlay.appendChild(retryButton);
            }
            
            isChangingGame = false;
        }
        
        // Inicia o carregamento do jogo
        gameFrame.src = gameUrl;
    }
    
    // Função para mudar para o próximo jogo
    function nextGame() {
        if (isChangingGame) return;
        
        currentGameIndex = (currentGameIndex + 1) % availableGames.length;
        changeGame(currentGameIndex);
    }
    
    // Função para mudar para o jogo anterior
    function prevGame() {
        if (isChangingGame) return;
        
        currentGameIndex = (currentGameIndex - 1 + availableGames.length) % availableGames.length;
        changeGame(currentGameIndex);
    }
    
    // Função para mudar o jogo atual
    function changeGame(index) {
        if (isChangingGame || index === currentGameIndex) return;
        
        currentGameIndex = index;
        const game = availableGames[index];
        
        // Atualiza interface e carrega o novo jogo
        updateGameInfo(game);
        loadGame(game.url);
        updateGameIndicators();
        
        // Anuncia mudança para leitores de tela
        announceGameChange(game.title);
    }
    
    // Anuncia mudança de jogo para leitores de tela
    function announceGameChange(gameTitle) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = `Carregando jogo: ${gameTitle}`;
        document.body.appendChild(announcement);
        
        // Remove após a leitura
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 3000);
    }
    
    // Atualiza os indicadores do carrossel
    function updateGameIndicators() {
        carouselDots.forEach((dot, index) => {
            if (index === currentGameIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-selected', 'true');
            } else {
                dot.classList.remove('active');
                dot.setAttribute('aria-selected', 'false');
            }
        });
    }
    
    // Função para atualizar as informações do jogo
    function updateGameInfo(game) {
        // Atualiza o título do jogo
        const gameTitle = document.querySelector('.game-title-area h4');
        if (gameTitle) {
            gameTitle.textContent = game.title;
        }
        
        // Atualiza as instruções do jogo
        const instructionsContainer = document.querySelector('.game-instructions');
        if (instructionsContainer && game.instructions) {
            // Limpa as instruções anteriores
            instructionsContainer.innerHTML = '';
            
            // Adiciona título das instruções
            const instructionsTitle = document.createElement('h5');
            instructionsTitle.textContent = 'Como jogar:';
            instructionsContainer.appendChild(instructionsTitle);
            
            // Adiciona lista de instruções
            const instructionsList = document.createElement('ul');
            instructionsList.className = 'instructions-list';
            
            game.instructions.forEach(instruction => {
                const item = document.createElement('li');
                item.innerHTML = `<i class="${instruction.icon}"></i> ${instruction.text}`;
                instructionsList.appendChild(item);
            });
            
            instructionsContainer.appendChild(instructionsList);
        }
        
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
    
    // Adiciona suporte a navegação por teclado para o player
    gamePlayerWrapper?.setAttribute('tabindex', '0');
    
    // Suporte a teclas de navegação
    document.addEventListener('keydown', (e) => {
        if (!gamePlayerWrapper?.contains(document.activeElement) && 
            document.activeElement !== gamePlayerWrapper) {
            return;
        }
        
        switch (e.key) {
            case 'ArrowRight':
                if (nextGameBtn) nextGameBtn.click();
                break;
            case 'ArrowLeft':
                if (prevGameBtn) prevGameBtn.click();
                break;
            case 'f':
                if (fullscreenBtn) fullscreenBtn.click();
                break;
            case 'm':
                if (soundToggleBtn) soundToggleBtn.click();
                break;
        }
    });
}

// Função auxiliar para alternar o modo de tela cheia
function toggleFullscreen(element, button) {
    if (!document.fullscreenElement) {
        // Entra em modo de tela cheia
        try {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) { // Firefox
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) { // IE/Edge
                element.msRequestFullscreen();
            }
            if (button) button.innerHTML = '<i class="fas fa-compress"></i>';
        } catch (e) {
            console.error('Erro ao entrar em modo de tela cheia:', e);
        }
    } else {
        // Sai do modo de tela cheia
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            if (button) button.innerHTML = '<i class="fas fa-expand"></i>';
        } catch (e) {
            console.error('Erro ao sair do modo de tela cheia:', e);
        }
    }
}

// Carrega imagens com fallback
function loadImageWithFallback() {
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
            dashDashCard = heading.closest('.project-card');
        }
    });
    
    if (dashDashCard) {
        const cardImage = dashDashCard.querySelector('.game-thumbnail');
        if (!cardImage) return;
        
        // Usa nossa utility function para carregar a imagem com fallback
        utils.loadImage(
            cardImage,
            dashDashAttackUrls[0],
            dashDashAttackUrls.slice(1),
            (img) => {
                // Sucesso
                img.style.opacity = '1';
                img.classList.add('loaded');
            },
            (img) => {
                // Falha em todas as tentativas
                img.src = 'assets/images/placeholder.jpg';
                img.classList.add('error');
                console.warn('Não foi possível carregar nenhuma das imagens do Dash Dash Attack');
            }
        );
    }
    
    // Também otimiza todas as outras imagens de jogos
    document.querySelectorAll('.game-thumbnail').forEach(img => {
        if (!img.classList.contains('loaded') && img !== dashDashCard?.querySelector('.game-thumbnail')) {
            // Adiciona loading lazy para melhorar performance
            img.loading = 'lazy';
            
            // Adiciona evento de erro para tratar falhas
            img.onerror = function() {
                this.src = 'assets/images/placeholder.jpg';
                this.classList.add('error');
            };
            
            // Adiciona animação de carregamento
            img.onload = function() {
                this.classList.add('loaded');
            };
        }
    });
}

// Função para corrigir o estilo da seta de rolagem
function fixScrollArrow() {
    // Estiliza o elemento scroll-down (seta para baixo na hero section)
    const scrollDown = document.querySelector('.scroll-down');
    if (scrollDown) {
        // Reorganiza a estrutura - primeiro movemos o texto para cima da seta
        const scrollLink = scrollDown.querySelector('a');
        const scrollText = scrollDown.querySelector('.scroll-text');
        const innerArrow = scrollDown.querySelector('.scroll-arrow');
        
        if (scrollLink && scrollText && innerArrow) {
            // Reordenar elementos: primeiro o texto, depois a seta
            scrollLink.innerHTML = '';
            scrollLink.appendChild(scrollText);
            scrollLink.appendChild(innerArrow);
            
            // Estiliza o texto
            scrollText.style.cssText = `
                margin-bottom: 10px !important;
                display: block !important;
                font-family: 'Press Start 2P', cursive !important;
                font-size: 0.8rem !important;
                color: #555555 !important;
                letter-spacing: 1px !important;
                text-transform: uppercase !important;
            `;
            
            // Limpa completamente o elemento de seta
            innerArrow.innerHTML = '';
            
            // Cria um elemento FontAwesome elegante sem fundo - AUMENTADO e com cor mais forte
            const icon = document.createElement('i');
            icon.className = 'fas fa-chevron-down';
            icon.style.cssText = `
                font-size: 36px !important;
                color: #FFD700 !important;
                filter: drop-shadow(0 2px 5px rgba(255,215,0,0.5)) !important;
                animation: bounce 2s infinite !important;
                display: block !important;
                background: transparent !important;
                font-weight: bold !important;
                text-shadow: 0 0 5px rgba(255,215,0,0.3) !important;
            `;
            
            innerArrow.appendChild(icon);
            
            // Remove qualquer estilo de fundo/borda do elemento pai
            innerArrow.style.cssText = `
                background-color: transparent !important;
                border: none !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 0 !important;
                width: auto !important;
                height: auto !important;
                transform: none !important;
                border-radius: 0 !important;
                position: relative !important;
                box-shadow: none !important;
            `;
            
            // Garante que a animação de bounce seja aplicada corretamente
            const styleAnimation = document.createElement('style');
            styleAnimation.textContent = `
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-10px);
                    }
                    60% {
                        transform: translateY(-5px);
                    }
                }
                
                .scroll-down .scroll-arrow i {
                    animation: bounce 2s infinite !important;
                }
                
                /* Reseta qualquer estilo de borda ou fundo */
                .scroll-down .scroll-arrow {
                    background: transparent !important;
                    border: none !important;
                    transform: none !important;
                }
            `;
            document.head.appendChild(styleAnimation);
        }
    }
    
    // Corrige as setas horizontais (prev/next) nos carrosséis de portfólio, EXCETO jogos pessoais
    const portfolioContainers = document.querySelectorAll('.portfolio-scroll-container');
    portfolioContainers.forEach(container => {
        const parentCategory = container.closest('.portfolio-category');
        const isCategoryPessoais = parentCategory && 
            parentCategory.querySelector('h3 i.fas.fa-heart') !== null;
        
        // Pula este container se for a seção de jogos pessoais - trataremos separadamente
        if (isCategoryPessoais) {
            return;
        }
        
        // Estilo padrão para outras seções
        // Corrige a seta "prev" (anterior)
        const prevButton = container.querySelector('.scroll-arrow.prev');
        if (prevButton) {
            // Limpa completamente o botão
            prevButton.innerHTML = '';
            
            // Remove qualquer rotação ou pseudoelementos que possam estar afetando a aparência
            prevButton.style.transform = 'none';
            prevButton.style.setProperty('--after-display', 'none');
            prevButton.style.setProperty('--before-display', 'none');
            prevButton.style.setProperty('&:after', 'display: none !important');
            prevButton.style.setProperty('&:before', 'display: none !important');

            // Garante formato perfeitamente circular
            const size = '38px'; // 30% menor que 54px
            prevButton.style.cssText += `
                width: ${size} !important;
                height: ${size} !important;
                min-width: ${size} !important;
                min-height: ${size} !important;
                max-width: ${size} !important;
                max-height: ${size} !important;
                border-radius: 50% !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                background-color: #333333 !important;
                position: relative !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
                margin: 0 10px !important;
                transform: none !important;
                overflow: visible !important;
            `;
            
            // Cria uma nova seta limpa apontando perfeitamente para a ESQUERDA - AUMENTADA em 30%
            const arrowElement = document.createElement('div');
            // Garante que não haja rotação no elemento da seta
            arrowElement.style.cssText = `
                transform: none !important;
                display: block !important;
                width: 0 !important;
                height: 0 !important;
                border-top: 14px solid transparent !important; // 30% maior que 11px
                border-right: 23px solid #333 !important; // 30% maior que 18px
                border-bottom: 14px solid transparent !important; // 30% maior que 11px
                position: relative !important;
                transition: transform 0.2s ease !important;
                padding: 0 !important;
                margin: 0 !important;
            `;
            
            prevButton.appendChild(arrowElement);
            
            // Adiciona efeito de hover sem rotação
            prevButton.addEventListener('mouseenter', () => {
                arrowElement.style.transform = 'scale(1.2) !important';
                prevButton.style.backgroundColor = '#444444 !important';
            });
            
            prevButton.addEventListener('mouseleave', () => {
                arrowElement.style.transform = 'none !important';
                prevButton.style.backgroundColor = '#333333 !important';
            });
        }
        
        // Corrige a seta "next" (próximo)
        const nextButton = container.querySelector('.scroll-arrow.next');
        if (nextButton) {
            // Limpa completamente o botão
            nextButton.innerHTML = '';
            
            // Remove qualquer rotação ou pseudoelementos que possam estar afetando a aparência
            nextButton.style.transform = 'none';
            nextButton.style.setProperty('--after-display', 'none');
            nextButton.style.setProperty('--before-display', 'none');
            nextButton.style.setProperty('&:after', 'display: none !important');
            nextButton.style.setProperty('&:before', 'display: none !important');

            // Garante formato perfeitamente circular
            const size = '38px'; // 30% menor que 54px
            nextButton.style.cssText += `
                width: ${size} !important;
                height: ${size} !important;
                min-width: ${size} !important;
                min-height: ${size} !important;
                max-width: ${size} !important;
                max-height: ${size} !important;
                border-radius: 50% !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                background-color: #333333 !important;
                position: relative !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
                margin: 0 10px !important;
                transform: none !important;
                overflow: visible !important;
            `;
            
            // Cria uma nova seta limpa apontando perfeitamente para a DIREITA - AUMENTADA em 30%
            const arrowElement = document.createElement('div');
            // Garante que não haja rotação no elemento da seta
            arrowElement.style.cssText = `
                transform: none !important;
                display: block !important;
                width: 0 !important;
                height: 0 !important;
                border-top: 14px solid transparent !important; // 30% maior que 11px
                border-left: 23px solid #333 !important; // 30% maior que 18px
                border-bottom: 14px solid transparent !important; // 30% maior que 11px
                position: relative !important;
                transition: transform 0.2s ease !important;
                padding: 0 !important;
                margin: 0 !important;
            `;
            
            nextButton.appendChild(arrowElement);
            
            // Adiciona efeito de hover sem rotação
            nextButton.addEventListener('mouseenter', () => {
                arrowElement.style.transform = 'scale(1.2) !important';
                nextButton.style.backgroundColor = '#444444 !important';
            });
            
            nextButton.addEventListener('mouseleave', () => {
                arrowElement.style.transform = 'none !important';
                nextButton.style.backgroundColor = '#333333 !important';
            });
        }
    });
    
    // ESTILO PERSONALIZADO PARA AS SETAS DA SEÇÃO DE JOGOS PESSOAIS
    const pessoaisSection = document.querySelector('.portfolio-category h3 i.fas.fa-heart')?.closest('.portfolio-category');
    if (pessoaisSection) {
        const pessoaisContainer = pessoaisSection.querySelector('.portfolio-scroll-container');
        if (pessoaisContainer) {
            // Primeiro, vamos remover os botões antigos completamente
            const oldPrevButton = pessoaisContainer.querySelector('.scroll-arrow.prev');
            const oldNextButton = pessoaisContainer.querySelector('.scroll-arrow.next');
            
            if (oldPrevButton) oldPrevButton.remove();
            if (oldNextButton) oldNextButton.remove();
            
            // Agora criamos novos botões do zero
            const prevButton = document.createElement('button');
            prevButton.className = 'scroll-arrow prev';
            prevButton.setAttribute('aria-label', 'Itens anteriores');
            prevButton.setAttribute('role', 'button');
            prevButton.setAttribute('tabindex', '0');
            
            const nextButton = document.createElement('button');
            nextButton.className = 'scroll-arrow next';
            nextButton.setAttribute('aria-label', 'Próximos itens');
            nextButton.setAttribute('role', 'button');
            nextButton.setAttribute('tabindex', '0');
            
            // Definimos um estilo garantindo que o botão seja perfeitamente circular
            const buttonStyle = `
                box-sizing: border-box !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                width: 50px !important;
                height: 50px !important;
                aspect-ratio: 1 / 1 !important;
                border-radius: 50% !important;
                background-color: #333333 !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
                cursor: pointer !important;
                margin: 0 10px !important;
                border: none !important;
                padding: 0 !important;
                position: relative !important;
                z-index: 5 !important;
                transform: none !important;
                overflow: hidden !important;
                flex-shrink: 0 !important;
                flex-grow: 0 !important;
                transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease !important;
            `;
            
            // Aplica o estilo diretamente ao elemento DOM para garantir que não seja sobrescrito
            prevButton.style.cssText = buttonStyle;
            nextButton.style.cssText = buttonStyle;
            
            // Criar ícones FontAwesome com cores claras
            const prevIcon = document.createElement('i');
            prevIcon.className = 'fas fa-chevron-left';
            prevIcon.style.cssText = `
                font-size: 24px !important;
                color: #F5CB40 !important;
                transform: none !important;
                line-height: 1 !important;
            `;
            
            const nextIcon = document.createElement('i');
            nextIcon.className = 'fas fa-chevron-right';
            nextIcon.style.cssText = `
                font-size: 24px !important;
                color: #F5CB40 !important;
                transform: none !important;
                line-height: 1 !important;
            `;
            
            // Limpa qualquer conteúdo existente e adiciona apenas o ícone
            prevButton.innerHTML = '';
            nextButton.innerHTML = '';
            prevButton.appendChild(prevIcon);
            nextButton.appendChild(nextIcon);
            
            // Adiciona estilos CSS globais para forçar a forma circular e prevenir deformação
            const styleCircular = document.createElement('style');
            styleCircular.textContent = `
                .scroll-arrow.prev,
                .scroll-arrow.next {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 50px !important;
                    height: 50px !important;
                    aspect-ratio: 1 / 1 !important;
                    border-radius: 50% !important;
                    flex-shrink: 0 !important;
                    flex-grow: 0 !important;
                    padding: 0 !important;
                }
            `;
            document.head.appendChild(styleCircular);
            
            // Adicionar no início e fim do container
            pessoaisContainer.insertBefore(prevButton, pessoaisContainer.firstChild);
            pessoaisContainer.appendChild(nextButton);
            
            // Recriar os event listeners
            prevButton.addEventListener('click', function() {
                const scrollContainer = this.parentElement.querySelector('.portfolio-scroll');
                if (!scrollContainer) return;
                
                const cardWidth = 320; // Largura aproximada de um card + gap
                const visibleItems = Math.max(1, Math.floor(scrollContainer.clientWidth / cardWidth));
                const scrollAmount = visibleItems * cardWidth;
                
                scrollContainer.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });
            
            nextButton.addEventListener('click', function() {
                const scrollContainer = this.parentElement.querySelector('.portfolio-scroll');
                if (!scrollContainer) return;
                
                const cardWidth = 320; // Largura aproximada de um card + gap
                const visibleItems = Math.max(1, Math.floor(scrollContainer.clientWidth / cardWidth));
                const scrollAmount = visibleItems * cardWidth;
                
                scrollContainer.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });
            
            // Efeitos de hover limpos
            prevButton.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#444444';
                this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
                this.style.transform = 'translateY(-2px)';
                prevIcon.style.color = '#FFFFFF';
            });
            
            prevButton.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#333333';
                this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                this.style.transform = 'none';
                prevIcon.style.color = '#F5CB40';
            });
            
            nextButton.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#444444';
                this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
                this.style.transform = 'translateY(-2px)';
                nextIcon.style.color = '#FFFFFF';
            });
            
            nextButton.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#333333';
                this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                this.style.transform = 'none';
                nextIcon.style.color = '#F5CB40';
            });
            
            // Adicionar funções de atualização de estado
            const scrollContainer = pessoaisContainer.querySelector('.portfolio-scroll');
            if (scrollContainer) {
                const updateButtons = function() {
                    const scrollLeft = scrollContainer.scrollLeft;
                    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth - 5;
                    
                    if (scrollLeft <= 5) {
                        prevButton.style.opacity = '0.4';
                        prevButton.style.pointerEvents = 'none';
                        prevButton.setAttribute('aria-disabled', 'true');
                    } else {
                        prevButton.style.opacity = '1';
                        prevButton.style.pointerEvents = 'auto';
                        prevButton.setAttribute('aria-disabled', 'false');
                    }
                    
                    if (scrollLeft >= maxScrollLeft) {
                        nextButton.style.opacity = '0.4';
                        nextButton.style.pointerEvents = 'none';
                        nextButton.setAttribute('aria-disabled', 'true');
                    } else {
                        nextButton.style.opacity = '1';
                        nextButton.style.pointerEvents = 'auto';
                        nextButton.setAttribute('aria-disabled', 'false');
                    }
                };
                
                // Atualizar os botões inicialmente
                updateButtons();
                
                // Atualizar ao rolar
                scrollContainer.addEventListener('scroll', updateButtons);
                
                // Atualizar em caso de redimensionamento
                window.addEventListener('resize', updateButtons);
            }
        }
    }
    
    // Ainda adiciona os estilos globais para reset de pseudo-elementos e rotações
    const style = document.createElement('style');
    style.textContent = `
        /* Reset para todas as setas */
        .scroll-arrow:before, .scroll-arrow:after {
            content: none !important;
            display: none !important;
        }
        
        /* Exceção para a seta de baixo na hero section */
        .scroll-down .scroll-arrow {
            transform: rotate(45deg) !important;
        }
        
        /* Garante que NÃO haja rotação diagonal nas setas de navegação */
        .portfolio-category .scroll-arrow.prev,
        .portfolio-category .scroll-arrow.next {
            all: revert;
            transform: none !important;
            rotate: 0deg !important;
            -webkit-transform: none !important;
            -moz-transform: none !important;
            -ms-transform: none !important;
            -o-transform: none !important;
            transform-origin: center center !important;
        }
        
        /* Garantir que não haja pseudo-elementos nos novos botões */
        .portfolio-category .scroll-arrow.prev::before, 
        .portfolio-category .scroll-arrow.prev::after,
        .portfolio-category .scroll-arrow.next::before,
        .portfolio-category .scroll-arrow.next::after {
            content: none !important;
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Adiciona estilos para os cartões de jogos
function fixGameCards() {
    // Seleciona todos os cartões de projetos
    const projectCards = document.querySelectorAll('.project-card');
    
    // Estilo para aplicar em todos os cartões
    const styleCards = document.createElement('style');
    styleCards.textContent = `
        /* Estilo base para todos os cartões */
        .project-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            background-color: #222 !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
            border: none !important;
            position: relative !important;
        }
        
        /* Efeito de hover para os cartões */
        .project-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(245, 203, 64, 0.1) !important;
        }
        
        /* Estilo para container interno */
        .card-inner {
            border-radius: 12px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            background: linear-gradient(145deg, #2a2a2a, #222) !important;
            overflow: hidden !important;
            position: relative !important;
        }
        
        /* Estilos específicos para cada tipo de jogo */
        .card-inner.pontuais-type {
            background: linear-gradient(145deg, #2a2a2a, #222) !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
        }
        
        .card-inner.pontuais-type::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 3px !important;
            background: linear-gradient(90deg, #ff6b6b, #ffa502) !important;
        }
        
        .card-inner.playables-type {
            background: linear-gradient(145deg, #2d2d3a, #222230) !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
        }
        
        .card-inner.playables-type::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 3px !important;
            background: linear-gradient(90deg, #70a1ff, #7bed9f) !important;
        }
        
        .card-inner.pessoais-type {
            background: linear-gradient(145deg, #2d2626, #221c1c) !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
        }
        
        .card-inner.pessoais-type::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 3px !important;
            background: linear-gradient(90deg, #ff7f50, #F5CB40) !important;
        }
        
        /* Ajusta o conteúdo do cartão para ficar mais elegante */
        .project-content {
            padding: 18px !important;
            background-color: rgba(34, 34, 34, 0.95) !important;
            position: relative !important;
            z-index: 1 !important;
            border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        
        .project-content::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 20px !important;
            background: linear-gradient(to bottom, rgba(0,0,0,0.1), transparent) !important;
            z-index: 0 !important;
            pointer-events: none !important;
        }
        
        .project-content h3 {
            color: #fff !important;
            margin-top: 6px !important;
            margin-bottom: 10px !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            position: relative !important;
            display: inline-block !important;
        }
        
        .project-content h3::after {
            content: '' !important;
            position: absolute !important;
            bottom: -4px !important;
            left: 0 !important;
            width: 40px !important;
            height: 2px !important;
            background: #F5CB40 !important;
            transition: width 0.3s ease !important;
        }
        
        .project-card:hover .project-content h3::after {
            width: 100% !important;
        }
        
        .project-content p {
            color: #aaa !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-top: 12px !important;
        }
        
        /* Estiliza as tags de tecnologia */
        .project-tags {
            margin-bottom: 8px !important;
        }
        
        .project-tags span {
            background-color: rgba(51, 51, 51, 0.7) !important;
            color: #F5CB40 !important;
            border-radius: 30px !important;
            padding: 4px 10px !important;
            font-size: 11px !important;
            font-weight: 500 !important;
            letter-spacing: 0.5px !important;
            margin-right: 6px !important;
            display: inline-block !important;
            margin-bottom: 6px !important;
            border: 1px solid rgba(245, 203, 64, 0.2) !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
            transition: all 0.2s ease !important;
        }
        
        .project-tags span:hover {
            background-color: rgba(245, 203, 64, 0.15) !important;
            transform: translateY(-2px) !important;
        }
        
        /* Melhora a visualização da imagem */
        .project-image {
            position: relative !important;
            overflow: hidden !important;
            aspect-ratio: 16/9 !important;
        }
        
        .project-image::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent 40%, transparent 60%, rgba(0,0,0,0.3)) !important;
            z-index: 1 !important;
            pointer-events: none !important;
        }
        
        .project-image img {
            transition: transform 0.7s ease, filter 0.5s ease !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            filter: brightness(0.9) !important;
        }
        
        .project-card:hover .project-image img {
            transform: scale(1.08) !important;
            filter: brightness(1.05) !important;
        }
        
        /* Estiliza o overlay e os ícones */
        .project-overlay {
            background: rgba(0, 0, 0, 0.6) !important;
            opacity: 0 !important;
            transition: opacity 0.4s ease !important;
            backdrop-filter: blur(2px) !important;
            -webkit-backdrop-filter: blur(2px) !important;
            z-index: 2 !important;
        }
        
        .project-card:hover .project-overlay {
            opacity: 1 !important;
        }
        
        /* Ícones de tecnologia no rodapé */
        .project-tech {
            margin-top: 15px !important;
            border-top: 1px dashed rgba(255, 255, 255, 0.1) !important;
            padding-top: 12px !important;
            display: flex !important;
            flex-wrap: wrap !important;
        }
        
        .tech-icon {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 32px !important;
            height: 32px !important;
            background: radial-gradient(circle at 30% 30%, #444, #333) !important;
            border-radius: 50% !important;
            margin-right: 10px !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease !important;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
            position: relative !important;
            z-index: 1 !important;
        }
        
        .tech-icon::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 50% !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), inset 0 -1px 1px rgba(0, 0, 0, 0.3) !important;
            z-index: -1 !important;
        }
        
        .tech-icon i {
            color: #F5CB40 !important;
            font-size: 16px !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
        }
        
        .tech-icon:hover {
            transform: translateY(-4px) rotate(10deg) !important;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(245, 203, 64, 0.3) !important;
        }
    `;
    
    document.head.appendChild(styleCards);
    
    // Garantir que o botão de play tenha um visual destacado
    const stylePlayButton = document.createElement('style');
    stylePlayButton.textContent = `
        .overlay-content {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            width: 100% !important;
            position: relative !important;
        }
        
        .overlay-content::before {
            content: '' !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            width: 80px !important;
            height: 80px !important;
            border-radius: 50% !important;
            background: radial-gradient(circle, rgba(245, 203, 64, 0.2), transparent 70%) !important;
            transform: translate(-50%, -50%) !important;
            animation: pulse-light 2s infinite !important;
        }
        
        @keyframes pulse-light {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.3; }
            100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; }
        }
        
        .overlay-content .project-link {
            background: radial-gradient(circle at 30% 30%, #F5CB40, #e6af12) !important;
            color: #111 !important;
            border-radius: 50% !important;
            width: 50px !important;
            height: 50px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease !important;
            box-shadow: 0 0 20px rgba(245, 203, 64, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.5), inset 0 -2px 2px rgba(0, 0, 0, 0.3) !important;
            position: relative !important;
            z-index: 3 !important;
        }
        
        .overlay-content .project-link:hover {
            transform: scale(1.2) !important;
            box-shadow: 0 0 30px rgba(245, 203, 64, 0.9), 0 0 10px rgba(255, 255, 255, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.5), inset 0 -2px 2px rgba(0, 0, 0, 0.3) !important;
        }
        
        .overlay-content .project-link i {
            font-size: 20px !important;
            color: #111 !important;
            text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3) !important;
        }
        
        .game-engine {
            background-color: rgba(0, 0, 0, 0.7) !important;
            color: #fff !important;
            padding: 6px 12px !important;
            border-radius: 20px !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            letter-spacing: 0.5px !important;
            display: inline-block !important;
            margin-bottom: 20px !important;
            backdrop-filter: blur(4px) !important;
            -webkit-backdrop-filter: blur(4px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
        }
        
        .game-engine i {
            margin-right: 6px !important;
            color: #F5CB40 !important;
        }
    `;
    
    document.head.appendChild(stylePlayButton);
}
