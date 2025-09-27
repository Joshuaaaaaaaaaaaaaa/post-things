# 🗂️ AI 스마트 포스트잇 메모 애플리케이션

**Version:** 1.0.0  
**Last Updated:** 2025-09-23  
**Tech Stack:** Next.js 15 + React 19 + TypeScript + Supabase + AI/ML

## 📝 프로젝트 개요

AI 기반 자동 분류 기능을 갖춘 차세대 포스트잇 메모 애플리케이션입니다. 제스처 기반 직관적 인터랙션과 지능형 클러스터링을 통해 사고 정리와 아이디어 관리를 혁신합니다.

### 🎯 핵심 기능

- **🤖 AI 자동 분류**: 메모 내용을 실시간으로 분석하여 To-Do, 메모, 아이디어로 자동 분류
- **🎨 제스처 인터랙션**: 터치/드래그/스와이프 제스처로 직관적인 메모 관리
- **📊 어피니티 다이어그램**: 메모들을 4가지 방식으로 그룹화 (카테고리별, 주제별, 시간순, AI 클러스터별)
- **🔄 실시간 동기화**: Supabase 기반 멀티 디바이스 동기화
- **📱 반응형 디자인**: 모바일 우선 설계 + PC 지원

## 🛠️ 기술 스택

### Frontend
- **Next.js 15.5.0** - App Router, API Routes
- **React 19.1.0** - 최신 리액트 기능 활용
- **TypeScript** - 완전한 타입 안전성
- **Tailwind CSS** - 유틸리티 퍼스트 스타일링

### Backend & Database
- **Supabase** - PostgreSQL + 실시간 구독
- **Row Level Security** - 데이터 보안

### AI/ML Libraries
- **@xenova/transformers** - BERT 기반 텍스트 임베딩
- **hdbscanjs** - 밀도 기반 클러스터링 알고리즘
- **euclidean-distance** - 벡터 거리 계산

### UI/UX Libraries
- **Radix UI** - 접근성 컴포넌트 (dropdown-menu, toast)
- **Lucide React** - 아이콘 시스템
- **date-fns** - 날짜 포맷팅 (한국어 지원)

## 🚀 시작하기

### 1. 개발 서버 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 결과를 확인하세요.

### 2. Supabase 설정 (선택사항)

실시간 동기화를 원한다면 `SUPABASE_SETUP.md` 파일을 참고하여 Supabase를 설정하세요.

```env
# .env.local 파일 생성
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🎨 사용법

### 메모 작성 모드
- **터치/클릭**: 메모 작성
- **위쪽 스와이프/드래그**: 메모 저장
- **아래쪽 스와이프/드래그**: 어피니티 다이어그램 진입
- **좌우 스와이프/드래그**: 메모 삭제
- **핀치 아웃**: 어피니티 다이어그램 진입
- **더블클릭** (PC): 어피니티 다이어그램 진입

### 어피니티 다이어그램 모드
- **카테고리별**: AI 분류 결과로 그룹화
- **주제별**: 키워드 추출로 그룹화  
- **시간순**: 작성 날짜별 그룹화
- **AI 클러스터**: BERT + HDBSCAN 기반 지능형 그룹화

## 🏗️ 아키텍처

### 폴더 구조
```
├── app/                    # Next.js App Router
│   ├── api/categorize/     # AI 분류 API 엔드포인트
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지 (상태 관리)
├── components/             # React 컴포넌트
│   ├── AffinityDiagram.tsx # 어피니티 다이어그램 뷰
│   ├── StickyNoteInput.tsx # 포스트잇 입력 인터페이스
│   └── ui/                # Radix UI 기반 컴포넌트
├── hooks/                 # 커스텀 훅
│   ├── use-toast.ts       # 토스트 알림 훅
│   └── useGestures.ts     # 제스처 인터랙션 훅
├── lib/                   # 핵심 비즈니스 로직
│   ├── ai-categorizer.ts  # AI 기반 메모 분류 시스템
│   ├── clustering.ts      # BERT + HDBSCAN 클러스터링
│   ├── supabase-api.ts    # 데이터베이스 CRUD 작업
│   ├── types.ts           # TypeScript 타입 정의
│   └── utils.ts           # 공통 유틸리티 함수
```

### 데이터 플로우
1. **메모 입력** → AI 분류 → 색상 미리보기
2. **저장** → Supabase/LocalStorage → 실시간 동기화
3. **어피니티 다이어그램** → 4가지 그룹화 방식 → 시각적 표현

## 🤖 AI 기능 상세

### 1. 스마트 분류 시스템
- **키워드 기반 점수 계산**: 행동 동사, 시간 표현, 장소 등 분석
- **패턴 매칭**: 정규식 기반 문장 구조 분석
- **실시간 미리보기**: 입력 중 카테고리별 색상 변화

### 2. 텍스트 클러스터링
- **BERT 임베딩**: `distilbert-base-multilingual-cased` 모델 사용
- **HDBSCAN 클러스터링**: 밀도 기반 자동 그룹 발견
- **자동 라벨 생성**: 클러스터별 공통 키워드 추출

## 📱 제스처 인터랙션

### 메모 작성 화면
| 제스처 | 동작 | 설명 |
|--------|------|------|
| ↑ 스와이프/드래그 | 저장 | 메모를 저장하고 새 메모 작성 모드로 |
| ↓ 스와이프/드래그 | 다이어그램 진입 | 어피니티 다이어그램 모드로 전환 |
| ← 스와이프/드래그 | 삭제 | 현재 메모 삭제 |
| → 스와이프/드래그 | 완료/삭제 | 기존 노트: 완료 처리, 새 노트: 삭제 |
| 핀치 아웃 | 다이어그램 진입 | 어피니티 다이어그램 모드로 전환 |
| 더블클릭 (PC) | 다이어그램 진입 | 데스크톱 환경 지원 |

## 💾 데이터 관리

### 하이브리드 저장 방식
- **온라인**: Supabase PostgreSQL (실시간 동기화)
- **오프라인**: LocalStorage 백업
- **자동 마이그레이션**: LocalStorage → Supabase 자동 이전

### 데이터 구조
```typescript
interface StickyNote {
  id: string;                                    // UUID
  content: string;                               // 메모 내용 (최대 100자)
  category: 'To-Do' | '메모' | '아이디어';        // AI 분류 결과
  color: 'yellow' | 'pink' | 'blue' | 'green';   // 카테고리별 색상
  createdAt: Date;                               // 생성 시간
  updatedAt: Date;                               // 수정 시간
  isCompleted?: boolean;                         // 완료 상태 (To-Do용)
}
```

## 🎨 UI/UX 디자인 원칙

### 1. 모바일 퍼스트
- 터치 제스처 최적화
- 반응형 레이아웃
- 접근성 고려

### 2. 직관적 인터랙션
- 물리적 포스트잇과 유사한 경험
- 제스처 기반 네비게이션
- 실시간 피드백

### 3. 시각적 일관성
- 카테고리별 일관된 색상 시스템
- 부드러운 애니메이션 및 전환
- 명확한 상태 표시

## 🔧 개발 가이드

### 주요 컴포넌트

1. **`app/page.tsx`** - 메인 상태 관리 및 데이터 플로우
2. **`components/StickyNoteInput.tsx`** - 포스트잇 입력 인터페이스
3. **`components/AffinityDiagram.tsx`** - 어피니티 다이어그램 뷰
4. **`lib/ai-categorizer.ts`** - AI 분류 로직
5. **`lib/clustering.ts`** - 텍스트 클러스터링 시스템

### 커스텀 훅

- **`useGestures`** - 터치 제스처 처리 (스와이프, 드래그, 핀치)
- **`use-toast`** - 사용자 피드백 알림

## 🚀 배포 및 인프라

### 🔗 연결 구조
```
GitHub Repository → Vercel → Production URL
                      ↓
                  Supabase Backend
                      ↓
                PostgreSQL Database + Realtime
