// =====================================================
// MADEIRA 2026 — APP LOGIC
// =====================================================

// ----- Password gate ---------------------------------
const PASSWORD = 'bonitos';
const STORAGE_KEY = 'madeira26_unlocked';

const gate = document.getElementById('gate');
const app = document.getElementById('app');
const gateForm = document.getElementById('gateForm');
const gateInput = document.getElementById('pwd');
const gateError = document.getElementById('gateError');

function unlock() {
  gate.style.display = 'none';
  app.hidden = false;
  document.body.style.overflow = '';
  // Se o URL aponta para uma tab específica (ex.: #pagamentos), abre-a.
  // openTabFromHash pode ainda não estar pronta no arranque inicial; o guard trata disso.
  try { openTabFromHash(); } catch (e) { /* ignora no arranque */ }
}

function lock() {
  sessionStorage.removeItem(STORAGE_KEY);
  app.hidden = true;
  gate.style.display = 'grid';
  gateInput.value = '';
  gateError.hidden = true;
}

if (sessionStorage.getItem(STORAGE_KEY) === '1') {
  unlock();
} else {
  document.body.style.overflow = 'hidden';
}

gateForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = gateInput.value.trim().toLowerCase();
  if (value === PASSWORD) {
    sessionStorage.setItem(STORAGE_KEY, '1');
    unlock();
  } else {
    gateError.hidden = false;
    gateInput.value = '';
    gateInput.focus();
    gateError.style.animation = 'none';
    gateError.offsetHeight;
    gateError.style.animation = '';
  }
});

document.getElementById('logoutBtn').addEventListener('click', lock);

// ----- Tabs ------------------------------------------
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

const tabsValidas = Array.from(tabs).map((t) => t.dataset.tab);

