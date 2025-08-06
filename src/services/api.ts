import { API_BASE_URL } from "./baseUrl";

export interface CreateSurveyRequest {
  title: string;
  subTitle: string;
  questions: Array<{
    text: string;
    sequence: number;
    options: Array<{
      text: string;
      sequence: number;
    }>;
  }>;
}

export interface EventLogRequest {
  questionId: number;
  eventType: string;
  timestamp_ms: string;
  payLoad: Record<string, any>;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        throw new Error(
          `API 요청 실패: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API 요청 오류:", error);
      throw error;
    }
  }

  // 설문 생성 API
  async createSurvey(surveyData: CreateSurveyRequest): Promise<any> {
    return this.request("/api/surveys", {
      method: "POST",
      body: JSON.stringify(surveyData),
    });
  }

  // 이벤트 로그 전송 API
  async sendEventLog(eventLog: EventLogRequest): Promise<any> {
    return this.request("/api/event-logs", {
      method: "POST",
      body: JSON.stringify(eventLog),
    });
  }

  // 설문 목록 조회 API
  async getSurveys(): Promise<any> {
    return this.request("/api/surveys", {
      method: "GET",
    });
  }

  // 특정 설문 조회 API
  async getSurveyById(id: string): Promise<any> {
    return this.request(`/api/surveys/${id}`, {
      method: "GET",
    });
  }

  // 설문 응답 제출 API
  async submitSurveyResponse(
    surveyId: string,
    answers: number[]
  ): Promise<any> {
    return this.request(`/api/surveys/${surveyId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  }

  // 설문 응답 조회 API
  async getSurveyResponses(surveyId: string): Promise<any> {
    return this.request(`/api/surveys/${surveyId}/responses`, {
      method: "GET",
    });
  }

  // 설문의 질문 목록 조회 API
  async getQuestionsBySurvey(surveyId: string): Promise<any> {
    return this.request(`/api/questions/survey/${surveyId}`, {
      method: "GET",
    });
  }

  // 질문의 선택지 목록 조회 API
  async getChoicesByQuestion(questionId: string): Promise<any> {
    return this.request(`/api/choices/question/${questionId}`, {
      method: "GET",
    });
  }

  // 특정 질문의 이벤트 로그 조회 API
  async getEventLogsByQuestion(questionId: string): Promise<any> {
    return this.request(`/api/event-logs/question/${questionId}`, {
      method: "GET",
    });
  }
}

export const apiService = new ApiService();
