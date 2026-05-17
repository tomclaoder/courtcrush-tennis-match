const profiles = [
  { name: 'Maya', age: 28, img: 'assets/maya.png', tagline: 'Clay-court grinder, post-match espresso believer, looking for mixed doubles chemistry.', chips: ['LK 18', 'Baseliner', 'Sunday noon'] },
  { name: 'Leo', age: 31, img: 'assets/leo.png', tagline: 'Serve + volley romantic. Will bring new balls and terrible puns.', chips: ['LK 20', 'Net player', 'Doubles'] },
  { name: 'Sam', age: 27, img: 'assets/sam.png', tagline: 'Topspin-heavy rallies, chill tie-break energy, always up for a ladder match.', chips: ['LK 16', 'Lefty', 'After work'] },
  { name: 'Nina', age: 35, img: 'assets/nina.png', tagline: 'Reliable partner, tactical lobs, allergic to no-shows.', chips: ['LK 21', 'Doubles captain', 'Indoor'] },
  { name: 'Amir', age: 29, img: 'assets/amir.png', tagline: 'Big forehand, bigger sportsmanship. Searching for a steady rally partner.', chips: ['LK 20', 'Forehand weapon', 'Weekend'] }
];

const deck = document.querySelector('#deck');
const template = document.querySelector('#card-template');
const toast = document.querySelector('#toast');
const remaining = document.querySelector('#remaining');
const matches = document.querySelector('#matches');
let cards = [];
let matchCount = 0;
let active = null;
let toastTimer;

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1300);
}

function renderDeck() {
  deck.innerHTML = '';
  matchCount = 0;
  profiles.slice().reverse().forEach((profile, i) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.name = profile.name;
    node.querySelector('img').src = profile.img;
    node.querySelector('img').alt = `${profile.name} tennis profile photo`;
    node.querySelector('h2').textContent = profile.name;
    node.querySelector('.age').textContent = profile.age;
    node.querySelector('.tagline').textContent = profile.tagline;
    node.querySelector('.chips').innerHTML = profile.chips.map(c => `<span>${c}</span>`).join('');
    node.style.zIndex = i + 1;
    node.style.transform = `translateY(${(profiles.length - i - 1) * 7}px) scale(${1 - (profiles.length - i - 1) * 0.018})`;
    addDrag(node);
    deck.appendChild(node);
  });
  cards = [...deck.querySelectorAll('.card')];
  updateCounts();
}

function updateCounts() {
  const left = deck.querySelectorAll('.card').length;
  remaining.textContent = `${left} player${left === 1 ? '' : 's'}`;
  matches.textContent = `${matchCount} match${matchCount === 1 ? '' : 'es'}`;
  if (!left) {
    deck.innerHTML = `<div class="empty"><h2>All swiped!</h2><p>Reset the deck to scout more CourtCrush profiles.</p></div>`;
  }
}

function addDrag(card) {
  const state = { startX: 0, startY: 0, dx: 0, dy: 0, pointerId: null };

  card.addEventListener('pointerdown', e => {
    if (topCard() !== card) return;
    active = card;
    state.pointerId = e.pointerId;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.dx = state.dy = 0;
    card.classList.remove('snapback', 'removing');
    card.setPointerCapture(e.pointerId);
  });

  card.addEventListener('pointermove', e => {
    if (active !== card || e.pointerId !== state.pointerId) return;
    state.dx = e.clientX - state.startX;
    state.dy = e.clientY - state.startY;
    const rotate = state.dx / 18;
    card.style.transform = `translate(${state.dx}px, ${state.dy}px) rotate(${rotate}deg)`;
    const power = Math.min(Math.abs(state.dx) / 120, 1);
    card.querySelector('.like-stamp').style.opacity = state.dx > 0 ? power : 0;
    card.querySelector('.nope-stamp').style.opacity = state.dx < 0 ? power : 0;
  });

  card.addEventListener('pointerup', e => finish(e));
  card.addEventListener('pointercancel', e => finish(e));

  function finish(e) {
    if (active !== card || e.pointerId !== state.pointerId) return;
    active = null;
    const threshold = Math.min(120, window.innerWidth * 0.28);
    if (Math.abs(state.dx) > threshold) {
      swipe(card, state.dx > 0 ? 'right' : 'left');
    } else {
      card.classList.add('snapback');
      card.style.transform = '';
      card.querySelector('.like-stamp').style.opacity = 0;
      card.querySelector('.nope-stamp').style.opacity = 0;
    }
  }
}

function topCard() {
  const all = [...deck.querySelectorAll('.card')];
  return all[all.length - 1];
}

function swipe(card, direction) {
  if (!card) return;
  card.classList.add('removing');
  const x = direction === 'right' ? window.innerWidth * 1.35 : -window.innerWidth * 1.35;
  const rot = direction === 'right' ? 28 : -28;
  card.querySelector('.like-stamp').style.opacity = direction === 'right' ? 1 : 0;
  card.querySelector('.nope-stamp').style.opacity = direction === 'left' ? 1 : 0;
  card.style.transform = `translate(${x}px, -40px) rotate(${rot}deg)`;
  card.style.opacity = '0';
  if (direction === 'right' || direction === 'super') {
    matchCount += 1;
    showToast(`Match request sent to ${card.dataset.name} 🎾`);
  } else {
    showToast(`Passed on ${card.dataset.name}`);
  }
  setTimeout(() => {
    card.remove();
    restack();
    updateCounts();
  }, 360);
}

function restack() {
  const all = [...deck.querySelectorAll('.card')];
  all.forEach((card, idx) => {
    const depth = all.length - idx - 1;
    card.style.zIndex = idx + 1;
    card.style.transform = `translateY(${depth * 7}px) scale(${1 - depth * 0.018})`;
    card.style.opacity = '1';
    card.querySelector('.like-stamp').style.opacity = 0;
    card.querySelector('.nope-stamp').style.opacity = 0;
  });
}

document.querySelector('#like').addEventListener('click', () => swipe(topCard(), 'right'));
document.querySelector('#nope').addEventListener('click', () => swipe(topCard(), 'left'));
document.querySelector('#super').addEventListener('click', () => {
  const card = topCard();
  if (!card) return;
  matchCount += 1;
  showToast(`Super liked ${card.dataset.name} ⭐`);
  swipe(card, 'right');
});
document.querySelector('#reset').addEventListener('click', renderDeck);
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') swipe(topCard(), 'right');
  if (e.key === 'ArrowLeft') swipe(topCard(), 'left');
});

renderDeck();
