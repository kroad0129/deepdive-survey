import { Link } from "react-router-dom";

interface SurveyCardProps {
  id: string;
  title: string;
  subtitle: string;
  etc: string;
}

export default function SurveyCard({
  id,
  title,
  subtitle,
  etc,
}: SurveyCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "1.5rem",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        height: "200px",
      }}
    >
      <div>
        {/* 제목 */}
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            margin: "0 0 0.5rem 0",
            color: "#000000",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#565656",
            margin: 0,
          }}
        >
          {subtitle}
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
          {etc}
        </p>

        <Link to={`/survey/${id}`} style={{ textDecoration: "none" }}>
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
              e.currentTarget.style.backgroundColor = "#303030";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#000000";
            }}
          >
            설문 참여하기
          </button>
        </Link>
      </div>
    </div>
  );
}
