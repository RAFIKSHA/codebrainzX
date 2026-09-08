export type ConceptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED';

export type CategoryKey = 
  | 'foundation' 
  | 'logic' 
  | 'core' 
  | 'oop' 
  | 'advanced' 
  | 'dsa';

export interface ConceptCategory {
  id: CategoryKey;
  number: string; // e.g. "01"
  name: string; // e.g. "FOUNDATION"
  title: string; // e.g. "Build the basics of Python"
  color: string; // Hex or Tailwind color
  bgColor: string;
  borderColor: string;
  iconName: string;
}

export type VisualType = 
  | 'variable' 
  | 'data-type' 
  | 'condition' 
  | 'loop' 
  | 'function' 
  | 'list' 
  | 'dict' 
  | 'oop' 
  | 'dsa-stack' 
  | 'dsa-pointer'
  | 'general';

export interface RealWorldDomain {
  domain: string; // e.g. "E-commerce", "Banking", "Streaming", "SaaS"
  icon: string;
  description: string;
  mappings: Array<{
    key: string;
    typeOrValue: string;
    explanation: string;
  }>;
}

export interface PracticeQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'interview';
  title: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hints?: string[];
}

export interface DSAConnectionStep {
  title: string;
  description: string;
  tag?: string;
}

export interface DSAConnectionData {
  title: string;
  summary: string;
  whyItMatters: string;
  steps: DSAConnectionStep[];
  recommendedProblems: Array<{
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    pattern: string;
  }>;
}

export interface PythonConcept {
  id: string; // slug e.g. 'data-types'
  order: number;
  title: string; // e.g. "Data Types"
  category: CategoryKey;
  shortDefinition: string; // Short 1-liner for graph node / tooltip
  definition: string; // Full professional definition
  simpleExplanation: string; // "In simple words" metaphor
  visualType: VisualType;
  visualData?: Record<string, any>;
  whyItMatters: {
    description: string;
    connectedChips: string[]; // e.g. ["Variables", "Operators", "Conditions", "Functions", "DSA"]
  };
  realWorld: {
    primaryDomain: RealWorldDomain;
    otherDomains?: RealWorldDomain[];
  };
  code: {
    snippet: string;
    expectedOutput: string;
    explanation?: string;
  };
  practice: {
    easyCount: number;
    mediumCount: number;
    interviewCount: number;
    questions: PracticeQuestion[];
  };
  dsaConnection: DSAConnectionData;
  prerequisites: string[]; // IDs of previous concepts
  nextConceptId: string; // ID of next concept in progression
  nextConceptReason: string; // "Now learn how Python makes decisions."
  relatedConceptIds: string[]; // Nearby graph connections
}

export interface LearningProgress {
  completedConceptIds: string[];
  activeConceptId: string;
  bookmarkedConceptIds: string[];
  completedPracticeIds: string[];
}
