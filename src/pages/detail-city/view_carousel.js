const viewCarousel = document.querySelector('.view_carousel');
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

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
          viewMap.classList.add(ACTIVE_CLASS);
          viewMap.setAttribute('aria-hidden', 'false');
          viewCarousel.setAttribute('aria-hidden', 'true');
          mapBtnFocus();
        } else {
          viewMap.classList.remove(ACTIVE_CLASS);
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

    // 날씨 관련 JS 시작
    // 날씨 최종 호출
    // 추후 키워드를 전달받을시 keyword 파라미터에 전달 받은 키워드 삽입
    getWeatherInfo('seoul', function (weather) {
      if (weather.success) {
        console.log('아이콘:', weather.icon);
        console.log('온도:', weather.temperature);

        document.querySelector('.weather').innerHTML = `
          <span class='weather_icon'>${weather.icon}</span>
          <span class='weather_temp'>${weather.temperature}°C</span>
        `;
      } else {
        console.error('에러:', weather.error);
        document.querySelector('.weather').innerHTML = '';
      }
    });

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
    function getWeatherInfo(keyword, callback) {
      fetch(`${WEATHER_API_BASE}/weather?q=${encodeURIComponent(keyword)}&appid=${WEATHER_API_KEY}&units=metric`)
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
          console.log(data);
          const weatherCode = data.weather[0].id;
          const iconCode = data.weather[0].icon;
          const temperature = Math.round(data.main.temp);
          const icon = getWeatherIcon(weatherCode, iconCode);

          console.log(iconCode);

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
  }
}
