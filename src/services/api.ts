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

// 새로운 통계 관련 인터페이스들
export interface ClickPerParticipantDto {
  questionId: number;
  clickCount: number;
  participantCount: number;
  clickPerParticipant: number;
}

export interface ClickPerOptionDto {
  optionId: string;
  clickCount: number;
  participantCount: number;
  clickPerParticipant: number;
}

export interface ClickStatsResponse {
  questionId: number;
  optionStats: ClickPerOptionDto[];
}

export interface SelectionChangeResponse {
  questionId: number;
  avgChangeCount: number;
}

export interface AverageDurationQuestionResponse {
  questionId: number;
  averageDurationMs: number;
}

export interface DurationQuestionResponse {
  questionId: number;
  value: number;
}

export interface IdlePeriodStatsDto {
  questionId: number;
  count: number;
  minDuration: number;
  maxDuration: number;
  avgDuration: number;
  trimmedAverageDuration: number;
}

export interface OptionHoverStats {
  optionId: string;
  min: number;
  max: number;
  average: number;
  trimmedAverage: number;
}

export interface HoverStatsDto {
  questionId: number;
  optionStats: OptionHoverStats[];
}

export interface SankeyLinkDto {
  from: string;
  to: string;
  size: number;
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

  // 참여자당 클릭 수 조회 API
  async getClickPerParticipant(
    questionId: string
  ): Promise<ClickPerParticipantDto> {
    return this.request(`/api/statistic/click-per-participant/${questionId}`, {
      method: "GET",
    });
  }

  // 선택지별 클릭 통계 조회 API
  async getClickPerOptionStats(
    questionId: string
  ): Promise<ClickStatsResponse> {
    return this.request(`/api/statistic/click-per-option/${questionId}`, {
      method: "GET",
    });
  }

  // 선택지 변경 횟수 조회 API
  async getSelectionChange(
    questionId: string
  ): Promise<SelectionChangeResponse> {
    return this.request(`/api/statistic/selection-change/${questionId}`, {
      method: "GET",
    });
  }

  // 질문당 평균 소요시간 조회 API
  async getAverageTimeForQuestion(
    questionId: string
  ): Promise<AverageDurationQuestionResponse> {
    return this.request(`/api/statistic/question/${questionId}`, {
      method: "GET",
    });
  }

  // 질문당 최소 소요시간 조회 API
  async getMinTimeForQuestion(
    questionId: string
  ): Promise<DurationQuestionResponse> {
    return this.request(`/api/statistic/question/min/${questionId}`, {
      method: "GET",
    });
  }

  // 질문당 최대 소요시간 조회 API
  async getMaxTimeForQuestion(
    questionId: string
  ): Promise<DurationQuestionResponse> {
    return this.request(`/api/statistic/question/max/${questionId}`, {
      method: "GET",
    });
  }

  // 정지 시간 통계 조회 API
  async getIdleStats(questionId: string): Promise<IdlePeriodStatsDto> {
    return this.request(`/api/statistic/idle-period/${questionId}`, {
      method: "GET",
    });
  }

  // 호버 통계 조회 API
  async getHoverStats(questionId: string): Promise<HoverStatsDto> {
    return this.request(`/api/statistic/hover-stats/${questionId}`, {
      method: "GET",
    });
  }

  // Sankey 차트 데이터 조회 API
  async getSankeyData(questionId: string): Promise<SankeyLinkDto[]> {
    return this.request(`/api/sankey/question/${questionId}`, {
      method: "GET",
    });
  }
}

export const apiService = new ApiService();
