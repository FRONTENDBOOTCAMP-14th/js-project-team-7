import defaultImage from '/images/default_thumbnail.png';
import pLimit from 'p-limit';

(() => {
  // API 연동
  const GOOGLE_API_KEY_J = import.meta.env.VITE_GOOGLE_API_KEY_J;

  const DEFAULT_IMAGE = defaultImage;
  const INITIAL_TAB = 'tourist_attraction';

  const limit = pLimit(2);

  // 테스트용
  // const placeId = 'ChIJzzlcLQGifDURm_JbQKHsEX4';

  let placeData;

  function delayAPICalls(time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  // 검색 된 도시 사진 구하기
  async function getPhotos(sortedPlaces) {
    // const start = Date.now();
    // console.log('getPhotos 시작:', new Date(start).toLocaleTimeString());

    const photoPromises = sortedPlaces.map((place) =>
      limit(async () => {
        const photoName = place.photos?.[0]?.name;
        if (!photoName) {
          return { ...place, photoUrl: DEFAULT_IMAGE };
        }

        const url = `https://google-map-places-new-v2.p.rapidapi.com/v1/${photoName}/media?maxWidthPx=400&maxHeightPx=400&skipHttpRedirect=true`;
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': GOOGLE_API_KEY_J,
            'x-rapidapi-host': 'google-map-places-new-v2.p.rapidapi.com',
          },
        };

        await delayAPICalls(140);

        try {
          const response = await fetch(url, options);
          const result = await response.json();

          return {
            ...place,
            photoUrl: result?.photoUri || DEFAULT_IMAGE,
          };
        } catch (error) {
          console.error(`Error fetching photo for ${place.displayName?.text}`, error);
          return { ...place, photoUrl: DEFAULT_IMAGE };
        }
      })
    );

    const sortedPlacesWithPhotos = await Promise.all(photoPromises);

    // const end = Date.now();
    // console.log('getPhotos 종료:', new Date(end).toLocaleTimeString());
    // console.log(`총 소요 시간: ${end - start}ms`);
    return sortedPlacesWithPhotos;
  }

  // 검색 키워드 찾기
  const urlParams = new URLSearchParams(window.location.search);
  const city = urlParams.get('city');

  // 테스트용
  // const testCity = 'seoul';

  // 검색 된 도시 placeId 구하기
  async function getSearchedPlaceId(cityName) {
    if (!cityName) {
      throw new Error('Location name needed.');
    }

    const url = 'https://google-map-places-new-v2.p.rapidapi.com/v1/places:searchText';

    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': GOOGLE_API_KEY_J,
        'x-rapidapi-host': 'google-map-places-new-v2.p.rapidapi.com',
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.id,places.displayName',
      },
      body: JSON.stringify({
        textQuery: `${cityName} city`,
        maxResultCount: 1,
      }),
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (result.places && result.places.length > 0) {
        // console.log('text search result', result);

        const searchedPlaceId = result.places[0].id;
        return searchedPlaceId;
      } else {
        throw new Error(`${cityName} not found.`);
      }
    } catch (error) {
      console.error('Error in getting searched place ID:', error);
      throw error;
    }
  }

  // 검색 된 도시 데이터 구하기
  async function getPlaceData(cityName) {
    let placeId;

    if (cityName) {
      placeId = await getSearchedPlaceId(cityName);
    } else {
      throw new Error(`No place ID found for city: "${cityName}". Check if the city name is valid.`);
    }

    const url = `https://google-map-places-new-v2.p.rapidapi.com/v1/places/${placeId}`;

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': GOOGLE_API_KEY_J,
        'x-rapidapi-host': 'google-map-places-new-v2.p.rapidapi.com',
        'X-Goog-FieldMask': '*',
      },
    };

    try {
      const response = await fetch(url, options);
      placeData = await response.json();
      // console.log('getPlaceData placeData', placeData);
      return placeData;
    } catch (error) {
      console.error('Error in getting place data:', error);
      throw error;
    }
  }

  // 검색된 장소의 근처 places들 찾기
  async function getNearbyPlaces(placeDataParam, tabDataType, radius = 8000) {
    const url = 'https://google-map-places-new-v2.p.rapidapi.com/v1/places:searchNearby?languageCode=en';

    const { location } = placeDataParam;
    // console.log('getNearbyPlaces placeDataParam', placeDataParam);

    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': GOOGLE_API_KEY_J,
        'x-rapidapi-host': 'google-map-places-new-v2.p.rapidapi.com',
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': '*',
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            radius: radius,
          },
        },
        includedTypes: [`${tabDataType}`],
        // 테스트용
        maxResultCount: 8,
        // maxResultCount: 20,
        rankPreference: 'POPULARITY',
      }),
    };

    let result;

    try {
      const response = await fetch(url, options);
      result = await response.json();
      // console.log('nearby places', result);
    } catch (error) {
      console.error('Error in getting nearby places:', error);
      throw error;
    }

    // 근처 장소 필터링 type&rating
    const sortedResult = result.places
      .filter((place) => place.rating !== undefined)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 20);

    // console.log('sorted result', sortedResult);

    return sortedResult;
  }

  // 장소들 영업시간 구하기
  function getHours(sortedData) {
    return sortedData.map((place) => {
      const hours = place.currentOpeningHours;
      if (!hours) return '';

      const { open, close } = hours.periods[0];

      const openingHour = open.hour.toString().padStart(2, '0');
      const closingHour = close.hour.toString().padStart(2, '0');
      const openingMinute = open.minute.toString().padStart(2, '0');
      const closingMinute = close.minute.toString().padStart(2, '0');

      const placeHours = `${openingHour}:${openingMinute} - ${closingHour}:${closingMinute}`;

      return placeHours;
    });
  }

  // 리스트 아이템 로딩 중... 함수
  function renderLoading() {
    const section = document.querySelector('.tab_content.is_selected');
    if (!section) return;
    const listContainer = section.querySelector('ul');

    const LOADING_HEIGHT = 218;

    // 로딩 표시
    listContainer.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: ${LOADING_HEIGHT}px; width: 100%;">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
        <p style="color: #666; font-size: 14px;">Getting the best places in ${city}...</p>
      </div>
    </div>
  `;
  }

  // 추려낸 리스트 아이템 render
  function renderListItems(sortedData) {
    const section = document.querySelector('.tab_content.is_selected');
    if (!section) return;
    const listContainer = section.querySelector('ul');

    const sortedDataResult = sortedData.map(({ displayName, formattedAddress, rating, googleMapsUri, photoUrl, hours }) => ({
      placeName: displayName?.text,
      address: formattedAddress,
      rating,
      map: googleMapsUri,
      photoUrl,
      hours,
    }));

    // console.log('sortedDataResult', sortedDataResult);

    const listItem = sortedDataResult
      .map(
        ({ placeName, address, rating, map, photoUrl, hours }) => `
              <li class="accordion">
                <div class="photo_container">
                  <img class="photo" src="${photoUrl}" alt="${placeName}" />
                </div>
                <div class="accordion_item_contents">
                  <button class="landmark_name_button" type="button">
                    <span class="landmark_name">${placeName}</span>
                  </button>
                  <p class="landmark_address">${address}</p>
                  <p class="landmark_hours">${hours}</p>
                </div>
                <span class="stars">
                  <span class="star_symbol">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M7.47373 3.13C7.41498 2.954 7.26648 2.82775 7.08648 2.80025L5.25923 2.5265L4.43673 0.7805C4.35498 0.6075 4.18773 0.5 3.99998 0.5C3.81223 0.5 3.64498 0.6075 3.56323 0.7805L2.75273 2.52025L0.913483 2.80025C0.733483 2.82775 0.585233 2.954 0.526233 3.13C0.465983 3.31075 0.510483 3.50675 0.642483 3.6415L1.97273 5.003L1.65848 6.922C1.62723 7.11375 1.70473 7.3015 1.86123 7.41175C2.01173 7.5185 2.20523 7.529 2.36623 7.44025L3.98848 6.53425L5.63373 7.44025C5.79523 7.529 5.98823 7.518 6.13873 7.41175C6.29523 7.3015 6.37298 7.11375 6.34148 6.922L6.02673 5.0005L7.35748 3.6415C7.48948 3.50675 7.53398 3.31075 7.47373 3.13Z" fill="#FDF400" />
                    </svg>
                  </span>
                  <span class="star_score">${rating}</span>
                </span>
                <span class="accordion_map">
                  <a href="${map}" aria-label="${placeName} 지도에서 보기" target="_blank" rel="noopener noreferrer"
                    ><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0.874985 12.2501C0.78351 12.2514 0.694218 12.2221 0.621235 12.167C0.564691 12.1267 0.518538 12.0736 0.486587 12.0119C0.454637 11.9503 0.437806 11.882 0.437485 11.8126V3.50008C0.432505 3.40468 0.45889 3.31027 0.51261 3.23127C0.566329 3.15227 0.64443 3.09302 0.734985 3.06258L4.67248 1.75008C4.75952 1.72393 4.85232 1.72393 4.93936 1.75008L9.18748 3.06258L12.9937 1.79383C13.0595 1.77214 13.1295 1.76638 13.198 1.77702C13.2664 1.78767 13.3314 1.81443 13.3875 1.85508C13.4395 1.89402 13.4822 1.94407 13.5125 2.00159C13.5428 2.0591 13.5598 2.12264 13.5625 2.18758V10.5001C13.5627 10.5918 13.5341 10.6813 13.4807 10.7559C13.4274 10.8304 13.3519 10.8864 13.265 10.9157L9.32748 12.2282C9.24045 12.2544 9.14765 12.2544 9.06061 12.2282L4.81248 10.9595L1.01498 12.2501C0.968531 12.2564 0.921438 12.2564 0.874985 12.2501ZM4.81248 10.0626C4.85455 10.0564 4.89729 10.0564 4.93936 10.0626L9.18748 11.3751L12.6875 10.207V2.79571L9.32748 3.93758C9.24045 3.96373 9.14765 3.96373 9.06061 3.93758L4.81248 2.64696L1.31248 3.81508V11.2045L4.67248 10.0845C4.71794 10.0708 4.76504 10.0635 4.81248 10.0626Z"
                        fill="white"
                      />
                      <path d="M9.1875 11.8125C9.07147 11.8125 8.96019 11.7664 8.87814 11.6844C8.79609 11.6023 8.75 11.491 8.75 11.375V3.5C8.75 3.38397 8.79609 3.27269 8.87814 3.19064C8.96019 3.10859 9.07147 3.0625 9.1875 3.0625C9.30353 3.0625 9.41481 3.10859 9.49686 3.19064C9.57891 3.27269 9.625 3.38397 9.625 3.5V11.375C9.625 11.491 9.57891 11.6023 9.49686 11.6844C9.41481 11.7664 9.30353 11.8125 9.1875 11.8125Z" fill="white" />
                      <path d="M4.8125 10.5C4.69647 10.5 4.58519 10.4539 4.50314 10.3719C4.42109 10.2898 4.375 10.1785 4.375 10.0625V2.1875C4.375 2.07147 4.42109 1.96019 4.50314 1.87814C4.58519 1.79609 4.69647 1.75 4.8125 1.75C4.92853 1.75 5.03981 1.79609 5.12186 1.87814C5.20391 1.96019 5.25 2.07147 5.25 2.1875V10.0625C5.25 10.1785 5.20391 10.2898 5.12186 10.3719C5.03981 10.4539 4.92853 10.5 4.8125 10.5Z" fill="white" />
                    </svg>
                  </a>
                </span>
              </li>`
      )
      .join('');

    listContainer.innerHTML = listItem;
    listContainer.firstElementChild.classList.add('is_opened');

    // limitListItem() 함수 호출 전에 실행되도록 함
    requestAnimationFrame(() => {
      limitListItems();
    });
  }

  // 함수 호출
  async function processPlaceData(city) {
    try {
      renderLoading();

      const placeData = await getPlaceData(city);
      const sortedData = await getNearbyPlaces(placeData, INITIAL_TAB);

      const sortedPlacesWithPhotos = await getPhotos(sortedData);
      const hoursArray = getHours(sortedData);

      const mergedData = sortedPlacesWithPhotos.map((place, idx) => ({
        ...place,
        hours: hoursArray[idx],
      }));

      renderListItems(mergedData);
    } catch (error) {
      console.error('Error in processing place datas:', error);
      throw error;
    }
  }

  processPlaceData(city);

  // Tab & View More Button 기능
  const tabContainer = document.querySelector('.tabs_container');
  if (!tabContainer) return;
  const tabs = [...tabContainer.querySelectorAll('.tab')];
  const tabContents = [...tabContainer.querySelectorAll('.tab_content')];

  const viewMoreButton = document.querySelector('.view_more_button_container');
  if (!viewMoreButton) return;

  const SELECTED_CLASSNAME = 'is_selected';
  const ITEMS_PER_LOAD = 7;

  const tabCache = {};

  // Tab 기능 -----
  let selectedIndex = getSelectedIndex();

  // tab 클릭 시
  tabContainer.addEventListener('click', async (e) => {
    const button = e.target.closest('.tabs button');

    if (!button) return;

    if (selectedIndex > -1) {
      tabs.at(selectedIndex).classList.remove(SELECTED_CLASSNAME);
      tabContents.at(selectedIndex).classList.remove(SELECTED_CLASSNAME);
    }

    const clickedIndex = getClickedIndex(button);

    const clickedTabType = tabs.at(clickedIndex).getAttribute('data-primary-type');
    // console.log('clickedTabType', clickedTabType);

    tabs.at(clickedIndex).classList.add(SELECTED_CLASSNAME);
    tabContents.at(clickedIndex).classList.add(SELECTED_CLASSNAME);

    selectedIndex = clickedIndex;

    viewMoreLoadCount = 1;

    // tab cache 저장
    const cacheKey = clickedTabType;

    if (tabCache[cacheKey]) {
      // console.log('Use cached data:', cacheKey);
      renderListItems(tabCache[cacheKey]);
      return;
    }

    try {
      renderLoading();

      // 탭 클릭시 탭에 맞는 place type으로 주변 장소 검색하는 함수 호출
      const nearbyPlaces = await getNearbyPlaces(placeData, clickedTabType);
      // console.log('nearbyPlaces in tab click', nearbyPlaces);

      const sortedPlacesWithPhotos = await getPhotos(nearbyPlaces);
      const hoursArray = getHours(nearbyPlaces);

      const mergedData = sortedPlacesWithPhotos.map((place, idx) => ({
        ...place,
        hours: hoursArray[idx],
      }));
      // console.log('tab clicked merged data', mergedData);

      tabCache[cacheKey] = mergedData;

      renderListItems(mergedData);
    } catch (error) {
      console.error('Error in getting tab data:', error);
      throw error;
    }
  });

  function getSelectedIndex() {
    return tabs.findIndex((tab) => tab.classList.contains(SELECTED_CLASSNAME));
  }

  function getClickedIndex(button) {
    return tabs.findIndex((tab) => tab === button);
  }

  // 탭의 첫 컨텐츠 갯수 제한
  function limitListItems() {
    const section = document.querySelector('.tab_content.is_selected');
    if (!section) return;
    const currentListItems = [...section.querySelectorAll('li')];

    if (currentListItems.length > ITEMS_PER_LOAD) {
      currentListItems.forEach((item, index) => {
        if (index > ITEMS_PER_LOAD - 1) {
          item.setAttribute('aria-hidden', 'true');
          item.style.display = 'none';
        }
      });
    }

    viewMoreButton.removeAttribute('aria-hidden');
    viewMoreButton.style.display = 'block';
  }

  // View More Button 기능 -----
  let viewMoreLoadCount = 1;

  // 더 보기 버튼 클릭 시 나머지 아이템 보여줌
  viewMoreButton.addEventListener('click', (e) => {
    e.stopPropagation();

    const button = e.target.closest('button');

    if (!button) return;

    const section = document.querySelector('.tab_content.is_selected');
    const currentListItems = [...section.querySelectorAll('li')];

    viewMoreLoadCount++;

    const startIndex = ITEMS_PER_LOAD * (viewMoreLoadCount - 1);
    const endIndex = ITEMS_PER_LOAD * viewMoreLoadCount;

    currentListItems.forEach((item, index) => {
      if (index >= startIndex && index < endIndex) {
        item.removeAttribute('aria-hidden');
        if (item.classList.contains('landmark_list_item_wrapper')) {
          item.style.display = 'grid';
        } else {
          item.style.display = 'flex';
        }
      }
    });

    if (endIndex >= currentListItems.length) {
      viewMoreButton.setAttribute('aria-hidden', 'true');
      viewMoreButton.style.display = 'none';
      if (document.activeElement === button) button.blur();

      const lastItem = currentListItems.at(-1);
      lastItem.classList.add('last_list_item');
    }
  });

  // Accordion 기능
  const contents = document.querySelector('.contents');

  if (contents) {
    contents.addEventListener('click', (e) => {
      const button = e.target.closest('.accordion .landmark_name_button');
      const photo = e.target.closest('.photo_container');
      if (!button && !photo) return;

      const clickedListItem = (button || photo).closest('.accordion');
      clickedListItem.classList.toggle('is_opened');
    });
  }
})();