```

### 📦 배포 파이프라인

#### 1. **GitHub 연결**
- **버전 관리**: Git을 통한 소스 코드 관리
- **자동 트리거**: main 브랜치 푸시 시 자동 배포 실행
- **PR 미리보기**: Pull Request 생성 시 미리보기 URL 자동 생성

#### 2. **Vercel 자동 배포**
```bash
# 수동 배포 (필요시)
npm i -g vercel
vercel

# 프로덕션 배포
vercel --prod
```

#### 3. **Supabase 백엔드**
- **PostgreSQL**: 메모 데이터 영구 저장
- **Realtime**: 멀티 디바이스 실시간 동기화
- **Row Level Security**: 데이터 접근 보안

### ⚙️ 환경 변수 설정

**Vercel 대시보드**에서 다음 환경 변수를 설정:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🔄 배포 플로우

1. **로컬 개발** → `npm run dev`로 개발 서버 실행
2. **코드 커밋** → GitHub 리포지토리에 푸시
3. **자동 빌드** → Vercel이 변경사항 감지 후 자동 빌드
4. **배포 완료** → 프로덕션 URL에서 앱 사용 가능
5. **실시간 동기화** → Supabase를 통한 데이터 동기화

### 📊 배포 상태 모니터링

#### Vercel 대시보드에서 확인 가능:
- **빌드 로그**: 배포 성공/실패 상태
- **성능 메트릭**: 로딩 시간, Core Web Vitals
- **사용량 통계**: 트래픽, 함수 호출 수

#### Supabase 대시보드에서 확인 가능:
- **데이터베이스 상태**: 연결 수, 쿼리 성능
- **실시간 연결**: 활성 구독자 수
- **API 사용량**: 요청 수, 대역폭 사용량

## 📊 성능 최적화

- **동적 폰트 크기**: 내용 길이에 따른 자동 조절
- **지연 로딩**: AI 모델 온디맨드 로딩
- **메모리 효율성**: 임베딩 캐시 및 배치 처리
- **실시간 동기화**: Supabase Realtime 최적화

## 🔮 향후 개선 계획

- [ ] 다크 모드 지원
- [ ] 메모 검색 기능
- [ ] 태그 시스템
- [ ] 협업 기능
- [ ] 음성 메모 지원
- [ ] 이미지 첨부 기능

## 🧪 기술적 혁신

### AI 분류 시스템
- **실시간 분류**: 타이핑 중 실시간 카테고리 예측
- **한국어 최적화**: 한국어 문맥과 패턴에 특화된 분류 로직
- **점수 기반 알고리즘**: 복합적 요소 고려한 정확한 분류

### 제스처 인터랙션
- **실시간 드래그**: 부드러운 실시간 위치 추적
- **방향 인식**: 수평/수직 드래그 구분
- **장력 효과**: 물리적 저항감 시뮬레이션
- **멀티터치**: 핀치 제스처 지원

### 텍스트 클러스터링
- **BERT 임베딩**: 다국어 지원 transformer 모델
- **HDBSCAN**: 밀도 기반 클러스터 자동 발견
- **자동 라벨링**: 클러스터별 공통 키워드 추출

## 📞 문의 및 지원

개발 관련 문의사항이나 개선 제안이 있으시면 언제든지 연락주세요.

---

**Made with ❤️ for better productivity and creative thinking**
