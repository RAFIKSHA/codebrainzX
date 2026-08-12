import api from './api';

export interface GamificationProfile {
  id: number;
  username: string;
  xp: number;
  coins: number;
  level: number;
  daily_streak: number;
  weekly_streak: number;
  badges: Array<{
    id: number;
    badge_name: string;
    badge_type: string;
    icon_name: string;
    unlocked_at: string;
  }>;
}

export interface AptitudeTrainer {
  id: number;
  name: string;
  slug: string;
  specialization: string;
  bio: string;
  profile_image: string | null;
  is_active: boolean;
  question_count: number;
  topic_count: number;
  category_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface AptitudeTrainerDetail extends AptitudeTrainer {
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    total_questions: number;
    topics: Array<{
      id: number;
      name: string;
      slug: string;
      description: string;
      question_count: number;
      sub_topics: Array<{ id: number; name: string; slug: string }>;
    }>;
  }>;
  user_stats: {
    questions_attempted: number;
    correct_answers: number;
    accuracy: number;
    total_questions: number;
  };
}

export interface AptitudeDashboardData {
  gamification: GamificationProfile;
  stats: {
    total_attempts: number;
    avg_accuracy: number;
    bookmarks_count: number;
    wrong_questions_count: number;
  };
  pending_attempt: {
    attempt_id: number;
    test_id: number;
    test_title: string;
    current_question_index: number;
    started_at: string;
  } | null;
  weak_areas: Array<{ id: number; name: string; accuracy: number; total: number }>;
  strong_areas: Array<{ id: number; name: string; accuracy: number; total: number }>;
  trainers?: AptitudeTrainer[];
}

export interface AptitudeSubTopic {
  id: number;
  topic: number;
  name: string;
  slug: string;
}

export interface AptitudeTopic {
  id: number;
  category: number;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  sub_topics: AptitudeSubTopic[];
}

export interface AptitudeCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  topics: AptitudeTopic[];
}

export interface AptitudeQuestion {
  id: number;
  topic: number;
  category_name?: string;
  topic_name: string;
  sub_topic: number | null;
  sub_topic_name: string;
  trainer?: number | null;
  trainer_name?: string;
  title: string;
  slug: string;
  statement: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_type: string;
  options: Array<{ key: string; text: string }>;
  correct_answer?: string[];
  explanation?: string;
  shortcut_trick?: string;
  hint?: string;
  marks: number;
  negative_marks: number;
  time_limit: number;
  company_tags: string[];
  university_tags: string[];
  source: string;
  status: string;
  visibility: string;
  version: number;
  parent: number | null;
  created_at?: string;
  image_url?: string;
  sub_questions?: AptitudeQuestion[];
}

export interface AptitudeTest {
  id: number;
  title: string;
  description: string;
  test_type: 'practice' | 'mock' | 'company' | 'university' | 'daily_challenge' | 'weekly_challenge';
  overall_duration: number;
  section_timer: boolean;
  pass_percentage: number;
  negative_marking: boolean;
  calculator_enabled: boolean;
  company_tags: string[];
  university_tags: string[];
  is_published: boolean;
  sections: Array<{ id: number; name: string; duration: number; order: number }>;
  question_count: number;
  total_marks: number;
}

export interface AptitudeAttemptPayload {
  attempt: {
    id: number;
    test: number;
    test_title: string;
    test_type: string;
    status: string;
    started_at: string;
    completed_at: string | null;
    current_question_index: number;
    current_section: number | null;
  };
  questions: Array<AptitudeQuestion & { section_id: number | null; section_name: string }>;
  responses: Record<number, {
    selected_options: string[];
    is_marked_for_review: boolean;
    is_answered: boolean;
    time_spent: number;
  }>;
  time_left_seconds: number;
}

