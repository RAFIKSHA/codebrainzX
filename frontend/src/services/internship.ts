import api, { publicApi } from './api';

export interface ScholarshipRule {
  id: number;
  internship?: number | null;
  title: string;
  min_score: number;
  max_score: number;
  concession_percentage: number;
  description: string;
  badge_label: string;
  is_active: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProgramHighlight {
  number: string;
  title: string;
  description: string;
}

export interface InternshipProgram {
  id: number;
  title: string;
  slug: string;
  badge: string;
  subtitle: string;
  description: string;
  duration: string;
  mode: 'online' | 'hybrid' | 'offline';
  program_type: string;
  stipend_info: string;
  who_can_apply: string[];
  skills_covered: string[];
  highlights: ProgramHighlight[];
  certificate_info: string;
  mentorship_info: string;
  interview_info: string;
  start_date?: string;
  end_date?: string;
  application_deadline?: string;
  is_published: boolean;
  status: 'open' | 'closing_soon' | 'closed';
  display_order: number;
  applications_count: number;
  scholarship_rules?: ScholarshipRule[];
  assessment?: {
    id: number;
    title: string;
    slug: string;
    description: string;
    duration_minutes: number;
    total_marks: number;
    passing_percentage: number;
    instructions: string;
    mcq_count: number;
    coding_count: number;
    mcq_question_ids?: number[];
    coding_question_ids?: number[];
    mcq_questions_list?: {
      id: number;
      title: string;
      statement: string;
      marks: number;
      difficulty: string;
      topic: string;
    }[];
    coding_questions_list?: {
      id: number;
      title: string;
      slug: string;
      topic: string;
      level: string;
      test_cases_count: number;
    }[];
    is_published: boolean;
  };
  created_at: string;
}

export interface ApplicationFormData {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  college: string;
  course: string;
  year_of_study: string;
  primary_skill: string;
  programming_experience: string;
  preferred_technology: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  agreement_accepted: boolean;
}

export interface InternshipApplication {
  id: number;
  application_id: string;
  internship: number;
  internship_title: string;
  internship_slug: string;
  internship_duration: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  college: string;
  course: string;
  year_of_study: string;
  primary_skill: string;
  programming_experience: string;
  preferred_technology: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  agreement_accepted: boolean;
  status: 'applied' | 'assessment_pending' | 'assessment_completed' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'not_selected';
  interview_date?: string;
  interview_mode?: string;
  interview_link?: string;
  interview_feedback?: string;
  admin_notes?: string;
  attempt_status?: 'not_started' | 'in_progress' | 'evaluating' | 'completed';
  attempt_score?: number;
  concession_percentage?: number;
  attempt_id?: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentMCQQuestion {
  id: number;
  title: string;
  statement: string;
  question_type: string;
  options: string[] | { text: string; [key: string]: any }[];
  marks: number;
  negative_marks: number;
  difficulty: string;
}

export interface AssessmentCodingQuestion {
  id: number;
  title: string;
  slug: string;
  statement: string;
  constraints: string;
  input_format: string;
  output_format: string;
  notes: string;
  starter_code_parsed: Record<string, string>;
  examples_parsed: { input: string; output: string; explanation?: string }[];
  time_limit: number;
  memory_limit: number;
  topic_name: string;
  level_name: string;
  sample_test_cases: { id: number; input_data: string; expected_output: string }[];
}

export interface QuestionResponse {
  id: number;
  question_type: 'mcq' | 'coding';
  mcq_question?: number;
  coding_question?: number;
  selected_options: any[];
  code: string;
  language_slug: string;
  is_answered: boolean;
  is_marked_for_review: boolean;
  is_correct: boolean;
  score_awarded: number;
  passed_test_cases: number;
  total_test_cases: number;
  test_case_results: any[];
  execution_error?: string;
  time_spent_seconds: number;
}

export interface AttemptEngineState {
  id: number;
  status: 'not_started' | 'in_progress' | 'evaluating' | 'completed';
  started_at: string;
  duration_minutes: number;
  assessment_title: string;
  application_details: {
    application_id: string;
    full_name: string;
    email: string;
    internship_title: string;
    internship_slug: string;
  };
  mcq_questions: AssessmentMCQQuestion[];
  coding_questions: AssessmentCodingQuestion[];
  responses: QuestionResponse[];
  warnings_count: number;
}

export interface TopicBreakdownItem {
  topic: string;
  percentage: number;
}

export interface AttemptResult {
  id: number;
  status: string;
  started_at: string;
  completed_at: string;
  score_percentage: number;
  total_score: number;
  max_score: number;
  mcq_score: number;
  mcq_max_score: number;
  coding_score: number;
  coding_max_score: number;
  total_questions: number;
  correct_questions: number;
  time_spent_seconds: number;
  concession_percentage: number;
  concession_rule?: ScholarshipRule;
  is_eligible_for_concession: boolean;
  concession_summary: string;
  topic_breakdown: TopicBreakdownItem[];
  application: InternshipApplication;
}

export interface InternshipAdminAnalytics {
  total_applications: number;
  assessments_completed: number;
  average_score: number;
  shortlisted: number;
  interviews: number;
  selected: number;
  concession_distribution: Record<string, number>;
  funnel: Record<string, number>;
  recent_applications: InternshipApplication[];
}

export const internshipService = {
  // Programs
  getPrograms: async () => {
    const res = await publicApi.get<InternshipProgram[]>('/internships/programs/');
    return res.data;
  },

  getProgramBySlug: async (slug: string) => {
    const res = await publicApi.get<InternshipProgram>(`/internships/programs/${slug}/`);
    return res.data;
  },

  getMyApplicationForProgram: async (slug: string, email?: string) => {
    const params = email ? { email } : {};
    const res = await api.get<{ has_applied: boolean; application: InternshipApplication | null }>(
      `/internships/programs/${slug}/my-application/`,
      { params }
    );
    return res.data;
  },

  applyForProgram: async (slug: string, data: ApplicationFormData) => {
    const res = await publicApi.post<{ message: string; application: InternshipApplication }>(
      `/internships/programs/${slug}/apply/`,
      data
    );
    return res.data;
  },

  // Application Verification & Student Tracking
  getApplicationByCode: async (applicationId: string) => {
    const res = await publicApi.get<InternshipApplication>(
      `/internships/applications/lookup/${applicationId}/`
    );
    return res.data;
  },

  getStudentDashboard: async (applicationId?: string) => {
    const params = applicationId ? { application_id: applicationId } : {};
    const res = await api.get<{ applications: InternshipApplication[]; count: number }>(
      '/internships/applications/student-dashboard/',
      { params }
    );
    return res.data;
  },

  // Active Scholarship Rules (Dynamic Score Ladder)
  getActiveScholarshipRules: async (programId?: number) => {
    const params = programId ? { internship: programId } : {};
    const res = await publicApi.get<ScholarshipRule[]>('/internships/scholarship-rules/active/', { params });
    return res.data;
  },

  // Assessment Engine
  startAssessment: async (applicationId: string) => {
    const res = await publicApi.post<AttemptEngineState>(
      '/internships/applications/start-assessment/',
      { application_id: applicationId }
    );
    return res.data;
  },

  getAttemptEngineState: async (attemptId: number) => {
    const res = await publicApi.get<AttemptEngineState>(`/internships/attempts/${attemptId}/engine/`);
    return res.data;
  },

  saveMCQAnswer: async (attemptId: number, data: {
    question_id: number;
    selected_options: any[];
    is_marked_for_review: boolean;
    time_spent_seconds?: number;
  }) => {
    const res = await publicApi.post<{ status: string; is_answered: boolean }>(
      `/internships/attempts/${attemptId}/save-mcq/`,
      data
    );
    return res.data;
  },

  runCode: async (attemptId: number, data: {
    question_id: number;
    code: string;
    language_slug: string;
  }) => {
    const res = await publicApi.post<any>(
      `/internships/attempts/${attemptId}/run-code/`,
      data
    );
    return res.data;
  },

  saveCodeAnswer: async (attemptId: number, data: {
    question_id: number;
    code: string;
    language_slug: string;
    is_marked_for_review?: boolean;
    time_spent_seconds?: number;
  }) => {
    const res = await publicApi.post<{ status: string; is_answered: boolean }>(
      `/internships/attempts/${attemptId}/save-code/`,
      data
    );
    return res.data;
  },

  recordWarning: async (attemptId: number) => {
    const res = await publicApi.post<{ status: string; warnings_count: number }>(
      `/internships/attempts/${attemptId}/warning/`
    );
    return res.data;
  },

  submitAssessment: async (attemptId: number, timeSpentSeconds: number) => {
    const res = await publicApi.post<AttemptResult>(
      `/internships/attempts/${attemptId}/submit/`,
      { time_spent_seconds: timeSpentSeconds }
    );
    return res.data;
  },

  getAttemptResult: async (attemptId: number) => {
    const res = await publicApi.get<AttemptResult>(`/internships/attempts/${attemptId}/result/`);
    return res.data;
  },

  // Admin Operations
  adminGetAnalytics: async () => {
    const res = await api.get<InternshipAdminAnalytics>('/admin/internships/analytics/');
    return res.data;
  },

  adminGetApplications: async () => {
    const res = await api.get<InternshipApplication[]>('/internships/applications/');
    return res.data;
  },

  adminGetApplicationDetail: async (id: number) => {
    const res = await api.get<any>(`/internships/applications/${id}/`);
    return res.data;
  },

  adminUpdateStage: async (id: number, data: {
    status?: string;
    admin_notes?: string;
    interview_date?: string;
    interview_link?: string;
  }) => {
    const res = await api.post(`/internships/applications/${id}/update-stage/`, data);
    return res.data;
  },

  adminGetScholarshipRules: async () => {
    const res = await api.get<ScholarshipRule[]>('/internships/scholarship-rules/');
    return res.data;
  },

  adminSaveScholarshipRule: async (rule: Partial<ScholarshipRule>) => {
    if (rule.id) {
      const res = await api.patch<ScholarshipRule>(`/internships/scholarship-rules/${rule.id}/`, rule);
      return res.data;
    } else {
      const res = await api.post<ScholarshipRule>('/internships/scholarship-rules/', rule);
      return res.data;
    }
  },

  adminDeleteScholarshipRule: async (id: number) => {
    const res = await api.delete(`/internships/scholarship-rules/${id}/`);
    return res.data;
  },

  adminGetQuestionBankFilters: async () => {
    const res = await api.get<{
      coding_topics: { id: number; name: string }[];
      coding_levels: { id: number; name: string }[];
      mcq_topics: { id: number; name: string }[];
      difficulties: { id: string; name: string }[];
    }>('/internships/admin/question-bank/filter-options/');
    return res.data;
  },

  adminGetQuestionBankCoding: async (params?: { search?: string; topic?: number | string; level?: number | string }) => {
    const res = await api.get<any[]>('/internships/admin/question-bank/coding/', { params });
    return res.data;
  },

  adminGetQuestionBankMCQ: async (params?: { search?: string; topic?: number | string; difficulty?: string }) => {
    const res = await api.get<any[]>('/internships/admin/question-bank/mcq/', { params });
    return res.data;
  },

  adminSelectCodingQuestions: async (assessmentId: number, questionIds: number[]) => {
    const res = await api.post(`/internships/assessments/${assessmentId}/select-coding-questions/`, {
      question_ids: questionIds
    });
    return res.data;
  },

  adminSelectMCQQuestions: async (assessmentId: number, questionIds: number[]) => {
    const res = await api.post(`/internships/assessments/${assessmentId}/select-mcq-questions/`, {
      question_ids: questionIds
    });
    return res.data;
  },

  adminUnlinkQuestion: async (assessmentId: number, questionType: 'coding' | 'mcq', questionId: number) => {
    const res = await api.post(`/internships/assessments/${assessmentId}/unlink-question/`, {
      question_type: questionType,
      question_id: questionId
    });
    return res.data;
  },

  adminGetAssessmentDetail: async (assessmentId: number) => {
    const res = await api.get<any>(`/internships/assessments/${assessmentId}/`);
    return res.data;
  },

  adminSaveAssessment: async (assessmentId: number, data: {
    title?: string;
    description?: string;
    duration_minutes?: number;
    total_marks?: number;
    passing_percentage?: number;
    instructions?: string;
    is_published?: boolean;
  }) => {
    const res = await api.patch(`/internships/assessments/${assessmentId}/`, data);
    return res.data;
  },

  adminCreateAssessment: async (data: {
    internship: number;
    title: string;
    description?: string;
    duration_minutes?: number;
    total_marks?: number;
    passing_percentage?: number;
    instructions?: string;
    is_published?: boolean;
  }) => {
    const res = await api.post('/internships/assessments/', data);
    return res.data;
  },

  adminSaveProgram: async (program: Partial<InternshipProgram>) => {
    if (program.slug) {
      const res = await api.patch<InternshipProgram>(`/internships/programs/${program.slug}/`, program);
      return res.data;
    } else {
      const res = await api.post<InternshipProgram>('/internships/programs/', program);
      return res.data;
    }
  },

  adminTogglePublishProgram: async (slug: string) => {
    const res = await api.post<{ status: string; is_published: boolean }>(
      `/internships/programs/${slug}/toggle-publish/`
    );
    return res.data;
  }
};
