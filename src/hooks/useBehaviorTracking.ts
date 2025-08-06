import { useEffect, useRef, useState, useCallback } from "react";
import { behaviorLogger } from "../services/behaviorLogger";

interface UseBehaviorTrackingProps {
  questionId: string;
  options: string[];
}

export function useBehaviorTracking({ questionId }: UseBehaviorTrackingProps) {
  // 호버 시작 시간 기록
  const hoverStartTimes = useRef(new Map<string, number>());

  // 선택 변경 추적
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  // 문항 시작 시간 (useRef로 변경하여 무한 루프 방지)
  const questionStartTimeRef = useRef<number | null>(null);

  // 최소 호버 시간 (밀리초) - 이 시간보다 짧은 호버는 무시
  const MIN_HOVER_DURATION = 500; // 0.5초

  // 사용자 친화적인 ID 변환 함수
  const getUserFriendlyId = (technicalId: string) => {
    if (technicalId.startsWith("question_")) {
      const questionNum = parseInt(technicalId.replace("question_", "")) + 1;
      return `질문 ${questionNum}`;
    }
    if (technicalId.startsWith("option_")) {
      const optionNum = parseInt(technicalId.replace("option_", "")) + 1;
      return `${optionNum}`; // "선택지" 텍스트 제거
    }
    return technicalId;
  };

  // questionId 유효성 검사
  const isValidQuestionId = (id: string) => {
    return id && id.trim() !== "" && !isNaN(Number(id));
  };

  // 호버 시작 처리
  const handleMouseEnter = useCallback(
    (optionId: string) => {
      if (!isValidQuestionId(questionId)) return;
      hoverStartTimes.current.set(optionId, Date.now());
    },
    [questionId]
  );

  // 호버 종료 처리
  const handleMouseLeave = useCallback(
    (optionId: string) => {
      if (!isValidQuestionId(questionId)) return;

      const start = hoverStartTimes.current.get(optionId);
      if (start) {
        const duration = Date.now() - start;

        // 최소 호버 시간보다 긴 경우에만 로그 기록
        if (duration >= MIN_HOVER_DURATION) {
          const userFriendlyOptionId = getUserFriendlyId(optionId);

          behaviorLogger.addLog(questionId, "hover", {
            hover: {
              optionId: userFriendlyOptionId,
              duration,
            },
          });
        }

        hoverStartTimes.current.delete(optionId);
      }
    },
    [questionId]
  );

  // 선택 처리
  const handleSelect = useCallback(
    (optionId: string) => {
      if (!isValidQuestionId(questionId)) return;

      const now = Date.now();
      const userFriendlyOptionId = getUserFriendlyId(optionId);

      // 선택 변경 로그
      if (lastSelected && lastSelected !== optionId) {
        const userFriendlyLastSelected = getUserFriendlyId(lastSelected);
        behaviorLogger.addLog(questionId, "selection_change", {
          selection_change: {
            from: userFriendlyLastSelected,
            to: userFriendlyOptionId,
            changedAt: now,
          },
        });
      }

      // 클릭 로그
      behaviorLogger.addLog(questionId, "click", {
        click: {
          selectedOptionId: userFriendlyOptionId,
          clickedAt: now,
        },
      });

      setLastSelected(optionId);
    },
    [questionId, lastSelected]
  );

  // 정지 시간 감지
  useEffect(() => {
    if (!isValidQuestionId(questionId)) return;

    let lastMove = Date.now();
    let idleTimer: number | null = null;

    const handleMove = () => {
      const now = Date.now();
      if (now - lastMove > 2500) {
        // 2.5초 이상 정지 후 움직임 감지
        behaviorLogger.addLog(questionId, "idle_period", {
          idle_period: {
            startAt: lastMove,
            duration: now - lastMove,
          },
        });
      }
      lastMove = now;
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  }, [questionId]);

  // 문항 체류 시간 추적
  useEffect(() => {
    if (!isValidQuestionId(questionId)) return;

    // 문항이 바뀌었을 때 시작 시간 설정
    questionStartTimeRef.current = Date.now();

    return () => {
      // 문항이 바뀌기 전에 이전 문항의 체류 시간 로그
      if (questionStartTimeRef.current) {
        const endTime = Date.now();
        const duration = endTime - questionStartTimeRef.current;

        behaviorLogger.addLog(questionId, "question_time", {
          question_time: {
            startAt: questionStartTimeRef.current,
            endAt: endTime,
            duration,
          },
        });
      }
    };
  }, [questionId]); // questionStartTime 제거

  // 페이지 언로드 시 남은 로그 전송
  useEffect(() => {
    const handleBeforeUnload = () => {
      behaviorLogger.flushQueue();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return {
    handleMouseEnter,
    handleMouseLeave,
    handleSelect,
  };
}