function activateTab(target, { scroll = true, updateHash = true } = {}) {
  if (!tabsValidas.includes(target)) return;
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === target));
  panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === target));
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  if (updateHash) {
    // Atualiza o URL sem recarregar nem fazer scroll de âncora
    history.replaceState(null, '', '#' + target);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

// Abrir a tab indicada no URL (ex.: .../#pagamentos)
function openTabFromHash() {
  const alvo = (location.hash || '').replace('#', '').trim();
  if (alvo && tabsValidas.includes(alvo)) {
    activateTab(alvo, { scroll: false, updateHash: false });
  }
}

// Responder a mudanças de hash (ex.: alguém cola um novo link na mesma sessão)
window.addEventListener('hashchange', openTabFromHash);

// =====================================================
// DADOS — derivados directamente do Excel
// =====================================================
//
// Critério "pago já" vs "pago depois":
//   PAGO JÁ:    Hotel + Voo + Carro + Ecotax
//   PAGO DEPOIS: Parking + Combustível + Atrações + Refeições/Bebidas
//
// Custos partilhados:
//   - Hotel: por ocupantes do quarto
//   - Carros, parking, gasolina: pelas 22 pessoas (cada um precisa de lugar)
// Custos individuais:
//   - Voo, ecotax, atrações, refeições
// Custos individuais: Voo, Ecotax, Atrações, Refeições+bebidas
//
// Pessoas:
//   - adulto: paga voo (€176.95), refeições+bebidas (€200), atrações (€39), ecotax (€10)
//   - criança (4-12): paga voo (€176.95), refeições+bebidas (€100), atrações (€19.50), SEM ecotax
//   - bebé (<2): paga voo (€62) e parte do quarto/carro; SEM ecotax, refeições, atrações

const PRECO_REF_AD = 200;     // 5 dias × (30 almoço + 10 bebidas)
const PRECO_REF_CR = 100;     // metade
const PRECO_REF_BB = 0;
const PRECO_ATR_AD = 53;        // Telef €22 + Cestos €15 + Museu €10 + Cabo Girão €3 + Porto Moniz €3
const PRECO_ATR_CR = 19;        // média (8a:€32 / 6a:€23 / 4a:€3) ≈ €19/criança
const PRECO_ATR_BB = 0;
const PRECO_ECO = 10;          // €2/noite × 5 noites
const PARK_TOTAL = 250;        // €10/dia × 5 dias × 5 carros = 250
const GASOL_TOTAL = 331.24;    // total para todos
const N_PAGANTES_GASOL = 21;   // adultos + crianças (bebé não conta)
const N_CARROS = 5;
const PRECO_CARRO = 161;

// Famílias: { name, hotel, voo, carro?, pessoas: [{nome, idade, categoria, voo}] }
// Voo individual: cada pessoa paga o seu bilhete (bebé tem tarifa especial €62)
// Voos easyjet (ida + volta)
//   Porto → Funchal (EJU6863, 5/9): adulto €69.13, criança €69.13, bebé €31.00
//   Funchal → Porto (EJU6834, 10/9): adulto €107.82, criança €107.82, bebé €31.00
//   Total bilhetes: 18×€176.95 + 3×€176.95 + 1×€62 = €3.777,95
const VOO_ADULTO = 176.95;
const VOO_CRIANCA = 176.95;
const VOO_BEBE = 62.00;

const familias = [
  {
    name: 'Alexandra',
    quarto: 'Twin Family',
    hotel: 1455,
    carroProprio: true,
    pessoas: [
      { nome: 'Adriano de Assis Pinheiro Martins', idade: 38, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'Ana Alexandra Simões Fernandes', idade: 38, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'Ana de Assis Fernandes Martins', idade: 4, cat: 'crianca', voo: VOO_CRIANCA },
      { nome: 'Aurora de Assis Fernandes Martins', idade: 1, cat: 'bebe', voo: VOO_BEBE },
    ],
  },
  {
    name: 'Farrulo',
    quarto: 'Twin Classic Pool View',
    hotel: 1372,
    carroProprio: false,
    pessoas: [
      { nome: 'Manuel Ribeiro Fernandes', idade: 59, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'Maria da Conceição Ribeiro Simões', idade: 58, cat: 'adulto', voo: VOO_ADULTO },
    ],
  },
  {
    name: 'Pedro',
    quarto: 'Twin Classic Pool View (single)',
    hotel: 1170,
    carroProprio: false,
    pessoas: [
      { nome: 'Pedro Manuel Simões Fernandes', idade: 31, cat: 'adulto', voo: VOO_ADULTO },
    ],
  },
  {
    name: 'Patricia',
    quarto: 'Twin Family',
    hotel: 1455,
    carroProprio: true,
    pessoas: [
      { nome: 'Patrícia Isabel Simões de Oliveira', idade: 37, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'Michael Sapateiro Luís', idade: 41, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'Madalena Gonçalves Luís', idade: 8, cat: 'crianca', voo: VOO_CRIANCA },
      { nome: 'Emilia Gonçalves Luís', idade: 6, cat: 'crianca', voo: VOO_CRIANCA },
    ],
  },
  {
    name: 'Carmo',
    quarto: 'Twin Classic Pool View',
    hotel: 1372,
    carroProprio: false,
    pessoas: [
      { nome: 'Manuel Pereira de Oliveira', idade: 67, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'Maria do Carmo Ribeiro Simões', idade: 61, cat: 'adulto', voo: VOO_ADULTO },
    ],
  },
  {
    name: 'Luís',
    quarto: 'Twin Classic Pool View',
    hotel: 1372,
    carroProprio: true,
    pessoas: [
      { nome: 'Luís Manuel Simões Oliveira', idade: 33, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'João Pedro Simões Oliveira', idade: 22, cat: 'adulto', voo: VOO_ADULTO },
    ],
  },
  {
    name: 'Ana Maria',
    quarto: 'Twin Classic Pool View',
    hotel: 1372,
    carroProprio: true,
    pessoas: [
      { nome: 'Filipe Daniel Fernandes Rodrigues', idade: 46, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'Ana Maria Ribeiro Simões', idade: 60, cat: 'adulto', voo: VOO_ADULTO },
    ],
  },
  {
    name: 'Jorge',
    quarto: 'Twin Family (3 pess)',
    hotel: 1790,
    carroProprio: true,
    pessoas: [
      { nome: 'Tiago Simões Silva', idade: 17, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'Maria de Fátima Ribeiro Simões', idade: 48, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'Jorge Manuel Ferreira da Silva', idade: 48, cat: 'adulto', voo: VOO_ADULTO },
    ],
  },
  {
    name: 'Jorginho',
    quarto: 'Twin Classic Pool View',
    hotel: 1372,
    carroProprio: false,
    pessoas: [
      { nome: 'Jorge Miguel Simões da Silva', idade: 25, cat: 'adulto', voo: VOO_ADULTO },
      { nome: 'Susete Daniela Silva Loureiro', idade: 25, cat: 'adulto', voo: VOO_ADULTO },
    ],
  },
];

// =====================================================
// CÁLCULOS
// =====================================================
function custosPessoa(pessoa) {
  // Retorna { jaHotel, jaVoo, jaCarro, jaEcotax, depParking, depGasol, depAtr, depRef }
  // Estas são as componentes que ESTA pessoa contribui (a sua parte).
  // Hotel, carro, parking, gasolina serão calculados ao nível do quarto e divididos.
  const ja = {
    voo: pessoa.voo,
    ecotax: pessoa.cat === 'adulto' ? PRECO_ECO : 0,
  };
  const dep = {
    refeicoes: pessoa.cat === 'adulto' ? PRECO_REF_AD :
               pessoa.cat === 'crianca' ? PRECO_REF_CR : PRECO_REF_BB,
    atracoes: pessoa.cat === 'adulto' ? PRECO_ATR_AD :
              pessoa.cat === 'crianca' ? PRECO_ATR_CR : PRECO_ATR_BB,
  };
  return { ja, dep };
}

// Total de pessoas no grupo (incluindo bebé), usado para dividir custos partilhados
const TOTAL_PESSOAS = 22;

function custosFamilia(fam) {
  const ocupantes = fam.pessoas.length;

  // Pago já — Hotel: por quarto
  const hotelTotal = fam.hotel;
  // Pago já — Carros: TOTAL ALUGUER / 22 × ocupantes (todos contribuem, incluindo bebé)
  const carroTotal = (PRECO_CARRO * N_CARROS) / TOTAL_PESSOAS * ocupantes;

  // Pago depois — Estacionamento: TOTAL / 22 × ocupantes (todos contribuem)
  const parkingTotal = PARK_TOTAL / TOTAL_PESSOAS * ocupantes;
  // Pago depois — Combustível: TOTAL / 22 × ocupantes (todos precisam de lugar)
  const gasolTotal = GASOL_TOTAL / TOTAL_PESSOAS * ocupantes;

  // Pago já — individual (somatório)
  const vooTotal = fam.pessoas.reduce((s, p) => s + p.voo, 0);
  const ecotaxTotal = fam.pessoas.reduce((s, p) => s + (p.cat === 'adulto' ? PRECO_ECO : 0), 0);

  // Pago depois — individual (somatório)
  const refTotal = fam.pessoas.reduce((s, p) => {
    if (p.cat === 'adulto') return s + PRECO_REF_AD;
    if (p.cat === 'crianca') return s + PRECO_REF_CR;
    return s;
  }, 0);
  const atrTotal = fam.pessoas.reduce((s, p) => {
    if (p.cat === 'adulto') return s + PRECO_ATR_AD;
    if (p.cat === 'crianca') return s + PRECO_ATR_CR;
    return s;
  }, 0);

  const ja = hotelTotal + carroTotal + vooTotal + ecotaxTotal;
  const depois = parkingTotal + gasolTotal + refTotal + atrTotal;

  return {
    ocupantes,
    hotel: hotelTotal,
    carro: carroTotal,
    voo: vooTotal,
    ecotax: ecotaxTotal,
    parking: parkingTotal,
    gasolina: gasolTotal,
    refeicoes: refTotal,
    atracoes: atrTotal,
    ja,
    depois,
    total: ja + depois,
    perPerson: (ja + depois) / ocupantes,
  };
}

function custosPessoaCompleto(pessoa, fam, custosFam) {
  // Hotel: dividido pelos ocupantes do quarto
  const ocup = custosFam.ocupantes;
  const hotelShare = custosFam.hotel / ocup;

  // Carros, parking e gasolina: dividido por todas as 22 pessoas (cada um precisa de um lugar)
  const carroShare = (PRECO_CARRO * N_CARROS) / TOTAL_PESSOAS;
  const parkShare = PARK_TOTAL / TOTAL_PESSOAS;
  const gasolShare = GASOL_TOTAL / TOTAL_PESSOAS;

  // Individuais
  const ecotax = pessoa.cat === 'adulto' ? PRECO_ECO : 0;
  const ref = pessoa.cat === 'adulto' ? PRECO_REF_AD :
              pessoa.cat === 'crianca' ? PRECO_REF_CR : PRECO_REF_BB;
  const atr = pessoa.cat === 'adulto' ? PRECO_ATR_AD :
              pessoa.cat === 'crianca' ? PRECO_ATR_CR : PRECO_ATR_BB;

  const ja = hotelShare + carroShare + pessoa.voo + ecotax;
  const depois = parkShare + gasolShare + ref + atr;

  return {
    hotelShare, carroShare, voo: pessoa.voo, ecotax,
    parkShare, gasolShare, ref, atr,
    ja, depois, total: ja + depois,
  };
}

// =====================================================
// FORMATAÇÃO
// =====================================================
const eur = (v) => '€' + new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(Math.round(v)).replace(/\u00A0/g, ' ');
const eur2 = (v) => '€' + new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v).replace(/\u00A0/g, ' ');

// Mapping de nomes amigáveis (curtos e únicos)
const nomesCurtos = {
  'Adriano de Assis Pinheiro Martins': 'Adriano',
  'Ana Alexandra Simões Fernandes': 'Alexandra',
  'Ana de Assis Fernandes Martins': 'Ana',
  'Aurora de Assis Fernandes Martins': 'Aurora',
  'Manuel Ribeiro Fernandes': 'Manuel R.',
  'Maria da Conceição Ribeiro Simões': 'Conceição',
  'Pedro Manuel Simões Fernandes': 'Pedro',
  'Patrícia Isabel Simões de Oliveira': 'Patrícia',
  'Michael Sapateiro Luís': 'Michael',
  'Madalena Gonçalves Luís': 'Madalena',
  'Emilia Gonçalves Luís': 'Emília',
  'Manuel Pereira de Oliveira': 'Manuel O.',
  'Maria do Carmo Ribeiro Simões': 'Carmo',
  'Luís Manuel Simões Oliveira': 'Luís',
  'João Pedro Simões Oliveira': 'João Pedro',
  'Filipe Daniel Fernandes Rodrigues': 'Filipe',
  'Ana Maria Ribeiro Simões': 'Ana Maria',
  'Tiago Simões Silva': 'Tiago',
  'Maria de Fátima Ribeiro Simões': 'Fátima',
  'Jorge Manuel Ferreira da Silva': 'Jorge',
  'Jorge Miguel Simões da Silva': 'Jorginho',
  'Susete Daniela Silva Loureiro': 'Susete',
};

