// ============================================================
//  Dados fixos dos livros (base original)
// ============================================================

const livrosFixos = [
    {
        id: 'LIV-001',
        titulo: 'Está chovendo estrelas',
        autor: 'Stephen King',
        capa: '../img/livro1.webp',
        genero: 'Terror',
        dataPublicacao: '1986',
        disponivel: true,
        resumo: 'Em Derry, Maine, um grupo de crianças conhecidas como "Os Otários" enfrenta uma criatura maligna que se disfarça de palhaço. Anos depois, já adultos, eles precisam voltar para cumprir uma promessa esquecida e enfrentar o mal novamente.'
    },
    {
        id: 'LIV-002',
        titulo: 'O Iluminado',
        autor: 'Stephen King',
        capa: '../img/livro2.webp',
        genero: 'Terror',
        dataPublicacao: '1977',
        disponivel: true,
        resumo: 'Jack Torrance aceita o emprego de zelador de inverno do Hotel Overlook, levando sua esposa e filho. O hotel, com seu passado sombrio, começa a despertar algo perturbador na família, especialmente no pequeno Danny, que possui um dom especial chamado "iluminado".'
    },
    {
        id: 'LIV-003',
        titulo: 'Misery',
        autor: 'Stephen King',
        capa: '../img/livro3.webp',
        genero: 'Terror',
        dataPublicacao: '1987',
        disponivel: true,
        resumo: 'O escritor Paul Sheldon sofre um grave acidente de carro e é resgatado por Annie Wilkes, sua maior fã. O que parece ser uma sorte logo se transforma em pesadelo, quando Annie descobre que Paul matou sua personagem favorita nos livros.'
    },
    {
        id: 'LIV-004',
        titulo: 'O Cemitério',
        autor: 'Stephen King',
        capa: '../img/livro4.webp',
        genero: 'Terror',
        dataPublicacao: '1983',
        disponivel: true,
        resumo: 'A família Creed se muda para uma casa perto de uma rodovia movimentada no Maine. Próximo à propriedade existe um cemitério de animais de estimação com poderes sombrios — qualquer coisa enterrada lá volta à vida, mas diferente do que era antes.'
    },
    {
        id: 'LIV-005',
        titulo: 'Shining',
        autor: 'Stephen King',
        capa: '../img/livro5.webp',
        genero: 'Terror',
        dataPublicacao: '1977',
        disponivel: true,
        resumo: 'Uma releitura sombria sobre isolamento, loucura e os fantasmas que carregamos dentro de nós. Uma família isolada em um hotel no inverno descobre que os verdadeiros monstros nem sempre são os que conseguimos ver.'
    },
    {
        id: 'LIV-006',
        titulo: 'Carrie',
        autor: 'Stephen King',
        capa: '../img/livro6.webp',
        genero: 'Terror',
        dataPublicacao: '1974',
        disponivel: true,
        resumo: 'Carrie White é uma adolescente tímida e isolada que sofre bullying na escola e opressão religiosa em casa. Quando ela descobre que possui poderes telecinéticos, os eventos culminam em uma noite de terror no baile de formatura.'
    },
    {
        id: 'LIV-007',
        titulo: 'A Torre Negra',
        autor: 'Stephen King',
        capa: '../img/livro7.webp',
        genero: 'Terror',
        dataPublicacao: '1982',
        disponivel: true,
        resumo: 'Roland Deschain é o último Pistoleiro, um herói solitário numa terra em decadência que segue o Homem de Preto em direção à misteriosa Torre Negra — o eixo de todos os universos e a chave para salvar a realidade.'
    },
    {
        id: 'LIV-008',
        titulo: 'O Visconde de Bragelonne',
        autor: 'Alexandre Dumas',
        capa: '../img/livro1.webp',
        genero: 'Drama',
        dataPublicacao: '1847',
        disponivel: true,
        resumo: 'A última e mais longa aventura dos Três Mosqueteiros. Athos, Aramis, Porthos e D\'Artagnan enfrentam seus últimos grandes desafios, envolvendo o homem da máscara de ferro e os destinos entrelaçados de toda uma geração.'
    },
    {
        id: 'LIV-009',
        titulo: 'Dom Quixote',
        autor: 'Miguel de Cervantes',
        capa: '../img/livro2.webp',
        genero: 'Drama',
        dataPublicacao: '1605',
        disponivel: true,
        resumo: 'Alonso Quijano, um fidalgo que leu tantos romances de cavalaria que enlouqueceu, decide se tornar cavaleiro andante com o nome Dom Quixote. Acompanhado de seu fiel escudeiro Sancho Pança, ele sai em busca de aventuras e justiça.'
    },
    {
        id: 'LIV-010',
        titulo: 'Os Miseráveis',
        autor: 'Victor Hugo',
        capa: '../img/livro3.webp',
        genero: 'Suspense',
        dataPublicacao: '1862',
        disponivel: true,
        resumo: 'Jean Valjean, após cumprir pena por roubar um pão, tenta reconstruir sua vida e se tornar um homem honesto. Perseguido pelo implacável Inspetor Javert, ele encontra redenção no amor e no sacrifício, em meio à agitação política da França do século XIX.'
    },
    {
        id: 'LIV-007',
        titulo: 'A Torre Negra',
        autor: 'Stephen King',
        capa: '../img/livro7.webp',
        genero: 'Suspense',
        dataPublicacao: '1982',
        disponivel: true,
        resumo: 'Roland Deschain é o último Pistoleiro, um herói solitário numa terra em decadência que segue o Homem de Preto em direção à misteriosa Torre Negra — o eixo de todos os universos e a chave para salvar a realidade.'
    },
    {
        id: 'LIV-008',
        titulo: 'O Visconde de Bragelonne',
        autor: 'Alexandre Dumas',
        capa: '../img/livro1.webp',
        genero: 'Suspense',
        dataPublicacao: '1847',
        disponivel: true,
        resumo: 'A última e mais longa aventura dos Três Mosqueteiros. Athos, Aramis, Porthos e D\'Artagnan enfrentam seus últimos grandes desafios, envolvendo o homem da máscara de ferro e os destinos entrelaçados de toda uma geração.'
    },
    {
        id: 'LIV-009',
        titulo: 'Dom Quixote',
        autor: 'Miguel de Cervantes',
        capa: '../img/livro2.webp',
        genero: 'Suspense',
        dataPublicacao: '1605',
        disponivel: true,
        resumo: 'Alonso Quijano, um fidalgo que leu tantos romances de cavalaria que enlouqueceu, decide se tornar cavaleiro andante com o nome Dom Quixote. Acompanhado de seu fiel escudeiro Sancho Pança, ele sai em busca de aventuras e justiça.'
    },
    {
        id: 'LIV-004',
        titulo: 'O Cemitério',
        autor: 'Stephen King',
        capa: '../img/livro4.webp',
        genero: 'Drama',
        dataPublicacao: '1983',
        disponivel: true,
        resumo: 'A família Creed se muda para uma casa perto de uma rodovia movimentada no Maine. Próximo à propriedade existe um cemitério de animais de estimação com poderes sombrios — qualquer coisa enterrada lá volta à vida, mas diferente do que era antes.'
    },
    {
        id: 'LIV-005',
        titulo: 'Shining',
        autor: 'Stephen King',
        capa: '../img/livro5.webp',
        genero: 'Drama',
        dataPublicacao: '1977',
        disponivel: true,
        resumo: 'Uma releitura sombria sobre isolamento, loucura e os fantasmas que carregamos dentro de nós. Uma família isolada em um hotel no inverno descobre que os verdadeiros monstros nem sempre são os que conseguimos ver.'
    },
    {
        id: 'LIV-006',
        titulo: 'Carrie',
        autor: 'Stephen King',
        capa: '../img/livro6.webp',
        genero: 'Drama',
        dataPublicacao: '1974',
        disponivel: true,
        resumo: 'Carrie White é uma adolescente tímida e isolada que sofre bullying na escola e opressão religiosa em casa. Quando ela descobre que possui poderes telecinéticos, os eventos culminam em uma noite de terror no baile de formatura.'
    },
    {
        id: 'LIV-006',
        titulo: 'Carrie',
        autor: 'Stephen King',
        capa: '../img/livro6.webp',
        genero: 'Suspense',
        dataPublicacao: '1974',
        disponivel: true,
        resumo: 'Carrie White é uma adolescente tímida e isolada que sofre bullying na escola e opressão religiosa em casa. Quando ela descobre que possui poderes telecinéticos, os eventos culminam em uma noite de terror no baile de formatura.'
    },
    {
        id: 'LIV-009',
        titulo: 'Dom Quixote',
        autor: 'Miguel de Cervantes',
        capa: '../img/livro2.webp',
        genero: 'Romance',
        dataPublicacao: '1605',
        disponivel: true,
        resumo: 'Alonso Quijano, um fidalgo que leu tantos romances de cavalaria que enlouqueceu, decide se tornar cavaleiro andante com o nome Dom Quixote. Acompanhado de seu fiel escudeiro Sancho Pança, ele sai em busca de aventuras e justiça.'
    },
    {
        id: 'LIV-004',
        titulo: 'O Cemitério',
        autor: 'Stephen King',
        capa: '../img/livro4.webp',
        genero: 'Romance',
        dataPublicacao: '1983',
        disponivel: true,
        resumo: 'A família Creed se muda para uma casa perto de uma rodovia movimentada no Maine. Próximo à propriedade existe um cemitério de animais de estimação com poderes sombrios — qualquer coisa enterrada lá volta à vida, mas diferente do que era antes.'
    },
    {
        id: 'LIV-005',
        titulo: 'Shining',
        autor: 'Stephen King',
        capa: '../img/livro5.webp',
        genero: 'Romance',
        dataPublicacao: '1977',
        disponivel: true,
        resumo: 'Uma releitura sombria sobre isolamento, loucura e os fantasmas que carregamos dentro de nós. Uma família isolada em um hotel no inverno descobre que os verdadeiros monstros nem sempre são os que conseguimos ver.'
    },
    {
        id: 'LIV-006',
        titulo: 'Carrie',
        autor: 'Stephen King',
        capa: '../img/livro6.webp',
        genero: 'Romance',
        dataPublicacao: '1974',
        disponivel: true,
        resumo: 'Carrie White é uma adolescente tímida e isolada que sofre bullying na escola e opressão religiosa em casa. Quando ela descobre que possui poderes telecinéticos, os eventos culminam em uma noite de terror no baile de formatura.'
    },
    {
        id: 'LIV-006',
        titulo: 'Carrie',
        autor: 'Stephen King',
        capa: '../img/livro6.webp',
        genero: 'Romance',
        dataPublicacao: '1974',
        disponivel: true,
        resumo: 'Carrie White é uma adolescente tímida e isolada que sofre bullying na escola e opressão religiosa em casa. Quando ela descobre que possui poderes telecinéticos, os eventos culminam em uma noite de terror no baile de formatura.'
    }
];

