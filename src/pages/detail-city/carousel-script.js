const urlParams = new URLSearchParams(window.location.search);
const city = urlParams.get('city');

initBackbutton();
renderDetailCarouselView(city);

function renderDetailCarouselView(cityName) {
  getDetailInfo(cityName);
  getDetailImages(cityName);
  renderGoogleMap(cityName);
  renderTitleCity(cityName);
}

function renderTitleCountry(description) {
  const title = document.querySelector('.view_info_title .title');
  const span = title.querySelector('span');
  const parts = description.split(',');

  span.textContent = parts[parts.length - 1];
}

function renderTitleCity(keyword) {
  document.querySelector('.view_info_title .title strong').textContent = keyword;
}

function renderDescription(extract) {
  document.querySelector('.view_info_description').textContent = extract;
}

function renderDefaultDescription() {
  document.querySelector('.view_info_description').textContent = 'There are no phrases to describe.';
}

function renderGoogleMap(keyword) {
  document.querySelector('.view_map').insertAdjacentHTML(
    'afterbegin',
    `<iframe
      title="${keyword} location map"
      width="100%" 
      height="100%"
      frameborder="0"
      style="border:0"
      src="https://maps.google.com/maps?q=${keyword}&hl=en&z=15&output=embed"
      ></iframe>`
  );
}

function renderCarouselImages(imgUrls) {
  imgUrls.forEach((url, index) => {
    if (!url) return;
    const viewCarouselList = document.querySelector('.view_carousel_list');
    const li = document.createElement('li');
    li.classList.add('view_carousel_item');

    if (index === 0) li.classList.add('is_active');
    else li.setAttribute('aria-hidden', 'true');

    li.style.backgroundImage = `url(${url})`;

    viewCarouselList.appendChild(li);
  });
}

function renderWeatherInfo(weather) {
  const icon = getWeatherIcon(weather.weathercode);
  const temp = weather.temperature + '°C';
  const weatherEl = document.querySelector('.weather');
  weatherEl.innerHTML = `
    <span class='weather_icon'>${icon}</span>
    <span class='weather_temp'>${temp}</span>
  `;
}

function getDetailInfo(keyword) {
  const conversionKeyword = keyword.replace(/-.*$/, '');
  
  return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${conversionKeyword}`)
    .then((res) => {
      if (!res.ok) throw new Error('res 오류');
      return res.json();
    })
    .then((data) => {
      renderTitleCountry(data.description);
      renderDescription(data.extract);
      getWeatherInfo(data.coordinates.lat, data.coordinates.lon);
    })
    .catch((err) => {
      console.error('wikipedia Detail Info :', err);
      renderDefaultDescription();
    });
}

function getDetailImages(keyword) {
  const conversionKeyword = keyword.replace(/-.*$/, '');
  return fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=images&titles=${conversionKeyword}`)
    .then((res) => {
      if (!res.ok) throw new Error('이미지 목록 요청 실패');
      return res.json();
    })
    .then((data) => {
      const EXCLUDED_PATTERNS = [/icon/i, /logo/i, /symbol/i, /flag/i, /coat[-_ ]?of[-_ ]?arms/i, /locator[-_ ]?map/i, /map/i, /wikidata/i, /\.svg$/i, /^File:Commons-logo/i];
      const pages = data.query.pages;
      const page = Object.values(pages)[0];

      const imageTitles = page.images.map((img) => img.title).filter((title) => /\.(jpg|jpeg|png)$/i.test(title) && !EXCLUDED_PATTERNS.some((pattern) => pattern.test(title)));

      return fetchImageUrls(imageTitles);
    })
    .then((imageUrls) => {
      renderCarouselImages(imageUrls);
      initCarousel();
    })
    .catch((err) => {
      console.error('Wikipedia 이미지 가져오기 실패:', err);
      initCarousel();
    });
}

function getWeatherInfo(lat, lon) {
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const weather = data.current_weather;
      renderWeatherInfo(weather);
    })
    .catch((err) => {
      console.error('Open Meteo API:', err);
    });
}

function getWeatherIcon(weatherCode) {
  const code = parseInt(weatherCode, 10);

  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';

  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67].includes(code)) return '🌧️';
  if ([71, 73, 75, 77].includes(code)) return '❄️';
  if ([80, 81, 82, 85, 86].includes(code)) return '🌦️';
  if ([95, 96, 99].includes(code)) return '⛈️';

  return '❓';
}

function fetchImageUrls(titles, maxWidth = 700) {
  const promises = titles.map((title) => {
    return fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|thumbnail&iiurlwidth=${maxWidth}&titles=${title}`)
      .then((res) => res.json())
      .then((data) => {
        const pages = data.query.pages;
        const page = Object.values(pages)[0];

        if (page.imageinfo && page.imageinfo[0].thumburl) {
          return page.imageinfo[0].thumburl;
        } else if (page.imageinfo && page.imageinfo[0].url) {
          return page.imageinfo[0].url;
        } else {
          return null;
        }
      });
  });

  return Promise.all(promises).then((urls) => urls.filter(Boolean));
}

function initCarousel() {
  const ACTIVE_CLASS = 'is_active';
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

      if (viewCarouselCount <= 1) {
        viewCarousel.querySelector('.view_carousel_nav').style.display = 'none';
      } else {
        const viewCarouselStatus = viewCarousel.querySelector('.view_carousel_status');

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
      }

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
    }
  }
}

function initBackbutton() {
  const backButton = document.querySelector('.view_nav_btn li:nth-child(2) a')
  backButton.addEventListener('click', () => {
    if (document.referrer === '') {
      window.location.href = '/';
    } else {
      history.back();
    }
  });
}