const nomeCurto = (n) => nomesCurtos[n] || n.split(' ')[0];

// =====================================================
// MAPS — Google Place IDs e função de link
// =====================================================
const PLACES = {
  hotel:           'ChIJV-mjUfpfYAwR_jyTGIg4UOM',  // Pestana Carlton Madeira
  airport:         'ChIJ6xlRBVRiYAwR7cmGjBb7wVY',  // Madeira Airport (FNC)
  mercado:         'ChIJz3kecQ9gYAwRYw5WU4wAWY0',  // Mercado dos Lavradores
  teleferico:      'ChIJyZwZXmlgYAwReSH_1TMs3Kg',  // Funchal-Monte Cable Car
  cestos:          'ChIJix83BM5hYAwRK2erdp2J_A8',  // Carreiros do Monte
  museuBaleia:     'ChIJU4NDrERjYAwRTDmx8rvxSDM',  // Museu da Baleia
  pontaSL:         'ChIJBYiJk6J8YAwRFuEWPLkGqKA',  // Ponta de São Lourenço
  santana:         'ChIJn1Stk7dnYAwR6Owt36PGuk8',  // Casas Típicas de Santana
  queimadas:       'ChIJjVfns45nYAwR5kNtrEQ22RQ',  // Parque Florestal das Queimadas
  ribeiroFrio:     'ChIJO2yVRTZnYAwRZBzCdjL0aNA',  // Posto Aquícola do Ribeiro Frio
  caboGirao:       'ChIJM4MGcC1fYAwRpDwTa-2e1Ak',  // Cabo Girão
  camaraLobos:     'ChIJyR0p1JleYAwR0D-Q5L3rAAQ',  // Câmara de Lobos
  portoMoniz:      'ChIJJw94bTZJYAwRfPk3g8xkNWU',  // Porto Moniz piscinas naturais
};

const mapLink = (placeId) => `https://www.google.com/maps/place/?q=place_id:${placeId}`;

// =====================================================
// PROGRAMA
// =====================================================
const programa = [
  {
    day: 'Sáb 5/9',
    theme: 'Chegada',
    prog: 'Recolha de carros e transferência para o hotel (~20 min). Tarde livre nas piscinas. Jantar no hotel.',
    locais: [
      { nome: 'Aeroporto da Madeira (FNC)', placeId: PLACES.airport },
      { nome: 'Pestana Carlton', placeId: PLACES.hotel },
    ],
  },
  {
    day: 'Dom 6/9',
    theme: 'Funchal',
    prog: 'Mercado dos Lavradores, teleférico do Monte, descida pelos Carros de Cesto. Almoço em Funchal.',
    locais: [
      { nome: 'Mercado dos Lavradores', placeId: PLACES.mercado },
      { nome: 'Teleférico do Monte', placeId: PLACES.teleferico },
      { nome: 'Carreiros do Monte', placeId: PLACES.cestos },
    ],
  },
  {
    day: 'Seg 7/9',
    theme: 'Leste',
    prog: 'Museu da Baleia (Caniçal), miradouros da Ponta de São Lourenço.',
    locais: [
      { nome: 'Museu da Baleia · Caniçal', placeId: PLACES.museuBaleia },
      { nome: 'Ponta de São Lourenço', placeId: PLACES.pontaSL },
    ],
  },
  {
    day: 'Ter 8/9',
    theme: 'Norte',
    prog: 'Casas Típicas de Santana, Levada "Um Caminho para Todos" no Parque das Queimadas (acessível com carrinho), Posto do Ribeiro Frio.',
    locais: [
      { nome: 'Casas Típicas de Santana', placeId: PLACES.santana },
      { nome: 'Parque das Queimadas', placeId: PLACES.queimadas },
      { nome: 'Ribeiro Frio', placeId: PLACES.ribeiroFrio },
    ],
  },
  {
    day: 'Qua 9/9',
    theme: 'Oeste',
    prog: 'Cabo Girão (skywalk), Câmara de Lobos, almoço de espetadas. Possível ida a Porto Moniz.',
    locais: [
      { nome: 'Cabo Girão', placeId: PLACES.caboGirao },
      { nome: 'Câmara de Lobos', placeId: PLACES.camaraLobos },
      { nome: 'Porto Moniz', placeId: PLACES.portoMoniz },
    ],
  },
  {
    day: 'Qui 10/9',
    theme: 'Saída',
    prog: 'Manhã livre. Saída até às 12h. Voo às 15:15.',
    locais: [
      { nome: 'Aeroporto da Madeira (FNC)', placeId: PLACES.airport },
    ],
  },
];

// =====================================================
// RENDER
// =====================================================

// --- Render rooms (Hotel tab) ---
const hotelMapLink = document.getElementById('hotelMapLink');
if (hotelMapLink) hotelMapLink.href = mapLink(PLACES.hotel);

const roomsEl = document.getElementById('rooms');
familias.forEach((f, i) => {
  const li = document.createElement('li');
  li.className = 'room';
  const composicao = f.pessoas.map(p => {
    const nome = nomeCurto(p.nome);
    return p.cat === 'bebe' ? `${nome} (bebé)` :
           p.cat === 'crianca' ? `${nome} (${p.idade})` : nome;
  }).join(' · ');
  li.innerHTML = `
    <span class="room-num">${String(i + 1).padStart(2, '0')}</span>
    <div class="room-info">
      <p class="room-fam">${f.name}</p>
      <p class="room-comp">${composicao}</p>
    </div>
    <span class="room-type">${f.quarto}</span>
  `;
  roomsEl.appendChild(li);
});

// --- Render timeline ---
const tlEl = document.getElementById('timeline');
programa.forEach((d, i) => {
  const li = document.createElement('li');
  li.className = 'tl-item' + (i === 0 ? ' tl-active' : '');
  const locaisHTML = d.locais && d.locais.length ? `
    <ul class="tl-places">
      ${d.locais.map(l => `
        <li>
          <a href="${mapLink(l.placeId)}" target="_blank" rel="noopener" class="tl-place">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${l.nome}</span>
          </a>
        </li>
      `).join('')}
    </ul>
  ` : '';
  li.innerHTML = `
    <p class="tl-day">${d.day}</p>
    <h4 class="tl-theme">${d.theme}</h4>
    <p class="tl-prog">${d.prog}</p>
    ${locaisHTML}
  `;
  tlEl.appendChild(li);
});

// --- Render families (clicáveis) ---
const famEl = document.getElementById('families');
const famHeroEl = document.getElementById('familiesHero');

