/* API 연동 시작 */
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_PHOTO_API_KEY = import.meta.env.VITE_GOOGLE_PHOTO_API_KEY;

const KEYWORD_LAND = 'N서울타워';

getPlaceData(KEYWORD_LAND, 'tourism');

// 구글 플레이스 JS 시작
// 사진 URL 생성 함수
function getPhotoUrl(photoReference, maxWidth = 700) {
  if (!photoReference) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PHOTO_API_KEY}`;
}

function getPlaceData(keyword, option) {
  const urlBase = 'https://google-map-places.p.rapidapi.com/maps/api/place/textsearch/json';
  const url = new URL(urlBase);

  const params = {
    query: `${keyword} ${option}`,
    language: 'ko',
  };
  url.search = new URLSearchParams(params).toString();

  fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-key': GOOGLE_API_KEY,
      'x-rapidapi-host': 'google-map-places.p.rapidapi.com',
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP 오류: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log(data);
      const results = data.results;
      if (!results || results.length === 0) {
        console.log('검색 결과 없음');
        return;
      }

      let isFirstLi = true;
      let totalPhotoCount = 0;
      const MAX_PHOTO_COUNT = 10;

      results.forEach((place) => {
        if (place.photos && place.photos.length > 0) {
          for (let i = 0; i < place.photos.length; i++) {
            if (totalPhotoCount >= MAX_PHOTO_COUNT) break;

            const photo = place.photos[i];
            const li = document.createElement('li');

            if (isFirstLi) {
              li.classList.add('is_active', 'view_carousel_item');
              isFirstLi = false;
            } else {
              li.classList.add('view_carousel_item');
              li.setAttribute('aria-hidden', 'true');
            }

            li.style.backgroundImage = `url(${getPhotoUrl(photo.photo_reference)})`;
            const span = document.createElement('span');
            span.textContent = place.name;
            span.classList.add('sr_only');

            li.appendChild(span);
            document.querySelector('.view_carousel_list').appendChild(li);

            totalPhotoCount++;
          }
        }

        if (totalPhotoCount >= MAX_PHOTO_COUNT) return;
      });

      carouselFn();
      setDataRender(results[0]);
    })
    .catch((error) => {
      console.error('❌ 요청 실패:', error.message);
    });
}

function setDataRender(result) {
  const positionLat = result.geometry.location.lat;
  const positionLng = result.geometry.location.lng;

  getWeatherInfo(positionLat, positionLng, function (weather) {
    if (weather.success) {
      document.querySelector('.weather').innerHTML = `
          <span class='weather_icon'>${weather.icon}</span>
          <span class='weather_temp'>${weather.temperature}°C</span>
        `;
    } else {
      console.error('에러:', weather.error);
      document.querySelector('.weather').innerHTML = '';
    }
  });

  showGoogleMapEmbed(positionLat, positionLng);
  getTitleData(positionLat, positionLng);
}

// 구글 플레이스 JS 종료

// 날씨 관련 JS 시작
// 날씨 코드 받아서 코드에 따라 아이콘 리턴하는 함수
function getWeatherIcon(weatherCode, iconCode) {
  // 낮인 경우
  const isDay = iconCode.includes('d');

  // 뇌우 (200-299)
  if (weatherCode >= 200 && weatherCode < 300) {
    return '⛈️';
  }
  // 이슬비 (300-399)
  else if (weatherCode >= 300 && weatherCode < 400) {
    return '🌦️';
  }
  // 비 (500-599)
  else if (weatherCode >= 500 && weatherCode < 600) {
    return '🌧️';
  }
  // 눈 (600-699)
  else if (weatherCode >= 600 && weatherCode < 700) {
    return '❄️';
  }
  // 안개/연무 (700-799)
  else if (weatherCode >= 700 && weatherCode < 800) {
    return '🌫️';
  }
  // 맑음 (800)
  else if (weatherCode === 800) {
    return isDay ? '☀️' : '🌙';
  }
  // 구름 (801-899)
  else {
    return isDay ? '⛅' : '☁️';
  }
}

// 특정 키워드(도시 or 랜드마크)의 날씨 정보를 가져오는 함수
function getWeatherInfo(lat, lon, callback) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`)
    .then((res) => {
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('해당 위치를 찾을 수 없습니다.');
        } else if (res.status === 401) {
          throw new Error('API 키가 유효하지 않습니다.');
        } else {
          throw new Error('날씨 정보를 가져오는데 실패했습니다.');
        }
      }
      return res.json();
    })
    .then((data) => {
      const weatherCode = data.weather[0].id;
      const iconCode = data.weather[0].icon;
      const temperature = Math.round(data.main.temp);
      const icon = getWeatherIcon(weatherCode, iconCode);

      callback({
        success: true,
        icon: icon,
        temperature: temperature,
      });
    })
    .catch((error) => {
      callback({
        success: false,
        error: error.message,
      });
    });
}
// 날씨 관련 JS 종료

// 도시 혹은 랜드마크 디스크립션 불러오는 JS 시작
function getDescription(keyword, callback) {
  fetch(`https://ko.wikipedia.org/api/rest_v1/page/summary/${keyword}`)
    .then((res) => {
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('해당 위치를 찾을 수 없습니다.');
        } else if (res.status === 401) {
          throw new Error('API 키가 유효하지 않습니다.');
        } else {
          throw new Error('디스크립션 정보를 가져오는데 실패했습니다.');
        }
      }
      return res.json();
    })
    .then((data) => {
      console.log(data);
      const des = data.extract;

      callback({
        success: true,
        des,
      });
    })
    .catch((error) => {
      callback({
        success: false,
        error: error.message,
      });
    });
}
// 도시 혹은 랜드마크 디스크립션 불러오는 JS 종료

