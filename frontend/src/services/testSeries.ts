import api from './api';

export interface TestSeriesCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  type: 'coding' | 'aptitude';
  display_order: number;
  is_active: boolean;
}

export interface TestSeriesCompany {
  id: number;
  name: string;
  logo_url: string;
  slug: string;
  description: string;
  website?: string;
  is_active: boolean;
  display_order: number;
  coding_series_count: number;
  aptitude_series_count: number;
  total_tests_count: number;
}

export interface TestSeries {
  id: number;
  company: number;
  company_name: string;
  company_slug: string;
  category: number;
  category_name: string;
  category_type: 'coding' | 'aptitude';
  name: string;
  slug: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail_url: string;
  validity_days: number;
  is_published: boolean;
  display_order: number;
  tests_count: number;
  questions_count: number;
  total_duration_minutes: number;
  attempts_count: number;
  best_score: number | null;
}

export interface IndividualTest {
  id: number;
  series: number;
  name: string;
  slug: string;
  test_number: number;
  description: string;
  duration_minutes: number;
  marks: number;
  negative_marking: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string;
  is_published: boolean;
  attempts_count: number;
  best_score: number | null;
  attempt_status: 'not_attempted' | 'in_progress' | 'completed';
  questions_count: number;
  coding_questions?: number[];
  aptitude_questions?: number[];
}

export interface TestAttempt {
  id: number;
  user: number;
  user_details?: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  test: number;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed';
  score: number;
  max_score: number;
  accuracy: number;
  time_spent: number;
  total_questions: number;
  attempted_questions: number;
  correct_questions: number;
  wrong_questions: number;
  skipped_questions: number;
  test_details: IndividualTest;
  responses: any[];
}

const testSeriesService = {
  // Category operations
  getCategories: async () => {
    const res = await api.get<TestSeriesCategory[]>('/test-series/categories/');
    return res.data;
  },
  createCategory: async (data: Partial<TestSeriesCategory>) => {
    const res = await api.post<TestSeriesCategory>('/test-series/categories/', data);
    return res.data;
  },
  updateCategory: async (id: number, data: Partial<TestSeriesCategory>) => {
    const res = await api.put<TestSeriesCategory>(`/test-series/categories/${id}/`, data);
    return res.data;
  },
  deleteCategory: async (id: number) => {
    await api.delete(`/test-series/categories/${id}/`);
  },
  reorderCategories: async (order: number[]) => {
    const res = await api.post('/test-series/categories/reorder/', { order });
    return res.data;
  },

  // Company operations
  getCompanies: async () => {
    const res = await api.get<TestSeriesCompany[]>('/test-series/companies/');
    return res.data;
  },
  createCompany: async (data: Partial<TestSeriesCompany>) => {
    const res = await api.post<TestSeriesCompany>('/test-series/companies/', data);
    return res.data;
  },
  updateCompany: async (id: number, data: Partial<TestSeriesCompany>) => {
    const res = await api.put<TestSeriesCompany>(`/test-series/companies/${id}/`, data);
    return res.data;
  },
  deleteCompany: async (id: number) => {
    await api.delete(`/test-series/companies/${id}/`);
  },
  reorderCompanies: async (order: number[]) => {
    const res = await api.post('/test-series/companies/reorder/', { order });
    return res.data;
  },

  // Test Series operations
  getSeriesList: async (params?: Record<string, any>) => {
    const res = await api.get<TestSeries[]>('/test-series/series/', { params });
    return res.data;
  },
  getSeriesDetail: async (id: number) => {
    const res = await api.get<TestSeries>(`/test-series/series/${id}/`);
    return res.data;
  },
  createSeries: async (data: Partial<TestSeries>) => {
    const res = await api.post<TestSeries>('/test-series/series/', data);
    return res.data;
  },
  updateSeries: async (id: number, data: Partial<TestSeries>) => {
    const res = await api.put<TestSeries>(`/test-series/series/${id}/`, data);
    return res.data;
  },
  deleteSeries: async (id: number) => {
    await api.delete(`/test-series/series/${id}/`);
  },
  reorderSeries: async (order: number[]) => {
    const res = await api.post('/test-series/series/reorder/', { order });
    return res.data;
  },
  cloneSeries: async (id: number) => {
    const res = await api.post<TestSeries>(`/test-series/series/${id}/clone/`);
    return res.data;
  },

  // Individual Test operations
  getTests: async (params?: Record<string, any>) => {
    const res = await api.get<IndividualTest[]>('/test-series/tests/', { params });
    return res.data;
  },
  getTestDetail: async (id: number) => {
    const res = await api.get<IndividualTest>(`/test-series/tests/${id}/`);
    return res.data;
  },
  createTest: async (data: Partial<IndividualTest>) => {
    const res = await api.post<IndividualTest>('/test-series/tests/', data);
    return res.data;
  },
  updateTest: async (id: number, data: Partial<IndividualTest>) => {
    const res = await api.put<IndividualTest>(`/test-series/tests/${id}/`, data);
    return res.data;
  },
  deleteTest: async (id: number) => {
    await api.delete(`/test-series/tests/${id}/`);
  },
  reorderTests: async (order: number[]) => {
    const res = await api.post('/test-series/tests/reorder/', { order });
    return res.data;
  },
  cloneTest: async (id: number) => {
    const res = await api.post<IndividualTest>(`/test-series/tests/${id}/clone/`);
    return res.data;
  },

  // Attempt actions
  startTest: async (testId: number) => {
    const res = await api.post<{
      attempt: TestAttempt;
      questions: any[];
      responses: Record<number, any>;
      time_left_seconds: number;
    }>('/test-series/attempts/start/', { test_id: testId });
    return res.data;
  },
  saveAnswer: async (attemptId: number, data: {
    question_id: number;
    selected_options?: string[];
    code?: string;
    language_slug?: string;
    is_marked_for_review?: boolean;
    is_answered?: boolean;
    time_spent: number;
  }) => {
    const res = await api.post(`/test-series/attempts/${attemptId}/save-answer/`, data);
    return res.data;
  },
  submitTest: async (attemptId: number) => {
    const res = await api.post<TestAttempt>(`/test-series/attempts/${attemptId}/submit/`);
    return res.data;
  },
  getAttempt: async (attemptId: number) => {
    const res = await api.get<TestAttempt>(`/test-series/attempts/${attemptId}/`);
    return res.data;
  }
};

export default testSeriesService;
