import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SurveyCard from "../components/SurveyCard";
import { surveyStore } from "../store/surveyStore";
import type { Survey } from "../types/survey";

export default function HomePage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    const loadSurveys = () => {
      const allSurveys = surveyStore.getAllSurveys();
      setSurveys(allSurveys);
    };

    loadSurveys();
  }, []);

  return (
    <div style={{ background: "#E9E9E9", minHeight: "100vh" }}>
      <div style={{ padding: "4rem 2rem 0 2rem" }}></div>

      <div
        style={{
          padding: "2rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "600px",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              margin: "0 0 0.5rem 0",
              fontWeight: "bold",
              color: "#000000",
            }}
          >
            서비스 명
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#565656",
              margin: "0 0 2rem 0",
            }}
          >
            행동 데이터 기반 설문조사
          </p>
          <div>
            <Link to="/create" style={{ textDecoration: "none" }}>
              <button
                style={{
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  marginRight: "1rem",
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
                새 설문 만들기
              </button>
            </Link>
            <Link to="/statistics" style={{ textDecoration: "none" }}>
              <button
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
                통계
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 2rem 2rem 2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            margin: "0 0 1rem 0",
            fontWeight: "bold",
            color: "#000000",
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
              deadline={`${survey.questions.length}개 항목 · ${survey.responses}명 참여`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
