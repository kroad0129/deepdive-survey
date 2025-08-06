import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { Survey, Question } from "../types/survey";
import QuestionForm from "../components/QuestionForm";
import { surveyStore } from "../store/surveyStore";

export default function CreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", "", ""] },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", "", ""] },
    ]);
  };

  const handleChange = (
    qIndex: number,
    field: string,
    value: string,
    optionIndex?: number
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (field === "question") {
          return { ...q, question: value };
        }
        if (field === "option" && optionIndex !== undefined) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const handleSubmit = () => {
    const newSurvey = surveyStore.createSurvey({
      title,
      description,
      questions,
    });
    console.log("설문 저장됨:", newSurvey);

    // 저장 후 완료 페이지로 이동
    navigate("/create/complete");
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

      <div
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
          설문 기본 정보
        </h3>
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              color: "#000000",
            }}
          >
            설문 제목
          </label>
          <input
            type="text"
            placeholder="설문 제목 입력"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              color: "#000000",
            }}
          >
            설문 부제목
          </label>
          <input
            type="text"
            placeholder="40자 이내로 입력"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>
      </div>

      {questions.map((q, index) => (
        <QuestionForm
          key={index}
          index={index}
          question={q.question}
          options={q.options}
          onChange={handleChange}
        />
      ))}

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <button
          onClick={addQuestion}
          style={{
            background: "#f5f5f5",
            color: "#333",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e0e0e0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
        >
          질문 추가
        </button>
        <button
          onClick={handleSubmit}
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
          설문 저장하기
        </button>
      </div>
    </div>
  );
}
