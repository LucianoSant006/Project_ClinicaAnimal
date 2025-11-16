//  NAVBAR
/* --- Funções para o Modal de Pets --- */

function openModal(modalId) {
    // Esconde qualquer outro modal que possa estar aberto
    var modals = document.querySelectorAll('.modal-container');
    modals.forEach(function(modal) {
        modal.style.display = 'none';
    });
    
    // Abre o modal específico
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Event listener para fechar o modal clicando fora da área de conteúdo
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-container')) {
        event.target.style.display = 'none';
    }
});
const navbar = document.querySelector("nav");
window.addEventListener("scroll", () =>
    navbar.classList.toggle("sticky", window.scrollY > 0)
);

/* * CORREÇÃO DE BUG 1:
 * Você estava tentando selecionar a tag <menu>, que não existe no seu HTML.
 * O correto é selecionar a DIV com a *classe* ".menu".
*/
const menu = document.querySelector(".menu"); // <-- MUDANÇA AQUI
const toggleMenu = () => menu.classList.toggle("active");

document.querySelector(".menu-btn").addEventListener("click", toggleMenu);
document.querySelector(".close-btn").addEventListener("click", toggleMenu);

document
    .querySelectorAll(".menu a")
    .forEach((link) => link.addEventListener("click", toggleMenu));

// Lenis Smooth Scrolling
const lenis = new Lenis();
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
};
requestAnimationFrame(raf);
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


// Scroll Reveal
const sr = ScrollReveal({
    origin: "bottom",
    distance: "40px",
    duration: 800,
    delay: 200,
    easing: "ease-in-out",
});

gsap.to("nav", {
    opacity: 1,
    duration: 2,
});
sr.reveal(".hero-headlines h1");
sr.reveal(".hero-headlines p", { delay: 500 });
sr.reveal(".hero-headlines-buttons", { delay: 1000 });
gsap.from(".hero-imagens img", {
    opacity: 0,
    duration: 1,
    stagger: 0.5,
});
sr.reveal(".requirements-headlines h1");
sr.reveal(".requirements-headlines p", { delay: 500 });
sr.reveal(".requirements img", { delay: 500 });
sr.reveal(".r-item-container", { delay: 1000 });
sr.reveal(".pets-headlines");
sr.reveal(".pet-item h3");
sr.reveal(".sobre-headlines");
sr.reveal(".sobre img");
sr.reveal(".testimunhas h1", { delay: 500 });
sr.reveal(".testimunhas h6");
sr.reveal(".testimunhas-item", { delay: 1000 });
sr.reveal(".footer-brand");
sr.reveal(".footer-links", { delay: 500, origin: "left" });
// MUDANÇA: Adicionando a animação para a nova seção de doação
sr.reveal(".footer-doacao", { delay: 500, origin: "bottom" });
sr.reveal(".footer-contato-info", { delay: 500, origin: "right" });
sr.reveal(".copyright", { delay: 600 });


// GSAP Hero Animation
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.create({
    trigger: ".heropage",
    start: "top center",
    end: "center center",
    scrub: 1,
    onToggle: (self) => {
        if (self.isActive) {
            gsap.to(".hero-imagens img", { scale: 1, gap: "664px", duration: 0.5 });
        } else {
            gsap.to(".hero-imagens img", {
                scale: "1.2",
                gap: "35px",
                duration: 0.5,
            });
        }
    },
});


// GSAP Text Reveal
const splitTypes = document.querySelectorAll(".reveal-type");
splitTypes.forEach((char, i) => {
    const bg = char.dataset.bgColor;
    const fg = char.dataset.fgColor;

    /* * CORREÇÃO DE BUG 2:
     * O nome da biblioteca que você importou é "SplitType" (no singular).
     * Usar "SplitTypes" (com 's') causaria um erro.
    */
    const text = new SplitType(char, { type: "chars" }); // <-- MUDANÇA AQUI

    gsap.fromTo(
        text.chars,
        {
            color: bg,
        },
        {
            
            color: fg,
            duration: 0.3,
            stagger: 0.02,
            scrollTrigger: {
                trigger: char,
                start: "top 80%",
                end: "top 20%",
                scrub: true,
                markers: false,
                toggleActions: "play play reverse reverse",
            },
        }
    );
});

