import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiService } from "../services/api";
import { commonStyles } from "../styles/common";
import { useBehaviorTracking } from "../hooks/useBehaviorTracking";
import { behaviorLogger } from "../services/behaviorLogger";
import type { FrontendSurvey } from "../types/survey";

export default function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<FrontendSurvey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    const loadSurvey = async () => {
      if (id) {
        try {
          const backendSurvey = await apiService.getSurveyById(id);
          if (backendSurvey) {
            // 백엔드 응답을 프론트엔드 형식으로 변환
            const frontendSurvey: FrontendSurvey = {
              id: backendSurvey.surveyId.toString(),
              title: backendSurvey.title,
              description: backendSurvey.subTitle,
              questions:
                backendSurvey.questions?.map((q: any) => ({
                  questionId: q.questionId,
                  question: q.content || q.text,
                  options: q.choices?.map((c: any) => c.text) || [],
                })) || [],
              responses: backendSurvey.responses || 0,
            };

            setSurvey(frontendSurvey);
            setAnswers(new Array(frontendSurvey.questions.length).fill(-1));
            // 설문 ID를 behaviorLogger에 설정
            behaviorLogger.setSurveyId(frontendSurvey.title);
          }
        } catch (error) {
          console.error("설문 로드 실패:", error);
        }
      }
    };

    loadSurvey();
  }, [id]);

  // 현재 질문 정보
  const currentQuestion = survey?.questions[currentQuestionIndex];

  // 실제 DB questionId 추출
  const currentBackendQuestionId =
    survey?.questions[currentQuestionIndex]?.questionId?.toString() || "";
  console.log(
    "[SurveyPage] currentBackendQuestionId:",
    currentBackendQuestionId
  );
  console.log("[SurveyPage] currentQuestion:", currentQuestion);

  // 행동 데이터 추적
  const behaviorTracking = useBehaviorTracking({
    questionId: currentBackendQuestionId,
    options: currentQuestion?.options || [],
  });
  console.log(
    "[SurveyPage] useBehaviorTracking 호출됨, questionId:",
    currentBackendQuestionId
  );

  const handleAnswerSelect = useCallback(
    (optionIndex: number) => {
      setAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex] = optionIndex;
        return newAnswers;
      });

      // 행동 데이터 추적
      if (currentQuestion) {
        behaviorTracking.handleSelect(`option_${optionIndex}`);
      }
    },
    [currentQuestionIndex, currentQuestion, behaviorTracking]
  );

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const handleNext = useCallback(async () => {
    if (answers[currentQuestionIndex] === -1) {
      alert("답변을 선택해주세요.");
      return;
    }

    if (currentQuestionIndex === survey!.questions.length - 1) {
      // 설문 완료
      try {
        const questions = await apiService.getQuestionsBySurvey(survey!.id);

        for (let i = 0; i < answers.length; i++) {
          const question = questions[i];
          const selectedAnswerIndex = answers[i];
          const selectedChoice = question.choices[selectedAnswerIndex];

          if (selectedChoice) {
            await apiService.incrementChoiceCount(selectedChoice.choiceId);
          }
        }

        navigate(`/survey/${survey!.id}/complete`);
      } catch (error) {
        console.error("설문 응답 제출 실패:", error);
        alert("설문 응답 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [answers, currentQuestionIndex, survey, navigate]);

  if (!survey) {
    return (
      <div
        style={{
          ...commonStyles.container,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>설문을 찾을 수 없습니다.</h2>
          <Link to="/" style={commonStyles.link}>
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  return (
    <div style={commonStyles.container}>
      <div style={{ marginBottom: "2rem" }}>
        <Link to="/" style={commonStyles.link}>
          메인으로 돌아가기
        </Link>
      </div>

      {/* 설문 제목 */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={commonStyles.title}>{survey.title}</h2>

        {/* 진행률 */}
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              ...commonStyles.text.small,
            }}
          >
            <span>
              질문 {currentQuestionIndex + 1}/{survey.questions.length}
            </span>
            <span>{Math.round(progress)}% 완료</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "#f0f0f0",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#000000",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* 질문 카드 */}
      <div style={{ ...commonStyles.card, marginBottom: "2rem" }}>
        <h3 style={commonStyles.subtitle}>{currentQuestion?.question}</h3>

        {/* 선택지 */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {currentQuestion?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              style={{
                padding: "1rem",
                border:
                  answers[currentQuestionIndex] === index
                    ? "2px solid #007bff"
                    : "1px solid #ddd",
                borderRadius: "6px",
                background:
                  answers[currentQuestionIndex] === index ? "#f8f9ff" : "#fff",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "1rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                behaviorTracking.handleMouseEnter(`option_${index}`);

                if (answers[currentQuestionIndex] !== index) {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                  e.currentTarget.style.borderColor = "#007bff";
                }
              }}
              onMouseLeave={(e) => {
                behaviorTracking.handleMouseLeave(`option_${index}`);

                if (answers[currentQuestionIndex] !== index) {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.borderColor = "#ddd";
                }
              }}
            >
              {index + 1}. {option}
            </button>
          ))}
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={{
            ...commonStyles.button.secondary,
            opacity: currentQuestionIndex === 0 ? 0.5 : 1,
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (currentQuestionIndex > 0) {
              e.currentTarget.style.backgroundColor = "#e0e0e0";
            }
          }}
          onMouseLeave={(e) => {
            if (currentQuestionIndex > 0) {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
            }
          }}
        >
          이전
        </button>
        <button
          onClick={handleNext}
          style={commonStyles.button.primary}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#000";
          }}
        >
          {isLastQuestion ? "제출하기" : "다음"}
        </button>
      </div>
    </div>
  );
}
