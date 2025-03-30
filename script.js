// Adiciona funcionalidade para fixar a navegação durante o scroll
const nav = document.querySelector('.nav-main');
const navSpacer = document.querySelector('.nav-spacer');
const navHeight = nav.offsetHeight;
const headerHeight = document.querySelector('header').offsetHeight;

window.addEventListener('scroll', function() {
    // Verifica se o usuário já rolou além do cabeçalho
    if (window.scrollY >= headerHeight) {
        nav.classList.add('fixed');
        navSpacer.classList.add('active');
    } else {
        nav.classList.remove('fixed');
        navSpacer.classList.remove('active');
    }
    
    // Controla o botão de voltar ao topo
    var backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
    
    // Identifica qual seção está visível e destaca o link correspondente
    highlightNavigation();
});

// Rolagem suave para as âncoras
document.querySelectorAll('.nav-main a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove a classe 'active' de todos os links
        document.querySelectorAll('.nav-main a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Adiciona a classe 'active' ao link clicado
        this.classList.add('active');
        
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
    const sections = document.querySelectorAll('section, h2[id], .panel[id], .contact-form[id]');
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
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection) {
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
