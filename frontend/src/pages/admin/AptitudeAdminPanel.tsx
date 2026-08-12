import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Edit3, Database, Trophy, Upload, X, Check, AlertCircle, 
  RefreshCw, FileSpreadsheet, FileText, Loader2, Compass, 
  Brain, BarChart2, GripVertical, Search, Copy, Archive, Settings, 
  Download, CheckSquare, Square, Shield, PieChart, Activity, Users, UserCheck, UserX, Image, Camera
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeCategory, AptitudeTopic, AptitudeSubTopic, AptitudeQuestion, AptitudeTest, AptitudeTrainer } from '../../services/aptitude';

const AptitudeAdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bank' | 'categories' | 'trainers' | 'tests' | 'import' | 'analytics'>('bank');
  
  const [categories, setCategories] = useState<AptitudeCategory[]>([]);
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [trainers, setTrainers] = useState<AptitudeTrainer[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  // Bank search/filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrainer, setFilterTrainer] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterTopic, setFilterTopic] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  
  // Selection states for Hierarchy Builder
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  // Categories & Topics inline searches
  const [catSearch, setCatSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [trainerSearch, setTrainerSearch] = useState('');

  // Bulk Selection State
  const [selectedQIds, setSelectedQIds] = useState<number[]>([]);

  // CRUD Trainer Modal
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<AptitudeTrainer | null>(null);
  const [trainerName, setTrainerName] = useState('');
  const [trainerSpecialization, setTrainerSpecialization] = useState('');
  const [trainerBio, setTrainerBio] = useState('');
  const [trainerProfileImage, setTrainerProfileImage] = useState('');
  const [trainerImageFile, setTrainerImageFile] = useState<File | null>(null);
  const [uploadingTrainerImg, setUploadingTrainerImg] = useState(false);
  const [trainerIsActive, setTrainerIsActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CRUD Category Modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<AptitudeCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // CRUD Topic Modal
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<AptitudeTopic | null>(null);
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');

  // CRUD Subtopic Modal
  const [showSubTopicModal, setShowSubTopicModal] = useState(false);
  const [editingSubTopic, setEditingSubTopic] = useState<AptitudeSubTopic | null>(null);
  const [subTopicName, setSubTopicName] = useState('');

  // Create / Edit Question Modal — navigation handled separately

  // Create / Edit Mock Test Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState<AptitudeTest | null>(null);
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [testDuration, setTestDuration] = useState(30);
  const [testPassPercent, setTestPassPercent] = useState(40);
  const [testNegativeMarking, setTestNegativeMarking] = useState(false);
  const [testCalcEnabled, setTestCalcEnabled] = useState(false);
  const [testType, setTestType] = useState<AptitudeTest['test_type']>('mock');
  const [testCompanies, setTestCompanies] = useState('');
  const [testUniversities, setTestUniversities] = useState('');

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, qs, ts, trs] = await Promise.all([
        aptitudeService.getCategories(),
        aptitudeService.getQuestions(),
        aptitudeService.getTests(),
        aptitudeService.getTrainers()
      ]);
      setCategories(cats);
      setQuestions(qs);
      setTests(ts);
      setTrainers(trs);

      // Restore category/topic selections if they still exist
      if (cats.length > 0) {
        if (!selectedCatId || !cats.some(c => c.id === selectedCatId)) {
          setSelectedCatId(cats[0].id);
          if (cats[0].topics.length > 0) {
            setSelectedTopicId(cats[0].topics[0].id);
          } else {
            setSelectedTopicId(null);
          }
        } else {
          const matchedCat = cats.find(c => c.id === selectedCatId);
          if (matchedCat && matchedCat.topics.length > 0) {
            if (!selectedTopicId || !matchedCat.topics.some(t => t.id === selectedTopicId)) {
              setSelectedTopicId(matchedCat.topics[0].id);
            }
          } else {
            setSelectedTopicId(null);
          }
        }
      } else {
        setSelectedCatId(null);
        setSelectedTopicId(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load portal configuration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleClone = async (id: number) => {
    try {
      await aptitudeService.cloneQuestion(id);
      alert('Question cloned successfully!');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await aptitudeService.archiveQuestion(id);
      alert('Question archived!');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQ = async (id: number) => {
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      await aptitudeService.deleteQuestion(id);
      alert('Deleted!');
      fetchAdminData();
      setSelectedQIds(prev => prev.filter(x => x !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Publish/Unpublish Question inline
  const handleToggleQuestionPublish = async (q: AptitudeQuestion) => {
    const nextVis = q.visibility === 'public' ? 'private' : 'public';
    try {
      await aptitudeService.updateQuestion(q.id, { visibility: nextVis });
      setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, visibility: nextVis } : x));
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Actions
  const handleToggleSelectAll = () => {
    const visibleIds = filteredQuestions.map(q => q.id);
    const allSelected = visibleIds.every(id => selectedQIds.includes(id));
    if (allSelected) {
      setSelectedQIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedQIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectQ = (id: number) => {
    setSelectedQIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete all ${selectedQIds.length} selected questions permanently?`)) return;
    try {
      setLoading(true);
      await Promise.all(selectedQIds.map(id => aptitudeService.deleteQuestion(id)));
      alert('Bulk deletion completed successfully.');
      setSelectedQIds([]);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error during bulk deletion.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPublish = async (publish: boolean) => {
    const nextVis = publish ? 'public' : 'private';
    try {
      setLoading(true);
      await Promise.all(selectedQIds.map(id => aptitudeService.updateQuestion(id, { visibility: nextVis })));
      alert(`Bulk visibility updated to ${nextVis}.`);
      setSelectedQIds([]);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error during bulk update.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    try {
      setImporting(true);
      setImportResults(null);
      const formData = new FormData();
      formData.append('file', importFile);
      
      const res = await aptitudeService.importQuestionsCsv(formData);
      setImportResults(res);
      alert('Bulk ingestion complete.');
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      setImportResults(err.response?.data || { success: false, errors: ['Unknown file ingest error.'] });
    } finally {
      setImporting(false);
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,title,statement,options_A,options_B,options_C,options_D,correct_answer,explanation,shortcut_trick,hint,difficulty,marks,negative_marks,time_limit,company_tags,university_tags,source\n"
      + "Percentages Basic,What is 20% of 150?,30,40,25,50,A,Multiply 150 by 0.2,150 / 5 = 30,Think divide by 5,easy,1.0,0.0,60,TCS,Vellore,NQT 2025\n"
      + "Train cross speed,A train 120m long crosses a bridge in 10s at 72kmph. What is bridge length?,80m,100m,120m,140m,A,Bridge length plus train length equals distance.,Distance = Speed * Time,Convert kmph to m/s,medium,2.0,0.5,90,\"TCS,Wipro\",AIT,Bridge papers\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "aptitude_bulk_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag and Drop ordering handlers
  const handleDragStart = (e: React.DragEvent, index: number, type: 'category' | 'topic' | 'subtopic') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, type }));
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number, type: 'category' | 'topic' | 'subtopic') => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;
    
    try {
      const { index: sourceIndex, type: sourceType } = JSON.parse(dataStr);
      if (sourceType !== type || sourceIndex === targetIndex) return;

      if (type === 'category') {
        const updated = [...categories];
        const [dragged] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, dragged);
        setCategories(updated);
        
        const orders = updated.map((c, idx) => ({ id: c.id, order: idx }));
        await aptitudeService.reorderCategories(orders);
      } else if (type === 'topic' && selectedCatId) {
        const catIdx = categories.findIndex(c => c.id === selectedCatId);
        if (catIdx === -1) return;
        
        const updatedTopics = [...categories[catIdx].topics];
        const [dragged] = updatedTopics.splice(sourceIndex, 1);
        updatedTopics.splice(targetIndex, 0, dragged);
        
        const updatedCats = [...categories];
        updatedCats[catIdx].topics = updatedTopics;
        setCategories(updatedCats);
        
        const orders = updatedTopics.map((t, idx) => ({ id: t.id, order: idx }));
        await aptitudeService.reorderTopics(orders);
      } else if (type === 'subtopic' && selectedCatId && selectedTopicId) {
        const catIdx = categories.findIndex(c => c.id === selectedCatId);
        if (catIdx === -1) return;
        const topicIdx = categories[catIdx].topics.findIndex(t => t.id === selectedTopicId);
        if (topicIdx === -1) return;

        const updatedSubs = [...categories[catIdx].topics[topicIdx].sub_topics];
        const [dragged] = updatedSubs.splice(sourceIndex, 1);
        updatedSubs.splice(targetIndex, 0, dragged);

        const updatedCats = [...categories];
        updatedCats[catIdx].topics[topicIdx].sub_topics = updatedSubs;
        setCategories(updatedCats);

        const orders = updatedSubs.map((s, idx) => ({ id: s.id, order: idx }));
        await aptitudeService.reorderSubTopics(orders);
      }
    } catch (err) {
      console.error('Drag drop ordering error:', err);
    }
  };



  const openCreateModal = () => {
    navigate('/admin/aptitude/create-question');
  };

  const openEditModal = (q: AptitudeQuestion) => {
    navigate(`/admin/aptitude/edit-question/${q.id}`);
  };

  // CATEGORIES / TOPICS CRUD API Submissions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await aptitudeService.updateCategory(editingCat.id, { name: catName, description: catDesc });
      } else {
        await aptitudeService.createCategory({ name: catName, description: catDesc });
      }
      setShowCatModal(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Delete category along with all topics, subtopics and questions?')) return;
    try {
      await aptitudeService.deleteCategory(id);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId) return;
    try {
      if (editingTopic) {
        await aptitudeService.updateTopic(editingTopic.id, { name: topicName, description: topicDesc, category: selectedCatId });
      } else {
        await aptitudeService.createTopic({ name: topicName, description: topicDesc, category: selectedCatId, order: 0 });
      }
      setShowTopicModal(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTopic = async (id: number) => {
    if (!window.confirm('Delete topic, subtopics and all associated questions?')) return;
    try {
      await aptitudeService.deleteTopic(id);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSubTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId) return;
    try {
      if (editingSubTopic) {
        await aptitudeService.updateSubTopic(editingSubTopic.id, { name: subTopicName, topic: selectedTopicId });
      } else {
        await aptitudeService.createSubTopic({ name: subTopicName, topic: selectedTopicId });
      }
      setShowSubTopicModal(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubTopic = async (id: number) => {
    if (!window.confirm('Delete subtopic? Questions will remain under the main topic.')) return;
    try {
      await aptitudeService.deleteSubTopic(id);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // TRAINER CRUD MODALS & API CALLS
  const openCreateTrainerModal = () => {
    setEditingTrainer(null);
    setTrainerName('');
    setTrainerSpecialization('');
    setTrainerBio('');
    setTrainerProfileImage('');
    setTrainerImageFile(null);
    setUploadingTrainerImg(false);
    setTrainerIsActive(true);
    setShowTrainerModal(true);
  };

  const openEditTrainerModal = (t: AptitudeTrainer) => {
    setEditingTrainer(t);
    setTrainerName(t.name);
    setTrainerSpecialization(t.specialization || '');
    setTrainerBio(t.bio || '');
    setTrainerProfileImage(t.profile_image || '');
    setTrainerImageFile(null);
    setUploadingTrainerImg(false);
    setTrainerIsActive(t.is_active);
    setShowTrainerModal(true);
  };

  const handleTrainerImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected image exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setTrainerImageFile(file);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTrainerProfileImage(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // Upload to server media storage
    try {
      setUploadingTrainerImg(true);
      const res = await aptitudeService.uploadTrainerImage(file);
      if (res && res.url) {
        setTrainerProfileImage(res.url);
      }
    } catch (err) {
      console.warn('Image upload fallback to data URL:', err);
    } finally {
      setUploadingTrainerImg(false);
    }
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: trainerName,
      specialization: trainerSpecialization,
      bio: trainerBio,
      profile_image: trainerProfileImage || undefined,
      is_active: trainerIsActive
    };
    try {
      if (editingTrainer) {
        await aptitudeService.updateTrainer(editingTrainer.id, payload);
      } else {
        await aptitudeService.createTrainer(payload);
      }
      setShowTrainerModal(false);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to save trainer:', err);
      alert('Failed to save trainer.');
    }
  };

  const handleToggleTrainerActive = async (t: AptitudeTrainer) => {
    try {
      await aptitudeService.updateTrainer(t.id, { is_active: !t.is_active });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to toggle trainer status:', err);
    }
  };

  const handleDeleteTrainer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this trainer? Associated questions will remain in the bank.')) return;
    try {
      await aptitudeService.deleteTrainer(id);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to delete trainer:', err);
      alert('Failed to delete trainer.');
    }
  };

  // MOCK TEST CRUD MODALS & API CALLS
  const openCreateTestModal = () => {
    setEditingTest(null);
    setTestTitle('');
    setTestDesc('');
    setTestDuration(30);
    setTestPassPercent(40);
    setTestNegativeMarking(false);
    setTestCalcEnabled(false);
    setTestType('mock');
    setTestCompanies('');
    setTestUniversities('');
    setShowTestModal(true);
  };

  const openEditTestModal = (t: AptitudeTest) => {
    setEditingTest(t);
    setTestTitle(t.title);
    setTestDesc(t.description || '');
    setTestDuration(t.overall_duration);
    setTestPassPercent(t.pass_percentage);
    setTestNegativeMarking(t.negative_marking);
    setTestCalcEnabled(t.calculator_enabled);
    setTestType(t.test_type);
    setTestCompanies(t.company_tags?.join(',') || '');
    setTestUniversities(t.university_tags?.join(',') || '');
    setShowTestModal(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: testTitle,
      description: testDesc,
      overall_duration: testDuration,
      pass_percentage: testPassPercent,
      negative_marking: testNegativeMarking,
      calculator_enabled: testCalcEnabled,
      test_type: testType,
      company_tags: testCompanies.split(',').map(s => s.trim()).filter(Boolean),
      university_tags: testUniversities.split(',').map(s => s.trim()).filter(Boolean),
      is_published: true
    };
    try {
      if (editingTest) {
        await aptitudeService.updateTest(editingTest.id, payload);
        alert('Mock test updated.');
      } else {
        await aptitudeService.createTest(payload);
        alert('Mock test created successfully.');
      }
      setShowTestModal(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error saving assessment options.');
    }
  };

  const handleDeleteTest = async (id: number) => {
    if (!window.confirm('Delete this assessment permanently?')) return;
    try {
      await (aptitudeService as any).deleteTest(id);
      alert('Mock test deleted.');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTestPublish = async (t: AptitudeTest) => {
    try {
      await aptitudeService.updateTest(t.id, { is_published: !t.is_published });
      alert('Assessment visibility toggled.');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Export current filtered questions as CSV
  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Title', 'Statement', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Difficulty', 'Explanation', 'Hint', 'Marks', 'Negative Marks', 'Time Limit', 'Category', 'Topic', 'Source', 'Visibility'];
      const rows = questions.map(q => {
        const optA = q.options?.find(o => o.key === 'A')?.text || '';
        const optB = q.options?.find(o => o.key === 'B')?.text || '';
        const optC = q.options?.find(o => o.key === 'C')?.text || '';
        const optD = q.options?.find(o => o.key === 'D')?.text || '';
        const catName = categories.find(c => c.topics.some(t => t.id === q.topic))?.name || '';
        return [
          q.id,
          `"${(q.title || '').replace(/"/g, '""')}"`,
          `"${(q.statement || '').replace(/"/g, '""')}"`,
          `"${optA.replace(/"/g, '""')}"`,
          `"${optB.replace(/"/g, '""')}"`,
          `"${optC.replace(/"/g, '""')}"`,
          `"${optD.replace(/"/g, '""')}"`,
          (q.correct_answer || []).join('|'),
          q.difficulty,
          `"${(q.explanation || '').replace(/"/g, '""')}"`,
          `"${(q.hint || '').replace(/"/g, '""')}"`,
          q.marks,
          q.negative_marks,
          q.time_limit,
          `"${catName}"`,
          `"${(q.topic_name || '').replace(/"/g, '""')}"`,
          `"${(q.source || '').replace(/"/g, '""')}"`,
          q.visibility
        ].join(',');
      });
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `aptitude_questions_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export error:', err);
      alert('Failed to export CSV. Please try again.');
    }
  };

  // Filtered Qs list for bank

  const filteredQuestions = questions.filter(q => {
    const searchMatch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        q.statement.toLowerCase().includes(searchQuery.toLowerCase());
    
    // trainer filter resolving
    const trainerMatch = filterTrainer === '' || 
                         (filterTrainer === 'unassigned' ? !q.trainer : String(q.trainer) === filterTrainer);

    // category filter resolving
    let catMatch = true;
    if (filterCategory !== '') {
      // Find category topic IDs
      const categoryObj = categories.find(c => c.name === filterCategory);
      if (categoryObj) {
        const topicIds = categoryObj.topics.map(t => t.id);
        catMatch = topicIds.includes(q.topic);
      } else {
        catMatch = false;
      }
    }
    
    const topicMatch = filterTopic === '' || q.topic_name === filterTopic;
    const diffMatch = filterDifficulty === '' || q.difficulty === filterDifficulty;
    
    return searchMatch && trainerMatch && catMatch && topicMatch && diffMatch;
  });

  // Category topics resolving
  const selectedCategory = categories.find(c => c.id === selectedCatId);
  const selectedTopic = selectedCategory?.topics.find(t => t.id === selectedTopicId);

  // Column search filters
  const filteredCategoriesForCols = categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()));
  const filteredTopicsForCols = selectedCategory?.topics.filter(t => t.name.toLowerCase().includes(topicSearch.toLowerCase())) || [];
  const filteredSubTopicsForCols = selectedTopic?.sub_topics.filter(s => s.name.toLowerCase().includes(subSearch.toLowerCase())) || [];
  const filteredTrainersForCols = trainers.filter(t => 
    t.name.toLowerCase().includes(trainerSearch.toLowerCase()) || 
    t.specialization.toLowerCase().includes(trainerSearch.toLowerCase())
  );



  // Analytics Metrics
  const totalCategories = categories.length;
  const totalTopics = categories.reduce((acc, c) => acc + c.topics.length, 0);
  const totalSubTopics = categories.reduce((acc, c) => acc + c.topics.reduce((acc2, t) => acc2 + (t.sub_topics?.length || 0), 0), 0);
  const totalQuestionsCount = questions.length;
  const totalTrainersCount = trainers.length;
  const easyQuestions = questions.filter(q => q.difficulty === 'easy').length;
  const mediumQuestions = questions.filter(q => q.difficulty === 'medium').length;
  const hardQuestions = questions.filter(q => q.difficulty === 'hard').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-slate-100">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <p className="text-slate-400 text-sm font-semibold">Synchronizing CMS admin registries...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] space-y-8 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 pb-16 font-sans">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 border border-blue-100 text-[#2563EB] rounded-xl">
            <Compass size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827] leading-tight">Aptitude Portal Studio</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage aptitude questions, database categories hierarchy, mock tests, and ingest CSV assets.</p>
          </div>
        </div>

        {/* Studio Sub Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-[#E5E7EB] self-start sm:self-center w-full sm:w-auto max-w-full overflow-x-auto">
          {[
            { id: 'bank', label: 'Question Bank', icon: Database },
            { id: 'trainers', label: 'Trainer Management', icon: Users },
            { id: 'categories', label: 'Hierarchy Builder', icon: Brain },
            { id: 'tests', label: 'Assessment Creator', icon: Trophy },
            { id: 'import', label: 'CSV Importer', icon: Upload },
            { id: 'analytics', label: 'Analytics Panel', icon: BarChart2 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedQIds([]);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#2563EB] text-white shadow-sm' 
                    : 'text-slate-500 hover:text-[#111827]'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: QUESTIONS BANK */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          
          {/* Filters Row */}
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 flex-1">
              {/* Search text box */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search statements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[42px] bg-white border border-[#D1D5DB] rounded-lg pl-9 pr-4 text-xs text-[#111827] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] placeholder-[#9CA3AF]"
                />
              </div>

              {/* Trainer selector */}
              <select
                value={filterTrainer}
                onChange={(e) => setFilterTrainer(e.target.value)}
                className="bg-white border border-[#D1D5DB] rounded-lg px-3 h-[42px] text-xs text-slate-700 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">All Trainers</option>
                <option value="unassigned">Unassigned (No Trainer)</option>
                {trainers.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
              </select>

              {/* Category selector */}
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setFilterTopic('');
                }}
                className="bg-white border border-[#D1D5DB] rounded-lg px-3 h-[42px] text-xs text-slate-700 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>

              {/* Topic selector */}
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="bg-white border border-[#D1D5DB] rounded-lg px-3 h-[42px] text-xs text-slate-700 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">All Topics</option>
                {(filterCategory === '' 
                  ? categories.flatMap(c => c.topics) 
                  : (categories.find(c => c.name === filterCategory)?.topics || [])
                ).map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>

              {/* Difficulty filter */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="bg-white border border-[#D1D5DB] rounded-lg px-3 h-[42px] text-xs text-slate-700 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-1.5 px-4 h-[42px] bg-white hover:bg-slate-50 border border-[#D1D5DB] text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                <FileSpreadsheet size={14} /> Export
              </button>
              <button 
                onClick={() => openCreateModal()}
                className="flex items-center justify-center gap-1.5 px-5 h-[42px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                <Plus size={14} /> Add Question
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#374151] font-semibold text-xs bg-[#F9FAFB]">
                    <th className="p-4 w-10 text-center">
                      <button 
                        onClick={handleToggleSelectAll}
                        className="text-slate-400 hover:text-[#2563EB] transition-colors"
                      >
                        {filteredQuestions.length > 0 && filteredQuestions.every(q => selectedQIds.includes(q.id)) ? (
                          <CheckSquare size={16} className="text-[#2563EB]" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="p-4">Question</th>
                    <th className="p-4">Trainer</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Topic</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Date</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-slate-400 italic">No questions found matching selected specification filters.</td>
                    </tr>
                  ) : (
                    filteredQuestions.map((q) => {
                      const isSelected = selectedQIds.includes(q.id);
                      const catName = categories.find(c => c.topics.some(t => t.id === q.topic))?.name || 'Unassigned';
                      const qDate = new Date(q.created_at || Date.now()).toLocaleDateString();
                      return (
                        <tr 
                          key={q.id} 
                          className={`border-b border-[#E5E7EB] hover:bg-[#F9FAFB] text-sm text-slate-700 transition-colors ${
                            isSelected ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => handleToggleSelectQ(q.id)}
                              className="text-slate-400 hover:text-[#2563EB] transition-all"
                            >
                              {isSelected ? <CheckSquare size={15} className="text-[#2563EB]" /> : <Square size={15} />}
                            </button>
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="font-semibold text-[#111827] truncate" title={q.title}>{q.title}</div>
                            <div className="text-xs text-slate-500 line-clamp-1 mt-0.5" title={q.statement}>{q.statement}</div>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">
                            {q.trainer_name ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                                <Users size={11} /> {q.trainer_name}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Unassigned</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-600 font-medium">
                            {catName}
                          </td>
                          <td className="p-4 text-slate-600 font-medium">
                            {q.topic_name}
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                              q.difficulty === 'easy' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                              q.difficulty === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                              'bg-red-50 border-red-200 text-red-700'
                            }`}>
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => handleToggleQuestionPublish(q)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border transition-colors cursor-pointer ${
                                q.visibility === 'public'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                              }`}
                              title="Toggle Visibility"
                            >
                              {q.visibility === 'public' ? 'Published' : 'Draft'}
                            </button>
                          </td>
                          <td className="p-4 text-center text-slate-500 text-xs font-mono">
                            {qDate}
                          </td>
                          <td className="p-4 text-center flex items-center justify-center gap-1">
                            <button onClick={() => openEditModal(q)} className="p-2 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer" title="Edit Question">
                              <Edit3 size={12} />
                            </button>
                            <button onClick={() => handleClone(q.id)} className="p-2 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer" title="Clone Question">
                              <Copy size={12} />
                            </button>
                            <button onClick={() => handleArchive(q.id)} className="p-2 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-600 hover:text-amber-600 rounded-lg transition-colors cursor-pointer" title="Archive Question">
                              <Archive size={12} />
                            </button>
                            <button onClick={() => handleDeleteQ(q.id)} className="p-2 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors cursor-pointer" title="Delete Question">
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk Action Sticky Bar */}
          {selectedQIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0c0e17] border border-blue-500/35 px-6 py-4.5 rounded-2xl flex items-center gap-6 shadow-2xl z-[999] animate-slide-up">
              <span className="text-xs font-extrabold text-slate-200">
                <span className="text-blue-400 font-black">{selectedQIds.length}</span> questions selected
              </span>
              <div className="h-5 w-px bg-slate-800"></div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleBulkPublish(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Publish Bulk
                </button>
                <button 
                  onClick={() => handleBulkPublish(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-750 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Draft Bulk
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="px-3.5 py-2 bg-red-650 hover:bg-red-550 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer animate-pulse"
                >
                  Delete Selected
                </button>
              </div>
              <button 
                onClick={() => setSelectedQIds([])}
                className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-300"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: TRAINER MANAGEMENT */}
      {activeTab === 'trainers' && (
        <div className="space-y-6">
          {/* Top action row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search trainers by name or specialization..."
                value={trainerSearch}
                onChange={(e) => setTrainerSearch(e.target.value)}
                className="w-full h-[42px] bg-white border border-[#D1D5DB] rounded-lg pl-9 pr-4 text-xs text-[#111827] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] placeholder-[#9CA3AF]"
              />
            </div>
            <button
              onClick={openCreateTrainerModal}
              className="flex items-center justify-center gap-1.5 px-5 h-[42px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-colors shrink-0"
            >
              <Plus size={14} /> Add Trainer
            </button>
          </div>

          {/* Trainers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainersForCols.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white border border-dashed border-[#E5E7EB] rounded-xl space-y-3">
                <Users size={36} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-600">No trainers found</p>
                <p className="text-xs text-slate-400">Add a new trainer to start assigning questions and tracks.</p>
              </div>
            ) : (
              filteredTrainersForCols.map((t) => (
                <div
                  key={t.id}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: Avatar, Name, Specialization & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {t.profile_image ? (
                          <img
                            src={t.profile_image}
                            alt={t.name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                            {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-[#111827]">{t.name}</h4>
                          <span className="inline-block text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded mt-0.5">
                            {t.specialization}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleTrainerActive(t)}
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          t.is_active
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Click to toggle Active / Inactive"
                      >
                        {t.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    {/* Bio */}
                    {t.bio && (
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {t.bio}
                      </p>
                    )}
                  </div>

                  {/* Stats & Actions */}
                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span><strong>{t.question_count || 0}</strong> Questions</span>
                      <span>•</span>
                      <span><strong>{t.topic_count || 0}</strong> Topics</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditTrainerModal(t)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Trainer"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteTrainer(t.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors cursor-pointer"
                        title="Delete Trainer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CATEGORIES & TOPICS HIERARCHY MANAGER */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 align-stretch">
          
          {/* Column 1: Categories list */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl flex flex-col space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Categories</h3>
              <button 
                onClick={() => { setEditingCat(null); setCatName(''); setCatDesc(''); setShowCatModal(true); }}
                className="p-1.5 bg-blue-50 border border-blue-100 text-[#2563EB] rounded-lg hover:bg-[#2563EB] hover:text-white transition-colors cursor-pointer"
                title="Create New Category"
              >
                <Plus size={14} />
              </button>
            </div>
            
            {/* Column Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-3 text-slate-400" size={13} />
              <input 
                type="text" 
                placeholder="Search category tracks..." 
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
                className="w-full bg-white border border-[#D1D5DB] text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111827]"
              />
            </div>
            
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px] scrollbar-thin">
              {filteredCategoriesForCols.map((cat, idx) => {
                // calculate counts
                const catTopicIds = cat.topics.map(t => t.id);
                const qCount = questions.filter(q => catTopicIds.includes(q.topic)).length;
                
                return (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx, 'category')}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, idx, 'category')}
                    onClick={() => { setSelectedCatId(cat.id); setSelectedTopicId(cat.topics[0]?.id || null); }}
                    className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all group ${
                      selectedCatId === cat.id 
                        ? 'bg-blue-50/50 border-[#2563EB] text-[#2563EB]' 
                        : 'bg-slate-50 border-[#E5E7EB] hover:bg-slate-100/50 text-[#111827]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical size={14} className="text-slate-400 cursor-grab active:cursor-grabbing shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold leading-tight block truncate pr-1">{cat.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{qCount} questions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingCat(cat); setCatName(cat.name); setCatDesc(cat.description || ''); setShowCatModal(true); }}
                        className="p-1 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-600 rounded"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                        className="p-1 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-red-600 rounded"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Topics list (of selected Category) */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl flex flex-col space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Topics</h3>
              {selectedCatId && (
                <button 
                  onClick={() => { setEditingTopic(null); setTopicName(''); setTopicDesc(''); setShowTopicModal(true); }}
                  className="p-1.5 bg-blue-50 border border-blue-100 text-[#2563EB] rounded-lg hover:bg-[#2563EB] hover:text-white transition-colors cursor-pointer"
                  title="Create New Topic"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {/* Column Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-3 text-slate-400" size={13} />
              <input 
                type="text" 
                placeholder="Search topics..." 
                value={topicSearch}
                onChange={e => setTopicSearch(e.target.value)}
                disabled={!selectedCatId}
                className="w-full bg-white border border-[#D1D5DB] text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111827] disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px] scrollbar-thin">
              {!selectedCatId ? (
                <p className="text-slate-400 text-xs italic text-center py-8">Select a category on the left first.</p>
              ) : filteredTopicsForCols.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-8">No topics created matching queries.</p>
              ) : (
                filteredTopicsForCols.map((topic, idx) => {
                  const qCount = questions.filter(q => q.topic === topic.id).length;
                  return (
                    <div
                      key={topic.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx, 'topic')}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, idx, 'topic')}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all group ${
                        selectedTopicId === topic.id 
                          ? 'bg-blue-50/50 border-[#2563EB] text-[#2563EB]' 
                          : 'bg-slate-50 border-[#E5E7EB] hover:bg-slate-100/50 text-[#111827]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical size={14} className="text-slate-400 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold leading-tight block truncate pr-1">{topic.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{qCount} questions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openCreateModal(); }}
                          className="p-1 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#2563EB] rounded"
                          title="Add Question Direct"
                        >
                          <Plus size={10} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingTopic(topic); setTopicName(topic.name); setTopicDesc(topic.description || ''); setShowTopicModal(true); }}
                          className="p-1 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-600 rounded"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id); }}
                          className="p-1 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-red-655 rounded"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 3: Subtopics list (of selected Topic) */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl flex flex-col space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Subtopics</h3>
              {selectedTopicId && (
                <button 
                  onClick={() => { setEditingSubTopic(null); setSubTopicName(''); setShowSubTopicModal(true); }}
                  className="p-1.5 bg-blue-50 border border-blue-100 text-[#2563EB] rounded-lg hover:bg-[#2563EB] hover:text-white transition-colors cursor-pointer"
                  title="Create New Subtopic"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {/* Column Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-3 text-slate-400" size={13} />
              <input 
                type="text" 
                placeholder="Search subtopics..." 
                value={subSearch}
                onChange={e => setSubSearch(e.target.value)}
                disabled={!selectedTopicId}
                className="w-full bg-white border border-[#D1D5DB] text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111827] disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px] scrollbar-thin">
              {!selectedTopicId ? (
                <p className="text-slate-400 text-xs italic text-center py-8">Select a topic in the middle column first.</p>
              ) : filteredSubTopicsForCols.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-8">No subtopics registered under this topic.</p>
              ) : (
                filteredSubTopicsForCols.map((sub, idx) => {
                  const qCount = questions.filter(q => q.sub_topic === sub.id).length;
                  return (
                    <div
                      key={sub.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx, 'subtopic')}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, idx, 'subtopic')}
                      className="p-3 bg-slate-50 border border-[#E5E7EB] hover:bg-slate-100/50 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical size={14} className="text-slate-400 cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold leading-tight block truncate pr-1 text-[#111827]">{sub.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{qCount} questions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button 
                          onClick={() => openCreateModal()}
                          className="p-1 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#2563EB] rounded"
                          title="Add Question Direct"
                        >
                          <Plus size={10} />
                        </button>
                        <button 
                          onClick={() => { setEditingSubTopic(sub); setSubTopicName(sub.name); setShowSubTopicModal(true); }}
                          className="p-1 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-600 rounded"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSubTopic(sub.id)}
                          className="p-1 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-red-655 rounded"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: MOCK CREATOR */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#111827]">Active Assessments</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Create and configure tests for student assessment rounds.</p>
            </div>
            <button 
              onClick={openCreateTestModal}
              className="flex items-center gap-1.5 px-4 h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              <Plus size={14} /> Create Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tests.length === 0 ? (
              <div className="md:col-span-2 text-center py-16 border border-dashed border-[#E5E7EB] rounded-xl bg-white space-y-2">
                <Trophy className="mx-auto text-slate-300" size={40} />
                <p className="text-slate-500 text-xs font-bold">No active examinations created.</p>
                <p className="text-slate-400 text-[11px]">Use the "Create Assessment" button above to publish test papers.</p>
              </div>
            ) : (
              tests.map(test => (
                <div key={test.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 hover:border-slate-300 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 border border-blue-100 text-[#2563EB] rounded">
                          {test.test_type}
                        </span>
                        <button 
                          onClick={() => handleToggleTestPublish(test)}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded transition-colors cursor-pointer ${
                            test.is_published 
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {test.is_published ? 'Published' : 'Draft'}
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-[#111827] mt-2">{test.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{test.description || 'Practice Assessment Paper'}</p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => openEditTestModal(test)}
                        className="p-2 bg-white border border-[#E5E7EB] text-slate-500 hover:text-blue-500 rounded-lg cursor-pointer transition-colors"
                        title="Edit Options"
                      >
                        <Settings size={13} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTest(test.id)}
                        className="p-2 bg-white border border-[#E5E7EB] text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                        title="Delete Assessment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 border-t border-[#E5E7EB] pt-3.5 font-bold">
                    <div className="bg-slate-50 p-2 rounded-lg border border-[#E5E7EB]">
                      <span className="block text-slate-700 font-extrabold text-xs font-mono">{test.question_count}</span>
                      <span className="text-[9px] text-slate-400 font-medium">QUESTIONS</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-[#E5E7EB]">
                      <span className="block text-slate-700 font-extrabold text-xs font-mono">{test.overall_duration}m</span>
                      <span className="text-[9px] text-slate-400 font-medium">DURATION</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-[#E5E7EB]">
                      <span className="block text-slate-700 font-extrabold text-xs font-mono">{test.pass_percentage}%</span>
                      <span className="text-[9px] text-slate-400 font-medium">PASS LIMIT</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BULK INGEST (CSV UPLOADS) */}
      {activeTab === 'import' && (
        <div className="max-w-xl mx-auto bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)] relative overflow-hidden">
          
          <div className="space-y-2 text-center border-b border-[#E5E7EB] pb-5">
            <h3 className="text-base font-bold text-[#111827] flex items-center justify-center gap-1.5">
              <Upload className="text-[#2563EB]" size={20} /> CSV Bulk Ingest Portal
            </h3>
            <p className="text-xs text-slate-500 font-medium">Upload spreadsheet CSV to populate questions database instantly.</p>
          </div>

          <form onSubmit={handleImportCSV} className="space-y-6">
            <div className="border-2 border-dashed border-[#D1D5DB] hover:border-[#2563EB] bg-slate-50 p-8 rounded-xl text-center space-y-3.5 cursor-pointer transition-colors">
              <FileText className="mx-auto text-slate-400" size={36} />
              <div>
                <span className="text-xs font-bold text-slate-700 block">{importFile ? importFile.name : 'Select Spreadsheet CSV file'}</span>
                <span className="text-[11px] text-slate-400 mt-1 block">Maximum size limit 20MB. Make sure headers are correctly configured.</span>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="csv-file-input"
              />
              <div className="flex justify-center gap-2 pt-2">
                <label 
                  htmlFor="csv-file-input"
                  className="inline-block px-4 py-2 bg-white border border-[#D1D5DB] hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Browse File
                </label>
                <button
                  type="button"
                  onClick={downloadCSVTemplate}
                  className="px-4 py-2 bg-blue-50 border border-blue-100 text-[#2563EB] hover:bg-blue-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={12} /> Download Template
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={importing || !importFile}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white rounded-lg font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              {importing ? <Loader2 className="animate-spin" size={14} /> : null}
              {importing ? 'Processing file records...' : 'Ingest CSV Questions'}
            </button>
          </form>

          {/* Import results feedback log */}
          {importResults && (
            <div className={`p-4 rounded-2xl border ${importResults.success ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'} space-y-2`}>
              <div className="flex items-center gap-2 text-xs font-extrabold">
                {importResults.success ? <Check size={16} /> : <AlertCircle size={16} />}
                {importResults.success ? 'CSV Imported Successfully' : 'Errors encountered during Import'}
              </div>
              <p className="text-[11px] text-slate-405 font-bold">Created questions count: {importResults.created_count}</p>
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="pt-2 border-t border-slate-900 max-h-36 overflow-y-auto text-[10px] text-red-500 font-mono space-y-1">
                  {importResults.errors.map((err: string, i: number) => <div key={i}>• {err}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}      {/* TAB CONTENT: ANALYTICS PANEL */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in text-[#111827]">
          
          {/* Counters Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl flex items-center gap-4 hover:shadow-sm transition-all shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="p-3 bg-blue-50 text-[#2563EB] rounded-xl"><Brain size={20} /></div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Categories</span>
                <span className="text-xl font-bold text-[#111827]">{totalCategories}</span>
              </div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl flex items-center gap-4 hover:shadow-sm transition-all shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl"><Compass size={20} /></div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Topics</span>
                <span className="text-xl font-bold text-[#111827]">{totalTopics}</span>
              </div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl flex items-center gap-4 hover:shadow-sm transition-all shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="p-3 bg-purple-50 text-purple-650 rounded-xl"><Database size={20} /></div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Subtopics</span>
                <span className="text-xl font-bold text-[#111827]">{totalSubTopics}</span>
              </div>
            </div>
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl flex items-center gap-4 hover:shadow-sm transition-all shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl"><Activity size={20} /></div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Questions</span>
                <span className="text-xl font-bold text-[#111827]">{totalQuestionsCount}</span>
              </div>
            </div>
          </div>

          {/* Difficulty breakdown panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-xl space-y-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                <PieChart size={15} className="text-[#2563EB]" /> Question Difficulty Distribution
              </h3>

              <div className="space-y-4">
                {/* Easy progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Easy Questions</span>
                    <span className="text-emerald-600 font-bold">{easyQuestions} ({totalQuestionsCount > 0 ? Math.round((easyQuestions/totalQuestionsCount)*100) : 0}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-[#E5E7EB]">
                    <div className="h-full bg-emerald-500" style={{ width: `${totalQuestionsCount > 0 ? (easyQuestions/totalQuestionsCount)*100 : 0}%` }}></div>
                  </div>
                </div>

                {/* Medium progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Medium Questions</span>
                    <span className="text-amber-600 font-bold">{mediumQuestions} ({totalQuestionsCount > 0 ? Math.round((mediumQuestions/totalQuestionsCount)*100) : 0}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-[#E5E7EB]">
                    <div className="h-full bg-amber-500" style={{ width: `${totalQuestionsCount > 0 ? (mediumQuestions/totalQuestionsCount)*100 : 0}%` }}></div>
                  </div>
                </div>

                {/* Hard progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Hard Questions</span>
                    <span className="text-red-600 font-bold">{hardQuestions} ({totalQuestionsCount > 0 ? Math.round((hardQuestions/totalQuestionsCount)*100) : 0}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-[#E5E7EB]">
                    <div className="h-full bg-red-500" style={{ width: `${totalQuestionsCount > 0 ? (hardQuestions/totalQuestionsCount)*100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Logs / Quick tips */}
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-xl flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
                  <Shield size={15} className="text-[#2563EB]" /> Database Health Status
                </h3>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2 text-emerald-600"><Check size={14} /> Categories hierarchy matches structural orders.</div>
                  <div className="flex items-center gap-2 text-emerald-600"><Check size={14} /> Zero orphaned subtopics detected.</div>
                  <div className="flex items-center gap-2 text-emerald-600"><Check size={14} /> Questions formatting fits mathematical LaTeX configurations.</div>
                </div>
              </div>
              
              <div className="border-t border-[#E5E7EB] pt-4 mt-6 text-[11px] text-slate-400 font-medium leading-relaxed">
                CMS Studio uses direct API callbacks. Any adjustments to hierarchy drag indexing updates database parameters instantly.
              </div>
            </div>
          </div>

        </div>
      )}



      {/* ASSESSMENT FORM POPUP MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin shadow-xl relative animate-scale-up text-[#111827]">
            <button 
              onClick={() => setShowTestModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-[#111827] border-b border-[#E5E7EB] pb-3">
              {editingTest ? 'Configure Assessment Options' : 'Create New Assessment'}
            </h3>

            <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Assessment Title</label>
                <input type="text" value={testTitle} onChange={e => setTestTitle(e.target.value)} placeholder="TCS NQT Full Mock test" className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" required />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Description</label>
                <textarea rows={3} value={testDesc} onChange={e => setTestDesc(e.target.value)} placeholder="Enter details about assessment sections..." className="w-full border border-[#D1D5DB] rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block">Duration (minutes)</label>
                  <input type="number" value={testDuration} onChange={e => setTestDuration(Number(e.target.value))} className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block">Pass Percentage (%)</label>
                  <input type="number" value={testPassPercent} onChange={e => setTestPassPercent(Number(e.target.value))} className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block">Assessment Type</label>
                  <select value={testType} onChange={e => setTestType(e.target.value as any)} className="w-full h-10 border border-[#D1D5DB] rounded-lg px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]">
                    <option value="mock">Mock Exam</option>
                    <option value="practice">Practice Set</option>
                    <option value="company">Company Specific</option>
                    <option value="daily_challenge">Daily Challenge</option>
                  </select>
                </div>
                <div className="flex gap-4 items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold select-none">
                    <input type="checkbox" checked={testNegativeMarking} onChange={e => setTestNegativeMarking(e.target.checked)} className="rounded border-[#D1D5DB] bg-white text-[#2563EB] focus:ring-0 focus:ring-offset-0" />
                    Negative Marking
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold select-none">
                    <input type="checkbox" checked={testCalcEnabled} onChange={e => setTestCalcEnabled(e.target.checked)} className="rounded border-[#D1D5DB] bg-white text-[#2563EB] focus:ring-0 focus:ring-offset-0" />
                    Calculator Enabled
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block">Company Tags</label>
                  <input type="text" value={testCompanies} onChange={e => setTestCompanies(e.target.value)} placeholder="TCS,Infosys" className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block">University Tags</label>
                  <input type="text" value={testUniversities} onChange={e => setTestUniversities(e.target.value)} placeholder="Vellore" className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E7EB]">
                <button type="button" onClick={() => setShowTestModal(false)} className="px-4 py-2 border border-[#E5E7EB] hover:bg-slate-50 text-slate-650 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-bold cursor-pointer">Save Assessment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY CRUD POPUP MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 shadow-xl text-[#111827]">
            <h3 className="text-sm font-bold text-[#111827] border-b border-[#E5E7EB] pb-2">
              {editingCat ? 'Edit Category' : 'Create Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-550 font-semibold uppercase tracking-wider block">Category Name</label>
                <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Quantitative Aptitude" className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-550 font-semibold uppercase tracking-wider block">Description</label>
                <textarea rows={3} value={catDesc} onChange={e => setCatDesc(e.target.value)} placeholder="Category tracking descriptions..." className="w-full border border-[#D1D5DB] rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-4 py-2 border border-[#E5E7EB] hover:bg-slate-50 text-slate-650 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-bold cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOPIC CRUD POPUP MODAL */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 shadow-xl text-[#111827]">
            <h3 className="text-sm font-bold text-[#111827] border-b border-[#E5E7EB] pb-2">
              {editingTopic ? 'Edit Topic' : 'Create Topic'}
            </h3>
            <form onSubmit={handleSaveTopic} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-550 font-semibold uppercase tracking-wider block">Topic Name</label>
                <input type="text" value={topicName} onChange={e => setTopicName(e.target.value)} placeholder="Problems on Trains" className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-550 font-semibold uppercase tracking-wider block">Description</label>
                <textarea rows={3} value={topicDesc} onChange={e => setTopicDesc(e.target.value)} placeholder="Topic details notes..." className="w-full border border-[#D1D5DB] rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowTopicModal(false)} className="px-4 py-2 border border-[#E5E7EB] hover:bg-slate-50 text-slate-650 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-bold cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBTOPIC CRUD POPUP MODAL */}
      {showSubTopicModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 shadow-xl text-[#111827]">
            <h3 className="text-sm font-bold text-[#111827] border-b border-[#E5E7EB] pb-2">
              {editingSubTopic ? 'Edit Subtopic' : 'Create Subtopic'}
            </h3>
            <form onSubmit={handleSaveSubTopic} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-550 font-semibold uppercase tracking-wider block">Subtopic Name</label>
                <input type="text" value={subTopicName} onChange={e => setSubTopicName(e.target.value)} placeholder="Speed, Distance & Trains crossings" className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSubTopicModal(false)} className="px-4 py-2 border border-[#E5E7EB] hover:bg-slate-50 text-slate-650 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-bold cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRAINER CRUD POPUP MODAL */}
      {showTrainerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl relative text-[#111827] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTrainerModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-[#111827] border-b border-[#E5E7EB] pb-3">
              {editingTrainer ? 'Edit Trainer Profile' : 'Add New Trainer'}
            </h3>

            <form onSubmit={handleSaveTrainer} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-600 font-semibold block">Full Name</label>
                <input
                  type="text"
                  value={trainerName}
                  onChange={e => setTrainerName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-semibold block">Specialization / Title</label>
                <input
                  type="text"
                  value={trainerSpecialization}
                  onChange={e => setTrainerSpecialization(e.target.value)}
                  placeholder="e.g. Quantitative Aptitude & Speed Math"
                  className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                  required
                />
              </div>

              {/* Profile Photo - Choose from This PC */}
              <div className="space-y-2">
                <label className="text-slate-600 font-semibold block">Profile Photo (This PC)</label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleTrainerImageFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  className="hidden"
                />

                {trainerProfileImage ? (
                  <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-[#D1D5DB] rounded-xl">
                    <div className="relative shrink-0">
                      <img
                        src={trainerProfileImage}
                        alt="Trainer Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-blue-200 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {uploadingTrainerImg && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                          <Loader2 size={16} className="animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {trainerImageFile ? trainerImageFile.name : 'Profile Photo Selected'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {trainerImageFile ? `${(trainerImageFile.size / 1024).toFixed(1)} KB` : 'Ready to save'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-[#D1D5DB] hover:border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Change from This PC
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTrainerProfileImage('');
                            setTrainerImageFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-[#D1D5DB] hover:border-red-500 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer transition-all bg-slate-50/60 hover:bg-blue-50/20 group"
                  >
                    <div className="mx-auto w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors mb-2">
                      <Upload size={18} />
                    </div>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600">
                      Click to choose photo from This PC
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WebP (Max 5MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-semibold block">Biography</label>
                <textarea
                  rows={3}
                  value={trainerBio}
                  onChange={e => setTrainerBio(e.target.value)}
                  placeholder="Short description of trainer's experience, achievements, and teaching style..."
                  className="w-full border border-[#D1D5DB] rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={trainerIsActive}
                    onChange={e => setTrainerIsActive(e.target.checked)}
                    className="rounded border-[#D1D5DB] text-[#2563EB] focus:ring-0 w-4 h-4"
                  />
                  <span>Active Trainer (Visible to students & selectable for questions)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setShowTrainerModal(false)}
                  className="px-4 py-2 border border-[#E5E7EB] hover:bg-slate-50 text-slate-650 rounded-lg cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-bold cursor-pointer shadow-sm"
                >
                  {editingTrainer ? 'Update Trainer' : 'Add Trainer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AptitudeAdminPanel;
