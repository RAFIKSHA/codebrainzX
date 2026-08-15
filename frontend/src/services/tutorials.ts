import api, { publicApi } from './api';

// Types
export interface TutorialLanguage {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  banner?: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: string;
  display_order: number;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  lessons_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TutorialChapter {
  id: number;
  language: number;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface TutorialLessonBlock {
  id: number;
  lesson: number;
  block_type: string;
  content: string;
  display_order: number;
  data: Record<string, any>;
}

export interface TutorialQuizQuestion {
  id: number;
  quiz: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  display_order: number;
}

export interface TutorialQuiz {
  id: number;
  lesson: number;
  title: string;
  display_order: number;
  questions?: TutorialQuizQuestion[];
}

export interface TutorialPracticeQuestion {
  id: number;
  lesson: number;
  question_type: 'mcq' | 'fill_in_the_blank' | 'output_prediction' | 'coding';
  question_text: string;
  code_snippet?: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  display_order: number;
}

export interface TutorialLessonResource {
  id: number;
  lesson: number;
  name: string;
  resource_type: string;
  url: string;
  display_order: number;
}

export interface TutorialLesson {
  id: number;
  language: number;
  chapter: number;
  chapter_name?: string;
  title: string;
  slug: string;
  content?: string;
  code_example?: string;
  code_output?: string;
  code_explanation?: string;
  estimated_reading_time: number;
  display_order: number;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publish_date?: string;
  tags?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  blocks?: TutorialLessonBlock[];
  quizzes?: TutorialQuiz[];
  practices?: TutorialPracticeQuestion[];
  resources?: TutorialLessonResource[];
}

export interface TutorialMedia {
  id: number;
  title: string;
  file: string;
  media_type: string;
  uploaded_at: string;
}

export interface TutorialAdminAnalytics {
  total_languages: number;
  total_chapters: number;
  total_lessons: number;
  published_lessons: number;
  draft_lessons: number;
  avg_reading_time: number;
  most_viewed_lessons: Array<{
    lesson_id: number;
    title: string;
    language: string;
    views: number;
    avg_reading_time: number;
  }>;
  top_languages: Array<{
    name: string;
    views: number;
  }>;
}

// Client services
export const tutorialsService = {
  // --- Public APIs ---
  getLanguages: async () => {
    const res = await publicApi.get<TutorialLanguage[]>('/tutorials/languages/');
    return res.data;
  },

  getChapters: async (params: { language?: number; language_slug?: string }) => {
    const res = await publicApi.get<TutorialChapter[]>('/tutorials/chapters/', { params });
    return res.data;
  },

  getLessons: async (params: { language?: number; language_slug?: string; chapter?: number }) => {
    const res = await publicApi.get<TutorialLesson[]>('/tutorials/lessons/', { params });
    return res.data;
  },

  getLessonDetail: async (id: number) => {
    const res = await publicApi.get<TutorialLesson>(`/tutorials/lessons/${id}/`);
    return res.data;
  },

  lookupLesson: async (languageSlug: string, lessonSlug: string) => {
    const res = await publicApi.get<TutorialLesson>('/tutorials/lessons/lookup/', {
      params: { language_slug: languageSlug, lesson_slug: lessonSlug },
    });
    return res.data;
  },

  trackLessonView: async (lessonId: number, readingTimeSeconds: number) => {
    const res = await publicApi.post(`/tutorials/lessons/${lessonId}/view/`, {
      reading_time: readingTimeSeconds,
    });
    return res.data;
  },

  getUserProgress: async () => {
    const res = await api.get<{ completed_slugs: string[]; last_accessed: any }>('/tutorials/lessons/user-progress/');
    return res.data;
  },

  completeLesson: async (lessonId: number, completed: boolean = true) => {
    const res = await api.post<{ completed: boolean }>(`/tutorials/lessons/${lessonId}/complete/`, { completed });
    return res.data;
  },

  getContinueLearning: async () => {
    const res = await api.get<{
      course_name: string;
      course_slug: string;
      chapter_name: string;
      lesson_title: string;
      lesson_slug: string;
      progress_percent: number;
      completed_lessons: number;
      total_lessons: number;
      last_accessed: string;
    }>('/tutorials/lessons/continue-learning/');
    return res.data;
  },

  // --- Admin CRUD APIs ---
  // Languages
  adminGetLanguages: async () => {
    const res = await api.get<TutorialLanguage[]>('/tutorials/languages/');
    return res.data;
  },
  createLanguage: async (data: Partial<TutorialLanguage>) => {
    const res = await api.post<TutorialLanguage>('/tutorials/languages/', data);
    return res.data;
  },
  updateLanguage: async (id: number, data: Partial<TutorialLanguage>) => {
    const res = await api.put<TutorialLanguage>(`/tutorials/languages/${id}/`, data);
    return res.data;
  },
  deleteLanguage: async (id: number) => {
    await api.delete(`/tutorials/languages/${id}/`);
  },
  reorderLanguages: async (orderIds: number[]) => {
    await api.post('/tutorials/languages/reorder/', { order: orderIds });
  },

  // Chapters
  adminGetChapters: async (params?: { language?: number }) => {
    const res = await api.get<TutorialChapter[]>('/tutorials/chapters/', { params });
    return res.data;
  },
  createChapter: async (data: Partial<TutorialChapter>) => {
    const res = await api.post<TutorialChapter>('/tutorials/chapters/', data);
    return res.data;
  },
  updateChapter: async (id: number, data: Partial<TutorialChapter>) => {
    const res = await api.put<TutorialChapter>(`/tutorials/chapters/${id}/`, data);
    return res.data;
  },
  deleteChapter: async (id: number) => {
    await api.delete(`/tutorials/chapters/${id}/`);
  },
  reorderChapters: async (orderIds: number[]) => {
    await api.post('/tutorials/chapters/reorder/', { order: orderIds });
  },

  // Lessons
  adminGetLessons: async (params?: { language?: number; chapter?: number }) => {
    const res = await api.get<TutorialLesson[]>('/tutorials/lessons/', { params });
    return res.data;
  },
  createLesson: async (data: Partial<TutorialLesson>) => {
    const res = await api.post<TutorialLesson>('/tutorials/lessons/', data);
    return res.data;
  },
  updateLesson: async (id: number, data: Partial<TutorialLesson>) => {
    const res = await api.put<TutorialLesson>(`/tutorials/lessons/${id}/`, data);
    return res.data;
  },
  deleteLesson: async (id: number) => {
    await api.delete(`/tutorials/lessons/${id}/`);
  },
  reorderLessons: async (orderIds: number[]) => {
    await api.post('/tutorials/lessons/reorder/', { order: orderIds });
  },

  // Blocks
  createBlock: async (data: Partial<TutorialLessonBlock>) => {
    const res = await api.post<TutorialLessonBlock>('/tutorials/blocks/', data);
    return res.data;
  },
  updateBlock: async (id: number, data: Partial<TutorialLessonBlock>) => {
    const res = await api.put<TutorialLessonBlock>(`/tutorials/blocks/${id}/`, data);
    return res.data;
  },
  deleteBlock: async (id: number) => {
    await api.delete(`/tutorials/blocks/${id}/`);
  },

  // Quizzes
  createQuiz: async (data: Partial<TutorialQuiz>) => {
    const res = await api.post<TutorialQuiz>('/tutorials/quizzes/', data);
    return res.data;
  },
  updateQuiz: async (id: number, data: Partial<TutorialQuiz>) => {
    const res = await api.put<TutorialQuiz>(`/tutorials/quizzes/${id}/`, data);
    return res.data;
  },
  deleteQuiz: async (id: number) => {
    await api.delete(`/tutorials/quizzes/${id}/`);
  },

  // Quiz Questions
  createQuizQuestion: async (data: Partial<TutorialQuizQuestion>) => {
    const res = await api.post<TutorialQuizQuestion>('/tutorials/quiz-questions/', data);
    return res.data;
  },
  updateQuizQuestion: async (id: number, data: Partial<TutorialQuizQuestion>) => {
    const res = await api.put<TutorialQuizQuestion>(`/tutorials/quiz-questions/${id}/`, data);
    return res.data;
  },
  deleteQuizQuestion: async (id: number) => {
    await api.delete(`/tutorials/quiz-questions/${id}/`);
  },

  // Practice Questions
  createPracticeQuestion: async (data: Partial<TutorialPracticeQuestion>) => {
    const res = await api.post<TutorialPracticeQuestion>('/tutorials/practices/', data);
    return res.data;
  },
  updatePracticeQuestion: async (id: number, data: Partial<TutorialPracticeQuestion>) => {
    const res = await api.put<TutorialPracticeQuestion>(`/tutorials/practices/${id}/`, data);
    return res.data;
  },
  deletePracticeQuestion: async (id: number) => {
    await api.delete(`/tutorials/practices/${id}/`);
  },

  // Resources
  createResource: async (data: Partial<TutorialLessonResource>) => {
    const res = await api.post<TutorialLessonResource>('/tutorials/resources/', data);
    return res.data;
  },
  updateResource: async (id: number, data: Partial<TutorialLessonResource>) => {
    const res = await api.put<TutorialLessonResource>(`/tutorials/resources/${id}/`, data);
    return res.data;
  },
  deleteResource: async (id: number) => {
    await api.delete(`/tutorials/resources/${id}/`);
  },

  // Media
  getMedia: async () => {
    const res = await api.get<TutorialMedia[]>('/tutorials/media/');
    return res.data;
  },
  uploadMedia: async (file: File, title: string, mediaType: string = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('media_type', mediaType);
    const res = await api.post<TutorialMedia>('/tutorials/media/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  deleteMedia: async (id: number) => {
    await api.delete(`/tutorials/media/${id}/`);
  },

  // Analytics
  getAdminAnalytics: async () => {
    const res = await api.get<TutorialAdminAnalytics>('/tutorials/admin/analytics/');
    return res.data;
  },
};