const aptitudeService = {
  getDashboard: async () => {
    const response = await api.get<AptitudeDashboardData>('/aptitude/dashboard/');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get<AptitudeCategory[]>('/aptitude/categories/');
    return response.data;
  },

  getQuestions: async (params?: Record<string, any>) => {
    const response = await api.get<AptitudeQuestion[]>('/aptitude/questions/', { params });
    return response.data;
  },

  getQuestion: async (id: number) => {
    const response = await api.get<AptitudeQuestion>(`/aptitude/questions/${id}/`);
    return response.data;
  },

  createQuestion: async (data: Partial<AptitudeQuestion>) => {
    const response = await api.post<AptitudeQuestion>('/aptitude/questions/', data);
    return response.data;
  },

  updateQuestion: async (id: number, data: Partial<AptitudeQuestion>) => {
    const response = await api.put<AptitudeQuestion>(`/aptitude/questions/${id}/`, data);
    return response.data;
  },

  deleteQuestion: async (id: number) => {
    await api.delete(`/aptitude/questions/${id}/`);
  },

  cloneQuestion: async (id: number) => {
    const response = await api.post<AptitudeQuestion>(`/aptitude/questions/${id}/clone/`);
    return response.data;
  },

  archiveQuestion: async (id: number) => {
    const response = await api.post(`/aptitude/questions/${id}/archive/`);
    return response.data;
  },

  getQuestionHistory: async (id: number) => {
    const response = await api.get(`/aptitude/questions/${id}/history/`);
    return response.data;
  },

  bookmarkQuestion: async (id: number) => {
    const response = await api.post<{ bookmarked: boolean; message: string }>(`/aptitude/questions/${id}/bookmark/`);
    return response.data;
  },

  importQuestionsCsv: async (formData: FormData) => {
    const response = await api.post('/aptitude/questions/import-csv/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getTests: async (params?: Record<string, any>) => {
    const response = await api.get<AptitudeTest[]>('/aptitude/tests/', { params });
    return response.data;
  },

  createTest: async (data: Partial<AptitudeTest>) => {
    const response = await api.post<AptitudeTest>('/aptitude/tests/', data);
    return response.data;
  },

  updateTest: async (id: number, data: Partial<AptitudeTest>) => {
    const response = await api.put<AptitudeTest>(`/aptitude/tests/${id}/`, data);
    return response.data;
  },

  startTest: async (testId: number) => {
    const response = await api.post<AptitudeAttemptPayload>('/aptitude/attempts/start/', { test_id: testId });
    return response.data;
  },

  saveAnswer: async (attemptId: number, data: {
    question_id: number;
    selected_options: string[];
    is_marked_for_review: boolean;
    is_answered: boolean;
    time_spent: number;
    current_question_index: number;
    current_section_id?: number | null;
  }) => {
    const response = await api.post(`/aptitude/attempts/${attemptId}/save-answer/`, data);
    return response.data;
  },

  submitTest: async (attemptId: number) => {
    const response = await api.post(`/aptitude/attempts/${attemptId}/submit/`);
    return response.data;
  },

  getTestResults: async (attemptId: number) => {
    const response = await api.get(`/aptitude/attempts/${attemptId}/results/`);
    return response.data;
  },

  getLeaderboard: async (period = 'overall') => {
    const response = await api.get('/aptitude/gamification/leaderboard/', { params: { period } });
    return response.data;
  },

  getWrongQuestions: async () => {
    const response = await api.get<AptitudeQuestion[]>('/aptitude/gamification/wrong-questions/');
    return response.data;
  },

  getAiRecommend: async () => {
    const response = await api.get<AptitudeQuestion[]>('/aptitude/gamification/ai-recommend/');
    return response.data;
  },

  createCategory: async (data: Partial<AptitudeCategory>) => {
    const response = await api.post<AptitudeCategory>('/aptitude/categories/', data);
    return response.data;
  },
  updateCategory: async (id: number, data: Partial<AptitudeCategory>) => {
    const response = await api.put<AptitudeCategory>(`/aptitude/categories/${id}/`, data);
    return response.data;
  },
  deleteCategory: async (id: number) => {
    await api.delete(`/aptitude/categories/${id}/`);
  },
  reorderCategories: async (orders: Array<{ id: number; order: number }>) => {
    const response = await api.post('/aptitude/categories/reorder/', { orders });
    return response.data;
  },

  createTopic: async (data: Partial<AptitudeTopic>) => {
    const response = await api.post<AptitudeTopic>('/aptitude/topics/', data);
    return response.data;
  },
  updateTopic: async (id: number, data: Partial<AptitudeTopic>) => {
    const response = await api.put<AptitudeTopic>(`/aptitude/topics/${id}/`, data);
    return response.data;
  },
  deleteTopic: async (id: number) => {
    await api.delete(`/aptitude/topics/${id}/`);
  },
  reorderTopics: async (orders: Array<{ id: number; order: number }>) => {
    const response = await api.post('/aptitude/topics/reorder/', { orders });
    return response.data;
  },

  createSubTopic: async (data: Partial<AptitudeSubTopic>) => {
    const response = await api.post<AptitudeSubTopic>('/aptitude/subtopics/', data);
    return response.data;
  },
  updateSubTopic: async (id: number, data: Partial<AptitudeSubTopic>) => {
    const response = await api.put<AptitudeSubTopic>(`/aptitude/subtopics/${id}/`, data);
    return response.data;
  },
  deleteSubTopic: async (id: number) => {
    await api.delete(`/aptitude/subtopics/${id}/`);
  },
  reorderSubTopics: async (orders: Array<{ id: number; order: number }>) => {
    const response = await api.post('/aptitude/subtopics/reorder/', { orders });
    return response.data;
  },
  
  deleteTest: async (id: number) => {
    await api.delete(`/aptitude/tests/${id}/`);
  },

  // Trainer Management API
  getTrainers: async (activeOnly?: boolean) => {
    const response = await api.get<AptitudeTrainer[]>('/aptitude/trainers/', {
      params: activeOnly ? { active: 'true' } : undefined
    });
    return response.data;
  },

  getTrainerProfile: async (id: number) => {
    const response = await api.get<AptitudeTrainerDetail>(`/aptitude/trainers/${id}/profile/`);
    return response.data;
  },

  createTrainer: async (data: Partial<AptitudeTrainer>) => {
    const response = await api.post<AptitudeTrainer>('/aptitude/trainers/', data);
    return response.data;
  },

  updateTrainer: async (id: number, data: Partial<AptitudeTrainer>) => {
    const response = await api.put<AptitudeTrainer>(`/aptitude/trainers/${id}/`, data);
    return response.data;
  },

  deleteTrainer: async (id: number) => {
    await api.delete(`/aptitude/trainers/${id}/`);
  },

  uploadTrainerImage: async (file: File): Promise<{ url: string; name: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string; name: string }>('/aptitude/trainers/upload-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default aptitudeService;
