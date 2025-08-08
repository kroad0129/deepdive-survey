# 설문조사 애플리케이션

https://github.com/kroad0129/deepdive-survey-be

React + TypeScript + Vite로 구축된 설문조사 웹 애플리케이션입니다.

## 기능

- 설문 생성 및 관리
- 설문 참여
- 설문 결과 통계
- 행동 데이터 추적 (호버, 선택 변경, 정지 시간, 체류 시간, 클릭)
- 로컬 스토리지를 활용한 데이터 저장

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트 검사
npm run lint
```

## 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/         # 페이지 컴포넌트
├── store/         # 상태 관리
├── styles/        # 공통 스타일
├── types/         # TypeScript 타입 정의
├── services/      # API 서비스 및 로깅
├── hooks/         # 커스텀 훅
└── assets/        # 정적 자산
```
