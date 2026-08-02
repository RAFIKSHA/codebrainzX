import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, Search, ChevronRight, LayoutGrid, Loader2 } from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeCategory } from '../../services/aptitude';

const AptitudeTopicsPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<AptitudeCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const data = await aptitudeService.getCategories();
        const found = data.find(c => c.id === Number(categoryId));
        if (found) {
          setCategory(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [categoryId]);

  const filteredTopics = category?.topics.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] space-y-8 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 pb-16 font-sans">
      {/* Header and Breadcrumbs */}
      <div className="space-y-2 pt-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/dashboard/aptitude" className="hover:text-[#2563EB] transition-colors">Aptitude Hub</Link>
          <span>/</span>
          <Link to="/dashboard/aptitude/categories" className="hover:text-[#2563EB] transition-colors">Categories</Link>
          <span>/</span>
          <span className="text-slate-600">{category?.name || 'Category'}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] flex items-center gap-2.5">
              <LayoutGrid className="text-[#2563EB]" size={28} />
              {category?.name || 'Category Topics'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {category?.description || 'Select a topic to start solving questions.'}
            </p>
          </div>
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#D1D5DB] rounded-lg h-[42px] pl-10 pr-4 text-xs text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <Loader2 className="animate-spin text-[#2563EB]" size={28} />
          <p className="text-slate-500 text-xs font-semibold">Loading topics...</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E5E7EB] bg-white rounded-xl space-y-3 shadow-sm">
          <BookOpen className="mx-auto text-slate-300" size={40} />
          <p className="text-slate-500 text-sm font-bold">No topics found</p>
          <p className="text-slate-400 text-xs">Try typing another query or select from different categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => navigate(`/dashboard/aptitude/topic/${topic.id}`)}
              className="group bg-white border border-[#E5E7EB] hover:border-slate-350 p-6 rounded-xl cursor-pointer transition-colors hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[160px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            >
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors leading-tight">
                  {topic.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {topic.description || 'Improve logical clarity and speed calculations.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4 mt-6 text-xs font-medium">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                  {topic.sub_topics?.length || 0} Subtopics available
                </span>
                <div className="flex items-center gap-1 text-slate-500 group-hover:text-[#2563EB] transition-colors">
                  View Practice Units
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AptitudeTopicsPage;
