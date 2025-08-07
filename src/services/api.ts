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

export interface ChoiceCountRequest {
  choiceId: number;
}

export interface ChoiceCountResponse {
  choiceId: number;
  choiceText: string;
  count: number;
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

      // 응답 본문이 있는지 확인
      const contentType = response.headers.get("content-type");
      const text = await response.text();

      if (
        contentType &&
        contentType.includes("application/json") &&
        text.trim()
      ) {
        return JSON.parse(text);
      } else {
        // JSON이 아닌 응답이나 빈 응답의 경우
        return {} as T;
      }
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

  // 선택지 카운트 증가 API (설문 제출)
  async incrementChoiceCount(choiceId: number): Promise<void> {
    await this.request("/api/choice-counts/increment", {
      method: "POST",
      body: JSON.stringify({ choiceId }),
    });
  }

  // 설문별 선택지 통계 조회 API
  async getChoiceCountsBySurvey(
    surveyId: string
  ): Promise<ChoiceCountResponse[]> {
    return this.request(`/api/choice-counts/survey/${surveyId}`, {
      method: "GET",
    });
  }

  // 설문 응답 제출 API (기존 - 호환성을 위해 유지)
  async submitSurveyResponse(
    surveyId: string,
    answers: number[]
  ): Promise<any> {
    return this.request(`/api/surveys/${surveyId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  }

  // 설문 응답 조회 API (기존 - 호환성을 위해 유지)
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