function renderFamily(f) {
  const c = custosFamilia(f);
  const composicao = f.pessoas.map(p => {
    const nome = nomeCurto(p.nome);
    return p.cat === 'bebe' ? `${nome} (bebé)` :
           p.cat === 'crianca' ? `${nome} (${p.idade})` : nome;
  }).join(' · ');
  const li = document.createElement('li');
  li.className = 'fam fam-clickable';
  li.dataset.familia = f.name;
  li.innerHTML = `
    <div class="fam-info">
      <p class="fam-name">${f.name}</p>
      <p class="fam-comp">${composicao}</p>
    </div>
    <div class="fam-amt">
      <p class="fam-total">${eur(c.total)}</p>
      <p class="fam-split">
        <span class="split-ja">${eur(c.ja)} já</span>
        <span class="split-sep">·</span>
        <span class="split-dep">${eur(c.depois)} depois</span>
      </p>
    </div>
    <span class="fam-arrow" aria-hidden="true">›</span>
  `;
  li.addEventListener('click', () => openFamilyModal(f));
  return li;
}

familias.forEach((f) => {
  if (famEl) famEl.appendChild(renderFamily(f));
  if (famHeroEl) famHeroEl.appendChild(renderFamily(f));
});

// =====================================================
// MODAL — Família e Pessoa
// =====================================================
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const modalBack = document.getElementById('modalBack');

let modalStack = [];  // pilha para back navigation

function showModal(html, hasBack = false) {
  modalContent.innerHTML = html;
  modalBack.hidden = !hasBack;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalContent.scrollTop = 0;
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  modalStack = [];
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

modalBack.addEventListener('click', () => {
  if (modalStack.length > 1) {
    modalStack.pop();
    const prev = modalStack[modalStack.length - 1];
    showModal(prev.html, modalStack.length > 1);
  }
});

// --- Modal: Família ---
function openFamilyModal(fam) {
  const c = custosFamilia(fam);
  const html = familyModalHTML(fam, c);
  modalStack = [{ html }];
  showModal(html, false);
  // Bind click on people
  modalContent.querySelectorAll('[data-pessoa]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.pessoa, 10);
      openPersonModal(fam, fam.pessoas[idx]);
    });
  });
}

function familyModalHTML(fam, c) {
  const composicao = fam.pessoas.map(p => nomeCurto(p.nome)).join(' · ');

  // Linhas do breakdown
  const linhasJa = [
    { label: 'Hotel · 5 noites · meia pensão', val: c.hotel, sub: `${fam.quarto} (todo o quarto)` },
    { label: 'Voos easyJet · ida e volta', val: c.voo, sub: `${fam.pessoas.length} bilhetes (Porto ↔ Funchal)` },
  ];
  if (c.carro > 0) {
    linhasJa.push({ label: 'Aluguer de carro', val: c.carro, sub: '5 dias · 1 carro 5 lugares' });
  }
  if (c.ecotax > 0) {
    linhasJa.push({ label: 'Ecotax', val: c.ecotax, sub: `€2/adulto/noite · ${fam.pessoas.filter(p => p.cat === 'adulto').length} adultos` });
  }

  const linhasDepois = [];
  if (c.parking > 0) {
    linhasDepois.push({ label: 'Estacionamento no hotel', val: c.parking, sub: '€10/dia × 5 dias' });
  }
  if (c.gasolina > 0) {
    linhasDepois.push({ label: 'Combustível', val: c.gasolina, sub: 'parte proporcional do total' });
  }
  if (c.atracoes > 0) {
    linhasDepois.push({ label: 'Atrações', val: c.atracoes, sub: 'teleférico, Cesto Monte, Cabo Girão, etc.' });
  }
  if (c.refeicoes > 0) {
    linhasDepois.push({ label: 'Almoços + bebidas', val: c.refeicoes, sub: '5 dias · jantares incluídos no hotel' });
  }

  const renderLinhas = (linhas) => linhas.map(l => `
    <li class="brk-row">
      <div class="brk-text">
        <p class="brk-label">${l.label}</p>
        <p class="brk-sub">${l.sub}</p>
      </div>
      <p class="brk-val">${eur2(l.val)}</p>
    </li>
  `).join('');

  const renderPessoas = fam.pessoas.map((p, i) => {
    const apelido = p.nome.split(' ').slice(-1)[0];
    const nomeFmt = nomeCurto(p.nome) + ' ' + apelido;
    const tag = p.cat === 'bebe' ? 'bebé' :
                p.cat === 'crianca' ? `${p.idade} anos` :
                p.idade === 17 ? 'adolescente' : 'adulto';
    return `
      <li class="pessoa-row" data-pessoa="${i}">
        <div class="pessoa-info">
          <p class="pessoa-nome">${nomeFmt}</p>
          <p class="pessoa-tag">${tag}</p>
        </div>
        <span class="pessoa-arrow">›</span>
      </li>
    `;
  }).join('');

  return `
    <div class="m-head">
      <p class="m-eyebrow">Quarto · ${fam.quarto}</p>
      <h2 class="m-title">${fam.name}</h2>
      <p class="m-sub">${composicao}</p>
    </div>

    <div class="m-totals">
      <div class="m-total-card m-total-ja">
        <p class="m-tot-lbl">Pago já</p>
        <p class="m-tot-val">${eur(c.ja)}</p>
        <p class="m-tot-sub">hotel · voos · carro · ecotax</p>
      </div>
      <div class="m-total-card m-total-dep">
        <p class="m-tot-lbl">Pago durante</p>
        <p class="m-tot-val">${eur(c.depois)}</p>
        <p class="m-tot-sub">parking · combustível · atrações · refeições</p>
      </div>
    </div>

    <div class="m-grand">
      <span>Total</span>
      <strong>${eur(c.total)}</strong>
    </div>

    <h3 class="m-sec">Pago já <span class="m-sec-tag tag-ja">próximas semanas</span></h3>
    <ul class="brk">${renderLinhas(linhasJa)}</ul>

    <h3 class="m-sec">Pago durante a viagem <span class="m-sec-tag tag-dep">no destino</span></h3>
    <ul class="brk">${renderLinhas(linhasDepois)}</ul>

    <h3 class="m-sec">Por pessoa</h3>
    <p class="m-hint">Toca em cada pessoa para ver os seus custos individuais.</p>
    <ul class="pessoas-list">${renderPessoas}</ul>

    <div class="m-note">
      O hotel divide-se pelos ocupantes do quarto. Os carros, parking e combustível dividem-se pelas 22 pessoas do grupo (todos precisam de lugar). Voo, refeições, atrações e ecotax são individuais.
    </div>
  `;
}

// --- Modal: Pessoa ---
function openPersonModal(fam, pessoa) {
  const c = custosFamilia(fam);
  const cp = custosPessoaCompleto(pessoa, fam, c);
  const html = personModalHTML(fam, pessoa, cp);
  modalStack.push({ html });
  showModal(html, true);
}

