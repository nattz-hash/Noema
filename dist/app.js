import { cardsById, deck, suits } from './deck.js';

const main = document.querySelector('main');
const nav = document.querySelector('#nav');
const searchLink = document.querySelector('#search-link');
const backArt = './assets/card-back.svg';
const storageKey = 'noema.latest-readings.v1';
const prettyDate = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
const shortDate = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const dateKey = new Intl.DateTimeFormat('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
const positions = [
  { name: 'Past', label: 'Dåtid', prompt: 'Det som formade utgångsläget.' },
  { name: 'Present', label: 'Nutid', prompt: 'Det som behöver uppmärksamhet nu.' },
  { name: 'Future', label: 'Framtid', prompt: 'En möjlig riktning utifrån nuläget.' },
];

const paths = {
  home: '<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-7h6v7"/>',
  book: '<path d="M12 6c-3.6-2.8-6.8-3-10-1v14c3.2-2 6.4-1.8 10 1 3.6-2.8 6.8-3 10-1V5c-3.2-2-6.4-1.8-10 1zm0 0v14"/>',
  layers: '<rect x="8" y="4" width="12" height="16" rx="2" transform="rotate(11 14 12)"/><path d="M5.6 5.5 4.2 5.7A2 2 0 0 0 2.5 8l1.6 11a2 2 0 0 0 2.3 1.7l1-.2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4 4"/>',
  arrow: '<path d="M4.5 12h14m-5-5 5 5-5 5"/>',
  back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
  star: '<path d="M12 2.5c.7 5.5 4 8.8 9.5 9.5-5.5.7-8.8 4-9.5 9.5-.7-5.5-4-8.8-9.5-9.5 5.5-.7 8.8-4 9.5-9.5Z"/>',
  flame: '<path d="M12 3c1.2 4.5 4.5 5.8 5.7 8.8 1.8 4.5-.9 8.7-5.7 8.7s-7.1-3.8-6-7.5c.5-1.7 1.7-3.1 3.1-4.1-.1 2.2.8 3.2 1.7 3.7C12.2 9 12.6 6 12 3Z"/>',
  cup: '<path d="M6 4h12v4a6 6 0 0 1-12 0V4Zm6 10v6m-4 0h8"/>',
  sword: '<path d="m5 19 3-3m-2-2 4 4m-2-2L19 5l-4 1-7 7 3 3 7-7 1-4"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="m12 5 2 4 4.5.7-3.2 3.2.7 4.6-4-2.2-4 2.2.7-4.6-3.2-3.2L10 9Z"/>',
  up: '<path d="M12 20V4m-5 5 5-5 5 5"/>',
  down: '<path d="M12 4v16m-5-5 5 5 5-5"/>',
  reset: '<path d="M4 10a8 8 0 1 1 1.6 7m-1.6-7V4m0 6h6"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
};

function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function cardLink(card, from = 'bibliotek', reversed = false) {
  return `#kort/${card.id}?fran=${from}${reversed ? '&amp;lage=reversed' : ''}`;
}

function image(card, { reversed = false, describe = false, eager = false } = {}) {
  return `<img class="card-image${reversed ? ' is-reversed' : ''}" src="./assets/${card.id}.webp" alt="${describe ? card.imagery : ''}" width="420" height="710" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function tagList(card) {
  return `<ul class="keywords" aria-label="Nyckelord">${card.keywords.map((word) => `<li>${word}</li>`).join('')}</ul>`;
}

function cardTile(card, from) {
  const suit = suits[card.suit];
  return `<a class="card-tile surface" href="${cardLink(card, from)}">
    <span class="tile-art tone-${card.suit}">${image(card)}</span>
    <span class="tile-info">
      <span class="tile-meta">${card.number} <span aria-hidden="true">·</span> ${suit.name}</span>
      <strong>${card.name}</strong>
      <span class="tile-words">${card.keywords.slice(0, 2).join(' · ')}</span>
    </span>
    <span class="tile-arrow">${icon('arrow')}</span>
  </a>`;
}

function shortcut({ href, glyph, title, description, variant }) {
  return `<a class="shortcut surface" href="${href}">
    <span class="shortcut-icon ${variant}">${icon(glyph)}</span>
    <span><strong>${title}</strong><span class="shortcut-description">${description}</span></span>
    <span class="shortcut-arrow">${icon('arrow')}</span>
  </a>`;
}

function home() {
  const examples = ['major-17', 'major-2', 'major-18', 'pentacles-3'].map((id) => cardsById.get(id));
  return `<section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">${icon('star')} Rider–Waite–Smith</p>
      <h1>Tarot på <em>djupet.</em></h1>
      <p>Studera kortens symbolik, fördjupa dina tolkningar och pröva dem i en läggning.</p>
      <div class="hero-actions">
        <a class="button primary" href="#bibliotek">${icon('book')} Utforska korten</a>
        <a class="button secondary" href="#dagens">${icon('sun')} Dagens kort</a>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="hero-deck">
        <img class="hero-card hero-left" src="${backArt}" alt="" width="220" height="375">
        <img class="hero-card hero-right" src="${backArt}" alt="" width="220" height="375">
        <img class="hero-card hero-center" src="./assets/major-17.webp" alt="" width="420" height="710" fetchpriority="high">
      </div>
    </div>
  </section>
  <section class="home-section" aria-labelledby="practice-heading">
    <div class="section-heading"><h2 id="practice-heading">Gör en läggning</h2></div>
    <div class="shortcuts">
      ${shortcut({href: '#dagens', glyph: 'sun', title: 'Dagens kort', description: 'Ett kort för dagens reflektion', variant: 'lilac'})}
      ${shortcut({href: '#trekort', glyph: 'layers', title: 'Trekortsläggning', description: 'Past · Present · Future', variant: 'sage'})}
    </div>
  </section>
  <section class="home-section" aria-labelledby="library-heading">
    <div class="section-heading"><h2 id="library-heading">Ur kortbiblioteket</h2><a class="text-link" href="#bibliotek">Alla 78 kort ${icon('arrow')}</a></div>
    <div class="cards-grid">${examples.map((card) => cardTile(card, 'hem')).join('')}</div>
  </section>`;
}

let query = '';
let activeSuit = 'all';
const normalize = (value) => value.toLocaleLowerCase('sv-SE').normalize('NFD').replace(/\p{M}/gu, '');
const indexedCards = deck.map((card) => ({
  card,
  index: normalize([card.name, card.english, card.number, suits[card.suit].name, suits[card.suit].swedish, ...card.keywords].join(' ')),
}));

function library() {
  const filters = [{ id: 'all', name: 'Alla kort' }, ...Object.entries(suits).map(([id, suit]) => ({ id, ...suit }))];
  return `<section class="view-heading"><h1>Kortbibliotek</h1>
    <p>78 Rider–Waite–Smith-kort med bildsymbolik och upprätta och omvända tolkningar.</p></section>
  <div class="library-controls">
    <div class="search-box surface">
      ${icon('search')}<input id="card-search" type="search" placeholder="Sök kort, svit eller nyckelord" aria-label="Sök kort, svit eller nyckelord" autocomplete="off">
      <button type="button" class="clear-search" id="clear-search" aria-label="Rensa sökningen" hidden>${icon('x')}</button>
    </div>
    <div class="filters" aria-label="Filtrera efter svit">
      ${filters.map(({ id, name, mark }) => `<button type="button" class="filter" data-suit="${id}" aria-pressed="${id === activeSuit}">${mark ? icon(mark) : ''}${name}</button>`).join('')}
    </div>
  </div>
  <p class="results-count" id="results-count" role="status"></p>
  <div class="cards-grid library-grid" id="card-results"></div>`;
}

function updateLibrary() {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const results = indexedCards.filter(({ card, index }) =>
    (activeSuit === 'all' || activeSuit === card.suit) && terms.every((term) => index.includes(term)),
  );
  document.querySelector('#results-count').textContent = `${results.length} kort`;
  document.querySelector('#clear-search').hidden = !query;
  document.querySelectorAll('[data-suit]').forEach((button) => button.setAttribute('aria-pressed', button.dataset.suit === activeSuit));
  document.querySelector('#card-results').innerHTML = results.length
    ? results.map(({ card }) => cardTile(card, 'bibliotek')).join('')
    : `<div class="empty-state surface">${icon('search')}<h2>Inga kort hittades</h2><p>Prova ett annat ord eller visa hela leken.</p><button type="button" class="button secondary" data-action="clear-filters">Visa alla kort</button></div>`;
}

const parentRoutes = { hem: 'Startsida', bibliotek: 'Kortbibliotek', dagens: 'Dagens kort', trekort: 'Trekortsläggning' };
function detail(card, from, reversed) {
  const suit = suits[card.suit];
  return `<a class="back-link" href="#${from}">${icon('back')} ${parentRoutes[from]}</a>
  <article class="detail surface">
    <div class="detail-art tone-${card.suit}">
      <div id="detail-image">${image(card, { reversed, describe: true, eager: true })}</div>
    </div>
    <div class="detail-copy">
      <p class="eyebrow">${icon(suit.mark)} ${card.number} · ${suit.name}${suit.element ? ` · ${suit.element}` : ''}</p>
      <h1>${card.name}</h1>
      <p class="english-name">${card.english}</p>
      ${tagList(card)}
      <div class="orientation-tabs" role="group" aria-label="Kortets orientering">
        <button type="button" data-action="orientation" data-reversed="false" aria-pressed="${!reversed}">${icon('up')} Upprätt</button>
        <button type="button" data-action="orientation" data-reversed="true" aria-pressed="${reversed}">${icon('down')} Omvänt</button>
      </div>
      <div class="meaning" id="detail-meaning" aria-live="polite">
        <h2>${reversed ? 'Omvänd betydelse' : 'Upprätt betydelse'}</h2>
        <p>${reversed ? card.reversed : card.upright}</p>
      </div>
      <div class="meaning image-meaning"><h2>Bildsymbolik</h2><p>${card.imagery}</p></div>
    </div>
  </article>`;
}

function readings() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function validDraw(item) {
  return item && cardsById.has(item.id) && typeof item.reversed === 'boolean';
}

let recent = readings();
function saveReading(type, reading) {
  recent = { ...recent, [type]: reading };
  try {
    localStorage.setItem(storageKey, JSON.stringify(recent));
  } catch {
    // A private or full browser store still allows readings in this session.
  }
}

function dailyReading() {
  const saved = recent.daily;
  return saved?.day === dateKey.format(new Date()) && validDraw(saved.card) ? saved.card : null;
}

function lastSpread() {
  const saved = recent.spread;
  const validDate = typeof saved?.date === 'number' && Number.isFinite(new Date(saved.date).getTime());
  const validCards = Array.isArray(saved?.cards) && saved.cards.length === 3 && saved.cards.every(validDraw) && new Set(saved.cards.map(({ id }) => id)).size === 3;
  return validDate && validCards ? saved : null;
}

function drawCards(count) {
  const available = [...deck];
  return Array.from({ length: count }, () => {
    const index = Math.floor(Math.random() * available.length);
    const [card] = available.splice(index, 1);
    return { id: card.id, reversed: Math.random() < 0.5 };
  });
}

function flipCard({ drawn, action, index, label, animate = false }) {
  const card = drawn ? cardsById.get(drawn.id) : null;
  const content = `<span class="flip-inner">
    <span class="flip-back"><img src="${backArt}" alt="" width="220" height="375"></span>
    ${card ? `<span class="flip-face">${image(card, { reversed: drawn.reversed, eager: true })}</span>` : ''}
  </span>`;
  if (card) {
    return `<span class="flip is-open${animate ? ' flipping' : ''}" role="img" aria-label="${card.name}, ${drawn.reversed ? 'omvänt' : 'upprätt'}">${content}</span>`;
  }
  return `<button type="button" class="flip flip-trigger" data-action="${action}" ${index === undefined ? '' : `data-index="${index}"`} aria-label="${label}">${content}</button>`;
}

function orientation(draw) {
  return `<span class="orientation ${draw.reversed ? 'reversed' : ''}">${icon(draw.reversed ? 'down' : 'up')}${draw.reversed ? 'Omvänt' : 'Upprätt'}</span>`;
}

function daily(animate = false) {
  const drawn = dailyReading();
  const card = drawn ? cardsById.get(drawn.id) : null;
  return `<a class="back-link" href="#laggningar">${icon('back')} Läggningar</a>
  <section class="view-heading"><h1>Dagens kort</h1><p class="date-label">${prettyDate.format(new Date())}</p></section>
  <div class="daily-layout surface">
    <div class="draw-stage">${flipCard({ drawn, action: 'draw-daily', label: 'Dra och vänd dagens kort', animate })}</div>
    <div class="draw-copy">
      ${card ? `<div class="draw-meta">${orientation(drawn)}<span>${suits[card.suit].name}</span></div>
        <h2 id="daily-result" tabindex="-1">${card.name}</h2>
        ${tagList(card)}
        <p>${drawn.reversed ? card.reversed : card.upright}</p>
        <a class="button secondary" href="${cardLink(card, 'dagens', drawn.reversed)}">Läs kortbetydelsen ${icon('arrow')}</a>`
        : `<h2>Vänd ett kort</h2><p>Låt ett kort ge dig något att undersöka i dag. Du kan öppna samma dragning igen under dagen.</p>
        <button type="button" class="button primary" data-action="draw-daily">${icon('sun')} Dra dagens kort</button>`}
    </div>
  </div>`;
}

function spreads() {
  const saved = lastSpread();
  return `<section class="view-heading"><h1>Tarotläggningar</h1>
    <p>Välj en daglig reflektion eller läs tre kort i relation till varandra.</p></section>
  <div class="shortcuts">
    ${shortcut({href: '#dagens', glyph: 'sun', title: 'Dagens kort', description: dailyReading() ? 'Visa dagens dragning' : 'Ett kort för dagens reflektion', variant: 'lilac'})}
    ${shortcut({href: '#trekort', glyph: 'layers', title: 'Trekortsläggning', description: 'Past · Present · Future', variant: 'sage'})}
  </div>
  ${saved ? `<section class="home-section"><div class="section-heading"><h2>Senaste trekortsläggningen</h2></div>
    <a class="saved-spread surface" href="#trekort?senaste=1">
      <span><strong>${saved.cards.map(({ id }) => cardsById.get(id).name).join(' · ')}</strong>
      <span class="shortcut-description">${shortDate.format(saved.date)}</span></span>${icon('arrow')}
    </a></section>` : ''}`;
}

let spreadCards = [];
let revealed = new Set();

function summary() {
  const [past, present, future] = spreadCards.map(({ id }) => cardsById.get(id));
  const [pastKey, nowKey, nextKey] = [past, present, future].map((card) => card.keywords[0]);
  const repeatedSuit = Object.keys(suits).find((suit) => [past, present, future].filter((card) => card.suit === suit).length >= 2);
  const repeatedTheme = {
    major: 'Flera stora arkanakort ger skäl att läsa positionerna som delar av en större förändring.',
    wands: 'De återkommande stavarna riktar uppmärksamheten mot drivkraft och handling.',
    cups: 'De återkommande bägarna betonar hur känslor och relationer påverkar övergången.',
    swords: 'De återkommande svärden betonar tankemönster, språk och beslut.',
    pentacles: 'De återkommande mynten betonar resurser, vardagsvillkor och det som byggs över tid.',
  };
  return `<section class="spread-summary surface" aria-labelledby="summary-heading">
    <h2 id="summary-heading" tabindex="-1">Läs korten tillsammans</h2>
    <p>Jämför hur temat <strong>${pastKey}</strong> i Past kan ha format <strong>${nowKey}</strong> i Present. Vad i nuläget ger <strong>${nextKey}</strong> utrymme i Future?</p>
    ${repeatedSuit ? `<p>${repeatedTheme[repeatedSuit]}</p>` : ''}
  </section>`;
}

function spread(animate = new Set()) {
  const hasCards = spreadCards.length === 3;
  const completed = revealed.size === 3;
  return `<a class="back-link" href="#laggningar">${icon('back')} Läggningar</a>
  <section class="view-heading"><h1>Trekortsläggning</h1><p>Se hur bakgrunden formar nuläget och vilken riktning som kan öppna sig.</p></section>
  <section class="spread-stage surface" aria-label="Trekortsläggningens positioner">
    <div class="position-grid">
      ${positions.map(({ name, label, prompt }, index) => {
        const item = revealed.has(index) ? spreadCards[index] : null;
        const card = item ? cardsById.get(item.id) : null;
        return `<div class="position">
          <h2>${name}</h2><p class="position-caption" lang="sv">${label}</p>
          ${hasCards ? flipCard({ drawn: item, action: 'flip-position', index, label: `Vänd ${name}`, animate: animate.has(index) })
            : `<span class="flip"><img src="${backArt}" alt="" width="220" height="375"></span>`}
          <p class="position-note">${card ? card.name : prompt}</p>
        </div>`;
      }).join('')}
    </div>
    <div class="spread-actions">
      ${hasCards
        ? (completed
          ? `<button type="button" class="button secondary" data-action="start-spread">${icon('reset')} Ny läggning</button>`
          : `<button type="button" class="button primary" data-action="flip-all">${icon('layers')} Vänd alla kort</button>`)
        : `<button type="button" class="button primary" data-action="start-spread">${icon('layers')} Dra tre kort</button>`}
    </div>
  </section>
  ${revealed.size ? `<div class="position-readings">${positions.map(({ name, prompt }, index) => {
    if (!revealed.has(index)) return '';
    const item = spreadCards[index];
    const card = cardsById.get(item.id);
    return `<article class="position-reading surface">
      <div class="draw-meta"><span class="position-label">${name}</span>${orientation(item)}</div>
      <h2>${card.name}</h2><p class="position-context">${prompt}</p>
      <p>${item.reversed ? card.reversed : card.upright}</p>
      <a class="text-link" href="${cardLink(card, 'trekort', item.reversed)}">Kortbetydelse ${icon('arrow')}</a>
    </article>`;
  }).join('')}</div>` : ''}
  ${completed ? summary() : ''}`;
}

function getRoute() {
  const [raw, queryString] = location.hash.slice(1).split('?');
  const [page, id] = (raw || 'hem').split('/');
  return { page, id, params: new URLSearchParams(queryString) };
}

function updateNav(page, from) {
  const current = page === 'kort' ? (from === 'bibliotek' ? 'bibliotek' : from === 'hem' ? 'hem' : 'laggningar')
    : ['dagens', 'trekort'].includes(page) ? 'laggningar' : page;
  const items = [
    { id: 'hem', glyph: 'home', label: 'Start' },
    { id: 'bibliotek', glyph: 'book', label: 'Kortbibliotek' },
    { id: 'laggningar', glyph: 'layers', label: 'Läggningar' },
  ];
  nav.innerHTML = items.map(({ id, glyph, label }) =>
    `<a href="#${id}" ${id === current ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span></a>`,
  ).join('');
}

function focusElement(selector) {
  main.querySelector(selector)?.focus({ preventScroll: true });
}

function render({ focus = false } = {}) {
  const { page, id, params } = getRoute();
  const from = Object.prototype.hasOwnProperty.call(parentRoutes, params.get('fran')) ? params.get('fran') : 'bibliotek';
  let title = '';
  switch (page) {
    case 'bibliotek': {
      title = 'Kortbibliotek';
      main.innerHTML = library();
      const input = main.querySelector('#card-search');
      input.value = query;
      updateLibrary();
      break;
    }
    case 'kort': {
      const card = cardsById.get(id);
      title = card?.name ?? 'Kortet saknas';
      main.innerHTML = card ? detail(card, from, params.get('lage') === 'reversed') : `<section class="view-heading"><h1>Kortet hittades inte</h1><a class="text-link" href="#bibliotek">${icon('back')} Till kortbiblioteket</a></section>`;
      break;
    }
    case 'laggningar':
      title = 'Tarotläggningar';
      main.innerHTML = spreads();
      break;
    case 'dagens':
      title = 'Dagens kort';
      main.innerHTML = daily();
      break;
    case 'trekort': {
      title = 'Trekortsläggning';
      if (params.get('senaste') === '1') {
        const saved = lastSpread();
        if (saved) {
          spreadCards = saved.cards;
          revealed = new Set([0, 1, 2]);
        }
        history.replaceState(null, '', '#trekort');
      }
      main.innerHTML = spread();
      break;
    }
    default:
      main.innerHTML = home();
  }
  updateNav(title ? page : 'hem', from);
  document.title = title ? `${title} · Noema` : 'Noema · Tarot på djupet';
  if (focus) window.scrollTo(0, 0);
  if (page === 'bibliotek' && params.get('sok') === '1') {
    focusElement('#card-search');
  } else if (focus) {
    main.focus({ preventScroll: true });
  }
}

function reveal(indices) {
  const newlyRevealed = new Set(indices.filter((index) => !revealed.has(index)));
  for (const index of newlyRevealed) revealed.add(index);
  if (revealed.size === 3) saveReading('spread', { date: Date.now(), cards: spreadCards });
  main.innerHTML = spread(newlyRevealed);
  if (revealed.size === 3) focusElement('[data-action="start-spread"]');
  else focusElement('[data-action="flip-position"]');
}

main.addEventListener('input', (event) => {
  if (event.target.id !== 'card-search') return;
  query = event.target.value;
  updateLibrary();
});

main.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.suit) {
    activeSuit = button.dataset.suit;
    updateLibrary();
    return;
  }
  if (button.id === 'clear-search' || button.dataset.action === 'clear-filters') {
    query = '';
    if (button.dataset.action === 'clear-filters') activeSuit = 'all';
    const input = main.querySelector('#card-search');
    input.value = '';
    updateLibrary();
    input.focus();
    return;
  }
  switch (button.dataset.action) {
    case 'orientation': {
      const card = cardsById.get(getRoute().id);
      if (!card) return;
      const reversed = button.dataset.reversed === 'true';
      main.querySelectorAll('[data-action="orientation"]').forEach((tab) => tab.setAttribute('aria-pressed', tab === button));
      main.querySelector('#detail-image img').classList.toggle('is-reversed', reversed);
      main.querySelector('#detail-meaning').innerHTML = `<h2>${reversed ? 'Omvänd betydelse' : 'Upprätt betydelse'}</h2><p>${reversed ? card.reversed : card.upright}</p>`;
      break;
    }
    case 'draw-daily': {
      if (dailyReading()) return;
      const [card] = drawCards(1);
      saveReading('daily', { day: dateKey.format(new Date()), card });
      main.innerHTML = daily(true);
      focusElement('#daily-result');
      break;
    }
    case 'start-spread':
      spreadCards = drawCards(3);
      revealed = new Set();
      main.innerHTML = spread();
      focusElement('[data-action="flip-position"]');
      break;
    case 'flip-position':
      reveal([Number(button.dataset.index)]);
      break;
    case 'flip-all':
      reveal([0, 1, 2]);
      break;
  }
});

window.addEventListener('hashchange', () => render({ focus: true }));
window.addEventListener('storage', (event) => {
  if (event.key !== storageKey && event.key !== null) return;
  recent = readings();
  if (['dagens', 'laggningar'].includes(getRoute().page)) render();
});
searchLink.innerHTML = icon('search');
searchLink.addEventListener('click', () => {
  if (getRoute().page === 'bibliotek') focusElement('#card-search');
});
document.querySelector('.skip-link').addEventListener('click', (event) => {
  event.preventDefault();
  main.focus();
});
render();
