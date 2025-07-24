// Tab 기능
{
  const tabContainer = document.querySelector('.tabs_container');
  const tabs = [...tabContainer.querySelectorAll('.tab')];
  const tabContents = [...tabContainer.querySelectorAll('.tab_content')];

  const SELECTED_CLASSNAME = 'is_selected';

  let selectedIndex = getSelectedIndex();

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
  });

  function getSelectedIndex() {
    return tabs.findIndex((tab) => tab.classList.contains(SELECTED_CLASSNAME));
  }

  function getClickedIndex(button) {
    return tabs.findIndex((tab) => tab === button);
  }
}
