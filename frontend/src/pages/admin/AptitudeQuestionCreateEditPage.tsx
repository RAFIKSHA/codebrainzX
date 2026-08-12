import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeCategory, AptitudeQuestion, AptitudeTrainer } from '../../services/aptitude';

const AptitudeQuestionCreateEditPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const isEdit = !!questionId;

  const [categories, setCategories] = useState<AptitudeCategory[]>([]);
  const [trainers, setTrainers] = useState<AptitudeTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingQ, setEditingQ] = useState<AptitudeQuestion | null>(null);

  // Form Fields
  const [formTrainerId, setFormTrainerId] = useState<number | null>(null);
  const [formCategoryId, setFormCategoryId] = useState<number | null>(null);
  const [formTopicId, setFormTopicId] = useState<number | null>(null);
  const [formSubTopicId, setFormSubTopicId] = useState<number | null>(null);
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formTitle, setFormTitle] = useState('');
  const [formStatement, setFormStatement] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formAnswer, setFormAnswer] = useState('A');
  const [formExplanation, setFormExplanation] = useState('');
  const [formShortcut, setFormShortcut] = useState('');
  const [formHint, setFormHint] = useState('');
  const [formMarks, setFormMarks] = useState(1);
  const [formNegMarks, setFormNegMarks] = useState(0);
  const [formTimeLimit, setFormTimeLimit] = useState(60);
  const [formCompanies, setFormCompanies] = useState('');
  const [formUniversities, setFormUniversities] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Preview panel toggle
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [cats, trs] = await Promise.all([
          aptitudeService.getCategories(),
          aptitudeService.getTrainers(true)
        ]);
        setCategories(cats);
        setTrainers(trs);

        if (isEdit) {
          const qs = await aptitudeService.getQuestions();
          const q = qs.find(x => x.id === Number(questionId));
          if (q) {
            setEditingQ(q);
            // Resolve Category ID
            let resolvedCatId: number | null = null;
            for (const cat of cats) {
              if (cat.topics.some(t => t.id === q.topic)) {
                resolvedCatId = cat.id;
                break;
              }
            }

            setFormTrainerId(q.trainer || null);
            setFormCategoryId(resolvedCatId);
            setFormTopicId(q.topic);
            setFormSubTopicId(q.sub_topic);
            setFormDifficulty(q.difficulty);
            setFormTitle(q.title);
            setFormStatement(q.statement);

            const opts = q.options || [];
            setFormOptA(opts.find(o => o.key === 'A')?.text || '');
            setFormOptB(opts.find(o => o.key === 'B')?.text || '');
            setFormOptC(opts.find(o => o.key === 'C')?.text || '');
            setFormOptD(opts.find(o => o.key === 'D')?.text || '');

            setFormAnswer(q.correct_answer?.join(',') || 'A');
            setFormExplanation(q.explanation || '');
            setFormShortcut(q.shortcut_trick || '');
            setFormHint(q.hint || '');
            setFormMarks(q.marks);
            setFormNegMarks(q.negative_marks);
            setFormTimeLimit(q.time_limit);
            setFormCompanies(q.company_tags?.join(',') || '');
            setFormUniversities(q.university_tags?.join(',') || '');
            setFormSource(q.source || '');
            setFormImageUrl(q.image_url || '');
          } else {
            alert('Question not found');
            navigate('/admin/aptitude');
          }
        } else {
          // Initialize dropdown defaults
          if (cats.length > 0) {
            setFormCategoryId(cats[0].id);
            if (cats[0].topics.length > 0) {
              setFormTopicId(cats[0].topics[0].id);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [questionId, isEdit]);

  const activeCategoryObj = categories.find(c => c.id === formCategoryId);
  const availableTopics = activeCategoryObj ? activeCategoryObj.topics : categories.flatMap(c => c.topics);
  const availableSubTopics = availableTopics.find(t => t.id === formTopicId)?.sub_topics || [];

  const handleSave = async (visibility: 'public' | 'private') => {
    if (!formTopicId) {
      alert('Please select a category and topic before saving.');
      return;
    }

    const options = [
      { key: 'A', text: formOptA },
      { key: 'B', text: formOptB },
      { key: 'C', text: formOptC },
      { key: 'D', text: formOptD },
    ].filter(o => o.text.trim() !== '');

    const correct_answer = formAnswer.split(',').map(s => s.trim().toUpperCase());

    const payload = {
      trainer: formTrainerId,
      topic: formTopicId,
      sub_topic: formSubTopicId,
      title: formTitle,
      statement: formStatement,
      image_url: formImageUrl || undefined,
      difficulty: formDifficulty,
      question_type: correct_answer.length > 1 ? 'multiple_mcq' : 'single_mcq',
      options,
      correct_answer,
      explanation: formExplanation,
      shortcut_trick: formShortcut,
      hint: formHint,
      marks: formMarks,
      negative_marks: formNegMarks,
      time_limit: formTimeLimit,
      company_tags: formCompanies.split(',').map(s => s.trim()).filter(Boolean),
      university_tags: formUniversities.split(',').map(s => s.trim()).filter(Boolean),
      source: formSource,
      status: 'active',
      visibility
    };

    try {
      setSaving(true);
      if (isEdit && editingQ) {
        await aptitudeService.updateQuestion(editingQ.id, payload);
      } else {
        await aptitudeService.createQuestion(payload);
      }
      navigate('/admin/aptitude');
    } catch (e) {
      console.error(e);
      alert('Failed to save aptitude question settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 text-sm font-semibold">Loading question configuration...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] font-sans antialiased pb-24 px-4 sm:px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto pt-8 space-y-8">
        
        {/* Header navigation bar */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/aptitude')}
              className="p-2 border border-[#E5E7EB] hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                {isEdit ? 'Edit Aptitude Question' : 'Create Aptitude Question'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Create, edit and manage aptitude questions.
              </p>
            </div>
          </div>
        </div>

        {/* Dedicated Sections Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 1: Question Information */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-semibold text-[#111827] border-b border-[#E5E7EB] pb-2 uppercase tracking-wider text-[11px]">
                1. Question Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Trainer ▼</label>
                  <select
                    value={formTrainerId || ''}
                    onChange={(e) => setFormTrainerId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full h-10 border border-[#D1D5DB] rounded-lg px-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-slate-800"
                  >
                    <option value="">No Trainer Assigned</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Category</label>
                  <select
                    value={formCategoryId || ''}
                    onChange={(e) => {
                      const cid = Number(e.target.value);
                      setFormCategoryId(cid);
                      const activeCat = categories.find(c => c.id === cid);
                      if (activeCat && activeCat.topics.length > 0) {
                        setFormTopicId(activeCat.topics[0].id);
                      } else {
                        setFormTopicId(null);
                      }
                      setFormSubTopicId(null);
                    }}
                    className="w-full h-10 border border-[#D1D5DB] rounded-lg px-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Topic</label>
                  <select
                    value={formTopicId || ''}
                    onChange={(e) => {
                      const tid = e.target.value ? Number(e.target.value) : null;
                      setFormTopicId(tid);
                      if (tid) {
                        const parentCat = categories.find(c => c.topics.some(t => t.id === tid));
                        if (parentCat) {
                          setFormCategoryId(parentCat.id);
                        }
                      }
                      setFormSubTopicId(null);
                    }}
                    className="w-full h-10 border border-[#D1D5DB] rounded-lg px-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Topic ({availableTopics.length} available)</option>
                    {availableTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Sub Topic</label>
                  <select
                    value={formSubTopicId || ''}
                    onChange={(e) => setFormSubTopicId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full h-10 border border-[#D1D5DB] rounded-lg px-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Direct Topic (No Subtopic)</option>
                    {availableSubTopics.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full h-10 border border-[#D1D5DB] rounded-lg px-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Question Details */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-semibold text-[#111827] border-b border-[#E5E7EB] pb-2 uppercase tracking-wider text-[11px]">
                2. Question Details
              </h3>
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Question Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Enter a descriptive title"
                    className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Question Statement</label>
                  <textarea
                    rows={4}
                    value={formStatement}
                    onChange={(e) => setFormStatement(e.target.value)}
                    placeholder="Enter question statement text (LaTeX supported)..."
                    className="w-full border border-[#D1D5DB] rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-650 font-medium block">Question Image URL (Optional)</label>
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://example.com/diagram.png"
                      className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-650 font-medium block">Hint</label>
                    <input
                      type="text"
                      value={formHint}
                      onChange={(e) => setFormHint(e.target.value)}
                      placeholder="Helpful clue for solving"
                      className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Options */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-semibold text-[#111827] border-b border-[#E5E7EB] pb-2 uppercase tracking-wider text-[11px]">
                3. Options
              </h3>
              <div className="space-y-4 text-xs">
                {/* Option A, B, C, D */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">A</span>
                    <input
                      type="text"
                      value={formOptA}
                      onChange={(e) => setFormOptA(e.target.value)}
                      placeholder="Option value A"
                      className="flex-1 h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">B</span>
                    <input
                      type="text"
                      value={formOptB}
                      onChange={(e) => setFormOptB(e.target.value)}
                      placeholder="Option value B"
                      className="flex-1 h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">C</span>
                    <input
                      type="text"
                      value={formOptC}
                      onChange={(e) => setFormOptC(e.target.value)}
                      placeholder="Option value C"
                      className="flex-1 h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">D</span>
                    <input
                      type="text"
                      value={formOptD}
                      onChange={(e) => setFormOptD(e.target.value)}
                      placeholder="Option value D"
                      className="flex-1 h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                    />
                  </div>
                </div>

                <div className="space-y-1 w-full sm:w-1/2">
                  <label className="text-[11px] text-slate-650 font-medium block">Correct Answer Key</label>
                  <select
                    value={formAnswer}
                    onChange={(e) => setFormAnswer(e.target.value)}
                    className="w-full h-10 border border-[#D1D5DB] rounded-lg px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="A,B">A, B (Multiple)</option>
                    <option value="C,D">C, D (Multiple)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Explanation */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-semibold text-[#111827] border-b border-[#E5E7EB] pb-2 uppercase tracking-wider text-[11px]">
                4. Explanation
              </h3>
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Detailed Explanation Solution</label>
                  <textarea
                    rows={4}
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Describe step-by-step logic to arrive at answer..."
                    className="w-full border border-[#D1D5DB] rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Shortcut Tricks / Formula</label>
                  <textarea
                    rows={3}
                    value={formShortcut}
                    onChange={(e) => setFormShortcut(e.target.value)}
                    placeholder="Enter optional shortcut calculations..."
                    className="w-full border border-[#D1D5DB] rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Metadata Sidebar (Grid col 3) */}
          <div className="space-y-6">
            
            {/* Section 5: Metadata */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-semibold text-[#111827] border-b border-[#E5E7EB] pb-2 uppercase tracking-wider text-[11px]">
                5. Metadata
              </h3>
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-650 font-medium block">Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formMarks}
                      onChange={(e) => setFormMarks(Number(e.target.value))}
                      className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-650 font-medium block">Negative Marks</label>
                    <input
                      type="number"
                      step="0.25"
                      value={formNegMarks}
                      onChange={(e) => setFormNegMarks(Number(e.target.value))}
                      className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-650 font-medium block">Time Limit (Secs)</label>
                    <input
                      type="number"
                      value={formTimeLimit}
                      onChange={(e) => setFormTimeLimit(Number(e.target.value))}
                      className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-650 font-medium block">Est. Solve Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 1.5 mins"
                      className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Company Tags</label>
                  <input
                    type="text"
                    value={formCompanies}
                    onChange={(e) => setFormCompanies(e.target.value)}
                    placeholder="e.g. TCS, Infosys"
                    className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">University Tags</label>
                  <input
                    type="text"
                    value={formUniversities}
                    onChange={(e) => setFormUniversities(e.target.value)}
                    placeholder="e.g. SRM, VIT"
                    className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-650 font-medium block">Source Reference</label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="e.g. IndiaBix, Mock 2025"
                    className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#111827]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Preview Toggle block */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] space-y-3">
              <h4 className="text-xs font-semibold text-[#111827] flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-500" /> Interactive Live Preview
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Toggle preview mode to render a simulation of how this question appears inside the student practice screen.
              </p>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] text-[#111827] text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

          </div>

        </div>

        {/* Live Preview Modal/Section */}
        {showPreview && (
          <div className="bg-[#FFFFFF] border border-blue-200 rounded-xl p-8 shadow-[0_4px_16px_rgba(37,99,235,0.08)] space-y-5 transition-all">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
              <HelpCircle className="text-blue-500" size={18} />
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest font-mono">Live Student View Simulation</h4>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#111827]">
                {formTitle || 'Sample Title'}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {formStatement || 'Enter a question statement details to preview here...'}
              </p>

              {formImageUrl && (
                <img src={formImageUrl} alt="Question Diagram" className="max-h-64 object-contain rounded-lg border border-[#E5E7EB] p-2 bg-[#F8FAFC]" />
              )}

              {/* Options mapping */}
              <div className="space-y-2 max-w-lg">
                {[
                  { key: 'A', text: formOptA },
                  { key: 'B', text: formOptB },
                  { key: 'C', text: formOptC },
                  { key: 'D', text: formOptD }
                ].filter(o => o.text.trim() !== '').map(opt => (
                  <div key={opt.key} className="flex items-center gap-3 p-3.5 border border-[#E5E7EB] rounded-lg hover:border-blue-500 hover:bg-blue-50/10 transition-colors">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{opt.key}</span>
                    <span className="text-sm text-[#111827]">{opt.text}</span>
                  </div>
                ))}
              </div>

              {formHint && (
                <div className="bg-amber-50/30 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs leading-normal">
                  <strong>Hint:</strong> {formHint}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-[#E5E7EB] bg-white flex items-center justify-between px-8 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => navigate('/admin/aptitude')}
            className="h-10 px-4 border border-[#E5E7EB] hover:bg-slate-50 text-[#111827] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('private')}
              disabled={saving}
              className="h-10 px-4 border border-[#E5E7EB] hover:bg-slate-50 text-[#111827] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave('public')}
              disabled={saving}
              className="h-10 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {saving ? 'Publishing...' : 'Publish Question'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AptitudeQuestionCreateEditPage;
