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

// Gerenciamento de filtros do portfólio
document.addEventListener('DOMContentLoaded', function() {
    // Filtros de portfólio
    const filterButtons = document.querySelectorAll('.portfolio-filters li');
    const projectCards = document.querySelectorAll('.project-card');
    
    // Verifica se existem botões de filtro e cards de projeto
    if (filterButtons.length > 0 && projectCards.length > 0) {
        // Adiciona o evento de clique para cada botão de filtro
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove a classe ativa de todos os botões
                filterButtons.forEach(btn => {
                    btn.classList.remove('filter-active');
                });
                
                // Adiciona a classe ativa ao botão clicado
                this.classList.add('filter-active');
                
                // Obtém o filtro selecionado
                const filterValue = this.getAttribute('data-filter');
                console.log('Filtro selecionado:', filterValue);
                
                // Filtra os projetos com base no filtro selecionado
                projectCards.forEach(card => {
                    if (filterValue === '*') {
                        card.style.display = 'block';
                    } else if (card.classList.contains(filterValue.substring(1))) { // Remove o ponto do início
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Gerenciamento do modal para jogos clicáveis
    const modal = document.getElementById('game-modal');
    const closeModal = document.querySelector('.close-modal');
    const gameIframe = document.getElementById('game-iframe');
    
    // Adiciona evento de clique para cada projeto playable
    const playableProjects = document.querySelectorAll('.filter-playables');
    if (playableProjects.length > 0 && modal && gameIframe) {
        playableProjects.forEach(project => {
            project.addEventListener('click', function() {
                // Aqui você poderia carregar o URL do jogo específico
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

    // Observa as estatísticas para animação
    observeStats();

    // Inicializar botão de download
    initDownloadButton();
});

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
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
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
        }, { threshold: 0.5 });
        
        observer.observe(statsContainer);
    }
};

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
