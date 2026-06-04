import React, { createContext, useContext, useState, useEffect } from 'react';
import { Research, Article, Publication, Note, TimelineMilestone } from '../types';
import { researchesData, generateArticles, publicationsData, notesData, timelineData } from '../data';
import { supabase } from './supabaseClient';

export interface HomeConfig {
  title: string;
  subtitle: string;
  typedText: string;
  stats: { id: string; value: string; label: string; iconName: string }[];
}

export interface AboutConfig {
  bioParagraph1: string;
  bioParagraph2: string;
  quote: string;
  quoteAuthor: string;
}

export interface ContactConfig {
  address: string;
  hours: string;
  email: string;
}

export interface SocialPlatformLink {
  id: string;
  platform: string;
  url: string;
  iconType: string;
}

export interface FooterConfig {
  email: string;
  tagline: string;
  copyright: string;
  showYoutube: boolean;
  youtubeUrl: string;
  showLinkedin: boolean;
  linkedinUrl: string;
  showSlideshare: boolean;
  showEmail: boolean;
  socialLinks: SocialPlatformLink[];
  slideshareUrl: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

export interface ContactReply {
  id: string;
  submissionId: string;
  recipientEmail: string;
  subject: string;
  message: string;
  date: string;
  smtpUsed?: string;
  previewUrl?: string;
}

interface DataContextType {
  // Lists
  researches: Research[];
  articles: Article[];
  publications: Publication[];
  notes: Note[];
  timeline: TimelineMilestone[];
  contactSubmissions: ContactSubmission[];
  contactReplies: ContactReply[];

  // Configs
  homeConfig: HomeConfig;
  aboutConfig: AboutConfig;
  contactConfig: ContactConfig;
  footerConfig: FooterConfig;

  // Setters/CRUD Actions
  setResearches: React.Dispatch<React.SetStateAction<Research[]>>;
  addResearch: (item: Omit<Research, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateResearch: (id: string, item: Research) => Promise<{ success: boolean; error?: string }>;
  deleteResearch: (id: string) => Promise<{ success: boolean; error?: string }>;

  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  addArticle: (item: Omit<Article, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateArticle: (id: string, item: Article) => Promise<{ success: boolean; error?: string }>;
  deleteArticle: (id: string) => Promise<{ success: boolean; error?: string }>;

  setPublications: React.Dispatch<React.SetStateAction<Publication[]>>;
  addPublication: (item: Omit<Publication, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updatePublication: (id: string, item: Publication) => Promise<{ success: boolean; error?: string }>;
  deletePublication: (id: string) => Promise<{ success: boolean; error?: string }>;

  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  addNote: (item: Omit<Note, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateNote: (id: string, item: Note) => Promise<{ success: boolean; error?: string }>;
  deleteNote: (id: string) => Promise<{ success: boolean; error?: string }>;

  setTimeline: React.Dispatch<React.SetStateAction<TimelineMilestone[]>>;
  addTimelineItem: (item: TimelineMilestone) => Promise<{ success: boolean; error?: string }>;
  updateTimelineItem: (year: string, item: TimelineMilestone) => Promise<{ success: boolean; error?: string }>;
  deleteTimelineItem: (year: string) => Promise<{ success: boolean; error?: string }>;

  setContactSubmissions: React.Dispatch<React.SetStateAction<ContactSubmission[]>>;
  addContactSubmission: (item: Omit<ContactSubmission, 'id' | 'date'>) => void;
  deleteContactSubmission: (id: string) => void;

  addContactReply: (item: Omit<ContactReply, 'id' | 'date'>) => void;
  updateContactReply: (id: string, item: ContactReply) => void;
  deleteContactReply: (id: string) => void;

  updateHomeConfig: (updates: Partial<HomeConfig>) => void;
  updateAboutConfig: (updates: Partial<AboutConfig>) => void;
  updateContactConfig: (updates: Partial<ContactConfig>) => void;
  updateFooterConfig: (updates: Partial<FooterConfig>) => void;

  researchIndexes: string[];
  setResearchIndexes: React.Dispatch<React.SetStateAction<string[]>>;
  articleIndexes: string[];
  setArticleIndexes: React.Dispatch<React.SetStateAction<string[]>>;
  noteIndexes: string[];
  setNoteIndexes: React.Dispatch<React.SetStateAction<string[]>>;

  // Supabase states & methods
  supabaseLoading: boolean;
  supabaseConnectionStatus: {
    connected: boolean;
    tables: Record<string, 'connected' | 'checking' | 'missing'>;
  };
  loadFromSupabase: () => Promise<void>;
  pushAllDataToSupabase: () => Promise<{ success: boolean; message: string }>;
}

const sortItems = <T extends { id: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const parseId = (id: string) => {
      const parts = id.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      return isNaN(num) ? 0 : num;
    };
    const idA = parseId(a.id);
    const idB = parseId(b.id);
    
    const isNewA = idA > 100000;
    const isNewB = idB > 100000;
    
    if (isNewA && isNewB) {
      return idB - idA;
    }
    if (isNewA && !isNewB) {
      return -1;
    }
    if (!isNewA && isNewB) {
      return 1;
    }
    
    return idA - idB;
  });
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Helper to load or initialize fallback state
  const getStored = <T,>(key: string, fallback: T): T => {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as T;
      } catch (e) {
        return fallback;
      }
    }
    return fallback;
  };

