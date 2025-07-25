import { renderSearchResults } from '../../pages/search-result/index.js';

const countries = new Set();
const cities = new Set();
let countryCityMap = {};

async function getAllCountriesAndCities() {
  const res = await fetch('https://countriesnow.space/api/v0.1/countries');
  const { data } = await res.json();

  data.forEach((item) => {
    countries.add(item.country);
    item.cities.forEach((city) => cities.add(city));

    if (!countryCityMap[item.country]) {
      countryCityMap[item.country] = [];
    }
    countryCityMap[item.country].push(...item.cities);
  });
}

getAllCountriesAndCities();

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search_input');
  const suggestionsBox = document.getElementById('suggestions');
  const searchButton = document.getElementById('search_button');

  let selectedIndex = -1; // 현재 선택된 li 인덱스

  const showSuggestions = () => {
    suggestionsBox.style.display = 'block';
  };

  const hideSuggestions = () => {
    suggestionsBox.style.display = 'none';
    selectedIndex = -1; // 숨길 때 선택 초기화
  };

  const changeButtonColor = (color) => {
    searchButton.style.background = color;
  };

  const clearSelection = () => {
    const items = suggestionsBox.querySelectorAll('li');
    items.forEach((item) => item.classList.remove('selected'));
  };

  const updateSelection = () => {
    clearSelection();
    const items = suggestionsBox.querySelectorAll('li');
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      const selectedItem = items[selectedIndex];
      selectedItem.classList.add('selected');
      searchInput.value = selectedItem.textContent;
    }
  };

  function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    hideSuggestions();

    const countryArray = [...countries];
    const cityArray = [...cities];

    const lowerQuery = query.toLowerCase();

    const matchedCountry = countryArray.find((c) => c.toLowerCase() === lowerQuery);
    const matchedCity = cityArray.find((c) => c.toLowerCase() === lowerQuery);

    if (matchedCountry) {
      renderSearchResults(countryCityMap[matchedCountry]);
    } else if (matchedCity) {
      renderSearchResults([matchedCity]);
    } else {
      console.log('검색 결과 없음');
      return [];
    }
  }

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    suggestionsBox.innerHTML = '';
    selectedIndex = -1; // input 바뀌면 선택 초기화

    if (query.length > 0) {
      changeButtonColor('var(--color_blue)');
    } else {
      changeButtonColor('var(--color_black)');
    }

    const MAX_SUGGESTIONS = 10;
    const allItems = [...countries, ...cities];

    let filtered = [];

    if (query.length <= 3) {
      filtered = allItems.filter((word) => word.toLowerCase().startsWith(query)).slice(0, MAX_SUGGESTIONS);
    } else {
      filtered = allItems.filter((word) => word.toLowerCase().includes(query)).slice(0, MAX_SUGGESTIONS);
    }

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

  searchInput.addEventListener('keydown', (event) => {
    const items = suggestionsBox.querySelectorAll('li');

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (items.length === 0) return;
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSelection();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (items.length === 0) return;
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSelection();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        searchInput.value = items[selectedIndex].textContent;
        hideSuggestions();
        handleSearch();
      } else {
        handleSearch();
      }
    }
  });

  searchButton.addEventListener('click', () => {
    handleSearch();
  });
});
