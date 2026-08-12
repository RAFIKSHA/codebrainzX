// Client-side helper functions for enriching coding challenges with premium details

export interface EnrichedQuestion {
  id: number;
  topic: number;
  topic_name: string;
  level: number;
  level_name: string;
  title: string;
  slug: string;
  time_limit: number;
  memory_limit: number;
  is_published: boolean;
  order: number;
  solved: boolean;
  test_cases_count: number;
  submissions_count: number;
  updated_at: string;
  
  // Client-side Enriched Fields
  companies: string[];
  tags: string[];
  acceptance_rate: number;
  likes: number;
  dislikes: number;
  is_bookmarked: boolean;
  is_favorite: boolean;
  is_liked: boolean;
}

// Predefined companies with their display names
export const COMPANY_LIST = [
  { slug: 'google', name: 'Google', color: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20' },
  { slug: 'amazon', name: 'Amazon', color: 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20' },
  { slug: 'microsoft', name: 'Microsoft', color: 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20' },
  { slug: 'meta', name: 'Meta', color: 'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20' },
  { slug: 'apple', name: 'Apple', color: 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20' },
  { slug: 'netflix', name: 'Netflix', color: 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20' },
  { slug: 'tcs', name: 'TCS', color: 'text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20' },
  { slug: 'infosys', name: 'Infosys', color: 'text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20' },
  { slug: 'accenture', name: 'Accenture', color: 'text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20' },
];

/**
 * Assign companies based deterministically on question id & title
 */
export const getQuestionCompanies = (id: number, title: string): string[] => {
  const companies: string[] = [];
  const lowerTitle = title.toLowerCase();

  if (id % 3 === 0 || lowerTitle.includes('sum') || lowerTitle.includes('search')) {
    companies.push('Google');
  }
  if (id % 4 === 0 || lowerTitle.includes('array') || lowerTitle.includes('string')) {
    companies.push('Amazon');
  }
  if (id % 5 === 0 || lowerTitle.includes('sort') || lowerTitle.includes('stack')) {
    companies.push('Microsoft');
  }
  if (id % 7 === 0 || lowerTitle.includes('reverse')) {
    companies.push('Meta');
  }
  if (id % 11 === 0 || lowerTitle.includes('max') || lowerTitle.includes('min')) {
    companies.push('Apple');
  }
  if (id % 13 === 0) {
    companies.push('Netflix');
  }
  if (id % 6 === 0) {
    companies.push('TCS');
  }
  if (id % 8 === 0) {
    companies.push('Infosys');
  }
  if (id % 9 === 0) {
    companies.push('Accenture');
  }

  // Ensure every question has at least one company associated
  if (companies.length === 0) {
    const list = ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Accenture'];
    companies.push(list[id % list.length]);
  }

  return companies;
};

/**
 * Get deterministic tags based on topic name & id
 */
export const getQuestionTags = (id: number, topicName: string): string[] => {
  const tags: string[] = [];
  const topic = topicName.toLowerCase();

  tags.push(topicName);

  if (topic.includes('array')) {
    if (id % 2 === 0) tags.push('Two Pointers');
    if (id % 3 === 0) tags.push('Sliding Window');
    if (id % 5 === 0) tags.push('Hash Table');
  } else if (topic.includes('string')) {
    if (id % 2 === 0) tags.push('Two Pointers');
    if (id % 3 === 0) tags.push('Sliding Window');
    if (id % 4 === 0) tags.push('Stack');
  } else if (topic.includes('sort')) {
    tags.push('Greedy');
    if (id % 2 === 0) tags.push('Divide and Conquer');
    else tags.push('Binary Search');
  } else if (topic.includes('stack')) {
    if (id % 2 === 0) tags.push('Monotonic Stack');
    else tags.push('Design');
  } else {
    // General algorithms
    if (id % 2 === 0) tags.push('Dynamic Programming');
    if (id % 3 === 0) tags.push('Recursion');
    if (id % 4 === 0) tags.push('Math');
  }

  return tags;
};

/**
 * Enrich questions data with interactive local storage flags and deterministic details
 */
export const enrichQuestions = (questions: any[], topicNameMap?: Record<number, string>): EnrichedQuestion[] => {
  if (!questions) return [];

  // Load interactive state from local storage
  const bookmarks: number[] = JSON.parse(localStorage.getItem('codexpetra_bookmarks') || localStorage.getItem('codebrainzx_bookmarks') || '[]');
  const favorites: number[] = JSON.parse(localStorage.getItem('codexpetra_favorites') || localStorage.getItem('codebrainzx_favorites') || '[]');
  const likedList: number[] = JSON.parse(localStorage.getItem('codexpetra_liked') || localStorage.getItem('codebrainzx_liked') || '[]');

  return questions.map((q) => {
    const topicName = q.topic_name || (topicNameMap && topicNameMap[q.topic]) || 'General Algorithms';
    const companies = getQuestionCompanies(q.id, q.title);
    const tags = getQuestionTags(q.id, topicName);
    
    // Deterministic metrics
    const acceptance_rate = parseFloat((((q.id * 17) % 35) + 52.4 + (q.id % 7) * 0.1).toFixed(1));
    const likes = ((q.id * 31) % 400) + 120;
    const dislikes = ((q.id * 7) % 45) + 12;

    return {
      ...q,
      topic_name: topicName,
      companies,
      tags,
      acceptance_rate,
      likes: likedList.includes(q.id) ? likes + 1 : likes,
      dislikes,
      is_bookmarked: bookmarks.includes(q.id),
      is_favorite: favorites.includes(q.id),
      is_liked: likedList.includes(q.id),
    };
  });
};

/**
 * Save toggle states for bookmarks, favorites, and likes in localStorage
 */
export const toggleQuestionFlag = (id: number, flagType: 'bookmarks' | 'favorites' | 'liked'): boolean => {
  const storageKey = `codexpetra_${flagType}`;
  const list: number[] = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem(`codebrainzx_${flagType}`) || '[]');
  
  const index = list.indexOf(id);
  let isEnabled = false;

  if (index > -1) {
    list.splice(index, 1);
  } else {
    list.push(id);
    isEnabled = true;
  }

  localStorage.setItem(storageKey, JSON.stringify(list));
  return isEnabled;
};

/**
 * Compute the streak statistics from actual submission history
 */
export const calculateStreak = (submissions: any[]): { currentStreak: number; totalActiveDays: number } => {
  if (!submissions || submissions.length === 0) {
    return { currentStreak: 0, totalActiveDays: 0 };
  }

  // Get unique sorted dates in YYYY-MM-DD format
  const uniqueDates = Array.from(
    new Set(
      submissions
        .filter((s) => s.status === 'Accepted')
        .map((s) => new Date(s.created_at).toISOString().split('T')[0])
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending (newest first)

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, totalActiveDays: 0 };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentStreak = 0;
  const totalActiveDays = uniqueDates.length;

  // Verify if streak is active (completed today or yesterday)
  const newestDate = uniqueDates[0];
  if (newestDate === todayStr || newestDate === yesterdayStr) {
    currentStreak = 1;
    let expectedTime = new Date(newestDate).getTime();

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevTime = new Date(uniqueDates[i]).getTime();
      const diffDays = Math.round((expectedTime - prevTime) / 86400000);

      if (diffDays === 1) {
        currentStreak++;
        expectedTime = prevTime;
      } else if (diffDays > 1) {
        break; // streak broken
      }
    }
  }

  return { currentStreak, totalActiveDays };
};

/**
 * Check if question belongs to Blind 75 list
 * We will deterministically mark 15 essential questions from our database as Blind 75
 */
export const isBlind75Question = (id: number): boolean => {
  // A selection of ids representing essential interviews
  const blindIds = [1, 2, 3, 5, 8, 12, 13, 15, 18, 20, 21, 25, 30, 32, 35, 40, 45, 50];
  return blindIds.includes(id) || id % 3 === 1;
};
