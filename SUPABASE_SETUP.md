# 🚀 Supabase 설정 가이드

포스트잇 메모 앱에 **실시간 동기화 기능**을 추가하기 위한 Supabase 설정 방법입니다.

## 📋 1단계: Supabase 계정 생성

1. **[supabase.com](https://supabase.com)** 접속
2. **"Start your project"** 클릭
3. **GitHub 계정**으로 로그인 (또는 이메일 가입)

## 🏗️ 2단계: 새 프로젝트 생성

1. **"New project"** 클릭
2. **조직 선택** (개인 계정)
3. **프로젝트 정보 입력:**
   - **Name**: `postit-memo-app`
   - **Database Password**: 강력한 비밀번호 생성
   - **Region**: `Northeast Asia (Seoul)` 선택
4. **"Create new project"** 클릭
5. **2-3분 대기** (프로젝트 생성 중)

## 📊 3단계: 데이터베이스 테이블 생성

### SQL Editor에서 테이블 생성:

1. **좌측 메뉴 → "SQL Editor"** 클릭
2. **"New query"** 클릭
3. **아래 SQL 코드 복사 붙여넣기:**

```sql
-- sticky_notes 테이블 생성
CREATE TABLE sticky_notes (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('To-Do', '메모', '아이디어')),
    color TEXT NOT NULL CHECK (color IN ('yellow', 'pink', 'blue', 'green')),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_sticky_notes_created_at ON sticky_notes(created_at DESC);
CREATE INDEX idx_sticky_notes_category ON sticky_notes(category);
CREATE INDEX idx_sticky_notes_user_id ON sticky_notes(user_id);

-- Row Level Security (RLS) 활성화
ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능한 정책 (임시)
CREATE POLICY "Allow all operations" ON sticky_notes
    FOR ALL USING (true);
```

4. **"Run"** 버튼 클릭
5. **"Success"** 메시지 확인

## 🔑 4단계: API 키 확인

1. **좌측 메뉴 → "Settings" → "API"** 클릭
2. **필요한 정보 복사:**
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## ⚙️ 5단계: 환경 변수 설정

1. **프로젝트 루트**에 `.env.local` 파일 생성
2. **다음 내용 입력:**

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **주의**: 실제 값으로 교체하세요!

## ✅ 6단계: 설정 확인

1. **개발 서버 재시작:**
   ```bash
   npm run dev
   ```

2. **브라우저 개발자 도구** → **Console** 확인
3. **"Supabase 연결 성공"** 메시지 확인

## 🎉 완료!

이제 **PC와 모바일**에서 **실시간으로 동기화**됩니다!

### 📱 테스트 방법:
1. **PC**에서 메모 작성
2. **모바일**에서 새로고침
3. **동일한 메모 확인** ✅

---

## 🆘 문제 해결

**연결 안될 때:**
1. `.env.local` 파일 위치 확인
2. API 키 정확성 확인
3. 개발 서버 재시작

**도움이 필요하면 언제든 말씀하세요!** 🙋‍♂️