function personModalHTML(fam, pessoa, cp) {
  const tag = pessoa.cat === 'bebe' ? 'bebé · 1 ano' :
              pessoa.cat === 'crianca' ? `criança · ${pessoa.idade} anos` :
              pessoa.idade === 17 ? 'adolescente · 17 anos' : `adulto · ${pessoa.idade} anos`;

  const linhasJa = [];
  if (cp.hotelShare > 0) {
    linhasJa.push({ label: 'Quota-parte do hotel', val: cp.hotelShare, sub: `${fam.hotel}€ ÷ ${fam.pessoas.length} pessoas do quarto` });
  }
  if (cp.voo > 0) {
    linhasJa.push({ label: 'Voo', val: cp.voo, sub: 'bilhete individual' });
  }
  if (cp.carroShare > 0) {
    linhasJa.push({ label: 'Quota-parte do aluguer de carro', val: cp.carroShare, sub: '€805 (5 carros) ÷ 22 pessoas' });
  }
  if (cp.ecotax > 0) {
    linhasJa.push({ label: 'Ecotax', val: cp.ecotax, sub: '€2 × 5 noites' });
  }

  const linhasDepois = [];
  if (cp.parkShare > 0) {
    linhasDepois.push({ label: 'Quota-parte do estacionamento', val: cp.parkShare, sub: '€250 ÷ 22 pessoas' });
  }
  if (cp.gasolShare > 0) {
    linhasDepois.push({ label: 'Quota-parte do combustível', val: cp.gasolShare, sub: '€331 ÷ 22 pessoas' });
  }
  if (cp.atr > 0) {
    linhasDepois.push({ label: 'Atrações', val: cp.atr, sub: pessoa.cat === 'crianca' ? 'meio preço (criança)' : 'preço normal' });
  }
  if (cp.ref > 0) {
    linhasDepois.push({ label: 'Almoços + bebidas', val: cp.ref, sub: pessoa.cat === 'crianca' ? 'meio preço (criança)' : '5 dias' });
  }

  const renderLinhas = (linhas) => {
    if (linhas.length === 0) return '<li class="brk-row"><p class="brk-label" style="color:var(--ink-mute);font-style:italic">Nada nesta categoria.</p></li>';
    return linhas.map(l => `
      <li class="brk-row">
        <div class="brk-text">
          <p class="brk-label">${l.label}</p>
          <p class="brk-sub">${l.sub}</p>
        </div>
        <p class="brk-val">${eur2(l.val)}</p>
      </li>
    `).join('');
  };

  return `
    <div class="m-head">
      <p class="m-eyebrow">Família ${fam.name}</p>
      <h2 class="m-title">${pessoa.nome}</h2>
      <p class="m-sub">${tag}</p>
    </div>

    <div class="m-totals">
      <div class="m-total-card m-total-ja">
        <p class="m-tot-lbl">Pago já</p>
        <p class="m-tot-val">${eur(cp.ja)}</p>
      </div>
      <div class="m-total-card m-total-dep">
        <p class="m-tot-lbl">Pago durante</p>
        <p class="m-tot-val">${eur(cp.depois)}</p>
      </div>
    </div>

    <div class="m-grand">
      <span>Total individual</span>
      <strong>${eur(cp.total)}</strong>
    </div>

    <h3 class="m-sec">Pago já <span class="m-sec-tag tag-ja">próximas semanas</span></h3>
    <ul class="brk">${renderLinhas(linhasJa)}</ul>

    <h3 class="m-sec">Pago durante a viagem <span class="m-sec-tag tag-dep">no destino</span></h3>
    <ul class="brk">${renderLinhas(linhasDepois)}</ul>

    <div class="m-note">
      ${pessoa.cat === 'bebe' ?
        'Aurora paga só €62 de voo (tarifa de bebé) e a sua quota-parte de hotel, carros, parking e combustível. Não paga ecotax, refeições nem atrações.' :
        pessoa.cat === 'crianca' ?
        'Crianças menores de 13 anos pagam metade em refeições e atrações e estão isentas de ecotax. O hotel divide-se pelos ocupantes do quarto; os carros, parking e combustível dividem-se pelas 22 pessoas.' :
        'O hotel divide-se pelos ocupantes do quarto. Os carros, parking e combustível dividem-se pelas 22 pessoas do grupo (todos precisam de lugar).'}
    </div>
  `;
}

// =====================================================
// Calcula totais globais para o resumo
// =====================================================
const totaisGlobais = familias.reduce((acc, f) => {
  const c = custosFamilia(f);
  acc.total += c.total;
  acc.ja += c.ja;
  acc.depois += c.depois;
  acc.hotel += c.hotel;
  acc.voo += c.voo;
  acc.carro += c.carro;
  acc.ecotax += c.ecotax;
  acc.parking += c.parking;
  acc.gasolina += c.gasolina;
  acc.atracoes += c.atracoes;
  acc.refeicoes += c.refeicoes;
  acc.pessoas += c.ocupantes;
  return acc;
}, { total: 0, ja: 0, depois: 0, hotel: 0, voo: 0, carro: 0, ecotax: 0,
     parking: 0, gasolina: 0, atracoes: 0, refeicoes: 0, pessoas: 0 });

// Inserir no DOM os totais
document.getElementById('totalTrip').textContent = eur(totaisGlobais.total);
document.getElementById('totalJa').textContent = eur(totaisGlobais.ja);
document.getElementById('totalDepois').textContent = eur(totaisGlobais.depois);
document.getElementById('totalAvg').textContent = '~' + eur(totaisGlobais.total / totaisGlobais.pessoas) + ' por pessoa em média';

// Mini-cards
document.getElementById('miHotel').textContent = eur(totaisGlobais.hotel);
document.getElementById('miVoos').textContent = eur(totaisGlobais.voo);
document.getElementById('miRef').textContent = eur(totaisGlobais.refeicoes);
document.getElementById('miCarros').textContent = eur(totaisGlobais.carro + totaisGlobais.parking + totaisGlobais.gasolina);

// Cost table
const costTbl = document.getElementById('costTable');
const tbody = costTbl.querySelector('tbody');

