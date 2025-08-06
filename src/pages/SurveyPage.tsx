import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { surveyStore } from "../store/surveyStore";
import type { Survey } from "../types/survey";

export default function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      const foundSurvey = surveyStore.getSurveyById(id);
      if (foundSurvey) {
        setSurvey(foundSurvey);
        setAnswers(new Array(foundSurvey.questions.length).fill(-1));
      }
    }
  }, [id]);

  if (!survey) {
    return (
      <div
        style={{
          background: "#E9E9E9",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>설문을 찾을 수 없습니다.</h2>
          <Link to="/" style={{ color: "#333", textDecoration: "none" }}>
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (answers[currentQuestionIndex] === -1) {
      alert("답변을 선택해주세요.");
      return;
    }

    if (isLastQuestion) {
      // 설문 완료
      surveyStore.submitResponse(survey.id, answers);
      navigate(`/survey/${survey.id}/complete`);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div
      style={{
        background: "#E9E9E9",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <Link
          to="/"
          style={{
            color: "#000000",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          메인으로 돌아가기
        </Link>
      </div>

      {/* 설문 제목 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            margin: "0 0 1rem 0",
            color: "#000000",
          }}
        >
          {survey.title}
        </h2>

        {/* 진행률 */}
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              color: "#565656",
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
                background: "#007bff",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* 질문 카드 */}
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: "bold",
            margin: "0 0 1.5rem 0",
            color: "#000000",
          }}
        >
          {currentQuestion.question}
        </h3>

        {/* 선택지 */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {currentQuestion.options.map((option, index) => (
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
                if (answers[currentQuestionIndex] !== index) {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                  e.currentTarget.style.borderColor = "#007bff";
                }
              }}
              onMouseLeave={(e) => {
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
            background: "#f5f5f5",
            color: "#333",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
            fontSize: "1rem",
            opacity: currentQuestionIndex === 0 ? 0.5 : 1,
            transition: "background-color 0.2s ease",
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
          style={{
            background: "#000",
            color: "#fff",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.2s ease",
          }}
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
