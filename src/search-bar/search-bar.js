const keywords = ['서울', '경기', '부산', '제주', '강릉', '속초', '경주', '전주'];

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search_input');
  const suggestionsBox = document.getElementById('suggestions');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    suggestionsBox.innerHTML = '';

    console.log(query);

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
