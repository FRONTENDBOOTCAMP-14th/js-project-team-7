import { CONFIG } from './config.js';
import { getCityData, getPhotoUrl } from './search-api.js';
import { getAllCountriesAndCities } from '../../components/search-bar/search-bar.js';

document.addEventListener('DOMContentLoaded', function () {
  (async () => {
    console.log('search-result 페이지 로드됨');
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('country')) {
      try {
        const country = urlParams.get('country');
        const countryData = await getAllCountriesAndCities(country);
        console.log(countryData);
        renderSearchResults(countryData?.slice(0, 500));
      } catch (error) {
        console.error('국가 파라미터 파싱 오류:', error);
      }
    }

    if (urlParams.has('cities')) {
      try {
        const cities = JSON.parse(decodeURIComponent(urlParams.get('cities')));
        renderSearchResults(cities);
      } catch (error) {
        console.error('도시 파라미터 파싱 오류:', error);
      }
    } else if (urlParams.has('query')) {
      renderSearchResults([]);
    }
  })();
});

export async function renderSearchResults(items) {
  console.log(items);
  const searchList = document.getElementById('search_list');
  const viewMoreButton = document.getElementById('view_more_button');
  const searchListTitle = document.getElementById('search_list_title');

  let currentIndex = 0;

  if (!searchList || !viewMoreButton || !searchListTitle) {
    console.error('필수 DOM 요소가 없습니다.');
    return;
  }

  searchList.innerHTML = '';
  searchListTitle.textContent = `${items.length} city search results found`;

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

    searchListTitle.textContent = `${items.length} cities found`;

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
            <p class="card_subtitle">${results.length} landmarks</p>
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
