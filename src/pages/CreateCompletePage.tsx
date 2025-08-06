import { Link } from "react-router-dom";
import CheckIcon from "../assets/check.png";

export default function CreateCompletePage() {
  return (
    <div
      style={{
        background: "#E9E9E9",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <img
          src={CheckIcon}
          alt="완료 아이콘"
          style={{
            width: "150px",
            height: "150px",
            marginBottom: "0rem",
          }}
        />
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            margin: "0 0 1rem 0",
            color: "#000000",
          }}
        >
          설문 제작 완료!
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#565656",
            margin: "0 0 2rem 0",
          }}
        >
          이용해 주셔서 감사합니다
        </p>
        <Link to="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              background: "#000",
              color: "#fff",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#333";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#000";
            }}
          >
            메인으로 돌아가기
          </button>
        </Link>
      </div>
    </div>
  );
}
