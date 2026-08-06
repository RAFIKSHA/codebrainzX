import React, { useEffect, useState, useRef, Component } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../../services/api';
import { setSEOMetadata } from '../../utils/seo';
import { useTheme } from '../../context/ThemeContext';
import { 
  Plus, Trash2, Edit3, CheckCircle, Database, Users, 
  FileCode, Layers, Play, Loader2, ArrowLeft, Copy, Upload, 
  ArrowUp, ArrowDown, X, Check, AlertCircle,
  Trophy, BookOpen, Bot, Settings, Brain, LayoutDashboard, Briefcase, CheckSquare
} from 'lucide-react';
import AptitudeAdminPanel from './AptitudeAdminPanel';
import HackathonAdminPanel from './HackathonAdminPanel';

// Error boundary to catch AptitudeAdminPanel crashes and display the error
class AptitudeErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('[AptitudeAdminPanel Error]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, background: '#1e1e2e', color: '#f38ba8', borderRadius: 12, margin: 16, fontFamily: 'monospace' }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>⚠️ AptitudeAdminPanel Crash</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#cba6f7' }}>{this.state.error?.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#a6e3a1', marginTop: 8 }}>{this.state.error?.stack}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ marginTop: 16, padding: '8px 16px', background: '#313244', color: '#cdd6f4', borderRadius: 8, cursor: 'pointer', border: 'none' }}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string;
  order: number;
}


interface Question {
  id: number;
  topic: number;
  topic_name: string;
  level: number;
  level_name: string;
  title: string;
  slug: string;
  time_limit: number;
  memory_limit: number;
  is_published: boolean;
  order: number;
  test_cases_count: number;
  submissions_count: number;
  updated_at: string;
}

interface TestCase {
  id?: number;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
  weight: number;
}

interface Example {
  input: string;
  output: string;
  explanation: string;
}

