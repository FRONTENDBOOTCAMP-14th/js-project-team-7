// 캐러셀 기능 구현
function initCarousel(carouselElement, headerElement) {
  const track = carouselElement.querySelector('.carousel_track');
  const prevButton = headerElement.querySelector('.prev_button');
  const nextButton = headerElement.querySelector('.next_button');
  const cards = track.querySelectorAll('.destination_card');

  let currentIndex = 0;
  const cardWidth = 220; // 카드 너비
  const gap = 15; // 카드 간격
  const totalWidth = cardWidth + gap; // 카드 하나당 총 너비
  const maxIndex = cards.length - 1; // 마지막 인덱스

  // 초기 설정
  track.style.transform = `translateX(0px)`;
  updateButtons();

  // 이전 버튼 클릭 이벤트
  prevButton.addEventListener('click', function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  // 다음 버튼 클릭 이벤트
  nextButton.addEventListener('click', function () {
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  // 캐러셀 위치 업데이트
  function updateCarousel() {
    // 현재 인덱스의 카드가 컨테이너 맨 왼쪽에 오도록 이동
    // 각 카드는 totalWidth(235px)만큼 이동
    const translateX = -currentIndex * totalWidth;
    track.style.transform = `translateX(${translateX}px)`;
    track.style.transition = 'transform 0.3s ease';
    updateButtons();
  }

  // 버튼 상태 업데이트
  function updateButtons() {
    // 이전 버튼 상태 관리
    if (currentIndex === 0) {
      prevButton.classList.add('disabled');
    } else {
      prevButton.classList.remove('disabled');
    }

    // 다음 버튼 상태 관리
    if (currentIndex === maxIndex) {
      nextButton.classList.add('disabled');
    } else {
      nextButton.classList.remove('disabled');
    }
  }
}

// DOM이 로드되면 캐러셀 초기화
document.addEventListener('DOMContentLoaded', function () {
  // 모든 캐러셀 섹션과 헤더 찾기
  const carouselSections = document.querySelectorAll('.destinations');
  const sectionHeaders = document.querySelectorAll('.section_header');

  // 각 섹션에 대해 캐러셀 초기화
  for (let i = 0; i < carouselSections.length; i++) {
    if (sectionHeaders[i]) {
      initCarousel(carouselSections[i], sectionHeaders[i]);
    }
  }
});
