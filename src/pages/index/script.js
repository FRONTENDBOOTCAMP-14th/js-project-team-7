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
    // 특정 도시들에 대해 여러 검색어 시도
    const searchTerms = {
      Bali: ['Ubud', 'Tanah Lot', 'Kuta Beach', 'Bali Indonesia'],
      Santorini: ['Oia', 'Fira', 'Thira', 'Santorini Greece'],
    };

    const termsToTry = searchTerms[city] || [city];

    // 각 검색어로 시도해서 이미지가 있는 것 찾기
    for (const searchTerm of termsToTry) {
      const enSearchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;
      const enResponse = await fetch(enSearchUrl);

      if (enResponse.ok) {
        const data = await enResponse.json();
        // console.log(`${searchTerm} Wikipedia 데이터:`, data);

        // 이미지가 있고 disambiguation이 아니며, 몽타주나 지도가 아닌 경우
        if (data.thumbnail?.source && data.type !== 'disambiguation' && !data.thumbnail.source.includes('Montage') && !data.thumbnail.source.includes('.svg')) {
          return {
            title: city, // 원래 도시 이름 사용
            image: data.thumbnail.source,
            extract: data.extract || '',
          };
        }
      }
    }

    // 모든 특별 검색어 실패시 기본 검색
    const enSearchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`;
    const enResponse = await fetch(enSearchUrl);

    if (enResponse.ok) {
      const data = await enResponse.json();
      // console.log(`${city} 기본 Wikipedia 데이터:`, data);

      // disambiguation 페이지인지 확인
      if (data.type === 'disambiguation') {
        // "city name city" 형태로 다시 시도
        const citySearchTerm = `${city} city`;
        const fallbackUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(citySearchTerm)}`;
        const fallbackResponse = await fetch(fallbackUrl);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          // console.log(`${city} 폴백 데이터:`, fallbackData);
          return {
            title: city, // 원래 도시 이름 사용
            image: fallbackData.thumbnail?.source || null,
            extract: fallbackData.extract || '',
          };
        }
      }

      return {
        title: city, // 원래 도시 이름 사용
        image: data.thumbnail?.source || null,
        extract: data.extract || '',
      };
    }

    // 영어 Wikipedia 실패시 한국어 시도
    const koSearchUrl = `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`;
    const koResponse = await fetch(koSearchUrl);

    if (koResponse.ok) {
      const data = await koResponse.json();
      return {
        title: city, // 원래 도시 이름 사용
        image: data.thumbnail?.source || null,
        extract: data.extract || '',
      };
    }

    return null;
  } catch (error) {
    console.error(`Wikipedia API 호출 실패 (${city}):`, error);
    return null;
  }
}

/**
 * 도시 데이터 가져오기 (Wikipedia API 사용)
 */
