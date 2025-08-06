import { useEffect, useState } from "react";
import { API_BASE_URL } from "../services/baseUrl";

interface EventLog {
  eventLogId: number;
  questionId: number;
  eventType: string;
  timestamp_ms: string;
  payLoad: any;
}

export default function DebugEventLogPage() {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [questionId, setQuestionId] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/event-logs/question/${questionId}`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error("서버 응답 오류: " + res.status);
      const data = await res.json();
      setLogs(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>이벤트 로그 조회 (questionId 기준)</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="number"
          value={questionId}
          onChange={(e) => setQuestionId(e.target.value)}
          style={{ width: 100, marginRight: 8 }}
        />
        <button onClick={fetchLogs}>조회</button>
      </div>
      {loading && <div>로딩 중...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <table
        border={1}
        cellPadding={8}
        style={{ marginTop: 16, width: "100%" }}
      >
        <thead>
          <tr>
            <th>eventLogId</th>
            <th>eventType</th>
            <th>timestamp</th>
            <th>payLoad</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.eventLogId}>
              <td>{log.eventLogId}</td>
              <td>{log.eventType}</td>
              <td>{log.timestamp_ms}</td>
              <td>
                <pre style={{ margin: 0, fontSize: 12 }}>
                  {JSON.stringify(log.payLoad, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
