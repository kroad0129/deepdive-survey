import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { surveyStore } from "../store/surveyStore";

export default function DebugPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    // localStorage에서 직접 데이터 불러오기
    const savedSurveys = localStorage.getItem("surveys");
    const savedResponses = localStorage.getItem("surveyResponses");

    if (savedSurveys) {
      setSurveys(JSON.parse(savedSurveys));
    }

    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  }, []);

  const clearAllData = () => {
    localStorage.clear();
    setSurveys([]);
    setResponses([]);
    alert("모든 데이터가 삭제되었습니다.");
  };

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
        <h1
          style={{
            color: "#666",
            fontSize: "1.5rem",
            fontWeight: "normal",
            margin: "0 0 0.5rem 0",
          }}
        >
          디버그 페이지
        </h1>
        <Link
          to="/"
          style={{
            color: "#333",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          메인으로 돌아가기
        </Link>
      </div>

      {/* 데이터 삭제 버튼 */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={clearAllData}
          style={{
            background: "#dc3545",
            color: "#fff",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          모든 데이터 삭제
        </button>
      </div>

      {/* 설문 데이터 */}
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: "bold",
            margin: "0 0 1rem 0",
            color: "#333",
          }}
        >
          저장된 설문 ({surveys.length}개)
        </h2>
        <pre
          style={{
            background: "#f8f9fa",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
            fontSize: "0.8rem",
          }}
        >
          {JSON.stringify(surveys, null, 2)}
        </pre>
      </div>

      {/* 응답 데이터 */}
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: "bold",
            margin: "0 0 1rem 0",
            color: "#333",
          }}
        >
          저장된 응답 ({responses.length}개)
        </h2>
        <pre
          style={{
            background: "#f8f9fa",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
            fontSize: "0.8rem",
          }}
        >
          {JSON.stringify(responses, null, 2)}
        </pre>
      </div>
    </div>
  );
}
