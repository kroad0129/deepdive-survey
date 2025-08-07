import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SurveyCard from "../components/SurveyCard";
import { apiService } from "../services/api";
import { commonStyles } from "../styles/common";
import type { Survey, FrontendSurvey } from "../types/survey";

export default function HomePage() {
  const [surveys, setSurveys] = useState<FrontendSurvey[]>([]);

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const backendSurveys = await apiService.getSurveys();

        const frontendSurveys: FrontendSurvey[] = backendSurveys.map(
          (survey: Survey) => ({
            id: survey.surveyId.toString(),
            title: survey.title,
            description: survey.subTitle,
            questions:
              survey.questions?.map((q) => ({
                question: q.text,
                options: q.choices?.map((c) => c.text) || [],
              })) || [],
            responses: survey.responses || 0,
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
    <div style={{ background: "#E9E9E9", minHeight: "100vh" }}>
      <div style={{ padding: "4rem 2rem 0 2rem" }}></div>

      <div
        style={{ padding: "2rem", display: "flex", justifyContent: "center" }}
      >
        <div style={{ textAlign: "center", maxWidth: "600px", width: "100%" }}>
          <h1 style={commonStyles.title}>서비스 명</h1>
          <p style={{ ...commonStyles.text.regular, margin: "0 0 2rem 0" }}>
            행동 데이터 기반 설문조사
          </p>
          <div>
            <Link to="/create" style={{ textDecoration: "none" }}>
              <button
                style={commonStyles.button.primary}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#333";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#000";
                }}
              >
                새 설문 만들기
              </button>
            </Link>
            <Link
              to="/statistics"
              style={{ textDecoration: "none", marginLeft: "1rem" }}
            >
              <button
                style={commonStyles.button.primary}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#333";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#000";
                }}
              >
                통계
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 2rem 2rem 2rem" }}>
        <h2
          style={{
            ...commonStyles.subtitle,
            fontSize: "1.5rem",
            margin: "0 0 1rem 0",
          }}
        >
          참여 가능한 설문
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "1rem",
          }}
        >
          {surveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              id={survey.id}
              title={survey.title}
              subtitle={survey.description}
              itemCount={survey.questions.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
