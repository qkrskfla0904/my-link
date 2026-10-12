# [Design System] 닌텐도 하드웨어 & 웹 디자인 시스템 (2001 Nintendo Hub Style)

본 문서는 **마이링크(MyLink)** 프로젝트의 **2001년 닌텐도 클래식 하드웨어 및 공식 웹 포털 디자인 시스템**에 대한 디자인 토큰, 시각 계층, shadcn/ui 컴포넌트 매핑 명세를 정의합니다.

---

## 1. 디자인 철학 (Design Philosophy)

1. **Hardware Tactility (물리적 하드웨어 조작감)**
   - 평면적인 모던 웹을 탈피하고, 90년대 후반~2000년대 초반 게임기(GameCube, Game Boy Advance, Nintendo 64)의 **섀시(Chassis), 메탈 플레이트, 양각/음각 베벨(Bevel), 카트리지 슬롯**의 질감을 충실히 재현합니다.
2. **Silkscreen & Industrial Typography (산업용 인쇄 및 레트로 폰트)**
   - 굵은 이탤릭 타이틀(Box-art), 고대비 볼드 실크스크린 라벨, 시스템 모노스페이스 데이터 폰트를 결합합니다.
3. **shadcn/ui + Radix Primitives 기반의 모던 아키텍처**
   - WAI-ARIA 접근성, 키보드 인터랙션, 타입 안전성은 최신 표준(`shadcn/ui`, `Base UI / Radix`)을 완벽히 준수하되, 외형과 변형(Variants)은 닌텐도 디자인 토큰으로 커스터마이징합니다.

---

## 2. 색상 팔레트 및 디자인 토큰 (Color Tokens)

### 2.1 하드웨어 베이스 색상 (Hardware Base Palette)
| 토큰명 | CSS 변수 / Hex | 용도 |
| :--- | :--- | :--- |
| **Canvas** | `--canvas: #7a8aba` | 기본 섀시 배경 컬러 (인디고 그레이) |
| **Periwinkle** | `--periwinkle: #8ba1d4` | 플레이트 기본 메탈릭 표면 |
| **Canvas Soft** | `--canvas-soft: #9fbee7` | 컨트롤 스트립 및 서브 패널 |
| **Ice** | `--ice: #c0d5e6` | 뉴스 / 밝은 영역 패널 |
| **Chrome Indigo**| `--chrome-indigo: #3d4f97`| 베벨 음영 테두리 및 딥 블루 라인 |
| **Carbon** | `--carbon: #21242e` | 스피커 그릴, 인셋 트레이, 베벨 다크 섀도우 |
| **Platinum** | `--platinum: #dedede` | 금속 질감 배지 및 인셋 배경 |

### 2.2 액센트 및 시스템 색상 (Accent Palette)
| 토큰명 | Hex | 용도 |
| :--- | :--- | :--- |
| **Primary Red** | `#e60012` | 닌텐도 시그니처 레드 로고, 하트/치어 활성화, 인기 뱃지 |
| **Signal Orange** | `#f68d1f` | 액션 버튼, 서브밋 칩, 핵심 인터랙션 포인트 |
| **Amber Gold** | `#ecab37` | 카테고리 태그, 정보 박스 칩, 카운터 라벨 |
| **Systems Teal** | `#206479` | 시스템 상태, 에메랄드 테마 |
| **Games Red** | `#a7282b` | 로즈/레드 테마 |

---

## 3. 베벨 깊이 계층 구조 (Bevel & Depth Hierarchy)

```
[Level 2: Raised Chip / Button] (.nintendo-chip)
  ↑ (1.5px White Highlight Top-Left / Dark Indigo Bottom-Right)
[Level 1: Flush/Raised Metal Plate] (.nintendo-plate)
  ↑ (2px White Highlight Top-Left / Chrome Indigo Bottom-Right)
[Level 0: Inset / Recessed Surface] (.nintendo-inset)
  ↓ (2px Chrome Indigo Top-Left / White Highlight Bottom-Right)
```

1. **Level 0 (Inset/Recessed) — `.nintendo-inset`**:
   - 패널 내부에 깊게 파여 들어간 슬롯, 아바타 컨테이너, 다크 스피커 그릴 영역.
2. **Level 1 (Plate/Chassis) — `.nintendo-plate`**:
   - 메인 콘텐츠 카드, 프로필 헤더 베이스, 상단/하단 메탈 바.
3. **Level 2 (Chip/Raised) — `.nintendo-chip`**:
   - 클릭 가능한 물리 버튼, 카테고리 탭, 액션 트리거. 클릭(`:active`) 시 음각으로 눌리는 역베벨 효과.

---

## 4. shadcn/ui 컴포넌트 매핑 규격

| shadcn 컴포넌트 | 닌텐도 하드웨어 스타일 변형(Variants) | 주요 클래스 및 스타일 특징 |
| :--- | :--- | :--- |
| **Button** | `nintendoOrange` (기본 액션)<br>`nintendoRed` (시그니처)<br>`nintendoCarbon` (다크 칩)<br>`nintendoGold` (엠버 칩)<br>`nintendoPlate` (메탈 칩) | `.nintendo-chip`, 대문자 볼드, 눌림 피드백, 각진 모서리(`rounded-[2px]`) |
| **Card** | `default` (Level 1 Plate)<br>`inset` (Level 0 Inset Tray)<br>`carbon` (스피커 그릴 패턴) | `.nintendo-plate`, `.nintendo-inset`, `.bg-carbon-halftone` |
| **Badge** | `default` (Platinum Metal)<br>`nintendoRed` (POPULAR 배지)<br>`nintendoOrange` (FEATURED)<br>`nintendoGold` (INFO)<br>`nintendoOnline` (LED 점멸 상태) | 각진 배지, 두꺼운 폰트, 실크스크린 라벨 느낌 |
| **Tabs** | `nintendo` (카트리지/스위치 탭) | 선택 시 `.nintendo-chip` 활성화, 비활성 시 플랫 인셋 |
| **Dialog** | `nintendo` (하드웨어 팝업 섀시) | 카본 헤더 바 + 메탈릭 플레이트 본체 + 베벨 테두리 |
| **Avatar** | `nintendo` (하드웨어 스크린 프레임) | `.nintendo-inset` 프레임에 고정된 아바타 이미지 |
| **RadioGroup** | `nintendo` (하드웨어 라디오 스위치) | 오렌지 액센트 점, 고대비 선택기 |
| **Separator** | `nintendo` (베벨 그루브 라인) | 상단 다크 라인 + 하단 화이트 하이라이트 2단 홈 |

---

## 5. 컴포넌트 적용 가이드라인

- 모든 페이지와 기능 개발 시 **인라인 하드코딩 스타일을 지양**하고, `src/components/ui/`의 shadcn 컴포넌트(`Button`, `Card`, `Badge`, `Tabs`, `Dialog` 등)를 우선적으로 사용합니다.
- 새로운 테마 및 색상 변형이 필요할 경우, 본 문서의 디자인 토큰 및 `src/app/globals.css`의 CSS 변수를 확장하여 통일성을 유지합니다.