// Definição das categorias com explicação detalhada
const categorias = {
  hotel: {
    lbl: 'Hotel · 5 noites · meia pensão',
    val: totaisGlobais.hotel,
    when: 'ja',
    eyebrow: 'Pago já · Pestana Carlton',
    titulo: 'Hotel',
    intro: 'Pestana Carlton Madeira, 5 noites (5–10 set), meia pensão para todos. Inclui pequeno-almoço e jantar buffet.',
    formula: '9 quartos · 5 noites · meia pensão',
    linhas: [
      { txt: 'Twin Family (Alexandra) · 5 noites', val: 1455 },
      { txt: 'Twin Family (Patricia) · 5 noites', val: 1455 },
      { txt: 'Twin Family 3 pess (Jorge) · 5 noites', val: 1790 },
      { txt: 'Twin Classic Pool View (Farrulo) · 5 noites', val: 1372 },
      { txt: 'Twin Classic Pool View (Carmo) · 5 noites', val: 1372 },
      { txt: 'Twin Classic Pool View (Luís) · 5 noites', val: 1372 },
      { txt: 'Twin Classic Pool View (Ana Maria) · 5 noites', val: 1372 },
      { txt: 'Twin Classic Pool View (Jorginho) · 5 noites', val: 1372 },
      { txt: 'Twin Classic single (Pedro) · 5 noites', val: 1170 },
    ],
    nota: 'Tarifa Pestana com promo aplicado. As bebidas ao jantar não estão incluídas (estimadas em €10/adulto/dia, contadas em "Almoços + bebidas").',
  },
  voos: {
    lbl: 'Voos easyJet · 22 bilhetes',
    val: totaisGlobais.voo,
    when: 'ja',
    eyebrow: 'Pago já · easyJet',
    titulo: 'Voos easyJet',
    intro: 'Ida (Porto → Funchal, EJU6863, 5/9) e volta (Funchal → Porto, EJU6834, 10/9). Tarifa Light com mala de cabine pequena incluída.',
    formula: '18 adultos × €176,95 + 3 crianças × €176,95 + 1 bebé × €62,00',
    linhas: [
      { txt: 'Adulto · 18 bilhetes · €176,95', val: 18 * 176.95 },
      { txt: 'Criança · 3 bilhetes · €176,95', val: 3 * 176.95 },
      { txt: 'Bebé (Aurora) · 1 bilhete · €62,00', val: 62.00 },
    ],
    nota: 'Cesto easyJet. Cada bilhete = ida (€69,13) + volta (€107,82) para adultos e crianças. Bebé tem tarifa especial €31 + €31.',
  },
  carros: {
    lbl: 'Aluguer de carros · 5×',
    val: totaisGlobais.carro,
    when: 'ja',
    eyebrow: 'Pago já · Aluguer',
    titulo: 'Aluguer de carros',
    intro: '5 carros de 5 lugares cada (25 lugares para 22 pessoas, com 3 de margem). Conduzem: Adriano, Michael, Luís Oliveira, Jorge, Filipe. O custo é dividido pelo grupo todo, não por família.',
    formula: '5 carros × €161 (5 dias)',
    linhas: [
      { txt: 'Carro 1 · Adriano (família Alexandra)', val: 161 },
      { txt: 'Carro 2 · Michael (família Patricia)', val: 161 },
      { txt: 'Carro 3 · Luís Oliveira (família Luís)', val: 161 },
      { txt: 'Carro 4 · Filipe (família Ana Maria)', val: 161 },
      { txt: 'Carro 5 · Jorge (família Jorge)', val: 161 },
    ],
    nota: 'Os 5 carros são um recurso do grupo todo (cada pessoa precisa de um lugar). O custo do aluguer divide-se igualmente pelas 22 pessoas: ~€36,59 por pessoa.',
  },
  ecotax: {
    lbl: 'Ecotax',
    val: totaisGlobais.ecotax,
    when: 'ja',
    eyebrow: 'Pago já · Taxa turística',
    titulo: 'Ecotax',
    intro: 'Taxa turística da Madeira, cobrada pelo hotel. €2/pessoa/noite, máximo €14/pessoa/estadia. Crianças menores de 13 anos isentas.',
    formula: '18 pessoas elegíveis × €2 × 5 noites = €180',
    linhas: [
      { txt: '17 adultos · €10/cada (€2 × 5 noites)', val: 170 },
      { txt: 'Tiago (17 anos, conta como adulto) · €10', val: 10 },
      { txt: 'Madalena (8), Emília (6), Ana (4), Aurora (1) · isentas', val: 0 },
    ],
    nota: 'Crianças <13 anos são isentas (regulamento da Madeira). Cobrada no check-out do hotel.',
  },
  parking: {
    lbl: 'Estacionamento',
    val: totaisGlobais.parking,
    when: 'depois',
    eyebrow: 'Pago durante · Hotel',
    titulo: 'Estacionamento',
    intro: 'Parque do hotel Pestana Carlton, €10/dia/carro. 5 carros × 5 dias.',
    formula: '5 carros × €10/dia × 5 dias',
    linhas: [
      { txt: '5 carros × €10/dia × 5 dias', val: 250 },
    ],
    nota: 'Pago directamente ao hotel no check-out. Dividido pelas 22 pessoas (~€11,36/pessoa).',
  },
  gasolina: {
    lbl: 'Combustível',
    val: totaisGlobais.gasolina,
    when: 'depois',
    eyebrow: 'Pago durante · Combustível',
    titulo: 'Combustível',
    intro: 'Estimativa baseada nos quilómetros previstos para visitar a ilha durante os 5 dias.',
    formula: '~560 km/carro × 5 carros × 6,5 L/100km × €1,82/L',
    linhas: [
      { txt: '~560 km por carro', val: null, sub: 'Distância média estimada para visitar a ilha' },
      { txt: '~2 800 km no total (5 carros)', val: null },
      { txt: 'Consumo médio · 6,5 L/100 km', val: null },
      { txt: 'Preço gasolina · €1,82/L', val: null },
      { txt: 'Custo por carro', val: 66.25 },
      { txt: 'Custo total (×5 carros)', val: 331.24 },
    ],
    nota: 'Dividido pelas 22 pessoas do grupo (~€15,06/pessoa). Cada pessoa precisa de um lugar no carro, por isso todos contribuem — bebé incluído.',
  },
  atracoes: {
    lbl: 'Atrações',
    val: totaisGlobais.atracoes,
    when: 'depois',
    eyebrow: 'Pago durante · Atrações',
    titulo: 'Atrações',
    intro: 'Estimativa para as atrações principais durante os 5 dias. As crianças mais pequenas têm preços reduzidos ou entrada grátis em quase tudo.',
    formula: '~€53 por adulto · variável por criança · bebé não paga',
    linhas: [
      { txt: 'Teleférico do Monte (ida + volta)', val: null, sub: 'Adulto €22 · criança 7-14 €9 · <7 grátis' },
      { txt: 'Carros de Cesto do Monte', val: null, sub: '€30 por carro de 2 pessoas (€15/pessoa) · <5 grátis' },
      { txt: 'Museu da Baleia (Caniçal)', val: null, sub: 'Adulto €10 · jovem 12-17 €8,50 · criança 6-11 €5 · <6 grátis' },
      { txt: 'Cabo Girão (skywalk de vidro)', val: null, sub: 'Adulto €3 · <12 anos grátis' },
      { txt: 'Piscinas de Porto Moniz', val: null, sub: 'Adulto €3 · <3 anos grátis' },
      { txt: '18 adultos × ~€53', val: 18 * 53 },
      { txt: '3 crianças (8, 6, 4 anos) — preços reduzidos', val: 32 + 23 + 3 },
      { txt: 'Aurora (bebé) · 0', val: 0 },
    ],
    nota: 'Valores actualizados para 2026. Madalena (8) paga em tudo excepto Cabo Girão. Emília (6) paga só Cestos, Museu e Porto Moniz. Ana (4) só paga Porto Moniz. Aurora não paga em nada. Acertos podem ser feitos no destino consoante o que for visitado.',
  },
  refeicoes: {
    lbl: 'Almoços + bebidas',
    val: totaisGlobais.refeicoes,
    when: 'depois',
    eyebrow: 'Pago durante · Refeições',
    titulo: 'Almoços + bebidas',
    intro: 'A meia pensão do hotel inclui pequeno-almoço e jantar buffet, mas NÃO inclui bebidas. Aqui contam-se: almoços fora, bebidas ao jantar e bebidas ao almoço.',
    formula: '€40/adulto/dia + €20/criança/dia × 5 dias',
    linhas: [
      { txt: 'Almoço fora · adulto · €30/dia', val: null },
      { txt: 'Bebidas ao jantar · adulto · €10/dia', val: null },
      { txt: 'Total adulto/dia · €40', val: null },
      { txt: 'Total criança/dia · €20 (metade)', val: null },
      { txt: '18 adultos × €40 × 5 dias', val: 18 * 40 * 5 },
      { txt: '3 crianças × €20 × 5 dias', val: 3 * 20 * 5 },
      { txt: 'Aurora (bebé) · 0', val: 0 },
    ],
    nota: 'Estimativa generosa. Almoços simples na ilha custam €15-20/pessoa. As bebidas ao jantar (água, vinho, sumos) podem ficar abaixo dos €10/dia se forem partilhadas.',
  },
};

const ordemCategorias = ['hotel', 'voos', 'carros', 'ecotax', 'parking', 'gasolina', 'atracoes', 'refeicoes'];