/* ============================================= */
/* FUNÇÃO PARA BUSCAR DADOS DO APOIA.SE      */
/* ============================================= */
document.addEventListener("DOMContentLoaded", () => {
    // URL da API pública do APOIA.se para seu usuário
    const API_URL =  "https://api.allorigins.win/raw?url=https://apoia.se/api/v1/users/projetoanimalcampinas";
    
    // Chaves para o cache no localStorage
    const CACHE_KEY = "apoiaSeData";
    const TIMESTAMP_KEY = "apoiaSeTimestamp";
    const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

    // Função para formatar valores em Reais (BRL)
    const formatBRL = (value) => {
        if (isNaN(value)) value = 0;
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Função principal para buscar e exibir os dados
    async function fetchApoiaSeData() {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(TIMESTAMP_KEY);
        const now = new Date().getTime();

        // 1. Tenta carregar do cache se for válido (menos de 24h)
        if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp) < ONE_DAY_MS)) {
            console.log("Carregando dados da campanha (do cache).");
            const data = JSON.parse(cachedData);
            updateCampaignUI(data);
            return;
        }

        // 2. Se o cache for inválido ou não existir, busca na API
        console.log("Buscando novos dados da campanha (da API).");
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            const data = await response.json();

            // Extrai os dados relevantes da primeira campanha
            const campaign = data.campaigns[0]; 
            if (!campaign) {
                throw new Error("Dados da campanha não encontrados na resposta da API.");
            }

            const campaignData = {
                raised: campaign.supports.total.value,
                goal: campaign.goals[0].value,
                supporters: campaign.supports.total.count
            };

            // 3. Salva os novos dados e o timestamp no cache
            localStorage.setItem(CACHE_KEY, JSON.stringify(campaignData));
            localStorage.setItem(TIMESTAMP_KEY, now.toString());

            // 4. Atualiza a interface
            updateCampaignUI(campaignData);

        } // ... (dentro da função fetchApoiaSeData)
 catch (error) {
    console.error("Falha ao buscar ou atualizar dados da campanha:", error);
    
    // Se der erro, vamos avisar o usuário no HTML
    const campaignStatsContainer = document.querySelector(".campaign-stats");
    
    if (campaignStatsContainer) {
        // Remove o conteúdo "Carregando..." e insere uma mensagem de erro
        campaignStatsContainer.innerHTML = `
            <p style="color: #e74c3c; font-size: 1rem; padding: 20px;">
                <i class="fa-solid fa-circle-exclamation"></i>
                Não foi possível carregar os dados da campanha no momento.
            </p>
            <a href="https://apoia.se/projetoanimalcampinas" target="_blank" class="btn-3 btn-apoia-se">
                Ver Campanha no APOIA.se
            </a>
        `;
        // Aplica estilo ao botão que sobrou
        campaignStatsContainer.style.padding = "30px";
    }
}
    }

    // Função para atualizar o HTML com os dados
    function updateCampaignUI(data) {
        const { raised, goal, supporters } = data;
        const percentage = ((raised / goal) * 100).toFixed(1);

        // Seleciona os elementos no HTML
        const raisedEl = document.getElementById("campaign-raised");
        const goalEl = document.getElementById("campaign-goal");
        const percentageEl = document.getElementById("campaign-percentage");
        const supportersEl = document.getElementById("campaign-supporters");
        const progressEl = document.getElementById("campaign-progress");

        // Atualiza os valores e o estilo
        if (raisedEl) raisedEl.innerText = formatBRL(raised);
        if (goalEl) goalEl.innerText = formatBRL(goal);
        if (percentageEl) percentageEl.innerText = `${percentage}%`;
        if (supportersEl) supportersEl.innerText = supporters;
        
        if (progressEl) {
            // Garante que a barra não passe de 100%
            const progressWidth = Math.min(percentage, 100); 
            progressEl.style.width = `${progressWidth}%`;
        }
    }

    // Executa a função assim que a página carregar
    fetchApoiaSeData();
});