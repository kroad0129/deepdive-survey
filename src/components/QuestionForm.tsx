import type { ChangeEvent } from "react";
import { commonStyles } from "../styles/common";

interface Props {
  index: number;
  question: string;
  options: string[];
  onChange: (
    index: number,
    field: string,
    value: string,
    optionIndex?: number
  ) => void;
}

export default function QuestionForm({
  index,
  question,
  options,
  onChange,
}: Props) {
  return (
    <div style={{ ...commonStyles.card, marginBottom: "1.5rem" }}>
      <h3
        style={{
          fontSize: "1.2rem",
          fontWeight: "bold",
          margin: "0 0 1rem 0",
          color: "#000000",
        }}
      >
        질문 {index + 1}
      </h3>

      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            ...commonStyles.text.small,
            color: "#000000",
          }}
        >
          질문 내용
        </label>
        <input
          type="text"
          value={question}
          placeholder="질문 내용 입력"
          onChange={(e) => onChange(index, "question", e.target.value)}
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
            ...commonStyles.text.small,
            color: "#000000",
          }}
        >
          선택지
        </label>
        <div
          style={{
            background: "#f5f5f5",
            padding: "1rem",
            borderRadius: "6px",
          }}
        >
          {options.map((opt, optIdx) => (
            <div key={optIdx} style={{ marginBottom: "0.5rem" }}>
              <input
                type="text"
                placeholder={`${optIdx + 1}.`}
                value={opt}
                onChange={(e) =>
                  onChange(index, "option", e.target.value, optIdx)
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
