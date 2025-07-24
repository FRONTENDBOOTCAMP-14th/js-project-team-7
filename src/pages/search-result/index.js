const destinations = [
  { name: '알래스카', landmarks: 19, image: '/src/assets/travel-card-image.svg' },
  { name: '하와이', landmarks: 12, image: '/src/assets/travel-card-image.svg' },
  { name: '파리', landmarks: 34, image: '/src/assets/travel-card-image.svg' },
  { name: '도쿄', landmarks: 25, image: '/src/assets/travel-card-image.svg' },
  { name: '로마', landmarks: 28, image: '/src/assets/travel-card-image.svg' },
  { name: '런던', landmarks: 20, image: '/src/assets/travel-card-image.svg' },
  { name: '뉴욕', landmarks: 40, image: '/src/assets/travel-card-image.svg' },
  { name: '바르셀로나', landmarks: 18, image: '/src/assets/travel-card-image.svg' },
  { name: '베를린', landmarks: 22, image: '/src/assets/travel-card-image.svg' },
  { name: '시드니', landmarks: 17, image: '/src/assets/travel-card-image.svg' },
  { name: '방콕', landmarks: 27, image: '/src/assets/travel-card-image.svg' },
  { name: '싱가포르', landmarks: 14, image: '/src/assets/travel-card-image.svg' },
  { name: '이스탄불', landmarks: 21, image: '/src/assets/travel-card-image.svg' },
  { name: '두바이', landmarks: 16, image: '/src/assets/travel-card-image.svg' },
  { name: '홍콩', landmarks: 13, image: '/src/assets/travel-card-image.svg' },
  { name: '쿠알라룸푸르', landmarks: 15, image: '/src/assets/travel-card-image.svg' },
  { name: '카이로', landmarks: 23, image: '/src/assets/travel-card-image.svg' },
  { name: '라스베이거스', landmarks: 19, image: '/src/assets/travel-card-image.svg' },
  { name: '암스테르담', landmarks: 20, image: '/src/assets/travel-card-image.svg' },
  { name: '프라하', landmarks: 18, image: '/src/assets/travel-card-image.svg' },
];

const DETAIL_PATH = '/detail/';

const searchList = document.getElementById('search_list');
const viewMoreButton = document.getElementById('view_more_button');
const searchListTitle = document.getElementById('search_list_title');

let currentIndex = 0;
const ITEMS_PER_LOAD = 8;

if (searchList && viewMoreButton && searchListTitle) {
  searchListTitle.textContent = `총 ${destinations.length}개의 도시 검색 결과`;

  renderCards();
  viewMoreButton.addEventListener('click', renderCards);
}

function renderCards() {
  const nextIndex = currentIndex + ITEMS_PER_LOAD;
  const slice = destinations.slice(currentIndex, nextIndex);

  slice.forEach(({ name, landmarks, image }) => {
    const card = document.createElement('a');
    card.className = 'destination_card';
    card.href = `${DETAIL_PATH}${encodeURIComponent(name)}`;
    card.innerHTML = `
        <div class="card_image">
          <img src="${image}" alt="${name}" />
        </div>
        <div class="card_content">
          <h3 class="card_title">${name}</h3>
          <p class="card_subtitle">${landmarks}개의 랜드마크</p>
        </div>
      `;
    searchList.appendChild(card);
  });

  currentIndex = nextIndex;

  if (currentIndex >= destinations.length) {
    viewMoreButton.style.display = 'none';
  }
}
