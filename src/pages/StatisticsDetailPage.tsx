import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiService } from "../services/api";
import type { FrontendSurvey } from "../types/survey";
import { AgCharts } from "ag-charts-react";
import "ag-charts-enterprise";

interface QuestionStat {
  option: string;
  count: number;
  percentage: number;
}

interface BackendQuestion {
  questionId: number;
  text: string;
  choices: Array<{
    choiceId: number;
    text: string;
  }>;
}

interface BackendChoiceCount {
  choiceId: number;
  choiceText: string;
  count: number;
}

export default function StatisticsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<FrontendSurvey | null>(null);
  const [viewMode, setViewMode] = useState<"basic" | "advanced">("basic");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [advancedView, setAdvancedView] = useState<"detail" | "log">("detail");
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [questionStats, setQuestionStats] = useState<QuestionStat[][]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [sankeyData, setSankeyData] = useState<any[]>([]);
  const [loadingSankey, setLoadingSankey] = useState(false);

  useEffect(() => {
    const loadSurveyData = async () => {
      if (id) {
        try {
          const backendSurvey = await apiService.getSurveyById(id);
          if (backendSurvey) {
            const frontendSurvey: FrontendSurvey = {
              id: backendSurvey.surveyId.toString(),
              title: backendSurvey.title,
              description: backendSurvey.subTitle,
              questions:
                backendSurvey.questions?.map((q: BackendQuestion) => ({
                  question: q.text,
                  options: q.choices?.map((c) => c.text) || [],
                })) || [],
              responses: backendSurvey.responses || 0,
            };

            setSurvey(frontendSurvey);
          }
        } catch (error) {
          console.error("설문 데이터 로드 실패:", error);
        }
      }
    };

    loadSurveyData();
  }, [id]);

  useEffect(() => {
    const loadStats = async () => {
      if (survey && viewMode === "basic") {
        setLoadingStats(true);
        try {
          const choiceCounts = await apiService.getChoiceCountsBySurvey(
            survey.id
          );
          const questions = await apiService.getQuestionsBySurvey(survey.id);

          const stats = questions.map((question: BackendQuestion) => {
            const questionStats = question.choices.map((choice) => {
              const choiceCount = choiceCounts.find(
                (cc: BackendChoiceCount) => cc.choiceId === choice.choiceId
              );
              return {
                option: choice.text,
                count: choiceCount ? choiceCount.count : 0,
                percentage: 0,
              };
            });

            const total = questionStats.reduce(
              (sum: number, stat: QuestionStat) => sum + stat.count,
              0
            );
            return questionStats.map((stat: QuestionStat) => ({
              ...stat,
              percentage:
                total > 0 ? Math.round((stat.count / total) * 100) : 0,
            }));
          });

          setQuestionStats(stats);

          // 참여자 수 계산
          const totalParticipants = Math.max(
            ...stats.map((questionStats: QuestionStat[]) =>
              questionStats.reduce(
                (sum: number, stat: QuestionStat) => sum + stat.count,
                0
              )
            )
          );
          setTotalParticipants(totalParticipants);
        } catch (error) {
          console.error("통계 데이터 로드 실패:", error);
          setQuestionStats([]);
          setTotalParticipants(0);
        } finally {
          setLoadingStats(false);
        }
      }
    };

    loadStats();
  }, [survey, viewMode]);

  // 선택된 질문의 로그 데이터 로드
  useEffect(() => {
    const loadEventLogs = async () => {
      if (survey && selectedQuestion >= 0) {
        setLoadingLogs(true);
        try {
          const questions = await apiService.getQuestionsBySurvey(survey.id);
          const selectedQuestionData = questions[selectedQuestion];

          if (selectedQuestionData) {
            const logs = await apiService.getEventLogsByQuestion(
              selectedQuestionData.questionId.toString()
            );
            setEventLogs(logs || []);
          }
        } catch (error) {
          console.error("로그 데이터 로드 실패:", error);
          setEventLogs([]);
        } finally {
          setLoadingLogs(false);
        }
      }
    };

    if (viewMode === "advanced" && advancedView === "log") {
      loadEventLogs();
    }
  }, [survey, selectedQuestion, viewMode, advancedView]);

  // Sankey 차트 데이터 로드
  useEffect(() => {
    const loadSankeyData = async () => {
      if (
        survey &&
        selectedQuestion >= 0 &&
        viewMode === "advanced" &&
        advancedView === "detail"
      ) {
        setLoadingSankey(true);
        try {
          const questions = await apiService.getQuestionsBySurvey(survey.id);
          const selectedQuestionData = questions[selectedQuestion];

          if (selectedQuestionData) {
            // TODO: 실제 API가 구현되면 이 부분을 교체
            // const data = await fetch(`/api/sankey/question/${selectedQuestionData.questionId}`).then(res => res.json());

            // 임시 샘플 데이터
            const sampleData = [
              { from: "시작", to: "선택지 1", size: 5 },
              { from: "시작", to: "선택지 2", size: 3 },
              { from: "선택지 1", to: "최종 선택", size: 4 },
              { from: "선택지 2", to: "최종 선택", size: 2 },
            ];

            setSankeyData(sampleData);
          }
        } catch (error) {
          console.error("Sankey 차트 데이터 로드 실패:", error);
          setSankeyData([]);
        } finally {
          setLoadingSankey(false);
        }
      }
    };

    loadSankeyData();
  }, [survey, selectedQuestion, viewMode, advancedView]);

  if (!survey) {
    return (
      <div
        style={{
          background: "#E9E9E9",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>설문을 찾을 수 없습니다.</h2>
          <Link
            to="/statistics"
            style={{ color: "#333", textDecoration: "none" }}
          >
            통계 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\./g, ".")
      .replace(/\s/g, "");
  };

  const PieChart = ({ data }: { data: QuestionStat[] }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    if (total === 0) {
      return (
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          응답 데이터가 없습니다.
        </div>
      );
    }

    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "2rem",
        }}
      >
        {/* 원형 그래프 */}
        <div
          style={{
            position: "relative",
            width: "200px",
            height: "200px",
          }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200">
            {(() => {
              let currentAngle = 0;
              const filteredData = data.filter((item) => item.count > 0);

              // 1명만 있는 경우 전체 원을 그리기
              if (filteredData.length === 1) {
                return (
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill={colors[0]}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                );
              }

              return filteredData.map((item, index) => {
                const angle = (item.count / total) * 360;

                const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                const x2 =
                  100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                const y2 =
                  100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);

                const largeArcFlag = angle > 180 ? 1 : 0;

                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`,
                ].join(" ");

                currentAngle += angle;

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                );
              });
            })()}
          </svg>
        </div>

        {/* 👉 오른쪽 범례 */}
        <div>
          {data
            .filter((item) => item.count > 0) // 0인 항목은 제외
            .map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: colors[index % colors.length],
                    marginRight: "0.5rem",
                    borderRadius: "2px",
                  }}
                />
                <span style={{ fontSize: "0.9rem", color: "#333" }}>
                  {item.option}: {item.count}명 ({item.percentage}%)
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // 고급 모드
  const AdvancedDetailView = () => {
    const question = survey.questions[selectedQuestion];
    const options = question.options;

    return (
      <div>
        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: "0 0 1.5rem 0",
            color: "#000000",
          }}
        >
          질문 {selectedQuestion + 1} 상세 분석
        </h3>

        {/* 선택지별 상호작용 분석 */}
        <div style={{ marginBottom: "2rem" }}>
          <h4
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: "0 0 1rem 0",
              color: "#000000",
            }}
          >
            선택지별 상호작용 분석
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {options.map((option, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <h5
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    margin: "0 0 1rem 0",
                    color: "#000000",
                  }}
                >
                  {option}
                </h5>

                {/* 클릭 수 */}
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      클릭 수
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      fontSize: "0.8rem",
                      color: "#666",
                    }}
                  >
                    <div>
                      <div>최소</div>
                      <div>0회</div>
                    </div>
                    <div>
                      <div>최대</div>
                      <div>0회</div>
                    </div>
                    <div>
                      <div>평균</div>
                      <div>0회</div>
                    </div>
                  </div>
                </div>

                {/* 호버 시간 */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      호버 시간
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      fontSize: "0.8rem",
                      color: "#666",
                    }}
                  >
                    <div>
                      <div>최소</div>
                      <div>0ms</div>
                    </div>
                    <div>
                      <div>최대</div>
                      <div>0ms</div>
                    </div>
                    <div>
                      <div>평균</div>
                      <div>0ms</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 기타 분석 지표 */}
        <div style={{ marginBottom: "2rem" }}>
          <h4
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: "0 0 1rem 0",
              color: "#000000",
            }}
          >
            기타 분석 지표
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            {/* 마우스 정지시간 */}
            <div
              style={{
                background: "#fff",
                padding: "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span style={{ fontSize: "1rem", fontWeight: "bold" }}>
                  마우스 정지시간
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontSize: "0.8rem",
                  color: "#666",
                }}
              >
                <div>
                  <div>최소</div>
                  <div>0ms</div>
                </div>
                <div>
                  <div>최대</div>
                  <div>0ms</div>
                </div>
                <div>
                  <div>평균</div>
                  <div>0ms</div>
                </div>
              </div>
            </div>

            {/* 질문당 소요시간 */}
            <div
              style={{
                background: "#fff",
                padding: "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span style={{ fontSize: "1rem", fontWeight: "bold" }}>
                  질문당 소요시간
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontSize: "0.8rem",
                  color: "#666",
                }}
              >
                <div>
                  <div>최소</div>
                  <div>0ms</div>
                </div>
                <div>
                  <div>최대</div>
                  <div>0ms</div>
                </div>
                <div>
                  <div>평균</div>
                  <div>0ms</div>
                </div>
              </div>
            </div>

            {/* 선택지 변경 횟수 */}
            <div
              style={{
                background: "#fff",
                padding: "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span style={{ fontSize: "1rem", fontWeight: "bold" }}>
                  선택지 변경 횟수
                </span>
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#000000",
                }}
              >
                0회
              </div>
            </div>
          </div>
        </div>

        {/* 시각화 */}
        <div>
          <h4
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: "0 0 1rem 0",
              color: "#000000",
            }}
          >
            선택지 변경 흐름 분석
          </h4>
          <div
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minHeight: "400px",
            }}
          >
            {loadingSankey ? (
              <div
                style={{ textAlign: "center", padding: "2rem", color: "#666" }}
              >
                차트 데이터를 불러오는 중...
              </div>
            ) : sankeyData.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "2rem", color: "#666" }}
              >
                차트 데이터가 없습니다.
              </div>
            ) : (
              <div style={{ height: "400px" }}>
                <AgCharts
                  options={{
                    title: { text: "선택지 변경 흐름" },
                    data: sankeyData,
                    series: [
                      {
                        type: "sankey",
                        fromKey: "from",
                        toKey: "to",
                        sizeKey: "size",
                        sizeName: "변경 횟수",
                      },
                    ],
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 고급 모드
  const AdvancedLogView = () => {
    const question = survey.questions[selectedQuestion];

    const formatLogData = (log: any) => {
      const timestamp = new Date(log.timestamp_ms);
      const kstTime = new Date(timestamp.getTime() + 9 * 60 * 60 * 1000); // UTC+9
      const timeString = kstTime.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Seoul",
      });

      let eventTypeDisplay = log.eventType;
      let payloadDisplay = "";

      let payload = log.payLoad;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.warn("Payload 파싱 실패:", payload);
        }
      }

      switch (log.eventType) {
        case "hover":
          eventTypeDisplay = "호버";
          if (payload && payload.hover) {
            const optionIndex = parseInt(payload.hover.optionId) - 1;
            const optionText =
              optionIndex >= 0 && optionIndex < question.options.length
                ? question.options[optionIndex]
                : `선택지 ${payload.hover.optionId}`;
            payloadDisplay = `${optionText} (${payload.hover.duration}ms)`;
          } else {
            payloadDisplay = "호버 데이터 없음";
          }
          break;
        case "selection_change":
          eventTypeDisplay = "선택지 변경";
          if (payload && payload.selection_change) {
            const fromIndex = parseInt(payload.selection_change.from) - 1;
            const toIndex = parseInt(payload.selection_change.to) - 1;
            const fromText =
              fromIndex >= 0 && fromIndex < question.options.length
                ? question.options[fromIndex]
                : `선택지 ${payload.selection_change.from}`;
            const toText =
              toIndex >= 0 && toIndex < question.options.length
                ? question.options[toIndex]
                : `선택지 ${payload.selection_change.to}`;
            payloadDisplay = `${fromText} → ${toText}`;
          } else {
            payloadDisplay = "변경 데이터 없음";
          }
          break;
        case "idle_period":
          eventTypeDisplay = "정지 시간";
          if (payload && payload.idle_period) {
            payloadDisplay = `${payload.idle_period.duration}ms`;
          } else {
            payloadDisplay = "정지 시간 데이터 없음";
          }
          break;
        case "question_time":
          eventTypeDisplay = "질문 소요시간";
          if (payload && payload.question_time) {
            payloadDisplay = `${payload.question_time.duration}ms`;
          } else {
            payloadDisplay = "소요시간 데이터 없음";
          }
          break;
        case "click":
          eventTypeDisplay = "클릭";
          if (payload && payload.click) {
            const optionIndex = parseInt(payload.click.selectedOptionId) - 1;
            const optionText =
              optionIndex >= 0 && optionIndex < question.options.length
                ? question.options[optionIndex]
                : `선택지 ${payload.click.selectedOptionId}`;
            payloadDisplay = optionText;
          } else {
            payloadDisplay = "클릭 데이터 없음";
          }
          break;
        default:
          payloadDisplay = payload ? JSON.stringify(payload) : "데이터 없음";
      }

      return {
        timestamp: timeString,
        eventType: eventTypeDisplay,
        payload: payloadDisplay,
      };
    };

    return (
      <div>
        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: "0 0 1.5rem 0",
            color: "#000000",
          }}
        >
          질문 {selectedQuestion + 1} 로그
        </h3>

        {/* 로그 테이블 */}
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* 테이블 헤더 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 2fr",
              background: "#f8f9fa",
              borderBottom: "1px solid #dee2e6",
            }}
          >
            <div
              style={{
                padding: "1rem",
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              타임 스탬프
            </div>
            <div
              style={{
                padding: "1rem",
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              이벤트 타입
            </div>
            <div
              style={{
                padding: "1rem",
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              Payload
            </div>
          </div>

          {/* 로그 항목들 */}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {loadingLogs ? (
              <div
                style={{ padding: "2rem", textAlign: "center", color: "#666" }}
              >
                로그 데이터를 불러오는 중...
              </div>
            ) : eventLogs.length === 0 ? (
              <div
                style={{ padding: "2rem", textAlign: "center", color: "#666" }}
              >
                로그 데이터가 없습니다.
              </div>
            ) : (
              eventLogs.map((log: any, index: number) => {
                const formattedLog = formatLogData(log);
                return (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr 2fr",
                      borderBottom: "1px solid #f0f0f0",
                      background: index % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        padding: "1rem",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      {formattedLog.timestamp}
                    </div>
                    <div style={{ padding: "1rem", fontSize: "0.9rem" }}>
                      {formattedLog.eventType}
                    </div>
                    <div style={{ padding: "1rem", fontSize: "0.9rem" }}>
                      {formattedLog.payload}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
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

      {/* 설문 개요 카드 */}
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: "0 0 0.5rem 0",
            color: "#000000",
          }}
        >
          {survey.title}
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#565656",
            margin: "0 0 1rem 0",
          }}
        >
          {survey.description}
        </p>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            fontSize: "0.9rem",
            color: "#565656",
          }}
        >
          <span>{survey.questions.length}개 항목</span>
          <span>{totalParticipants}명 참여</span>
          <span>생성일: {formatDate(new Date())}</span>
        </div>
      </div>

      {/* 모드 선택 */}
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              margin: "0 0 1rem 0",
            }}
          >
            통계 모드
          </h3>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <button
              onClick={() => setViewMode("basic")}
              style={{
                padding: "0.5rem 1rem",
                border:
                  viewMode === "basic" ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: "6px",
                background: viewMode === "basic" ? "#f8f9ff" : "#fff",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              일반
            </button>
            <button
              onClick={() => setViewMode("advanced")}
              style={{
                padding: "0.5rem 1rem",
                border:
                  viewMode === "advanced"
                    ? "2px solid #007bff"
                    : "1px solid #ddd",
                borderRadius: "6px",
                background: viewMode === "advanced" ? "#f8f9ff" : "#fff",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              고급
            </button>
          </div>
        </div>

        {viewMode === "basic" && (
          <div>
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                margin: "0 0 0.5rem 0",
              }}
            >
              차트 유형
            </h4>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setChartType("bar")}
                style={{
                  padding: "0.5rem 1rem",
                  border:
                    chartType === "bar"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
                  borderRadius: "6px",
                  background: chartType === "bar" ? "#f8f9ff" : "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                막대 그래프
              </button>
              <button
                onClick={() => setChartType("pie")}
                style={{
                  padding: "0.5rem 1rem",
                  border:
                    chartType === "pie"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
                  borderRadius: "6px",
                  background: chartType === "pie" ? "#f8f9ff" : "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                원형 그래프
              </button>
            </div>
          </div>
        )}

        {viewMode === "advanced" && (
          <div>
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                margin: "0 0 0.5rem 0",
              }}
            >
              분석 유형
            </h4>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <button
                onClick={() => setAdvancedView("detail")}
                style={{
                  padding: "0.5rem 1rem",
                  border:
                    advancedView === "detail"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
                  borderRadius: "6px",
                  background: advancedView === "detail" ? "#f8f9ff" : "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                상세보기
              </button>
              <button
                onClick={() => setAdvancedView("log")}
                style={{
                  padding: "0.5rem 1rem",
                  border:
                    advancedView === "log"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
                  borderRadius: "6px",
                  background: advancedView === "log" ? "#f8f9ff" : "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                로그보기
              </button>
            </div>

            {/* 질문 선택 */}
            <div>
              <h4
                style={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  margin: "0 0 0.5rem 0",
                }}
              >
                질문 선택
              </h4>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {survey.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedQuestion(index)}
                    style={{
                      padding: "0.5rem 1rem",
                      border:
                        selectedQuestion === index
                          ? "2px solid #007bff"
                          : "1px solid #ddd",
                      borderRadius: "6px",
                      background:
                        selectedQuestion === index ? "#f8f9ff" : "#fff",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    질문 {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 고급 모드 내용 */}
      {viewMode === "advanced" && (
        <div
          style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {advancedView === "detail" ? (
            <AdvancedDetailView />
          ) : (
            <AdvancedLogView />
          )}
        </div>
      )}

      {/* 질문별 통계 (일반 모드) */}
      {viewMode === "basic" && loadingStats && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          통계 데이터를 불러오는 중...
        </div>
      )}
      {viewMode === "basic" &&
        !loadingStats &&
        survey.questions.map((question, questionIndex) => {
          const stats = questionStats[questionIndex] || [];
          const maxCount = Math.max(...stats.map((s: QuestionStat) => s.count));

          return (
            <div
              key={questionIndex}
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
                질문 {questionIndex + 1}. {question.question}
              </h3>

              <div>
                {chartType === "bar" ? (
                  // 막대 그래프
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    {stats.map((stat, optionIndex) => (
                      <div
                        key={optionIndex}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <div
                          style={{
                            minWidth: "120px",
                            fontSize: "0.9rem",
                            color: "#333",
                          }}
                        >
                          {optionIndex + 1}. {stat.option}
                        </div>
                        <div
                          style={{
                            minWidth: "80px",
                            fontSize: "0.9rem",
                            color: "#666",
                          }}
                        >
                          {stat.count}명 ({stat.percentage}%)
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: "20px",
                            background: "#f0f0f0",
                            borderRadius: "10px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${
                                maxCount > 0 ? (stat.count / maxCount) * 100 : 0
                              }%`,
                              height: "100%",
                              background: "#333",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // 원형 그래프
                  <PieChart data={stats} />
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