tbody.innerHTML = ordemCategorias.map(key => {
  const c = categorias[key];
  return `
    <tr class="cost-row" data-cat="${key}">
      <th><span class="when-pill when-${c.when}">${c.when === 'ja' ? 'já' : 'depois'}</span> ${c.lbl}<span class="cost-arrow" aria-hidden="true">›</span></th>
      <td>${eur(c.val)}</td>
    </tr>
  `;
}).join('') + `
  <tr class="total">
    <th>Total da viagem</th>
    <td>${eur(totaisGlobais.total)}</td>
  </tr>
`;

// Bind clicks
document.querySelectorAll('.cost-row').forEach(row => {
  row.addEventListener('click', () => {
    const key = row.dataset.cat;
    openCategoryModal(categorias[key]);
  });
});

function openCategoryModal(cat) {
  const isJa = cat.when === 'ja';
  const linhasHTML = cat.linhas.map(l => {
    const isInfo = l.val === null;
    if (isInfo) {
      return `
        <li class="brk-row brk-info">
          <div class="brk-text">
            <p class="brk-label">${l.txt}</p>
            ${l.sub ? `<p class="brk-sub">${l.sub}</p>` : ''}
          </div>
        </li>
      `;
    }
    return `
      <li class="brk-row">
        <div class="brk-text">
          <p class="brk-label">${l.txt}</p>
          ${l.sub ? `<p class="brk-sub">${l.sub}</p>` : ''}
        </div>
        <p class="brk-val">${eur2(l.val)}</p>
      </li>
    `;
  }).join('');

  const html = `
    <div class="m-head">
      <p class="m-eyebrow">${cat.eyebrow}</p>
      <h2 class="m-title">${cat.titulo}</h2>
      <p class="m-sub">${cat.intro}</p>
    </div>

    <div class="m-totals m-totals-single">
      <div class="m-total-card ${isJa ? 'm-total-ja' : 'm-total-dep'}">
        <p class="m-tot-lbl">${isJa ? 'Pago já · Próximas semanas' : 'Pago durante a viagem'}</p>
        <p class="m-tot-val">${eur(cat.val)}</p>
      </div>
    </div>

    <div class="m-formula">
      <span class="m-formula-lbl">Como se calcula</span>
      <code>${cat.formula}</code>
    </div>

    <h3 class="m-sec">Detalhe</h3>
    <ul class="brk">${linhasHTML}</ul>

    ${cat.nota ? `<div class="m-note">${cat.nota}</div>` : ''}
  `;

  modalStack = [{ html }];
  showModal(html, false);
}


// =====================================================
// PAGAMENTOS — Reembolso dos VOOS já pagos pelo Adriano
// =====================================================
//
// Só os VOOS easyJet estão pagos (recibos KCL63HT e KCL63SQ).
// O hotel ainda não foi pago, por isso não entra aqui.
//
// COMO MARCAR PAGAMENTOS (hardcoded):
//   - Família inteira pagou:  pago: true   na família
//   - Só alguns membros pagaram: mete pago: true nesses membros
//   O estado da família é calculado automaticamente:
//     "pago" se todos os membros pagaram, "parcial" se alguns, senão "por pagar".

// Reservas pagas (recibos easyJet)
const reservasVoos = [
  {
    ref: 'KCL63HT',
    titulo: 'Voos easyJet · Grupo 1',
    detalhe: '16 pessoas · 5–10 set · inclui lugares e 5 malas',
    valor: 2957.30,
    metodo: 'MasterCard (Apple Pay) · 04/05/2026',
    doc: 'docs/voos-grupo1-KCL63HT.pdf',
  },
  {
    ref: 'KCL63SQ',
    titulo: 'Voos easyJet · Grupo 2',
    detalhe: '5 pessoas · 6–11 set · inclui lugares e 1 mala',
    valor: 756.78,
    metodo: 'MasterCard ····2515 · 04/05/2026',
    doc: 'docs/voos-grupo2-KCL63SQ.pdf',
  },
];

// Reembolso por família e por pessoa (só voos).
// Cada pessoa: { nome, voo, lugar, mala, pago }
//   - voo:   tarifa do bilhete (ida+volta)
//   - lugar: lugar selecionado (ida+volta); bebé = 0
//   - mala:  quota-parte da mala de porão da família (dividida por todos os membros)
//   - pago:  true se essa pessoa já reembolsou
const reembolsosVoos = [
  {
    familia: 'Alexandra', grupo: 1,
    nota: 'Adriano, Alexandra, Ana (4) e Aurora (bebé) · 1 mala dividida por 4',
    pessoas: [
      { nome: 'Adriano',    voo: 161.88, lugar: 17.48, mala: 10.24, pago: true },
      { nome: 'Alexandra',  voo: 161.88, lugar: 17.48, mala: 10.24, pago: true },
      { nome: 'Ana (4)',    voo: 161.88, lugar: 17.48, mala: 10.24, pago: true },
      { nome: 'Aurora (1)', voo: 62.00,  lugar: 0,     mala: 10.24, pago: true, obs: 'bebé · sem lugar próprio' },
    ],
  },
  {
    familia: 'Farrulo', grupo: 1,
    nota: 'Manuel R. e Conceição · 1 mala dividida por 2',
    pessoas: [
      { nome: 'Manuel R.',  voo: 161.88, lugar: 17.48, mala: 20.49, pago: false },
      { nome: 'Conceição',  voo: 161.88, lugar: 17.48, mala: 20.49, pago: false },
    ],
  },
  {
    familia: 'Pedro', grupo: 1,
    nota: 'Voa de outro local e comprou o próprio voo — não deve reembolso de voo.',
    pessoas: [
      { nome: 'Pedro', voo: 0, lugar: 0, mala: 0, pago: true, obs: 'voo à parte' },
    ],
  },
  {
    familia: 'Patricia', grupo: 1,
    nota: 'Patrícia, Michael, Madalena (8) e Emília (6) · 1 mala dividida por 4',
    pessoas: [
      { nome: 'Patrícia',     voo: 161.88, lugar: 17.48, mala: 10.24, pago: false },
      { nome: 'Michael',      voo: 161.88, lugar: 17.48, mala: 10.24, pago: false },
      { nome: 'Madalena (8)', voo: 161.88, lugar: 17.48, mala: 10.24, pago: false },
      { nome: 'Emília (6)',   voo: 161.88, lugar: 17.48, mala: 10.24, pago: false },
    ],
  },
  {
    familia: 'Carmo e Luís', grupo: 1,
    nota: 'Manuel O., Carmo, Luís e João Pedro · 1 mala (Carmo) dividida por 2',
    pessoas: [
      { nome: 'Manuel O.',  voo: 161.88, lugar: 17.48, mala: 20.49, pago: true },
      { nome: 'Carmo',      voo: 161.88, lugar: 17.48, mala: 20.49, pago: true },
      { nome: 'Luís',       voo: 161.88, lugar: 17.48, mala: 0, pago: true },
      { nome: 'João Pedro', voo: 161.88, lugar: 17.48, mala: 0, pago: true },
    ],
  },
  {
    familia: 'Ana Maria', grupo: 1,
    nota: 'Filipe e Ana Maria · 1 mala dividida por 2',
    pessoas: [
      { nome: 'Filipe',    voo: 161.88, lugar: 17.48, mala: 20.49, pago: false },
      { nome: 'Ana Maria', voo: 161.88, lugar: 17.48, mala: 20.49, pago: false },
    ],
  },
  {
    familia: 'Jorge', grupo: 2,
    nota: 'Família do Jorge · 6–11 set · 5 pessoas (2 quartos) · 1 mala dividida por 3',
    pessoas: [
      { nome: 'Tiago (17)',   voo: 125.48, lugar: 17.48, mala: 13.99, pago: false },
      { nome: 'Fátima',       voo: 125.48, lugar: 17.48, mala: 13.99, pago: false },
      { nome: 'Jorge',        voo: 125.48, lugar: 17.48, mala: 13.99, pago: false },
      { nome: 'Jorge Miguel', voo: 125.48, lugar: 17.48, mala: 0, pago: false, obs: 'filho do Jorge' },
      { nome: 'Susete',       voo: 125.48, lugar: 17.48, mala: 0, pago: false },
    ],
  },
];

