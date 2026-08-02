import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, ChevronRight, ListCollapse, Play, Loader2 } from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeCategory, AptitudeTopic } from '../../services/aptitude';

const AptitudeSubTopicsPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<AptitudeCategory | null>(null);
  const [topic, setTopic] = useState<AptitudeTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        setLoading(true);
        const data = await aptitudeService.getCategories();
        
        let foundTopic: AptitudeTopic | null = null;
        let foundCat: AptitudeCategory | null = null;
        
        for (const cat of data) {
          const t = cat.topics.find(x => x.id === Number(topicId));
          if (t) {
            foundTopic = t;
            foundCat = cat;
            break;
          }
        }
        
        if (foundTopic) {
          setTopic(foundTopic);
          setCategory(foundCat);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopicData();
  }, [topicId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] space-y-8 animate-fade-in max-w-5xl mx-auto px-4 pb-16 font-sans">
      {/* Header and Breadcrumbs */}
      <div className="space-y-2 pt-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/dashboard/aptitude" className="hover:text-[#2563EB] transition-colors">Aptitude Hub</Link>
          <span>/</span>
          <Link to="/dashboard/aptitude/categories" className="hover:text-[#2563EB] transition-colors">Categories</Link>
          <span>/</span>
          {category && (
            <Link to={`/dashboard/aptitude/category/${category.id}`} className="hover:text-[#2563EB] transition-colors">
              {category.name}
            </Link>
          )}
          <span>/</span>
          <span className="text-slate-600">{topic?.name || 'Topic'}</span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] flex items-center gap-2.5">
            <ListCollapse className="text-[#2563EB]" size={28} />
            {topic?.name || 'Topic Sub-topics'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose a subtopic unit practice set or explore comprehensive sets.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <Loader2 className="animate-spin text-[#2563EB]" size={28} />
          <p className="text-slate-550 text-xs font-semibold">Loading subtopics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* General/All Topics Questions Ingest card */}
          <div 
            onClick={() => navigate(`/dashboard/aptitude/subtopic/all/practice?topic=${topic?.id}`)}
            className="p-5 bg-blue-50 border border-blue-100 hover:border-blue-200 rounded-xl cursor-pointer flex items-center justify-between transition-colors group shadow-sm"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                Practice All Topic Questions
              </h3>
              <p className="text-xs text-slate-500">
                Launch a custom study practice environment containing all questions from {topic?.name}.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold transition-colors">
              <Play size={10} fill="white" /> Launch Practice
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] my-6"></div>

          {topic?.sub_topics && topic.sub_topics.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {topic.sub_topics.map((sub, idx) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/dashboard/aptitude/subtopic/${sub.id}/practice`)}
                  className="group bg-white border border-[#E5E7EB] hover:border-slate-350 p-5 rounded-xl cursor-pointer transition-colors flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-[#E5E7EB] text-slate-500 flex items-center justify-center font-mono text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors leading-tight">
                        {sub.name}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-[#2563EB] transition-colors font-bold">
                    Start MCQ
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-[#E5E7EB] bg-white rounded-xl space-y-2 shadow-sm">
              <BookOpen className="mx-auto text-slate-300" size={32} />
              <p className="text-slate-500 text-xs font-semibold">No distinct sub-topics registered for this topic</p>
              <p className="text-slate-400 text-[11px]">Use the "Practice All Topic Questions" builder above to load questions.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AptitudeSubTopicsPage;