export async function getCityData(cities, option) {
  const results = [];

  for (const city of cities) {
    try {
      // console.log(`${city} Wikipedia 정보 가져오는 중...`);

      // Wikipedia에서 도시 정보 가져오기
      const cityInfo = await getCityInfoFromWikipedia(city);

      // 랜드마크는 단순히 20개로 고정
      const landmarks = Array.from({ length: 20 }, (_, i) => ({
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
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to fetch data for city ${city}:`, error);
      results.push({
        city,
        results: Array.from({ length: 20 }, (_, i) => ({
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
    <a href="/destination/${city.toLowerCase().replace(/\s+/g, '-')}" class="destination_card">
      <div class="card_image">
        <img src="${image}" alt="${title}" onerror="this.src='/public/images/travel-card-image.svg'" />
      </div>
      <div class="card_content">
        <h3 class="card_title">${title}</h3>
        <p class="card_subtitle">${results.length}개의 랜드마크</p>
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

  // 로딩 표시
  track.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 218px; width: 100%;">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
        <p style="color: #666; font-size: 14px;">Wikipedia에서 ${category} 도시 정보를 불러오는 중...</p>
      </div>
    </div>
  `;

  try {
    // API에서 도시 데이터 가져오기
    const cityData = await getCityData(cities, 'tourist attractions');

    // 카드 HTML 생성
    track.innerHTML = cityData.map(createDestinationCard).join('');

    // 캐러셀 기능 초기화
    initCarousel(carouselElement, headerElement);
  } catch (error) {
    console.error(`${category} 카테고리 데이터 로딩 실패:`, error);

    // 에러 발생시 기본 카드 표시
    track.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 218px; width: 100%;">
        <p style="color: #999; text-align: center;">도시 정보를 불러올 수 없습니다.<br>API 연결을 확인해주세요.</p>
      </div>
    `;
  }
}

// 캐러셀 기능 구현
function initCarousel(carouselElement, headerElement) {
  const track = carouselElement.querySelector('.carousel_track');
  const prevButton = headerElement.querySelector('.prev_button');
  const nextButton = headerElement.querySelector('.next_button');
  const cards = track.querySelectorAll('.destination_card');

  let currentIndex = 0;
  const cardWidth = 220; // 카드 너비
  const gap = 15; // 카드 간격
  const totalWidth = cardWidth + gap; // 카드 하나당 총 너비
  const maxIndex = cards.length - 1; // 마지막 인덱스

  // 초기 설정
  track.style.transform = `translateX(0px)`;
  updateButtons();

  // 이전 버튼 클릭 이벤트
  prevButton.addEventListener('click', function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  // 다음 버튼 클릭 이벤트
  nextButton.addEventListener('click', function () {
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  // 캐러셀 위치 업데이트
  function updateCarousel() {
    // 현재 인덱스의 카드가 컨테이너 맨 왼쪽에 오도록 이동
    // 각 카드는 totalWidth(235px)만큼 이동
    const translateX = -currentIndex * totalWidth;
    track.style.transform = `translateX(${translateX}px)`;
    track.style.transition = 'transform 0.3s ease';
    updateButtons();
  }

  // 버튼 상태 업데이트
  function updateButtons() {
    // 이전 버튼 상태 관리
    if (currentIndex === 0) {
      prevButton.classList.add('disabled');
    } else {
      prevButton.classList.remove('disabled');
    }

    // 다음 버튼 상태 관리
    if (currentIndex === maxIndex) {
      nextButton.classList.add('disabled');
    } else {
      nextButton.classList.remove('disabled');
    }
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

  // 검색 기능 초기화
  initSearchFeature();
});

/**
 * 검색 기능 초기화
 */
function initSearchFeature() {
  const keywords = ['서울', '경기', '부산', '제주', '강릉', '속초', '경주', '전주'];

  const searchInput = document.getElementById('search_input');
  const suggestionsBox = document.getElementById('suggestions');
  const searchButton = document.getElementById('search_button');

  if (!searchInput || !suggestionsBox || !searchButton) {
    console.error('검색 요소를 찾을 수 없습니다.');
    return;
  }

  const showSuggestions = () => {
    suggestionsBox.style.display = 'block';
  };

  const hideSuggestions = () => {
    suggestionsBox.style.display = 'none';
  };

  const changeButtonColor = (color) => {
    searchButton.style.background = color;
  };

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    suggestionsBox.innerHTML = '';

    if (query.length > 0) {
      changeButtonColor('var(--color_blue)');
    } else {
      changeButtonColor('var(--color_black)');
    }

    const filtered = keywords.filter((word) => word.includes(query));

    if (query) {
      if (filtered.length > 0) {
        filtered.forEach((word) => {
          const li = document.createElement('li');
          li.textContent = word;
          li.addEventListener('click', () => {
            searchInput.value = word;
            hideSuggestions();
          });
          suggestionsBox.appendChild(li);
        });
        showSuggestions();
      } else {
        hideSuggestions();
      }
    } else {
      hideSuggestions();
    }
  });

  // 검색 버튼 클릭 이벤트
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      // 검색 결과 페이지로 이동
      window.location.href = `/src/pages/search-result/index.html?query=${encodeURIComponent(query)}`;
    }
  });

  // Enter 키 검색
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `/src/pages/search-result/index.html?query=${encodeURIComponent(query)}`;
      }
    }
  });

  // 외부 클릭 시 suggestions 숨기기
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      hideSuggestions();
    }
  });
}
