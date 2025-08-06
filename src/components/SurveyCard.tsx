import { Link } from "react-router-dom";
import { commonStyles } from "../styles/common";

interface SurveyCardProps {
  id: string;
  title: string;
  subtitle: string;
  itemCount: number;
  participantCount: number;
}

export default function SurveyCard({
  id,
  title,
  subtitle,
  itemCount,
  participantCount,
}: SurveyCardProps) {
  return (
    <div
      style={{
        ...commonStyles.card,
        display: "flex",
        flexDirection: "column",
        height: "200px",
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
          {title}
        </h3>
        <p style={commonStyles.text.small}>{subtitle}</p>
      </div>

      <div style={{ marginTop: "auto" }}>
        <p
          style={{
            fontSize: "0.8rem",
            color: "#565656",
            margin: "0 0 1rem 0",
          }}
        >
          {itemCount}개 항목 · {participantCount}명 참여
        </p>

        <Link to={`/survey/${id}`}>
          <button
            style={{
              ...commonStyles.button.primary,
              padding: "0.75rem 1rem",
              fontSize: "0.9rem",
              fontWeight: "500",
              width: "100%",
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