  // 1. Array States initialized from localStorage or static fallbacks
  const [researches, setResearches] = useState<Research[]>(() => 
    getStored<Research[]>('pg_researches', researchesData)
  );
  const [articles, setArticles] = useState<Article[]>(() => 
    getStored<Article[]>('pg_articles', generateArticles())
  );
  const [publications, setPublications] = useState<Publication[]>(() => 
    getStored<Publication[]>('pg_publications', publicationsData)
  );
  const [notes, setNotes] = useState<Note[]>(() => 
    getStored<Note[]>('pg_notes', notesData)
  );
  const [timeline, setTimeline] = useState<TimelineMilestone[]>(() => 
    getStored<TimelineMilestone[]>('pg_timeline', timelineData)
  );
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>(() => 
    getStored<ContactSubmission[]>('pg_contact_submissions', [
      {
        id: "sub-1",
        name: "Dr. Rachel Green",
        email: "rachel.g@university.edu",
        message: "Interested in the synergy of Boswellic acids and Curcumin. Do you have secondary preclinical toxicity screens or liver clearance assay logs available?",
        date: "2026-05-25 10:15"
      },
      {
        id: "sub-2",
        name: "Arjun Mehta",
        email: "arjun.m@pharmastudents.org",
        message: "Hello Dr. Ashwin, I wanted to ask if you are offering laboratory rotations or student mentorships on nanoparticle preparation during the upcoming winter semester.",
        date: "2026-05-24 16:30"
      }
    ])
  );

  const [contactReplies, setContactReplies] = useState<ContactReply[]>(() =>
    getStored<ContactReply[]>('pg_contact_replies', [
      {
        id: "rep-1",
        submissionId: "sub-1",
        recipientEmail: "rachel.g@university.edu",
        subject: "Re: Preclinical toxicity screens & liver clearance logs",
        message: "Hello Dr. Green,\n\nThank you for reaching out. Yes, we have compiled detailed hepatic clearance assays and cytochrome P450 inhibition profiles for our primary Boswellic-Curcumin conjugates. I am attaching a summarized PDF report for your academic review, which also covers the PLGA carrier toxicity profiles.\n\nBest regards,\nDr. Ashwin Singh Chouhan",
        date: "2026-05-25 14:20",
        smtpUsed: "Ethereal Sandboxed SMTP"
      }
    ])
  );

  // 2. Config States
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(() => 
    getStored<HomeConfig>('pg_home_config', {
      title: "Dr. Ashwin Singh Chouhan",
      subtitle: "Pharmacologist & Researcher",
      typedText: "Pioneering therapeutic mechanisms, drug targeting systems, and novel bioactive formulations.",
      stats: [
        { id: "stat-1", value: "12+", label: "Years in Pharma Research", iconName: "Beaker" },
        { id: "stat-2", value: "60+", label: "Research Articles", iconName: "FileText" },
        { id: "stat-3", value: "1200+", label: "Academic Citations", iconName: "Award" },
        { id: "stat-4", value: "10+", label: "Registered Patent Notebooks", iconName: "HeartPulse" }
      ]
    })
  );

  const [aboutConfig, setAboutConfig] = useState<AboutConfig>(() => 
    getStored<AboutConfig>('pg_about_config', {
      bioParagraph1: "Dr. Ashwin Singh Chouhan is a celebrated clinical specialist, researcher and academician in pharmacology. Over a career spanning more than 12 years, Dr. Chouhan has specialized in evaluating the molecular mechanisms of targeted chemical substances and phytomedicinal co-formulations.",
      bioParagraph2: "His doctoral research at Central Science University pioneered the synthesis of biotin-conjugated PLGA nanoparticles designed to deliver oncology medicines selectively into receptor tissue. Dr. Chouhan's labs consistently focus on solving core bioavailability and clearance problems for native botanical extracts—bringing traditional remedies securely to standardized corporate trials.",
      quote: "We must validate therapeutic molecules using clean preclinical evidence. Translating biochemistry with mathematical modeling is how we discover the next generation of safe, effective treatments.",
      quoteAuthor: "Dr. Ashwin Singh Chouhan, Principal Advisor"
    })
  );

