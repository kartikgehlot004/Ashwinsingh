export interface Research {
  id: string;
  title: string;
  category: string;
  journal: string;
  year: string;
  summary: string;
  tags: string[];
  methodology: string;
  findings: string;
  impact: string;
  pdfUrl?: string;
  fullContent?: string;
  // User requested snake_case / explicit properties compatibility
  abstract?: string;
  content?: string;
  pdf_url?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  snippet: string;
  views: number;
  pdfUrl?: string;
  content?: string;
  tags?: string[];
  // User requested snake_case / explicit properties compatibility
  publish_date?: string;
  excerpt?: string;
  pdf_url?: string;
}

export interface Publication {
  id: string;
  title: string;
  journal: string;
  year: string;
  abstract: string;
  doi: string;
  citationCount: number;
  authors: string;
  // User requested snake_case / explicit properties compatibility
  journal_name?: string;
  publish_date?: string;
  doi_link?: string;
  co_authors?: string;
  pdf_url?: string;
  pdfUrl?: string; // standard fallback
}

export interface Note {
  id: string;
  title: string;
  size: string;
  type: string;
  description: string;
  content: string;
  downloadUrl?: string;
  isUserUploaded?: boolean;
  pdfUrl?: string;
  tags?: string[];
  date?: string;
  // User requested snake_case / explicit properties compatibility
  publish_date?: string;
  summary?: string;
  pdf_url?: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  institution: string;
  description: string;
  achievementType: 'education' | 'research' | 'award' | 'publication';
}
