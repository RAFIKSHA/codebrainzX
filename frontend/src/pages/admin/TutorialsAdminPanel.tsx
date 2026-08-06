import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tutorialsService } from '../../services/tutorials';
import type { 
  TutorialLanguage, TutorialChapter, 
  TutorialLesson, TutorialMedia, TutorialAdminAnalytics
} from '../../services/tutorials';
import { 
  Plus, Edit3, Trash2, GripVertical, 
  BookOpen, Folder, FileText, Upload, Settings, 
  Save, BarChart2, Check, Copy, X, 
  Layers, LayoutGrid, Loader2, AlertCircle
} from 'lucide-react';

const TutorialsAdminPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'analytics' | 'languages' | 'chapters' | 'lessons' | 'media' | 'settings'>('analytics');

  // --- CRUD States ---
  // General loaders/errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Languages CRUD
  const [langFormOpen, setLangFormOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<TutorialLanguage | null>(null);
  const [langData, setLangData] = useState<Partial<TutorialLanguage>>({
    name: '', slug: '', description: '', difficulty: 'beginner', estimated_duration: '10 hours', status: 'draft', icon: 'Code', banner: '', seo_title: '', seo_description: ''
  });

  // Chapters CRUD
  const [chapFormOpen, setChapFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<TutorialChapter | null>(null);
  const [selectedLangForChapters, setSelectedLangForChapters] = useState<number | null>(null);
  const [chapData, setChapData] = useState<Partial<TutorialChapter>>({
    language: 0, name: '', slug: '', description: '', status: 'draft'
  });

  // Lessons CRUD
  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<TutorialLesson | null>(null);
  const [selectedLangForLessons, setSelectedLangForLessons] = useState<number | null>(null);
  const [selectedChapForLessons, setSelectedChapForLessons] = useState<number | null>(null);
  const [lessonData, setLessonData] = useState<Partial<TutorialLesson>>({
    language: 0, chapter: 0, title: '', slug: '', content: '', code_example: '', code_output: '', code_explanation: '', estimated_reading_time: 5, status: 'draft', tags: '', seo_title: '', seo_description: ''
  });

  // Drag and Drop drag Index tracker
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Media CRUD
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaTitle, setMediaTitle] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Settings mock states
  const [settings, setSettings] = useState({
    siteName: 'CodexPetra',
    seoDefaultKeywords: 'tutorials, learn python, coding free',
    enableSandbox: true,
    showEstDuration: true,
    editorTheme: 'vs-dark'
  });

  // --- React Query Data Fetching ---
  const { data: analytics, isLoading: analyticsLoading } = useQuery<TutorialAdminAnalytics>({
    queryKey: ['admin-tutorials-analytics'],
    queryFn: () => tutorialsService.getAdminAnalytics(),
    enabled: activeTab === 'analytics'
  });

  const { data: languages, isLoading: languagesLoading } = useQuery<TutorialLanguage[]>({
    queryKey: ['admin-tutorials-languages'],
    queryFn: () => tutorialsService.adminGetLanguages(),
  });

  const { data: chapters } = useQuery<TutorialChapter[]>({
    queryKey: ['admin-tutorials-chapters', selectedLangForChapters],
    queryFn: () => tutorialsService.adminGetChapters(selectedLangForChapters ? { language: selectedLangForChapters } : undefined),
    enabled: true
  });

  const { data: lessons } = useQuery<TutorialLesson[]>({
    queryKey: ['admin-tutorials-lessons', selectedLangForLessons, selectedChapForLessons],
    queryFn: () => tutorialsService.adminGetLessons({ 
      language: selectedLangForLessons || undefined, 
      chapter: selectedChapForLessons || undefined 
    }),
    enabled: true
  });

  const { data: media, isLoading: mediaLoading } = useQuery<TutorialMedia[]>({
    queryKey: ['admin-tutorials-media'],
    queryFn: () => tutorialsService.getMedia(),
    enabled: activeTab === 'media'
  });

  // --- CRUD Mutations ---
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // Language Mutations
  const createLanguageMutation = useMutation({
    mutationFn: (data: Partial<TutorialLanguage>) => tutorialsService.createLanguage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials-languages'] });
      setLangFormOpen(false);
      triggerSuccess('Language created successfully!');
    },
    onError: (e: any) => triggerError(e.response?.data?.error || 'Failed to create language')
  });

  const updateLanguageMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TutorialLanguage> }) => tutorialsService.updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials-languages'] });
      setLangFormOpen(false);
      setEditingLanguage(null);
      triggerSuccess('Language updated successfully!');
    },
    onError: (e: any) => triggerError(e.response?.data?.error || 'Failed to update language')
  });

  const deleteLanguageMutation = useMutation({
    mutationFn: (id: number) => tutorialsService.deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials-languages'] });
      triggerSuccess('Language deleted successfully.');
    },
    onError: () => triggerError('Failed to delete language.')
  });

  // Chapter Mutations
  const createChapterMutation = useMutation({
    mutationFn: (data: Partial<TutorialChapter>) => tutorialsService.createChapter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials-chapters'] });
      setChapFormOpen(false);
      triggerSuccess('Chapter created successfully!');
    },
    onError: (e: any) => triggerError(e.response?.data?.error || 'Failed to create chapter')
  });

  const updateChapterMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TutorialChapter> }) => tutorialsService.updateChapter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials-chapters'] });
      setChapFormOpen(false);
      setEditingChapter(null);
      triggerSuccess('Chapter updated successfully!');
    },
    onError: (e: any) => triggerError(e.response?.data?.error || 'Failed to update chapter')
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (id: number) => tutorialsService.deleteChapter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials-chapters'] });
      triggerSuccess('Chapter deleted.');
    },
    onError: () => triggerError('Failed to delete chapter.')
  });

  // Lesson Mutations
  const createLessonMutation = useMutation({
    mutationFn: (data: Partial<TutorialLesson>) => tutorialsService.createLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials-lessons'] });
      setLessonFormOpen(false);
      triggerSuccess('Lesson created successfully!');
    },
    onError: (e: any) => triggerError(e.response?.data?.error || 'Failed to create lesson')
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TutorialLesson> }) => tutorialsService.updateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials-lessons'] });
      setLessonFormOpen(false);
      setEditingLesson(null);
      triggerSuccess('Lesson updated successfully!');
    },
    onError: (e: any) => triggerError(e.response?.data?.error || 'Failed to update lesson')
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: number) => tutorialsService.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials-lessons'] });
      triggerSuccess('Lesson deleted.');
    },
    onError: () => triggerError('Failed to delete lesson.')
  });

  // --- Handlers ---
  // Native HTML5 Drag and Drop reordering
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (
    targetIdx: number, 
    list: any[], 
    reorderFn: (ids: number[]) => Promise<any>, 
    invalidateKey: string[]
  ) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const reorderedList = [...list];
    const [draggedItem] = reorderedList.splice(draggedIdx, 1);
    reorderedList.splice(targetIdx, 0, draggedItem);
    
    // Optimistic UI state update
    queryClient.setQueryData(invalidateKey, reorderedList);
    setDraggedIdx(null);

    try {
      await reorderFn(reorderedList.map(item => item.id));
      triggerSuccess('Order updated and saved in database!');
    } catch (e) {
      console.error(e);
      triggerError('Failed to save ordering to backend.');
      queryClient.invalidateQueries({ queryKey: invalidateKey });
    }
  };

  // Language Form
  const handleOpenCreateLanguage = () => {
    setLangData({ name: '', slug: '', description: '', difficulty: 'beginner', estimated_duration: '10 hours', status: 'draft', icon: 'Code', banner: '', seo_title: '', seo_description: '' });
    setEditingLanguage(null);
    setLangFormOpen(true);
  };

  const handleOpenEditLanguage = (lang: TutorialLanguage) => {
    setEditingLanguage(lang);
    setLangData(lang);
    setLangFormOpen(true);
  };

  const handleSaveLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLanguage) {
      updateLanguageMutation.mutate({ id: editingLanguage.id, data: langData });
    } else {
      createLanguageMutation.mutate(langData);
    }
  };

  // Chapter Form
  const handleOpenCreateChapter = () => {
    setChapData({ language: selectedLangForChapters || (languages && languages.length > 0 ? languages[0].id : 0), name: '', slug: '', description: '', status: 'draft' });
    setEditingChapter(null);
    setChapFormOpen(true);
  };

  const handleOpenEditChapter = (chap: TutorialChapter) => {
    setEditingChapter(chap);
    setChapData(chap);
    setChapFormOpen(true);
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChapter) {
      updateChapterMutation.mutate({ id: editingChapter.id, data: chapData });
    } else {
      createChapterMutation.mutate(chapData);
    }
  };

  // Lesson Form
  const handleOpenCreateLesson = () => {
    setLessonData({
      language: selectedLangForLessons || (languages && languages.length > 0 ? languages[0].id : 0),
      chapter: selectedChapForLessons || (chapters && chapters.length > 0 ? chapters[0].id : 0),
      title: '', slug: '', content: '', code_example: '', code_output: '', code_explanation: '', estimated_reading_time: 5, status: 'draft', tags: '', seo_title: '', seo_description: ''
    });
    setEditingLesson(null);
    setLessonFormOpen(true);
  };

  const handleOpenEditLesson = (les: TutorialLesson) => {
    setEditingLesson(les);
    setLessonData(les);
    setLessonFormOpen(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLesson) {
      updateLessonMutation.mutate({ id: editingLesson.id, data: lessonData });
    } else {
      createLessonMutation.mutate(lessonData);
    }
  };

  // Media Upload handler
  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) return;
    setUploadingMedia(true);
    try {
      await tutorialsService.uploadMedia(mediaFile, mediaTitle || mediaFile.name);
      setMediaFile(null);
      setMediaTitle('');
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials-media'] });
      triggerSuccess('Media file uploaded successfully!');
    } catch (err) {
      console.error(err);
      triggerError('Failed to upload media.');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Save Config settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSuccess('CMS Settings updated successfully!');
  };

  // Auto-set slug values from names
  const handleSetNameAndSlug = (name: string, setFn: React.Dispatch<React.SetStateAction<any>>) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFn((prev: any) => ({ ...prev, name, slug }));
  };

  const handleSetTitleAndSlug = (title: string, setFn: React.Dispatch<React.SetStateAction<any>>) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFn((prev: any) => ({ ...prev, title, slug }));
  };

  const renderMarkdownPreview = (text: string) => {
    if (!text) return '';
    let parsed = text;
    // Glassmorphic Note containers
    parsed = parsed.replace(/^> Note:\s*(.*)$/gim, `
      <div class="my-3 p-3 bg-blue-500/5 dark:bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl text-blue-900 dark:text-blue-200 backdrop-blur-md shadow-sm">
        <div class="flex items-center gap-1 font-black uppercase tracking-wider text-[9px] text-blue-600 dark:text-blue-400 mb-1">
          Note Context
        </div>
        <p class="text-slate-800 dark:text-slate-300 text-xs">$1</p>
      </div>
    `);
    
    // Glassmorphic Tip containers
    parsed = parsed.replace(/^> Tip:\s*(.*)$/gim, `
      <div class="my-3 p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-xl text-emerald-900 dark:text-emerald-200 backdrop-blur-md shadow-sm">
        <div class="flex items-center gap-1 font-black uppercase tracking-wider text-[9px] text-emerald-600 dark:text-emerald-400 mb-1">
          Pro Tip
        </div>
        <p class="text-slate-800 dark:text-slate-300 text-xs">$1</p>
      </div>
    `);

    // Glassmorphic Warning containers
    parsed = parsed.replace(/^> Warning:\s*(.*)$/gim, `
      <div class="my-3 p-3 bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl text-amber-900 dark:text-amber-205 backdrop-blur-md shadow-sm">
        <div class="flex items-center gap-1 font-black uppercase tracking-wider text-[9px] text-amber-600 dark:text-amber-400 mb-1">
          Caution
        </div>
        <p class="text-slate-800 dark:text-slate-300 text-xs">$1</p>
      </div>
    `);
    
    parsed = parsed.replace(/^###\s*(.*)$/gim, '<h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1">$1</h4>');
    parsed = parsed.replace(/^##\s*(.*)$/gim, '<h3 class="text-sm font-black text-slate-900 dark:text-white mt-4 mb-2 border-b border-slate-100 dark:border-slate-850 pb-1">$1</h3>');
    parsed = parsed.replace(/^#\s*(.*)$/gim, '<h2 class="text-base font-black text-slate-955 dark:text-white mt-5 mb-2">$1</h2>');

    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    parsed = parsed.replace(/`/g, '<code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-red-500 font-mono text-[11px]">$1</code>');
    
    // Code blocks highlight
    parsed = parsed.replace(/```(\w*)\n([\s\S]*?)```/g, '<div class="my-2 bg-slate-900 dark:bg-slate-950 border border-slate-250 dark:border-slate-900 rounded p-2.5 font-mono text-[11px] text-slate-305"><span class="text-[9px] text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-1 mb-1">$1</span><pre class="overflow-x-auto"><code>$2</code></pre></div>');
    
    // Table parser
    parsed = parsed.replace(/\|(.+)\|/g, (_, content) => {
      const cells = content.split('|').map((c: string) => c.trim());
      const isHeader = cells.every((c: string) => c.startsWith('---'));
      if (isHeader) return '';
      return `<tr>\${cells.map((c: string) => \`<td class="px-2 py-1.5 border-b border-slate-100 dark:border-slate-850">\${c}</td>\`).join('')}</tr>`;
    });
    
    parsed = parsed.replace(/\n/g, '<br />');
    return parsed;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-6rem)] animate-fade-in py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. ADMIN SIDEBAR PANELS */}
      <aside className="w-full md:w-56 bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-2xl p-4 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
        <div className="hidden md:flex items-center gap-2 pb-3 mb-2 border-b border-slate-150 dark:border-slate-800">
          <BookOpen className="text-amber-500 shrink-0" size={18} />
          <span className="font-extrabold text-[11px] text-slate-400 uppercase tracking-widest">Tutorials CMS</span>
        </div>
        
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-extrabold border-l-4 border-amber-500 shadow-sm'
              : 'text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 border-l-4 border-transparent'
          }`}
        >
          <BarChart2 size={15} /> Dashboard
        </button>

        <button
          onClick={() => setActiveTab('languages')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
            activeTab === 'languages'
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-extrabold border-l-4 border-amber-500 shadow-sm'
              : 'text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 border-l-4 border-transparent'
          }`}
        >
          <Layers size={15} /> Languages
        </button>

        <button
          onClick={() => setActiveTab('chapters')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
            activeTab === 'chapters'
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-extrabold border-l-4 border-amber-500 shadow-sm'
              : 'text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 border-l-4 border-transparent'
          }`}
        >
          <Folder size={15} /> Chapters
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
            activeTab === 'lessons'
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-extrabold border-l-4 border-amber-500 shadow-sm'
              : 'text-slate-655 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 border-l-4 border-transparent'
          }`}
        >
          <FileText size={15} /> Lessons
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
            activeTab === 'media'
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-extrabold border-l-4 border-amber-500 shadow-sm'
              : 'text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 border-l-4 border-transparent'
          }`}
        >
          <Upload size={15} /> Media Library
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-extrabold border-l-4 border-amber-500 shadow-sm'
              : 'text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 border-l-4 border-transparent'
          }`}
        >
          <Settings size={15} /> Settings
        </button>
      </aside>

      {/* 2. CMS CORE WORKSPACE CONTENT */}
      <main className="flex-1 bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-3xl p-6 relative overflow-hidden">
        {/* Banner Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-xs flex items-center gap-2 animate-scale-in">
            <AlertCircle size={14} /> {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/50 rounded-xl text-xs flex items-center gap-2 animate-scale-in">
            <Check size={14} /> {successMessage}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 1: ANALYTICS DASHBOARD */}
        {/* ==================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-905 dark:text-white">CMS Overview & Analytics</h2>
            
            {analyticsLoading ? (
              <div className="min-h-[30vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Metric count row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Languages</span>
                    <span className="text-2xl font-black font-mono text-blue-500 mt-2">{analytics.total_languages}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Chapters</span>
                    <span className="text-2xl font-black font-mono text-purple-500 mt-2">{analytics.total_chapters}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lessons (Pub/Draft)</span>
                    <span className="text-2xl font-black font-mono text-emerald-500 mt-2">
                      {analytics.published_lessons} <span className="text-xs text-slate-400 font-bold">/ {analytics.draft_lessons}</span>
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Avg Reading Time</span>
                    <span className="text-2xl font-black font-mono text-amber-500 mt-2">{analytics.avg_reading_time}s</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top languages bar chart */}
                  <div className="border border-slate-200 dark:border-slate-850 rounded-2xl p-5 bg-white dark:bg-[#0c0e17] space-y-4">
                    <div>
                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Top Languages</h3>
                      <p className="text-[10px] text-slate-400">Total visual views tracked per programming course</p>
                    </div>
                    
                    <div className="space-y-3.5">
                      {analytics.top_languages.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No views tracked yet.</p>
                      ) : (() => {
                        const maxLangViews = Math.max(...analytics.top_languages.map(l => l.views), 1);
                        return analytics.top_languages.map((lang, idx) => {
                          const percentage = Math.round((lang.views / maxLangViews) * 100);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-700 dark:text-slate-205">{lang.name}</span>
                                <span className="font-mono text-slate-500 font-bold">{lang.views} views</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-650 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Most Viewed Lessons progress bars */}
                  <div className="border border-slate-200 dark:border-slate-850 rounded-2xl p-5 bg-white dark:bg-[#0c0e17] space-y-4">
                    <div>
                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Popular Lessons</h3>
                      <p className="text-[10px] text-slate-400">Individual guides ranking highest in reading metrics</p>
                    </div>

                    <div className="space-y-3.5">
                      {analytics.most_viewed_lessons.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No views recorded.</p>
                      ) : (() => {
                        const maxLessonViews = Math.max(...analytics.most_viewed_lessons.map(l => l.views), 1);
                        return analytics.most_viewed_lessons.map((les, idx) => {
                          const percentage = Math.round((les.views / maxLessonViews) * 100);
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between items-start text-xs gap-3">
                                <div className="truncate flex flex-col min-w-0">
                                  <span className="font-bold text-slate-700 dark:text-slate-205 truncate">{les.title}</span>
                                  <span className="text-[9px] text-slate-450 font-semibold uppercase">{les.language}</span>
                                </div>
                                <span className="font-mono text-slate-500 font-bold shrink-0">{les.views} views</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Failed to load analytics.</p>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: LANGUAGES CRUD PANEL */}
        {/* ==================================================== */}
        {activeTab === 'languages' && (
          <div className="space-y-6 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-905 dark:text-white">Language Management</h2>
              <button 
                onClick={handleOpenCreateLanguage}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
              >
                <Plus size={14} /> Add Language
              </button>
            </div>

            {/* List languages table */}
            {languagesLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-amber-500" size={24} />
              </div>
            ) : languages && languages.length === 0 ? (
              <div className="p-12 text-center">
                <LayoutGrid className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
                <p className="text-slate-500 text-sm">No languages created yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Drag and drop items to reorder language cards</p>
                <div className="space-y-1.5">
                  {languages?.map((lang, index) => (
                    <div
                      key={lang.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index, languages, tutorialsService.reorderLanguages, ['admin-tutorials-languages'])}
                      className={`flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-slate-300 dark:hover:border-slate-750 transition-all select-none cursor-grab active:cursor-grabbing ${
                        draggedIdx === index ? 'opacity-40 scale-[0.98]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <GripVertical size={16} className="text-slate-400 cursor-move shrink-0" />
                        <div className="w-8 h-8 rounded-lg bg-amber-100/40 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {lang.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{lang.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{lang.difficulty}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          lang.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 border-emerald-100'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}>
                          {lang.status}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditLanguage(lang)}
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 cursor-pointer transition-colors"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => { if(confirm('Delete Language?')) deleteLanguageMutation.mutate(lang.id) }}
                            className="p-2 border border-red-200 rounded-xl hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Language Editor Form Modal */}
            {langFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-y-auto max-h-[85vh] p-6 shadow-2xl animate-scale-in">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      {editingLanguage ? 'Edit Language' : 'Create Language'}
                    </h3>
                    <button onClick={() => setLangFormOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400">
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveLanguage} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Language Name</label>
                        <input
                          type="text"
                          required
                          value={langData.name}
                          onChange={(e) => handleSetNameAndSlug(e.target.value, setLangData)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/25"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Slug</label>
                        <input
                          type="text"
                          required
                          value={langData.slug}
                          onChange={(e) => setLangData(prev => ({ ...prev, slug: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/25"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Short Description</label>
                      <textarea
                        value={langData.description}
                        onChange={(e) => setLangData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs h-20 focus:outline-none focus:ring-2 focus:ring-amber-500/25"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Difficulty</label>
                        <select
                          value={langData.difficulty}
                          onChange={(e: any) => setLangData(prev => ({ ...prev, difficulty: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Status</label>
                        <select
                          value={langData.status}
                          onChange={(e: any) => setLangData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Estimated Duration</label>
                        <input
                          type="text"
                          value={langData.estimated_duration}
                          onChange={(e) => setLangData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Lucide Icon (Slug)</label>
                        <input
                          type="text"
                          value={langData.icon}
                          onChange={(e) => setLangData(prev => ({ ...prev, icon: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">SEO Optimization</span>
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Meta Title</label>
                        <input
                          type="text"
                          value={langData.seo_title}
                          onChange={(e) => setLangData(prev => ({ ...prev, seo_title: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Meta Description</label>
                        <textarea
                          value={langData.seo_description}
                          onChange={(e) => setLangData(prev => ({ ...prev, seo_description: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs h-16"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setLangFormOpen(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save size={13} /> Save Language
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: CHAPTERS CRUD PANEL */}
        {/* ==================================================== */}
        {activeTab === 'chapters' && (
          <div className="space-y-6 animate-scale-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-880 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-905 dark:text-white">Chapter Management</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Language:</span>
                  <select
                    value={selectedLangForChapters || ''}
                    onChange={(e) => setSelectedLangForChapters(e.target.value ? Number(e.target.value) : null)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold rounded-lg px-2 py-1 text-slate-600 focus:outline-none"
                  >
                    <option value="">All Languages</option>
                    {languages?.map(lang => (
                      <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleOpenCreateChapter}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all self-end sm:self-auto"
              >
                <Plus size={14} /> Add Chapter
              </button>
            </div>

            {/* List Chapters */}
            {!chapters || chapters.length === 0 ? (
              <div className="p-12 text-center">
                <Folder className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
                <p className="text-slate-500 text-sm">No chapters found for this filter.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Drag and drop chapters within a language to reorder outline</p>
                <div className="space-y-1.5">
                  {chapters.map((chap, index) => {
                    const langName = languages?.find(l => l.id === chap.language)?.name || 'Unknown';
                    return (
                      <div
                        key={chap.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index, chapters, tutorialsService.reorderChapters, ['admin-tutorials-chapters'])}
                        className={`flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-slate-300 dark:hover:border-slate-750 transition-all select-none cursor-grab active:cursor-grabbing ${
                          draggedIdx === index ? 'opacity-40 scale-[0.98]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <GripVertical size={16} className="text-slate-400 cursor-move shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{chap.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{langName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            chap.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 border-emerald-100'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}>
                            {chap.status}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditChapter(chap)}
                              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 cursor-pointer transition-colors"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => { if(confirm('Delete Chapter?')) deleteChapterMutation.mutate(chap.id) }}
                              className="p-2 border border-red-205 rounded-xl hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chapter Modal Form */}
            {chapFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      {editingChapter ? 'Edit Chapter' : 'Create Chapter'}
                    </h3>
                    <button onClick={() => setChapFormOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400">
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveChapter} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Target Language</label>
                      <select
                        required
                        value={chapData.language || ''}
                        onChange={(e) => setChapData(prev => ({ ...prev, language: Number(e.target.value) }))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="">Select language...</option>
                        {languages?.map(lang => (
                          <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Chapter Name</label>
                        <input
                          type="text"
                          required
                          value={chapData.name}
                          onChange={(e) => handleSetNameAndSlug(e.target.value, setChapData)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Slug</label>
                        <input
                          type="text"
                          required
                          value={chapData.slug}
                          onChange={(e) => setChapData(prev => ({ ...prev, slug: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Description</label>
                      <textarea
                        value={chapData.description}
                        onChange={(e) => setChapData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs h-16 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Status</label>
                      <select
                        value={chapData.status}
                        onChange={(e: any) => setChapData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setChapFormOpen(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save size={13} /> Save Chapter
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: LESSONS CRUD PANEL */}
        {/* ==================================================== */}
        {activeTab === 'lessons' && (
          <div className="space-y-6 animate-scale-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-880 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-905 dark:text-white">Lesson Management</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-450 font-bold uppercase">Language:</span>
                    <select
                      value={selectedLangForLessons || ''}
                      onChange={(e) => {
                        setSelectedLangForLessons(e.target.value ? Number(e.target.value) : null);
                        setSelectedChapForLessons(null);
                      }}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg px-2 py-0.5 text-slate-600 focus:outline-none"
                    >
                      <option value="">All Languages</option>
                      {languages?.map(lang => (
                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-450 font-bold uppercase">Chapter:</span>
                    <select
                      value={selectedChapForLessons || ''}
                      onChange={(e) => setSelectedChapForLessons(e.target.value ? Number(e.target.value) : null)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg px-2 py-0.5 text-slate-600 focus:outline-none"
                    >
                      <option value="">All Chapters</option>
                      {chapters?.map(chap => (
                        <option key={chap.id} value={chap.id}>{chap.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleOpenCreateLesson}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all self-end sm:self-auto"
              >
                <Plus size={14} /> Add Lesson
              </button>
            </div>

            {/* Lessons list */}
            {!lessons || lessons.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
                <p className="text-slate-500 text-sm">No lessons found matching filters.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Drag and drop lessons to reorder display index</p>
                <div className="space-y-1.5">
                  {lessons.map((les, index) => {
                    const langName = languages?.find(l => l.id === les.language)?.name || '';
                    return (
                      <div
                        key={les.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index, lessons, tutorialsService.reorderLessons, ['admin-tutorials-lessons'])}
                        className={`flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-slate-300 dark:hover:border-slate-755 transition-all select-none cursor-grab active:cursor-grabbing ${
                          draggedIdx === index ? 'opacity-40 scale-[0.98]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <GripVertical size={16} className="text-slate-400 cursor-move shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{les.title}</h4>
                            <span className="text-[10px] font-mono text-slate-405 font-bold uppercase">
                              {langName} - {les.chapter_name || 'General'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            les.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 border-emerald-100'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-900 border-slate-200 dark:border-slate-880'
                          }`}>
                            {les.status}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditLesson(les)}
                              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 cursor-pointer transition-colors"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => { if(confirm('Delete Lesson?')) deleteLessonMutation.mutate(les.id) }}
                              className="p-2 border border-red-200 rounded-xl hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lesson sliding panel / modal builder */}
            {lessonFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-[#0c0e17] border-l border-slate-200 dark:border-slate-800 w-full max-w-5xl h-screen overflow-y-auto p-6 shadow-2xl flex flex-col justify-between animate-slide-left">
                  
                  {/* Modal header */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3 mb-4 shrink-0">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      {editingLesson ? 'Build & Edit Lesson' : 'Create New Lesson'}
                    </h3>
                    <button onClick={() => setLessonFormOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveLesson} className="flex-1 space-y-5 overflow-y-auto pr-2 pb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Target Language</label>
                        <select
                          required
                          value={lessonData.language || ''}
                          onChange={(e) => {
                            const lId = Number(e.target.value);
                            setLessonData(prev => ({ ...prev, language: lId }));
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="">Select Language...</option>
                          {languages?.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Target Chapter</label>
                        <select
                          required
                          value={lessonData.chapter || ''}
                          onChange={(e) => setLessonData(prev => ({ ...prev, chapter: Number(e.target.value) }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="">Select Chapter...</option>
                          {/* Filter chapters by language selected */}
                          {chapters?.filter(c => c.language === lessonData.language).map(chap => (
                            <option key={chap.id} value={chap.id}>{chap.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Lesson Title</label>
                        <input
                          type="text"
                          required
                          value={lessonData.title}
                          onChange={(e) => handleSetTitleAndSlug(e.target.value, setLessonData)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Slug</label>
                        <input
                          type="text"
                          required
                          value={lessonData.slug}
                          onChange={(e) => setLessonData(prev => ({ ...prev, slug: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Reading Time (min)</label>
                        <input
                          type="number"
                          value={lessonData.estimated_reading_time}
                          onChange={(e) => setLessonData(prev => ({ ...prev, estimated_reading_time: Number(e.target.value) }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Publish Status</label>
                        <select
                          value={lessonData.status}
                          onChange={(e: any) => setLessonData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    {/* 50/50 Split editor and preview layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start border-t border-b border-slate-100 dark:border-slate-850 py-4">
                      {/* Left side: Markdown Input Editor with templates toolbar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] text-slate-455 dark:text-slate-550 font-bold uppercase tracking-wider">Lesson Content (Markdown)</label>
                          <span className="text-[9px] text-amber-500 font-bold font-mono">Helper Toolbar</span>
                        </div>
                        
                        {/* Visual markdown template buttons */}
                        <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-205 dark:border-slate-850">
                          {([
                            { label: 'H2', template: '\n## Heading 2\n', desc: 'Heading' },
                            { label: 'H3', template: '\n### Heading 3\n', desc: 'Subheading' },
                            { label: 'B', template: '**BoldText**', desc: 'Bold' },
                            { label: 'I', template: '*ItalicText*', desc: 'Italic' },
                            { label: 'Code', template: '\n```python\n# write python examples\n```\n', desc: 'Python Sandbox Block' },
                            { label: 'Note', template: '\n> Note: Write alert info here.\n', desc: 'Note Block' },
                            { label: 'Tip', template: '\n> Tip: Write helper tip here.\n', desc: 'Tip Block' },
                            { label: 'Warning', template: '\n> Warning: Write warning cautions here.\n', desc: 'Warning Box' },
                            { label: 'Table', template: '\n| Title | Header |\n|---|---|\n| Value 1 | Value 2 |\n', desc: 'Table Layout' }
                          ]).map((btn, idx) => (
                            <button
                              key={idx}
                              type="button"
                              title={btn.desc}
                              onClick={() => {
                                setLessonData(prev => ({
                                  ...prev,
                                  content: (prev.content || '') + btn.template
                                }));
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-slate-100 dark:bg-[#0c0e17] dark:hover:bg-slate-800 text-slate-655 dark:text-slate-350 rounded border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={lessonData.content || ''}
                          onChange={(e) => setLessonData(prev => ({ ...prev, content: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs h-72 focus:outline-none font-mono"
                          placeholder="Write paragraph blocks, headers, note callouts..."
                        />
                      </div>

                      {/* Right side: Real-time Live Rendering */}
                      <div className="space-y-2">
                        <label className="block text-[10px] text-slate-455 dark:text-slate-550 font-bold uppercase tracking-wider">Live Preview Reader</label>
                        <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-inner bg-slate-50/30 dark:bg-slate-950/20">
                          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Student View Simulation
                          </div>
                          <div className="p-4 h-72 overflow-y-auto bg-white dark:bg-[#07080d] prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-4">
                            {lessonData.content ? (
                              <div dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(lessonData.content) }} />
                            ) : (
                              <span className="text-slate-400 italic">No content written yet. Live preview will render here...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Editor content starter configurations */}
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-4">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Interactive Code Sandbox Config</span>
                      <div>
                        <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Starter Code Example</label>
                        <textarea
                          value={lessonData.code_example}
                          onChange={(e) => setLessonData(prev => ({ ...prev, code_example: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs h-20 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Expected Output (Optional)</label>
                        <input
                          type="text"
                          value={lessonData.code_output}
                          onChange={(e) => setLessonData(prev => ({ ...prev, code_output: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Code Explanation</label>
                        <textarea
                          value={lessonData.code_explanation}
                          onChange={(e) => setLessonData(prev => ({ ...prev, code_explanation: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs h-16"
                        />
                      </div>
                    </div>

                    {/* Tags and SEO */}
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Tags & SEO Optimization</span>
                      <div>
                        <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Tags (Comma-separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. variables, syntax, python3"
                          value={lessonData.tags}
                          onChange={(e) => setLessonData(prev => ({ ...prev, tags: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">SEO Meta Title</label>
                        <input
                          type="text"
                          value={lessonData.seo_title}
                          onChange={(e) => setLessonData(prev => ({ ...prev, seo_title: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">SEO Description</label>
                        <textarea
                          value={lessonData.seo_description}
                          onChange={(e) => setLessonData(prev => ({ ...prev, seo_description: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs h-16"
                        />
                      </div>
                    </div>
                  </form>

                  {/* Drawer Footer Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2 shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setLessonFormOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveLesson}
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save size={13} /> Save Lesson Details
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: MEDIA CRUD PANEL */}
        {/* ==================================================== */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-scale-in">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Media Library</h2>
            
            {/* Upload media form */}
            <form onSubmit={handleUploadMedia} className="p-4 bg-slate-50 dark:bg-slate-905/30 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Upload Image or Video asset</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Asset File</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 dark:file:bg-amber-950/20 dark:file:text-amber-400 hover:file:bg-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Asset Title (Optional)</label>
                  <input
                    type="text"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="e.g. loops-flowchart"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!mediaFile || uploadingMedia}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {uploadingMedia ? <Loader2 className="animate-spin" size={13} /> : <Upload size={13} />}
                  Upload Asset
                </button>
              </div>
            </form>

            {/* List Media library */}
            {mediaLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-amber-500" size={24} />
              </div>
            ) : media && media.length === 0 ? (
              <div className="p-12 text-center">
                <Upload className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
                <p className="text-slate-500 text-sm">No media files uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {media?.map((m) => (
                  <div key={m.id} className="border border-slate-250 dark:border-slate-850 bg-slate-50/20 rounded-2xl overflow-hidden p-3 relative group flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                      <img src={m.file} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block truncate">{m.title}</span>
                      <span className="text-[9px] text-slate-400 block">{m.media_type}</span>
                    </div>

                    <div className="flex gap-1.5 mt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(m.file);
                          triggerSuccess('Asset link copied to clipboard!');
                        }}
                        className="flex-1 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Copy size={10} /> Copy Link
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete media file?')) {
                            try {
                              await tutorialsService.deleteMedia(m.id);
                              queryClient.invalidateQueries({ queryKey: ['admin-tutorials-media'] });
                              triggerSuccess('Media deleted.');
                            } catch {
                              triggerError('Failed to delete media.');
                            }
                          }
                        }}
                        className="p-1.5 border border-red-200 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: SETTINGS PANEL */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-scale-in">
            <h2 className="text-lg font-bold text-slate-905 dark:text-white">CMS Settings</h2>
            
            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-xl">
              <div className="bg-slate-50/50 dark:bg-slate-950/10 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Site / Platform Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">SEO Default Keywords</label>
                  <input
                    type="text"
                    value={settings.seoDefaultKeywords}
                    onChange={(e) => setSettings(prev => ({ ...prev, seoDefaultKeywords: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Interactive Editor Sandbox</span>
                    <span className="text-[10px] text-slate-400">Allows compiling code snippets using Judge0</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableSandbox}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableSandbox: e.target.checked }))}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Estimated Duration Label</span>
                    <span className="text-[10px] text-slate-400">Display duration metrics on course cards</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showEstDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, showEstDuration: e.target.checked }))}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Save size={13} />
                  Save CMS Configuration
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default TutorialsAdminPanel;
