// src/types/survey-fixed.ts

export interface Question {
  question: string;
  options: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  responses: number;
}

export interface SurveyResponse {
  surveyId: string;
  answers: number[];
}