// Helpers
const pessoaTotal = (p) => p.voo + p.lugar + p.mala;
const familiaTotal = (f) => f.pessoas.reduce((s, p) => s + pessoaTotal(p), 0);
const familiaPago  = (f) => f.pessoas.filter(p => p.pago).reduce((s, p) => s + pessoaTotal(p), 0);
function familiaEstado(f) {
  const pagos = f.pessoas.filter(p => p.pago).length;
  if (pagos === 0) return 'por pagar';
  if (pagos === f.pessoas.length) return 'pago';
  return 'parcial';
}

// --- Render reservas (recibos) ---
const payBookingsEl = document.getElementById('payBookings');
if (payBookingsEl) {
  payBookingsEl.innerHTML = reservasVoos.map(r => `
    <li class="pay-booking">
      <div class="pay-booking-info">
        <p class="pay-booking-title">${r.titulo}</p>
        <p class="pay-booking-detail">${r.detalhe}</p>
        <p class="pay-booking-method">${r.ref} · ${r.metodo}</p>
        ${r.doc ? `<a href="${r.doc}" target="_blank" rel="noopener" class="pay-doc-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6M9 13h6M9 17h6"/>
          </svg>
          <span>Ver recibo</span>
        </a>` : ''}
      </div>
      <p class="pay-booking-val">${eur(r.valor)}</p>
    </li>
  `).join('');

  const totalVoos = reservasVoos.reduce((s, r) => s + r.valor, 0);
  document.getElementById('payTotalAdiantado').textContent = eur(totalVoos);
}

// --- Render reembolsos por família (com detalhe por pessoa) ---
const payFamiliesEl = document.getElementById('payFamilies');
if (payFamiliesEl) {
  payFamiliesEl.innerHTML = reembolsosVoos.map((f, i) => {
    const total = familiaTotal(f);
    const estado = familiaEstado(f);
    const estadoLabel = { 'pago': 'pago', 'parcial': 'parcial', 'por pagar': 'por pagar' }[estado];
    const estadoClass = { 'pago': 'pay-fam-paga', 'parcial': 'pay-fam-parcial', 'por pagar': '' }[estado];

    const pessoasHTML = f.pessoas.map(p => {
      const pt = pessoaTotal(p);
      const partes = [`voo ${eur2(p.voo)}`];
      if (p.lugar) partes.push(`lugar ${eur2(p.lugar)}`);
      if (p.mala) partes.push(`mala ${eur2(p.mala)}`);
      return `
        <li class="pay-pessoa ${p.pago ? 'pay-pessoa-paga' : ''}">
          <span class="pay-pessoa-check">${p.pago ? '✓' : '○'}</span>
          <div class="pay-pessoa-info">
            <span class="pay-pessoa-nome">${p.nome}</span>
            <span class="pay-pessoa-detail">${partes.join(' · ')}${p.obs ? ` · ${p.obs}` : ''}</span>
          </div>
          <span class="pay-pessoa-val">${pt > 0 ? eur2(pt) : '—'}</span>
        </li>
      `;
    }).join('');

    return `
      <li class="pay-fam ${estadoClass}">
        <button class="pay-fam-head" data-idx="${i}" aria-expanded="false">
          <div class="pay-fam-info">
            <p class="pay-fam-name">${f.familia}<span class="pay-fam-chevron" aria-hidden="true">⌄</span></p>
            <p class="pay-fam-nota">${f.nota}</p>
          </div>
          <div class="pay-fam-amt">
            <p class="pay-fam-total">${eur(total)}</p>
            <p class="pay-fam-status">${estadoLabel}</p>
          </div>
        </button>
        <ul class="pay-pessoas" hidden>
          ${pessoasHTML}
        </ul>
      </li>
    `;
  }).join('');

  // Toggle expand/collapse
  payFamiliesEl.querySelectorAll('.pay-fam-head').forEach(btn => {
    btn.addEventListener('click', () => {
      const li = btn.closest('.pay-fam');
      const lista = li.querySelector('.pay-pessoas');
      const aberto = !lista.hidden;
      lista.hidden = aberto;
      btn.setAttribute('aria-expanded', String(!aberto));
      li.classList.toggle('pay-fam-open', !aberto);
    });
  });

  // Summary
  const totalDevido = reembolsosVoos.reduce((s, f) => s + familiaTotal(f), 0);
  const totalPago = reembolsosVoos.reduce((s, f) => s + familiaPago(f), 0);
  const emFalta = totalDevido - totalPago;
  const nFamPagas = reembolsosVoos.filter(f => familiaEstado(f) === 'pago').length;
  const nFamTotal = reembolsosVoos.filter(f => familiaTotal(f) > 0).length;

  document.getElementById('paySummary').innerHTML = `
    <div class="pay-sum-row">
      <span>Já reembolsado</span>
      <strong class="pay-sum-pago">${eur(totalPago)}</strong>
    </div>
    <div class="pay-sum-row">
      <span>Em falta</span>
      <strong class="pay-sum-falta">${eur(emFalta)}</strong>
    </div>
    <div class="pay-sum-bar">
      <div class="pay-sum-fill" style="width: ${totalDevido > 0 ? (totalPago/totalDevido*100) : 0}%"></div>
    </div>
    <p class="pay-sum-note">${nFamPagas} de ${nFamTotal} famílias acertaram · total a reembolsar ${eur(totalDevido)}</p>
  `;
}

// =====================================================
// Abertura de tab via URL (#pagamentos, #programa, etc.)
// Corre no fim, quando tudo já está definido. Cobre o caso de a
// sessão já estar desbloqueada ao carregar a página.
// =====================================================
if (!app.hidden) {
  openTabFromHash();
}

// =====================================================
// Copiar dados de pagamento (MBWay / IBAN)
// =====================================================
document.querySelectorAll('.pay-method').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const texto = btn.dataset.copy;
    const label = btn.querySelector('.pay-method-copy');
    const original = label ? label.textContent : '';
    try {
      await navigator.clipboard.writeText(texto);
      if (label) {
        label.textContent = 'copiado ✓';
        btn.classList.add('pay-method-done');
        setTimeout(() => {
          label.textContent = original;
          btn.classList.remove('pay-method-done');
        }, 1800);
      }
    } catch (e) {
      // Fallback: seleção manual via prompt se o clipboard não estiver disponível
      if (label) {
        label.textContent = 'copia: ' + texto;
        setTimeout(() => { label.textContent = original; }, 3000);
      }
    }
  });
});
