import type { BehaviorLogPayload, EventLog } from "../types/behavior";

import { API_BASE_URL } from "./baseUrl";

class BehaviorLogger {
  private isEnabled: boolean = true;
  private queue: EventLog[] = [];
  private isProcessing: boolean = false;
  private isDevelopment: boolean = import.meta.env.DEV;
  private enableServerLogging: boolean = true; // 서버 로깅 활성화
  private surveyId: string = "unknown"; // 현재 설문 ID

  constructor() {
    // 페이지 언로드 시 남은 로그 전송
    window.addEventListener("beforeunload", () => {
      this.flushQueue();
    });
  }

  // 로깅 활성화/비활성화
  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  // 서버 로깅 활성화/비활성화
  enableServerLoggingMode() {
    this.enableServerLogging = true;
  }

  disableServerLoggingMode() {
    this.enableServerLogging = false;
  }

  // 현재 설문 ID 설정
  setSurveyId(surveyId: string) {
    this.surveyId = surveyId;
  }

  // timestamp를 DATETIME(6) 형식으로 변환
  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 23); // YYYY-MM-DDTHH:mm:ss.SSS 형식
  }

  // 이벤트 타입을 한글로 변환
  private getEventTypeKorean(eventType: string): string {
    const eventTypeMap: { [key: string]: string } = {
      hover: "호버",
      selection_change: "선택 변경",
      idle_period: "정지 시간",
      question_time: "문항 체류 시간",
      click: "클릭",
    };
    return eventTypeMap[eventType] || eventType;
  }

  // 시간을 읽기 쉽게 변환
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    const seconds = Math.floor(ms / 1000);
    const remainingMs = ms % 1000;
    if (remainingMs === 0) {
      return `${seconds}초`;
    }
    return `${seconds}초 ${remainingMs}ms`;
  }

  // BehaviorLog를 EventLog로 변환
  private convertToEventLog(
    questionId: string,
    eventType: string,
    payload: BehaviorLogPayload
  ): EventLog {
    return {
      questionId: Number(questionId), // 실제 DB questionId
      eventType: eventType,
      timestamp_ms: this.formatTimestamp(Date.now()),
      payLoad: payload, // 객체 그대로 전송
    };
  }

  // 로그 전송 함수
  private async sendLog(log: EventLog): Promise<void> {
    if (!this.isEnabled) return;

    // 개발 환경에서는 콘솔에 로그 출력
    if (this.isDevelopment) {
      const eventTypeKorean = this.getEventTypeKorean(log.eventType);
      const timestamp = new Date(log.timestamp_ms).toLocaleTimeString();

      // 백엔드 연결 상태 표시
      const serverStatus = this.enableServerLogging ? "🟢" : "🔴";

      let logMessage = `[${this.surveyId}] ${eventTypeKorean} 이벤트 (${timestamp}) ${serverStatus}`;

      // 페이로드 정보 추가
      try {
        const payload = log.payLoad; // 이미 객체이므로 그대로 사용
        if (payload.hover) {
          logMessage += `\n   질문 ${log.questionId + 1} - 선택지 ${
            payload.hover.optionId
          }`;
          logMessage += `\n   호버 시간: ${this.formatDuration(
            payload.hover.duration
          )}`;
        } else if (payload.selection_change) {
          logMessage += `\n   질문 ${log.questionId + 1}`;
          logMessage += `\n   선택지 ${payload.selection_change.from} → 선택지 ${payload.selection_change.to}`;
        } else if (payload.idle_period) {
          logMessage += `\n   질문 ${log.questionId + 1}`;
          logMessage += `\n   정지 시간: ${this.formatDuration(
            payload.idle_period.duration
          )}`;
        } else if (payload.question_time) {
          logMessage += `\n   질문 ${log.questionId + 1}`;
          logMessage += `\n   문항 체류 시간: ${this.formatDuration(
            payload.question_time.duration
          )}`;
        } else if (payload.click) {
          logMessage += `\n   질문 ${log.questionId + 1}`;
          logMessage += `\n   클릭 시간: ${this.formatDuration(
            payload.click.duration
          )}`;
        }
      } catch (e) {
        console.error("Failed to parse payload:", e);
        logMessage += `\n   페이로드 파싱 실패`;
      }

      console.log(logMessage);

      if (this.enableServerLogging) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/event-logs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(log),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (e) {
          console.error("Failed to send log to server:", e);
        }
      }
    }
  }

  // 큐에 로그 추가
  addLog(questionId: string, eventType: string, payload: BehaviorLogPayload) {
    if (!this.isEnabled) return;

    const eventLog = this.convertToEventLog(questionId, eventType, payload);
    this.queue.push(eventLog);
    this.processQueue();
  }

  // 큐 처리 로직
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const log = this.queue.shift();
      if (log) {
        await this.sendLog(log);
      }
    }
    this.isProcessing = false;
  }

  // 큐 비우기 (페이지 언로드 시 호출)
  flushQueue() {
    this.queue = [];
  }
}

export const behaviorLogger = new BehaviorLogger();
