import type { Survey, SurveyResponse } from "../types/survey";

class SurveyStore {
  private surveys: Survey[] = [];
  private responses: SurveyResponse[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const savedSurveys = localStorage.getItem("surveys");
    const savedResponses = localStorage.getItem("surveyResponses");

    if (savedSurveys) {
      this.surveys = JSON.parse(savedSurveys).map((survey: any) => ({
        ...survey,
        createdAt: new Date(survey.createdAt),
      }));
    }

    if (savedResponses) {
      this.responses = JSON.parse(savedResponses);
    }
  }

  private saveToStorage() {
    localStorage.setItem("surveys", JSON.stringify(this.surveys));
    localStorage.setItem("surveyResponses", JSON.stringify(this.responses));
  }

  createSurvey(survey: Omit<Survey, "id" | "createdAt" | "responses">): Survey {
    const newSurvey: Survey = {
      ...survey,
      id: Date.now().toString(),
      createdAt: new Date(),
      responses: 0,
    };

    this.surveys.push(newSurvey);
    this.saveToStorage();
    return newSurvey;
  }

  getAllSurveys(): Survey[] {
    return [...this.surveys];
  }

  getSurveyById(id: string): Survey | undefined {
    return this.surveys.find((survey) => survey.id === id);
  }

  submitResponse(surveyId: string, answers: number[]): void {
    const survey = this.getSurveyById(surveyId);
    if (survey) {
      survey.responses += 1;
      this.responses.push({ surveyId, answers });
      this.saveToStorage();
    }
  }

  getSurveyResponses(surveyId: string): SurveyResponse[] {
    return this.responses.filter((response) => response.surveyId === surveyId);
  }
}

// 싱글톤 인스턴스 생성
export const surveyStore = new SurveyStore();
