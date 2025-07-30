/**
 * Index Carousel 구현 기능 - RapidAPI Google Places 연동
 * - 모바일 환경에서 1.5개 카드 뷰 (현재 카드 + 다음 카드 절반)
 * - 이전/다음 네비게이션 버튼으로 카드 이동
 * - 첫 번째/마지막 카드에서 버튼 비활성화 처리
 * - translateX를 이용한 부드러운 애니메이션 효과
 * - 3개 섹션 각각 독립적인 캐러셀 동작
 */

// API 키 설정 (Wikipedia는 API 키 불필요)
console.log('Wikipedia API 사용 - API 키 불필요');

// 카테고리별 도시 목록
const CITY_CATEGORIES = {
  summer: ['Sapporo', 'Barcelona', 'Santorini', 'Vancouver', 'Prague'],
  autumn: ['Seoul', 'Tokyo', 'New York City', 'Paris', 'Istanbul'],
  hot: ['Dubai', 'Bangkok', 'Bali', 'Los Angeles', 'Da Nang'],
};

/**
 * Wikipedia API로 도시 정보와 이미지 가져오기
 */
async function getCityInfoFromWikipedia(city) {
  try {
    // 1. 특별 검색어로 시도
    const result = await trySpecialSearchTerms(city);
    if (result) return result;

    // 2. 기본 검색어로 시도
    const basicResult = await tryBasicSearch(city);
    if (basicResult) return basicResult;

    // 3. 한국어 Wikipedia로 시도
    return await tryKoreanWikipedia(city);
  } catch (error) {
    console.error(`Wikipedia API 호출 실패 (${city}):`, error);
    return null;
  }
}

/**
 * 특별 검색어들로 Wikipedia 검색 시도
 */
async function trySpecialSearchTerms(city) {
  const SEARCH_TERMS = {
    Bali: ['Ubud', 'Tanah Lot', 'Kuta Beach', 'Bali Indonesia'],
    Santorini: ['Oia', 'Fira', 'Thira', 'Santorini Greece'],
  };

  const termsToTry = SEARCH_TERMS[city] || [city];

  for (const searchTerm of termsToTry) {
    const result = await fetchWikipediaData(searchTerm, 'en');
    if (result && isValidImageData(result)) {
      return createCityInfo(city, result);
    }
  }
  return null;
}

/**
 * 기본 검색어로 Wikipedia 검색 시도
 */
async function tryBasicSearch(city) {
  const data = await fetchWikipediaData(city, 'en');
  if (!data) return null;

  // disambiguation 페이지 처리
  if (data.type === 'disambiguation') {
    const citySearchTerm = `${city} city`;
    const fallbackData = await fetchWikipediaData(citySearchTerm, 'en');
    return fallbackData ? createCityInfo(city, fallbackData) : null;
  }

  return createCityInfo(city, data);
}

/**
 * 한국어 Wikipedia 검색 시도
 */
async function tryKoreanWikipedia(city) {
  const data = await fetchWikipediaData(city, 'ko');
  return data ? createCityInfo(city, data) : null;
}

/**
 * Wikipedia API에서 데이터 가져오기
 */
