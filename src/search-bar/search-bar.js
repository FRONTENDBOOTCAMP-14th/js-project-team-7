const keywords = ['서울', '경기', '부산', '제주', '강릉', '속초', '경주', '전주'];

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search_input');
  const suggestionsBox = document.getElementById('suggestions');
  const searchButton = document.getElementById('search_button');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    suggestionsBox.innerHTML = '';

    if (query.length > 0) {
      searchButton.style.background = 'var(--color_blue)';
    } else {
      searchButton.style.background = 'var(--color_black)';
    }

    if (query) {
      const filtered = keywords.filter((word) => word.includes(query));
      if (filtered.length > 0) {
        filtered.forEach((word) => {
          const li = document.createElement('li');
          li.textContent = word;
          li.addEventListener('click', () => {
            searchInput.value = word;
            suggestionsBox.style.display = 'none';
          });
          suggestionsBox.appendChild(li);
        });
        suggestionsBox.style.display = 'block';
      } else {
        suggestionsBox.style.display = 'none';
      }
    } else {
      suggestionsBox.style.display = 'none';
    }
  });
});