// ============================================================
//  Mapa de classes CSS por gênero
//  Adicione novos gêneros aqui conforme necessário
// ============================================================

const GENERO_CSS = {
    'Terror':  'terror',
    'Drama':   'drama',
    'Ficção':  'ficcao',
    'Romance': 'romance',
};

function getGeneroClass(genero) {
    return GENERO_CSS[genero] || 'default';
}

// ============================================================
//  Carrega livros do localStorage e mescla com os fixos
// ============================================================

function carregarTodosLivros() {
    const livrosCadastrados = JSON.parse(localStorage.getItem('livrosCadastrados') || '[]');
    return [...livrosFixos, ...livrosCadastrados];
}

// ============================================================
//  Monta catálogos por gênero dinamicamente
// ============================================================

function montarCatalogos(todosLivros) {
    const generosSet = new Set(todosLivros.map(l => l.genero));
    const catalogos  = [];
    let idx = 1;

    generosSet.forEach(genero => {
        catalogos.push({
            carouselId: `carousel${idx}`,
            dotsId:     `dots${idx}`,
            genero,
            livros: todosLivros.filter(l => l.genero === genero)
        });
        idx++;
    });

    return catalogos;
}

// ============================================================
//  Injeta o HTML completo dentro de #sessaolivros
// ============================================================

