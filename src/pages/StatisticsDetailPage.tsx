import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { surveyStore } from "../store/surveyStore";
import type { Survey, SurveyResponse } from "../types/survey";

export default function StatisticsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [viewMode, setViewMode] = useState<"basic" | "advanced">("basic");

  useEffect(() => {
    if (id) {
      const foundSurvey = surveyStore.getSurveyById(id);
      if (foundSurvey) {
        setSurvey(foundSurvey);
        const surveyResponses = surveyStore.getSurveyResponses(id);
        setResponses(surveyResponses);
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
          <Link
            to="/statistics"
            style={{ color: "#333", textDecoration: "none" }}
          >
            통계 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 각 질문별 응답 통계 계산
  const getQuestionStats = (questionIndex: number) => {
    const optionCounts = new Array(
      survey.questions[questionIndex].options.length
    ).fill(0);

    responses.forEach((response) => {
      if (response.answers[questionIndex] !== undefined) {
        optionCounts[response.answers[questionIndex]]++;
      }
    });

    const total = optionCounts.reduce((sum, count) => sum + count, 0);

    return optionCounts.map((count, index) => ({
      option: survey.questions[questionIndex].options[index],
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  };

  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\./g, ".")
      .replace(/\s/g, "");
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
            color: "#007bff",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          메인으로 돌아가기
        </Link>
      </div>

      {/* 설문 개요 카드 */}
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                margin: "0 0 0.5rem 0",
                color: "#333",
              }}
            >
              결과 - {survey.title}
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "#666",
                margin: "0 0 0.5rem 0",
              }}
            >
              {survey.description}
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#888",
                margin: 0,
              }}
            >
              총 문답: {survey.questions.length}개 · 생성 날짜:{" "}
              {formatDate(survey.createdAt)}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setViewMode("basic")}
              style={{
                background: viewMode === "basic" ? "#007bff" : "#f5f5f5",
                color: viewMode === "basic" ? "#fff" : "#333",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              일반
            </button>
            <button
              onClick={() => setViewMode("advanced")}
              style={{
                background: viewMode === "advanced" ? "#007bff" : "#f5f5f5",
                color: viewMode === "advanced" ? "#fff" : "#333",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              고급
            </button>
          </div>
        </div>
      </div>

      {/* 질문별 통계 카드들 */}
      {survey.questions.map((question, questionIndex) => {
        const stats = getQuestionStats(questionIndex);
        const maxCount = Math.max(...stats.map((s) => s.count));

        return (
          <div
            key={questionIndex}
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                margin: "0 0 1rem 0",
                color: "#333",
              }}
            >
              {question.question}
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {stats.map((stat, optionIndex) => (
                <div
                  key={optionIndex}
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      minWidth: "120px",
                      fontSize: "0.9rem",
                      color: "#333",
                    }}
                  >
                    {optionIndex + 1}. {stat.option}
                  </div>
                  <div
                    style={{
                      minWidth: "80px",
                      fontSize: "0.9rem",
                      color: "#666",
                    }}
                  >
                    {stat.count}명 ({stat.percentage}%)
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: "20px",
                      background: "#f0f0f0",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${
                          maxCount > 0 ? (stat.count / maxCount) * 100 : 0
                        }%`,
                        height: "100%",
                        background: "#333",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
