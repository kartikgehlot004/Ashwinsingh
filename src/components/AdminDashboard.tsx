import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from './DataContext';
import { supabase, getSupabaseConfig, updateSupabaseConfig } from './supabaseClient';
import RichTextEditor from './RichTextEditor';
import TagInput from './TagInput';
import { 
  Building, Beaker, FileText, Award, Notebook, User, Mail, 
  Trash2, Edit, Plus, Check, X, UploadCloud, Eye, EyeOff, Layout, LogOut,
  FileDown, Clock, Search, ExternalLink, Sparkles, AlertCircle, AlertTriangle,
  Database
} from 'lucide-react';
import { Research, Article, Publication, Note, TimelineMilestone } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
  setCurrentTab: (tab: string) => void;
}

export default function AdminDashboard({ onLogout, setCurrentTab }: AdminDashboardProps) {
  const {
    researches, addResearch, updateResearch, deleteResearch,
    articles, addArticle, updateArticle, deleteArticle,
    publications, addPublication, updatePublication, deletePublication,
    notes, addNote, updateNote, deleteNote,
    timeline, addTimelineItem, updateTimelineItem, deleteTimelineItem,
    contactSubmissions, deleteContactSubmission,
    contactReplies, addContactReply, updateContactReply, deleteContactReply,
    homeConfig, updateHomeConfig,
    aboutConfig, updateAboutConfig,
    contactConfig, updateContactConfig,
    footerConfig, updateFooterConfig,
    researchIndexes, setResearchIndexes,
    articleIndexes, setArticleIndexes,
    noteIndexes, setNoteIndexes,
    supabaseLoading, supabaseConnectionStatus, loadFromSupabase, pushAllDataToSupabase
  } = useData();

  // Active admin tab inside dashboard
  const [activeTab, setActiveTab] = useState<'home' | 'researches' | 'articles' | 'publications' | 'notes' | 'about' | 'contact' | 'supabase'>('researches');

  const [syncStatus, setSyncStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [copiedSql, setCopiedSql] = useState(false);

  // Custom Supabase Credentials editable via inputs
  const [dbConfig, setDbConfig] = useState(() => getSupabaseConfig());
  const [inputUrl, setInputUrl] = useState(getSupabaseConfig().url || '');
  const [inputKey, setInputKey] = useState(getSupabaseConfig().key || '');
  const [saveConfigMsg, setSaveConfigMsg] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({ type: 'idle', text: '' });

  // Confirmation state for deletes (prevents browser blocker inside sandboxed iframe)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'research' | 'article' | 'publication' | 'note' | 'timeline' | 'submission' | 'reply';
    id: string;
    title: string;
  } | null>(null);

  // Dynamic social link list buffer
  const [footerSocialLinks, setFooterSocialLinks] = useState(footerConfig.socialLinks || []);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');
  const [newPlatformIcon, setNewPlatformIcon] = useState('globe');

  // Search index states
  const [newResKeyword, setNewResKeyword] = useState('');
  const [newArtKeyword, setNewArtKeyword] = useState('');
  const [newNoteKeyword, setNewNoteKeyword] = useState('');

  const [editingResIndex, setEditingResIndex] = useState<number | null>(null);
  const [editingResValue, setEditingResValue] = useState('');

  const [editingArtIndex, setEditingArtIndex] = useState<number | null>(null);
  const [editingArtValue, setEditingArtValue] = useState('');

  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');

  // Generic Edit/Add Modal states to prevent crowded DOM
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Simulated PDF Upload States
  const [tempFile, setTempFile] = useState<{ name: string; size: string; content?: string } | null>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState<boolean>(false);

  // Contact inbox states
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  // Contact Reply States
  const [replyFormInquiryId, setReplyFormInquiryId] = useState<string | null>(null);
  const [replyRecipientEmail, setReplyRecipientEmail] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyStatus, setReplyStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editing Reply state buffers
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplySubject, setEditingReplySubject] = useState('');
  const [editingReplyMessage, setEditingReplyMessage] = useState('');

  // Forms standard buffers
  const [researchForm, setResearchForm] = useState<Omit<Research, 'id'>>({
    title: '', category: '', journal: '', year: '', summary: '', tags: [], methodology: '', findings: '', impact: '', pdfUrl: '', fullContent: '',
    abstract: '', content: '', pdf_url: ''
  });
  const [articleForm, setArticleForm] = useState<Omit<Article, 'id'>>({
    title: '', category: 'General', date: '', readTime: '5 min read', author: 'Dr. Ashwin Singh Chouhan', snippet: '', views: 0, pdfUrl: '', content: '', tags: [],
    publish_date: '', excerpt: '', pdf_url: ''
  });
  const [pubForm, setPubForm] = useState<Omit<Publication, 'id'>>({
    title: '', journal: '', year: '', abstract: '', doi: '', citationCount: 0, authors: 'Chouhan AS',
    journal_name: '', publish_date: '', doi_link: '', co_authors: 'Chouhan AS', pdf_url: '', pdfUrl: ''
  });
  const [noteForm, setNoteForm] = useState<Omit<Note, 'id'>>({
    title: '', size: '1.2 MB', type: 'PDF', description: '', content: '', pdfUrl: '', tags: [], date: '',
    publish_date: '', summary: '', pdf_url: ''
  });
  const [timelineForm, setTimelineForm] = useState<TimelineMilestone>({
    year: '', title: '', institution: '', description: '', achievementType: 'research'
  });

  // Drag over states
  const [isDragActive, setIsDragActive] = useState<'research' | 'article' | 'note' | 'publication' | null>(null);

  // Link checking states
  const [checkingUrl, setCheckingUrl] = useState<'research' | 'article' | 'note' | null>(null);
  const [checkResult, setCheckResult] = useState<{
    section: 'research' | 'article' | 'note';
    type: 'success' | 'error' | 'warning';
    message: string;
    info?: string;
  } | null>(null);

  const handleCheckLink = async (url: string, section: 'research' | 'article' | 'note') => {
    if (!url || !url.trim()) {
      alert("Please enter a link first before validating.");
      return;
    }
    setCheckingUrl(section);
    setCheckResult(null);

    try {
      const res = await fetch("/api/validate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() })
      });

      if (!res.ok) {
        throw new Error(`HTTP Error Status: ${res.status}`);
      }

      const data = await res.json();
      if (data.valid) {
        setCheckResult({
          section,
          type: data.warning ? 'warning' : 'success',
          message: data.message,
          info: data.info
        });
      } else {
        setCheckResult({
          section,
          type: 'error',
          message: data.error || "Formatting or validation error."
        });
      }
    } catch (err: any) {
      setCheckResult({
        section,
        type: 'error',
        message: err.message || "An error occurred during verification handshake."
      });
    } finally {
      setCheckingUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, section: 'research' | 'article' | 'note' | 'publication') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(section);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(null);
  };

  const handleDropFile = (e: React.DragEvent, section: 'research' | 'article' | 'note' | 'publication') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        alert("Only certified PDF format documents are supported.");
        return;
      }

      // Build mock file event
      const dummyEvent = {
        target: {
          files: e.dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleActualPdfUpload(dummyEvent, section);
    }
  };

  // Home Config state buffers
  const [homeTitle, setHomeTitle] = useState(homeConfig.title);
  const [homeSubtitle, setHomeSubtitle] = useState(homeConfig.subtitle);
  const [homeTyped, setHomeTyped] = useState(homeConfig.typedText);
  const [homeStats, setHomeStats] = useState(homeConfig.stats);

  // Footer Config state buffers
  const [footerEmail, setFooterEmail] = useState(footerConfig.email);
  const [footerTagline, setFooterTagline] = useState(footerConfig.tagline);
  const [footerCopyright, setFooterCopyright] = useState(footerConfig.copyright);
  const [footerShowYoutube, setFooterShowYoutube] = useState(footerConfig.showYoutube);
  const [footerYoutubeUrl, setFooterYoutubeUrl] = useState(footerConfig.youtubeUrl);
  const [footerShowLinkedin, setFooterShowLinkedin] = useState(footerConfig.showLinkedin);
  const [footerLinkedinUrl, setFooterLinkedinUrl] = useState(footerConfig.linkedinUrl);
  const [footerShowSlideshare, setFooterShowSlideshare] = useState(footerConfig.showSlideshare);
  const [footerSlideshareUrl, setFooterSlideshareUrl] = useState(footerConfig.slideshareUrl);
  const [footerShowEmail, setFooterShowEmail] = useState(footerConfig.showEmail);

  // About Config state buffers
  const [aboutBio1, setAboutBio1] = useState(aboutConfig.bioParagraph1);
  const [aboutBio2, setAboutBio2] = useState(aboutConfig.bioParagraph2);
  const [aboutQuote, setAboutQuote] = useState(aboutConfig.quote);
  const [aboutQuoteAuthor, setAboutQuoteAuthor] = useState(aboutConfig.quoteAuthor);

  // Contact Config state buffers
  const [contactAddress, setContactAddress] = useState(contactConfig.address);
  const [contactHours, setContactHours] = useState(contactConfig.hours);
  const [contactEmail, setContactEmail] = useState(contactConfig.email);

  // Tag helper state
  const [tagInput, setTagInput] = useState('');

  // ------------------------- HELPERS -------------------------
  const navigateToPublic = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatChange = (id: string, value: string, label: string) => {
    setHomeStats(prev => prev.map(s => s.id === id ? { ...s, value, label } : s));
  };

  const saveHomeConfig = () => {
    updateHomeConfig({
      title: homeTitle,
      subtitle: homeSubtitle,
      typedText: homeTyped,
      stats: homeStats
    });
    updateFooterConfig({
      email: footerEmail,
      tagline: footerTagline,
      copyright: footerCopyright,
      showYoutube: footerShowYoutube,
      youtubeUrl: footerYoutubeUrl,
      showLinkedin: footerShowLinkedin,
      linkedinUrl: footerLinkedinUrl,
      showSlideshare: footerShowSlideshare,
      slideshareUrl: footerSlideshareUrl,
      showEmail: footerShowEmail,
      socialLinks: footerSocialLinks
    });
    alert("Home section and Global Footer configurations updated successfully.");
  };

  const saveAboutConfig = () => {
    updateAboutConfig({
      bioParagraph1: aboutBio1,
      bioParagraph2: aboutBio2,
      quote: aboutQuote,
      quoteAuthor: aboutQuoteAuthor
    });
    alert("About Us configurations updated successfully.");
  };

  const saveContactConfig = () => {
    updateContactConfig({
      address: contactAddress,
      hours: contactHours,
      email: contactEmail
    });
    alert("Contact metadata updated successfully.");
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyRecipientEmail.trim() || !replySubject.trim() || !replyMessage.trim()) {
      setReplyStatus({ type: 'error', text: 'Please fill in all the required reply fields.' });
      return;
    }

    setIsSendingReply(true);
    setReplyStatus(null);

    try {
      const response = await fetch('/api/send-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: replyRecipientEmail.trim(),
          subject: replySubject.trim(),
          message: replyMessage.trim(),
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        // Save reply into state and local storage
        addContactReply({
          submissionId: replyFormInquiryId || 'general',
          recipientEmail: replyRecipientEmail.trim(),
          subject: replySubject.trim(),
          message: replyMessage.trim(),
          smtpUsed: resData.smtpUsed || 'Secure SMTP',
          previewUrl: resData.previewUrl || undefined,
        });

        setReplyStatus({
          type: 'success',
          text: `Reply dispatched successfully via secure SMTP transport ${resData.smtpUsed ? `(${resData.smtpUsed})` : ""}.`
        });

        if (resData.previewUrl) {
          console.log(`[SMTP Mailer Preview] ${resData.previewUrl}`);
        }

        // Reset message field
        setReplyMessage('');
        
        // Retain view momentarily so they can read confirmation, then fade out
        setTimeout(() => {
          setReplyFormInquiryId(null);
          setReplyStatus(null);
        }, 4500);
      } else {
        setReplyStatus({
          type: 'error',
          text: resData.error || 'The server-side SMTP service rejected the transfer.'
        });
      }
    } catch (err) {
      setReplyStatus({
        type: 'error',
        text: 'A connection anomaly occurred while dispatching the correspondence request.'
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  // Real PDF and Document Upload Handlers inside Add/Edit forms
  const handleActualPdfUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'research' | 'article' | 'note' | 'publication') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPdfFile(file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      
      const maxAllowedSize = 10 * 1024 * 1024; // Expanded to 10 MB limit for genuine Supabase bucket storage
      if (file.size > maxAllowedSize) {
        alert("The selected PDF file is too large (maximum size 10MB). Please select a smaller PDF.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Url = reader.result;
          if (type === 'research') {
            setResearchForm(prev => ({ ...prev, pdfUrl: base64Url, pdf_url: base64Url }));
          } else if (type === 'article') {
            setArticleForm(prev => ({ ...prev, pdfUrl: base64Url, pdf_url: base64Url }));
          } else if (type === 'note') {
            setNoteForm(prev => ({ ...prev, pdfUrl: base64Url, pdf_url: base64Url, size: sizeMB, type: 'PDF' }));
          } else if (type === 'publication') {
            setPubForm(prev => ({ ...prev, pdfUrl: base64Url, pdf_url: base64Url }));
          }
          setTempFile({
            name: file.name,
            size: sizeMB
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger modal for New Item
  const openNewItemModal = () => {
    setEditingId(null);
    setTempFile(null);
    setSelectedPdfFile(null);
    setTagInput('');
    setResearchForm({
      title: '', category: '', journal: '', year: new Date().getFullYear().toString(), summary: '', tags: [], methodology: '', findings: '', impact: '', pdfUrl: '', fullContent: '',
      abstract: '', content: '', pdf_url: ''
    });
    setArticleForm({
      title: '', category: 'General', date: new Date().toISOString().split('T')[0], readTime: '5 min read', author: 'Dr. Ashwin Singh Chouhan', snippet: '', views: 120, pdfUrl: '', content: '', tags: [],
      publish_date: new Date().toISOString().split('T')[0], excerpt: '', pdf_url: ''
    });
    setPubForm({
      title: '', journal: '', year: new Date().getFullYear().toString(), abstract: '', doi: '', citationCount: 0, authors: 'Chouhan AS',
      journal_name: '', publish_date: new Date().getFullYear().toString(), doi_link: '', co_authors: 'Chouhan AS', pdf_url: '', pdfUrl: ''
    });
    setNoteForm({
      title: '', size: '1.2 MB', type: 'PDF', description: '', content: '', pdfUrl: '', tags: [], date: new Date().toISOString().split('T')[0],
      publish_date: new Date().toISOString().split('T')[0], summary: '', pdf_url: ''
    });
    setTimelineForm({ year: new Date().getFullYear().toString(), title: '', institution: '', description: '', achievementType: 'research' });
    setShowAddModal(true);
  };

  // Trigger modal for Editing Item
  const openEditItemModal = (item: any) => {
    setEditingId(item.id || item.year); // timeline items keyed by year
    setTempFile(null);
    setSelectedPdfFile(null);
    setTagInput('');

    if (activeTab === 'researches') {
      const res = item as Research;
      setResearchForm({
        ...res,
        abstract: res.abstract || res.summary || '',
        summary: res.summary || res.abstract || '',
        content: res.content || res.fullContent || '',
        fullContent: res.fullContent || res.content || '',
        pdf_url: res.pdf_url || res.pdfUrl || '',
        pdfUrl: res.pdfUrl || res.pdf_url || ''
      });
    } else if (activeTab === 'articles') {
      const art = item as Article;
      setArticleForm({
        ...art,
        tags: art.tags || [],
        publish_date: art.publish_date || art.date || '',
        date: art.date || art.publish_date || '',
        excerpt: art.excerpt || art.snippet || '',
        snippet: art.snippet || art.excerpt || '',
        pdf_url: art.pdf_url || art.pdfUrl || '',
        pdfUrl: art.pdfUrl || art.pdf_url || ''
      });
    } else if (activeTab === 'publications') {
      const pub = item as Publication;
      setPubForm({
        ...pub,
        journal_name: pub.journal_name || pub.journal || '',
        journal: pub.journal || pub.journal_name || '',
        publish_date: pub.publish_date || pub.year || '',
        year: pub.year || pub.publish_date || '',
        co_authors: pub.co_authors || pub.authors || '',
        authors: pub.authors || pub.co_authors || '',
        doi_link: pub.doi_link || pub.doi || '',
        pdf_url: pub.pdf_url || pub.pdfUrl || '',
        pdfUrl: pub.pdfUrl || pub.pdf_url || ''
      });
    } else if (activeTab === 'notes') {
      const nt = item as Note;
      setNoteForm({
        ...nt,
        publish_date: nt.publish_date || nt.date || '',
        date: nt.date || nt.publish_date || '',
        summary: nt.summary || nt.description || '',
        description: nt.description || nt.summary || '',
        pdf_url: nt.pdf_url || nt.pdfUrl || '',
        pdfUrl: nt.pdfUrl || nt.pdf_url || ''
      });
    } else if (aboutBio1 !== undefined && activeTab === 'about') {
      const tm = item as TimelineMilestone;
      setTimelineForm({ ...tm });
    }
    setShowAddModal(true);
  };

  // Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingPdf(true);

    let documentUrl = '';
    if (selectedPdfFile) {
      try {
        const fileExt = selectedPdfFile.name.split('.').pop() || 'pdf';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { data, error } = await supabase.storage
          .from('pdfs')
          .upload(filePath, selectedPdfFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error("Supabase Storage error during upload:", error);
        } else if (data) {
          const { data: publicData } = supabase.storage
            .from('pdfs')
            .getPublicUrl(filePath);
          if (publicData?.publicUrl) {
            documentUrl = publicData.publicUrl;
            console.log("Successfully uploaded to Supabase Storage bucket. Public URL:", documentUrl);
          }
        }
      } catch (err) {
        console.error("Failed to upload to storage. Falling back to base64 encoding:", err);
      }
    }

    try {
      if (editingId) {
        // UPDATE OPERATIONS
        let res: any = { success: false };
        if (activeTab === 'researches') {
          const payload: Research = {
            ...researchForm,
            pdfUrl: documentUrl || researchForm.pdfUrl || researchForm.pdf_url || '',
            pdf_url: documentUrl || researchForm.pdf_url || researchForm.pdfUrl || '',
            abstract: researchForm.summary || researchForm.abstract,
            summary: researchForm.summary || researchForm.abstract,
            content: researchForm.fullContent || researchForm.content,
            fullContent: researchForm.fullContent || researchForm.content,
            id: editingId
          };
          res = await updateResearch(editingId, payload);
          if (res?.success) alert("Research item saved successfully.");
        } else if (activeTab === 'articles') {
          const payload: Article = {
            ...articleForm,
            pdfUrl: documentUrl || articleForm.pdfUrl || articleForm.pdf_url || '',
            pdf_url: documentUrl || articleForm.pdf_url || articleForm.pdfUrl || '',
            date: articleForm.publish_date || articleForm.date,
            publish_date: articleForm.publish_date || articleForm.date,
            excerpt: articleForm.snippet || articleForm.excerpt,
            snippet: articleForm.snippet || articleForm.excerpt,
            id: editingId
          };
          res = await updateArticle(editingId, payload);
          if (res?.success) alert("Article item saved successfully.");
        } else if (activeTab === 'publications') {
          const payload: Publication = {
            ...pubForm,
            pdfUrl: documentUrl || pubForm.pdfUrl || pubForm.pdf_url || '',
            pdf_url: documentUrl || pubForm.pdf_url || pubForm.pdfUrl || '',
            journal: pubForm.journal_name || pubForm.journal,
            journal_name: pubForm.journal_name || pubForm.journal,
            year: pubForm.publish_date || pubForm.year,
            publish_date: pubForm.publish_date || pubForm.year,
            authors: pubForm.co_authors || pubForm.authors,
            co_authors: pubForm.co_authors || pubForm.authors,
            id: editingId
          };
          res = await updatePublication(editingId, payload);
          if (res?.success) alert("Publication item saved successfully.");
        } else if (activeTab === 'notes') {
          const payload: Note = {
            ...noteForm,
            pdfUrl: documentUrl || noteForm.pdfUrl || noteForm.pdf_url || '',
            pdf_url: documentUrl || noteForm.pdf_url || noteForm.pdfUrl || '',
            date: noteForm.publish_date || noteForm.date,
            publish_date: noteForm.publish_date || noteForm.date,
            description: noteForm.summary || noteForm.description,
            summary: noteForm.summary || noteForm.description,
            id: editingId
          };
          res = await updateNote(editingId, payload);
          if (res?.success) alert("Note saved successfully.");
        } else if (activeTab === 'about') {
          res = await updateTimelineItem(editingId, timelineForm);
          if (res?.success) alert("Timeline item saved successfully.");
        }

        if (res && !res.success) {
          alert(`Failed to save details: ${res?.error || 'Operation unsuccessful'}`);
          return;
        }
      } else {
        // CREATE OPERATIONS
        let res: any = { success: false };
        if (activeTab === 'researches') {
          const payload = {
            ...researchForm,
            pdfUrl: documentUrl || researchForm.pdfUrl || researchForm.pdf_url || '',
            pdf_url: documentUrl || researchForm.pdf_url || researchForm.pdfUrl || '',
            abstract: researchForm.summary || researchForm.abstract,
            summary: researchForm.summary || researchForm.abstract,
            content: researchForm.fullContent || researchForm.content,
            fullContent: researchForm.fullContent || researchForm.content,
          };
          res = await addResearch(payload);
          if (res?.success) alert("Research item created successfully.");
        } else if (activeTab === 'articles') {
          const payload = {
            ...articleForm,
            pdfUrl: documentUrl || articleForm.pdfUrl || articleForm.pdf_url || '',
            pdf_url: documentUrl || articleForm.pdf_url || articleForm.pdfUrl || '',
            date: articleForm.publish_date || articleForm.date,
            publish_date: articleForm.publish_date || articleForm.date,
            excerpt: articleForm.snippet || articleForm.excerpt,
            snippet: articleForm.snippet || articleForm.excerpt,
          };
          res = await addArticle(payload);
          if (res?.success) alert("Article created successfully.");
        } else if (activeTab === 'publications') {
          const payload = {
            ...pubForm,
            pdfUrl: documentUrl || pubForm.pdfUrl || pubForm.pdf_url || '',
            pdf_url: documentUrl || pubForm.pdf_url || pubForm.pdfUrl || '',
            journal: pubForm.journal_name || pubForm.journal,
            journal_name: pubForm.journal_name || pubForm.journal,
            year: pubForm.publish_date || pubForm.year,
            publish_date: pubForm.publish_date || pubForm.year,
            authors: pubForm.co_authors || pubForm.authors,
            co_authors: pubForm.co_authors || pubForm.authors,
          };
          res = await addPublication(payload);
          if (res?.success) alert("Publication created successfully.");
        } else if (activeTab === 'notes') {
          const payload = {
            ...noteForm,
            pdfUrl: documentUrl || noteForm.pdfUrl || noteForm.pdf_url || '',
            pdf_url: documentUrl || noteForm.pdf_url || noteForm.pdfUrl || '',
            date: noteForm.publish_date || noteForm.date,
            publish_date: noteForm.publish_date || noteForm.date,
            description: noteForm.summary || noteForm.description,
            summary: noteForm.summary || noteForm.description,
          };
          res = await addNote(payload);
          if (res?.success) alert("Lecture Note created successfully.");
        } else if (activeTab === 'about') {
          res = await addTimelineItem(timelineForm);
          if (res?.success) alert("Timeline item saved successfully.");
        }

        if (res && !res.success) {
          alert(`Failed to save details: ${res?.error || 'Operation unsuccessful'}`);
          return;
        }
      }

      setShowAddModal(false);
      setTempFile(null);
      setSelectedPdfFile(null);
    } catch (err: any) {
      alert(`An error occurred: ${err.message || err}`);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !researchForm.tags.includes(tagInput.trim())) {
      setResearchForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setResearchForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <div className="relative text-white min-h-[95vh] pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* HEADER SECTION BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Glow lasers */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-cyan-400 to-purple-500 opacity-5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400 font-extrabold text-lg">
              Ω
            </div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-white via-cyan-200 to-pink-300 bg-clip-text text-transparent">
              SECURE ADMIN EXECUTIVE SYSTEM
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 font-mono flex items-center gap-1.5 uppercase mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Authenticated Session: SHA-Pharma Lab
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
          <button
            onClick={() => navigateToPublic('home')}
            className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 font-mono text-xs hover:text-cyan-400 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Layout className="w-3.5 h-3.5" /> Return to Site
          </button>
          
          <button
            onClick={onLogout}
            id="admin-logout-btn"
            className="px-4 py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 hover:bg-rose-900/30 font-mono text-xs text-rose-400 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Secure Logout
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Sidebar Navigation */}
        <div className="lg:col-span-3 flex flex-col gap-2.5 bg-slate-900/50 p-3.5 rounded-3xl border border-slate-800/80 shadow-xl">
          <h3 className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-wider pl-3.5 pb-2 border-b border-slate-850">
            Navigation Console
          </h3>
          {[
            { id: 'home', label: 'Home Settings', icon: Building, color: 'hover:text-pink-400 text-pink-400', border: 'hover:border-pink-500/20' },
            { id: 'researches', label: 'Researches CRUD', icon: Beaker, color: 'hover:text-cyan-300 text-cyan-300', border: 'hover:border-cyan-500/20' },
            { id: 'articles', label: 'Articles Index', icon: FileText, color: 'hover:text-emerald-300 text-emerald-300', border: 'hover:border-emerald-500/20' },
            { id: 'publications', label: 'Publications', icon: Award, color: 'hover:text-violet-400 text-violet-400', border: 'hover:border-violet-500/20' },
            { id: 'notes', label: 'Lecture Notes log', icon: Notebook, color: 'hover:text-amber-400 text-amber-400', border: 'hover:border-amber-500/20' },
            { id: 'about', label: 'About Us Biography', icon: User, color: 'hover:text-indigo-400 text-indigo-400', border: 'hover:border-indigo-500/20' },
            { id: 'contact', label: 'Inquiry Inbox', icon: Mail, color: 'hover:text-fuchsia-400 text-fuchsia-400', border: 'hover:border-fuchsia-500/20' },
            { id: 'supabase', label: 'Supabase Database', icon: Database, color: 'hover:text-emerald-400 text-emerald-400', border: 'hover:border-emerald-550/20' }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setSelectedInquiryId(null); }}
                className={`w-full px-4 py-3 text-xs font-bold flex items-center gap-3.5 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-950 border-cyan-500/30 text-cyan-300 shadow-md shadow-cyan-500/5 font-extrabold'
                    : `bg-transparent border-transparent text-slate-400 hover:bg-slate-950/50 ${item.color} ${item.border}`
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.id === 'contact' && contactSubmissions.length > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] bg-fuchsia-950 border border-fuchsia-500/35 text-fuchsia-300 animate-pulse font-extrabold">
                    {contactSubmissions.length} new
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Action panel / Data managers */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800/80 p-6 rounded-3xl shadow-2xl min-h-[500px]">
          
          {/* A. HOME CONFIGURATION CHANNEL */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div>
                  <h3 className="text-base font-extrabold text-white">Hero Section Configurations</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Tweak site typography & real-time stats metrics</p>
                </div>
                <button
                  onClick={saveHomeConfig}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-pink-500/20"
                >
                  <Check className="w-3.5 h-3.5" /> Save Site Layout
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Public Name Title</label>
                  <input
                    type="text"
                    className="bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                    value={homeTitle}
                    onChange={(e) => setHomeTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Sub-heading Specialty</label>
                  <input
                    type="text"
                    className="bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                    value={homeSubtitle}
                    onChange={(e) => setHomeSubtitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Typewritten Intro Tagline</label>
                <textarea
                  rows={2}
                  className="bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-300 resize-none"
                  value={homeTyped}
                  onChange={(e) => setHomeTyped(e.target.value)}
                />
              </div>

              <div className="border-t border-slate-850 pt-5 space-y-4">
                <h4 className="text-xs font-mono font-bold tracking-widest text-[#f43f5e] uppercase">Active Quantitative Counters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {homeStats.map((stat) => (
                    <div key={stat.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Metric Parameter ({stat.iconName})</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Value (e.g. 12+)"
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                          value={stat.value}
                          onChange={(e) => handleStatChange(stat.id, e.target.value, stat.label)}
                        />
                        <input
                          type="text"
                          placeholder="Label name"
                          className="col-span-2 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300"
                          value={stat.label}
                          onChange={(e) => handleStatChange(stat.id, stat.value, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GLOBAL FOOTER CONFIGURATIONS */}
              <div className="border-t border-slate-850 pt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-mono font-bold tracking-widest text-[#f51475] uppercase">Global Footer Configurations</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Customize tagline, copyright text, contact email, and active social profiles</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Direct Email Address</label>
                    <input
                      type="email"
                      className="bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                      placeholder="e.g. ashwinsingh26061992@gmail.com"
                      value={footerEmail}
                      onChange={(e) => setFooterEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Copyright Notice Info</label>
                    <input
                      type="text"
                      className="bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                      value={footerCopyright}
                      onChange={(e) => setFooterCopyright(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Footer Tagline/Bio (empty to remove/hide)</label>
                  <textarea
                    rows={2}
                    className="bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-300 resize-none"
                    placeholder="Brief bio or academic tagline..."
                    value={footerTagline}
                    onChange={(e) => setFooterTagline(e.target.value)}
                  />
                </div>

                {/* SOCIAL MEDIA CONNECTIONS & TOGGLES */}
                <div className="border-t border-slate-850/60 pt-4 space-y-3.5">
                  <h5 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">Social Platforms & Dynamic Links</h5>
                  
                  <div className="grid grid-cols-1 gap-4">
                    
                    {/* LinkedIn */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="show-linkedin"
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer"
                          checked={footerShowLinkedin}
                          onChange={(e) => setFooterShowLinkedin(e.target.checked)}
                        />
                        <label htmlFor="show-linkedin" className="text-xs font-bold text-slate-200 cursor-pointer">LinkedIn Connection</label>
                      </div>
                      <input
                        type="text"
                        className="bg-slate-900 border border-slate-850 focus:border-pink-500 rounded-xl px-3 py-1.5 text-xs text-slate-300 w-full sm:max-w-md"
                        placeholder="LinkedIn Profile Link"
                        disabled={!footerShowLinkedin}
                        value={footerLinkedinUrl}
                        onChange={(e) => setFooterLinkedinUrl(e.target.value)}
                      />
                    </div>

                    {/* YouTube */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="show-youtube"
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer"
                          checked={footerShowYoutube}
                          onChange={(e) => setFooterShowYoutube(e.target.checked)}
                        />
                        <label htmlFor="show-youtube" className="text-xs font-bold text-slate-200 cursor-pointer">YouTube Connection</label>
                      </div>
                      <input
                        type="text"
                        className="bg-slate-900 border border-slate-850 focus:border-pink-500 rounded-xl px-3 py-1.5 text-xs text-slate-300 w-full sm:max-w-md"
                        placeholder="YouTube Channel Link"
                        disabled={!footerShowYoutube}
                        value={footerYoutubeUrl}
                        onChange={(e) => setFooterYoutubeUrl(e.target.value)}
                      />
                    </div>

                    {/* SlideShare */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="show-slideshare"
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer"
                          checked={footerShowSlideshare}
                          onChange={(e) => setFooterShowSlideshare(e.target.checked)}
                        />
                        <label htmlFor="show-slideshare" className="text-xs font-bold text-slate-200 cursor-pointer">SlideShare Connection</label>
                      </div>
                      <input
                        type="text"
                        className="bg-slate-900 border border-slate-850 focus:border-pink-500 rounded-xl px-3 py-1.5 text-xs text-slate-300 w-full sm:max-w-md"
                        placeholder="SlideShare Documents Link"
                        disabled={!footerShowSlideshare}
                        value={footerSlideshareUrl}
                        onChange={(e) => setFooterSlideshareUrl(e.target.value)}
                      />
                    </div>

                    {/* Email icon toggle */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="show-footer-email"
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer"
                        checked={footerShowEmail}
                        onChange={(e) => setFooterShowEmail(e.target.checked)}
                      />
                      <label htmlFor="show-footer-email" className="text-xs font-bold text-slate-200 cursor-pointer">Show Direct Mail Contact icon in social toolbar</label>
                    </div>

                    {/* DYNAMIC LINKS EDITOR */}
                    <div className="border-t border-slate-850 pt-5 mt-4 space-y-4">
                      <div>
                        <h6 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest">Dynamic Social Platforms List</h6>
                        <p className="text-[10px] text-slate-400 font-mono">Configure custom platforms, link addresses and select dynamic glow icons</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {footerSocialLinks.map((link, idx) => (
                          <div key={link.id || idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-mono text-slate-500 uppercase">Platform Name</label>
                                <input
                                  type="text"
                                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:border-pink-500"
                                  value={link.platform}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFooterSocialLinks(prev => prev.map((item, i) => i === idx ? { ...item, platform: val } : item));
                                  }}
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-mono text-slate-500 uppercase">Icon Type</label>
                                <select
                                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 cursor-pointer focus:border-pink-500"
                                  value={link.iconType}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFooterSocialLinks(prev => prev.map((item, i) => i === idx ? { ...item, iconType: val } : item));
                                  }}
                                >
                                  <option value="linkedin">LinkedIn Icon</option>
                                  <option value="youtube">YouTube Icon</option>
                                  <option value="slideshare">SlideShare Icon</option>
                                  <option value="email">Email Icon</option>
                                  <option value="twitter">Twitter Icon</option>
                                  <option value="github">GitHub Icon</option>
                                  <option value="facebook">Facebook Icon</option>
                                  <option value="globe">Globe Icon</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-mono text-slate-500 uppercase">Profile URL</label>
                                <input
                                  type="text"
                                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:border-pink-500"
                                  value={link.url}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFooterSocialLinks(prev => prev.map((item, i) => i === idx ? { ...item, url: val } : item));
                                  }}
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFooterSocialLinks(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="px-3 py-1 bg-red-950/40 hover:bg-red-950 text-red-400 hover:text-red-300 border border-red-900/40 rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer mt-2 md:mt-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        ))}

                        {/* Add New Panel Row */}
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-dashed border-slate-800 space-y-3.5 mt-2">
                          <h6 className="text-[10px] font-mono text-pink-500 uppercase tracking-widest font-extrabold">+ ADD NEW SOCIAL CONNECTION</h6>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-mono text-slate-500 uppercase">Platform Title</label>
                              <input
                                type="text"
                                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-pink-500"
                                placeholder="e.g. GitHub"
                                value={newPlatformName}
                                onChange={(e) => setNewPlatformName(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-mono text-slate-500 uppercase">Icon Type</label>
                              <select
                                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-200 cursor-pointer focus:border-pink-500"
                                value={newPlatformIcon}
                                onChange={(e) => setNewPlatformIcon(e.target.value)}
                              >
                                <option value="linkedin">LinkedIn</option>
                                <option value="youtube">YouTube</option>
                                <option value="slideshare">SlideShare</option>
                                <option value="email">Email</option>
                                <option value="twitter">Twitter</option>
                                <option value="github">GitHub</option>
                                <option value="facebook">Facebook</option>
                                <option value="globe">Globe/Website</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-mono text-slate-500 uppercase">Target Address Link</label>
                              <input
                                type="text"
                                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-pink-500"
                                placeholder="e.g. github.com/username"
                                value={newPlatformUrl}
                                onChange={(e) => setNewPlatformUrl(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!newPlatformName.trim() || !newPlatformUrl.trim()) {
                                  alert("Please fill in the Platform Title and Profile URL fields.");
                                  return;
                                }
                                const newLink = {
                                  id: `s-${Date.now()}`,
                                  platform: newPlatformName.trim(),
                                  url: newPlatformUrl.trim(),
                                  iconType: newPlatformIcon
                                };
                                setFooterSocialLinks(prev => [...prev, newLink]);
                                setNewPlatformName('');
                                setNewPlatformUrl('');
                              }}
                              className="px-4 py-1.5 bg-pink-700/60 hover:bg-pink-600 text-white font-mono text-[11px] font-bold rounded-xl transition-all shadow shadow-pink-500/10 cursor-pointer"
                            >
                              Add Social Link
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* B. RESEARCHES MANAGERS */}
          {activeTab === 'researches' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div>
                  <h3 className="text-base font-extrabold text-white">Preclinical Research Studies</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Manage scientific files, methodologies, and biochemical docks</p>
                </div>
                <button
                  onClick={openNewItemModal}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-cyan-500/20 animate-pulse"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload Study Work
                </button>
              </div>

              {/* RESEARCH INDEX KEYWORDS MANAGER */}
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4 shadow-lg">
                <div className="border-b border-slate-850 pb-2.5">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">Search Bar Index Editor</h4>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">Add, Edit or Remove research index filters visible on the public research page search bar</p>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {(researchIndexes || []).map((keyword, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
                      {editingResIndex === idx ? (
                        <input
                          type="text"
                          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-1 py-0.5 rounded focus:outline-none w-24"
                          value={editingResValue}
                          onChange={(e) => setEditingResValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (!editingResValue.trim()) return;
                              setResearchIndexes(prev => prev.map((k, kIdx) => kIdx === idx ? editingResValue.trim() : k));
                              setEditingResIndex(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className="text-xs font-mono text-slate-300">{keyword}</span>
                      )}
                      
                      <div className="flex items-center gap-1 ml-1.5 border-l border-slate-800 pl-1.5">
                        {editingResIndex === idx ? (
                          <button
                            onClick={() => {
                              if (!editingResValue.trim()) return;
                              setResearchIndexes(prev => prev.map((k, kIdx) => kIdx === idx ? editingResValue.trim() : k));
                              setEditingResIndex(null);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingResIndex(idx);
                              setEditingResValue(keyword);
                            }}
                            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                        
                        {keyword.toLowerCase() !== 'all' && (
                          <button
                            onClick={() => {
                              setResearchIndexes(prev => prev.filter((_, kIdx) => kIdx !== idx));
                            }}
                            className="text-red-500/70 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-xs text-slate-300 flex-1 focus:outline-none"
                    placeholder="New search keyword index..."
                    value={newResKeyword}
                    onChange={(e) => setNewResKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (!newResKeyword.trim()) return;
                        if ((researchIndexes || []).includes(newResKeyword.trim())) {
                          alert("This keyword already exists.");
                          return;
                        }
                        setResearchIndexes(prev => [...prev, newResKeyword.trim()]);
                        setNewResKeyword('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newResKeyword.trim()) return;
                      if ((researchIndexes || []).includes(newResKeyword.trim())) {
                        alert("This keyword already exists.");
                        return;
                      }
                      setResearchIndexes(prev => [...prev, newResKeyword.trim()]);
                      setNewResKeyword('');
                    }}
                    className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Add Index
                  </button>
                </div>
              </div>

              {/* Research Records Grid list */}
              <div className="flex flex-col gap-3.5">
                {researches.map((res) => (
                  <div key={res.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-start justify-between gap-4 hover:border-cyan-500/30 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/10">
                          {res.category}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">{res.year} • {res.journal}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white hover:text-cyan-300 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 font-mono leading-relaxed max-w-[550px]">
                        {res.summary}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {res.tags.map((t, i) => (
                          <span key={i} className="text-[9px] font-mono text-slate-500">#{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEditItemModal(res)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 cursor-pointer"
                        title="Edit Study Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'research', id: res.id, title: res.title })}
                        className="p-1.5 rounded-lg bg-red-950/20 border border-red-900/10 text-rose-500 hover:bg-rose-950/40 cursor-pointer"
                        title="Remove Study Work"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. ARTICLES MANAGERS */}
          {activeTab === 'articles' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div>
                  <h3 className="text-base font-extrabold text-white">Public Press & Library Articles</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Publish articles, scientific reviews, or pharmacology guides</p>
                </div>
                <button
                  onClick={openNewItemModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Write Article
                </button>
              </div>

              {/* ARTICLES INDEX KEYWORDS MANAGER */}
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4 shadow-lg">
                <div className="border-b border-slate-850 pb-2.5">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981]">Search Bar Index Editor</h4>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">Add, Edit or Remove article index filters visible on the public articles archive search bar</p>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {(articleIndexes || []).map((keyword, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
                      {editingArtIndex === idx ? (
                        <input
                          type="text"
                          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-1 py-0.5 rounded focus:outline-none w-24"
                          value={editingArtValue}
                          onChange={(e) => setEditingArtValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (!editingArtValue.trim()) return;
                              setArticleIndexes(prev => prev.map((k, kIdx) => kIdx === idx ? editingArtValue.trim() : k));
                              setEditingArtIndex(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className="text-xs font-mono text-slate-300">{keyword}</span>
                      )}
                      
                      <div className="flex items-center gap-1 ml-1.5 border-l border-slate-800 pl-1.5">
                        {editingArtIndex === idx ? (
                          <button
                            onClick={() => {
                              if (!editingArtValue.trim()) return;
                              setArticleIndexes(prev => prev.map((k, kIdx) => kIdx === idx ? editingArtValue.trim() : k));
                              setEditingArtIndex(null);
                            }}
                            className="text-emerald-400 hover:text-emerald-350 transition-colors cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingArtIndex(idx);
                              setEditingArtValue(keyword);
                            }}
                            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                        
                        {keyword.toLowerCase() !== 'all' && (
                          <button
                            onClick={() => {
                              setArticleIndexes(prev => prev.filter((_, kIdx) => kIdx !== idx));
                            }}
                            className="text-red-500/70 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    className="bg-slate-950 border border-slate-800 focus:border-[#10b981] rounded-xl px-3 py-1.5 text-xs text-slate-300 flex-1 focus:outline-none"
                    placeholder="New articles search keyword..."
                    value={newArtKeyword}
                    onChange={(e) => setNewArtKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (!newArtKeyword.trim()) return;
                        if ((articleIndexes || []).includes(newArtKeyword.trim())) {
                          alert("This keyword already exists.");
                          return;
                        }
                        setArticleIndexes(prev => [...prev, newArtKeyword.trim()]);
                        setNewArtKeyword('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newArtKeyword.trim()) return;
                      if ((articleIndexes || []).includes(newArtKeyword.trim())) {
                        alert("This keyword already exists.");
                        return;
                      }
                      setArticleIndexes(prev => [...prev, newArtKeyword.trim()]);
                      setNewArtKeyword('');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-750 hover:bg-emerald-600 text-white font-mono text-xs rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Add Index
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 max-h-[600px] overflow-y-auto pr-1">
                {articles.map((art) => (
                  <div key={art.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-start justify-between gap-4 hover:border-emerald-500/30 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/10">
                          {art.category}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">{art.date} • {art.readTime} • {art.views} views</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white">
                        {art.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-mono">
                        {art.snippet}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEditItemModal(art)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'article', id: art.id, title: art.title })}
                        className="p-1.5 rounded-lg bg-red-950/20 border border-red-900/10 text-rose-500 hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* D. PUBLICATIONS MANAGERS */}
          {activeTab === 'publications' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div>
                  <h3 className="text-base font-extrabold text-white">Academic Formal Publications</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Control indexing of DOI references & peer studies</p>
                </div>
                <button
                  onClick={openNewItemModal}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-violet-500/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Publication
                </button>
              </div>

              <div className="flex flex-col gap-3.5">
                {publications.map((pub) => (
                  <div key={pub.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-start justify-between gap-4 hover:border-violet-500/30 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono text-violet-400 font-extrabold">{pub.journal} ({pub.year})</span>
                        <span className="text-[9px] font-mono text-slate-500">DOI: {pub.doi} • Citations: {pub.citationCount}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white">
                        {pub.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-mono">
                        Authors: {pub.authors}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEditItemModal(pub)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-violet-400 hover:border-violet-500/30 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'publication', id: pub.id, title: pub.title })}
                        className="p-1.5 rounded-lg bg-red-950/20 border border-red-900/10 text-rose-500 hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* E. LECTURE NOTES MANAGERS */}
          {activeTab === 'notes' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div>
                  <h3 className="text-base font-extrabold text-white">Lecture Notes & Course Syllabi</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Store lecture slides, equations guides, and student worksheets</p>
                </div>
                <button
                  onClick={openNewItemModal}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Push Study Lecture
                </button>
              </div>

              {/* NOTES INDEX KEYWORDS MANAGER */}
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4 shadow-lg">
                <div className="border-b border-slate-850 pb-2.5">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f59e0b]">Search Bar Index Editor</h4>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">Add, Edit or Remove note index filters visible on the student syllabi & lecture notes portal</p>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {(noteIndexes || []).map((keyword, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
                      {editingNoteIndex === idx ? (
                        <input
                          type="text"
                          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-1 py-0.5 rounded focus:outline-none w-24"
                          value={editingNoteValue}
                          onChange={(e) => setEditingNoteValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (!editingNoteValue.trim()) return;
                              setNoteIndexes(prev => prev.map((k, kIdx) => kIdx === idx ? editingNoteValue.trim() : k));
                              setEditingNoteIndex(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className="text-xs font-mono text-slate-300">{keyword}</span>
                      )}
                      
                      <div className="flex items-center gap-1 ml-1.5 border-l border-slate-800 pl-1.5">
                        {editingNoteIndex === idx ? (
                          <button
                            onClick={() => {
                              if (!editingNoteValue.trim()) return;
                              setNoteIndexes(prev => prev.map((k, kIdx) => kIdx === idx ? editingNoteValue.trim() : k));
                              setEditingNoteIndex(null);
                            }}
                            className="text-amber-400 hover:text-amber-350 transition-colors cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingNoteIndex(idx);
                              setEditingNoteValue(keyword);
                            }}
                            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                        
                        {keyword.toLowerCase() !== 'all' && (
                          <button
                            onClick={() => {
                              setNoteIndexes(prev => prev.filter((_, kIdx) => kIdx !== idx));
                            }}
                            className="text-red-500/70 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    className="bg-slate-950 border border-slate-800 focus:border-[#f59e0b] rounded-xl px-3 py-1.5 text-xs text-slate-300 flex-1 focus:outline-none"
                    placeholder="New notes search keyword index..."
                    value={newNoteKeyword}
                    onChange={(e) => setNewNoteKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (!newNoteKeyword.trim()) return;
                        if ((noteIndexes || []).includes(newNoteKeyword.trim())) {
                          alert("This keyword already exists.");
                          return;
                        }
                        setNoteIndexes(prev => [...prev, newNoteKeyword.trim()]);
                        setNewNoteKeyword('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newNoteKeyword.trim()) return;
                      if ((noteIndexes || []).includes(newNoteKeyword.trim())) {
                        alert("This keyword already exists.");
                        return;
                      }
                      setNoteIndexes(prev => [...prev, newNoteKeyword.trim()]);
                      setNewNoteKeyword('');
                    }}
                    className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-600 text-white font-mono text-xs rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Add Index
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
                {notes.map((note) => (
                  <div key={note.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-start justify-between gap-4 hover:border-amber-500/30 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-950 text-amber-500 border border-amber-500/10">
                          {note.type}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">Size: {note.size}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white">
                        {note.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-mono">
                        {note.description}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEditItemModal(note)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'note', id: note.id, title: note.title })}
                        className="p-1.5 rounded-lg bg-red-950/20 border border-red-900/10 text-rose-500 hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* F. ABOUT US BIOGRAPHY TIMELINE */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div>
                  <h3 className="text-base font-extrabold text-white">Biography & Timeline Roadmap</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Revise professional biography paras and academic landmark events</p>
                </div>
                <button
                  onClick={saveAboutConfig}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-indigo-500/20"
                >
                  <Check className="w-3.5 h-3.5" /> Update Bio Content
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Executive Bio Paragraph A</label>
                  <textarea
                    rows={3}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-300 resize-none leading-relaxed"
                    value={aboutBio1}
                    onChange={(e) => setAboutBio1(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Executive Bio Paragraph B</label>
                  <textarea
                    rows={3}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-300 resize-none leading-relaxed"
                    value={aboutBio2}
                    onChange={(e) => setAboutBio2(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Signature Advising Quote</label>
                    <input
                      type="text"
                      className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                      value={aboutQuote}
                      onChange={(e) => setAboutQuote(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Quote Attribution Signature</label>
                    <input
                      type="text"
                      className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                      value={aboutQuoteAuthor}
                      onChange={(e) => setAboutQuoteAuthor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Timeline Management section inside About Us */}
              <div className="border-t border-slate-850 pt-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono font-bold tracking-widest text-[#6366f1] uppercase">Chronological Landmark Roadmap</h4>
                  <button
                    onClick={openNewItemModal}
                    className="px-3.5 py-1.5 bg-slate-950 border border-[#6366f1]/30 hover:border-indigo-500 hover:text-indigo-300 text-xs text-indigo-400 font-mono font-extrabold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Append Landmark Year
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {timeline.map((mile) => (
                    <div key={mile.year} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 hover:border-indigo-500/20 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono font-bold text-xs text-indigo-400">{mile.year} • {mile.achievementType.toUpperCase()}</span>
                          <span className="text-[9px] font-mono text-slate-500 truncate max-w-[120px]">{mile.institution}</span>
                        </div>
                        <h5 className="text-[11px] font-extrabold text-white truncate">{mile.title}</h5>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal">{mile.description}</p>
                      </div>

                      <div className="flex gap-2 justify-end mt-3 border-t border-slate-900 pt-2">
                        <button
                          onClick={() => openEditItemModal(mile)}
                          className="px-2 py-1 text-[10px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/20 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" /> Edit Node
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'timeline', id: mile.year, title: `${mile.year} - ${mile.title}` })}
                          className="px-2 py-1 text-[10px] font-mono rounded bg-red-950/20 text-rose-400 hover:bg-rose-950/30 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Drop
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* G. CONTACT INBOX & CONFIG */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Inbox metadata save */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div>
                  <h3 className="text-base font-extrabold text-white">Inquiry Communications Inbox</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Control direct address metadata & monitor public incoming records</p>
                </div>
                <button
                  onClick={saveContactConfig}
                  className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-fuchsia-500/20"
                >
                  <Check className="w-3.5 h-3.5" /> Update Mailing Info
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Mailing Address Details</label>
                  <input
                    type="text"
                    className="bg-slate-950 border border-slate-800 focus:border-fuchsia-500 rounded-xl px-4 py-2 text-xs text-slate-300"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Public Contact Email</label>
                  <input
                    type="text"
                    className="bg-slate-950 border border-slate-800 focus:border-fuchsia-500 rounded-xl px-4 py-2 text-xs text-slate-300"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Inquiry Submissions Buffer */}
              <div className="border-t border-slate-850 pt-5 space-y-4">
                <h4 className="text-xs font-mono font-bold tracking-widest text-[#f51475] uppercase">
                  Incoming Preclinical Inquiries Buffer ({contactSubmissions.length})
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Inquiry Row Index */}
                  <div className="lg:col-span-5 flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {contactSubmissions.map((sub) => {
                      const isOpened = selectedInquiryId === sub.id;
                      return (
                        <div
                          key={sub.id}
                          onClick={() => setSelectedInquiryId(sub.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative flex flex-col gap-0.5 ${
                            isOpened
                              ? 'bg-slate-950 border-fuchsia-550/40 shadow shadow-fuchsia-500/10'
                              : 'bg-slate-950/40 border-slate-900 hover:bg-slate-950/65'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-white truncate max-w-[130px]">{sub.name}</span>
                            <span className="text-[9px] font-mono text-slate-500">{sub.date.split(' ')[0]}</span>
                          </div>
                          <span className="text-[9px] font-mono text-[#f51475] truncate">{sub.email}</span>
                          <p className="text-[10px] text-slate-400 truncate mt-1 leading-normal font-mono">{sub.message}</p>
                        </div>
                      );
                    })}

                    {contactSubmissions.length === 0 && (
                      <div className="py-12 border border-slate-850 border-dashed rounded-xl text-center font-mono text-slate-550 text-xs">
                        No submissions logged in local communications buffer.
                      </div>
                    )}
                  </div>

                  {/* Inquiry Detail Monitor View */}
                  <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-850 p-4.5 min-h-[300px] flex flex-col justify-between overflow-hidden relative">
                    {selectedInquiryId ? (() => {
                      const inquiry = contactSubmissions.find(s => s.id === selectedInquiryId);
                      if (!inquiry) return null;

                      const hasFormOpened = replyFormInquiryId === inquiry.id;

                      if (hasFormOpened) {
                        return (
                          <motion.form 
                            onSubmit={handleSendReply}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="space-y-3.5 flex flex-col justify-between h-full w-full"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                <div>
                                  <h5 className="font-extrabold text-xs text-white">Secure Outbox Pipeline</h5>
                                  <p className="text-[9px] text-[#f51475] font-mono uppercase mt-0.5">Send response securely over SMTP</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setReplyFormInquiryId(null)}
                                  className="text-slate-500 hover:text-slate-350 transition-colors p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {replyStatus && (
                                <div className={`p-2.5 rounded-lg border text-[10px] font-mono leading-relaxed flex items-start gap-1.5 ${
                                  replyStatus.type === 'success' 
                                    ? 'bg-emerald-950/25 border-emerald-900/30 text-emerald-400 shadow-sm shadow-emerald-500/5' 
                                    : 'bg-rose-950/25 border-rose-900/30 text-rose-400 shadow-sm shadow-rose-500/5'
                                }`}>
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>{replyStatus.text}</span>
                                </div>
                              )}

                              <div className="space-y-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-mono text-slate-500 uppercase">To: Recipient Address</label>
                                  <input
                                    type="email"
                                    readOnly
                                    disabled
                                    className="bg-slate-950/40 border border-slate-900 rounded-lg px-3 py-1.5 text-[10px] text-slate-500 font-mono cursor-not-allowed select-all"
                                    value={replyRecipientEmail}
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-mono text-slate-400 font-bold uppercase">Subject Header</label>
                                  <input
                                    type="text"
                                    required
                                    className="bg-slate-950 border border-slate-850 focus:border-cyan-550 focus:outline-none transition-colors rounded-lg px-3 py-1.5 text-[10px] text-slate-200 font-mono"
                                    placeholder="Discussion topic..."
                                    value={replySubject}
                                    onChange={(e) => setReplySubject(e.target.value)}
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-mono text-slate-400 font-bold uppercase">Feedback Message Body</label>
                                  <textarea
                                    required
                                    rows={5}
                                    className="bg-slate-950 border border-slate-850 focus:border-cyan-550 focus:outline-none transition-colors rounded-lg px-3 py-2 text-[10px] text-slate-200 font-mono leading-relaxed resize-none"
                                    placeholder="Enter response message details..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-900 pt-3 mt-2">
                              <button
                                type="button"
                                onClick={() => setReplyFormInquiryId(null)}
                                className="px-3 py-1.5 rounded border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-900 font-mono text-[9px] cursor-pointer transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSendingReply}
                                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 hover:shadow-cyan-500/20 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono font-bold text-[9px] flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10 transition-all"
                              >
                                {isSendingReply ? (
                                  <>
                                    <span className="w-2.5 h-2.5 rounded-full border border-t-white border-r-transparent animate-spin mr-0.5" />
                                    Transmitting...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3" />
                                    Send Reply
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.form>
                        );
                      }

                      return (
                        <>
                          <div className="space-y-4">
                            <div className="border-b border-slate-900 pb-2.5 flex justify-between items-start">
                              <div>
                                <h5 className="font-extrabold text-xs text-white">{inquiry.name}</h5>
                                <span className="font-mono text-[9px] text-[#f51475] select-all">{inquiry.email}</span>
                              </div>
                              <span className="font-mono text-[9px] text-slate-500">{inquiry.date}</span>
                            </div>

                            <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3.5 min-h-[120px] max-h-[200px] overflow-y-auto leading-relaxed text-slate-350 text-xs font-mono">
                              {inquiry.message}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-t border-slate-900 pt-3 mt-4 gap-3">
                            <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Validated Transmission
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setReplyFormInquiryId(inquiry.id);
                                  setReplyRecipientEmail(inquiry.email);
                                  setReplySubject(`Re: [Dr. Ashwin Singh Chouhan Research] Preclinical Inquiry feedback`);
                                  setReplyMessage(`Dear ${inquiry.name},\n\nThank you for reaching out regarding your inquiry:\n"${inquiry.message}"\n\nI have evaluated your request and...\n\nSincerely,\nDr. Ashwin Singh Chouhan`);
                                  setReplyStatus(null);
                                }}
                                className="px-3 py-1.5 rounded bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-850 text-cyan-400 hover:text-cyan-300 font-mono text-[10px] flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" /> Reply to Inquiry
                              </button>

                              <button
                                onClick={() => setDeleteConfirm({ type: 'submission', id: inquiry.id, title: `Inquiry from ${inquiry.name} (${inquiry.email})` })}
                                className="px-3 py-1.5 rounded bg-red-950/20 hover:bg-rose-950/40 border border-red-900/10 text-rose-500 hover:text-rose-400 font-mono text-[10px] flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Discard Record
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })() : (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-550 border border-slate-900 rounded-xl">
                        <Mail className="w-8 h-8 text-slate-700 animate-bounce mb-2" />
                        <span className="text-[11px] font-mono">Select an incoming inquiry from the index list panel to inspect the transmission details.</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Direct Correspondence Log (Reply History) */}
              <div className="border-t border-slate-850 pt-6 mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono font-bold tracking-widest text-[#06b6d4] uppercase">
                    Dispatched Mail Correspondence History ({contactReplies.length})
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500 uppercase bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
                    Audit Log Secure Ledger
                  </span>
                </div>

                <div className="bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden p-5 space-y-4">
                  {contactReplies.map((rep) => {
                    const isEditing = editingReplyId === rep.id;
                    return (
                      <motion.div
                        key={rep.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-slate-850 bg-slate-900/45 rounded-xl space-y-3 relative text-left"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs text-slate-400 font-mono border-b border-slate-900 pb-2">
                              <span>Modifying Dispatch ID: <b className="text-cyan-400">{rep.id}</b></span>
                              <span className="text-[10px] text-slate-500">To: {rep.recipientEmail}</span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-mono text-slate-400 font-bold uppercase">Subject Line</label>
                                <input
                                  type="text"
                                  className="bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                                  value={editingReplySubject}
                                  onChange={(e) => setEditingReplySubject(e.target.value)}
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-mono text-slate-400 font-bold uppercase">Feedback Body</label>
                                <textarea
                                  rows={4}
                                  className="bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200 font-mono leading-relaxed"
                                  value={editingReplyMessage}
                                  onChange={(e) => setEditingReplyMessage(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => setEditingReplyId(null)}
                                className="px-3 py-1 font-mono text-[9px] text-slate-400 hover:text-white border border-slate-800 rounded transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  if (!editingReplySubject.trim() || !editingReplyMessage.trim()) {
                                    alert("Fields cannot be empty.");
                                    return;
                                  }
                                  updateContactReply(rep.id, {
                                    ...rep,
                                    subject: editingReplySubject,
                                    message: editingReplyMessage,
                                  });
                                  setEditingReplyId(null);
                                }}
                                className="px-3 py-1 font-mono text-[9px] bg-emerald-600 hover:bg-emerald-500 rounded text-white flex items-center gap-1 transition-all"
                              >
                                <Check className="w-3 h-3" /> Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Static View */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-955 pb-2 gap-2">
                              <div>
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Recipient Match</span>
                                <span className="text-white text-xs font-bold font-mono">{rep.recipientEmail}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="text-[9px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">{rep.date}</span>
                                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/20 px-2.5 py-0.5 rounded border border-cyan-900/40">
                                  {rep.smtpUsed || 'Secure SMTP Engine'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-[#f51475] uppercase tracking-wider block font-bold">Subject</span>
                              <h5 className="text-white text-xs font-bold leading-normal font-mono select-all">{rep.subject}</h5>
                            </div>

                            <div className="space-y-1 mt-2">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Message Copy</span>
                              <div className="bg-slate-950/50 rounded-lg p-3 text-[10px] leading-relaxed font-mono border border-slate-950/80 text-slate-350 max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                                {rep.message}
                              </div>
                            </div>

                            <div className="flex justify-end items-center gap-2.5 border-t border-slate-900/40 pt-2.5 mt-2.5">
                              {rep.previewUrl && (
                                <a
                                  href={rep.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mr-auto text-[9px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> View Sandbox Email
                                </a>
                              )}
                              
                              <button
                                onClick={() => {
                                  setEditingReplyId(rep.id);
                                  setEditingReplySubject(rep.subject);
                                  setEditingReplyMessage(rep.message);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-750 text-slate-300 font-mono text-[9px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Edit className="w-3 h-3" /> Rewrite Log
                              </button>

                              <button
                                onClick={() => setDeleteConfirm({ type: 'reply', id: rep.id, title: `Reply Subject: ${rep.subject}` })}
                                className="px-2.5 py-1 rounded bg-rose-950/25 hover:bg-rose-950/50 border border-rose-900/10 text-rose-400 font-mono text-[9px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Delete History
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}

                  {contactReplies.length === 0 && (
                    <div className="text-center py-10 text-slate-500 font-mono text-xs border border-dashed border-slate-850 rounded-xl">
                      No dispatched correspondence logs stored in database history ledger.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-6 animate-fadeIn text-slate-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-slate-800 gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    Supabase Live Integration Hub
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                    Orchestrate and sync user pages, research logs, and bios directly with PostgreSQL
                  </p>
                </div>
                
                <div className="flex gap-2.5">
                  <button
                    onClick={async () => {
                      setSyncStatus({ type: 'idle', message: '' });
                      await loadFromSupabase();
                    }}
                    disabled={supabaseLoading}
                    className="px-3.5 py-2 hover:bg-slate-800 border border-slate-800 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-950 text-slate-400 hover:text-slate-200"
                  >
                    <Check className="w-3.5 h-3.5" /> Re-check Status
                  </button>

                  <button
                    onClick={async () => {
                      setSyncStatus({ type: 'idle', message: '' });
                      const result = await pushAllDataToSupabase();
                      if (result.success) {
                        setSyncStatus({ type: 'success', message: result.message });
                      } else {
                        setSyncStatus({ type: 'error', message: result.message });
                      }
                    }}
                    disabled={supabaseLoading}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-650 to-teal-750 hover:from-emerald-500 hover:to-teal-600 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Push All Local Data
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-4.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                <div className="flex items-start gap-3">
                  <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 ${supabaseConnectionStatus.connected ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-yellow-500 shadow-lg shadow-yellow-500/50'} animate-pulse`} />
                  <div>
                    <h4 className="text-xs font-bold font-mono text-white">
                      Status: {supabaseConnectionStatus.connected ? 'LIVE CONNECTION ACTIVE' : 'LOCAL CACHE FALLBACK MODE'}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-xl">
                      {supabaseConnectionStatus.connected 
                        ? `Your app is actively synchronized with your remote database at: ${dbConfig.activeUrl}`
                        : 'Remote schema is not initialized or tables are missing. The app is falling back to Local Storage to prevent disruptions.'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 truncate max-w-xs animate-fadeIn">
                  {dbConfig.isCustom ? 'Configured Custom DB' : 'Using Demo Sandbox DB'}
                </div>
              </div>

              {/* DATABASE CONNECTION FORM */}
              <div className="bg-slate-950/45 border border-slate-800/80 rounded-2xl p-5 text-left space-y-4">
                <div>
                  <h4 className="text-xs font-bold font-mono text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    CONNECT TO YOUR OWN SUPABASE DATABASE (ADD YOUR OWN DATABASE)
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    If you pasted the SQL code in your own Supabase project, you must save your <strong>Project URL</strong> and <strong>Anon Key</strong> below. Once saved, the website will load and save data directly to your personal database.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-slate-300 font-bold uppercase">Supabase Project URL</label>
                      <span className="text-[8px] font-mono text-slate-500">From Settings &gt; API</span>
                    </div>
                    <input
                      type="text"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:border-purple-500 focus:outline-none"
                      placeholder="https://your-project-id.supabase.co"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-slate-300 font-bold uppercase">Project Anon / Public API Key</label>
                      <span className="text-[8px] font-mono text-slate-500">From Settings &gt; API</span>
                    </div>
                    <input
                      type="password"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:border-purple-500 focus:outline-none"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-4">
                  <div>
                    {saveConfigMsg.type !== 'idle' && (
                      <span className={`text-[10px] font-mono ${saveConfigMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {saveConfigMsg.text}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2.5 w-full sm:w-auto justify-end">
                    {dbConfig.isCustom && (
                      <button
                        onClick={async () => {
                          updateSupabaseConfig('', '');
                          const original = getSupabaseConfig();
                          setDbConfig(original);
                          setInputUrl('');
                          setInputKey('');
                          setSaveConfigMsg({ type: 'success', text: 'Reset to standard sandbox database successfully.' });
                          await loadFromSupabase();
                          setTimeout(() => {
                            setSaveConfigMsg({ type: 'idle', text: '' });
                          }, 3000);
                        }}
                        type="button"
                        className="px-3.5 py-2 block hover:bg-rose-950/20 text-rose-455 border border-rose-950/50 rounded-xl font-mono text-xs font-bold cursor-pointer transition-colors"
                      >
                        Reset to Sandbox
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (!inputUrl.trim() || !inputKey.trim()) {
                          setSaveConfigMsg({ type: 'error', text: 'Please fill both the URL and Key.' });
                          return;
                        }
                        if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
                          setSaveConfigMsg({ type: 'error', text: 'Invalid URL. Must start with http:// or https://' });
                          return;
                        }
                        
                        updateSupabaseConfig(inputUrl, inputKey);
                        const validated = getSupabaseConfig();
                        setDbConfig(validated);
                        setSaveConfigMsg({ type: 'success', text: 'Credentials saved! Re-testing tables...' });
                        
                        // fresh sync trigger
                        await loadFromSupabase();
                        
                        setTimeout(() => {
                          setSaveConfigMsg({ type: 'idle', text: '' });
                        }, 5000);
                      }}
                      type="button"
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-500/10"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Credentials & Connect
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid of Tables */}
              <div className="text-left">
                <h4 className="text-[11px] font-mono text-slate-400 font-bold uppercase mb-3">Database table verification</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(supabaseConnectionStatus.tables).map(([table, status]) => (
                    <div key={table} className="bg-slate-950/50 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] text-slate-400 truncate">{table}</p>
                        <p className={`font-mono text-[9px] uppercase font-bold mt-1 ${status === 'connected' ? 'text-emerald-400' : 'text-amber-500'}`}>
                          {status}
                        </p>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-400' : 'bg-yellow-500'}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync Results Toast */}
              {syncStatus.type !== 'idle' && (
                <div className={`p-4 rounded-xl border flex items-start gap-2.5 font-mono text-xs text-left ${
                  syncStatus.type === 'success' 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-950/20 border-red-500/30 text-red-400'
                }`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{syncStatus.type === 'success' ? 'SUCCESS: ' : 'SYNC FAULT: '}</span>
                    {syncStatus.message}
                  </div>
                </div>
              )}

              {/* Instructions and SQL copy */}
              <div className="space-y-4 pt-2 text-left">
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                  <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-mono text-[10px] font-bold text-slate-300 uppercase">Interactive SQL Booster Schema</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(RECOMMENDED_SQL);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 2000);
                      }}
                      className="px-2.5 py-1 text-[10px] font-mono bg-slate-950 text-slate-400 hover:text-white rounded border border-slate-800 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className={`w-3 h-3 ${copiedSql ? 'text-emerald-400' : ''}`} />
                      {copiedSql ? 'Copied script!' : 'Copy SQL Script'}
                    </button>
                  </div>
                  <div className="p-4 bg-slate-950">
                    <p className="text-[10px] text-slate-400 mb-3 font-sans leading-relaxed">
                      To construct your tables and enable automatic queries, execute the SQL script below within your <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">Supabase Dashboard SQL Editor</a>. After executing, click <strong>Push All Local Data</strong> above to fully seed/sync your data.
                    </p>
                    <pre className="h-[250px] overflow-y-auto text-[9px] text-slate-500 font-mono leading-normal p-4 bg-slate-900 border border-slate-850 rounded-lg whitespace-pre select-all text-left">
                      {RECOMMENDED_SQL}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>

      {/* ----------------- H REUSABLE POPUP EDIT/ADD MODAL (NEON CHANNELS) ----------------- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4.5 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {editingId ? "Revise Existing Content Core" : "Upload & Create New Record Unit"}
                  </h3>
                  <p className="text-[9px] text-cyan-400 font-mono tracking-wider uppercase mt-0.5">
                    SECTION PORT: {activeTab.toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form viewport wrapper */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* 1. RESEARCHES FORM FIELDS */}
                {activeTab === 'researches' && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Study Title</label>
                      <input
                        type="text" required
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        placeholder="Study work title..."
                        value={researchForm.title}
                        onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })}
                      />
                    </div>

                    {/* ENHANCED TAGS INPUT WITH CHIPS */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Molecules & Compounds Tags</label>
                      <TagInput
                        tags={researchForm.tags || []}
                        onChange={(tags) => setResearchForm({ ...researchForm, tags })}
                        placeholder="Type standard tags and separate using commas..."
                        accentColor="cyan"
                      />
                    </div>

                    {/* SHORT SUMMARY / DESCRIPTION */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Study Abstract / Description (Short Summary)</label>
                      <textarea
                        rows={2} required
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white resize-y placeholder-slate-700 focus:border-cyan-500 focus:outline-none"
                        placeholder="Provide a concise one-to-two sentence abstract..."
                        value={researchForm.summary}
                        onChange={(e) => setResearchForm({ ...researchForm, summary: e.target.value })}
                      />
                    </div>

                    {/* ADVANCED DRAG & DROP PDF DECK & EXTERNAL LINK PASTE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Drag & Drop zone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5 text-cyan-400">
                          <UploadCloud className="w-3.5 h-3.5" /> Direct PDF Document Upload
                        </label>
                        <div
                          onDragOver={(e) => handleDragOver(e, 'research')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDropFile(e, 'research')}
                          onClick={() => document.getElementById('research-file-input-id')?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all h-[110px] ${
                            isDragActive === 'research'
                              ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-950/60'
                          }`}
                        >
                          <UploadCloud className={`w-6 h-6 ${isDragActive === 'research' ? 'text-cyan-400 animate-bounce' : 'text-slate-500'}`} />
                          <span className="text-[10px] font-mono text-slate-300">
                            {researchForm.pdfUrl && researchForm.pdfUrl.startsWith('data:') 
                              ? "✓ Direct PDF Loaded" 
                              : (tempFile ? tempFile.name : "Drag & Drop PDF here, or click")}
                          </span>
                          <span className="text-[8px] text-slate-500">Max size 2.5 MB</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleActualPdfUpload(e, 'research')}
                            className="hidden"
                            id="research-file-input-id"
                          />
                        </div>
                      </div>

                      {/* External URL validation zone */}
                      <div className="flex flex-col gap-1.5 bg-slate-950/30 p-4 rounded-xl border border-slate-850/60 justify-between">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1 text-cyan-400">
                            Or Paste External Document Link
                          </label>
                          <div className="flex gap-2.5 mt-1">
                            <input
                              type="url"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-755 focus:border-cyan-500 focus:outline-none"
                              placeholder="https://drive.google.com/file/d/... or Dropbox link..."
                              value={researchForm.pdfUrl && !researchForm.pdfUrl.startsWith('data:') ? researchForm.pdfUrl : ''}
                              onChange={(e) => setResearchForm({ ...researchForm, pdfUrl: e.target.value })}
                            />
                            <button
                              type="button"
                              disabled={checkingUrl === 'research'}
                              onClick={() => handleCheckLink(researchForm.pdfUrl || '', 'research')}
                              className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500 text-cyan-400 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 min-w-[100px] cursor-pointer"
                            >
                              {checkingUrl === 'research' ? (
                                <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                              ) : "Check Link"}
                            </button>
                          </div>
                        </div>

                        {checkResult && checkResult.section === 'research' && (
                          <div className={`p-2 rounded-lg border text-[9px] font-mono leading-tight mt-1 flex items-start gap-1.5 ${
                            checkResult.type === 'success'
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                              : checkResult.type === 'warning'
                              ? 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                              : 'bg-rose-950/20 border-rose-500/20 text-rose-450'
                          }`}>
                            <div className="flex-1">
                              <p className="font-extrabold uppercase tracking-widest text-[8px] mb-0.5">
                                {checkResult.type === 'success' ? '✓ Link Verified' : checkResult.type === 'warning' ? '⚠ Warning' : '❌ Unreachable'}
                              </p>
                              <p className="text-slate-300">{checkResult.message}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RICH TEXT EDITOR (FULL CONTENT) */}
                    <div className="flex flex-col gap-1.5">
                      <RichTextEditor
                        value={researchForm.fullContent || ''}
                        onChange={(val) => setResearchForm({ ...researchForm, fullContent: val })}
                        label="Academic Article / Full Content (Rich Text)"
                        placeholder="Compile research papers, methodology, and scientific publication details..."
                      />
                    </div>
                  </div>
                )}
                  {/* 2. ARTICLES FORM FIELDS */}
                {activeTab === 'articles' && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Title</label>
                      <input
                        type="text" required
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-705 focus:border-emerald-500 focus:outline-none"
                        placeholder="Article title..."
                        value={articleForm.title}
                        onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* CATEGORY DROPDOWN OR CUSTOM INPUT */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Category</label>
                        <select
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                          value={["General", "Clinical Pharmacology", "Oncology", "Phytochemistry", "Molecular Nanotech", "Therapeutics", "Herbal Medicine"].includes(articleForm.category) ? articleForm.category : "Custom"}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== "Custom") {
                              setArticleForm({ ...articleForm, category: val });
                            }
                          }}
                        >
                          <option value="General">General Science</option>
                          <option value="Clinical Pharmacology">Clinical Pharmacology</option>
                          <option value="Oncology">Oncology & Cancer Assays</option>
                          <option value="Phytochemistry">Phytochemistry & Botanical Bioactives</option>
                          <option value="Molecular Nanotech">Molecular Nanotech Systems</option>
                          <option value="Therapeutics">Therapeutics & Drug Delivery</option>
                          <option value="Herbal Medicine">Herbal Medicine Applications</option>
                          <option value="Custom">-- Custom Category (Input below) --</option>
                        </select>
                        
                        {/* Custom Category Input if selected Custom or if value matches none of preset lists */}
                        {(!["General", "Clinical Pharmacology", "Oncology", "Phytochemistry", "Molecular Nanotech", "Therapeutics", "Herbal Medicine"].includes(articleForm.category)) && (
                          <input
                            type="text" required
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white mt-1.5 focus:border-emerald-500 placeholder-slate-700 focus:outline-none"
                            placeholder="Enter custom category name..."
                            value={articleForm.category}
                            onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                          />
                        )}
                      </div>

                      {/* DATE PICKER */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Publication Date</label>
                        <input
                          type="date" required
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                          value={articleForm.date ? (articleForm.date.includes(',') || isNaN(Date.parse(articleForm.date)) ? new Date().toISOString().split('T')[0] : new Date(articleForm.date).toISOString().split('T')[0]) : ''}
                          onChange={(e) => {
                            setArticleForm({ ...articleForm, date: e.target.value });
                          }}
                        />
                      </div>
                    </div>

                    {/* EXCERPT FORM FIELD */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Excerpt</label>
                      <textarea
                        rows={2} required
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white resize-y placeholder-slate-700 focus:border-emerald-500 focus:outline-none"
                        placeholder="Short overview about chemical findings..."
                        value={articleForm.snippet}
                        onChange={(e) => setArticleForm({ ...articleForm, snippet: e.target.value })}
                      />
                    </div>

                    {/* TAGS FORM FIELD WITH CHIPS */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Indexed Tags</label>
                      <TagInput
                        tags={articleForm.tags || []}
                        onChange={(tags) => setArticleForm({ ...articleForm, tags })}
                        placeholder="Type article tags and separate using commas..."
                        accentColor="emerald"
                      />
                    </div>

                    {/* CONTENT COMPILER - RICH TEXT EDITOR */}
                    <div className="flex flex-col gap-1.5">
                      <RichTextEditor
                        value={articleForm.content || ''}
                        onChange={(val) => setArticleForm({ ...articleForm, content: val })}
                        label="Full Content"
                        placeholder="Draft the article paragraphs here, using rich format tags..."
                      />
                    </div>

                    {/* DRAG AND DROP PDF ZONE & EXTERNAL URL LINK */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Drag & Drop zone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5 text-emerald-400">
                          <UploadCloud className="w-3.5 h-3.5" /> PDF upload (drag and drop or via link)
                        </label>
                        <div
                          onDragOver={(e) => handleDragOver(e, 'article')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDropFile(e, 'article')}
                          onClick={() => document.getElementById('article-file-input-id')?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all h-[110px] ${
                            isDragActive === 'article'
                              ? 'border-emerald-400 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-950/60'
                          }`}
                        >
                          <UploadCloud className={`w-6 h-6 ${isDragActive === 'article' ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
                          <span className="text-[10px] font-mono text-slate-300">
                            {articleForm.pdfUrl && articleForm.pdfUrl.startsWith('data:') 
                              ? "✓ Direct PDF Loaded" 
                              : (tempFile ? tempFile.name : "Drag & Drop PDF, or click")}
                          </span>
                          <span className="text-[8px] text-slate-500">Max size 2.5 MB</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleActualPdfUpload(e, 'article')}
                            className="hidden"
                            id="article-file-input-id"
                          />
                        </div>
                      </div>

                      {/* EXTERNAL URL LINK & CHECK CONNECTION */}
                      <div className="flex flex-col gap-1.5 bg-slate-950/30 p-4 rounded-xl border border-slate-850/60 justify-between">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1 text-emerald-400">
                            Or Paste External URL Link
                          </label>
                          <div className="flex gap-2.5 mt-1">
                            <input
                              type="url"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-755 focus:border-emerald-500 focus:outline-none"
                              placeholder="https://drive.google.com/file/d/... or Dropbox url..."
                              value={articleForm.pdfUrl && !articleForm.pdfUrl.startsWith('data:') ? articleForm.pdfUrl : ''}
                              onChange={(e) => setArticleForm({ ...articleForm, pdfUrl: e.target.value })}
                            />
                            <button
                              type="button"
                              disabled={checkingUrl === 'article'}
                              onClick={() => handleCheckLink(articleForm.pdfUrl || '', 'article')}
                              className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-emerald-500 text-emerald-400 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 min-w-[100px] cursor-pointer"
                            >
                              {checkingUrl === 'article' ? (
                                <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                              ) : "Check Link"}
                            </button>
                          </div>
                        </div>

                        {checkResult && checkResult.section === 'article' && (
                          <div className={`p-2 rounded-lg border text-[9px] font-mono leading-tight mt-1 flex items-start gap-1.5 ${
                            checkResult.type === 'success'
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                              : checkResult.type === 'warning'
                              ? 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                              : 'bg-rose-950/20 border-rose-500/20 text-rose-450'
                          }`}>
                            <div className="flex-1">
                              <p className="font-extrabold uppercase tracking-widest text-[8px] mb-0.5">
                                {checkResult.type === 'success' ? '✓ Link Verified' : checkResult.type === 'warning' ? '⚠ Warning' : '❌ Unreachable'}
                              </p>
                              <p className="text-slate-300">{checkResult.message}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PUBLICATIONS FORM FIELDS */}
                {activeTab === 'publications' && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Academic Journal Study Title</label>
                      <input
                        type="text" required
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Structure study title..."
                        value={pubForm.title}
                        onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Indexed Journal Name</label>
                        <input
                          type="text" required
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                          placeholder="e.g. Journal of Ethnopharmacology"
                          value={pubForm.journal}
                          onChange={(e) => setPubForm({ ...pubForm, journal: e.target.value, journal_name: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Date / Year of publication</label>
                        <input
                          type="text" required
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                          placeholder="e.g. June 2025"
                          value={pubForm.year}
                          onChange={(e) => setPubForm({ ...pubForm, year: e.target.value, publish_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">DOI Registry Number (Optional)</label>
                        <input
                          type="text"
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                          placeholder="e.g. 10.1016/j.jep.2025.118942"
                          value={pubForm.doi}
                          onChange={(e) => setPubForm({ ...pubForm, doi: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">DOI Absolute URL Link (Optional)</label>
                        <input
                          type="url"
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                          placeholder="https://doi.org/10.1016/j.jep.2025.118942"
                          value={pubForm.doi_link || ''}
                          onChange={(e) => setPubForm({ ...pubForm, doi_link: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Citation Count</label>
                        <input
                          type="number" required
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.8 text-xs text-white"
                          value={pubForm.citationCount}
                          onChange={(e) => setPubForm({ ...pubForm, citationCount: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Co-Authors Signature</label>
                      <input
                        type="text" required
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                        placeholder="Chouhan AS, Saini M, etc."
                        value={pubForm.authors}
                        onChange={(e) => setPubForm({ ...pubForm, authors: e.target.value, co_authors: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Study Abstract Summary</label>
                      <textarea
                        rows={3} required
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white resize-none"
                        value={pubForm.abstract}
                        onChange={(e) => setPubForm({ ...pubForm, abstract: e.target.value })}
                      />
                    </div>

                    {/* DRAG AND DROP PDF ZONE & EXTERNAL URL LINK FOR PUBLICATIONS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Drag & Drop zone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5 text-purple-400">
                          <UploadCloud className="w-3.5 h-3.5" /> Optional PDF upload (drag and drop or via link)
                        </label>
                        <div
                          onDragOver={(e) => handleDragOver(e, 'publication')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDropFile(e, 'publication')}
                          onClick={() => document.getElementById('publication-file-input-id')?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all h-[110px] ${
                            isDragActive === 'publication'
                              ? 'border-purple-400 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-950/60'
                          }`}
                        >
                          <UploadCloud className={`w-6 h-6 ${isDragActive === 'publication' ? 'text-purple-400 animate-bounce' : 'text-slate-500'}`} />
                          <span className="text-[10px] font-mono text-slate-300">
                            {pubForm.pdfUrl && pubForm.pdfUrl.startsWith('data:') 
                              ? "✓ Optional PDF Loaded" 
                              : (tempFile ? tempFile.name : "Drag & Drop PDF, or click")}
                          </span>
                          <span className="text-[8px] text-slate-500">Max size 10 MB</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleActualPdfUpload(e, 'publication')}
                            className="hidden"
                            id="publication-file-input-id"
                          />
                        </div>
                      </div>

                      {/* EXTERNAL URL LINK & CHECK CONNECTION */}
                      <div className="flex flex-col gap-1.5 bg-slate-950/30 p-4 rounded-xl border border-slate-850/60 justify-between">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1 text-purple-400">
                            Or Paste External PDF URL Link
                          </label>
                          <div className="flex gap-2.5 mt-1">
                            <input
                              type="url"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-755 focus:border-purple-500 focus:outline-none"
                              placeholder="https://drive.google.com/file/d/... or Dropbox url..."
                              value={pubForm.pdfUrl && !pubForm.pdfUrl.startsWith('data:') ? pubForm.pdfUrl : ''}
                              onChange={(e) => setPubForm({ ...pubForm, pdfUrl: e.target.value, pdf_url: e.target.value })}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (pubForm.pdfUrl) {
                                  handleCheckLink(pubForm.pdfUrl, 'note');
                                } else {
                                  alert("Please paste a valid URL first.");
                                }
                              }}
                              className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-purple-500 text-purple-400 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 min-w-[100px] cursor-pointer"
                            >
                              Check Link
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. NOTES FORM FIELDS */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Lecture Title Focus</label>
                        <input
                          type="text" required
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-705 focus:border-cyan-500 focus:outline-none"
                          placeholder="Lecture focus title..."
                          value={noteForm.title}
                          onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                        />
                      </div>

                      {/* DATE PICKER */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Chronological Date</label>
                        <input
                          type="date" required
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-550 focus:outline-none cursor-pointer focus:border-cyan-500"
                          value={noteForm.date ? (noteForm.date.includes(',') || isNaN(Date.parse(noteForm.date)) ? new Date().toISOString().split('T')[0] : new Date(noteForm.date).toISOString().split('T')[0]) : ''}
                          onChange={(e) => {
                            setNoteForm({ ...noteForm, date: e.target.value });
                          }}
                        />
                      </div>
                    </div>

                    {/* ENHANCED TAGS INPUT WITH CHIPS */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Compound Tags</label>
                      <TagInput
                        tags={noteForm.tags || []}
                        onChange={(tags) => setNoteForm({ ...noteForm, tags })}
                        placeholder="Type course/lecture tags and separate using commas..."
                        accentColor="amber"
                      />
                    </div>

                    {/* SHORT EXCERPT */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Brief description (Short Excerpt Summary)</label>
                      <input
                        type="text" required
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:border-cyan-500 focus:outline-none"
                        placeholder="Hand-compiled slides summary..."
                        value={noteForm.description}
                        onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                      />
                    </div>

                    {/* DRAG & DROP ZONE & EXTERNAL URL Paste */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5 text-cyan-400">
                          <UploadCloud className="w-3.5 h-3.5" /> Direct Handout PDF Upload
                        </label>
                        <div
                          onDragOver={(e) => handleDragOver(e, 'note')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDropFile(e, 'note')}
                          onClick={() => document.getElementById('note-file-input-id')?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all h-[110px] ${
                            isDragActive === 'note'
                              ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-950/60'
                          }`}
                        >
                          <UploadCloud className={`w-6 h-6 ${isDragActive === 'note' ? 'text-cyan-400 animate-bounce' : 'text-slate-500'}`} />
                          <span className="text-[10px] font-mono text-slate-300">
                            {noteForm.pdfUrl && noteForm.pdfUrl.startsWith('data:') 
                              ? "✓ Direct PDF Loaded" 
                              : (tempFile ? tempFile.name : "Drag & Drop PDF here, or click")}
                          </span>
                          <span className="text-[8px] text-slate-500">Max size 2.5 MB</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleActualPdfUpload(e, 'note')}
                            className="hidden"
                            id="note-file-input-id"
                          />
                        </div>
                      </div>

                      {/* EXTERNAL WEB LINKS */}
                      <div className="flex flex-col gap-1.5 bg-slate-950/30 p-4 rounded-xl border border-slate-850/60 justify-between">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1 text-cyan-400">
                            Or Paste External Slide Deck URL Link
                          </label>
                          <div className="flex gap-2.5 mt-1">
                            <input
                              type="url"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-755 focus:border-cyan-500 focus:outline-none"
                              placeholder="https://drive.google.com/file/d/... or Dropbox url..."
                              value={noteForm.pdfUrl && !noteForm.pdfUrl.startsWith('data:') ? noteForm.pdfUrl : ''}
                              onChange={(e) => setNoteForm({ ...noteForm, pdfUrl: e.target.value })}
                            />
                            <button
                              type="button"
                              disabled={checkingUrl === 'note'}
                              onClick={() => handleCheckLink(noteForm.pdfUrl || '', 'note')}
                              className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500 text-cyan-400 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 min-w-[100px] cursor-pointer"
                            >
                              {checkingUrl === 'note' ? (
                                <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                              ) : "Check Link"}
                            </button>
                          </div>
                        </div>

                        {checkResult && checkResult.section === 'note' && (
                          <div className={`p-2 rounded-lg border text-[9px] font-mono leading-tight mt-1 flex items-start gap-1.5 ${
                            checkResult.type === 'success'
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                              : checkResult.type === 'warning'
                              ? 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                              : 'bg-rose-950/20 border-rose-500/20 text-rose-450'
                          }`}>
                            <div className="flex-1">
                              <p className="font-extrabold uppercase tracking-widest text-[8px] mb-0.5">
                                {checkResult.type === 'success' ? '✓ Link Verified' : checkResult.type === 'warning' ? '⚠ Warning' : '❌ Unreachable'}
                              </p>
                              <p className="text-slate-300">{checkResult.message}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CONTENT COMPILER - RICH TEXT EDITOR */}
                    <div className="flex flex-col gap-1.5">
                      <RichTextEditor
                        value={noteForm.content || ''}
                        onChange={(val) => setNoteForm({ ...noteForm, content: val })}
                        label="Lecture Handbook Outline (Markdown supported Rich Editor)"
                        placeholder="Construct a structured outline of formulas, lecture chapters, references, & course notes..."
                      />
                    </div>
                  </div>
                )}

                {/* 5. ROADMAP TIMELINE NODE FIELDS */}
                {activeTab === 'about' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Node Calendar Year</label>
                        <input
                          type="text" required disabled={editingId !== null}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white disabled:opacity-50"
                          placeholder="e.g. 2026"
                          value={timelineForm.year}
                          onChange={(e) => setTimelineForm({ ...timelineForm, year: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Landmark Node type</label>
                        <select
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white h-[42px]"
                          value={timelineForm.achievementType}
                          onChange={(e) => setTimelineForm({ ...timelineForm, achievementType: e.target.value as any })}
                        >
                          <option value="research">Research Landmark</option>
                          <option value="education">Academic Certification</option>
                          <option value="award">Distinguished Award</option>
                          <option value="publication">Academic Publication</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Milestone Heading</label>
                        <input
                          type="text" required
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                          value={timelineForm.title}
                          onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Institution Name</label>
                        <input
                          type="text" required
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                          value={timelineForm.institution}
                          onChange={(e) => setTimelineForm({ ...timelineForm, institution: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Narrative Description</label>
                      <textarea
                        rows={3} required
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white resize-none"
                        value={timelineForm.description}
                        onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Submit footer inside Modal */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-mono text-xs font-bold text-white shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    {editingId ? "Apply Modifications" : "Deploy Content"}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic In-App Confirmation Dialog for Delete Actions */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Outer light glow */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/10 blur-2xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-red-500/10 blur-2xl rounded-full pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-500/10">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Confirm Delete Operation</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    You are attempting to delete the following record from your secure portfolio database:
                  </p>
                  <p className="text-xs font-semibold bg-slate-950/60 border border-slate-800/50 p-2.5 rounded-xl text-rose-300 font-mono mt-2 break-all whitespace-pre-wrap">
                    {deleteConfirm.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">
                    Entity type: {deleteConfirm.type.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Actions panel */}
              <div className="flex gap-3 justify-end items-center mt-6 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950 font-mono text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const { type, id } = deleteConfirm;
                    if (type === 'research') {
                      deleteResearch(id);
                    } else if (type === 'article') {
                      deleteArticle(id);
                    } else if (type === 'publication') {
                      deletePublication(id);
                    } else if (type === 'note') {
                      deleteNote(id);
                    } else if (type === 'timeline') {
                      deleteTimelineItem(id);
                    } else if (type === 'submission') {
                      deleteContactSubmission(id);
                    } else if (type === 'reply') {
                      deleteContactReply(id);
                    }
                    setDeleteConfirm(null);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-650 to-rose-700 hover:from-red-500 hover:to-rose-600 font-mono text-xs font-bold text-white rounded-xl shadow-lg shadow-red-500/10 cursor-pointer transition-all"
                >
                  Confirm Delete & Drop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

const RECOMMENDED_SQL = `-- SAFE & GUARANTEED SQL SETUP SCHEME FOR DR. ASHWIN SINGH CHOUHAN SUPABASE DATABASE
-- This script is customized to avoid "must be owner of table objects" (42501) ownership errors and handles pre-existing tables safely.
-- Copy and run this ENTIRE script inside your Supabase SQL Editor.

-- =========================================================================
-- STEP A: ESTABLISH AND PREPARE ALL TABLES (SAFE, NON-DESTRUCTIVE OF RELATIONSHIPS)
-- =========================================================================

-- 1. Create tables if they do not yet exist
CREATE TABLE IF NOT EXISTS site_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS researches (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS publications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS timeline (
    year TEXT PRIMARY KEY,
    title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_replies (
    id TEXT PRIMARY KEY
);

-- =========================================================================
-- STEP B: ENSURE ALL PRECISE COLUMNS AND DATA FIELDS COEXIST SYSTEMATICALLY
-- =========================================================================

-- 1. Researches columns check
ALTER TABLE researches ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS journal TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS year TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS abstract TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS tags JSONB;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS methodology TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS findings TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS impact TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS "fullContent" TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE researches ADD COLUMN IF NOT EXISTS "pdf_url" TEXT;

-- 2. Articles columns check
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS publish_date TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "readTime" TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS snippet TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS "pdf_url" TEXT;

-- 3. Publications columns check
ALTER TABLE publications ADD COLUMN IF NOT EXISTS journal TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS journal_name TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS year TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS publish_date TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS abstract TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS doi TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS doi_link TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS "citationCount" INTEGER DEFAULT 0;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS authors TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS co_authors TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS "pdf_url" TEXT;

-- 4. Notes columns check
ALTER TABLE notes ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS "isUserUploaded" BOOLEAN DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS "pdf_url" TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags JSONB;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS publish_date TEXT;

-- 5. Timeline columns check
ALTER TABLE timeline ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE timeline ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE timeline ADD COLUMN IF NOT EXISTS "achievementType" TEXT;

-- 6. Contact Submissions columns check
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS date TEXT;

-- 7. Contact Replies columns check
ALTER TABLE contact_replies ADD COLUMN IF NOT EXISTS "submissionId" TEXT;
ALTER TABLE contact_replies ADD COLUMN IF NOT EXISTS "recipientEmail" TEXT;
ALTER TABLE contact_replies ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE contact_replies ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE contact_replies ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE contact_replies ADD COLUMN IF NOT EXISTS "smtpUsed" TEXT;
ALTER TABLE contact_replies ADD COLUMN IF NOT EXISTS "previewUrl" TEXT;


-- =========================================================================
-- STEP C: PURGE EXISTING DATA TO ALLOW SYSTEMATIC RE-POPULATION WITHOUT KEY CONFLICTS
-- =========================================================================
DELETE FROM site_configs;
DELETE FROM researches;
DELETE FROM articles;
DELETE FROM publications;
DELETE FROM notes;
DELETE FROM timeline;
DELETE FROM contact_submissions;
DELETE FROM contact_replies;


-- =========================================================================
-- STEP C: POPULATE REAL AND PRECISIONAL DATA ROWS
-- =========================================================================

-- 1. Insert Home, About, Contact & Footer Configurations
INSERT INTO site_configs (key, value) VALUES
('homeConfig', '{"title": "Dr. Ashwin Singh Chouhan", "subtitle": "Pharmacologist & Researcher", "typedText": "Pioneering therapeutic mechanisms, drug targeting systems, and novel bioactive formulations.", "stats": [{"id": "stat-1", "value": "12+", "label": "Years in Pharma Research", "iconName": "Beaker"}, {"id": "stat-2", "value": "60+", "label": "Research Articles", "iconName": "FileText"}, {"id": "stat-3", "value": "1200+", "label": "Academic Citations", "iconName": "Award"}, {"id": "stat-4", "value": "10+", "label": "Registered Patent Notebooks", "iconName": "HeartPulse"}]}'::jsonb),
('aboutConfig', '{"bioParagraph1": "Dr. Ashwin Singh Chouhan is a celebrated clinical specialist, researcher and academician in pharmacology. Over a career spanning more than 12 years, Dr. Chouhan has specialized in evaluating the molecular mechanisms of targeted chemical substances and phytomedicinal co-formulations.", "bioParagraph2": "His doctoral research at Central Science University pioneered the synthesis of biotin-conjugated PLGA nanoparticles designed to deliver oncology medicines selectively into receptor tissue. Dr. Chouhan''s labs consistently focus on solving core bioavailability and clearance problems for native botanical extracts—bringing traditional remedies securely to standardized corporate trials.", "quote": "We must validate therapeutic molecules using clean preclinical evidence. Translating biochemistry with mathematical modeling is how we discover the next generation of safe, effective treatments.", "quoteAuthor": "Dr. Ashwin Singh Chouhan, Principal Advisor"}'::jsonb),
('contactConfig', '{"address": "Molecular Pharmacology & Nanotech Facility, Faculty of Pharmaceutical Research, State University.", "hours": "(Mon-Fri : 11:00AM to 2:00PM)", "email": "ashwinsingh26061992@gmail.com"}'::jsonb),
('footerConfig', '{"email": "ashwinsingh26061992@gmail.com", "tagline": "Pioneering robust molecular formulations, pharmacological mechanisms, and preclinical evaluations to build safer therapeutics and empower the next generation of academic discovery.", "copyright": "Copyright © 2026 Dr. Ashwin Singh Chouhan | All Rights Reserved.", "showYoutube": true, "youtubeUrl": "https://www.youtube.com/@ashwinsinghchouhan5221", "showLinkedin": true, "linkedinUrl": "https://linkedin.com/in/ashwin-singh-chouhan-abba34161", "showSlideshare": true, "slideshareUrl": "https://www.slideshare.net/AshwinsinghChouhan?tab=documents", "showEmail": true, "socialLinks": [{"id": "s-1", "platform": "LinkedIn", "url": "https://linkedin.com/in/ashwin-singh-chouhan-abba34161", "iconType": "linkedin"}, {"id": "s-2", "platform": "YouTube", "url": "https://www.youtube.com/@ashwinsinghchouhan5221", "iconType": "youtube"}, {"id": "s-3", "platform": "SlideShare", "url": "https://www.slideshare.net/AshwinsinghChouhan?tab=documents", "iconType": "slideshare"}, {"id": "s-4", "platform": "Email", "url": "mailto:ashwinsingh26061992@gmail.com", "iconType": "email"}]}'::jsonb),
('researchIndexes', '["All", "Herbal Medicine", "Nanotechnology", "Cardiology", "Chemistry", "Gastroenterology"]'::jsonb),
('articleIndexes', '["All", "Toxicology", "Molecular Pharmacology", "Clinical Studies", "Herbal Medicine", "Drug Discovery", "Neuropharmacology", "Pharmacokinetics"]'::jsonb),
('noteIndexes', '["All", "PDF", "TXT", "Syllabus", "Pharma", "Toxicology"]'::jsonb);

-- 2. Insert Research Achievements
INSERT INTO researches (id, title, category, journal, year, summary, abstract, tags, methodology, findings, impact, "fullContent", "content", "pdfUrl", "pdf_url") VALUES
('res-1', 'Novel Herbal Formulation for Pain Relief: Synergistic Effects of Curcumin and Boswellic Acids', 'Herbal Medicine & Inflammation', 'Phytomedicine Reports', '2025', 'Investigation into the molecular pathways of co-formulating Curcuma longa and Boswellia serrata. This study uncovers synergism in the down-regulation of inflammatory markers THF-alpha and IL-1 beta.', 'Investigation into the molecular pathways of co-formulating Curcuma longa and Boswellia serrata. This study uncovers synergism in the down-regulation of inflammatory markers THF-alpha and IL-1 beta.', '["Analgesic", "Co-formulation", "Curcumin", "Synergism"]'::jsonb, 'In vivo testing on Wistar rats utilizing the hot plate and carrageenan-induced paw edema assays. Molecular docking to map binding affinities to the COX-2 enzyme.', 'The combined formulation exhibited a 58% increase in pain tolerance compared to monotherapy. Downregulation of inflammatory enzymes was verified via western blot analysis.', 'Provides a scientific foundation for formulating non-addictive, plant-derived analgesic options to reduce reliance on NSAIDs with gastrointestinal side-effects.', '', '', '', ''),
('res-2', 'Targeted Drug Delivery Systems in Oncology: Nanoparticle-Mediated Chemotherapy', 'Nanotechnology & Cancer', 'International Oncology Delivery', '2025', 'Designing PLGA-PEG nanoparticles conjugated with folic acid to optimize cytotoxic drug delivery directly to folate-receptor-overexpressing ovarian cancer cells.', 'Designing PLGA-PEG nanoparticles conjugated with folic acid to optimize cytotoxic drug delivery directly to folate-receptor-overexpressing ovarian cancer cells.', '["Nanotechnology", "Folic Acid", "PLGA-PEG", "Chemotherapy"]'::jsonb, 'Synthesis of polymer nanoparticles via single-emulsion solvent evaporation. Cell viability assays (MTT) conducted on MCF-7 and HeLa cells with confocal laser imaging.', 'Achieved double the cytocompatibility in healthy cells while increasing cancer-cell apoptosis by 40% due to enhanced intracellular drug accumulation via receptor-mediated endocytosis.', 'Enhances localized concentration of highly toxic chemotherapy drugs, mitigating severe systemic side effects common in cancer patients.', '', '', '', ''),
('res-3', 'Cardioprotective Agents of Plant Origin: Evaluating Mitochondrial Shielding Mechanisms', 'Cardiology & Natural Products', 'Cardiovascular Phytotherapy', '2024', 'Evaluation of the compound Astragaloside IV in countering oxidative stress-induced apoptosis in cardiac muscle during ischemia-reperfusion injury models.', 'Evaluation of the compound Astragaloside IV in countering oxidative stress-induced apoptosis in cardiac muscle during ischemia-reperfusion injury models.', '["Mitochondria", "Oxidative Stress", "Cardioprotection", "Astragaloside IV"]'::jsonb, 'Isolated rat heart studies (Langendorff preparation). Determination of mitochondrial membrane potential using JC-1 dye and quantification of ATP production rate.', 'Pre-treatment with Astragaloside IV preserved mitochondrial crest structure and decreased lactate dehydrogenase (LDH) leakage by 35% during reperfusion.', 'Identifies a critical molecular target for clinical pre-cardiac event treatment and surgical pre-conditioning methodologies.', '', '', '', ''),
('res-4', 'Neuroprotective Potential of Ginkgo Biloba in Neurodegenerative Disorders', 'Neuropharmacology', 'Journal of Neurodegenerative Research', '2024', 'Investigating the molecular action of Ginkgo extract EGb 761 in preserving synaptic plasticity and memory mechanisms in mouse models of induced amyloid toxicity.', 'Investigating the molecular action of Ginkgo extract EGb 761 in preserving synaptic plasticity and memory mechanisms in mouse models of induced amyloid toxicity.', '["Alzheimer''s", "Neuroprotection", "Synaptic Plasticity", "EGb 761"]'::jsonb, 'Y-maze test and Morris water maze to evaluate spatial navigation. Immunohistochemistry of hippocampus tissues to quantify amyloid-beta plaques and superoxide levels.', 'Treatment with extract improved hippocampal synaptic density and significantly reduced memory consolidation errors by preserving acetylcholinesterase activity.', 'Validates long-standing traditional applications of Ginkgo extracts with hard physiological evidence, laying the clinical pathway for adjunctive treatment protocols.', '', '', '', ''),
('res-5', 'Evaluation of Antidiabetic Activity of Synthesized Chalcone Derivatives', 'Endocrinology & Medicinal Chemistry', 'Endocrine Chemistry & Biology', '2023', 'Synthesizing a series of fluorine-substituted chalcones and evaluating their competitive inhibition against enzyme alpha-glucosidase for Type II diabetes management.', 'Synthesizing a series of fluorine-substituted chalcones and evaluating their competitive inhibition against enzyme alpha-glucosidase for Type II diabetes management.', '["Diabetes", "Chalcone", "Alpha-Glucosidase", "Fluorine Derivatives"]'::jsonb, 'Claisen-Schmidt condensation reaction for chemical synthesis. In vitro enzyme-inhibition kinetics monitored at 405nm. Docking protocols on human intestinal sucrase-isomaltase.', 'Selected compound 3g showed an IC50 of 4.2 micromolar, ten-fold more potent than standard pharmaceutical Acarbose with no noticeable in-vitro hepatotoxicity.', 'Unlocks an economical, structurally simple molecule pathway to restrict postprandial glucose surges in diabetic patients.', '', '', '', ''),
('res-6', 'Phytochemical Screening and Gastroprotective Effects of Morinda Citrifolia', 'Gastroenterology', 'Gastrointestinal Biology', '2023', 'Assessment of Morinda citrifolia (Noni) fruit extract in protecting mucosal linings against ethanol-induced gastric ulcer models, analyzing anti-secretory mechanics.', 'Assessment of Morinda citrifolia (Noni) fruit extract in protecting mucosal linings against ethanol-induced gastric ulcer models, analyzing anti-secretory mechanics.', '["Gastric Ulcer", "Morinda Citrifolia", "Phytochemistry", "Mucosal Defense"]'::jsonb, 'Induction of gastric lesions with absolute oral ethanol. Determination of gastric juice pH, total acidity, and estimation of mucosal glutathione (GSH) and catalase levels.', 'Fruit extract at 400 mg/kg restored mucosal GSH content to near-control values, leading to an index of gastroprotection of 82% against corrosive lesions.', 'Validates safe gastroprotective natural remedies, reducing dependency on proton pump inhibitors which have been tied to kidney issues on prolonged use.', '', '', '', ''),
('res-7', 'In-vitro Antimicrobial Activity of Silver Nanoparticles Synthesized from Piper Nigrum', 'Microbiology & Green Synthesis', 'Nanomedicine and Microbiology', '2024', 'Harnessing biochemical reducing agents in black pepper to synthesize silver nanoparticles (AgNPs) capable of breaking down multidrug-resistant biofilm barriers.', 'Harnessing biochemical reducing agents in black pepper to synthesize silver nanoparticles (AgNPs) capable of breaking down multidrug-resistant biofilm barriers.', '["Green Synthesis", "Silver Nanoparticles", "Biofilms", "Piper Nigrum"]'::jsonb, 'Reduction of silver nitrate using aqueous Piper nigrum extract. Characterization via UV-Vis, FTIR, and TEM. Micro-broth dilution assays against MRSA strains.', 'The biological silver nanoparticles successfully compromised MRSA biofilm structures at concentrations of 15 micrograms/mL, rupturing bacterial cell walls.', 'Presents an environmental-friendly, simple synthesis route for producing high-affinity antibacterial surfaces and sterilizing agents.', '', '', '', ''),
('res-8', 'Assessment of Hepatoprotective Efficacy of Silymarin-Loaded Solid Lipid Nanoparticles', 'Hepatology & Drug Formulation', 'Hepatology Discovery', '2025', 'Re-engineering silymarin delivery using custom hot-homogenized lipid vectors to significantly bypass first-pass liver degradation and improve oral systemic bioavailability.', 'Re-engineering silymarin delivery using custom hot-homogenized lipid vectors to significantly bypass first-pass liver degradation and improve oral systemic bioavailability.', '["Silymarin", "Bioavailability", "Solid Lipid Nanoparticles", "Liver Protection"]'::jsonb, 'Preparation of solid lipid nanoparticles using glyceryl monostearate as lipid core. Liver enzymes (SGOT, SGPT) measured post carbon tetrachloride (CCl4) injury in models.', 'Solid lipid formulation elevated the oral bioavailable fraction by 450% and lowered critical marker enzymes AST and ALT significantly compared to pure silymarin powder.', 'Solves poor absorption issues of herbal active ingredients, turning traditional therapeutics into potent, standardized clinical remedies.', '', '', '', ''),
('res-9', 'Therapeutic Evaluation of Novel NSAID Conjugates with Reduced Gastric Toxicity', 'Analgesics & Chemistry', 'European Journal of Medicinal Chemistry', '2024', 'Designing ester and amide conjugates of Ketorolac with natural amino acids to mask acid carboxyl groups, aiming to mitigate mucosal damage while preserving inflammation block.', 'Designing ester and amide conjugates of Ketorolac with natural amino acids to mask acid carboxyl groups, aiming to mitigate mucosal damage while preserving inflammation block.', '["Ketorolac", "Prodrug", "Gastroprotective NSAIDs", "Amino Acid Conjugate"]'::jsonb, 'Steglich-like esterification synthesis followed by spectroscopic structure verification. Gastric tolerability indexing via histological cross-sections of stomach walls.', 'Conjugated designs retained excellent 92% analgesic activity while showing a notable 80-85% decrease in micro-hemorrhages and ulcerations across the gastric mucosa.', 'Offers safer options for patients under chronic treatment for arthritic ailments, reducing pain safely without compromising digestive health.', '', '', '', '');

-- 3. Insert Publications Data
INSERT INTO publications (id, title, journal, journal_name, year, publish_date, abstract, doi, doi_link, "citationCount", authors, co_authors, "pdfUrl", "pdf_url") VALUES
('pub-1', 'Synergistic Anti-Inflammatory Effects of Combined Boswellia Serrata and Curcuma Longa Extracts in Wistar Rats', 'Journal of Ethnopharmacology', 'Journal of Ethnopharmacology', '2025', '2025', 'This study systematically evaluated the co-administration of Boswellia and Curcuma extracts. Our findings show a 45% greater reduction in paw edema than either extract alone. This synergistic effect is mediated via the dual chemical block of high-affinity COX-2 enzymes and 5-LOX inflammatory pathway molecules.', '10.1016/j.jep.2025.118942', 'https://doi.org/10.1016/j.jep.2025.118942', 48, 'Chouhan AS, Sharma PK, Patel LK', 'Chouhan AS, Sharma PK, Patel LK', '', ''),
('pub-2', 'Formulation and Evaluation of Transdermal Patches Containing Glibenclamide Nanoparticles for Sustained Glycemic Control', 'International Journal of Pharmaceutics', 'International Journal of Pharmaceutics', '2024', '2024', 'Transdermal glibenclamide nanoparticles were synthesized via solvent evaporation. The formulation achieved peak therapeutic plasma level in 4 hours and sustained controlled drug release for 24 hours. The transdermal application completely bypasses hepatic first-pass metabolism, improving bioavailability by 70%.', '10.1016/j.ijpharm.2024.123510', 'https://doi.org/10.1016/j.ijpharm.2024.123510', 65, 'Chouhan AS, Dave H, Rathod DS', 'Chouhan AS, Dave H, Rathod DS', '', ''),
('pub-3', 'Mitochondrial Protection by Bioactive Flavonoids Against Doxorubicin-Induced Cardiotoxicity in Cardiac H9c2 Cells', 'Toxicology and Applied Pharmacology', 'Toxicology and Applied Pharmacology', '2023', '2023', 'Doxorubicin triggers cardiotoxicity by causing radical damage inside the cardiac cell''s mitochondria. This investigation profiles structural support provided by botanical flavonoids (quercetin and rutin). Pre-treatment preserved cellular respiration and slashed mitochondrial oxidative stresses (ROS) by 60%.', '10.1016/j.taap.2023.116490', 'https://doi.org/10.1016/j.taap.2023.116490', 112, 'Chouhan AS, Singh J, Verma M', 'Chouhan AS, Singh J, Verma M', '', ''),
('pub-4', 'Green Synthesis of Gold Nanoparticles Using Ginger Rhizome and Evaluation of Selective Cytotoxicity on Breast MCF-7 Cancer Lines', 'Nanomedicine & Biotechnology Review', 'Nanomedicine & Biotechnology Review', '2025', '2025', 'We report a single-pot green synthesis of gold nanoparticles (AuNPs) using Zingiber officinale root extract as an eco-friendly stabilizer. The bio-synthesized AuNPs displayed selective apoptosis induction inside MCF-7 cancer cell cultures while maintaining 90% survivability in healthy mammary epithelial cells.', '10.1016/j.nanomed.2025.109311', 'https://doi.org/10.1016/j.nanomed.2025.109311', 32, 'Chouhan AS, Chaudhary S, Sheikh Y', 'Chouhan AS, Chaudhary S, Sheikh Y', '', '');

-- 4. Insert Student Notes
INSERT INTO notes (id, title, size, type, description, summary, content, "downloadUrl", "isUserUploaded", "pdfUrl", "pdf_url", tags, date, publish_date) VALUES
('note-1', 'Advanced Receptor Pharmacology & Signal Transduction', '4.2 MB', 'PDF', 'Detailed hand-compiled lecture slides and notes outlining G-protein coupled receptors, intracellular cyclic AMP cascades, receptor up-regulation mechanics, and binding affinities values.', 'Detailed hand-compiled lecture slides and notes outlining G-protein coupled receptors, intracellular cyclic AMP cascades, receptor up-regulation mechanics, and binding affinities values.', '# Advanced Receptor Pharmacology

## 1. G-Protein Coupled Receptors (GPCRs)
GPCRs represent the largest class of membrane receptors. They feature standard 7-transmembrane alpha-helices.

### Signal Cascades:
1. Agonist binds to outer receptor site.
2. GDP is swapped with GTP on the G-alpha molecule.
3. G-alpha separates from G-beta-gamma subunits.
4. Activation of Adenylate Cyclase leads to cAMP generation from ATP.
5. Cyclic AMP binds to regulatory proteins releasing active Protein Kinase A (PKA).

## 2. Receptor Binding Kinetics
We graph saturation curves using the equation:
B = (Bmax * [L]) / (Kd + [L])
Where B is bound drug, Bmax is maximum capacity, and Kd is dissociation constant.', '', false, '', '', '["Receptor", "Pharmacology", "G-Protein"]'::jsonb, '2026-05-01', '2026-05-01'),
('note-2', 'HPLC Method Validation and ICH Guidelines Notes', '1.8 MB', 'PDF', 'Crucial protocol checklist summarizing High-Performance Liquid Chromatography validation parameter definitions (accuracy, precision, specificity, linearity, LOD/LOQ) according to Q2(R1) ICH guidelines.', 'Crucial protocol checklist summarizing High-Performance Liquid Chromatography validation parameter definitions (accuracy, precision, specificity, linearity, LOD/LOQ) according to Q2(R1) ICH guidelines.', '# HPLC Validation & ICH Guidelines

## 1. Linearity and Calibration Curves
Requires a minimum of 5 concentration points spread across the expected range (typically 80% to 120% of test concentration). Acceptable coefficient of determination R² > 0.999.

## 2. Limit of Detection (LOD)
Formula: LOD = 3.3 * (SD / S)
Where SD is standard deviation of blank response and S is slope of calibration line.

## 3. Limit of Quantification (LOQ)
Formula: LOQ = 10 * (SD / S)
Provides numerical boundary for accurate quantitative analysis.', '', false, '', '', '["HPLC", "ICH", "Validation"]'::jsonb, '2026-05-02', '2026-05-02'),
('note-3', 'Principles of Toxicology: Dose-Response Relationships', '2.5 MB', 'PDF', 'Comprehensive lecture study notes covering therapeutic index (TI), LD50, ED50, NOAEL indices, toxicokinetics curves, and chemical safety evaluation protocols.', 'Comprehensive lecture study notes covering therapeutic index (TI), LD50, ED50, NOAEL indices, toxicokinetics curves, and chemical safety evaluation protocols.', '# Dose-Response Relationships in Toxicology

## 1. Graded vs. Quantal Curves
- **Graded:** Measures the degree of response in a single organism (e.g., blood pressure drop in mmHg).
- **Quantal:** Profiles the distribution of an ''all-or-none'' response in an entire population (e.g., survival vs death percentage).

## 2. Safety Indexes
Therapeutic Index (TI) = LD50 / ED50
Certain Safety Factor (CSF) = LD1 / ED99
A higher safety index represents a safer molecule profile since therapeutic dosage shares no overlap with toxic dosage.', '', false, '', '', '["Toxicology", "LD50", "Dose-Response"]'::jsonb, '2026-05-03', '2026-05-03'),
('note-4', 'Phytochemical Extraction Techniques: Maceration to Soxhlet', '3.1 MB', 'PDF', 'Syllabus manual covering laboratory extraction procedures: cold maceration, percolation, reflux, supercritical CO2 extraction, and Soxhlet continuous hot extraction dynamics.', 'Syllabus manual covering laboratory extraction procedures: cold maceration, percolation, reflux, supercritical CO2 extraction, and Soxhlet continuous hot extraction dynamics.', '# Phytochemical Extraction Protocols

## 1. Soxhlet Extraction Principle
Soxhlet extraction is used when the desired bioactive chemical has limited solubility in a solvent, and the impurities are insoluble.

- The solvent is heated to reflux in a distillation flask.
- Solvent vapor travels up and into a condenser, dripping into the chamber containing the plant material.
- Siphon tube drains the loaded solvent back into the heating flask when liquid climbs to the top of the siphon leg.

## 2. Solvent Selection Index (Polarity):
Hexane (Non-polar) -> Dichloromethane -> Ethyl Acetate -> Ethanol -> Water (Polar)', '', false, '', '', '["Extraction", "Phytochemistry", "Soxhlet"]'::jsonb, '2026-05-04', '2026-05-04'),
('note-5', 'Pharmacokinetics: Compartmental vs Non-Compartmental Analysis', '1.2 MB', 'PDF', 'Chemical math cheat sheet with core equations for Volume of Distribution (Vd), Clearance (Cl), Half-life (t1/2), Bioavailability (F), and AUC multi-compartment graphs.', 'Chemical math cheat sheet with core equations for Volume of Distribution (Vd), Clearance (Cl), Half-life (t1/2), Bioavailability (F), and AUC multi-compartment graphs.', '# Pharmacokinetics Formula Guide

## 1. Bioavailability (F)
F = (AUC_oral * Dose_IV) / (AUC_IV * Dose_oral) * 100 %
Calculates systemic absorption percentage of oral dosage.

## 2. Apparent Volume of Distribution (Vd)
Vd = Dose / C0
Where C0 is the plasmaconcentration extrapolated to time zero.
Values > 42 liters hint that the chemical is storing inside fatty tissues, rather than remaining inside blood vessels.', '', false, '', '', '["Pharmacokinetics", "Clearance", "Half-life"]'::jsonb, '2026-05-05', '2026-05-05');

-- 5. Insert Timeline Milestones
INSERT INTO timeline (year, title, institution, description, "achievementType") VALUES
('2013', 'Bachelor of Pharmacy (B.Pharm) - First Class Honours', 'University Institute of Pharmaceutical Sciences', 'Graduated with dual excellence in pharmacognosy and medicinal chemistry. Conducted undergraduate research on extraction of anti-oxidant flavonoids from domestic spices.', 'education'),
('2015', 'Master of Pharmacy (M.Pharm) in Pharmacology', 'National College of Pharmaceutical Research', 'Completed postgraduate thesis on ''Anti-ulcer and Gastroprotective Activities of Organic Herb Extracts in Animal Models'', under peer-reviewed guidance.', 'education'),
('2016', 'Senior Research Fellow & Pharmaceutical Analyst', 'Apex Advanced Toxicology Laboratory', 'Spearheaded molecular screening protocols for hepatoprotective and nephroprotective drugs. Validated over 30 reverse-phase HPLC methods for generic formulations.', 'research'),
('2019', 'Young Scientist Award in Pharmacology', 'International Society of Phytophysiology', 'Awarded outstanding young scientist for novel research investigating synergistic anti-inflammatory impacts of Boswellia and Curcumin extracts in rat models.', 'award'),
('2021', 'Doctor of Philosophy (Ph.D.) in Pharmacology & Pharmacokinetics', 'Central Science University', 'Defended doctoral thesis on ''Targeted Liposomal Nanoparticles Conjugated with Active Biotins for Localized Ovarian Cancer Therapy'', leading to 3 international patent filings.', 'education'),
('2022', 'Assistant Professor & Principal Investigator', 'Department of Pharmacology, State Medical Academy', 'Established the Preclinical Drug Screening and Molecular Nanomedicine Research Laboratory. Acquired state funds to investigate metabolic enzyme pathways of bioflavonoids.', 'research'),
('2024', 'Chief Researcher & Associate Editor', 'Global Journal of Advanced Pharmacophysics', 'Invited reviewer of drug toxicity publications and coordinator of the national academic committee on safety of Nano-formulated anti-cancer agents.', 'publication'),
('2026', 'Senior Pharmacology Expert & Board Member', 'Research Institute of Pharmacological Sciences', 'Coordinating clinical trials of bioavailable plant formulations for osteoarthritic disorders. Continuing teaching and mentorship of young pharmacology students.', 'research');

-- 6. Insert Contact Submissions & Replies (Seed History)
INSERT INTO contact_submissions (id, name, email, message, date) VALUES
('sub-1', 'Dr. Rachel Green', 'rachel.g@university.edu', 'Interested in the synergy of Boswellic acids and Curcumin. Do you have secondary preclinical toxicity screens or liver clearance assay logs available?', '2026-05-25 10:15'),
('sub-2', 'Arjun Mehta', 'arjun.m@pharmastudents.org', 'Hello Dr. Ashwin, I wanted to ask if you are offering laboratory rotations or student mentorships on nanoparticle preparation during the upcoming winter semester.', '2026-05-24 16:30');

INSERT INTO contact_replies (id, "submissionId", "recipientEmail", subject, message, date, "smtpUsed", "previewUrl") VALUES
('rep-1', 'sub-1', 'rachel.g@university.edu', 'Re: Preclinical toxicity screens & liver clearance logs', 'Hello Dr. Green,

Thank you for reaching out. Yes, we have compiled detailed hepatic clearance assays and cytochrome P450 inhibition profiles for our primary Boswellic-Curcumin conjugates. I am attaching a summarized PDF report for your academic review, which also covers the PLGA carrier toxicity profiles.

Best regards,
Dr. Ashwin Singh Chouhan', '2026-05-25 14:20', 'Ethereal Sandboxed SMTP', '');

-- 7. Insert Blog Articles
INSERT INTO articles (id, title, category, date, publish_date, "readTime", author, snippet, excerpt, views, content, tags, "pdfUrl", "pdf_url") VALUES
('art-1', 'Advances in Pharmacology 2026: Trends in Targeting Intracellular Receptors', 'Molecular Pharmacology', 'May 20, 2026', 'May 20, 2026', '8 min read', 'Dr. Ashwin Singh Chouhan', 'A detailed scientific exploration on advances in pharmacology 2026: trends in targeting intracellular receptors. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.', 'A detailed scientific exploration on advances in pharmacology 2026: trends in targeting intracellular receptors. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.', 1500, 'Detailed blog post content for advances in pharmacology 2026: trends in targeting intracellular receptors...', '["Pharmacology", "Receptors", "Intracellular"]'::jsonb, '', ''),
('art-2', 'Modern Toxicology: Analyzing Cellular Damage and Heavy Metal Antidotes', 'Toxicology', 'May 16, 2026', 'May 16, 2026', '10 min read', 'Dr. Ashwin Singh Chouhan', 'A detailed scientific exploration on modern toxicology: analyzing cellular damage and heavy metal antidotes. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.', 'A detailed scientific exploration on modern toxicology: analyzing cellular damage and heavy metal antidotes. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.', 1820, 'Detailed blog post content for modern toxicology and heavy metal antidotes...', '["Toxicology", "Heavy Metals", "Antidotes"]'::jsonb, '', ''),
('art-3', 'Phytotherapy of Chronic Arthritis: Anti-inflammatory Biomarkers Examined', 'Herbal Medicine', 'May 12, 2026', 'May 12, 2026', '5 min read', 'Dr. Ashwin Singh Chouhan', 'A detailed scientific exploration on phytotherapy of chronic arthritis: anti-inflammatory biomarkers examined. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.', 'A detailed scientific exploration on phytotherapy of chronic arthritis: anti-inflammatory biomarkers examined. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.', 1100, 'Detailed blog post content for arthritis phytotherapy treatment models...', '["Phytotherapy", "Arthritis", "Anti-inflammatory"]'::jsonb, '', ''),
('art-4', 'Preclinical Trials: Protocols for Ethical Drug Screening in Laboratory Mice', 'Clinical Studies', 'May 08, 2026', 'May 08, 2026', '6 min read', 'Dr. Ashwin Singh Chouhan', 'A detailed scientific exploration on preclinical trials: protocols for ethical drug screening in laboratory mice. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.', 'A detailed scientific exploration on preclinical trials: protocols for ethical drug screening in laboratory mice. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.', 950, 'Detailed clinical protocol guide for screening in vivo rodent models...', '["Preclinical", "Animal Trials", "Ethics"]'::jsonb, '', ''),
('art-5', 'Gastrointestinal Absorption Barriers: Re-designing Orally Disintegrating Tablets', 'Pharmacokinetics', 'May 04, 2026', 'May 04, 2026', '7 min read', 'Dr. Ashwin Singh Chouhan', 'A detailed scientific exploration on gastrointestinal absorption barriers: re-designing orally disintegrating tablets. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.', 'A detailed scientific exploration on gastrointestinal absorption barriers: re-designing orally disintegrating tablets. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.', 1430, 'Detailed analysis of oral dosage forms, disintegrating dynamics, excipients and bioavailability indices...', '["Absorption", "Orally Disintegrating", "Tablets"]'::jsonb, '', '');

-- =========================================================================
-- STEP D: ROW LEVEL SECURITY (RLS) ACTIVATION WITH PUBLIC ACCESS POLICIES
-- =========================================================================

-- Note: RLS ensures your database has strict access boundaries, and the policies
-- below allow your web app to securely select, insert, update, and delete rows.

-- 1. site_configs
ALTER TABLE site_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read site_configs" ON site_configs;
DROP POLICY IF EXISTS "Public Insert site_configs" ON site_configs;
DROP POLICY IF EXISTS "Public Update site_configs" ON site_configs;
DROP POLICY IF EXISTS "Public Delete site_configs" ON site_configs;
CREATE POLICY "Public Read site_configs" ON site_configs FOR SELECT TO public USING (true);
CREATE POLICY "Public Insert site_configs" ON site_configs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Update site_configs" ON site_configs FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete site_configs" ON site_configs FOR DELETE TO public USING (true);

-- 2. researches
ALTER TABLE researches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read researches" ON researches;
DROP POLICY IF EXISTS "Public Insert researches" ON researches;
DROP POLICY IF EXISTS "Public Update researches" ON researches;
DROP POLICY IF EXISTS "Public Delete researches" ON researches;
CREATE POLICY "Public Read researches" ON researches FOR SELECT TO public USING (true);
CREATE POLICY "Public Insert researches" ON researches FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Update researches" ON researches FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete researches" ON researches FOR DELETE TO public USING (true);

-- 3. articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read articles" ON articles;
DROP POLICY IF EXISTS "Public Insert articles" ON articles;
DROP POLICY IF EXISTS "Public Update articles" ON articles;
DROP POLICY IF EXISTS "Public Delete articles" ON articles;
CREATE POLICY "Public Read articles" ON articles FOR SELECT TO public USING (true);
CREATE POLICY "Public Insert articles" ON articles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Update articles" ON articles FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete articles" ON articles FOR DELETE TO public USING (true);

-- 4. publications
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read publications" ON publications;
DROP POLICY IF EXISTS "Public Insert publications" ON publications;
DROP POLICY IF EXISTS "Public Update publications" ON publications;
DROP POLICY IF EXISTS "Public Delete publications" ON publications;
CREATE POLICY "Public Read publications" ON publications FOR SELECT TO public USING (true);
CREATE POLICY "Public Insert publications" ON publications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Update publications" ON publications FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete publications" ON publications FOR DELETE TO public USING (true);

-- 5. notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read notes" ON notes;
DROP POLICY IF EXISTS "Public Insert notes" ON notes;
DROP POLICY IF EXISTS "Public Update notes" ON notes;
DROP POLICY IF EXISTS "Public Delete notes" ON notes;
CREATE POLICY "Public Read notes" ON notes FOR SELECT TO public USING (true);
CREATE POLICY "Public Insert notes" ON notes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Update notes" ON notes FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete notes" ON notes FOR DELETE TO public USING (true);

-- 6. timeline
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read timeline" ON timeline;
DROP POLICY IF EXISTS "Public Insert timeline" ON timeline;
DROP POLICY IF EXISTS "Public Update timeline" ON timeline;
DROP POLICY IF EXISTS "Public Delete timeline" ON timeline;
CREATE POLICY "Public Read timeline" ON timeline FOR SELECT TO public USING (true);
CREATE POLICY "Public Insert timeline" ON timeline FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Update timeline" ON timeline FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete timeline" ON timeline FOR DELETE TO public USING (true);

-- 7. contact_submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public Insert contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public Update contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public Delete contact_submissions" ON contact_submissions;
CREATE POLICY "Public Read contact_submissions" ON contact_submissions FOR SELECT TO public USING (true);
CREATE POLICY "Public Insert contact_submissions" ON contact_submissions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Update contact_submissions" ON contact_submissions FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete contact_submissions" ON contact_submissions FOR DELETE TO public USING (true);

-- 8. contact_replies
ALTER TABLE contact_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read contact_replies" ON contact_replies;
DROP POLICY IF EXISTS "Public Insert contact_replies" ON contact_replies;
DROP POLICY IF EXISTS "Public Update contact_replies" ON contact_replies;
DROP POLICY IF EXISTS "Public Delete contact_replies" ON contact_replies;
CREATE POLICY "Public Read contact_replies" ON contact_replies FOR SELECT TO public USING (true);
CREATE POLICY "Public Insert contact_replies" ON contact_replies FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Update contact_replies" ON contact_replies FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete contact_replies" ON contact_replies FOR DELETE TO public USING (true);

-- NOTE FOR STORAGE OPTIMIZATION (PDF UPLOADS):
-- To upload research PDF sheets or study notes, open your Supabase Storage Section in the web sidebar,
-- create a public bucket named 'pdfs' there, and set its policies to Allow Public/Anonymous Access.
-- This keeps the database free of ownership lock violations.
`;
