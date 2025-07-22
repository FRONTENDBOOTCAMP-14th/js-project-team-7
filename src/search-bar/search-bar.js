const keywords = ['서울', '경기', '부산', '제주', '강릉', '속초', '경주', '전주'];

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search_input');
  const suggestionsBox = document.getElementById('suggestions');
  const searchButton = document.getElementById('search_button');

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
});
