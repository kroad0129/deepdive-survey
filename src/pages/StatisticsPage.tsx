import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../services/api";
import type { Survey, FrontendSurvey } from "../types/survey";

export default function StatisticsPage() {
  const [surveys, setSurveys] = useState<FrontendSurvey[]>([]);

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const backendSurveys = await apiService.getSurveys();

        // 각 설문의 실제 참여자 수를 계산
        const frontendSurveys: FrontendSurvey[] = await Promise.all(
          backendSurveys.map(async (survey: Survey) => {
            try {
              // 각 설문의 선택지 카운트를 가져와서 참여자 수 계산
              const choiceCounts = await apiService.getChoiceCountsBySurvey(
                survey.surveyId.toString()
              );

              // 모든 질문의 선택지 카운트에서 최대값을 참여자 수로 사용
              const questions = await apiService.getQuestionsBySurvey(
                survey.surveyId.toString()
              );
              const totalParticipants = Math.max(
                ...questions.map((question: any) => {
                  const questionChoiceCounts = question.choices.map(
                    (choice: any) => {
                      const choiceCount = choiceCounts.find(
                        (cc: any) => cc.choiceId === choice.choiceId
                      );
                      return choiceCount ? choiceCount.count : 0;
                    }
                  );
                  return questionChoiceCounts.reduce(
                    (sum: number, count: number) => sum + count,
                    0
                  );
                })
              );

              return {
                id: survey.surveyId.toString(),
                title: survey.title,
                description: survey.subTitle,
                questions:
                  survey.questions?.map((q: any) => ({
                    question: q.text,
                    options: q.choices?.map((c: any) => c.text) || [],
                  })) || [],
                responses: totalParticipants,
              };
            } catch (error) {
              console.error(
                `설문 ${survey.surveyId} 참여자 수 계산 실패:`,
                error
              );
              return {
                id: survey.surveyId.toString(),
                title: survey.title,
                description: survey.subTitle,
                questions:
                  survey.questions?.map((q: any) => ({
                    question: q.text,
                    options: q.choices?.map((c: any) => c.text) || [],
                  })) || [],
                responses: 0,
              };
            }
          })
        );

        setSurveys(frontendSurveys);
      } catch (error) {
        console.error("설문 목록 로드 실패:", error);
        setSurveys([]);
      }
    };

    loadSurveys();
  }, []);

  return (
    <div
      style={{
        background: "#E9E9E9",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      {/* 상단 제목 */}
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

      {/* 메인 제목 */}
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            margin: "0 0 0.5rem 0",
            color: "#000000",
          }}
        >
          통계
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#565656",
            margin: 0,
          }}
        >
          행동 데이터 기반 통계 페이지
        </p>
      </div>

      {/* 설문 통계 카드들 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {surveys.map((survey) => (
          <div
            key={survey.id}
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              height: "200px",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  margin: "0 0 0.5rem 0",
                  color: "#000000",
                }}
              >
                {survey.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#565656",
                  margin: "0 0 0.5rem 0",
                }}
              >
                {survey.description}
              </p>
            </div>

            <div style={{ marginTop: "auto" }}>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#565656",
                  margin: "0 0 1rem 0",
                }}
              >
                {survey.questions.length}개 항목 · {survey.responses}명 참여
              </p>

              <Link
                to={`/statistics/${survey.id}`}
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    width: "100%",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#333";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#000";
                  }}
                >
                  통계 보기
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