// 좌표 값을 통해 나라 및 도시 이름 가져오는 함수
function getTitleData(lat, lng) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    .then((res) => {
      if (!res.ok) throw new Error('네트워크 응답 오류');
      return res.json();
    })
    .then((data) => {
      console.log(data);
      document.querySelector('.view_info_title .title span').textContent = data.address.country;
      document.querySelector('.view_info_title .title strong').textContent = KEYWORD_LAND;

      getDescription(data.address.city, function (wiki) {
        if (wiki.success) {
          document.querySelector('.view_info_description').innerHTML = `
            ${wiki.des}
          `;
        } else {
          console.error('에러:', wiki.error);
          document.querySelector('.view_info_description').innerHTML = `
            아쉽게도 설명할 문구가 없네요. 😢
          `;
        }
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

function showGoogleMapEmbed(lat, lng) {
  document.querySelector('.view_map').insertAdjacentHTML(
    'afterbegin',
    `<iframe 
      width="100%" 
      height="100%"
      frameborder="0"
      style="border:0"
      src="https://maps.google.com/maps?q=${KEYWORD_LAND}&hl=ko&z=15&output=embed"
      >
    </iframe>`
  );
}

function carouselFn() {
  const viewCarousel = document.querySelector('.view_carousel');

  if (!viewCarousel) {
    console.error('viewCarousel 요소를 찾을 수 없음');
  } else {
    const viewCarouselList = viewCarousel.querySelector('.view_carousel_list');
    if (!viewCarouselList) {
      console.error('viewCarouselList 요소를 찾을 수 없음');
    } else {
      const viewCarouselItems = Array.from(viewCarousel.querySelectorAll('.view_carousel_item'));
      const viewCarouselCount = viewCarouselItems.length;
      const viewCarouselStatus = viewCarousel.querySelector('.view_carousel_status');
      const ACTIVE_CLASS = 'is_active';

      // 캐러셀 기능 구현 시작
      let viewCarouselActiveIndex = viewCarouselItems.findIndex((item) => item.classList.contains(ACTIVE_CLASS));
      setViewCarouselStatus();

      viewCarousel.addEventListener('click', ({ target }) => {
        const arrowBtn = target.closest('.view_carousel_btn');

        if (arrowBtn) {
          const prevBtn = target.closest('.prev');
          const activeItems = viewCarouselList.querySelector(`li.${ACTIVE_CLASS}`);

          prevBtn ? viewCarouselActiveIndex-- : viewCarouselActiveIndex++;

          if (viewCarouselActiveIndex === -1) viewCarouselActiveIndex = viewCarouselCount - 1;
          else if (viewCarouselActiveIndex === viewCarouselCount) viewCarouselActiveIndex = 0;

          setViewCarouselStatus();
          moveActiveClass(viewCarouselItems, activeItems);
          setContentsWrapTranslate();
          setItemAria();
        }
      });

      function moveActiveClass(addClassEl, removeClassEl) {
        removeClassEl.classList.remove(ACTIVE_CLASS);

        if (!Array.isArray(addClassEl)) return addClassEl.classList.add(ACTIVE_CLASS);
        addClassEl[viewCarouselActiveIndex].classList.add(ACTIVE_CLASS);
      }

      function setContentsWrapTranslate() {
        viewCarouselList.style.setProperty('translate', `-${100 * viewCarouselActiveIndex}%`);
      }

      function setItemAria() {
        viewCarouselItems.forEach((content, i) => {
          if (i === viewCarouselActiveIndex) content.setAttribute('aria-hidden', 'false');
          else content.setAttribute('aria-hidden', 'true');
        });
      }

      function setViewCarouselStatus() {
        viewCarouselStatus.querySelector('span:first-child').textContent = `총 ${viewCarouselCount}페이지 중 ${viewCarouselActiveIndex + 1}`;
        viewCarouselStatus.querySelector('span:last-child').textContent = `${viewCarouselActiveIndex + 1} / ${viewCarouselCount}`;
      }
      // 캐러셀 기능 구현 종료

      // 맵 관련 기능 구현 시작
      const viewInfoContents = document.querySelector('.view_info_contents');
      const viewMap = viewInfoContents.querySelector('.view_map');
      viewInfoContents.addEventListener('click', ({ target }) => {
        const changeBtn = target.closest('.change_btn');

        if (changeBtn) {
          const mapBtn = target.closest('.map');

          if (mapBtn) {
            setTimeout(() => {
              viewMap.classList.add(ACTIVE_CLASS);
            }, 100);
            viewMap.style.display = 'block';
            viewMap.setAttribute('aria-hidden', 'false');
            viewCarousel.setAttribute('aria-hidden', 'true');
            mapBtnFocus();
          } else {
            viewMap.classList.remove(ACTIVE_CLASS);
            setTimeout(() => {
              viewMap.style.display = 'none';
            }, 400);
            viewMap.setAttribute('aria-hidden', 'true');
            viewCarousel.setAttribute('aria-hidden', 'false');
            imgBtnFocus();
          }
        }
      });

      function mapBtnFocus() {
        viewMap.querySelectorAll('button').forEach((btn) => {
          btn.removeAttribute('tabindex');
        });
        viewCarousel.querySelectorAll('button').forEach((btn) => {
          btn.setAttribute('tabindex', '-1');
        });
      }

      function imgBtnFocus() {
        viewCarousel.querySelectorAll('button').forEach((btn) => {
          btn.removeAttribute('tabindex');
        });
        viewMap.querySelectorAll('button').forEach((btn) => {
          btn.setAttribute('tabindex', '-1');
        });
      }
      // 맵 관련 기능 구현 종료
      console.log(viewMap.querySelectorAll('a'));
    }
  }
}
