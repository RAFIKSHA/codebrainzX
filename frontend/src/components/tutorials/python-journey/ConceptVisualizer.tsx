import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, ArrowRight, Play, RefreshCw, CheckCircle2, 
  Sparkles, Layers, Terminal, ChevronRight, Hash, ShieldCheck
} from 'lucide-react';
import type { PythonConcept } from './types';

interface ConceptVisualizerProps {
  concept: PythonConcept;
  compact?: boolean;
}

export const ConceptVisualizer: React.FC<ConceptVisualizerProps> = ({ concept, compact = false }) => {
  switch (concept.visualType) {
    case 'variable':
      return <VariableVisualizer compact={compact} />;
    case 'data-type':
      return <DataTypesVisualizer compact={compact} />;
    case 'condition':
      return <ConditionVisualizer compact={compact} />;
    case 'loop':
      return <LoopVisualizer compact={compact} />;
    case 'function':
      return <FunctionVisualizer compact={compact} />;
    case 'list':
      return <ListVisualizer compact={compact} />;
    case 'dict':
      return <DictVisualizer compact={compact} />;
    case 'oop':
      return <OOPVisualizer compact={compact} />;
    case 'dsa-stack':
      return <DSAStackVisualizer compact={compact} />;
    default:
      return <GeneralVisualizer concept={concept} compact={compact} />;
  }
};

