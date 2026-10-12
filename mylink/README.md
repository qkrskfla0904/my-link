# 마이링크 (MyLink) 🔗

> Next.js 16 및 React 19 기반의 2001년 닌텐도 하드웨어 스타일 커스텀 링크 트리(Link-in-bio) 웹 애플리케이션

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)

---

## 📌 프로젝트 소개

`MyLink`는 크리에이터, 개발자 및 인플루언서를 위한 감성적이고 직관적인 바이오 링크 서비스입니다.  
2001년 닌텐도 클래식 콘솔 하드웨어(GameCube, GBA)의 아날로그 감성과 최신 Next.js App Router, shadcn/ui 컴포넌트 아키텍처를 결합하여 제작되었습니다.

---

## ✨ 핵심 기능

- **👤 닌텐도 하드웨어 프로필 헤더**: LCD 프레임 아바타, 실시간 `ONLINE` 점멸 LED, 구직 및 커피챗 가능 배지, 응원 카운터
- **⚡ SNS 원클릭 퀵 커넥트 바**: GitHub, LinkedIn, Tech Blog, Email, Globe 등 주요 SNS 바로가기
- **📂 카테고리 탭 실시간 필터링**: 전체, 개발/코드, 포트폴리오, 블로그, SNS, 연락처별 즉시 필터링
- **➕ 다이얼로그 기반 링크 추가**: 서버 연동 없이 브라우저 `localStorage`를 활용하여 실시간 링크 등록 및 영속화
- **🔥 스마트 링크 카드**: HOT 인기 배지, 링크별 실시간 클릭수 카운트, 원클릭 URL 클립보드 복사
- **🎨 5종 섀시 디스플레이 테마 스위처**: Home(Lavender), Systems(Teal), Games(Red), News(Ice), Classic(Gold) 실시간 전환
- **📱 인터랙티브 위젯 & 공유 모달**: Player's Poll 투표 모듈 및 게임보이 LCD 스타일 QR 코드 공유 모달

---

## 🛠️ 기술 스택

| 분류 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | 서버 컴포넌트 & 클라이언트 하이브리드 아키텍처, Turbopack |
| **Library** | React 19 | 최신 리액트 코어 및 훅 |
| **Language** | TypeScript 5 | 엄격한 타입 안정성 |
| **UI Components** | shadcn/ui (Radix Primitives) | 높은 접근성(WAI-ARIA)의 재사용 가능한 컴포넌트 |
| **Styling** | Tailwind CSS v4 (100% 통일) | 모듈 CSS를 배제한 CSS-first 유틸리티 클래스 |
| **Persistence** | Browser LocalStorage | 백엔드 없이 클라이언트 데이터 영속화 |

---

## 🚀 실행 방법

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다. (또는 `start-dev.bat` 더블클릭)

### 3. 프로덕션 빌드 및 실행
```bash
npm run build
npm run start
```

---

## 📄 라이선스

이 프로젝트는 [MIT License](../LICENSE)를 따릅니다.
