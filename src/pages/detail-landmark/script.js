// Accordion 기능
{
  const contents = document.querySelector('.contents');

  contents.addEventListener('click', (e) => {
    const button = e.target.closest('.accordion .landmark_name_button');
    const photo = e.target.closest('.photo_container');
    if (!button && !photo) return;

    const clickedListItem = (button || photo).closest('.accordion');
    clickedListItem.classList.toggle('is_opened');
  });
}