// 1. Variable Visualizer (Label -> Value in Memory Box)
const VariableVisualizer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [varName, setVarName] = useState('age');
  const [varValue, setVarValue] = useState('25');

  const presets = [
    { name: 'age', val: '25' },
    { name: 'user_name', val: '"Rahul"' },
    { name: 'price', val: '499.99' },
    { name: 'is_active', val: 'True' },
  ];

  return (
    <div className={`w-full bg-slate-900/90 dark:bg-[#0d1117] rounded-2xl p-5 border border-purple-500/20 shadow-xl overflow-hidden text-slate-100 ${compact ? 'text-xs p-3.5' : ''}`}>
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-purple-300">Memory Binding Visualizer</span>
        </div>
        <span className="text-[11px] text-slate-400">Heap Memory Allocation</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 my-3">
        {/* Variable Label Sticky Tag */}
        <motion.div 
          layout
          className="flex flex-col items-center"
        >
          <span className="text-[11px] text-slate-400 font-mono mb-1">Variable Label</span>
          <div className="bg-purple-600/20 border-2 border-purple-500 text-purple-300 px-5 py-2.5 rounded-xl font-mono font-bold text-base shadow-[0_0_15px_rgba(168,85,247,0.25)]">
            {varName}
          </div>
        </motion.div>

        {/* Directed Reference Pointer Arrow */}
        <div className="flex flex-col items-center text-purple-400">
          <span className="text-[10px] font-mono text-purple-300 mb-0.5">points to</span>
          <motion.div 
            animate={{ x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center"
          >
            <ArrowRight className="w-6 h-6 rotate-90 sm:rotate-0 text-purple-400" />
          </motion.div>
          <span className="text-[9px] text-slate-500 font-mono">0x7ffc821</span>
        </div>

        {/* Memory Box Holding Value */}
        <motion.div 
          key={varValue}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center"
        >
          <span className="text-[11px] text-slate-400 font-mono mb-1">Memory Object</span>
          <div className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border-2 border-indigo-400/50 text-indigo-200 px-6 py-2.5 rounded-xl font-mono font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center gap-2">
            <Box className="w-4 h-4 text-purple-400" />
            <span>{varValue}</span>
          </div>
        </motion.div>
      </div>

      {/* Preset Quick Toggles */}
      {!compact && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-slate-400">Test with sample values:</span>
          <div className="flex gap-1.5 flex-wrap">
            {presets.map(p => (
              <button
                key={p.name}
                onClick={() => { setVarName(p.name); setVarValue(p.val); }}
                className={`text-[11px] px-2.5 py-1 rounded-md font-mono transition-all ${
                  varName === p.name 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {p.name} = {p.val}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Data Types Visualizer (Type categorization & live type inspector)
const DataTypesVisualizer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [selectedType, setSelectedType] = useState<'int' | 'str' | 'float' | 'bool'>('int');
  const [customInput, setCustomInput] = useState('25');

  const typesData = [
    { id: 'int', val: '25', tag: 'int', label: 'Integer', desc: 'Whole positive or negative numbers for counts and math.', color: 'from-blue-600 to-cyan-600', border: 'border-blue-400' },
    { id: 'str', val: '"Hello"', tag: 'str', label: 'String', desc: 'Sequence of Unicode text characters enclosed in quotes.', color: 'from-amber-600 to-orange-600', border: 'border-amber-400' },
    { id: 'float', val: '3.14', tag: 'float', label: 'Float', desc: 'Decimal floating point numbers for precision math.', color: 'from-emerald-600 to-teal-600', border: 'border-emerald-400' },
    { id: 'bool', val: 'True', tag: 'bool', label: 'Boolean', desc: 'Binary truth value (True or False) for condition logic.', color: 'from-purple-600 to-pink-600', border: 'border-purple-400' },
  ];

  const detectType = (val: string): string => {
    val = val.trim();
    if (val === 'True' || val === 'False') return 'bool';
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) return 'str';
    if (!isNaN(Number(val)) && val.includes('.')) return 'float';
    if (!isNaN(Number(val)) && val !== '') return 'int';
    return 'str (unquoted literal)';
  };

  return (
    <div className="w-full bg-slate-900/90 dark:bg-[#0d1117] rounded-2xl p-5 border border-purple-500/20 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-purple-300">Type Taxonomy Inspector</span>
        </div>
        <span className="text-[11px] text-slate-400">Python 3.x Type System</span>
      </div>

      {/* Grid of Data Types */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {typesData.map(t => {
          const isSelected = selectedType === t.id;
          return (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedType(t.id as any);
                setCustomInput(t.val);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                isSelected 
                  ? `${t.border} bg-slate-800 shadow-[0_0_15px_rgba(168,85,247,0.2)]` 
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 opacity-80'
              }`}
            >
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 font-mono font-bold text-sm mb-1.5 text-slate-100">
                {t.val}
              </div>
              <span className="text-[10px] text-slate-400 mb-0.5">{t.label}</span>
              <span className={`text-[11px] font-mono font-bold bg-gradient-to-r ${t.color} bg-clip-text text-transparent`}>
                → {t.tag}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Live Interactive Type Sandbox */}
      {!compact && (
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-mono">Input Value:</span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 42 or 'Hello'"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm font-mono text-purple-300 focus:outline-none focus:border-purple-500 w-full sm:w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Detected:</span>
            <span className="bg-purple-600/30 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-lg text-xs font-mono font-semibold">
              type({customInput}) == &lt;class '{detectType(customInput)}'&gt;
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Condition Visualizer (Decision Tree Branching)
const ConditionVisualizer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [score, setScore] = useState(85);
  const threshold = 75;
  const isPassed = score >= threshold;

  return (
    <div className="w-full bg-slate-900/90 dark:bg-[#0d1117] rounded-2xl p-5 border border-purple-500/20 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-blue-300">Decision Branching Flow</span>
        </div>
        <span className="text-[11px] text-slate-400">if / else Evaluation</span>
      </div>

      <div className="flex flex-col items-center gap-3 my-2">
        {/* Condition Evaluator Node */}
        <div className="bg-blue-950/60 border-2 border-blue-500 px-5 py-2.5 rounded-xl font-mono text-sm text-blue-200 font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          score ({score}) &gt;= {threshold} ?
        </div>

        {/* Branch Lines */}
        <div className="grid grid-cols-2 w-full max-w-sm gap-4 text-center">
          {/* True Branch */}
          <div className={`p-3 rounded-xl border transition-all ${
            isPassed 
              ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
              : 'bg-slate-950/50 border-slate-800 opacity-40'
          }`}>
            <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">TRUE PATH (if)</span>
            <span className="text-xs text-slate-200">"Pass with Distinction!"</span>
          </div>

          {/* False Branch */}
          <div className={`p-3 rounded-xl border transition-all ${
            !isPassed 
              ? 'bg-rose-950/70 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
              : 'bg-slate-950/50 border-slate-800 opacity-40'
          }`}>
            <span className="text-xs font-mono font-bold text-rose-400 block mb-1">FALSE PATH (else)</span>
            <span className="text-xs text-slate-200">"Keep Practicing!"</span>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400">Simulate Score:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-48 accent-blue-500 cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-blue-300 w-8">{score}</span>
        </div>
      )}
    </div>
  );
};

// 4. Loop Visualizer (Iteration Wheel & Item Stepper)
const LoopVisualizer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const items = ['🍎 Apple', '🍌 Banana', '🍒 Cherry', '🍇 Grapes'];

  const handleNext = () => {
    setCurrentStep((prev) => (prev + 1) % items.length);
  };

  return (
    <div className="w-full bg-slate-900/90 dark:bg-[#0d1117] rounded-2xl p-5 border border-purple-500/20 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-amber-300">Iteration Stepper</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">for item in fruits:</span>
      </div>

      <div className="flex items-center justify-center gap-2 my-3 overflow-x-auto py-2">
        {items.map((item, idx) => {
          const isActive = idx === currentStep;
          return (
            <motion.div
              key={item}
              animate={{ scale: isActive ? 1.08 : 0.95, y: isActive ? -4 : 0 }}
              className={`px-3.5 py-2.5 rounded-xl border flex flex-col items-center font-mono text-xs transition-all ${
                isActive
                  ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <span className="text-[10px] text-slate-500 mb-0.5">i = {idx}</span>
              <span className="font-semibold">{item}</span>
            </motion.div>
          );
        })}
      </div>

      {!compact && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Active: <span className="font-mono text-amber-300 font-bold">{items[currentStep]}</span>
          </span>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 text-xs bg-amber-600/20 border border-amber-500 text-amber-300 hover:bg-amber-600/30 px-3 py-1.5 rounded-lg font-medium transition-all"
          >
            <Play className="w-3.5 h-3.5" /> Step Forward
          </button>
        </div>
      )}
    </div>
  );
};

// 5. Function Visualizer (Input -> Process -> Output)
const FunctionVisualizer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [usd, setUsd] = useState(100);
  const rate = 83.2;
  const inr = (usd * rate).toFixed(2);

  return (
    <div className="w-full bg-slate-900/90 dark:bg-[#0d1117] rounded-2xl p-5 border border-purple-500/20 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-purple-300">Function Machine</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">def convert_currency(usd):</span>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-6 my-3">
        {/* Input Parameter */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 mb-1">Parameter (usd)</span>
          <div className="bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl font-mono text-sm text-cyan-300 font-bold">
            ${usd}
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-purple-400" />

        {/* Function Box */}
        <div className="bg-purple-950/60 border-2 border-purple-500 p-3 rounded-xl flex flex-col items-center shadow-[0_0_15px_rgba(168,85,247,0.25)]">
          <span className="text-xs font-mono font-bold text-purple-200 mb-0.5">convert_to_inr()</span>
          <span className="text-[10px] text-purple-300 font-mono">return usd * {rate}</span>
        </div>

        <ArrowRight className="w-4 h-4 text-purple-400" />

        {/* Output Return */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 mb-1">Return Value</span>
          <div className="bg-emerald-950/70 border border-emerald-500 px-3.5 py-2 rounded-xl font-mono text-sm text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            ₹{inr}
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. List Visualizer (Indexed Slots & Modifiers)
const ListVisualizer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [items, setItems] = useState(['Python', 'Java', 'Rust', 'Go']);

  const addItem = () => {
    if (items.length < 6) {
      setItems([...items, `Lang ${items.length + 1}`]);
    }
  };

  const popItem = () => {
    if (items.length > 1) {
      setItems(items.slice(0, items.length - 1));
    }
  };

  return (
    <div className="w-full bg-slate-900/90 dark:bg-[#0d1117] rounded-2xl p-5 border border-purple-500/20 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-orange-300">Indexed Sequence Slots</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">len(items) == {items.length}</span>
      </div>

      <div className="flex items-center justify-center gap-2 my-3 overflow-x-auto py-2">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center bg-slate-950 border border-orange-500/40 p-2.5 rounded-xl min-w-[70px] text-center"
          >
            <span className="text-[10px] font-mono text-orange-400 mb-0.5">[{idx}]</span>
            <span className="text-xs font-mono font-bold text-slate-200">"{item}"</span>
            <span className="text-[9px] font-mono text-slate-500 mt-0.5">[-{items.length - idx}]</span>
          </motion.div>
        ))}
      </div>

      {!compact && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={popItem}
            disabled={items.length <= 1}
            className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 px-3 py-1.5 rounded-lg font-mono transition-all"
          >
            .pop()
          </button>
          <button
            onClick={addItem}
            disabled={items.length >= 6}
            className="text-xs bg-orange-600/30 border border-orange-500 hover:bg-orange-600/40 disabled:opacity-40 text-orange-200 px-3 py-1.5 rounded-lg font-mono transition-all"
          >
            .append()
          </button>
        </div>
      )}
    </div>
  );
};

// 7. Dict Visualizer (Key -> Value Hash Buckets)
const DictVisualizer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const entries = [
    { key: '"user_id"', val: '1042' },
    { key: '"role"', val: '"Admin"' },
    { key: '"active"', val: 'True' },
  ];

  return (
    <div className="w-full bg-slate-900/90 dark:bg-[#0d1117] rounded-2xl p-5 border border-purple-500/20 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-purple-300">Hash Map Key-Value Store</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">O(1) Lookup Complexity</span>
      </div>

      <div className="flex flex-col gap-2 my-2">
        {entries.map(e => (
          <div key={e.key} className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-400">{e.key}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 font-mono text-xs text-indigo-300 font-semibold">
              {e.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 8. OOP Visualizer (Blueprint Class -> Instances)
const OOPVisualizer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  return (
    <div className="w-full bg-slate-900/90 dark:bg-[#0d1117] rounded-2xl p-5 border border-purple-500/20 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-purple-300">OOP Blueprint Instantiation</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">class Car:</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-2">
        {/* Class Blueprint */}
        <div className="p-3 bg-purple-950/70 border-2 border-purple-500 rounded-xl text-center shadow-[0_0_15px_rgba(168,85,247,0.25)]">
          <span className="text-xs font-mono font-bold text-purple-200 block mb-1">Blueprint: class Car</span>
          <span className="text-[10px] text-purple-300 font-mono">self.make, self.model</span>
        </div>

        <ArrowRight className="w-5 h-5 text-purple-400 rotate-90 sm:rotate-0" />

        {/* Instantiated Objects */}
        <div className="flex flex-col gap-2">
          <div className="p-2.5 bg-slate-950 border border-indigo-500/50 rounded-xl text-xs font-mono text-indigo-300">
            car1 = Car("Tesla", "Model 3")
          </div>
          <div className="p-2.5 bg-slate-950 border border-indigo-500/50 rounded-xl text-xs font-mono text-indigo-300">
            car2 = Car("Porsche", "911 GT3")
          </div>
        </div>
      </div>
    </div>
  );
};

// 9. DSA Stack Visualizer (LIFO Animation)
const DSAStackVisualizer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [stack, setStack] = useState(['Item 1', 'Item 2', 'Item 3 (TOP)']);

  const pushStack = () => {
    if (stack.length < 5) {
      setStack([...stack, `Item ${stack.length + 1}${stack.length === 0 ? ' (TOP)' : ' (TOP)'}`]);
    }
  };

  const popStack = () => {
    if (stack.length > 0) {
      setStack(stack.slice(0, stack.length - 1));
    }
  };

  return (
    <div className="w-full bg-slate-900/90 dark:bg-[#0d1117] rounded-2xl p-5 border border-purple-500/20 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-rose-300">LIFO Stack Simulation</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Last-In, First-Out</span>
      </div>

      <div className="flex flex-col-reverse items-center gap-1.5 my-3 min-h-[110px] justify-start">
        {stack.map((item, idx) => (
          <motion.div
            key={idx}
            layout
            initial={{ scale: 0.8, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className={`w-48 py-2 rounded-xl text-center font-mono text-xs font-semibold border ${
              idx === stack.length - 1 
                ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {item}
          </motion.div>
        ))}
      </div>

      {!compact && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={popStack}
            disabled={stack.length === 0}
            className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 px-3 py-1.5 rounded-lg font-mono"
          >
            stack.pop()
          </button>
          <button
            onClick={pushStack}
            disabled={stack.length >= 5}
            className="text-xs bg-rose-600/30 border border-rose-500 hover:bg-rose-600/40 disabled:opacity-40 text-rose-200 px-3 py-1.5 rounded-lg font-mono"
          >
            stack.append()
          </button>
        </div>
      )}
    </div>
  );
};

// 10. General Step Visualizer fallback
const GeneralVisualizer: React.FC<{ concept: PythonConcept; compact?: boolean }> = ({ concept, compact }) => {
  const steps = concept.visualData?.steps || ['Input Specification', 'Execution Logic', 'Output Result'];

  return (
    <div className="w-full bg-slate-900/90 dark:bg-[#0d1117] rounded-2xl p-5 border border-purple-500/20 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-purple-300">
            {concept.visualData?.headline || `${concept.title} Workflow`}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Concept Architecture</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 my-2">
        {steps.map((step: string, idx: number) => (
          <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-purple-400 mb-1">Step {idx + 1}</span>
            <span className="text-xs text-slate-200 font-medium">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