  const [contactConfig, setContactConfig] = useState<ContactConfig>(() => {
    const loaded = getStored<ContactConfig>('pg_contact_config', {
      address: "Molecular Pharmacology & Nanotech Facility, Faculty of Pharmaceutical Research, State University.",
      hours: "(Mon-Fri : 11:00AM to 2:00PM)",
      email: "ashwinsingh26061992@gmail.com"
    });
    if (loaded.hours === "Mon - Fri: 14:00 to 17:00 IST" || !loaded.hours) {
      loaded.hours = "(Mon-Fri : 11:00AM to 2:00PM)";
    }
    return loaded;
  });

  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() => {
    const val = getStored<FooterConfig>('pg_footer_config', {
      email: "ashwinsingh26061992@gmail.com",
      tagline: "Pioneering robust molecular formulations, pharmacological mechanisms, and preclinical evaluations to build safer therapeutics and empower the next generation of academic discovery.",
      copyright: "Copyright © 2026 Dr. Ashwin Singh Chouhan | All Rights Reserved.",
      showYoutube: true,
      youtubeUrl: "https://www.youtube.com/@ashwinsinghchouhan5221",
      showLinkedin: true,
      linkedinUrl: "https://linkedin.com/in/ashwin-singh-chouhan-abba34161",
      showSlideshare: true,
      slideshareUrl: "https://www.slideshare.net/AshwinsinghChouhan?tab=documents",
      showEmail: true,
      socialLinks: []
    });
    if (!val.socialLinks || val.socialLinks.length === 0) {
      val.socialLinks = [
        { id: "s-1", platform: "LinkedIn", url: "https://linkedin.com/in/ashwin-singh-chouhan-abba34161", iconType: "linkedin" },
        { id: "s-2", platform: "YouTube", url: "https://www.youtube.com/@ashwinsinghchouhan5221", iconType: "youtube" },
        { id: "s-3", platform: "SlideShare", url: "https://www.slideshare.net/AshwinsinghChouhan?tab=documents", iconType: "slideshare" },
        { id: "s-4", platform: "Email", url: "mailto:ashwinsingh26061992@gmail.com", iconType: "email" }
      ];
    }
    return val;
  });

  const [researchIndexes, setResearchIndexes] = useState<string[]>(() =>
    getStored<string[]>('pg_research_indexes', ['All', 'Herbal Medicine', 'Nanotechnology', 'Cardiology', 'Chemistry', 'Gastroenterology'])
  );

  const [articleIndexes, setArticleIndexes] = useState<string[]>(() =>
    getStored<string[]>('pg_article_indexes', ['All', 'Toxicology', 'Molecular Pharmacology', 'Clinical Studies', 'Herbal Medicine', 'Drug Discovery', 'Neuropharmacology', 'Pharmacokinetics'])
  );

  const [noteIndexes, setNoteIndexes] = useState<string[]>(() =>
    getStored<string[]>('pg_note_indexes', ['All', 'PDF', 'TXT', 'Syllabus', 'Pharma', 'Toxicology'])
  );

