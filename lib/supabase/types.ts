export type UserRole = "student" | "admin";
export type DailyHours = 2 | 3 | 4;
export type TaskType = "theory_video" | "dsa_problem" | "sql_problem" | "mcq";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  streak_count: number;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon: string | null;
  created_at: string;
}

export interface CourseTrack {
  id: string;
  course_id: string;
  daily_hours: DailyHours;
  total_days: number;
}

export interface TrackDay {
  id: string;
  track_id: string;
  day_number: number;
  title: string;
}

export interface DsaProblemPayload {
  description: string;
  starter_code: string;
  language: string;
  sample_testcases: Array<{
    input: string;
    expected_output: string;
    explanation?: string;
  }>;
  hidden_testcases: Array<{
    input: string;
    expected_output: string;
  }>;
}

export interface SqlProblemPayload {
  description: string;
  schema_sql: string;
  starter_query: string;
  expected_solution_query: string;
  expected_rows: Array<Record<string, unknown>>;
}

export interface TheoryVideoPayload {
  markdown_notes: string;
  video_url: string;
  video_title: string;
  timestamps?: Array<{ time: string; label: string }>;
}

export interface McqPayload {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export type TaskPayload =
  | DsaProblemPayload
  | SqlProblemPayload
  | TheoryVideoPayload
  | McqPayload;

export interface DayTask {
  id: string;
  day_id: string;
  sequence_order: number;
  task_type: TaskType;
  title: string;
  estimated_minutes: number;
  payload: TaskPayload;
}

export interface Enrollment {
  id: string;
  user_id: string;
  track_id: string;
  current_day: number;
  next_day_unlock_at: string;
  is_completed: boolean;
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  enrollment_id: string;
  task_id: string;
  completed_at: string;
  submitted_code: string | null;
}
