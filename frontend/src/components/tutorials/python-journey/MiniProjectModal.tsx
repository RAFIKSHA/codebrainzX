import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Code2, Play, CheckCircle2, Sparkles, Copy, Check, Terminal 
} from 'lucide-react';
import { LEVEL_1_MINI_PROJECT } from './curriculumData';
import { publicApi } from '../../../services/api';

interface MiniProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCompleted: () => void;
}

export const MiniProjectModal: React.FC<MiniProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCompleted,
}) => {
  const project = LEVEL_1_MINI_PROJECT;
  const [code, setCode] = useState(project.starterCode);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [stdin, setStdin] = useState<string>('Rafik\n22\nPython Foundations\nMumbai\n88\n94\n90\n85\n96');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running Student Profile Engine with test input values...');
    try {
      const res = await publicApi.post('/tutorials/lessons/run-code/', {
        code,
        language_slug: 'python',
        input_data: stdin,
      });
      setOutput(res.data.stdout || res.data.stderr || 'Execution finished with no output.');
      onProjectCompleted();
    } catch (e: any) {
      setOutput(`Execution error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-white dark:bg-[#0e111a] rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#141824] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Level 1 Mini Project: {project.title}
              </h3>
              <span className="text-[11px] text-slate-500">
                Integrates input(), variables, arithmetic calculations, and f-string report formatting
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overview */}
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 space-y-2">
            <p className="font-medium leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {project.keyConcepts.map((kc, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-purple-900/60 font-mono text-[10px] border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                  ✔ {kc}
                </span>
              ))}
            </div>
          </div>

          {/* Split Editor and Terminal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-mono">
                  <Code2 className="w-4 h-4 text-purple-600" />
                  student_report.py
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-[11px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    <span>{isRunning ? 'Running...' : 'Run Project'}</span>
                  </button>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                className="w-full font-mono text-xs p-3 rounded-xl bg-slate-900 text-emerald-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                spellCheck={false}
              />
            </div>

            {/* Input / Output Column */}
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-purple-600" />
                  Interactive Input Stream (Sample Data)
                </span>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  rows={4}
                  className="w-full font-mono text-xs p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 resize-none font-mono"
                  placeholder="Enter inputs on separate lines..."
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Terminal Output
                </span>
                <pre className="w-full h-48 font-mono text-xs p-3 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 overflow-y-auto whitespace-pre-wrap">
                  {output || 'Click "Run Project" to execute the script against the input stream.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
