// 행동 데이터 이벤트 타입
export type BehaviorEventType =
  | "hover"
  | "selection_change"
  | "idle_period"
  | "question_time"
  | "click";

// 호버 이벤트 데이터
export interface HoverEvent {
  optionId: string;
  duration: number;
}

// 선택 변경 이벤트 데이터
export interface SelectionChangeEvent {
  from: string;
  to: string;
  changedAt: number;
}

// 정지 시간 이벤트 데이터
export interface IdlePeriodEvent {
  startAt: number;
  duration: number;
}

// 문항 체류 시간 이벤트 데이터
export interface QuestionTimeEvent {
  startAt: number;
  endAt: number;
  duration: number;
}

// 클릭 이벤트 데이터
export interface ClickEvent {
  selectedOptionId: string;
  clickedAt: number;
}

// 이벤트별 페이로드 데이터
export interface BehaviorLogPayload {
  hover?: HoverEvent;
  selection_change?: SelectionChangeEvent;
  idle_period?: IdlePeriodEvent;
  question_time?: QuestionTimeEvent;
  click?: ClickEvent;
}

// 백엔드 DB 스키마에 맞춘 로그 데이터 구조
export interface EventLog {
  eventLogId?: number; // PK, 백엔드에서 자동 생성
  questionId: number; // FK, 문항ID (BIGINT) - OpenAPI 명세에 맞춤
  eventType: string; // 이벤트 유형 (VARCHAR(255))
  timestamp_ms: string; // 이벤트 발생 시각 (DATETIME(6) 형식)
  payLoad: string; // 이벤트별 상세 데이터 (JSON 문자열)
}

// 기존 호환성을 위한 타입 (점진적 마이그레이션용)
export interface BehaviorLog {
  questionId: string;
  eventType: BehaviorEventType;
  timestamp: number;
  payload: BehaviorLogPayload;
}
