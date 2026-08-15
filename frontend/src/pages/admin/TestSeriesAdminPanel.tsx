import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Copy, ArrowUp, ArrowDown, X, 
  Layers, Briefcase, FileText, Trophy, Search 
} from 'lucide-react';
import api from '../../services/api';
import testSeriesService from '../../services/testSeries';

const TestSeriesAdminPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'companies' | 'series' | 'tests'>('series');

  // Form modals state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Categories State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Layers');
  const [catType, setCatType] = useState<'coding' | 'aptitude'>('coding');
  const [catOrder, setCatOrder] = useState(0);
  const [catActive, setCatActive] = useState(true);

  // 2. Companies State
  const [compName, setCompName] = useState('');
  const [compLogo, setCompLogo] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compWeb, setCompWeb] = useState('');
  const [compOrder, setCompOrder] = useState(0);
  const [compActive, setCompActive] = useState(true);

  // 3. Series State
  const [serCompany, setSerCompany] = useState('');
  const [serCategory, setSerCategory] = useState('');
  const [serName, setSerName] = useState('');
  const [serDesc, setSerDesc] = useState('');
  const [serDiff, setSerDiff] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [serThumb, setSerThumb] = useState('');
  const [serValidity, setSerValidity] = useState(90);
  const [serOrder, setSerOrder] = useState(0);
  const [serPub, setSerPub] = useState(true);

  // 4. Test State
  const [testSeriesId, setTestSeriesId] = useState('');
  const [testName, setTestName] = useState('');
  const [testNum, setTestNum] = useState(1);
  const [testDesc, setTestDesc] = useState('');
  const [testDur, setTestDur] = useState(30);
  const [testMarks, setTestMarks] = useState(100);
  const [testNeg, setTestNeg] = useState(false);
  const [testDiff, setTestDiff] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [testInst, setTestInst] = useState('');
  const [testPub, setTestPub] = useState(true);
  const [testQuestions, setTestQuestions] = useState<number[]>([]);

  // Fetch lists
  const { data: categories } = useQuery({
    queryKey: ['adminSeriesCategories'],
    queryFn: testSeriesService.getCategories
  });

  const { data: companies } = useQuery({
    queryKey: ['adminSeriesCompanies'],
    queryFn: testSeriesService.getCompanies
  });

  const { data: seriesList } = useQuery({
    queryKey: ['adminSeriesList'],
    queryFn: () => testSeriesService.getSeriesList()
  });

  const { data: testsList } = useQuery({
    queryKey: ['adminTestsList'],
    queryFn: () => testSeriesService.getTests()
  });

  // Fetch coding questions bank
  const { data: codingQuestions } = useQuery({
    queryKey: ['adminCodingBank'],
    queryFn: async () => {
      const res = await api.get('/questions/');
      return res.data;
    },
    enabled: activeSubTab === 'tests'
  });

  // Fetch aptitude questions bank
  const { data: aptitudeQuestions } = useQuery({
    queryKey: ['adminAptitudeBank'],
    queryFn: async () => {
      const res = await api.get('/aptitude/questions/');
      return res.data;
    },
    enabled: activeSubTab === 'tests'
  });

  // Reset forms
  const resetForm = () => {
    setEditId(null);
    setCatName('');
    setCatDesc('');
    setCatIcon('Layers');
    setCatType('coding');
    setCatOrder(0);
    setCatActive(true);

    setCompName('');
    setCompLogo('');
    setCompDesc('');
    setCompWeb('');
    setCompOrder(0);
    setCompActive(true);

    setSerCompany('');
    setSerCategory('');
    setSerName('');
    setSerDesc('');
    setSerDiff('beginner');
    setSerThumb('');
    setSerValidity(90);
    setSerOrder(0);
    setSerPub(true);

    setTestSeriesId('');
    setTestName('');
    setTestNum(1);
    setTestDesc('');
    setTestDur(30);
    setTestMarks(100);
    setTestNeg(false);
    setTestDiff('medium');
    setTestInst('');
    setTestPub(true);
    setTestQuestions([]);
  };

  // Mutators
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (activeSubTab === 'categories') {
        const payload = { name: catName, description: catDesc, icon: catIcon, type: catType, display_order: catOrder, is_active: catActive };
        if (editId) return testSeriesService.updateCategory(editId, payload);
        return testSeriesService.createCategory(payload);
      } else if (activeSubTab === 'companies') {
        const payload = { name: compName, logo_url: compLogo, description: compDesc, website: compWeb, display_order: compOrder, is_active: compActive };
        if (editId) return testSeriesService.updateCompany(editId, payload);
        return testSeriesService.createCompany(payload);
      } else if (activeSubTab === 'series') {
        const payload = { company: Number(serCompany), category: Number(serCategory), name: serName, description: serDesc, difficulty: serDiff, thumbnail_url: serThumb, validity_days: Number(serValidity), display_order: serOrder, is_published: serPub };
        if (editId) return testSeriesService.updateSeries(editId, payload);
        return testSeriesService.createSeries(payload);
      } else {
        const payload = { series: Number(testSeriesId), name: testName, test_number: Number(testNum), description: testDesc, duration_minutes: Number(testDur), marks: Number(testMarks), negative_marking: testNeg, difficulty: testDiff, instructions: testInst, is_published: testPub, coding_questions: testQuestions, aptitude_questions: testQuestions };
        
        // Split questions based on type
        const ser = seriesList?.find(s => s.id === Number(testSeriesId));
        if (ser?.category_type === 'coding') {
          payload.coding_questions = testQuestions;
          payload.aptitude_questions = [];
        } else {
          payload.aptitude_questions = testQuestions;
          payload.coding_questions = [];
        }

        if (editId) return testSeriesService.updateTest(editId, payload);
        return testSeriesService.createTest(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSeriesCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSeriesCompanies'] });
      queryClient.invalidateQueries({ queryKey: ['adminSeriesList'] });
      queryClient.invalidateQueries({ queryKey: ['adminTestsList'] });
      setShowModal(false);
      resetForm();
    },
    onError: (err) => {
      console.error(err);
      alert('Save operation failed. Please verify form details.');
    }
  });

  const deleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (activeSubTab === 'categories') await testSeriesService.deleteCategory(id);
      else if (activeSubTab === 'companies') await testSeriesService.deleteCompany(id);
      else if (activeSubTab === 'series') await testSeriesService.deleteSeries(id);
      else await testSeriesService.deleteTest(id);
      
      queryClient.invalidateQueries({ queryKey: ['adminSeriesCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSeriesCompanies'] });
      queryClient.invalidateQueries({ queryKey: ['adminSeriesList'] });
      queryClient.invalidateQueries({ queryKey: ['adminTestsList'] });
    } catch (e) {
      console.error(e);
      alert('Failed to delete item.');
    }
  };

  const cloneItem = async (id: number) => {
    try {
      if (activeSubTab === 'series') {
        await testSeriesService.cloneSeries(id);
      } else if (activeSubTab === 'tests') {
        await testSeriesService.cloneTest(id);
      }
      queryClient.invalidateQueries({ queryKey: ['adminSeriesList'] });
      queryClient.invalidateQueries({ queryKey: ['adminTestsList'] });
    } catch (e) {
      console.error(e);
      alert('Failed to duplicate item.');
    }
  };

  const reorderItems = async (orderIds: number[]) => {
    try {
      if (activeSubTab === 'categories') await testSeriesService.reorderCategories(orderIds);
      else if (activeSubTab === 'companies') await testSeriesService.reorderCompanies(orderIds);
      else if (activeSubTab === 'series') await testSeriesService.reorderSeries(orderIds);
      else await testSeriesService.reorderTests(orderIds);
      
      queryClient.invalidateQueries({ queryKey: ['adminSeriesCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSeriesCompanies'] });
      queryClient.invalidateQueries({ queryKey: ['adminSeriesList'] });
      queryClient.invalidateQueries({ queryKey: ['adminTestsList'] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    if (activeSubTab === 'categories') {
      setCatName(item.name);
      setCatDesc(item.description || '');
      setCatIcon(item.icon || 'Layers');
      setCatType(item.type);
      setCatOrder(item.display_order);
      setCatActive(item.is_active);
    } else if (activeSubTab === 'companies') {
      setCompName(item.name);
      setCompLogo(item.logo_url || '');
      setCompDesc(item.description || '');
      setCompWeb(item.website || '');
      setCompOrder(item.display_order);
      setCompActive(item.is_active);
    } else if (activeSubTab === 'series') {
      setSerCompany(String(item.company));
      setSerCategory(String(item.category));
      setSerName(item.name);
      setSerDesc(item.description || '');
      setSerDiff(item.difficulty);
      setSerThumb(item.thumbnail_url || '');
      setSerValidity(item.validity_days);
      setSerOrder(item.display_order);
      setSerPub(item.is_published);
    } else {
      setTestSeriesId(String(item.series));
      setTestName(item.name);
      setTestNum(item.test_number);
      setTestDesc(item.description || '');
      setTestDur(item.duration_minutes);
      setTestMarks(item.marks);
      setTestNeg(item.negative_marking);
      setTestDiff(item.difficulty);
      setTestInst(item.instructions || '');
      setTestPub(item.is_published);
      
      // Load questions correctly based on category type
      const ser = seriesList?.find(s => s.id === item.series);
      if (ser?.category_type === 'coding') {
        setTestQuestions(item.coding_questions || []);
      } else {
        setTestQuestions(item.aptitude_questions || []);
      }
    }
    setShowModal(true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    let list: any[] = [];
    if (activeSubTab === 'categories') list = [...(categories || [])];
    else if (activeSubTab === 'companies') list = [...(companies || [])];
    else if (activeSubTab === 'series') list = [...(seriesList || [])];
    else list = [...(testsList || [])];

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    reorderItems(list.map(item => item.id));
  };

  const toggleQuestionSelect = (qId: number) => {
    setTestQuestions(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  // Derive visible filtered lists
  const filteredCategories = categories?.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];
  const filteredCompanies = companies?.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];
  const filteredSeries = seriesList?.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];
  const filteredTests = testsList?.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 animate-fadeIn w-full">
      
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Test Series Workspace</h2>
          <p className="text-xs text-slate-500">Create, reorder, duplicate, and publish placement test suites</p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Create Entry
          </button>
        </div>
      </div>

      {/* Inner Subtabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-850 pb-px text-xs font-semibold">
        {[
          { key: 'series', label: 'Test Series', icon: <Trophy size={14} /> },
          { key: 'tests', label: 'Individual Tests', icon: <FileText size={14} /> },
          { key: 'categories', label: 'Categories', icon: <Layers size={14} /> },
          { key: 'companies', label: 'Companies', icon: <Briefcase size={14} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveSubTab(tab.key as any); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === tab.key
                ? 'border-blue-600 text-blue-650 dark:border-blue-500 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Filter input */}
      <div className="relative max-w-xs">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="Filter workspace items..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
        />
      </div>

      {/* Main listings rendering */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
        
        {activeSubTab === 'categories' && (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="p-3.5 w-16">Move</th>
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Display Order</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredCategories.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-855 dark:text-slate-350">
                    <td className="p-3.5 flex gap-1">
                      <button onClick={() => handleMove(idx, 'up')} className="p-0.5 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 rounded">
                        <ArrowUp size={12} />
                      </button>
                      <button onClick={() => handleMove(idx, 'down')} className="p-0.5 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 rounded">
                        <ArrowDown size={12} />
                      </button>
                    </td>
                    <td className="p-3.5 font-bold">{item.name}</td>
                    <td className="p-3.5 uppercase">{item.type}</td>
                    <td className="p-3.5 font-mono">{item.display_order}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="p-3.5 text-center flex justify-center gap-1.5">
                      <button onClick={() => handleEdit(item)} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded border">
                        Edit
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-650 text-[10px] font-bold rounded border border-red-200">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'companies' && (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="p-3.5 w-16">Move</th>
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5">Slug</th>
                  <th className="p-3.5">Website</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredCompanies.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-855 dark:text-slate-350">
                    <td className="p-3.5 flex gap-1">
                      <button onClick={() => handleMove(idx, 'up')} className="p-0.5 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 rounded">
                        <ArrowUp size={12} />
                      </button>
                      <button onClick={() => handleMove(idx, 'down')} className="p-0.5 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 rounded">
                        <ArrowDown size={12} />
                      </button>
                    </td>
                    <td className="p-3.5 font-bold flex items-center gap-2">
                      {item.logo_url && <img src={item.logo_url} alt="" className="w-5 h-5 object-contain" />}
                      {item.name}
                    </td>
                    <td className="p-3.5 font-mono">{item.slug}</td>
                    <td className="p-3.5">{item.website || 'N/A'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="p-3.5 text-center flex justify-center gap-1.5">
                      <button onClick={() => handleEdit(item)} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded border">
                        Edit
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-650 text-[10px] font-bold rounded border border-red-200">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'series' && (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="p-3.5 w-16">Move</th>
                  <th className="p-3.5">Series Name</th>
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Difficulty</th>
                  <th className="p-3.5">Tests</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredSeries.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-855 dark:text-slate-350">
                    <td className="p-3.5 flex gap-1">
                      <button onClick={() => handleMove(idx, 'up')} className="p-0.5 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 rounded">
                        <ArrowUp size={12} />
                      </button>
                      <button onClick={() => handleMove(idx, 'down')} className="p-0.5 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 rounded">
                        <ArrowDown size={12} />
                      </button>
                    </td>
                    <td className="p-3.5 font-bold">{item.name}</td>
                    <td className="p-3.5">{item.company_name}</td>
                    <td className="p-3.5 capitalize">{item.category_name} ({item.category_type})</td>
                    <td className="p-3.5 capitalize">{item.difficulty}</td>
                    <td className="p-3.5 font-mono">{item.tests_count} Tests</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        item.is_published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{item.is_published ? 'Published' : 'Draft'}</span>
                    </td>
                    <td className="p-3.5 text-center flex justify-center gap-1.5">
                      <button onClick={() => handleEdit(item)} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded border">
                        Edit
                      </button>
                      <button onClick={() => cloneItem(item.id)} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded border" title="Duplicate">
                        <Copy size={11} className="inline mr-1" />Clone
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-650 text-[10px] font-bold rounded border border-red-200">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'tests' && (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="p-3.5 w-16">Move</th>
                  <th className="p-3.5">Test Name</th>
                  <th className="p-3.5">Series</th>
                  <th className="p-3.5">Test No.</th>
                  <th className="p-3.5">Questions</th>
                  <th className="p-3.5">Marks</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredTests.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-855 dark:text-slate-350">
                    <td className="p-3.5 flex gap-1">
                      <button onClick={() => handleMove(idx, 'up')} className="p-0.5 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 rounded">
                        <ArrowUp size={12} />
                      </button>
                      <button onClick={() => handleMove(idx, 'down')} className="p-0.5 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 rounded">
                        <ArrowDown size={12} />
                      </button>
                    </td>
                    <td className="p-3.5 font-bold">{item.name}</td>
                    <td className="p-3.5 text-slate-500 font-semibold">{seriesList?.find(s => s.id === item.series)?.name || 'N/A'}</td>
                    <td className="p-3.5 font-mono">{item.test_number}</td>
                    <td className="p-3.5 font-mono">{item.questions_count} Qs</td>
                    <td className="p-3.5 font-mono">{item.marks}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        item.is_published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{item.is_published ? 'Published' : 'Draft'}</span>
                    </td>
                    <td className="p-3.5 text-center flex justify-center gap-1.5">
                      <button onClick={() => handleEdit(item)} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded border">
                        Edit
                      </button>
                      <button onClick={() => cloneItem(item.id)} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded border" title="Duplicate">
                        <Copy size={11} className="inline mr-1" />Clone
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-650 text-[10px] font-bold rounded border border-red-200">
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

      {/* Edit / Create Modal Backdrop */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl animate-scaleIn text-slate-800 dark:text-slate-200 text-xs">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-blue-650 dark:text-blue-400">
                {editId ? 'Edit Entry' : 'Create Entry'} ({activeSubTab})
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-red-500 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* FORM FIELDS BASED ON SUBTAB */}
            {activeSubTab === 'categories' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Category Name</label>
                  <input type="text" value={catName} onChange={e => setCatName(e.target.value)} className="w-full h-10 px-3 border rounded-lg" placeholder="Coding Series" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea value={catDesc} onChange={e => setCatDesc(e.target.value)} className="w-full p-2.5 border rounded-lg h-16" placeholder="DSA, programming fundamentals" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Icon (lucide string)</label>
                    <input type="text" value={catIcon} onChange={e => setCatIcon(e.target.value)} className="w-full h-10 px-3 border rounded-lg" placeholder="Code" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Type</label>
                    <select value={catType} onChange={e => setCatType(e.target.value as any)} className="w-full h-10 border rounded-lg px-2 bg-white">
                      <option value="coding">Coding</option>
                      <option value="aptitude">Aptitude</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Display Order</label>
                    <input type="number" value={catOrder} onChange={e => setCatOrder(Number(e.target.value) || 0)} className="w-full h-10 px-3 border rounded-lg text-center" />
                  </div>
                  <label className="flex items-center gap-2 font-bold text-slate-500 uppercase tracking-wider mt-4">
                    <input type="checkbox" checked={catActive} onChange={e => setCatActive(e.target.checked)} className="rounded border-slate-300" /> Active Category
                  </label>
                </div>
              </div>
            )}

            {activeSubTab === 'companies' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                  <input type="text" value={compName} onChange={e => setCompName(e.target.value)} className="w-full h-10 px-3 border rounded-lg" placeholder="TCS" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Logo URL</label>
                  <input type="text" value={compLogo} onChange={e => setCompLogo(e.target.value)} className="w-full h-10 px-3 border rounded-lg" placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea value={compDesc} onChange={e => setCompDesc(e.target.value)} className="w-full p-2.5 border rounded-lg h-16" placeholder="Curated practice sheets for placement rounds" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Website</label>
                  <input type="text" value={compWeb} onChange={e => setCompWeb(e.target.value)} className="w-full h-10 px-3 border rounded-lg" placeholder="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Display Order</label>
                    <input type="number" value={compOrder} onChange={e => setCompOrder(Number(e.target.value) || 0)} className="w-full h-10 px-3 border rounded-lg text-center" />
                  </div>
                  <label className="flex items-center gap-2 font-bold text-slate-500 uppercase tracking-wider mt-4">
                    <input type="checkbox" checked={compActive} onChange={e => setCompActive(e.target.checked)} className="rounded border-slate-300" /> Active Company
                  </label>
                </div>
              </div>
            )}

            {activeSubTab === 'series' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Select Company</label>
                    <select value={serCompany} onChange={e => setSerCompany(e.target.value)} className="w-full h-10 border rounded-lg px-2 bg-white">
                      <option value="">-- Choose Company --</option>
                      {companies?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Select Category</label>
                    <select value={serCategory} onChange={e => setSerCategory(e.target.value)} className="w-full h-10 border rounded-lg px-2 bg-white">
                      <option value="">-- Choose Category --</option>
                      {categories?.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Series Name</label>
                  <input type="text" value={serName} onChange={e => setSerName(e.target.value)} className="w-full h-10 px-3 border rounded-lg" placeholder="TCS CodeVita — Foundation" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea value={serDesc} onChange={e => setSerDesc(e.target.value)} className="w-full p-2.5 border rounded-lg h-16" placeholder="Master core variables, search, sorting algorithmic rounds" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Difficulty</label>
                    <select value={serDiff} onChange={e => setSerDiff(e.target.value as any)} className="w-full h-10 border rounded-lg px-2 bg-white">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Validity (Days)</label>
                    <input type="number" value={serValidity} onChange={e => setSerValidity(Number(e.target.value) || 90)} className="w-full h-10 px-3 border rounded-lg text-center" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Display Order</label>
                    <input type="number" value={serOrder} onChange={e => setSerOrder(Number(e.target.value) || 0)} className="w-full h-10 px-3 border rounded-lg text-center" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Thumbnail Image URL</label>
                  <input type="text" value={serThumb} onChange={e => setSerThumb(e.target.value)} className="w-full h-10 px-3 border rounded-lg" placeholder="https://..." />
                </div>
                <label className="flex items-center gap-2 font-bold text-slate-500 uppercase tracking-wider">
                  <input type="checkbox" checked={serPub} onChange={e => setSerPub(e.target.checked)} className="rounded border-slate-300" /> Publish Series
                </label>
              </div>
            )}

            {activeSubTab === 'tests' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Select Test Series Linkage</label>
                    <select value={testSeriesId} onChange={e => { setTestSeriesId(e.target.value); setTestQuestions([]); }} className="w-full h-10 border rounded-lg px-2 bg-white">
                      <option value="">-- Choose Series --</option>
                      {seriesList?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category_type})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Test Number / Order Index</label>
                    <input type="number" value={testNum} onChange={e => setTestNum(Number(e.target.value) || 1)} className="w-full h-10 px-3 border rounded-lg text-center" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Individual Test Name</label>
                  <input type="text" value={testName} onChange={e => setTestName(e.target.value)} className="w-full h-10 px-3 border rounded-lg" placeholder="01 — Arrays & Basics" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Description (Topics Covered csv)</label>
                  <input type="text" value={testDesc} onChange={e => setTestDesc(e.target.value)} className="w-full h-10 px-3 border rounded-lg" placeholder="e.g. Arrays, Search, Sorting" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Duration (mins)</label>
                    <input type="number" value={testDur} onChange={e => setTestDur(Number(e.target.value) || 30)} className="w-full h-10 px-3 border rounded-lg text-center" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Marks</label>
                    <input type="number" value={testMarks} onChange={e => setTestMarks(Number(e.target.value) || 100)} className="w-full h-10 px-3 border rounded-lg text-center" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">Difficulty</label>
                    <select value={testDiff} onChange={e => setTestDiff(e.target.value as any)} className="w-full h-10 border rounded-lg px-2 bg-white">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 font-bold text-slate-500 uppercase tracking-wider mt-4">
                    <input type="checkbox" checked={testNeg} onChange={e => setTestNeg(e.target.checked)} className="rounded border-slate-300" /> Negative Marks
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">Test Instructions text</label>
                  <textarea value={testInst} onChange={e => setTestInst(e.target.value)} className="w-full p-2.5 border rounded-lg h-20" placeholder="Solve within the active window limits..." />
                </div>

                {/* QUESTIONS BANK PICKER */}
                {testSeriesId && (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Questions Bank Picker</h4>
                      <span className="font-mono text-[10px] font-bold text-blue-500">{testQuestions.length} Questions Selected</span>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-[11px]">
                      {(() => {
                        const ser = seriesList?.find(s => s.id === Number(testSeriesId));
                        const isCoding = ser?.category_type === 'coding';
                        const bank = isCoding ? codingQuestions : aptitudeQuestions;

                        if (!bank || bank.length === 0) {
                          return <div className="text-slate-400 italic">No questions found in this library bank.</div>;
                        }

                        return bank.map((q: any) => {
                          const isSelected = testQuestions.includes(q.id);
                          return (
                            <div
                              key={q.id}
                              onClick={() => toggleQuestionSelect(q.id)}
                              className={`p-2 border rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                                isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-slate-100 hover:border-blue-200'
                              }`}
                            >
                              <div className="space-y-0.5 pr-4">
                                <div className="font-bold text-slate-850 dark:text-white leading-tight">{q.title}</div>
                                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                                  {isCoding ? `Time: ${q.time_limit}s | Memory: ${q.memory_limit}MB` : `Marks: ${q.marks} | Neg: ${q.negative_marks}`}
                                </div>
                              </div>
                              <input type="checkbox" checked={isSelected} readOnly className="rounded border-slate-350" />
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 font-bold text-slate-500 uppercase tracking-wider">
                  <input type="checkbox" checked={testPub} onChange={e => setTestPub(e.target.checked)} className="rounded border-slate-300" /> Publish Test
                </label>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 text-xs font-semibold pt-4 border-t border-slate-150">
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TestSeriesAdminPanel;
