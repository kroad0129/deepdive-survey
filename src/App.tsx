import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import CreateCompletePage from "./pages/CreateCompletePage";
import SurveyPage from "./pages/SurveyPage";
import SurveyCompletePage from "./pages/SurveyCompletePage";
import StatisticsPage from "./pages/StatisticsPage";
import StatisticsDetailPage from "./pages/StatisticsDetailPage";
import DebugPage from "./pages/DebugPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/create/complete" element={<CreateCompletePage />} />
      <Route path="/survey/:id" element={<SurveyPage />} />
      <Route path="/survey/:id/complete" element={<SurveyCompletePage />} />
      <Route path="/statistics" element={<StatisticsPage />} />
      <Route path="/statistics/:id" element={<StatisticsDetailPage />} />
      <Route path="/debug" element={<DebugPage />} />
    </Routes>
  );
}

export default App;
