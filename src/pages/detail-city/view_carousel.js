const ACTIVE_CLASS = 'is_active';
const viewCarousel = document.querySelector('.view_carousel');
const viewCarouselList = viewCarousel.querySelector('.view_carousel_list');
const viewCarouselItems = Array.from(viewCarousel.querySelectorAll('.view_carousel_item'));
const viewCarouselCount = viewCarouselItems.length;
const viewCarouselStatus = viewCarousel.querySelector('.view_carousel_status');

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

    console.log(viewCarouselActiveIndex);
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

const viewInfoContents = document.querySelector('.view_info_contents');
const viewMap = viewInfoContents.querySelector('.view_map');

// 맵 관련 기능 구현 시작
viewInfoContents.addEventListener('click', ({ target }) => {
  const changeBtn = target.closest('.change_btn');

  if (changeBtn) {
    const mapBtn = target.closest('.map');
    const imgBtn = target.closest('.img');

    if (mapBtn) {
      viewMap.classList.add(ACTIVE_CLASS);
      viewMap.setAttribute('aria-hidden', 'false');
      viewCarousel.setAttribute('aria-hidden', 'true');
    } else {
      viewMap.classList.remove(ACTIVE_CLASS);
      viewMap.setAttribute('aria-hidden', 'true');
      viewCarousel.setAttribute('aria-hidden', 'false');
    }
  }
});
// 맵 관련 기능 구현 종료