async function fetchWikipediaData(searchTerm, language) {
  const baseUrl = language === 'ko' ? 'https://ko.wikipedia.org' : 'https://en.wikipedia.org';
  const searchUrl = `${baseUrl}/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;

  try {
    const response = await fetch(searchUrl);
    return response.ok ? await response.json() : null;
  } catch (error) {
    console.error(`Wikipedia API 호출 실패 (${searchTerm}):`, error);
    return null;
  }
}

/**
 * 이미지 데이터가 유효한지 검사
 */
function isValidImageData(data) {
  return data.thumbnail?.source && data.type !== 'disambiguation' && !data.thumbnail.source.includes('Montage') && !data.thumbnail.source.includes('.svg');
}

/**
 * 도시 정보 객체 생성
 */
function createCityInfo(city, data) {
  return {
    title: city,
    image: data.thumbnail?.source || null,
    extract: data.extract || '',
  };
}

/**
 * 도시 데이터 가져오기 (Wikipedia API 사용)
 */
async function getCityData(cities) {
  const results = [];
  const LANDMARK_COUNT = 20; // 랜드마크 개수 상수
  const API_DELAY = 200; // API 요청 간 지연 시간 (ms)

  for (const city of cities) {
    try {
      // console.log(`${city} Wikipedia 정보 가져오는 중...`);

      // Wikipedia에서 도시 정보 가져오기
      const cityInfo = await getCityInfoFromWikipedia(city);

      // 랜드마크는 단순히 20개로 고정
      const landmarks = Array.from({ length: LANDMARK_COUNT }, (_, i) => ({
        name: `${city} Landmark ${i + 1}`,
        type: 'attraction',
        rating: '4.5',
      }));

      results.push({
        city,
        results: landmarks,
        image: cityInfo?.image || `/public/images/travel-card-image.svg`,
        title: cityInfo?.title || city,
      });

      // console.log(`${city}: ${landmarks.length}개 랜드마크 정보 로드 완료`);

      // API 요청 간 짧은 지연
      await new Promise((resolve) => setTimeout(resolve, API_DELAY));
    } catch (error) {
      console.error(`Failed to fetch data for city ${city}:`, error);
      results.push({
        city,
        results: Array.from({ length: LANDMARK_COUNT }, (_, i) => ({
          name: `${city} Landmark ${i + 1}`,
          type: 'attraction',
          rating: '4.0',
        })),
        image: `/public/images/travel-card-image.svg`,
        title: city,
      });
    }
  }

  // console.log('Wikipedia API 결과:', results);
  return results;
}

/**
 * 여행지 카드 HTML 생성
 */
function createDestinationCard(cityData) {
  const { city, results, image, title } = cityData;

  // console.log(`${city} 카드 생성 - 이미지:`, image);

  return `
    <a href="/src/pages/detail-city/index.html?city=${encodeURIComponent(city)}" class="destination_card">
      <div class="card_image">
        <img src="${image}" alt="${title}" onerror="this.src='/public/images/travel-card-image.svg'" />
      </div>
      <div class="card_content">
        <h3 class="card_title">${title}</h3>
        <p class="card_subtitle">${results.length} landmarks</p>
      </div>
    </a>
  `;
}

/**
 * 캐러셀 초기화 (API 연동)
 */
async function initCarouselWithAPI(carouselElement, headerElement, category) {
  const track = carouselElement.querySelector('.carousel_track');
  const cities = CITY_CATEGORIES[category] || CITY_CATEGORIES.summer;
  const LOADING_HEIGHT = 218; // 로딩 컨테이너 높이

  // 로딩 표시
  track.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: ${LOADING_HEIGHT}px; width: 100%;">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
        <p style="color: #666; font-size: 14px;">Wikipedia에서 ${category} 도시 정보를 불러오는 중...</p>
      </div>
    </div>
  `;

  try {
    // API에서 도시 데이터 가져오기
    const cityData = await getCityData(cities);

    // 카드 HTML 생성
    track.innerHTML = cityData.map(createDestinationCard).join('');

    // 캐러셀 기능 초기화
    initCarousel(carouselElement, headerElement);
  } catch (error) {
    console.error(`${category} 카테고리 데이터 로딩 실패:`, error);

    // 에러 발생시 기본 카드 표시
    track.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: ${LOADING_HEIGHT}px; width: 100%;">
        <p style="color: #999; text-align: center;">도시 정보를 불러올 수 없습니다.<br>API 연결을 확인해주세요.</p>
      </div>
    `;
  }
}

// 캐러셀 기능 구현
/**
 * 캐러셀 기능 초기화 - 리팩토링된 버전
 */
function initCarousel(carouselElement, headerElement) {
  const carouselState = createCarouselElementsAndState(carouselElement, headerElement);

  if (!carouselState) return;

  initializeCarouselPosition(carouselState);
  setupCarouselNavigation(carouselState);
}

/**
 * 캐러셀 요소들과 상태 생성
 */
function createCarouselElementsAndState(carouselElement, headerElement) {
  const track = carouselElement.querySelector('.carousel_track');
  const prevButton = headerElement.querySelector('.prev_button');
  const nextButton = headerElement.querySelector('.next_button');
  const cards = track.querySelectorAll('.destination_card');

  if (!track || !prevButton || !nextButton) {
    console.error('캐러셀 필수 요소를 찾을 수 없습니다.');
    return null;
  }

  return {
    track,
    prevButton,
    nextButton,
    cards,
    currentIndex: 0,
    CARD_WIDTH: 220, // 카드 너비
    GAP: 15, // 카드 간격
    TOTAL_WIDTH: 220 + 15, // 카드 하나당 총 너비
    MAX_INDEX: cards.length - 1, // 마지막 인덱스
  };
}

/**
 * 캐러셀 초기 위치 설정
 */
function initializeCarouselPosition(carouselState) {
  carouselState.track.style.transform = 'translateX(0px)';
  updateCarouselButtons(carouselState);
}

/**
 * 캐러셀 네비게이션 이벤트 설정
 */
function setupCarouselNavigation(carouselState) {
  // 이전 버튼 클릭 이벤트
  carouselState.prevButton.addEventListener('click', function () {
    moveCarouselToIndex(carouselState, carouselState.currentIndex - 1);
  });

  // 다음 버튼 클릭 이벤트
  carouselState.nextButton.addEventListener('click', function () {
    moveCarouselToIndex(carouselState, carouselState.currentIndex + 1);
  });
}

/**
 * 캐러셀을 특정 인덱스로 이동
 */
function moveCarouselToIndex(carouselState, newIndex) {
  if (newIndex < 0 || newIndex > carouselState.MAX_INDEX) return;

  carouselState.currentIndex = newIndex;
  updateCarouselPosition(carouselState);
  updateCarouselButtons(carouselState);
}

/**
 * 캐러셀 위치 업데이트
 */
function updateCarouselPosition(carouselState) {
  const translateX = -carouselState.currentIndex * carouselState.TOTAL_WIDTH;
  carouselState.track.style.transform = `translateX(${translateX}px)`;
  carouselState.track.style.transition = 'transform 0.3s ease';
}

/**
 * 캐러셀 버튼 상태 업데이트
 */
function updateCarouselButtons(carouselState) {
  // 이전 버튼 상태 관리
  if (carouselState.currentIndex === 0) {
    carouselState.prevButton.classList.add('disabled');
  } else {
    carouselState.prevButton.classList.remove('disabled');
  }

  // 다음 버튼 상태 관리
  if (carouselState.currentIndex === carouselState.MAX_INDEX) {
    carouselState.nextButton.classList.add('disabled');
  } else {
    carouselState.nextButton.classList.remove('disabled');
  }
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// DOM이 로드되면 캐러셀 초기화 (API 연동)
document.addEventListener('DOMContentLoaded', async function () {
  // 모든 캐러셀 섹션과 헤더 찾기
  const carouselSections = document.querySelectorAll('.destinations');
  const sectionHeaders = document.querySelectorAll('.section_header');

  // 각 섹션에 대응하는 카테고리
  const categories = ['summer', 'autumn', 'hot'];

  // 각 섹션에 대해 API 연동 캐러셀 초기화 (병렬로)
  const initPromises = [];
  for (let i = 0; i < carouselSections.length; i++) {
    if (sectionHeaders[i]) {
      initPromises.push(initCarouselWithAPI(carouselSections[i], sectionHeaders[i], categories[i]));
    }
  }

  // 모든 섹션 동시 초기화
  await Promise.all(initPromises);

  // 검색 기능 초기화 (비동기)
  await initSearchFeature();
});

/**
 * 검색 기능 초기화 - search-bar 폴더에서 가져온 원본 코드
 */
async function initSearchFeature() {
  console.log('검색 기능 초기화 시작');
  const searchState = createSearchState();

  // 국가와 도시 데이터를 먼저 로드
  await initializeCountriesAndCities(searchState);
  
  const searchElements = getSearchElements();
  if (!searchElements) {
    console.error('검색 요소를 찾을 수 없습니다.');
    return;
  }

  console.log('검색 데이터 로드 완료, 이벤트 리스너 설정');
  setupSearchEventListeners(searchState, searchElements);
}

/**
 * 검색 상태 객체 생성
 */
function createSearchState() {
  return {
    countries: new Set(),
    cities: new Set(),
    countryCityMap: {},
    selectedIndex: -1,
  };
}

/**
 * 국가와 도시 데이터 초기화
 */
async function initializeCountriesAndCities(searchState) {
  console.log('국가와 도시 데이터 로딩 시작');
  try {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const { data } = await response.json();
    populateSearchData(data, searchState);
    console.log('데이터 로딩 완료:', {
      countries: searchState.countries.size,
      cities: searchState.cities.size
    });
  } catch (error) {
    console.error('Error fetching countries and cities:', error);
  }
}

/**
 * 검색 데이터 채우기
 */
function populateSearchData(data, searchState) {
  data.forEach(function (item) {
    searchState.countries.add(item.country);
    item.cities.forEach(function (city) {
      searchState.cities.add(city);
    });

    if (!searchState.countryCityMap[item.country]) {
      searchState.countryCityMap[item.country] = [];
    }
    searchState.countryCityMap[item.country].push(...item.cities);
  });
}

/**
 * 검색 관련 DOM 요소들 가져오기
 */
function getSearchElements() {
  const searchInput = document.getElementById('search_input');
  const suggestionsBox = document.getElementById('suggestions');
  const searchButton = document.getElementById('search_button');

  if (!searchInput || !suggestionsBox || !searchButton) {
    console.error('검색 요소를 찾을 수 없습니다.');
    return null;
  }

  return { searchInput, suggestionsBox, searchButton };
}

/**
 * 검색 이벤트 리스너 설정
 */
function setupSearchEventListeners(searchState, elements) {
  const { searchInput, searchButton } = elements;

  // 입력 이벤트
  searchInput.addEventListener('input', function () {
    handleSearchInput(searchState, elements);
  });

  // 키보드 이벤트
  searchInput.addEventListener('keydown', function (event) {
    handleSearchKeydown(event, searchState, elements);
  });

  // 검색 버튼 클릭
  searchButton.addEventListener('click', function () {
    handleSearchExecution(searchState, elements);
  });
}

/**
 * 검색 입력 처리
 */
function handleSearchInput(searchState, elements) {
  const { searchInput, suggestionsBox, searchButton } = elements;
  const query = searchInput.value.toLowerCase();
  console.log('검색 입력:', query);

  suggestionsBox.innerHTML = '';
  searchState.selectedIndex = -1;

  updateSearchButtonColor(query, searchButton);

  if (query) {
    const suggestions = getFilteredSuggestions(query, searchState);
    console.log('검색 제안:', suggestions);
    if (suggestions.length > 0) {
      renderSuggestions(suggestions, searchState, elements);
      showSuggestions(suggestionsBox);
    } else {
      hideSuggestions(suggestionsBox);
    }
  } else {
    hideSuggestions(suggestionsBox);
  }
}

/**
 * 검색 버튼 색상 업데이트
 */
function updateSearchButtonColor(query, searchButton) {
  const color = query.length > 0 ? 'var(--color_blue)' : 'var(--color_black)';
  searchButton.style.background = color;
}

/**
 * 필터된 제안 목록 가져오기
 */
function getFilteredSuggestions(query, searchState) {
  const MAX_SUGGESTIONS = 10;
  const QUERY_LENGTH_THRESHOLD = 3;
  const allItems = [...searchState.countries, ...searchState.cities];

  if (query.length <= QUERY_LENGTH_THRESHOLD) {
    return allItems
      .filter(function (word) {
        return word.toLowerCase().startsWith(query);
      })
      .slice(0, MAX_SUGGESTIONS);
  } else {
    return allItems
      .filter(function (word) {
        return word.toLowerCase().includes(query);
      })
      .slice(0, MAX_SUGGESTIONS);
  }
}

/**
 * 제안 목록 렌더링
 */
function renderSuggestions(suggestions, searchState, elements) {
  const { suggestionsBox } = elements;

  suggestions.forEach(function (word) {
    const li = document.createElement('li');
    li.textContent = word;
    li.addEventListener('click', function () {
      selectSuggestion(word, searchState, elements);
    });
    suggestionsBox.appendChild(li);
  });
}

/**
 * 제안 항목 선택 처리
 */
function selectSuggestion(word, searchState, elements) {
  const { searchInput, suggestionsBox } = elements;
  searchInput.value = word;
  hideSuggestions(suggestionsBox);
  handleSearchExecution(searchState, elements);
}

/**
 * 키보드 이벤트 처리
 */
function handleSearchKeydown(event, searchState, elements) {
  const { suggestionsBox } = elements;
  const items = suggestionsBox.querySelectorAll('li');

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      navigateSuggestions(1, items, searchState, elements);
      break;
    case 'ArrowUp':
      event.preventDefault();
      navigateSuggestions(-1, items, searchState, elements);
      break;
    case 'Enter':
      event.preventDefault();
      handleEnterKey(items, searchState, elements);
      break;
  }
}

/**
 * 제안 목록 네비게이션
 */
function navigateSuggestions(direction, items, searchState, elements) {
  if (items.length === 0) return;

  searchState.selectedIndex = direction > 0 ? (searchState.selectedIndex + 1) % items.length : (searchState.selectedIndex - 1 + items.length) % items.length;

  updateSelectionDisplay(items, searchState, elements);
}

/**
 * Enter 키 처리
 */
function handleEnterKey(items, searchState, elements) {
  const { searchInput } = elements;

  if (searchState.selectedIndex >= 0 && searchState.selectedIndex < items.length) {
    searchInput.value = items[searchState.selectedIndex].textContent;
    hideSuggestions(elements.suggestionsBox);
  }
  handleSearchExecution(searchState, elements);
}

/**
 * 선택 표시 업데이트
 */
function updateSelectionDisplay(items, searchState, elements) {
  clearSelection(items);

  if (searchState.selectedIndex >= 0 && searchState.selectedIndex < items.length) {
    const selectedItem = items[searchState.selectedIndex];
    selectedItem.classList.add('selected');
    elements.searchInput.value = selectedItem.textContent;
  }
}

/**
 * 선택 표시 제거
 */
function clearSelection(items) {
  items.forEach(function (item) {
    item.classList.remove('selected');
  });
}

/**
 * 검색 실행 처리
 */
function handleSearchExecution(searchState, elements) {
  const query = elements.searchInput.value.trim();
  if (!query) return;

  hideSuggestions(elements.suggestionsBox);

  const countryArray = [...searchState.countries];
  const cityArray = [...searchState.cities];
  const lowerQuery = query.toLowerCase();

  const matchedCountry = countryArray.find(function (c) {
    return c.toLowerCase() === lowerQuery;
  });
  const matchedCity = cityArray.find(function (c) {
    return c.toLowerCase() === lowerQuery;
  });

  navigateToSearchResult(matchedCountry, matchedCity, query, searchState);
}

/**
 * 검색 결과 페이지로 이동
 */
function navigateToSearchResult(matchedCountry, matchedCity, query, searchState) {
  let url;

  if (matchedCountry) {
    const matchedCities = searchState.countryCityMap[matchedCountry];
    url = `/src/pages/search-result/index.html?cities=${encodeURIComponent(JSON.stringify(matchedCities))}`;
  } else if (matchedCity) {
    url = `/src/pages/search-result/index.html?cities=${encodeURIComponent(JSON.stringify([matchedCity]))}`;
  } else {
    url = `/src/pages/search-result/index.html?query=${encodeURIComponent(query)}`;
  }

  window.location.href = url;
}

/**
 * 제안 목록 보이기
 */
function showSuggestions(suggestionsBox) {
  suggestionsBox.style.display = 'block';
}

/**
 * 제안 목록 숨기기
 */
function hideSuggestions(suggestionsBox) {
  suggestionsBox.style.display = 'none';
}