  // Supabase states
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseConnectionStatus, setSupabaseConnectionStatus] = useState<{
    connected: boolean;
    tables: Record<string, 'connected' | 'checking' | 'missing'>;
  }>({
    connected: false,
    tables: {
      site_configs: 'checking',
      researches: 'checking',
      articles: 'checking',
      publications: 'checking',
      notes: 'checking',
      timeline: 'checking',
      contact_submissions: 'checking',
      contact_replies: 'checking',
    }
  });

  // Mapping Helpers for Column Compatibility between legacy camelCase and snake_case requested by user
  const mapPayloadForDb = (table: string, data: any) => {
    if (table === 'researches') {
      return {
        id: data.id,
        title: data.title,
        category: data.category || '',
        journal: data.journal || '',
        year: data.year || '',
        summary: data.abstract || data.summary || '',
        abstract: data.abstract || data.summary || '',
        tags: data.tags || [],
        methodology: data.methodology || '',
        findings: data.findings || '',
        impact: data.impact || '',
        fullContent: data.content || data.fullContent || '',
        content: data.content || data.fullContent || '',
        pdfUrl: data.pdf_url || data.pdfUrl || '',
        pdf_url: data.pdf_url || data.pdfUrl || '',
      };
    }
    if (table === 'articles') {
      return {
        id: data.id,
        title: data.title,
        category: data.category || '',
        date: data.publish_date || data.date || '',
        publish_date: data.publish_date || data.date || '',
        readTime: data.readTime || '',
        author: data.author || '',
        snippet: data.excerpt || data.snippet || '',
        excerpt: data.excerpt || data.snippet || '',
        views: data.views || 0,
        content: data.content || '',
        tags: data.tags || [],
        pdfUrl: data.pdf_url || data.pdfUrl || '',
        pdf_url: data.pdf_url || data.pdfUrl || '',
      };
    }
    if (table === 'publications') {
      return {
        id: data.id,
        title: data.title,
        journal: data.journal_name || data.journal || '',
        journal_name: data.journal_name || data.journal || '',
        year: data.publish_date || data.year || '',
        publish_date: data.publish_date || data.year || '',
        abstract: data.abstract || '',
        doi: data.doi || '',
        doi_link: data.doi_link || '',
        citationCount: data.citationCount || 0,
        authors: data.co_authors || data.authors || '',
        co_authors: data.co_authors || data.authors || '',
        pdfUrl: data.pdf_url || data.pdfUrl || '',
        pdf_url: data.pdf_url || data.pdfUrl || '',
      };
    }
    if (table === 'notes') {
      return {
        id: data.id,
        title: data.title,
        size: data.size || '',
        type: data.type || '',
        description: data.summary || data.description || '',
        summary: data.summary || data.description || '',
        content: data.content || '',
        downloadUrl: data.downloadUrl || '',
        isUserUploaded: data.isUserUploaded || false,
        pdfUrl: data.pdf_url || data.pdfUrl || '',
        pdf_url: data.pdf_url || data.pdfUrl || '',
        tags: data.tags || [],
        date: data.publish_date || data.date || '',
        publish_date: data.publish_date || data.date || '',
      };
    }
    return data;
  };

  const mapPayloadFromDb = (table: string, data: any) => {
    if (table === 'researches') {
      return {
        ...data,
        summary: data.abstract || data.summary || '',
        abstract: data.abstract || data.summary || '',
        fullContent: data.content || data.fullContent || '',
        content: data.content || data.fullContent || '',
        pdfUrl: data.pdf_url || data.pdfUrl || '',
        pdf_url: data.pdf_url || data.pdfUrl || '',
      };
    }
    if (table === 'articles') {
      return {
        ...data,
        date: data.publish_date || data.date || '',
        publish_date: data.publish_date || data.date || '',
        snippet: data.excerpt || data.snippet || '',
        excerpt: data.excerpt || data.snippet || '',
        pdfUrl: data.pdf_url || data.pdfUrl || '',
        pdf_url: data.pdf_url || data.pdfUrl || '',
      };
    }
    if (table === 'publications') {
      return {
        ...data,
        journal: data.journal_name || data.journal || '',
        journal_name: data.journal_name || data.journal || '',
        year: data.publish_date || data.year || '',
        publish_date: data.publish_date || data.year || '',
        authors: data.co_authors || data.authors || '',
        co_authors: data.co_authors || data.authors || '',
        pdfUrl: data.pdf_url || data.pdfUrl || '',
        pdf_url: data.pdf_url || data.pdfUrl || '',
      };
    }
    if (table === 'notes') {
      return {
        ...data,
        description: data.summary || data.description || '',
        summary: data.summary || data.description || '',
        pdfUrl: data.pdf_url || data.pdfUrl || '',
        pdf_url: data.pdf_url || data.pdfUrl || '',
        date: data.publish_date || data.date || '',
        publish_date: data.publish_date || data.date || '',
      };
    }
    return data;
  };

  // 3. Write updates to localStorage on change
  useEffect(() => { localStorage.setItem('pg_researches', JSON.stringify(researches)); }, [researches]);
  useEffect(() => { localStorage.setItem('pg_articles', JSON.stringify(articles)); }, [articles]);
  useEffect(() => { localStorage.setItem('pg_publications', JSON.stringify(publications)); }, [publications]);
  useEffect(() => { localStorage.setItem('pg_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('pg_timeline', JSON.stringify(timeline)); }, [timeline]);
  useEffect(() => { localStorage.setItem('pg_contact_submissions', JSON.stringify(contactSubmissions)); }, [contactSubmissions]);
  useEffect(() => { localStorage.setItem('pg_home_config', JSON.stringify(homeConfig)); }, [homeConfig]);
  useEffect(() => { localStorage.setItem('pg_about_config', JSON.stringify(aboutConfig)); }, [aboutConfig]);
  useEffect(() => { localStorage.setItem('pg_contact_config', JSON.stringify(contactConfig)); }, [contactConfig]);
  useEffect(() => { localStorage.setItem('pg_footer_config', JSON.stringify(footerConfig)); }, [footerConfig]);
  useEffect(() => { localStorage.setItem('pg_research_indexes', JSON.stringify(researchIndexes)); }, [researchIndexes]);
  useEffect(() => { localStorage.setItem('pg_article_indexes', JSON.stringify(articleIndexes)); }, [articleIndexes]);
  useEffect(() => { localStorage.setItem('pg_note_indexes', JSON.stringify(noteIndexes)); }, [noteIndexes]);
  useEffect(() => { localStorage.setItem('pg_contact_replies', JSON.stringify(contactReplies)); }, [contactReplies]);

  // Loader from Supabase
  const loadFromSupabase = async (skipAutoSeed = false) => {
    setSupabaseLoading(true);
    let isConnected = false;
    const tableStatus = { ...supabaseConnectionStatus.tables };

    try {
      // 1. Check & Load site_configs
      const { data: configs, error: configError } = await supabase.from('site_configs').select('*');
      if (!configError && configs) {
        isConnected = true;
        tableStatus.site_configs = 'connected';
        configs.forEach(cfg => {
          const val = cfg.value;
          if (cfg.key === 'homeConfig') setHomeConfig(val);
          if (cfg.key === 'aboutConfig') setAboutConfig(val);
          if (cfg.key === 'contactConfig') setContactConfig(val);
          if (cfg.key === 'footerConfig') setFooterConfig(val);
          if (cfg.key === 'researchIndexes') setResearchIndexes(val);
          if (cfg.key === 'articleIndexes') setArticleIndexes(val);
          if (cfg.key === 'noteIndexes') setNoteIndexes(val);
        });
      } else {
        tableStatus.site_configs = 'missing';
      }

      // 2. Load Researches
      const { data: resData, error: resError } = await supabase.from('researches').select('*');
      if (!resError && resData) {
        if (resData.length > 0) {
          setResearches(resData.map(r => mapPayloadFromDb('researches', r)));
        }
        tableStatus.researches = 'connected';
      } else {
        tableStatus.researches = 'missing';
      }

      // 3. Load Articles
      const { data: artData, error: artError } = await supabase.from('articles').select('*');
      if (!artError && artData) {
        if (artData.length > 0) {
          setArticles(artData.map(a => mapPayloadFromDb('articles', a)));
        }
        tableStatus.articles = 'connected';
      } else {
        tableStatus.articles = 'missing';
      }

      // 4. Load Publications
      const { data: pubData, error: pubError } = await supabase.from('publications').select('*');
      if (!pubError && pubData) {
        if (pubData.length > 0) {
          setPublications(pubData.map(p => mapPayloadFromDb('publications', p)));
        }
        tableStatus.publications = 'connected';
      } else {
        tableStatus.publications = 'missing';
      }

      // 5. Load Notes
      const { data: noteData, error: noteError } = await supabase.from('notes').select('*');
      if (!noteError && noteData) {
        if (noteData.length > 0) {
          setNotes(noteData.map(n => mapPayloadFromDb('notes', n)));
        }
        tableStatus.notes = 'connected';
      } else {
        tableStatus.notes = 'missing';
      }

      // 6. Load Timeline
      const { data: timeData, error: timeError } = await supabase.from('timeline').select('*');
      if (!timeError && timeData) {
        if (timeData.length > 0) {
          setTimeline(timeData);
        }
        tableStatus.timeline = 'connected';
      } else {
        tableStatus.timeline = 'missing';
      }

      // 7. Load Contact Submissions
      const { data: contactData, error: contactError } = await supabase.from('contact_submissions').select('*');
      if (!contactError && contactData) {
        if (contactData.length > 0) {
          setContactSubmissions(contactData);
        }
        tableStatus.contact_submissions = 'connected';
      } else {
        tableStatus.contact_submissions = 'missing';
      }

      // 8. Load Contact Replies
      const { data: repliesData, error: repliesError } = await supabase.from('contact_replies').select('*');
      if (!repliesError && repliesData) {
        if (repliesData.length > 0) {
          setContactReplies(repliesData);
        }
        tableStatus.contact_replies = 'connected';
      } else {
        tableStatus.contact_replies = 'missing';
      }

      // Auto-seeding logic if DB is connected but empty of data elements
      let totalCount = 0;
      let hasConnectedTable = false;

      if (configs) { totalCount += configs.length; hasConnectedTable = true; }
      if (resData) { totalCount += resData.length; hasConnectedTable = true; }
      if (artData) { totalCount += artData.length; hasConnectedTable = true; }
      if (pubData) { totalCount += pubData.length; hasConnectedTable = true; }
      if (noteData) { totalCount += noteData.length; hasConnectedTable = true; }
      if (timeData) { totalCount += timeData.length; hasConnectedTable = true; }

      if (hasConnectedTable && totalCount === 0 && !skipAutoSeed) {
        console.warn("Supabase tables exist but are completely empty. Initiating automatic data-seeding loop to populate remote tables...");
        
        // Push configurations
        const configsToPush = [
          { key: 'homeConfig', value: homeConfig },
          { key: 'aboutConfig', value: aboutConfig },
          { key: 'contactConfig', value: contactConfig },
          { key: 'footerConfig', value: footerConfig },
          { key: 'researchIndexes', value: researchIndexes },
          { key: 'articleIndexes', value: articleIndexes },
          { key: 'noteIndexes', value: noteIndexes },
        ];
        
        if (tableStatus.site_configs === 'connected') {
          for (const config of configsToPush) {
            await supabase.from('site_configs').upsert(config as any);
          }
        }
        
        // Push researches data
        if (tableStatus.researches === 'connected') {
          for (const res of researches) {
            const dbPayload = mapPayloadForDb('researches', res);
            await supabase.from('researches').upsert(dbPayload);
          }
        }
        
        // Push articles data
        if (tableStatus.articles === 'connected') {
          for (const art of articles) {
            const dbPayload = mapPayloadForDb('articles', art);
            await supabase.from('articles').upsert(dbPayload);
          }
        }
        
        // Push publications data
        if (tableStatus.publications === 'connected') {
          for (const pub of publications) {
            const dbPayload = mapPayloadForDb('publications', pub);
            await supabase.from('publications').upsert(dbPayload);
          }
        }
        
        // Push notes data
        if (tableStatus.notes === 'connected') {
          for (const note of notes) {
            const dbPayload = mapPayloadForDb('notes', note);
            await supabase.from('notes').upsert(dbPayload);
          }
        }
        
        // Push timeline data
        if (tableStatus.timeline === 'connected') {
          for (const item of timeline) {
            await supabase.from('timeline').upsert(item);
          }
        }
        
        // Push contact submissions
        if (tableStatus.contact_submissions === 'connected') {
          for (const sub of contactSubmissions) {
            await supabase.from('contact_submissions').upsert(sub);
          }
        }
        
        // Push contact replies
        if (tableStatus.contact_replies === 'connected') {
          for (const rep of contactReplies) {
            await supabase.from('contact_replies').upsert(rep);
          }
        }
        
        // Re-read with skipAutoSeed = true to prevent recursive loops
        await loadFromSupabase(true);
        return;
      }

      setSupabaseConnectionStatus({
        connected: isConnected,
        tables: tableStatus
      });
    } catch (err) {
      console.error("Failed to load data from Supabase:", err);
      setSupabaseConnectionStatus(prev => ({
        ...prev,
        connected: false
      }));
    } finally {
      setSupabaseLoading(false);
    }
  };

  const pushAllDataToSupabase = async () => {
    const successList: string[] = [];
    const errorList: string[] = [];

    // 1. site_configs
    try {
      const configs = [
        { key: 'homeConfig', value: homeConfig },
        { key: 'aboutConfig', value: aboutConfig },
        { key: 'contactConfig', value: contactConfig },
        { key: 'footerConfig', value: footerConfig },
        { key: 'researchIndexes', value: researchIndexes },
        { key: 'articleIndexes', value: articleIndexes },
        { key: 'noteIndexes', value: noteIndexes },
      ];
      for (const config of configs) {
        const { error } = await supabase.from('site_configs').upsert(config as any);
        if (error) throw error;
      }
      successList.push('site_configs');
    } catch (e: any) {
      console.error("Failed to push site_configs:", e);
      errorList.push(`site_configs (${e.message || e.details || 'Table missing or RLS lock'})`);
    }

    // 2. researches
    try {
      for (const res of researches) {
        const dbPayload = mapPayloadForDb('researches', res);
        const { error } = await supabase.from('researches').upsert(dbPayload);
        if (error) throw error;
      }
      successList.push('researches');
    } catch (e: any) {
      console.error("Failed to push researches:", e);
      errorList.push(`researches (${e.message || e.details || 'Table missing or RLS lock'})`);
    }

    // 3. articles
    try {
      for (const art of articles) {
        const dbPayload = mapPayloadForDb('articles', art);
        const { error } = await supabase.from('articles').upsert(dbPayload);
        if (error) throw error;
      }
      successList.push('articles');
    } catch (e: any) {
      console.error("Failed to push articles:", e);
      errorList.push(`articles (${e.message || e.details || 'Table missing or RLS lock'})`);
    }

    // 4. publications
    try {
      for (const pub of publications) {
        const dbPayload = mapPayloadForDb('publications', pub);
        const { error } = await supabase.from('publications').upsert(dbPayload);
        if (error) throw error;
      }
      successList.push('publications');
    } catch (e: any) {
      console.error("Failed to push publications:", e);
      errorList.push(`publications (${e.message || e.details || 'Table missing or RLS lock'})`);
    }

    // 5. notes
    try {
      for (const note of notes) {
        const dbPayload = mapPayloadForDb('notes', note);
        const { error } = await supabase.from('notes').upsert(dbPayload);
        if (error) throw error;
      }
      successList.push('notes');
    } catch (e: any) {
      console.error("Failed to push notes:", e);
      errorList.push(`notes (${e.message || e.details || 'Table missing or RLS lock'})`);
    }

    // 6. timeline
    try {
      for (const item of timeline) {
        const { error } = await supabase.from('timeline').upsert(item);
        if (error) throw error;
      }
      successList.push('timeline');
    } catch (e: any) {
      console.error("Failed to push timeline:", e);
      errorList.push(`timeline (${e.message || e.details || 'Table missing or RLS lock'})`);
    }

    // 7. contact_submissions
    try {
      for (const sub of contactSubmissions) {
        const { error } = await supabase.from('contact_submissions').upsert(sub);
        if (error) throw error;
      }
      successList.push('contact_submissions');
    } catch (e: any) {
      console.error("Failed to push contact_submissions:", e);
      errorList.push(`contact_submissions (${e.message || e.details || 'Table missing or RLS lock'})`);
    }

    // 8. contact_replies
    try {
      for (const rep of contactReplies) {
        const { error } = await supabase.from('contact_replies').upsert(rep);
        if (error) throw error;
      }
      successList.push('contact_replies');
    } catch (e: any) {
      console.error("Failed to push contact_replies:", e);
      errorList.push(`contact_replies (${e.message || e.details || 'Table missing or RLS lock'})`);
    }

    await loadFromSupabase(true);

    if (errorList.length === 0) {
      return { success: true, message: "All local datasets successfully synced to live Supabase tables!" };
    } else if (successList.length > 0) {
      return { 
        success: false, 
        message: `Partial Sync Succeeded! Synced: [${successList.join(', ')}]. Failed: [${errorList.join(', ')}]. Run the provided SQL setup snippet in Supabase SQL editor & click 'Push' again!` 
      };
    } else {
      return { 
        success: false, 
        message: `Entire database synchronization failed! All tables are missing or locked by policies. Errors: [${errorList.join(', ')}]. Please copy-paste and run the complete SQL script below in your Supabase SQL Editor.` 
      };
    }
  };

  // Bootstrap background loader on mount
  useEffect(() => {
    loadFromSupabase();
  }, []);

  // 4. CRUD operations implementation with live Supabase synchronization
  const checkAdminAuth = (): boolean => {
    if (sessionStorage.getItem('pg_is_admin_logged_in') !== 'true') {
      alert("Access Denied: You must be logged in as an administrator to perform this operation.");
      return false;
    }
    return true;
  };

  const addResearch = async (item: Omit<Research, 'id'>) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    const newItem: Research = { ...item, id: `res-${Date.now()}` };
    const mapped = mapPayloadFromDb('researches', newItem) as Research;
    
    // Optimistically update local state first
    setResearches(prev => [mapped, ...prev]);

    // Push into Supabase
    try {
      const dbPayload = mapPayloadForDb('researches', mapped);
      const { error } = await supabase.from('researches').insert(dbPayload);
      if (error) {
        console.error("Supabase Research Write error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase connection exception:", e);
    }
    return { success: true };
  };

  const updateResearch = async (id: string, updated: Research) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    const mapped = mapPayloadFromDb('researches', updated) as Research;
    
    setResearches(prev => prev.map(item => item.id === id ? mapped : item));

    try {
      const dbPayload = mapPayloadForDb('researches', mapped);
      const { error } = await supabase.from('researches').update(dbPayload).eq('id', id);
      if (error) {
        console.error("Supabase Research Update error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase connection exception:", e);
    }
    return { success: true };
  };

  const deleteResearch = async (id: string) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    
    setResearches(prev => prev.filter(item => item.id !== id));

    try {
      const { error } = await supabase.from('researches').delete().eq('id', id);
      if (error) {
        console.error("Supabase Research Delete error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase connection exception:", e);
    }
    return { success: true };
  };

  const addArticle = async (item: Omit<Article, 'id'>) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    const newItem: Article = { ...item, id: `art-${Date.now()}` };
    const mapped = mapPayloadFromDb('articles', newItem) as Article;
    
    setArticles(prev => [mapped, ...prev]);

    try {
      const dbPayload = mapPayloadForDb('articles', mapped);
      const { error } = await supabase.from('articles').insert(dbPayload);
      if (error) {
        console.error("Supabase Article Write error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const updateArticle = async (id: string, updated: Article) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    const mapped = mapPayloadFromDb('articles', updated) as Article;
    
    setArticles(prev => prev.map(item => item.id === id ? mapped : item));

    try {
      const dbPayload = mapPayloadForDb('articles', mapped);
      const { error } = await supabase.from('articles').update(dbPayload).eq('id', id);
      if (error) {
        console.error("Supabase Article Update error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const deleteArticle = async (id: string) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    
    setArticles(prev => prev.filter(item => item.id !== id));

    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) {
        console.error("Supabase Article Delete error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const addPublication = async (item: Omit<Publication, 'id'>) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    const newItem: Publication = { ...item, id: `pub-${Date.now()}` };
    const mapped = mapPayloadFromDb('publications', newItem) as Publication;
    
    setPublications(prev => [mapped, ...prev]);

    try {
      const dbPayload = mapPayloadForDb('publications', mapped);
      const { error } = await supabase.from('publications').insert(dbPayload);
      if (error) {
        console.error("Supabase Publication Write error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const updatePublication = async (id: string, updated: Publication) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    const mapped = mapPayloadFromDb('publications', updated) as Publication;
    
    setPublications(prev => prev.map(item => item.id === id ? mapped : item));

    try {
      const dbPayload = mapPayloadForDb('publications', mapped);
      const { error } = await supabase.from('publications').update(dbPayload).eq('id', id);
      if (error) {
        console.error("Supabase Publication Update error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const deletePublication = async (id: string) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    
    setPublications(prev => prev.filter(item => item.id !== id));

    try {
      const { error } = await supabase.from('publications').delete().eq('id', id);
      if (error) {
        console.error("Supabase Publication Delete error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const addNote = async (item: Omit<Note, 'id'>) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    const newItem: Note = { ...item, id: `note-${Date.now()}` };
    const mapped = mapPayloadFromDb('notes', newItem) as Note;
    
    setNotes(prev => [mapped, ...prev]);

    try {
      const dbPayload = mapPayloadForDb('notes', mapped);
      const { error } = await supabase.from('notes').insert(dbPayload);
      if (error) {
        console.error("Supabase Note Write error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const updateNote = async (id: string, updated: Note) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    const mapped = mapPayloadFromDb('notes', updated) as Note;
    
    setNotes(prev => prev.map(item => item.id === id ? mapped : item));

    try {
      const dbPayload = mapPayloadForDb('notes', mapped);
      const { error } = await supabase.from('notes').update(dbPayload).eq('id', id);
      if (error) {
        console.error("Supabase Note Update error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const deleteNote = async (id: string) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    
    setNotes(prev => prev.filter(item => item.id !== id));

    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) {
        console.error("Supabase Note Delete error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const addTimelineItem = async (item: TimelineMilestone) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    
    setTimeline(prev => [...prev, item].sort((a, b) => a.year.localeCompare(b.year)));

    try {
      const { error } = await supabase.from('timeline').insert(item);
      if (error) {
        console.error("Supabase Timeline Write error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const updateTimelineItem = async (year: string, updated: TimelineMilestone) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    
    setTimeline(prev => prev.map(item => item.year === year ? updated : item).sort((a, b) => a.year.localeCompare(b.year)));

    try {
      const { error } = await supabase.from('timeline').update(updated).eq('year', year);
      if (error) {
        console.error("Supabase Timeline Update error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const deleteTimelineItem = async (year: string) => {
    if (!checkAdminAuth()) return { success: false, error: "Access Denied: Admin not authenticated" };
    
    setTimeline(prev => prev.filter(item => item.year !== year));

    try {
      const { error } = await supabase.from('timeline').delete().eq('year', year);
      if (error) {
        console.error("Supabase Timeline Delete error:", error.message);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error("Supabase exception:", e);
    }
    return { success: true };
  };

  const addContactSubmission = async (item: Omit<ContactSubmission, 'id' | 'date'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newItem: ContactSubmission = {
      ...item,
      id: `sub-${Date.now()}`,
      date: formattedDate
    };
    setContactSubmissions(prev => [newItem, ...prev]);

    try {
      await supabase.from('contact_submissions').insert(newItem);
    } catch (e) {
      console.error("Failed to sync Contact Submission to Supabase:", e);
    }
  };

  const deleteContactSubmission = async (id: string) => {
    if (!checkAdminAuth()) return;
    setContactSubmissions(prev => prev.filter(item => item.id !== id));

    try {
      await supabase.from('contact_submissions').delete().eq('id', id);
    } catch (e) {
      console.error("Failed to delete Contact Submission from Supabase:", e);
    }
  };

  const addContactReply = async (item: Omit<ContactReply, 'id' | 'date'>) => {
    if (!checkAdminAuth()) return;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newItem: ContactReply = {
      ...item,
      id: `rep-${Date.now()}`,
      date: formattedDate
    };
    setContactReplies(prev => [newItem, ...prev]);

    try {
      await supabase.from('contact_replies').insert(newItem);
    } catch (e) {
      console.error("Failed to insert Contact Reply into Supabase:", e);
    }
  };

  const updateContactReply = async (id: string, updated: ContactReply) => {
    if (!checkAdminAuth()) return;
    setContactReplies(prev => prev.map(item => item.id === id ? updated : item));

    try {
      await supabase.from('contact_replies').update(updated).eq('id', id);
    } catch (e) {
      console.error("Failed to update Contact Reply inside Supabase:", e);
    }
  };

  const deleteContactReply = async (id: string) => {
    if (!checkAdminAuth()) return;
    setContactReplies(prev => prev.filter(item => item.id !== id));

    try {
      await supabase.from('contact_replies').delete().eq('id', id);
    } catch (e) {
      console.error("Failed to delete Contact Reply in Supabase:", e);
    }
  };

  const updateHomeConfig = async (updates: Partial<HomeConfig>) => {
    if (!checkAdminAuth()) return;
    const next = { ...homeConfig, ...updates };
    setHomeConfig(next);

    try {
      await supabase.from('site_configs').upsert({ key: 'homeConfig', value: next });
    } catch (e) {
      console.error("Failed to save homeConfig to Supabase:", e);
    }
  };

  const updateAboutConfig = async (updates: Partial<AboutConfig>) => {
    if (!checkAdminAuth()) return;
    const next = { ...aboutConfig, ...updates };
    setAboutConfig(next);

    try {
      await supabase.from('site_configs').upsert({ key: 'aboutConfig', value: next });
    } catch (e) {
      console.error("Failed to save aboutConfig in Supabase:", e);
    }
  };

  const contactUpdates = async (updates: Partial<ContactConfig>) => {
    if (!checkAdminAuth()) return;
    const next = { ...contactConfig, ...updates };
    setContactConfig(next);

    try {
      await supabase.from('site_configs').upsert({ key: 'contactConfig', value: next });
    } catch (e) {
      console.error("Failed to save contactConfig inside Supabase:", e);
    }
  };

  const footerUpdates = async (updates: Partial<FooterConfig>) => {
    if (!checkAdminAuth()) return;
    const next = { ...footerConfig, ...updates };
    setFooterConfig(next);

    try {
      await supabase.from('site_configs').upsert({ key: 'footerConfig', value: next });
    } catch (e) {
      console.error("Failed to save footerConfig in Supabase:", e);
    }
  };

  // Sync indexing changes
  useEffect(() => {
    const syncIndexes = async () => {
      try {
        await supabase.from('site_configs').upsert({ key: 'researchIndexes', value: researchIndexes });
      } catch (e) { /* silent logs to keep it clean */ }
    };
    syncIndexes();
  }, [researchIndexes]);

  useEffect(() => {
    const syncIndexes = async () => {
      try {
        await supabase.from('site_configs').upsert({ key: 'articleIndexes', value: articleIndexes });
      } catch (e) { /* silent */ }
    };
    syncIndexes();
  }, [articleIndexes]);

  useEffect(() => {
    const syncIndexes = async () => {
      try {
        await supabase.from('site_configs').upsert({ key: 'noteIndexes', value: noteIndexes });
      } catch (e) { /* silent */ }
    };
    syncIndexes();
  }, [noteIndexes]);

  return (
    <DataContext.Provider value={{
      researches: sortItems(researches),
      articles: sortItems(articles),
      publications: sortItems(publications),
      notes: sortItems(notes),
      timeline,
      contactSubmissions,
      homeConfig,
      aboutConfig,
      contactConfig,
      footerConfig,
      setResearches,
      addResearch,
      updateResearch,
      deleteResearch,
      setArticles,
      addArticle,
      updateArticle,
      deleteArticle,
      setPublications,
      addPublication,
      updatePublication,
      deletePublication,
      setNotes,
      addNote,
      updateNote,
      deleteNote,
      setTimeline,
      addTimelineItem,
      updateTimelineItem,
      deleteTimelineItem,
      setContactSubmissions,
      addContactSubmission,
      deleteContactSubmission,
      contactReplies,
      addContactReply,
      updateContactReply,
      deleteContactReply,
      updateHomeConfig,
      updateAboutConfig,
      updateContactConfig: contactUpdates,
      updateFooterConfig: footerUpdates,
      researchIndexes,
      setResearchIndexes,
      articleIndexes,
      setArticleIndexes,
      noteIndexes,
      setNoteIndexes,
      // Supabase integration variables
      supabaseLoading,
      supabaseConnectionStatus,
      loadFromSupabase,
      pushAllDataToSupabase
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used inside a DataProvider');
  }
  return context;
}
