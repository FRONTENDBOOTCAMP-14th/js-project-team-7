import { CONFIG } from './config.js';
import { getCityData, getPhotoUrl } from './search-api.js';

export async function renderSearchResults(items) {
  const searchList = document.getElementById('search_list');
  const viewMoreButton = document.getElementById('view_more_button');
  const searchListTitle = document.getElementById('search_list_title');

  let currentIndex = 0;

  if (!searchList || !viewMoreButton || !searchListTitle) {
    console.error('필수 DOM 요소가 없습니다.');
    return;
  }

  searchList.innerHTML = '';
  searchListTitle.textContent = `총 ${items.length}개의 도시 검색 결과`;

  await fetchMoreData();

  viewMoreButton.removeEventListener('click', fetchMoreData);
  viewMoreButton.addEventListener('click', fetchMoreData);

  async function fetchMoreData() {
    const slice = items.slice(currentIndex, currentIndex + CONFIG.ITEMS_PER_LOAD);
    currentIndex += CONFIG.ITEMS_PER_LOAD;

    if (slice.length === 0) {
      viewMoreButton.classList.add('hidden');
      return;
    }

    const cityData = await getCityData(slice, 'tourist attractions');

    if (currentIndex < items.length) {
      viewMoreButton.classList.remove('hidden');
    } else {
      viewMoreButton.classList.add('hidden');
    }

    searchListTitle.textContent = `총 ${items.length}개의 도시 검색 결과`;

    renderCards(cityData);
  }

  function renderCards(slice) {
    const fragment = document.createDocumentFragment();

    slice.forEach(({ city, results }) => {
      const photoReference = results[0]?.photos?.[0]?.photo_reference;
      const imgUrl = getPhotoUrl(photoReference, CONFIG.PHOTO_API_KEY, 600) || CONFIG.DEFAULT_IMAGE;

      const card = document.createElement('a');
      card.className = 'destination_card';
      card.href = `${CONFIG.DETAIL_PATH}/${encodeURIComponent(city)}`;
      card.innerHTML = `
          <div class="card_image">
            <img src="${imgUrl}" alt="${city}" />
          </div>
          <div class="card_content">
            <h3 class="card_title">${city}</h3>
            <p class="card_subtitle">${results.length}개의 랜드마크</p>
          </div>
        `;

      fragment.appendChild(card);
    });

    searchList.appendChild(fragment);
  }
}

window.renderSearchResults = renderSearchResults;
window.getCityData = getCityData;
window.getPhotoUrl = getPhotoUrl;

export { getCityData, getPhotoUrl };
