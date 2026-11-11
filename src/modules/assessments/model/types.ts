/**
 * Assessment (baholash) va Score (baho) modellar.
 */
export interface Assessment {
  id: string;
  group_id: string;
  title: string;
  type: "daily" | "exam" | "quiz" | "homework";
  max_score: number;
  date: string;
  schema?: string | null;
  created_at: string;
}

export interface Score {
  id: string;
  assessment_id: string;
  enrollment_id: string;
  score: number;
  comment?: string | null;
  created_at: string;
}

export interface AssessmentListParams {
  group_id?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface ScoreListParams {
  assessment_id?: string;
  enrollment_id?: string;
  page?: number;
  page_size?: number;
}
