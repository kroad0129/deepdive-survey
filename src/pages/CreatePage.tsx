import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import QuestionForm from "../components/QuestionForm";
import { apiService } from "../services/api";

interface CreateQuestion {
  question: string;
  options: string[];
}

export default function CreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<CreateQuestion[]>([
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

  // 유효성 검사 함수
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 설문 제목 검사
    if (!title.trim()) {
      errors.push("설문 제목을 입력해주세요.");
    }

    // 설문 부제목 검사
    if (!description.trim()) {
      errors.push("설문 부제목을 입력해주세요.");
    }

    // 질문 검사
    questions.forEach((question, qIndex) => {
      // 질문 텍스트 검사
      if (!question.question.trim()) {
        errors.push(`질문 ${qIndex + 1}의 내용을 입력해주세요.`);
      }

      // 선택지 검사
      const validOptions = question.options.filter(
        (option: string) => option.trim() !== ""
      );
      if (validOptions.length < 5) {
        errors.push(`질문 ${qIndex + 1}의 선택지는 5개 모두 입력해주세요.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleSubmit = async () => {
    // 유효성 검사 수행
    const validation = validateForm();

    if (!validation.isValid) {
      alert(`다음 항목을 확인해주세요:\n\n${validation.errors.join("\n")}`);
      return;
    }

    try {
      // 백엔드 API로 설문 생성
      const surveyData = {
        title: title.trim(),
        subTitle: description.trim(),
        questions: questions.map((q, qIndex) => ({
          text: q.question.trim(),
          sequence: qIndex,
          options: q.options
            .filter((option: string) => option.trim() !== "")
            .map((option: string, oIndex: number) => ({
              text: option.trim(),
              sequence: oIndex,
            })),
        })),
      };

      const apiResponse = await apiService.createSurvey(surveyData);
      console.log("백엔드 API 응답:", apiResponse);

      navigate("/create/complete");
    } catch (error) {
      console.error("설문 생성 실패:", error);
      alert("설문 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
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

      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          boxSizing: "border-box",
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
              boxSizing: "border-box",
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
              boxSizing: "border-box",
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
