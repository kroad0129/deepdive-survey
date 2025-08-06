import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiService } from "../services/api";
import type { FrontendSurvey, FrontendSurveyResponse } from "../types/survey";

export default function StatisticsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<FrontendSurvey | null>(null);
  const [responses, setResponses] = useState<FrontendSurveyResponse[]>([]);
  const [viewMode, setViewMode] = useState<"basic" | "advanced">("basic");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  useEffect(() => {
    const loadSurveyData = async () => {
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
                  question: q.text,
                  options: q.choices?.map((c: any) => c.text) || [],
                })) || [],
              responses: backendSurvey.responses || 0,
            };

            setSurvey(frontendSurvey);
            const surveyResponses = await apiService.getSurveyResponses(id);
            setResponses(surveyResponses);
          }
        } catch (error) {
          console.error("설문 데이터 로드 실패:", error);
        }
      }
    };

    loadSurveyData();
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

  // 원형 그래프 컴포넌트
  const PieChart = ({
    data,
  }: {
    data: Array<{ option: string; count: number; percentage: number }>;
  }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) {
      return (
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          응답 데이터가 없습니다.
        </div>
      );
    }

    let currentAngle = 0;
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "2rem",
        }}
      >
        {/* 원형 그래프 */}
        <div
          style={{
            position: "relative",
            width: "200px",
            height: "200px",
          }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200">
            {data.map((item, index) => {
              if (item.count === 0) return null;

              const angle = (item.count / total) * 360;
              const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
              const x2 =
                100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 =
                100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`,
              ].join(" ");

              currentAngle += angle;

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        {/* 👉 오른쪽 범례 */}
        <div>
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: colors[index % colors.length],
                  marginRight: "0.5rem",
                  borderRadius: "2px",
                }}
              />
              <span style={{ fontSize: "0.9rem", color: "#333" }}>
                {item.option}: {item.count}명 ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
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

      {/* 설문 개요 카드 */}
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: "0 0 0.5rem 0",
            color: "#000000",
          }}
        >
          {survey.title}
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#565656",
            margin: "0 0 1rem 0",
          }}
        >
          {survey.description}
        </p>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            fontSize: "0.9rem",
            color: "#666",
          }}
        >
          <span>{survey.questions.length}개 항목</span>
          <span>{responses.length}명 참여</span>
          <span>생성일: {formatDate(new Date())}</span>
        </div>
      </div>

      {/* 모드 선택 */}
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: "0 0 1rem 0",
            }}
          >
            통계 모드
          </h3>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <button
              onClick={() => setViewMode("basic")}
              style={{
                padding: "0.5rem 1rem",
                border:
                  viewMode === "basic" ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: "6px",
                background: viewMode === "basic" ? "#f8f9ff" : "#fff",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              일반
            </button>
            <button
              disabled
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background: "#f5f5f5",
                cursor: "not-allowed",
                fontSize: "0.9rem",
                color: "#999",
              }}
              title="준비 중입니다"
            >
              고급 (준비 중)
            </button>
          </div>
        </div>

        {viewMode === "basic" && (
          <div>
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                margin: "0 0 0.5rem 0",
              }}
            >
              차트 유형
            </h4>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setChartType("bar")}
                style={{
                  padding: "0.5rem 1rem",
                  border:
                    chartType === "bar"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
                  borderRadius: "6px",
                  background: chartType === "bar" ? "#f8f9ff" : "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                막대 그래프
              </button>
              <button
                onClick={() => setChartType("pie")}
                style={{
                  padding: "0.5rem 1rem",
                  border:
                    chartType === "pie"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
                  borderRadius: "6px",
                  background: chartType === "pie" ? "#f8f9ff" : "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                원형 그래프
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 질문별 통계 */}
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
                color: "#000000",
              }}
            >
              질문 {questionIndex + 1}. {question.question}
            </h3>

            {viewMode === "basic" ? (
              // 일반 모드: 막대 또는 원형 그래프
              <div>
                {chartType === "bar" ? (
                  // 막대 그래프
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
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
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
                ) : (
                  // 원형 그래프
                  <PieChart data={stats} />
                )}
              </div>
            ) : (
              // 고급 모드: 비활성화 상태
              <div
                style={{ textAlign: "center", padding: "2rem", color: "#666" }}
              >
                고급 모드는 준비 중입니다.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