function renderizarSessaoLivros(catalogos) {
    const sessao = document.getElementById('sessaolivros');
    if (!sessao) return;

    sessao.classList.add('lib-section');

    let html = `
        <div class="lib-header">
            <span class="lib-sup">Acervo Digital</span>
            <h1 class="lib-title">Catálogo de Livros</h1>
            <div class="lib-rule">
                <div class="lib-rule-line"></div>
                <div class="lib-rule-dot"></div>
                <div class="lib-rule-line lib-rule-line--right"></div>
            </div>
        </div>
        <div class="lib-container">
    `;

    catalogos.forEach(catalogo => {
        const cssClass = getGeneroClass(catalogo.genero);
        const count    = String(catalogo.livros.length).padStart(2, '0');

        html += `
            <div class="genre-block">
                <div class="genre-head">
                    <span class="genre-tag ${cssClass}">${catalogo.genero}</span>
                    <div class="genre-head-line"></div>
                    <span class="genre-count">${count} títulos</span>
                </div>
                <div class="carousel-grid" id="${catalogo.carouselId}"></div>
                <div class="carousel-dots" id="${catalogo.dotsId}"></div>
            </div>
        `;
    });

    html += `</div>`;
    sessao.innerHTML = html;
}

// ============================================================
//  Classe do carrossel
// ============================================================

