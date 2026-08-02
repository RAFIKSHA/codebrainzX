import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Compass, BookOpen, ChevronRight, Search, Loader2 } from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeCategory } from '../../services/aptitude';

const AptitudeCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AptitudeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const data = await aptitudeService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] space-y-8 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 pb-16 font-sans">
      {/* Header and Breadcrumbs */}
      <div className="space-y-2 pt-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/dashboard/aptitude" className="hover:text-[#2563EB] transition-colors">Aptitude Hub</Link>
          <span>/</span>
          <span className="text-slate-600">Categories</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] flex items-center gap-2.5">
              <Compass className="text-[#2563EB]" size={28} />
              Aptitude Categories
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select a learning track to practice quantitative aptitude, logical reasoning, and verbal topics.
            </p>
          </div>
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search category tracks..."
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
          <p className="text-slate-500 text-xs font-semibold">Loading practice tracks...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E5E7EB] bg-white rounded-xl space-y-3 shadow-sm">
          <BookOpen className="mx-auto text-slate-300" size={40} />
          <p className="text-slate-500 text-sm font-bold">No categories found matching your query</p>
          <p className="text-slate-400 text-xs">Try searching for other learning fields.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/dashboard/aptitude/category/${cat.id}`)}
              className="group bg-white border border-[#E5E7EB] hover:border-slate-350 p-6 rounded-xl cursor-pointer transition-colors hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[180px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                  <Brain size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                    {cat.description || 'Enhance your problem solving capability with focused exercises.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4 mt-6 text-xs font-medium">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                  {cat.topics?.length || 0} Topics available
                </span>
                <div className="flex items-center gap-1 text-slate-550 group-hover:text-[#2563EB] transition-colors">
                  View Topics
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

export default AptitudeCategoriesPage;
