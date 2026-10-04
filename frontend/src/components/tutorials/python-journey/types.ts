export type ConceptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED';

export type CategoryKey = 
  | 'foundation' 
  | 'control-flow'
  | 'data-structures' 
  | 'functions' 
  | 'oop' 
  | 'advanced' 
  | 'dsa';

export interface ConceptCategory {
  id: CategoryKey;
  number: string; // e.g. "01"
  name: string; // e.g. "LEVEL 1 — Python Foundations"
  title: string; // e.g. "Build the core foundation of Python"
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
}

export interface LessonSection {
  id: string; // Anchor ID for table of contents
  title: string;
  subtitle?: string;
  content: string; // Markdown or rich HTML text
  callout?: {
    type: 'analogy' | 'tip' | 'note' | 'warning' | 'info';
    title: string;
    text: string;
  };
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  cards?: Array<{
    title: string;
    description: string;
    tag?: string;
    icon?: string;
  }>;
}

export interface CodeBlockExample {
  language: string;
  code: string;
  output: string;
  explanation?: string;
  howItWorks?: string[];
}

export interface CommonMistakeItem {
  mistake: string;
  badCode?: string;
  goodCode?: string;
  explanation: string;
}

export interface PracticeProblem {
  id: string;
  order: number;
  title: string;
  subtopic: string;
  difficulty: 'Basic' | 'Easy' | 'Medium';
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints?: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  approach?: string;
  starterCode: {
    python: string;
  };
  solutionCode?: string;
  testCases: Array<{
    input_data: string;
    expected_output: string;
    is_hidden?: boolean;
  }>;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'output_prediction' | 'find_error' | 'true_false';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MiniProject {
  id: string;
  title: string;
  level: string;
  description: string;
  inputs: string[];
  outputFormat: string;
  starterCode: string;
  solutionCode: string;
  keyConcepts: string[];
}

export interface FinalAssessment {
  id: string;
  title: string;
  level: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
}

export interface PythonLesson {
  id: string; // slug e.g. 'introduction-to-python', 'variables'
  lessonNumber: string; // e.g. '1.1', '1.2'
  title: string; // e.g. "Introduction to Python"
  chapterName: string; // e.g. "Level 1 — Python Foundations"
  chapterNumber: number; // 1
  category: CategoryKey;
  readingTime: string; // e.g. "10 min read"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  introduction: string; // Short intro paragraph
  learningObjectives: string[]; // List of bullet points
  sections: LessonSection[];
  codeExample: CodeBlockExample;
  commonMistakes?: CommonMistakeItem[];
  keyPoints: string[];
  practiceProblems: PracticeProblem[];
  quizzes: QuizQuestion[];
  miniProject?: MiniProject;
  relatedTopics: Array<{
    id: string;
    title: string;
    chapterName: string;
    readingTime: string;
  }>;
  prevLessonId?: string;
  nextLessonId?: string;
}

export interface CourseCurriculumLevel {
  levelNumber: number;
  name: string;
  slug: string;
  description: string;
  lessons: Array<{
    id: string;
    lessonNumber: string;
    title: string;
    readingTime: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  }>;
}