class Carousel {

    constructor(carouselId, dotsId, livros) {
        this.carouselElement = document.getElementById(carouselId);
        this.dotsElement     = document.getElementById(dotsId);
        this.livros          = livros;
        this.currentSlide    = 0;
        this.itensPorSlide   = 5;
        this.totalSlides     = Math.ceil(livros.length / this.itensPorSlide);
        this.init();
    }

    init() {
        this.criarDots();
        this.mostrarSlide(0);
    }

    criarDots() {
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
            dot.addEventListener('click', () => this.irParaSlide(i));
            this.dotsElement.appendChild(dot);
        }
    }

    mostrarSlide(slideIndex) {
        this.currentSlide = slideIndex;
        this.carouselElement.innerHTML = '';

        const inicio = slideIndex * this.itensPorSlide;
        const fim    = Math.min(inicio + this.itensPorSlide, this.livros.length);

        for (let i = inicio; i < fim; i++) {
            const card = this.criarCard(this.livros[i]);
            this.carouselElement.appendChild(card);
        }

        this.atualizarDots();
    }

    criarCard(livro) {
        const card = document.createElement('div');
        card.classList.add('book-card');
        card.setAttribute('title', `Ver detalhes de "${livro.titulo}"`);

        card.innerHTML = `
            <div class="book-card-capa">
                <img src="${livro.capa}" alt="Capa — ${livro.titulo}" loading="lazy" />
                <div class="book-card-overlay"></div>
                <span class="book-card-status ${livro.disponivel ? 'disponivel' : 'indisponivel'}">
                    ${livro.disponivel ? 'Disponível' : 'Indisponível'}
                </span>
                <span class="book-card-year">${livro.dataPublicacao}</span>
            </div>
            <div class="book-card-info">
                <h3 class="book-card-titulo">${livro.titulo}</h3>
                <p class="book-card-autor">${livro.autor}</p>
                <div class="book-card-sep"></div>
                <span class="book-card-genero">${livro.genero}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            sessionStorage.setItem('livroSelecionado', JSON.stringify(livro));
            window.location.href = '../pages/TelaDoLivro.html';
        });

        return card;
    }

    atualizarDots() {
        const dots = this.dotsElement.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    irParaSlide(slideIndex) {
        this.mostrarSlide(slideIndex);
    }
}

// ============================================================
//  Inicialização — chamada pelo include.js após injetar HTML
// ============================================================

function initCarousels() {
    const todosLivros = carregarTodosLivros();
    const catalogos   = montarCatalogos(todosLivros);

    renderizarSessaoLivros(catalogos);

    catalogos.forEach(catalogo => {
        const carouselEl = document.getElementById(catalogo.carouselId);
        const dotsEl     = document.getElementById(catalogo.dotsId);

        if (!carouselEl || !dotsEl) {
            console.warn(`Elemento não encontrado: ${catalogo.carouselId} ou ${catalogo.dotsId}`);
            return;
        }

        new Carousel(catalogo.carouselId, catalogo.dotsId, catalogo.livros);
    });
}