const sectionConfigs: Record<string, {
  slug: string;
  name: string;
  icon: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'datetime' | 'options' | 'file';
    placeholder?: string;
    options?: { value: string; label: string }[];
    defaultValue?: any;
    required?: boolean;
  }[];
}> = {
  aptitude: {
    slug: 'aptitude',
    name: 'Aptitude',
    icon: 'Brain',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. Percentages', required: true },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: [
        { value: 'basic', label: 'Basic' },
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ], defaultValue: 'basic', required: true },
      { name: 'question', label: 'Question', type: 'textarea', placeholder: 'Enter aptitude question text...', required: true },
      { name: 'options', label: 'Options', type: 'options', defaultValue: ['', '', '', ''], required: true },
      { name: 'correct_answer', label: 'Correct Answer', type: 'text', placeholder: 'e.g. Option 1', required: true },
      { name: 'explanation', label: 'Explanation', type: 'textarea', placeholder: 'logical explanation...', required: true },
      { name: 'time_limit', label: 'Time Limit (seconds)', type: 'number', defaultValue: 60 },
      { name: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. numbers, math' }
    ]
  },
  interview: {
    slug: 'interview',
    name: 'Interview Preparation',
    icon: 'Briefcase',
    fields: [
      { name: 'category', label: 'Category', type: 'select', options: [
        { value: 'HR', label: 'HR' },
        { value: 'Technical', label: 'Technical' },
        { value: 'DBMS', label: 'DBMS' },
        { value: 'OS', label: 'OS' },
        { value: 'CN', label: 'CN' },
        { value: 'OOP', label: 'OOP' },
        { value: 'Java', label: 'Java' },
        { value: 'Python', label: 'Python' },
        { value: 'SQL', label: 'SQL' },
        { value: 'System Design', label: 'System Design' }
      ], defaultValue: 'Technical', required: true },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: [
        { value: 'basic', label: 'Basic' },
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ], defaultValue: 'easy', required: true },
      { name: 'question', label: 'Question / Topic', type: 'textarea', placeholder: 'e.g. Explain Polymorphism in Java.', required: true },
      { name: 'model_answer', label: 'Model Answer', type: 'textarea', placeholder: 'Write a comprehensive model answer...', required: true },
      { name: 'key_points', label: 'Key Points (comma separated)', type: 'textarea', placeholder: 'Key keywords the interviewer looks for...' },
      { name: 'tips', label: 'Tips for Candidate', type: 'textarea', placeholder: 'Tips on presenting the answer...' },
      { name: 'company_tags', label: 'Company Tags', type: 'text', placeholder: 'e.g. Google, Meta, Microsoft' }
    ]
  },
  mcq: {
    slug: 'mcq',
    name: 'MCQ Practice',
    icon: 'CheckSquare',
    fields: [
      { name: 'topic', label: 'Topic / Subject', type: 'text', placeholder: 'e.g. Database Indexing', required: true },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ], defaultValue: 'medium', required: true },
      { name: 'question', label: 'Question', type: 'textarea', placeholder: 'Enter question text...', required: true },
      { name: 'options', label: 'Options', type: 'options', defaultValue: ['', '', '', ''], required: true },
      { name: 'correct_answer', label: 'Correct Answer', type: 'text', placeholder: 'Enter correct option value', required: true },
      { name: 'explanation', label: 'Explanation', type: 'textarea' },
      { name: 'marks', label: 'Marks', type: 'number', defaultValue: 1 },
      { name: 'negative_marks', label: 'Negative Marks', type: 'number', defaultValue: 0 }
    ]
  },
  contests: {
    slug: 'contests',
    name: 'Contests',
    icon: 'Trophy',
    fields: [
      { name: 'contest_name', label: 'Contest Name', type: 'text', placeholder: 'Weekly Contest #12', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'start_time', label: 'Start Date & Time', type: 'datetime', required: true },
      { name: 'end_time', label: 'End Date & Time', type: 'datetime', required: true },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', defaultValue: 120, required: true },
      { name: 'contest_type', label: 'Contest Type', type: 'select', options: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' }
      ], defaultValue: 'public' },
      { name: 'question_selection', label: 'Question Selection (IDs comma separated)', type: 'text', placeholder: '1, 4, 12' },
      { name: 'visibility', label: 'Visibility', type: 'select', options: [
        { value: 'visible', label: 'Visible' },
        { value: 'hidden', label: 'Hidden' }
      ], defaultValue: 'visible' }
    ]
  },
  courses: {
    slug: 'courses',
    name: 'Courses',
    icon: 'BookOpen',
    fields: [
      { name: 'course_title', label: 'Course Title', type: 'text', placeholder: 'e.g. Master C++ Data Structures', required: true },
      { name: 'instructor', label: 'Instructor Name', type: 'text', defaultValue: 'Admin Instructor', required: true },
      { name: 'thumbnail', label: 'Thumbnail (Image URL/Attachment)', type: 'file' },
      { name: 'description', label: 'Course Description', type: 'textarea' },
      { name: 'modules', label: 'Number of Modules', type: 'number', defaultValue: 5 },
      { name: 'videos', label: 'Video Links list (JSON/URLs)', type: 'textarea', placeholder: 'https://youtube.com/...' },
      { name: 'notes_pdf', label: 'Notes (PDF URL/Attachment)', type: 'file' },
      { name: 'assignments', label: 'Assignments description', type: 'textarea' },
      { name: 'quiz', label: 'Quiz Questions count', type: 'number', defaultValue: 10 },
      { name: 'certificate_enabled', label: 'Certificate Enabled', type: 'checkbox', defaultValue: true }
    ]
  },
  'ai-practice': {
    slug: 'ai-practice',
    name: 'AI Practice',
    icon: 'Bot',
    fields: [
      { name: 'topic', label: 'AI Practice Topic', type: 'text', placeholder: 'e.g. Recursive Backtracking', required: true },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ], defaultValue: 'medium', required: true },
      { name: 'prompt', label: 'System Evaluator Prompt', type: 'textarea', placeholder: 'Instructions for the AI evaluator...', required: true },
      { name: 'expected_output', label: 'Expected Code/Response Output', type: 'textarea', required: true },
      { name: 'evaluation_criteria', label: 'Evaluation Criteria details', type: 'textarea' }
    ]
  }
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  
  // CMS Sidebar and view states
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'create-content' | 'aptitude' | 'categories' | 'topics' | 'levels' | 'users' | 'contests' | 'courses' | 'analytics' | 'settings' | 'hackathons'>('dashboard');
  const [selectedSection, setSelectedSection] = useState<string>('coding');
  
  // View states: 'list' | 'create' | 'edit-content'
  const [viewState, setViewState] = useState<'list' | 'create' | 'edit-content'>('list');
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({});

  // Form states: Topic
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicOrder, setTopicOrder] = useState(0);

  // Form states: Premium Question Form
  const [qTitle, setQTitle] = useState('');
  const [qSlug, setQSlug] = useState('');
  const [qTopicId, setQTopicId] = useState('');
  const [qLevelName, setQLevelName] = useState<'basic' | 'easy' | 'medium' | 'hard'>('basic');
  const [qStatement, setQStatement] = useState('');
  const [qConstraints, setQConstraints] = useState('');
  const [qInputFormat, setQInputFormat] = useState('');
  const [qOutputFormat, setQOutputFormat] = useState('');
  const [qNotes, setQNotes] = useState('');
  const [qOfficialSolution, setQOfficialSolution] = useState('');
  const [qEditorial, setQEditorial] = useState('');
  const [qHints, setQHints] = useState<{ hint: string }[]>([{ hint: '' }]);
  const [qTags, setQTags] = useState('');
  const [qCompanies, setQCompanies] = useState('');
  const [qTimeLimit, setQTimeLimit] = useState(2.0);
  const [qMemoryLimit, setQMemoryLimit] = useState(256.0);
  const [qPublished, setQPublished] = useState(false);
  const [qOrder, setQOrder] = useState(0);
  
  // SEO
  const [qMetaTitle, setQMetaTitle] = useState('');
  const [qMetaDescription, setQMetaDescription] = useState('');
  const [qMetaKeywords, setQMetaKeywords] = useState('');

  // Examples
  const [qExamples, setQExamples] = useState<Example[]>([
    { input: '', output: '', explanation: '' }
  ]);

  // Starter Code Tabs: active starter lang
  const [activeStarterLang, setActiveStarterLang] = useState<'python' | 'javascript' | 'java' | 'cpp' | 'c'>('python');
  const [qStarterCodes, setQStarterCodes] = useState<Record<string, string>>({
    python: "def solve(arr):\n    # Write python code here\n    pass",
    javascript: "function solve(arr) {\n    // Write javascript code here\n}",
    java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write java code here\n    }\n}",
    cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write cpp code here\n    return 0;\n}",
    c: "#include <stdio.h>\n\nint main() {\n    // Write c code here\n    return 0;\n}"
  });

  // Test Cases Array
  const [qTestCases, setQTestCases] = useState<TestCase[]>([
    { input_data: '', expected_output: '', is_hidden: false, weight: 1 }
  ]);

  // Redesigned Sidebar & Workspace States
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [pendingQuestionId, setPendingQuestionId] = useState<number | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'basic' | 'description' | 'starter_code' | 'testcases' | 'editorial'>('basic');
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [showPreviewPane, setShowPreviewPane] = useState(true);
  const [originalData, setOriginalData] = useState<string>('');

  // Filters & Sorting for questions list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterStatus] = useState('');
  const [sortField, setSortField] = useState<keyof Question>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Category section filters
  const [filterSection, setFilterSection] = useState<string>('all');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');

  // UI Utilities
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [bulkInputText, setBulkInputText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSEOMetadata({
      title: 'Admin Control Center | CodexPetra',
      description: 'Manage topic pathways, create coding challenges, set execution limits, and update grading test suites.',
    });
  }, []);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats/');
      return response.data;
    }
  });

  const { data: topics, isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ['adminTopics'],
    queryFn: async () => {
      const response = await api.get('/topics/');
      return response.data;
    }
  });

  const { data: sections } = useQuery<any[]>({
    queryKey: ['adminSections'],
    queryFn: async () => {
      const response = await api.get('/sections/');
      return response.data;
    }
  });

  const { data: contentItems } = useQuery<any[]>({
    queryKey: ['adminContentItems'],
    queryFn: async () => {
      const response = await api.get('/contentitems/');
      return response.data;
    }
  });

  const { data: usersList } = useQuery<any[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await api.get('/users/');
      return response.data;
    }
  });

  // Queries: Topic Specific Questions (Sidebar)
  const { data: topicQuestions } = useQuery<Question[]>({
    queryKey: ['topicQuestions', selectedTopicId],
    queryFn: async () => {
      if (!selectedTopicId) return [];
      const response = await api.get(`/topics/${selectedTopicId}/questions/`);
      return response.data;
    },
    enabled: !!selectedTopicId
  });

  // Auto-select first topic on load
  useEffect(() => {
    if (topics && topics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(topics[0].id.toString());
    }
  }, [topics, selectedTopicId]);

  // Load question specification details on question selection
  useEffect(() => {
    if (!selectedQuestionId) {
      return;
    }
    const loadQuestionData = async () => {
      try {
        const res = await api.get(`/questions/${selectedQuestionId}/`);
        const data = res.data;
        
        setQTitle(data.title || '');
        setQSlug(data.slug || '');
        setQTopicId(data.topic ? data.topic.toString() : '');
        setQLevelName(data.level_name || 'basic');
        setQStatement(data.statement || '');
        setQConstraints(data.constraints || '');
        setQInputFormat(data.input_format || '');
        setQOutputFormat(data.output_format || '');
        setQNotes(data.notes || '');
        setQOfficialSolution(data.official_solution || '');
        setQEditorial(data.editorial || '');
        setQTimeLimit(data.time_limit || 2.0);
        setQMemoryLimit(data.memory_limit || 256.0);
        setQPublished(data.is_published || false);
        setQOrder(data.order || 0);
        setQTags(data.tags || '');
        setQCompanies(data.companies || '');
        setQMetaTitle(data.meta_title || '');
        setQMetaDescription(data.meta_description || '');
        setQMetaKeywords(data.meta_keywords || '');

        if (data.examples) {
          try {
            const parsed = typeof data.examples === 'string' ? JSON.parse(data.examples) : data.examples;
            setQExamples(Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ input: '', output: '', explanation: '' }]);
          } catch (e) {
            setQExamples([{ input: '', output: '', explanation: '' }]);
          }
        } else {
          setQExamples([{ input: '', output: '', explanation: '' }]);
        }

        if (data.starter_code) {
          try {
            const parsed = typeof data.starter_code === 'string' ? JSON.parse(data.starter_code) : data.starter_code;
            setQStarterCodes({
              python: parsed.python || "def solve(arr):\n    # Write python code here\n    pass",
              javascript: parsed.javascript || "function solve(arr) {\n    // Write javascript code here\n}",
              java: parsed.java || "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write java code here\n    }\n}",
              cpp: parsed.cpp || "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write cpp code here\n    return 0;\n}",
              c: parsed.c || "#include <stdio.h>\n\nint main() {\n    // Write c code here\n    return 0;\n}"
            });
          } catch (e) {
            // fallback
          }
        }

        if (data.hints) {
          try {
            const parsed = typeof data.hints === 'string' ? JSON.parse(data.hints) : data.hints;
            setQHints(Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ hint: '' }]);
          } catch (e) {
            setQHints([{ hint: '' }]);
          }
        } else {
          setQHints([{ hint: '' }]);
        }

        if (data.test_cases) {
          setQTestCases(data.test_cases.length > 0 ? data.test_cases : [{ input_data: '', expected_output: '', is_hidden: false, weight: 1 }]);
        } else {
          setQTestCases([{ input_data: '', expected_output: '', is_hidden: false, weight: 1 }]);
        }

        const initialSnapshot = JSON.stringify({
          topic: data.topic || '',
          title: data.title || '',
          slug: data.slug || '',
          statement: data.statement || '',
          constraints: data.constraints || '',
          input_format: data.input_format || '',
          output_format: data.output_format || '',
          notes: data.notes || '',
          official_solution: data.official_solution || '',
          editorial: data.editorial || '',
          hints: data.hints || '[]',
          tags: data.tags || '',
          companies: data.companies || '',
          examples: data.examples || '[]',
          starter_code: data.starter_code || '{}',
          time_limit: data.time_limit || 2.0,
          memory_limit: data.memory_limit || 256.0,
          is_published: data.is_published || false,
          order: data.order || 0,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          meta_keywords: data.meta_keywords || '',
          test_cases: data.test_cases || []
        });
        setOriginalData(initialSnapshot);
        setIsDirty(false);
      } catch (err) {
        triggerToast('Failed to load question details', 'error');
      }
    };
    loadQuestionData();
  }, [selectedQuestionId]);

  const getFormStateSnapshot = () => {
    return JSON.stringify({
      topic: parseInt(qTopicId) || '',
      title: qTitle,
      slug: qSlug,
      statement: qStatement,
      constraints: qConstraints,
      input_format: qInputFormat,
      output_format: qOutputFormat,
      notes: qNotes,
      official_solution: qOfficialSolution,
      editorial: qEditorial,
      hints: JSON.stringify(qHints),
      tags: qTags,
      companies: qCompanies,
      examples: JSON.stringify(qExamples),
      starter_code: JSON.stringify(qStarterCodes),
      time_limit: qTimeLimit,
      memory_limit: qMemoryLimit,
      is_published: qPublished,
      order: qOrder,
      meta_title: qMetaTitle,
      meta_description: qMetaDescription,
      meta_keywords: qMetaKeywords,
      test_cases: qTestCases.filter(tc => tc.input_data.trim() || tc.expected_output.trim())
    });
  };

  // Automatically calculate isDirty based on baseline originalData
  useEffect(() => {
    if (selectedQuestionId !== null && originalData) {
      const current = getFormStateSnapshot();
      setIsDirty(current !== originalData);
    } else {
      setIsDirty(false);
    }
  }, [
    qTitle, qSlug, qTopicId, qLevelName, qStatement, qConstraints, qInputFormat,
    qOutputFormat, qNotes, qOfficialSolution, qEditorial, qHints, qTags,
    qCompanies, qExamples, qStarterCodes, qTimeLimit, qMemoryLimit, qPublished,
    qOrder, qMetaTitle, qMetaDescription, qMetaKeywords, qTestCases, originalData
  ]);

  // Autosave Engine: Runs every 20 seconds if form is dirty
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty && selectedQuestionId) {
        handleAutosave();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [isDirty, selectedQuestionId, qTitle, qTopicId, qLevelName, qStatement, qExamples, qStarterCodes, qOfficialSolution, qTestCases, qEditorial, qHints, qTags, qCompanies, qTimeLimit, qMemoryLimit, qPublished, qOrder, qMetaTitle, qMetaDescription, qMetaKeywords]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Keyboard Shortcuts: Ctrl + S / Cmd + S saves draft
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (selectedQuestionId) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedQuestionId, qTitle, qTopicId, qLevelName, qStatement, qExamples, qStarterCodes, qOfficialSolution, qTestCases, qEditorial, qHints, qTags, qCompanies, qTimeLimit, qMemoryLimit, qPublished, qOrder, qMetaTitle, qMetaDescription, qMetaKeywords]);

  // Auto-generate slug from title
  useEffect(() => {
    if (viewState === 'create' && !editingQuestionId) {
      const generated = qTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setQSlug(generated);
    }
  }, [qTitle, viewState, editingQuestionId]);

  // Show Toast Toast
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };


  // MUTATIONS: ContentItem CRUD
  const saveContentItemMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingContentId) {
        return api.put(`/contentitems/${editingContentId}/`, payload);
      }
      return api.post('/contentitems/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContentItems'] });
      triggerToast(editingContentId ? 'Content updated successfully!' : 'Content created successfully!');
      setViewState('list');
      setEditingContentId(null);
      setDynamicFormData({});
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data ? (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) : err.message;
      triggerToast(`Failed to save content: ${errorMsg}`, 'error');
    }
  });

  const deleteContentItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/contentitems/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContentItems'] });
      triggerToast('Content deleted successfully!', 'info');
    }
  });

  // MUTATIONS: Section CRUD
  const saveSectionMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/sections/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSections'] });
      triggerToast('Category created successfully!');
    }
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/sections/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSections'] });
      triggerToast('Category deleted successfully!');
    }
  });

  // MUTATIONS: User Role update
  const toggleUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: number; newRole: string }) => {
      return api.patch(`/users/${userId}/`, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      triggerToast('User role updated successfully!');
    },
    onError: () => {
      triggerToast('Failed to update user role', 'error');
    }
  });

  const { data: questions } = useQuery<Question[]>({
    queryKey: ['adminQuestions'],
    queryFn: async () => {
      const response = await api.get('/questions/');
      return response.data;
    }
  });

  // MUTATIONS: Topic
  const topicMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingTopic) {
        return api.put(`/topics/${editingTopic.id}/`, payload);
      }
      return api.post('/topics/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTopics'] });
      triggerToast(editingTopic ? 'Topic updated successfully!' : 'Topic created successfully!');
      setEditingTopic(null);
      setTopicName('');
      setTopicDesc('');
      setTopicOrder(0);
    }
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/topics/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTopics'] });
      triggerToast('Topic deleted successfully!', 'info');
    }
  });

  const saveQuestionMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedQuestionId) {
        const qRes = await api.put(`/questions/${selectedQuestionId}/`, payload);
        return qRes.data;
      } else {
        const qRes = await api.post('/questions/', payload);
        return qRes.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['topicQuestions', selectedTopicId] });
      triggerToast('Question saved successfully!');
      
      const updatedSnapshot = JSON.stringify({
        topic: data.topic || '',
        title: data.title || '',
        slug: data.slug || '',
        statement: data.statement || '',
        constraints: data.constraints || '',
        input_format: data.input_format || '',
        output_format: data.output_format || '',
        notes: data.notes || '',
        official_solution: data.official_solution || '',
        editorial: data.editorial || '',
        hints: data.hints || '[]',
        tags: data.tags || '',
        companies: data.companies || '',
        examples: data.examples || '[]',
        starter_code: data.starter_code || '{}',
        time_limit: data.time_limit || 2.0,
        memory_limit: data.memory_limit || 256.0,
        is_published: data.is_published || false,
        order: data.order || 0,
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        meta_keywords: data.meta_keywords || '',
        test_cases: data.test_cases || []
      });
      setOriginalData(updatedSnapshot);
      setIsDirty(false);

      if (!selectedQuestionId && data?.id) {
        setSelectedQuestionId(data.id);
      }
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data ? (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) : err.message;
      triggerToast(`Failed to save question: ${errorMsg}`, 'error');
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/questions/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['topicQuestions', selectedTopicId] });
      triggerToast('Question deleted successfully!', 'info');
      
      if (topicQuestions && topicQuestions.length > 1) {
        const remaining = topicQuestions.filter(q => q.id !== selectedQuestionId);
        if (remaining.length > 0) {
          setSelectedQuestionId(remaining[0].id);
        } else {
          setSelectedQuestionId(null);
          resetQuestionForm();
        }
      } else {
        setSelectedQuestionId(null);
        resetQuestionForm();
      }
    },
    onError: (err: any) => {
      triggerToast(`Delete failed: ${err.message}`, 'error');
    }
  });

  const handleAutosave = async () => {
    if (!selectedQuestionId || !qTitle || !qTopicId) return;
    
    setAutosaveStatus('saving');
    
    const payload = {
      topic: parseInt(qTopicId),
      title: qTitle,
      slug: qSlug,
      statement: qStatement,
      constraints: qConstraints,
      input_format: qInputFormat,
      output_format: qOutputFormat,
      notes: qNotes,
      official_solution: qOfficialSolution,
      editorial: qEditorial,
      hints: JSON.stringify(qHints),
      tags: qTags,
      companies: qCompanies,
      examples: JSON.stringify(qExamples),
      starter_code: JSON.stringify(qStarterCodes),
      time_limit: qTimeLimit,
      memory_limit: qMemoryLimit,
      is_published: qPublished,
      order: qOrder,
      meta_title: qMetaTitle,
      meta_description: qMetaDescription,
      meta_keywords: qMetaKeywords,
      test_cases: qTestCases.filter(tc => tc.input_data.trim() || tc.expected_output.trim())
    };

    try {
      const response = await api.put(`/questions/${selectedQuestionId}/`, payload);
      const updatedSnapshot = JSON.stringify({
        topic: response.data.topic || '',
        title: response.data.title || '',
        slug: response.data.slug || '',
        statement: response.data.statement || '',
        constraints: response.data.constraints || '',
        input_format: response.data.input_format || '',
        output_format: response.data.output_format || '',
        notes: response.data.notes || '',
        official_solution: response.data.official_solution || '',
        editorial: response.data.editorial || '',
        hints: response.data.hints || '[]',
        tags: response.data.tags || '',
        companies: response.data.companies || '',
        examples: response.data.examples || '[]',
        starter_code: response.data.starter_code || '{}',
        time_limit: response.data.time_limit || 2.0,
        memory_limit: response.data.memory_limit || 256.0,
        is_published: response.data.is_published || false,
        order: response.data.order || 0,
        meta_title: response.data.meta_title || '',
        meta_description: response.data.meta_description || '',
        meta_keywords: response.data.meta_keywords || '',
        test_cases: response.data.test_cases || []
      });
      setOriginalData(updatedSnapshot);
      queryClient.invalidateQueries({ queryKey: ['topicQuestions', selectedTopicId] });
      setAutosaveStatus('saved');
      setTimeout(() => setAutosaveStatus('idle'), 3000);
    } catch (err) {
      setAutosaveStatus('failed');
      setTimeout(() => setAutosaveStatus('idle'), 5000);
    }
  };



  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setSelectedQuestionId(null);
    setQTitle('');
    setQSlug('');
    setQTopicId('');
    setQLevelName('basic');
    setQStatement('');
    setQConstraints('');
    setQInputFormat('');
    setQOutputFormat('');
    setQNotes('');
    setQOfficialSolution('');
    setQEditorial('');
    setQTimeLimit(2.0);
    setQMemoryLimit(256.0);
    setQPublished(false);
    setQOrder(0);
    setQTags('');
    setQCompanies('');
    setQMetaTitle('');
    setQMetaDescription('');
    setQMetaKeywords('');
    setQExamples([{ input: '', output: '', explanation: '' }]);
    setQStarterCodes({
      python: "def solve(arr):\n    # Write python code here\n    pass",
      javascript: "function solve(arr) {\n    // Write javascript code here\n}",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write java code here\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write cpp code here\n    return 0;\n}",
      c: "#include <stdio.h>\n\nint main() {\n    // Write c code here\n    return 0;\n}"
    });
    setQHints([{ hint: '' }]);
    setQTestCases([{ input_data: '', expected_output: '', is_hidden: false, weight: 1 }]);
    setOriginalData('');
    setIsDirty(false);
  };

  const handleEditQuestion = async (q: Question) => {
    resetQuestionForm();
    setViewState('create');
    setSelectedSection('coding');
    setActiveMenu('create-content');
    if (q.topic) {
      setSelectedTopicId(q.topic.toString());
    }
    setSelectedQuestionId(q.id);
  };

  const handleSelectQuestion = (id: number) => {
    if (isDirty) {
      setPendingQuestionId(id);
      setShowUnsavedModal(true);
    } else {
      setSelectedQuestionId(id);
    }
  };

  const handleAddQuestion = () => {
    if (!selectedTopicId) {
      triggerToast('Please select a topic pathway before adding a question.', 'error');
      return;
    }
    resetQuestionForm();
    saveQuestionMutation.mutate({
      topic: parseInt(selectedTopicId),
      title: 'New Coding Question',
      slug: `new-coding-question-${Date.now()}`,
      statement: 'Problem statement goes here...',
      constraints: '',
      input_format: '',
      output_format: '',
      notes: '',
      official_solution: '',
      editorial: '',
      hints: '[]',
      tags: '',
      companies: '',
      examples: '[]',
      starter_code: JSON.stringify({
        python: "def solve(arr):\n    # Write python code here\n    pass",
        javascript: "function solve(arr) {\n    // Write javascript code here\n}",
        java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write java code here\n    }\n}",
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write cpp code here\n    return 0;\n}",
        c: "#include <stdio.h>\n\nint main() {\n    // Write c code here\n    return 0;\n}"
      }),
      time_limit: 2.0,
      memory_limit: 256.0,
      is_published: false,
      order: topicQuestions ? topicQuestions.length : 0,
      test_cases: []
    });
  };

  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    if (!topicQuestions) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === topicQuestions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const itemA = topicQuestions[index];
    const itemB = topicQuestions[targetIndex];

    try {
      await Promise.all([
        api.patch(`/questions/${itemA.id}/`, { order: itemB.order }),
        api.patch(`/questions/${itemB.id}/`, { order: itemA.order })
      ]);
      queryClient.invalidateQueries({ queryKey: ['topicQuestions', selectedTopicId] });
      triggerToast('Questions reordered successfully!');
    } catch (e) {
      triggerToast('Failed to reorder questions.', 'error');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (!sourceIndexStr || !topicQuestions) return;

    const sourceIndex = parseInt(sourceIndexStr);
    if (sourceIndex === targetIndex) return;

    const updated = [...topicQuestions];
    const [draggedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);

    try {
      await Promise.all(
        updated.map((q, idx) => api.patch(`/questions/${q.id}/`, { order: idx }))
      );
      queryClient.invalidateQueries({ queryKey: ['topicQuestions', selectedTopicId] });
      triggerToast('Questions reordered successfully!');
    } catch (err) {
      triggerToast('Reordering update failed.', 'error');
    }
  };

  const handleDuplicateQuestion = async (q: Question) => {
    try {
      const res = await api.get(`/questions/${q.id}/`);
      const src = res.data;
      
      const newPayload = {
        topic: src.topic,
        title: `${src.title} (Copy)`,
        statement: src.statement,
        constraints: src.constraints || '',
        input_format: src.input_format || '',
        output_format: src.output_format || '',
        notes: src.notes || '',
        official_solution: src.official_solution || '',
        editorial: src.editorial || '',
        hints: src.hints || '[]',
        tags: src.tags || '',
        companies: src.companies || '',
        examples: src.examples || '[]',
        starter_code: src.starter_code || '{}',
        time_limit: src.time_limit,
        memory_limit: src.memory_limit,
        is_published: false,
        order: src.order + 1,
        meta_title: src.meta_title || '',
        meta_description: src.meta_description || '',
        meta_keywords: src.meta_keywords || '',
        test_cases: src.test_cases.map((tc: any) => ({
          input_data: tc.input_data,
          expected_output: tc.expected_output,
          is_hidden: tc.is_hidden,
          weight: tc.weight || 1
        }))
      };

      const dupRes = await api.post('/questions/', newPayload);
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['topicQuestions', selectedTopicId] });
      triggerToast('Question duplicated successfully!');
      setSelectedQuestionId(dupRes.data.id);
    } catch (err) {
      triggerToast('Duplicate action failed', 'error');
    }
  };

  // EXAMPLES ACTION UTILITIES
  const addExample = () => {
    setQExamples([...qExamples, { input: '', output: '', explanation: '' }]);
    setIsDirty(true);
  };

  const updateExample = (index: number, key: keyof Example, value: string) => {
    const updated = [...qExamples];
    updated[index][key] = value;
    setQExamples(updated);
    setIsDirty(true);
  };

  const deleteExample = (index: number) => {
    const updated = qExamples.filter((_, i) => i !== index);
    setQExamples(updated.length > 0 ? updated : [{ input: '', output: '', explanation: '' }]);
    setIsDirty(true);
  };

  const reorderExample = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === qExamples.length - 1) return;
    
    const target = direction === 'up' ? index - 1 : index + 1;
    const updated = [...qExamples];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setQExamples(updated);
    setIsDirty(true);
  };

  // STARTER CODES ACTIONS
  const handleStarterCodeChange = (code: string) => {
    setQStarterCodes(prev => ({
      ...prev,
      [activeStarterLang]: code
    }));
    setIsDirty(true);
  };

  // TEST CASES TABLE UTILITIES
  const addTestCase = () => {
    setQTestCases([...qTestCases, { input_data: '', expected_output: '', is_hidden: false, weight: 1 }]);
    setIsDirty(true);
  };

  const updateTestCase = (index: number, key: keyof TestCase, value: any) => {
    const updated = [...qTestCases];
    updated[index] = { ...updated[index], [key]: value };
    setQTestCases(updated);
    setIsDirty(true);
  };

  const deleteTestCase = (index: number) => {
    const updated = qTestCases.filter((_, i) => i !== index);
    setQTestCases(updated.length > 0 ? updated : [{ input_data: '', expected_output: '', is_hidden: false, weight: 1 }]);
    setIsDirty(true);
  };

  const duplicateTestCase = (index: number) => {
    const target = qTestCases[index];
    const duplicated = {
      input_data: target.input_data,
      expected_output: target.expected_output,
      is_hidden: target.is_hidden,
      weight: target.weight
    };
    const updated = [...qTestCases];
    updated.splice(index + 1, 0, duplicated);
    setQTestCases(updated);
    setIsDirty(true);
  };

  // Bulk Paste Test Cases parser
  const handleBulkPaste = () => {
    if (!bulkInputText.trim()) return;
    // Format parses blocks starting with === input === and === output ===
    const blocks = bulkInputText.split(/=== input ===|=== input_data ===/i);
    const parsedCases: TestCase[] = [];

    for (const b of blocks) {
      if (!b.trim()) continue;
      const subParts = b.split(/=== output ===|=== expected_output ===/i);
      if (subParts.length >= 2) {
        parsedCases.push({
          input_data: subParts[0].trim(),
          expected_output: subParts[1].trim(),
          is_hidden: false,
          weight: 1
        });
      }
    }

    if (parsedCases.length > 0) {
      setQTestCases(prev => [...prev.filter(tc => tc.input_data.trim() !== ''), ...parsedCases]);
      triggerToast(`Successfully imported ${parsedCases.length} test cases!`);
      setBulkInputText('');
      setShowBulkModal(false);
      setIsDirty(true);
    } else {
      triggerToast('Format mismatch. Make sure to specify === input === and === output === dividers.', 'error');
    }
  };

  // Bulk JSON Import
  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = JSON.parse(event.target?.result as string);
        if (Array.isArray(rawJson)) {
          const parsed = rawJson.map(item => ({
            input_data: item.input_data || item.input || '',
            expected_output: item.expected_output || item.output || '',
            is_hidden: !!item.is_hidden,
            weight: parseInt(item.weight) || 1
          }));
          setQTestCases(prev => [...prev.filter(tc => tc.input_data.trim() !== ''), ...parsed]);
          triggerToast(`Successfully imported ${parsed.length} JSON test cases!`);
          setIsDirty(true);
        } else {
          triggerToast('JSON root must be an array of testcase structures', 'error');
        }
      } catch (err) {
        triggerToast('Invalid JSON file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Bulk CSV Import
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const parsed: TestCase[] = [];

        for (const line of lines) {
          if (!line.trim()) continue;
          // Split by comma mapping input,expected,hidden,weight
          const parts = line.split(',');
          if (parts.length >= 2) {
            parsed.push({
              input_data: parts[0].replace(/"/g, '').trim(),
              expected_output: parts[1].replace(/"/g, '').trim(),
              is_hidden: parts[2]?.trim().toLowerCase() === 'true',
              weight: parseInt(parts[3]) || 1
            });
          }
        }

        if (parsed.length > 0) {
          setQTestCases(prev => [...prev.filter(tc => tc.input_data.trim() !== ''), ...parsed]);
          triggerToast(`Successfully imported ${parsed.length} CSV test cases!`);
          setIsDirty(true);
        }
      } catch (err) {
        triggerToast('Failed parsing CSV file', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Rich Text Editor markdown insertion helper
  const handleMarkdownInsert = (syntax: string) => {
    const textarea = document.getElementById('problem-statement-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    let replacement = '';
    switch (syntax) {
      case 'bold': replacement = `**${selected || 'bold text'}**`; break;
      case 'italic': replacement = `*${selected || 'italic text'}*`; break;
      case 'underline': replacement = `<u>${selected || 'underlined text'}</u>`; break;
      case 'code': replacement = `\`\`\`\n${selected || '// code block'}\n\`\`\``; break;
      case 'bullet': replacement = `\n- ${selected || 'list item'}`; break;
      case 'number': replacement = `\n1. ${selected || 'list item'}`; break;
      case 'link': replacement = `[${selected || 'link text'}](https://)`; break;
      case 'image': replacement = `![image desc](url)`; break;
      case 'table': replacement = `\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Value 1  | Value 2  |`; break;
      default: replacement = selected;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setQStatement(newText);
    setIsDirty(true);

    // Refocus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // SUBMIT SAVE OR SAVE DRAFT ACTIONS
  const handleSave = () => {
    if (!qTitle || !qTopicId) {
      triggerToast('Title and Topic are required to save.', 'error');
      return;
    }
    saveQuestionMutation.mutate({
      topic: parseInt(qTopicId),
      title: qTitle,
      slug: qSlug,
      statement: qStatement,
      constraints: qConstraints,
      input_format: qInputFormat,
      output_format: qOutputFormat,
      notes: qNotes,
      official_solution: qOfficialSolution,
      editorial: qEditorial,
      hints: JSON.stringify(qHints),
      tags: qTags,
      companies: qCompanies,
      examples: JSON.stringify(qExamples),
      starter_code: JSON.stringify(qStarterCodes),
      time_limit: qTimeLimit,
      memory_limit: qMemoryLimit,
      is_published: qPublished,
      order: qOrder,
      meta_title: qMetaTitle,
      meta_description: qMetaDescription,
      meta_keywords: qMetaKeywords,
      test_cases: qTestCases.filter(tc => tc.input_data.trim() || tc.expected_output.trim())
    });
  };

  const handleSaveDraft = () => {
    if (!qTitle || !qTopicId) {
      triggerToast('Title and Topic are required to save draft.', 'error');
      return;
    }
    setQPublished(false);
    saveQuestionMutation.mutate({
      topic: parseInt(qTopicId),
      title: qTitle,
      slug: qSlug,
      statement: qStatement,
      constraints: qConstraints,
      input_format: qInputFormat,
      output_format: qOutputFormat,
      notes: qNotes,
      official_solution: qOfficialSolution,
      editorial: qEditorial,
      hints: JSON.stringify(qHints),
      tags: qTags,
      companies: qCompanies,
      examples: JSON.stringify(qExamples),
      starter_code: JSON.stringify(qStarterCodes),
      time_limit: qTimeLimit,
      memory_limit: qMemoryLimit,
      is_published: false, // Save Draft
      order: qOrder,
      meta_title: qMetaTitle,
      meta_description: qMetaDescription,
      meta_keywords: qMetaKeywords,
      test_cases: qTestCases.filter(tc => tc.input_data.trim() || tc.expected_output.trim())
    });
  };

  const handlePublish = () => {
    if (!qTitle || !qTopicId) {
      triggerToast('Title and Topic are required to publish.', 'error');
      return;
    }
    setQPublished(true);
    saveQuestionMutation.mutate({
      topic: parseInt(qTopicId),
      title: qTitle,
      slug: qSlug,
      statement: qStatement,
      constraints: qConstraints,
      input_format: qInputFormat,
      output_format: qOutputFormat,
      notes: qNotes,
      official_solution: qOfficialSolution,
      editorial: qEditorial,
      hints: JSON.stringify(qHints),
      tags: qTags,
      companies: qCompanies,
      examples: JSON.stringify(qExamples),
      starter_code: JSON.stringify(qStarterCodes),
      time_limit: qTimeLimit,
      memory_limit: qMemoryLimit,
      is_published: true, // Publish
      order: qOrder,
      meta_title: qMetaTitle,
      meta_description: qMetaDescription,
      meta_keywords: qMetaKeywords,
      test_cases: qTestCases.filter(tc => tc.input_data.trim() || tc.expected_output.trim())
    });
  };

  const handleTogglePublishList = async (q: Question, state: boolean) => {
    try {
      await api.patch(`/questions/${q.id}/`, { is_published: state });
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
      triggerToast(state ? 'Question published successfully!' : 'Question archived to draft!');
    } catch (err) {
      triggerToast('Status toggle failed', 'error');
    }
  };

  // Question listing parsing / sorting / filtering logic
  const filteredQuestions = questions?.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = filterTopic ? q.topic === parseInt(filterTopic) : true;
    const matchesDiff = filterDifficulty ? q.level_name === filterDifficulty : true;
    const matchesStatus = filterStatus ? (filterStatus === 'published' ? q.is_published : !q.is_published) : true;
    
    return matchesSearch && matchesTopic && matchesDiff && matchesStatus;
  }).sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortOrder === 'asc' 
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }
    return sortOrder === 'asc' 
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  // Renders analytics metric cards and practice areas
  const renderAnalyticsDashboardContent = () => {
    return (
      <>
        {statsLoading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-800 dark:text-slate-200">
              {[
                { label: 'Total Registered Students', value: stats?.total_students, icon: <Users size={20} className="text-blue-500" />, bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850' },
                { label: 'Platform Solved Submissions', value: stats?.total_submissions, icon: <Play size={20} className="text-indigo-500" />, bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850' },
                { label: 'Published Coding Challenges', value: stats?.total_questions, icon: <FileCode size={20} className="text-emerald-500" />, bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850' },
                { label: 'Successful Submissions', value: stats?.accepted_submissions, icon: <CheckCircle size={20} className="text-purple-500" />, bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850' }
              ].map((card, i) => (
                <div key={i} className={`p-6 rounded-2xl border shadow-sm ${card.bg}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm">{card.icon}</div>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-950 dark:text-white font-mono">{card.value || 0}</span>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Popular Practice Areas</h3>
              <div className="space-y-4">
                {stats?.popular_topics?.map((topic: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-850/55 rounded-xl border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-300">
                    <span className="text-sm font-semibold">{topic.name}</span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                      {topic.submissions} solutions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const SectionIcon = ({ name, className }: { name: string; className?: string }) => {
    switch (name) {
      case 'CodeXml': return <FileCode className={className} size={18} />;
      case 'Brain': return <Brain className={className} size={18} />;
      case 'Briefcase': return <Briefcase className={className} size={18} />;
      case 'CheckSquare': return <CheckSquare className={className} size={18} />;
      case 'Trophy': return <Trophy className={className} size={18} />;
      case 'BookOpen': return <BookOpen className={className} size={18} />;
      case 'Bot': return <Bot className={className} size={18} />;
      default: return <Layers className={className} size={18} />;
    }
  };

  const renderCreateContentView = () => {
    const config = sectionConfigs[selectedSection];
    if (!config) return null;

    const handleFieldChange = (fieldName: string, value: any) => {
      setDynamicFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
      setIsDirty(true);
    };

    const handleOptionChange = (idx: number, val: string) => {
      const currentOpts = dynamicFormData.options || ['', '', '', ''];
      const updated = [...currentOpts];
      updated[idx] = val;
      handleFieldChange('options', updated);
    };

    const handleAddOption = () => {
      const currentOpts = dynamicFormData.options || ['', '', '', ''];
      handleFieldChange('options', [...currentOpts, '']);
    };

    const handleRemoveOption = (idx: number) => {
      const currentOpts = dynamicFormData.options || ['', '', '', ''];
      if (currentOpts.length > 2) {
        handleFieldChange('options', currentOpts.filter((_: string, i: number) => i !== idx));
      }
    };

    const handleDynamicFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const sectionObj = sections?.find(s => s.slug === selectedSection);
      if (!sectionObj) {
        triggerToast('Error: Category Section not found in database', 'error');
        return;
      }
      
      let title = '';
      if (selectedSection === 'contests') title = dynamicFormData.contest_name || 'Unnamed Contest';
      else if (selectedSection === 'courses') title = dynamicFormData.course_title || 'Unnamed Course';
      else title = `${dynamicFormData.topic || 'Item'} - ${dynamicFormData.question ? dynamicFormData.question.substring(0, 30) : 'Practice'}`;

      saveContentItemMutation.mutate({
        section: sectionObj.id,
        title: title,
        data: dynamicFormData
      });
    };

    return (
      <div className="space-y-6 max-w-4xl animate-fadeIn text-slate-800 dark:text-slate-200">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-850">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewState('list');
                setEditingContentId(null);
                setDynamicFormData({});
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-550 cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">
                {editingContentId ? 'Edit Content Item' : `Create ${config.name} Content`}
              </h3>
              <span className="text-xs text-slate-450 uppercase font-mono tracking-wider font-bold">
                Unified Dynamic CMS Builder
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleDynamicFormSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 gap-6 text-sm">
            {config.fields.map(field => {
              const value = dynamicFormData[field.name] !== undefined ? dynamicFormData[field.name] : (field.defaultValue !== undefined ? field.defaultValue : '');
              
              return (
                <div key={field.name} className="space-y-2">
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      required={field.required}
                      value={value}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      required={field.required}
                      value={value}
                      onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
                      placeholder={field.placeholder}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                    />
                  )}

                  {field.type === 'datetime' && (
                    <input
                      type="datetime-local"
                      required={field.required}
                      value={value}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      required={field.required}
                      value={value}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={value}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none"
                    >
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-350 dark:border-slate-700"
                      />
                      <span className="text-xs text-slate-500">Enable feature/criteria</span>
                    </div>
                  )}

                  {field.type === 'file' && (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder="Paste URL or upload a mock file..."
                        className="flex-grow px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-xs"
                      />
                      <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-850 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-205 cursor-pointer select-none">
                        <Upload size={14} className="inline mr-1" />
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFieldChange(field.name, `/media/uploads/${file.name}`);
                              triggerToast(`File uploaded successfully: ${file.name} (Simulated)`, 'success');
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {field.type === 'options' && (
                    <div className="space-y-2">
                      {(value as string[] || ['', '', '', '']).map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-2 items-center">
                          <span className="w-16 font-mono text-[10px] text-slate-400 font-bold uppercase">Opt {oIdx + 1}</span>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                            placeholder={`Enter Option ${oIdx + 1}`}
                            className="flex-grow px-3.5 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(oIdx)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-500 rounded-lg cursor-pointer"
                            title="Remove choice option"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> Add option choice
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => {
                setViewState('list');
                setEditingContentId(null);
                setDynamicFormData({});
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveContentItemMutation.isPending}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
            >
              {editingContentId ? 'Save Changes' : 'Publish Content'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Main Central Content Library Table
  const renderDashboardView = () => {
    const combinedItems: any[] = [];
    
    if (filterSection === 'all' || filterSection === 'coding') {
      filteredQuestions?.forEach(q => {
        combinedItems.push({
          id: q.id,
          title: q.title,
          slug: q.slug,
          level: q.level_name,
          status: q.is_published ? 'Published' : 'Draft',
          type: 'coding',
          category: 'Coding',
          itemRef: q
        });
      });
    }
    
    if (filterSection !== 'coding') {
      contentItems?.forEach(ci => {
        if (filterSection === 'all' || ci.section_slug === filterSection) {
          combinedItems.push({
            id: ci.id,
            title: ci.title,
            slug: ci.slug,
            level: ci.data?.difficulty || 'N/A',
            status: 'Published',
            type: ci.section_slug,
            category: ci.section_name,
            itemRef: ci
          });
        }
      });
    }

    const filteredCombined = combinedItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = filterDifficulty ? item.level.toLowerCase() === filterDifficulty.toLowerCase() : true;
      return matchesSearch && matchesDiff;
    });

    return (
      <div className="space-y-8 animate-fadeIn text-slate-800 dark:text-slate-200 font-sans">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-6 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">CMS Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Platform management console and dynamic database control</p>
          </div>
          <button
            onClick={() => {
              setActiveMenu('create-content');
              setViewState('list');
              setEditingContentId(null);
              setEditingQuestionId(null);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-lg text-xs shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Create Content
          </button>
        </div>

        {renderAnalyticsDashboardContent()}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white">Unified Content Library</h3>
            
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search library..."
                className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none w-48 focus:ring-1 focus:ring-blue-500 text-slate-855 dark:text-white"
              />

              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none text-slate-855 dark:text-white"
              >
                <option value="all">All Sections</option>
                <option value="coding">💻 Coding</option>
                {sections?.filter(s => s.slug !== 'coding').map(s => (
                  <option key={s.id} value={s.slug}>{s.name}</option>
                ))}
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none text-slate-855 dark:text-white"
              >
                <option value="">All Difficulties</option>
                <option value="basic">Basic</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="p-3.5 cursor-pointer" onClick={() => triggerSort('title')}>Title</th>
                  <th className="p-3.5">Section</th>
                  <th className="p-3.5">Difficulty</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredCombined.map((item, idx) => (
                  <tr key={`${item.type}-${item.id}-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-800 dark:text-slate-350">
                    <td className="p-3.5 font-bold">
                      <span
                        className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => {
                          if (item.type === 'coding') {
                            handleEditQuestion(item.itemRef);
                            setSelectedSection('coding');
                            setActiveMenu('create-content');
                          } else {
                            setEditingContentId(item.id);
                            setSelectedSection(item.type);
                            setDynamicFormData(item.itemRef.data || {});
                            setViewState('edit-content');
                            setActiveMenu('create-content');
                          }
                        }}
                      >
                        {item.title}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border border-slate-200 dark:border-slate-750 flex items-center gap-1 w-fit">
                        {item.type !== 'coding' && sections ? (
                          <SectionIcon name={sections.find(s => s.slug === item.type)?.icon || 'Layers'} className="inline" />
                        ) : (
                          <SectionIcon name="CodeXml" className="inline" />
                        )}
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="uppercase text-[10px] font-bold">{item.level}</span>
                    </td>
                    <td className="p-3.5">
                      {item.type === 'coding' ? (
                        <span
                          onClick={() => handleTogglePublishList(item.itemRef, !item.itemRef.is_published)}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold cursor-pointer border hover:scale-105 transition-transform ${
                            item.itemRef.is_published 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-255 dark:bg-emerald-955/20 dark:text-emerald-400' 
                              : 'bg-amber-50 text-amber-700 border-amber-255 dark:bg-amber-955/20 dark:text-amber-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                          item.status === 'Published' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-955/20 dark:text-emerald-400' 
                            : 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-955/20 dark:text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center flex justify-center gap-1.5">
                      <button
                        onClick={() => {
                          if (item.type === 'coding') {
                            handleEditQuestion(item.itemRef);
                            setSelectedSection('coding');
                            setActiveMenu('create-content');
                          } else {
                            setEditingContentId(item.id);
                            setSelectedSection(item.type);
                            setDynamicFormData(item.itemRef.data || {});
                            setViewState('edit-content');
                            setActiveMenu('create-content');
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold"
                      >
                        Edit
                      </button>
                      {item.type === 'coding' && (
                        <button
                          onClick={() => handleDuplicateQuestion(item.itemRef)}
                          className="p-1.5 text-slate-500 hover:text-indigo-650 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold"
                          title="Duplicate question"
                        >
                          Duplicate
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (item.type === 'coding') {
                            if (confirm('Delete this coding challenge?')) {
                              deleteQuestionMutation.mutate(item.id);
                            }
                          } else {
                            if (confirm(`Delete this CMS item "${item.title}"?`)) {
                              deleteContentItemMutation.mutate(item.id);
                            }
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-650 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Learning Section Selection Grid for Create Content page
  const renderCreateContentSelectionView = () => {
    const list = [
      { slug: 'coding', name: 'Coding Challenge', icon: '💻', desc: 'Create code editor algorithmic questions (C, C++, Java, Python)' },
      { slug: 'aptitude', name: 'Aptitude Practice', icon: '🧠', desc: 'Create quantitative and logical multiple choice answers' },
      { slug: 'interview', name: 'Interview Prep', icon: '🎤', desc: 'Create sample interview category questions and key model answer guides' },
      { slug: 'mcq', name: 'MCQ Practice', icon: '📝', desc: 'Create database indices or CS core question options sheets' },
      { slug: 'contests', name: 'Contest Entry', icon: '🏆', desc: 'Launch timed competitive match schemas with specific duration boundaries' },
      { slug: 'courses', name: 'Course Modules', icon: '📚', desc: 'Design structured chapters with modules, pdf notes, and assignments' },
      { slug: 'ai-practice', name: 'AI Tutor Practice', icon: '🤖', desc: 'Provide system agent prompts and criteria evaluation lists' }
    ];

    return (
      <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Create New Content</h2>
          <p className="text-xs text-slate-500 mt-1">Select a learning section below to launch the content creator builder</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(section => (
            <div
              key={section.slug}
              onClick={() => {
                setSelectedSection(section.slug);
                setViewState('create');
                
                // Initialize default dynamic form structures
                if (section.slug === 'aptitude') {
                  setDynamicFormData({ options: ['', '', '', ''], difficulty: 'basic', time_limit: 60 });
                } else if (section.slug === 'mcq') {
                  setDynamicFormData({ options: ['', '', '', ''], difficulty: 'medium', marks: 1, negative_marks: 0 });
                } else if (section.slug === 'contests') {
                  setDynamicFormData({ contest_type: 'public', visibility: 'visible', duration: 120 });
                } else if (section.slug === 'courses') {
                  setDynamicFormData({ modules: 5, quiz: 10, certificate_enabled: true });
                } else if (section.slug === 'ai-practice') {
                  setDynamicFormData({ difficulty: 'medium' });
                } else {
                  setDynamicFormData({});
                }
              }}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow-md dark:hover:border-slate-700 cursor-pointer transition-all duration-200 flex flex-col justify-between h-48"
            >
              <div>
                <span className="text-3xl">{section.icon}</span>
                <h4 className="font-extrabold text-sm text-slate-950 dark:text-white mt-3">{section.name}</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{section.desc}</p>
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-2 hover:translate-x-1 transition-transform inline-block">
                Configure →
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section categories database lists
  const renderCategoriesView = () => {
    return (
      <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-2.5 h-6 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">CMS Categories & Sections</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm h-fit">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Create New Section</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              saveSectionMutation.mutate({ name: newCatName, icon: newCatIcon, description: newCatDesc, status: 'active' });
              setNewCatName('');
              setNewCatDesc('');
              setNewCatIcon('Layers');
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Section Name</label>
                <input
                  type="text" required value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. System Design"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Section description..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm h-20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Icon Name</label>
                <input
                  type="text" value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
                />
              </div>
              <button type="submit" disabled={saveSectionMutation.isPending} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus size={16} /> Create Category
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Database Sections</h3>
            <div className="space-y-3">
              {sections?.map(s => (
                <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center border-slate-200">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{s.name} ({s.slug})</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.description || 'No description added.'}</p>
                  </div>
                  <button onClick={() => {
                    if (s.slug === 'coding') {
                      triggerToast('Core section "coding" cannot be deleted.', 'error');
                      return;
                    }
                    if (confirm(`Are you sure you want to delete category "${s.name}"?`)) {
                      deleteSectionMutation.mutate(s.id);
                    }
                  }} className="p-1.5 text-slate-500 hover:text-red-650 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Original Topics listing view integration
  const renderTopicsView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn text-slate-800 dark:text-slate-200">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
            {editingTopic ? 'Update Topic' : 'Add New Topic'}
          </h3>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              topicMutation.mutate({ name: topicName, description: topicDesc, order: topicOrder });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Topic Name</label>
              <input
                type="text"
                required
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g. Trees"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={topicDesc}
                onChange={(e) => setTopicDesc(e.target.value)}
                placeholder="Summarize topic learning concepts..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm h-24 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sorting Order</label>
              <input
                type="number"
                value={topicOrder}
                onChange={(e) => setTopicOrder(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={topicMutation.isPending}
                className="flex-grow py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} />
                {editingTopic ? 'Save Changes' : 'Create Topic'}
              </button>
              {editingTopic && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTopic(null);
                    setTopicName('');
                    setTopicDesc('');
                    setTopicOrder(0);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-sm border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Topic Index</h3>
          
          {topicsLoading ? (
            <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : (
            <div className="space-y-3">
              {topics?.map(topic => (
                <div key={topic.id} className="p-4 bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center gap-4 border-slate-250">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{topic.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{topic.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTopic(topic);
                        setTopicName(topic.name);
                        setTopicDesc(topic.description);
                        setTopicOrder(topic.order);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      title="Edit Topic"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this topic and all its levels/questions?')) {
                          deleteTopicMutation.mutate(topic.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-650 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      title="Delete Topic"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Difficulty levels viewer
  const renderLevelsView = () => {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm animate-fadeIn space-y-4 text-slate-800 dark:text-slate-200">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Coding Difficulty Levels</h2>
          <p className="text-xs text-slate-500 mt-0.5">View difficulty level configurations across topic pathways</p>
        </div>

        <div className="space-y-4">
          {topics?.map(topic => (
            <div key={topic.id} className="p-4 bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 border-slate-250">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{topic.name} Levels</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {['basic', 'easy', 'medium', 'hard'].map(lvl => (
                  <div key={lvl} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center font-bold capitalize shadow-sm">
                    {lvl} Level
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Real user management list view
  const renderUsersView = () => {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl p-6 shadow-sm animate-fadeIn space-y-6 text-slate-800 dark:text-slate-200">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">User Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage user accounts and administrative roles</p>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-550 font-bold uppercase tracking-wider">
                <th className="p-3.5">User ID</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {usersList?.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-800 dark:text-slate-355">
                  <td className="p-3.5 font-mono">{u.id}</td>
                  <td className="p-3.5 font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-650">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    {u.username}
                  </td>
                  <td className="p-3.5">{u.email || 'N/A'}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${
                      u.role === 'admin' 
                        ? 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-450' 
                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-450'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-center flex justify-center gap-1.5">
                    <button
                      onClick={() => {
                        const targetRole = u.role === 'admin' ? 'student' : 'admin';
                        if (confirm(`Change role of user "${u.username}" to "${targetRole}"?`)) {
                          toggleUserRoleMutation.mutate({ userId: u.id, newRole: targetRole });
                        }
                      }}
                      className="px-3 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-205 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-750 cursor-pointer"
                    >
                      Toggle Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Reusable filtered list table for Contests / Courses
  const renderContentTableFiltered = (slug: string) => {
    const filtered = contentItems?.filter(ci => ci.section_slug === slug) || [];

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No items published in this section yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Slug</th>
                  <th className="p-3.5">Difficulty</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filtered.map(ci => (
                  <tr key={ci.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-800 dark:text-slate-350">
                    <td className="p-3.5 font-bold">{ci.title}</td>
                    <td className="p-3.5 font-mono">{ci.slug}</td>
                    <td className="p-3.5 uppercase">{ci.data?.difficulty || 'N/A'}</td>
                    <td className="p-3.5 text-center flex justify-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingContentId(ci.id);
                          setSelectedSection(ci.section_slug);
                          setDynamicFormData(ci.data || {});
                          setViewState('edit-content');
                          setActiveMenu('create-content');
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete content item "${ci.title}"?`)) {
                            deleteContentItemMutation.mutate(ci.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-650 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderContestsView = () => {
    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-200 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Contests Workspace</h2>
            <p className="text-xs text-slate-500">Manage competition schedules, rules, and durations</p>
          </div>
          <button
            onClick={() => {
              setSelectedSection('contests');
              setActiveMenu('create-content');
              setViewState('create');
              setDynamicFormData({ contest_type: 'public', visibility: 'visible', duration: 120 });
            }}
            className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} /> Create Contest
          </button>
        </div>
        {renderContentTableFiltered('contests')}
      </div>
    );
  };

  const renderCoursesView = () => {
    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-200 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Courses Workspace</h2>
            <p className="text-xs text-slate-500">Manage structured conceptual paths, notes, and certificate rules</p>
          </div>
          <button
            onClick={() => {
              setSelectedSection('courses');
              setActiveMenu('create-content');
              setViewState('create');
              setDynamicFormData({ modules: 5, quiz: 10, certificate_enabled: true });
            }}
            className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} /> Create Course
          </button>
        </div>
        {renderContentTableFiltered('courses')}
      </div>
    );
  };

  const renderAnalyticsView = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">System Analytics</h2>
          <p className="text-xs text-slate-500">Platform telemetry, solver rates, and database load logs</p>
        </div>
        {renderAnalyticsDashboardContent()}
      </div>
    );
  };

  const renderSettingsView = () => {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn text-slate-800 dark:text-slate-200">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">CMS Settings</h2>
          <p className="text-xs text-slate-500">Manage global limits, IDE features, compiler instances, and AI configs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Title</label>
            <input type="text" defaultValue="CodexPetra IDE" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Global Compile Time Limit (s)</label>
            <input type="number" defaultValue="5" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Allowed Code Upload Types</label>
            <input type="text" defaultValue=".cpp, .py, .java, .js" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Default AI Model Evaluator</label>
            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl">
              <option>Gemini 1.5 Pro</option>
              <option>Gemini 1.5 Flash</option>
            </select>
          </div>
        </div>

        <button onClick={() => triggerToast('Global settings saved successfully.')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm">
          Save Settings
        </button>
      </div>
    );
  };

  const triggerSort = (field: keyof Question) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#07080d] text-slate-800 dark:text-slate-200 transition-colors duration-200 font-sans w-full">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-24 right-8 z-50 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm text-white transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-650' : 'bg-blue-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Left Sidebar Menu */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-[#0b0c14]/80 backdrop-blur-lg flex flex-col p-4 gap-2 justify-between shrink-0 h-screen sticky top-0 overflow-y-auto z-30">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2 py-3 border-b border-slate-100 dark:border-slate-850">
            <LayoutDashboard size={20} className="text-blue-650 dark:text-blue-400 animate-pulse" />
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-650 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              CMS Admin
            </span>
          </div>

          <nav className="space-y-1">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: <Database size={16} /> },
              { key: 'create-content', label: 'Create Content', icon: <Plus size={16} /> },
              { key: 'tutorials-cms', label: 'Tutorials CMS', icon: <BookOpen size={16} />, path: '/admin/tutorials' },
              { key: 'aptitude', label: 'Aptitude Practice', icon: <Brain size={16} /> },
              { key: 'categories', label: 'Categories', icon: <Layers size={16} /> },
              { key: 'topics', label: 'Topics', icon: <Layers size={16} /> },
              { key: 'levels', label: 'Levels', icon: <Layers size={16} /> },
              { key: 'users', label: 'Users', icon: <Users size={16} /> },
              { key: 'contests', label: 'Contests', icon: <Trophy size={16} /> },
              { key: 'hackathons', label: 'Hackathons', icon: <Trophy size={16} /> },
              { key: 'courses', label: 'Courses', icon: <BookOpen size={16} /> },
              { key: 'analytics', label: 'Analytics', icon: <Database size={16} /> },
              { key: 'settings', label: 'Settings', icon: <Settings size={16} /> }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                    return;
                  }
                  setActiveMenu(item.key as any);
                  setViewState('list');
                  setEditingContentId(null);
                  setEditingQuestionId(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeMenu === item.key
                    ? 'bg-blue-50/80 text-blue-650 dark:bg-blue-950/30 dark:text-blue-450 border-l-4 border-blue-600 dark:border-blue-500 shadow-sm font-bold'
                    : 'text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60 border-l-4 border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-2 border-t border-slate-100 dark:border-slate-850 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Logged in as Admin</span>
        </div>
      </aside>

      {/* Right Content Area */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto">
      
        {(viewState === 'create' && selectedSection === 'coding') && (
        <div className="flex flex-col xl:flex-row gap-6 w-full h-[calc(100vh-8rem)] min-h-[650px] overflow-hidden text-slate-800 dark:text-slate-200">
          
          {/* LEFT SIDEBAR: TOPIC & QUESTIONS */}
          <div className="w-full xl:w-80 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl h-full overflow-hidden shadow-sm shrink-0">
            <div className="p-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Select Topic Pathway
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => {
                  setSelectedTopicId(e.target.value);
                  setSelectedQuestionId(null);
                  resetQuestionForm();
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="">-- Choose Topic --</option>
                {topics?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full mt-3 py-2 px-4 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Plus size={14} /> Add New Question
              </button>
            </div>

            {/* QUESTIONS LIST */}
            <div className="flex-grow overflow-y-auto p-4 space-y-2">
              {!selectedTopicId ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  Select a topic pathway to display questions.
                </div>
              ) : topicQuestions && topicQuestions.length > 0 ? (
                topicQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={() => handleSelectQuestion(q.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative group flex flex-col gap-1.5 ${
                      selectedQuestionId === q.id
                        ? 'bg-blue-50/70 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900'
                        : 'bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/40 dark:hover:bg-slate-850/30 border-slate-150 dark:border-slate-800'
                    }`}
                  >
                    {/* Drag Handle Dot Indicator */}
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col gap-0.5 opacity-30 cursor-grab">
                      <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                    </div>

                    <div className="pl-2 flex justify-between items-start">
                      <span className="font-bold text-xs line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 pr-4">
                        {q.title}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase border ${
                        q.level_name === 'hard' ? 'bg-red-50 text-red-650 border-red-200 dark:bg-red-950/20 dark:text-red-400' :
                        q.level_name === 'medium' ? 'bg-amber-50 text-amber-650 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400' :
                        'bg-emerald-50 text-emerald-650 border-emerald-200 dark:bg-emerald-955/20 dark:text-emerald-400'
                      }`}>
                        {q.level_name}
                      </span>
                    </div>

                    <div className="pl-2 flex justify-between items-center text-[10px] text-slate-400">
                      <span className={`font-semibold ${q.is_published ? 'text-emerald-555' : 'text-amber-500'}`}>
                        {q.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span>
                        Updated: {new Date(q.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* CARD ACTIONS */}
                    <div className="pl-2 flex gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveQuestion(idx, 'up'); }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded"
                        title="Move Up"
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveQuestion(idx, 'down'); }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded"
                        title="Move Down"
                      >
                        <ArrowDown size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDuplicateQuestion(q); }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded"
                        title="Duplicate"
                      >
                        <Copy size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this question? This action cannot be undone.')) {
                            deleteQuestionMutation.mutate(q.id);
                          }
                        }}
                        className="p-1 hover:bg-red-50 text-red-500 rounded"
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No questions found in this topic pathway.
                </div>
              )}
            </div>
          </div>

          {/* MAIN EDITING WORKSPACE & PREVIEW */}
          <div className="flex-grow flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl h-full overflow-hidden shadow-sm">
            {!selectedQuestionId ? (
              <div className="flex flex-col items-center justify-center flex-grow p-12 text-center text-slate-400">
                <FileCode size={40} className="text-slate-300 dark:text-slate-750 mb-3 animate-pulse" />
                <h4 className="font-extrabold text-sm text-slate-650 dark:text-slate-350">No Coding Question Selected</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Select a question from the left sidebar or click "Add New Question" to begin configuring challenge specifications.
                </p>
              </div>
            ) : (
              <div className="flex flex-col flex-grow h-full overflow-hidden">
                
                {/* WORKSPACE HEADER */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex flex-wrap justify-between items-center gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="text"
                      value={qTitle}
                      onChange={(e) => setQTitle(e.target.value)}
                      placeholder="Enter question title..."
                      className="font-extrabold text-sm bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-800 focus:border-blue-500 focus:outline-none text-slate-900 dark:text-white pb-0.5 w-64 md:w-80 truncate"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      {autosaveStatus === 'saving' && (
                        <span className="text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded border border-blue-200/50 flex items-center gap-1">
                          <Loader2 size={10} className="animate-spin" /> Saving...
                        </span>
                      )}
                      {autosaveStatus === 'saved' && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-200/50 flex items-center gap-0.5">
                          <Check size={10} /> Saved
                        </span>
                      )}
                      {autosaveStatus === 'failed' && (
                        <span className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded border border-red-200/50 flex items-center gap-0.5">
                          <X size={10} /> Save Failed
                        </span>
                      )}
                      {isDirty && autosaveStatus === 'idle' && (
                        <span className="text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-200/50">
                          Unsaved changes
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreviewPane(!showPreviewPane)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850/50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Preview Pane: {showPreviewPane ? 'ON' : 'OFF'}</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saveQuestionMutation.isPending}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-850 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={saveQuestionMutation.isPending}
                      className="px-3.5 py-1.5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-850 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-250 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={saveQuestionMutation.isPending}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check size={12} />
                      Publish
                    </button>
                  </div>
                </div>

                {/* EDIT ZONE AND LIVE PREVIEW SPLITTER */}
                <div className="flex-grow flex overflow-hidden">
                  
                  {/* EDITOR TAB PANEL (LEFT PANE) */}
                  <div className={`${showPreviewPane ? 'w-1/2' : 'w-full'} flex flex-col h-full border-r border-slate-200 dark:border-slate-850 overflow-hidden`}>
                    
                    {/* EDITOR TABS HEADER */}
                    <div className="flex border-b border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 px-4 text-xs font-semibold shrink-0">
                      {[
                        { key: 'basic', label: 'Basic Info' },
                        { key: 'description', label: 'Description' },
                        { key: 'starter_code', label: 'Templates' },
                        { key: 'testcases', label: 'Test Cases' },
                        { key: 'editorial', label: 'Editorial & Hints' }
                      ].map(tab => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveEditorTab(tab.key as any)}
                          className={`px-3 py-3 border-b-2 transition-all cursor-pointer ${
                            activeEditorTab === tab.key
                              ? 'border-blue-600 text-blue-650 dark:border-blue-500 dark:text-blue-400 font-bold'
                              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-250'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* SCROLLABLE FORMS ZONE */}
                    <div className="flex-grow overflow-y-auto p-5 space-y-5 text-xs">
                      
                      {/* TAB 1: BASIC INFO */}
                      {activeEditorTab === 'basic' && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Topic Linkage</label>
                              <select
                                value={qTopicId}
                                onChange={(e) => setQTopicId(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">-- Choose Topic --</option>
                                {topics?.map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Difficulty</label>
                              <select
                                value={qLevelName}
                                onChange={(e) => setQLevelName(e.target.value as any)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="basic">Basic</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Slug</label>
                              <input
                                type="text"
                                value={qSlug}
                                onChange={(e) => setQSlug(e.target.value)}
                                placeholder="unique-slug"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Order Index</label>
                              <input
                                type="number"
                                value={qOrder}
                                onChange={(e) => setQOrder(parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tags (Comma Separated)</label>
                              <input
                                type="text"
                                value={qTags}
                                onChange={(e) => setQTags(e.target.value)}
                                placeholder="e.g. Arrays, Dynamic Programming"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Company Tags</label>
                              <input
                                type="text"
                                value={qCompanies}
                                onChange={(e) => setQCompanies(e.target.value)}
                                placeholder="e.g. Google, Amazon, Microsoft"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Time Limit (Seconds)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={qTimeLimit}
                                onChange={(e) => setQTimeLimit(parseFloat(e.target.value) || 2.0)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Memory Limit (MB)</label>
                              <input
                                type="number"
                                value={qMemoryLimit}
                                onChange={(e) => setQMemoryLimit(parseInt(e.target.value) || 256)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* SEO COLLAPSIBLE CARD */}
                          <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-4 bg-slate-50/20 space-y-4">
                            <h5 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">SEO configurations</h5>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Meta Title</label>
                              <input
                                type="text"
                                value={qMetaTitle}
                                onChange={(e) => setQMetaTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Meta Description</label>
                              <textarea
                                value={qMetaDescription}
                                onChange={(e) => setQMetaDescription(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl h-16 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: DESCRIPTION */}
                      {activeEditorTab === 'description' && (
                        <div className="space-y-4">
                          {/* Markdown toolbar */}
                          <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-850 text-[10px] text-slate-650">
                            {[
                              { label: 'B', tag: 'bold', title: 'Bold' },
                              { label: 'I', tag: 'italic', title: 'Italic' },
                              { label: '<Code />', tag: 'code', title: 'Code block' },
                              { label: '• List', tag: 'bullet', title: 'Bullet list' },
                              { label: '1. List', tag: 'number', title: 'Numbered list' },
                              { label: 'Table', tag: 'table', title: 'Table template' }
                            ].map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleMarkdownInsert(item.tag)}
                                className="px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded font-semibold cursor-pointer"
                                title={item.title}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Problem Statement</label>
                            <textarea
                              id="problem-statement-textarea"
                              value={qStatement}
                              onChange={(e) => setQStatement(e.target.value)}
                              placeholder="Write challenge descriptions using Markdown..."
                              className="w-full h-48 p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Constraints</label>
                              <textarea
                                value={qConstraints}
                                onChange={(e) => setQConstraints(e.target.value)}
                                placeholder="e.g. 1 <= N <= 10^5"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] h-24 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
                              <textarea
                                value={qNotes}
                                onChange={(e) => setQNotes(e.target.value)}
                                placeholder="Hints/Notes to display at bottom..."
                                className="w-full p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] h-24 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Input Format</label>
                              <textarea
                                value={qInputFormat}
                                onChange={(e) => setQInputFormat(e.target.value)}
                                placeholder="Describe parameters inputs..."
                                className="w-full p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] h-24 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Output Format</label>
                              <textarea
                                value={qOutputFormat}
                                onChange={(e) => setQOutputFormat(e.target.value)}
                                placeholder="Describe expected returns output..."
                                className="w-full p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] h-24 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* EXAMPLES ARRAY BUILDER */}
                          <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-4 bg-slate-50/20 space-y-4">
                            <div className="flex justify-between items-center">
                              <h5 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">Examples (Public documentation)</h5>
                              <button
                                type="button"
                                onClick={addExample}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={11} /> Add Example
                              </button>
                            </div>
                            {qExamples.map((ex, exIdx) => (
                              <div key={exIdx} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg relative space-y-3">
                                <div className="absolute right-2 top-2 flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => reorderExample(exIdx, 'up')}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded cursor-pointer"
                                  >
                                    <ArrowUp size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => reorderExample(exIdx, 'down')}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded cursor-pointer"
                                  >
                                    <ArrowDown size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteExample(exIdx)}
                                    className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                                <span className="font-extrabold text-[10px] text-blue-500 uppercase tracking-wider">Example {exIdx + 1}</span>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Input</label>
                                    <textarea
                                      value={ex.input}
                                      onChange={(e) => updateExample(exIdx, 'input', e.target.value)}
                                      className="w-full p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded font-mono text-[10px] h-14 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Output</label>
                                    <textarea
                                      value={ex.output}
                                      onChange={(e) => updateExample(exIdx, 'output', e.target.value)}
                                      className="w-full p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded font-mono text-[10px] h-14 focus:outline-none"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Explanation</label>
                                  <input
                                    type="text"
                                    value={ex.explanation}
                                    onChange={(e) => updateExample(exIdx, 'explanation', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded text-[10px] focus:outline-none"
                                    placeholder="Brief logic notes why inputs mapping matches output..."
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TAB 3: STARTER CODE TEMPLATES */}
                      {activeEditorTab === 'starter_code' && (
                        <div className="space-y-4 flex flex-col h-[400px]">
                          <div className="flex justify-between items-center shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Starter Language</span>
                            <div className="flex bg-slate-100 dark:bg-slate-950 rounded-lg p-0.5 text-[10px] font-semibold">
                              {(['python', 'javascript', 'java', 'cpp', 'c'] as const).map(lang => (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => setActiveStarterLang(lang)}
                                  className={`px-3 py-1.5 rounded-md uppercase transition-colors cursor-pointer ${
                                    activeStarterLang === lang ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-sm font-extrabold' : 'text-slate-500'
                                  }`}
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex-grow border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
                            <Editor
                              height="100%"
                              language={
                                activeStarterLang === 'python' ? 'python' :
                                activeStarterLang === 'javascript' ? 'javascript' :
                                activeStarterLang === 'java' ? 'java' : 'cpp'
                              }
                              theme={theme === 'dark' ? 'vs-dark' : 'light'}
                              value={qStarterCodes[activeStarterLang] || ''}
                              onChange={(val) => handleStarterCodeChange(val || '')}
                              options={{
                                minimap: { enabled: false },
                                fontSize: 11,
                                lineNumbers: 'on',
                                automaticLayout: true,
                                scrollBeyondLastLine: false
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* TAB 4: TEST CASES */}
                      {activeEditorTab === 'testcases' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setShowBulkModal(true)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded flex items-center gap-1 cursor-pointer"
                              >
                                Bulk Parse STDIN
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => bulkFileRef.current?.click()}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded flex items-center gap-1 cursor-pointer"
                              >
                                Import File
                              </button>
                              <input
                                type="file"
                                ref={bulkFileRef}
                                onChange={(e) => {
                                  if (e.target.files?.[0]?.name.endsWith('.json')) {
                                    handleJSONImport(e);
                                  } else {
                                    handleCSVImport(e);
                                  }
                                }}
                                className="hidden"
                                accept=".json,.csv"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={addTestCase}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                            >
                              <Plus size={12} /> Add Test Case
                            </button>
                          </div>

                          {/* BULK PASTE MODAL */}
                          {showBulkModal && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                                <div>
                                  <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">Bulk STDIN Testcases parser</h4>
                                  <p className="text-[10px] text-slate-400 mt-1">Paste input/output blocks separated by standard tags</p>
                                </div>
                                <textarea
                                  value={bulkInputText}
                                  onChange={(e) => setBulkInputText(e.target.value)}
                                  placeholder="=== input ===&#10;1 2 3&#10;=== output ===&#10;6&#10;&#10;=== input ===&#10;4 5&#10;=== output ===&#10;9"
                                  className="w-full h-48 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[10px] focus:outline-none"
                                />
                                <div className="flex justify-end gap-2 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => { setShowBulkModal(false); setBulkInputText(''); }}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleBulkPaste}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                                  >
                                    Parse & Merge
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Test Cases Table */}
                          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                                  <th className="p-3 w-10 text-center">#</th>
                                  <th className="p-3">Input STDIN</th>
                                  <th className="p-3">Expected Output</th>
                                  <th className="p-3 w-24">Visibility</th>
                                  <th className="p-3 w-20">Weight</th>
                                  <th className="p-3 w-20 text-center">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 dark:divide-slate-850 font-mono text-[10px]">
                                {qTestCases.map((tc, idx) => (
                                  <tr key={tc.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                                    <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                    <td className="p-2">
                                      <textarea
                                        value={tc.input_data}
                                        onChange={(e) => updateTestCase(idx, 'input_data', e.target.value)}
                                        placeholder="stdin data"
                                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:outline-none h-11 text-[10px]"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <textarea
                                        value={tc.expected_output}
                                        onChange={(e) => updateTestCase(idx, 'expected_output', e.target.value)}
                                        placeholder="expected stdout"
                                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:outline-none h-11 text-[10px]"
                                      />
                                    </td>
                                    <td className="p-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => updateTestCase(idx, 'is_hidden', !tc.is_hidden)}
                                        className={`px-2 py-1 rounded border text-[9px] font-extrabold uppercase transition-colors cursor-pointer ${
                                          tc.is_hidden 
                                            ? 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-450' 
                                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-450'
                                        }`}
                                      >
                                        {tc.is_hidden ? 'Hidden' : 'Public'}
                                      </button>
                                    </td>
                                    <td className="p-2">
                                      <input
                                        type="number"
                                        min="0"
                                        value={tc.weight}
                                        onChange={(e) => updateTestCase(idx, 'weight', parseInt(e.target.value) || 0)}
                                        className="w-14 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:outline-none text-center"
                                      />
                                    </td>
                                    <td className="p-3 text-center flex justify-center gap-1.5 mt-1.5">
                                      <button
                                        type="button"
                                        onClick={() => duplicateTestCase(idx)}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded cursor-pointer"
                                        title="Duplicate TestCase"
                                      >
                                        <Copy size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteTestCase(idx)}
                                        className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                                        title="Delete TestCase"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* TAB 5: EDITORIAL & SOLUTIONS */}
                      {activeEditorTab === 'editorial' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Editorial Markdown Explanation</label>
                            <textarea
                              value={qEditorial}
                              onChange={(e) => setQEditorial(e.target.value)}
                              placeholder="Write algorithm approach, complexity analysis O(N), etc..."
                              className="w-full h-40 p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col h-[300px]">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 shrink-0">Official Reference Solution</label>
                            <div className="flex-grow border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
                              <Editor
                                height="100%"
                                language={
                                  activeStarterLang === 'python' ? 'python' :
                                  activeStarterLang === 'javascript' ? 'javascript' :
                                  activeStarterLang === 'java' ? 'java' : 'cpp'
                                }
                                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                value={qOfficialSolution}
                                onChange={(val) => { setQOfficialSolution(val || ''); setIsDirty(true); }}
                                options={{
                                  minimap: { enabled: false },
                                  fontSize: 11,
                                  lineNumbers: 'on',
                                  automaticLayout: true,
                                  scrollBeyondLastLine: false
                                }}
                              />
                            </div>
                          </div>

                          {/* HINTS BUILDER */}
                          <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-4 bg-slate-50/20 space-y-4">
                            <div className="flex justify-between items-center">
                              <h5 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">Sequential Hints for Students</h5>
                              <button
                                type="button"
                                onClick={() => {
                                  setQHints([...qHints, { hint: '' }]);
                                  setIsDirty(true);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-250 dark:bg-slate-888 text-slate-700 dark:text-slate-300 font-bold rounded flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={11} /> Add Hint
                              </button>
                            </div>
                            {qHints.map((hn, hnIdx) => (
                              <div key={hnIdx} className="flex gap-2 items-center">
                                <span className="font-mono text-[10px] text-slate-400 font-bold w-12 shrink-0">HINT {hnIdx + 1}</span>
                                <input
                                  type="text"
                                  value={hn.hint}
                                  onChange={(e) => {
                                    const updated = [...qHints];
                                    updated[hnIdx].hint = e.target.value;
                                    setQHints(updated);
                                    setIsDirty(true);
                                  }}
                                  placeholder="Enter progressive hint details..."
                                  className="flex-grow px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = qHints.filter((_, i) => i !== hnIdx);
                                    setQHints(updated.length > 0 ? updated : [{ hint: '' }]);
                                    setIsDirty(true);
                                  }}
                                  className="p-2 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STUDENT PREVIEW PANEL (RIGHT PANE) */}
                  {showPreviewPane && (
                    <div className="w-1/2 bg-slate-50 dark:bg-[#07080d] overflow-y-auto p-6 flex flex-col h-full space-y-6 select-none border-l border-slate-200 dark:border-slate-850 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
                        <span className="font-bold text-slate-550 uppercase tracking-wider font-mono text-[10px]">Student Interface Live Preview</span>
                        <span className="text-[10px] text-slate-400 italic">Rendered in real-time</span>
                      </div>

                      {/* Preview Title */}
                      <div className="space-y-2">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {qTitle || 'Untitled Challenge'}
                        </h2>
                        <div className="flex gap-2 items-center flex-wrap text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-extrabold uppercase border ${
                            qLevelName === 'hard' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400' :
                            qLevelName === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
                          }`}>
                            {qLevelName}
                          </span>
                          <span className="text-slate-400">Time Limit: {qTimeLimit}s</span>
                          <span className="text-slate-400">Memory Limit: {qMemoryLimit}MB</span>
                        </div>
                      </div>

                      {/* Preview Statement */}
                      <div className="space-y-1 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-4 rounded-xl shadow-sm">
                        <span className="font-extrabold text-[10px] text-slate-450 uppercase tracking-wider block">Description</span>
                        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {qStatement || <span className="italic text-slate-400">No statement description defined yet.</span>}
                        </div>
                      </div>

                      {/* Input / Output Formats */}
                      {(qInputFormat || qOutputFormat) && (
                        <div className="grid grid-cols-2 gap-4">
                          {qInputFormat && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-855 p-3.5 rounded-xl">
                              <span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Input Format</span>
                              <p className="text-slate-750 dark:text-slate-350 whitespace-pre-wrap">{qInputFormat}</p>
                            </div>
                          )}
                          {qOutputFormat && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-855 p-3.5 rounded-xl">
                              <span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Output Format</span>
                              <p className="text-slate-750 dark:text-slate-350 whitespace-pre-wrap">{qOutputFormat}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Constraints & Notes */}
                      {(qConstraints || qNotes) && (
                        <div className="grid grid-cols-2 gap-4">
                          {qConstraints && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-855 p-3.5 rounded-xl font-mono text-[10px]">
                              <span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider block mb-1 font-sans">Constraints</span>
                              <p className="text-slate-750 dark:text-slate-350 whitespace-pre-wrap">{qConstraints}</p>
                            </div>
                          )}
                          {qNotes && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-855 p-3.5 rounded-xl">
                              <span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Notes</span>
                              <p className="text-slate-750 dark:text-slate-350 whitespace-pre-wrap">{qNotes}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Examples Render */}
                      {qExamples.filter(ex => ex.input || ex.output).length > 0 && (
                        <div className="space-y-4">
                          <span className="font-extrabold text-[10px] text-slate-450 uppercase tracking-wider block">Examples Examples</span>
                          {qExamples.filter(ex => ex.input || ex.output).map((ex, exIdx) => (
                            <div key={exIdx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-4 rounded-xl space-y-3 font-mono text-[10px]">
                              <span className="font-bold text-[10px] text-slate-850 dark:text-slate-200 block font-sans">Example {exIdx + 1}</span>
                              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                                <span className="font-bold text-slate-400 block mb-0.5 font-sans text-[9px]">Input:</span>
                                <pre className="whitespace-pre-wrap">{ex.input}</pre>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                                <span className="font-bold text-slate-400 block mb-0.5 font-sans text-[9px]">Output:</span>
                                <pre className="whitespace-pre-wrap">{ex.output}</pre>
                              </div>
                              {ex.explanation && (
                                <p className="text-slate-500 font-sans text-[10px] italic pt-1 leading-relaxed">
                                  Explanation: {ex.explanation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Monaco starter code mockup */}
                      <div className="space-y-2 flex flex-col h-48">
                        <span className="font-extrabold text-[10px] text-slate-450 uppercase tracking-wider block shrink-0">Default Template Code</span>
                        <div className="flex-grow border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden">
                          <Editor
                            height="100%"
                            language={
                              activeStarterLang === 'python' ? 'python' :
                              activeStarterLang === 'javascript' ? 'javascript' :
                              activeStarterLang === 'java' ? 'java' : 'cpp'
                            }
                            theme={theme === 'dark' ? 'vs-dark' : 'light'}
                            value={qStarterCodes[activeStarterLang] || ''}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 10,
                              lineNumbers: 'on',
                              automaticLayout: true,
                              readOnly: true,
                              scrollBeyondLastLine: false
                            }}
                          />
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}
          </div>

          {/* UNSAVED MODAL DIALOG */}
          {showUnsavedModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scaleIn text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertCircle size={20} />
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">Unsaved Changes</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You have unsaved changes on the current coding question challenge. How would you like to proceed?
                </p>
                <div className="flex justify-end gap-2 text-xs font-semibold pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnsavedModal(false);
                      setPendingQuestionId(null);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 rounded-lg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnsavedModal(false);
                      setIsDirty(false);
                      if (pendingQuestionId !== null) {
                        setSelectedQuestionId(pendingQuestionId);
                      }
                      setPendingQuestionId(null);
                    }}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnsavedModal(false);
                      handleSave();
                      if (pendingQuestionId !== null) {
                        // Optimistically set next selected ID
                        setSelectedQuestionId(pendingQuestionId);
                      }
                      setPendingQuestionId(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors shadow-sm shadow-blue-500/10"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW STATE: OTHER SECTIONS DYNAMIC BUILDER */}
      {(viewState === 'edit-content' || (viewState === 'create' && selectedSection !== 'coding')) && (
        renderCreateContentView()
      )}

      {/* VIEW STATE: CENTRAL CONTENT LISTINGS */}
      {viewState === 'list' && (
        <>
          {activeMenu === 'dashboard' && renderDashboardView()}
          {activeMenu === 'create-content' && renderCreateContentSelectionView()}
          {activeMenu === 'aptitude' && <AptitudeErrorBoundary><AptitudeAdminPanel /></AptitudeErrorBoundary>}
          {activeMenu === 'categories' && renderCategoriesView()}
          {activeMenu === 'topics' && renderTopicsView()}
          {activeMenu === 'levels' && renderLevelsView()}
          {activeMenu === 'users' && renderUsersView()}
          {activeMenu === 'contests' && renderContestsView()}
          {activeMenu === 'hackathons' && <HackathonAdminPanel />}
          {activeMenu === 'courses' && renderCoursesView()}
          {activeMenu === 'analytics' && renderAnalyticsView()}
          {activeMenu === 'settings' && renderSettingsView()}
        </>
      )}

      </main>
    </div>
  );
};

export default AdminDashboard;
