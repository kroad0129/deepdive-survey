// DB 스키마에 맞는 타입 정의

export interface Survey {
  surveyId: number;
  title: string;
  subTitle: string;
  questions?: Question[];
  responses?: number;
}

export interface Question {
  questionId: number;
  sequence: number;
  survey: number; // FK to Survey
  text: string;
  choices?: Choice[];
}

export interface Choice {
  choiceId: number;
  question: number; // FK to Question
  text: string;
  sequence: number;
}

export interface SurveyResponse {
  responseId?: number;
  surveyId: number;
  answers: number[];
  submittedAt?: string;
}

// 프론트엔드 호환성을 위한 기존 타입들
export interface FrontendSurvey {
  id: string;
  title: string;
  description: string;
  questions: FrontendQuestion[];
  responses?: number;
}

export interface FrontendQuestion {
  questionId: number;
  question: string;
  options: string[];
}

export interface FrontendSurveyResponse {
  id?: string;
  surveyId: string;
  answers: number[];
  submittedAt?: string;
}
