# 🌍 Go7 - Travel Recommendation Platform

![VanillaJS](https://img.shields.io/badge/VanillaJS-ES6+-yellow)
![API](https://img.shields.io/badge/API-Wikipedia%20%2B%20Places-blue)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen)
![Deployment](https://img.shields.io/badge/Deploy-Netlify-00C7B7)

**Discover Amazing Destinations with Intelligent Travel Recommendations**

> 심플하고 직관적인 UI로 전 세계 여행지를 탐색하세요! 계절별 추천부터 실시간 검색까지, 완벽한 여행 계획을 도와드립니다.

🚀 **[Live Demo](https://likeliongo7.netlify.app/)** | 📱 **Mobile Optimized** | 🌐 **75,000+ Cities Supported**

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technologies Used](#-technologies-used)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Integration](#-api-integration)
- [Project Structure](#-project-structure)
- [Challenges & Solutions](#-challenges--solutions)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Project Overview

**Go7**은 사용자 중심의 여행 추천 플랫폼으로, 전 세계 75,000개 이상의 도시 데이터를 바탕으로 개인화된 여행 정보를 제공합니다. 

### 핵심 가치
- **직관적 UX**: 모바일 퍼스트 디자인으로 어디서나 쉽게 접근
- **실시간 데이터**: Wikipedia & Google Places API 연동으로 최신 정보 제공
- **스마트 검색**: 자동 완성 지원으로 편리한 검색 경험
- **계절별 큐레이션**: Summer, Autumn, Hot 카테고리별 맞춤 추천

---

## ✨ Key Features

### 🏖️ **계절별 여행지 추천 캐러셀**
- **Summer**: 무더위를 피할 수 있는 시원한 여행지 (Alaska, Barcelona, Florence 등)
- **Autumn**: 가을 정취를 만끽할 수 있는 도시 (Seoul, Tokyo, Paris 등)  
- **Hot**: 인기 급상승 여행지 (Dubai, Bangkok, Bali 등)
- 모바일 최적화 1.5카드 뷰로 다음 카드 미리보기 제공

### 🔍 **실시간 스마트 검색**
- **자동완성**: 'Flo' 입력 시 'Florence' 자동 추천
- **75,000+ 도시**: 전 세계 주요 도시 데이터 지원
- **즉시 반응**: 타이핑과 동시에 실시간 결과 표시

### 🖼️ **고품질 이미지 시스템**
- **Wikipedia API**: 실제 도시 대표 이미지 자동 로딩
- **스마트 필터링**: 지도/SVG 이미지 자동 제외
- **대체 이미지**: API 실패 시 기본 썸네일 제공
- **특별 검색어**: 주요 도시별 최적화된 검색 로직

### 📱 **반응형 디자인**
- **플로팅 로고**: 부드러운 애니메이션 효과
- **터치 친화적**: 모바일 환경 최적화
- **빠른 네비게이션**: 카드 클릭으로 상세 페이지 이동

---

## 🛠 Technologies Used

### **Frontend**
- **HTML5**: 시맨틱 마크업과 접근성 준수
- **CSS3**: Flexbox, Grid, Keyframe 애니메이션
- **JavaScript (ES6+)**: 모던 JavaScript 문법 활용
  - Async/Await for API handling
  - ES6 Modules for code organization
  - Fetch API for HTTP requests

### **APIs & External Services**
- **Wikipedia REST API**: 도시 정보 및 이미지 데이터
- **Google Places API**: 랜드마크 및 관광지 정보
- **Open Meteo API**: 실시간 날씨 관련 데이터

### **Development & Deployment**
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **Netlify**: 자동 배포 및 호스팅
- **Git**: 버전 관리 및 협업

---

## 🚀 Installation

### Requirements
- **Node.js** 16.0+ 
- **pnpm**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Setup Instructions

1. **프로젝트 클론**
```bash
git clone https://github.com/FRONTENDBOOTCAMP-14th/js-project-team-7.git
cd js-project-team-7
```

2. **의존성 설치**
```bash
pnpm install
```

3. **개발 서버 실행**
```bash
# Vite 개발 서버
pnpm dev
```

4. **브라우저에서 확인**
```
http://localhost:5173 (Vite)
```

---

## � Usage

### **기본 사용법**

1. **메인 페이지**: 루트 `/index.html`에서 플로팅 로고 클릭
2. **카테고리 탐색**: Summer/Autumn/Hot 섹션에서 여행지 둘러보기
3. **검색 기능**: 상단 검색바에서 도시명 입력
4. **상세 정보**: 카드 클릭으로 해당 도시의 상세 페이지 이동

### **고급 기능**

- **자동완성 활용**: 도시명 일부만 입력해도 스마트 추천
- **국가별 검색**: "United Kingdom" 입력 시 영국 내 모든 도시 표시

---

## 📁 Project Structure

```
|── .github
|── dist
|── node_modules/
|── public/                                      
|   └── image/                                 #정적인 이미지파일
|── src/
|   |── assets/                                #svg 파일
|   |── components/                            #페이지 조립에 필요한 컴포넌트 폴더
|   |── pages/                                 #컴포넌트들을 모아서 만든 페이지 폴더
|   |── styles/
|   |      └── common/                         #공통 css
|   |             |── ally.css                 
|   |             |── base.css
|   |             |── index.css
|   |             |── morden-reset.css
|   |             └── theme.css
|   |             └── layout.css
|   |── main.js                                #메인 js
|   └── style.css                              #메인 css
|── .env                                       #환경변수 파일
|── .gitignore
|── .prettierignore
|── eslint.config.js
|── index.html                                 #메인 페이지
|── package-lock.json
|── package.json
|── pnpm-lock.yaml
|── README.md
|── vite.config.js
```

---

## 🎯 Challenges & Solutions

### **Challenge 1: Google Places API 트래픽 제한과 아키텍처 전환**
**문제**: 
- 초기 Google Places API 기반 설계에서 무료 플랜의 트래픽 제한에 자주 걸림
- 고품질 이미지와 풍부한 데이터를 제공하지만 비용 문제로 지속 사용 불가능
- 기존 코드가 Places API에 강하게 결합되어 대안 API로의 전환이 복잡

**해결책**:
- **무료 Wikipedia API 기반으로 전면 아키텍처 재설계**
- API 추상화 레이어 도입으로 향후 API 변경에 유연하게 대응
- 비용 효율적이면서도 신뢰할 수 있는 데이터 소스 확보

### **Challenge 2: 모놀리식 함수와 코드 전면 리팩토링**
**문제**: 
- 하나의 거대한 함수에 모든 로직이 집중되어 유지보수 어려움
- 작은 수정에도 전체 로직이 영향받는 강결합 구조
- 팀 협업 시 코드 충돌과 디버깅 어려움 지속 발생

**해결과정**:
```javascript
// Before: 모든 로직이 하나의 함수에 집중
async function handleEverything(city) {
  // API 호출, 데이터 처리, DOM 조작, 에러 처리가 모두 섞여있음
  // 200+ 줄의 복잡한 로직...
}

// After: 단일 책임 원칙 적용
async function getCityInfoFromWikipedia(city) { /* API 호출만 */ }
function createDestinationCard(cityData) { /* DOM 생성만 */ }  
function handleSearchError(error) { /* 에러 처리만 */ }
```

**핵심 개선사항**:
- **단일 책임 원칙(SRP)** 적용으로 함수별 명확한 역할 분담
- 중간 점검 피드백을 바탕으로 **전체 코드베이스 재작성**
- 작고 명확한 함수 단위로 분할하여 **테스트 가능성과 재사용성** 크게 향상

### **Challenge 3: 발리 이미지 지도 문제**
**문제**: Bali 검색 시 관광지 사진 대신 행정구역 지도 이미지 표시

**해결책**: 
- 특별 검색어 배열 도입: `['Ubud', 'Tanah Lot', 'Kuta Beach']`
- 이미지 유효성 검사로 Montage/SVG 파일 필터링
- 여행지 대표 이미지 우선 선택 로직 구현

### **Challenge 4: United Kingdom URL 길이 문제**
**문제**: 영국 검색 시 JSON 직렬화로 인한 500자+ 길이의 URL 생성

**해결책**:
- URL 파라미터 최적화: `?cities=[복잡한JSON]` → `?country=United%20Kingdom`
- 서버 사이드에서 국가별 도시 목록 재구성
- 브라우저 호환성 및 URL 공유 편의성 대폭 개선

### **Challenge 5: Google Places API Rate Limiting (429 Too Many Requests)**
**문제**: 
- Google Places API 무료 플랜의 동시 요청 수와 초당 요청량 제한
- 기존 `Promise.all()` 병렬 호출로 인한 `429 Too Many Requests` 에러 빈발
- 모든 장소 데이터를 동시에 가져오려 할 때 API 한계 초과

**해결과정**:
```javascript
// Before: 무제한 병렬 요청으로 API 한계 초과
const requests = cities.map(city => fetchCityData(city));
const results = await Promise.all(requests); // ❌ 429 에러 발생

// After: p-limit로 동시 요청 수 제한
import pLimit from 'p-limit';
const limit = pLimit(3); // 동시 요청 3개로 제한

const fetchCityData = async (city) => {
  return limit(async () => {
    await delay(CONFIG.API_DELAY_MS); // 요청 간 딜레이 추가
    return fetch(apiUrl);
  });
};
```

**해결책**:
- **p-limit 라이브러리** 도입으로 동시 요청 수를 3개로 제한
- **요청 간 딜레이** 추가로 안정적인 API 호출 흐름 확보
- **에러 재시도 로직** 구현으로 일시적 실패에 대한 복원력 향상

### **Challenge 6: 국가/도시 구분 모호성 문제**
**문제**:
- 사용자 입력이 국가명인지 도시명인지 구분하기 어려운 경우 발생
- 같은 이름을 가진 국가와 도시가 존재 (예: Singapore)
- 검색 결과의 정확성과 사용자 의도 파악의 어려움

**해결책**:
```javascript
// 우선순위 기반 검색 로직
async function handleAmbiguousSearch(query) {
  // 1순위: 국가명으로 먼저 검색
  const countryMatch = await searchByCountry(query);
  if (countryMatch) return countryMatch;
  
  // 2순위: 도시명으로 검색
  const cityMatch = await searchByCity(query);
  return cityMatch || [];
}
```

**핵심 개선사항**:
- **국가명 우선순위** 적용으로 명확한 검색 로직 구축
- **계층적 검색 전략**으로 사용자 의도 정확도 향상
- **fallback 메커니즘**으로 검색 실패 최소화

### **Challenge 7: 대용량 데이터(75,000개 도시) 성능 최적화**
**문제**:
- 75,000개 도시 데이터를 클라이언트 메모리에 저장 시 성능 저하 우려
- 실시간 검색 자동완성에서 전체 데이터 스캔으로 인한 지연
- 브라우저 메모리 사용량 증가와 검색 응답 속도 저하

**해결과정**:
```javascript
// 성능 최적화된 검색 로직
function optimizedSearch(query) {
  const maxSuggestions = 10; // 최대 추천 수 제한
  
  if (query.length < 3) {
    // 3글자 미만: 완전 일치만 검색
    return cities.filter(city => 
      city.name.toLowerCase().startsWith(query.toLowerCase())
    ).slice(0, maxSuggestions);
  } else {
    // 3글자 이상: 포함 검색 허용
    return cities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, maxSuggestions);
  }
}
```

**핵심 최적화 전략**:
- **단계별 검색**: 3글자 미만은 완전일치, 이후 포함검색 적용
- **결과 수 제한**: 최대 10개 추천으로 렌더링 부하 감소  
- **조기 종료**: `slice()` 활용으로 불필요한 연산 방지
- **메모리 효율성**: 필요한 만큼만 처리하는 지연 로딩 패턴

### **Challenge 8: 이벤트 버블링과 의도치 않은 이벤트 전파**
**문제**:
- "더 보기" 버튼 클릭 시 리스트 아이템이 추가되지 않고 깜빡이는 현상 발생
- 클릭 이벤트는 정상 작동하지만 UI 렌더링에서 예상과 다른 결과
- 콘솔 로그로는 정상 작동하는 것처럼 보이지만 실제 화면에서는 변화 없음

**원인 분석**:
```javascript
// 문제의 코드: 동일한 선택자로 인한 이벤트 충돌
viewMoreButton.addEventListener('click', (e) => {
  const button = e.target.closest('button');
  // 리스트 아이템 추가 로직
});

tabContainer.addEventListener('click', async (e) => {
  const button = e.target.closest('button');
  // 리스트 아이템 리셋 로직 ⚠️
});
```

**해결과정**:
1. **이벤트 버블링 현상 파악**: viewMoreButton 클릭 → tabContainer로 이벤트 전파
2. **실행 순서 분석**: 아이템 추가 → 즉시 리셋으로 인한 시각적 변화 없음
3. **두 가지 해결 방안 적용**

```javascript
// 해결책 1: 더 구체적인 선택자 사용
tabContainer.addEventListener('click', async (e) => {
  const button = e.target.closest('.tab button'); // 탭 버튼만 대상
});

// 해결책 2: 이벤트 전파 차단
viewMoreButton.addEventListener('click', (e) => {
  e.stopPropagation(); // 부모로 이벤트 전파 방지
  const button = e.target.closest('button');
  // 리스트 아이템 추가 로직
});
```

### **Challenge 9: 중복 API 호출과 탭 전환 시 깜빡임 현상**
**문제**:
- 탭 클릭할 때마다 동일한 데이터에 대해 불필요한 API 재호출 발생
- A탭 → B탭 → A탭 이동 시 A탭 데이터 재요청으로 인한 깜빡임 현상
- 사용자 경험 저하와 API 호출 비용 증가

**문제 시나리오**:
```javascript
// 기존 코드: 매번 API 호출
tabContainer.addEventListener('click', async (e) => {
  const tabType = getTabType(e.target);
  const data = await fetchTabData(tabType); // 💸 중복 호출
  renderListItems(data);
});
```

**해결책**:
```javascript
// 캐싱 시스템 도입
const tabCache = {}; // 탭별 데이터 캐시

tabContainer.addEventListener('click', async (e) => {
  const clickedTabType = getTabType(e.target);
  const cacheKey = clickedTabType;
  
  // 캐시된 데이터가 있으면 즉시 렌더링
  if (tabCache[cacheKey]) {
    renderListItems(tabCache[cacheKey]);
    return; // API 호출 없이 종료
  }
  
  // 새로운 데이터만 API 호출
  const mergedData = await fetchTabData(clickedTabType);
  tabCache[cacheKey] = mergedData; // 캐시에 저장
  renderListItems(mergedData);
});
```

**추가 최적화**:
```javascript
// 초기 탭도 캐시에 저장하는 개선안
document.addEventListener('DOMContentLoaded', async () => {
  const initialTabType = 'landmark';
  const initialData = await fetchTabData(initialTabType);
  tabCache[initialTabType] = initialData; // 초기 탭도 캐싱
  renderListItems(initialData);
});
```

**핵심 개선사항**:
- **메모리 기반 캐싱**: 한 번 로드된 탭 데이터는 브라우저 세션 동안 유지
- **즉시 렌더링**: 캐시된 데이터는 네트워크 지연 없이 즉시 표시
- **API 호출 최적화**: 동일한 탭에 대한 중복 요청 완전 제거
- **사용자 경험 향상**: 탭 전환 시 깜빡임 현상 해결

### **🚧 Current Limitations & Future Plans**
**현재 한계점**:
- 기능별 모듈화가 완전히 이루어지지 않은 구조
- 일부 컴포넌트 간 의존성이 명확하지 않음
- 코드 최적화 및 성능 개선 여지 존재

**향후 개선 계획**:
- **모듈 시스템 강화**: ES6 Modules를 활용한 완전한 기능별 분리
- **의존성 주입**: 컴포넌트 간 느슨한 결합 구조 구축
- **성능 최적화**: 레이지 로딩, 캐싱 전략 도입
- **테스트 코드**: 단위 테스트 및 통합 테스트 추가

### **Key Learning Points**
- **아키텍처 설계의 중요성**: 초기 API 선택이 전체 프로젝트 방향에 미치는 큰 영향
- **단일 책임 원칙**: 하나의 함수는 하나의 역할만 해야 한다는 원칙의 실무적 가치 체감
- **점진적 개선**: 완벽한 코드보다는 지속적인 리팩토링과 개선이 더 현실적
- **협업과 유지보수**: 작고 명확한 함수 구조가 팀 협업에 미치는 긍정적 영향
- **비용 대비 효과**: 무료 API의 한계를 창의적으로 극복하는 방법론 습득

---

## 🗺️ Project Status & Roadmap

### Current Status: ✅ **Completed (v1.0)**
- ✅ 스플래시 스크린 및 메인 네비게이션
- ✅ 계절별 여행지 추천 시스템
- ✅ 실시간 검색 및 자동완성
- ✅ Wikipedia API 연동 및 이미지 최적화
- ✅ 모바일 반응형 디자인
- ✅ Netlify 배포 및 CI/CD

### Future Roadmap (v2.0)
- 🔄 사용자 선호도 학습 알고리즘
- 🔄 소셜 기능 (여행 후기 공유)
- 🔄 오프라인 북마크 기능
- 🔄 PWA (Progressive Web App) 전환
- 🔄 다국어 지원
