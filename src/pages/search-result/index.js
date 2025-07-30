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
      card.href = `${CONFIG.DETAIL_PATH}?city=${encodeURIComponent(city)}`;
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

/**
 * 페이지 로드 시 URL 파라미터 처리 로직 추가
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('search-result 페이지 로드됨');
  const urlParams = new URLSearchParams(window.location.search);
  
  // cities 파라미터가 있는 경우 (도시 또는 국가 검색)
  if (urlParams.has('cities')) {
    try {
      const cities = JSON.parse(decodeURIComponent(urlParams.get('cities')));
      console.log('검색된 도시들:', cities);
      renderSearchResults(cities);
    } catch (error) {
      console.error('도시 파라미터 파싱 오류:', error);
    }
  }
  // query 파라미터가 있는 경우 (일반 검색어)
  else if (urlParams.has('query')) {
    const query = decodeURIComponent(urlParams.get('query'));
    console.log('검색 쿼리:', query);
    // 쿼리에 해당하는 도시가 없을 때 빈 결과 표시
    renderSearchResults([]);
  }
});