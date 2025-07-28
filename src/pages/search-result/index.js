const photoApiKey = import.meta.env.VITE_GOOGLE_PHOTO_API_KEY;
const placeApiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
const API_DELAY_MS = 300;

export function getPhotoUrl(photoReference, apiKey, maxWidth = 400) {
  if (!photoReference) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

export async function getCityData(cities, option) {
  const urlBase = 'https://google-map-places.p.rapidapi.com/maps/api/place/textsearch/json';
  const results = [];

  for (const city of cities) {
    const url = new URL(urlBase);
    const params = {
      query: `${city} ${option}`,
      language: 'ko',
    };
    url.search = new URLSearchParams(params).toString();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': placeApiKey,
          'x-rapidapi-host': 'google-map-places.p.rapidapi.com',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}. Failed for city: ${city}, query: ${params.query}`);

      const data = await response.json();
      results.push({ city, results: data.results || [] });

      await new Promise((resolve) => setTimeout(resolve, API_DELAY_MS));
    } catch (error) {
      console.error(`Failed to fetch data for city ${city}:`, error);
      results.push({ city, results: [], error: error.message });
    }
  }
  return results;
}

export async function renderSearchResults(items) {
  const DETAIL_PATH = '/src/pages/detail-city/index.html';

  const searchList = document.getElementById('search_list');
  const viewMoreButton = document.getElementById('view_more_button');
  const searchListTitle = document.getElementById('search_list_title');

  let currentIndex = 0;
  const ITEMS_PER_LOAD = 10;

  if (!searchList || !viewMoreButton || !searchListTitle) {
    console.error('필수 DOM 요소가 없습니다.');
    return;
  }

  if (searchList && viewMoreButton && searchListTitle) {
    searchList.innerHTML = '';
    searchListTitle.textContent = `총 ${items.length}개의 도시 검색 결과`;

    await fetchMoreData();

    viewMoreButton.addEventListener('click', fetchMoreData);

    async function fetchMoreData() {
      const slice = items.slice(currentIndex, currentIndex + ITEMS_PER_LOAD);
      currentIndex += ITEMS_PER_LOAD;

      if (slice.length === 0) {
        viewMoreButton.classList.add('hidden');
        return;
      }

      const cityData = await getCityData(slice, 'tourist attractions');

      if (currentIndex >= items.length) {
        viewMoreButton.classList.add('hidden');
      }

      searchListTitle.textContent = `총 ${items.length}개의 도시 검색 결과`;

      renderCards(cityData);
    }
  }

  function renderCards(slice) {
    slice.forEach(({ city, results }) => {
      const photoReference = results[0]?.photos?.[0]?.photo_reference;
      const imgUrl = photoReference ? getPhotoUrl(photoReference, photoApiKey, 600) : '/src/assets/travel-card-image.svg';

      const card = document.createElement('a');
      card.className = 'destination_card';
      card.href = `${DETAIL_PATH}?city=${encodeURIComponent(city)}`;
      card.innerHTML = `
        <div class="card_image">
          <img src="${imgUrl}" alt="${city}" />
        </div>
        <div class="card_content">
          <h3 class="card_title">${city}</h3>
          <p class="card_subtitle">${results.length}개의 랜드마크</p>
        </div>
      `;
      searchList.appendChild(card);
    });
  }
}

// 페이지 로드시 URL 파라미터 처리 (정연 추가 코드)
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const citiesParam = urlParams.get('cities');
  const queryParam = urlParams.get('query');

  if (citiesParam) {
    try {
      const cities = JSON.parse(decodeURIComponent(citiesParam));
      console.log('URL에서 받은 도시 목록:', cities);
      renderSearchResults(cities);
    } catch (error) {
      console.error('도시 목록 파싱 오류:', error);
    }
  } else if (queryParam) {
    const query = decodeURIComponent(queryParam);
    console.log('URL에서 받은 검색어:', query);
    // 검색어를 도시로 취급하여 검색 결과 표시
    renderSearchResults([query]);
  }
});
