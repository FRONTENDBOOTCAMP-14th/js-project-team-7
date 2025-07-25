// Tab & View More Button 기능
(() => {
  const tabContainer = document.querySelector('.tabs_container');
  if (!tabContainer) return;
  const tabs = [...tabContainer.querySelectorAll('.tab')];
  const tabContents = [...tabContainer.querySelectorAll('.tab_content')];

  const viewMoreButton = document.querySelector('.view_more_button_container');
  if (!viewMoreButton) return;

  const SELECTED_CLASSNAME = 'is_selected';
  const ITEMS_PER_LOAD = 7;

  // Tab 기능 -----
  let selectedIndex = getSelectedIndex();

  // tab 클릭 시
  tabContainer.addEventListener('click', (e) => {
    const button = e.target.closest('.tabs button');

    if (!button) return;

    if (selectedIndex > -1) {
      tabs.at(selectedIndex).classList.remove(SELECTED_CLASSNAME);
      tabContents.at(selectedIndex).classList.remove(SELECTED_CLASSNAME);
    }

    const clickedIndex = getClickedIndex(button);

    tabs.at(clickedIndex).classList.add(SELECTED_CLASSNAME);
    tabContents.at(clickedIndex).classList.add(SELECTED_CLASSNAME);

    selectedIndex = clickedIndex;

    viewMoreLoadCount = 1;

    limitListItems();
  });

  limitListItems();

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
})();

// Accordion 기능
(() => {
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
