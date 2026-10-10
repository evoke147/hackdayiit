import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  RefreshCw, 
  Copy, 
  Check, 
  GraduationCap, 
  Code2, 
  Send, 
  Zap, 
  Building2, 
  Calendar, 
  Layers, 
  Bot, 
  User, 
  ArrowRight, 
  Edit3, 
  MessageSquare, 
  Compass, 
  ExternalLink,
  ChevronRight,
  Terminal
} from 'lucide-react';
import type { OnboardingData, RoadmapResponse, LaunchPlan, ChatMessage } from './types';
import { generateRoadmap, tweakRoadmap, checkBackendHealth, sendChatMessage } from './api';

const PRESETS: Record<string, OnboardingData> = {
  'AI / ML Engineer': {
    degree_specialization: 'B.Tech Computer Science with AI specialization',
    year_semester: '3rd Year, Semester 5',
    subjects_studied: 'DSA, DBMS, Operating Systems, Machine Learning',
    skills: 'Problem solving, teamwork, REST API design, data analysis',
    programming_languages: 'Python, Java, JavaScript',
    career_goals: 'Become an ML Engineer at a product-based tech company',
    preferred_industry: 'Artificial Intelligence / Machine Learning',
  },
  'Full-Stack Developer': {
    degree_specialization: 'B.Tech Information Technology',
    year_semester: '4th Year, Semester 7',
    subjects_studied: 'Web Architecture, Computer Networks, Software Engineering, Cloud',
    skills: 'Responsive UI, state management, Docker basics, Git, team collaboration',
    programming_languages: 'TypeScript, JavaScript, Python, SQL',
    career_goals: 'Secure a High-Growth Startup Full-Stack Engineer role',
    preferred_industry: 'SaaS / Web Platforms',
  },
  'Cloud & DevOps': {
    degree_specialization: 'B.Tech Computer Engineering',
    year_semester: '3rd Year, Semester 6',
    subjects_studied: 'Linux Systems, Computer Networks, Distributed Systems',
    skills: 'Linux administration, Docker, CI/CD pipelines, Bash scripting',
    programming_languages: 'Python, Go, Bash',
    career_goals: 'Land a Cloud Infrastructure or Site Reliability Engineering role',
    preferred_industry: 'Cloud Infrastructure / DevOps',
  },
  'Data Analyst': {
    degree_specialization: 'B.S. Data Science & Business Computing',
    year_semester: '3rd Year, Semester 6',
    subjects_studied: 'Applied Statistics, Database Systems, Business Intelligence, Data Mining',
    skills: 'Data storytelling, dashboarding, A/B testing, Tableau',
    programming_languages: 'Python, SQL, R',
    career_goals: 'Secure a Product Analytics internship at a top Fintech firm',
    preferred_industry: 'Fintech & Banking',
  },
};

type PageTab = 'input' | 'roadmap' | 'chat';

export default function App() {
  const [activeTab, setActiveTab] = useState<PageTab>('input');
  const [formData, setFormData] = useState<OnboardingData>(PRESETS['AI / ML Engineer']);
  const [loading, setLoading] = useState<boolean>(false);
  const [tweakLoading, setTweakLoading] = useState<boolean>(false);
  const [tweakInput, setTweakInput] = useState<string>('');
  const [response, setResponse] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your Antigravity AI Career Mentor powered by Gemma 4. I can answer questions about your coursework, preparation roadmap, mock interviews, or tech career strategies. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkBackendHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyPreset = (key: string) => {
    setFormData(PRESETS[key]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await generateRoadmap(formData);
      setResponse(res);
      // Auto-navigate to Roadmap Page on successful generation
      setActiveTab('roadmap');
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleTweak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweakInput.trim() || !response) return;

    setTweakLoading(true);
    setError(null);
    try {
      const res = await tweakRoadmap(formData, response.launch_plan, tweakInput.trim());
      setResponse(res);
      setTweakInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to refine roadmap');
    } finally {
      setTweakLoading(false);
    }
  };

  const handleSendChat = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const text = customMsg || chatInput.trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customMsg) setChatInput('');
    setChatLoading(true);

    try {
      const historyPayload = chatMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));
      
      const res = await sendChatMessage(
        text,
        historyPayload,
        formData,
        response ? response.launch_plan : null
      );

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `Error: ${err.message || 'Could not connect to Gemma 4 mentor.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const copyJson = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const plan: LaunchPlan | null = response?.launch_plan || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Antigravity
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                Gemma 4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI Career Accelerator & Placement Platform</p>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'input'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>1. Profile Input</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Rocket className="h-3.5 w-3.5" />
            <span>2. Launch Plan</span>
            {plan && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>3. AI Mentor</span>
          </button>
        </nav>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-800 bg-slate-900/80">
            <span className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="text-slate-300 hidden md:inline">
              {backendOnline === null ? 'Connecting...' : backendOnline ? 'Gemma 4 Online' : 'Backend Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong className="block font-semibold">Error Encountered:</strong>
              {error}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 1: ONBOARDING / INPUT PAGE                          */}
        {/* ======================================================== */}
        {activeTab === 'input' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in duration-300">
            
            {/* Header Hero */}
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
                <Sparkles className="h-3.5 w-3.5" /> Personalized Career Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Student Profile & Onboarding
              </h2>
              <p className="text-sm text-slate-400">
                Share your academic background, target industry, and goals. Gemma 4 will synthesize your profile into a structured 30-day Launch Plan.
              </p>
            </div>

            {/* Persona Preset Picker */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                💡 Quick Start — Select a Sample Persona:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.keys(PRESETS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyPreset(key)}
                    className="text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700 hover:border-indigo-500/50 text-slate-200 transition-all text-left flex items-center justify-between"
                  >
                    <span>{key}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                      <GraduationCap className="h-4 w-4 text-indigo-400" /> Degree & Specialization
                    </label>
                    <input
                      type="text"
                      name="degree_specialization"
                      value={formData.degree_specialization}
                      onChange={handleChange}
                      required
                      placeholder="e.g. B.Tech Computer Science with AI"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                      <Calendar className="h-4 w-4 text-cyan-400" /> Current Year / Semester
                    </label>
                    <input
                      type="text"
                      name="year_semester"
                      value={formData.year_semester}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 3rd Year, Semester 5"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                    <Layers className="h-4 w-4 text-emerald-400" /> Subjects Studied (Coursework)
                  </label>
                  <input
                    type="text"
                    name="subjects_studied"
                    value={formData.subjects_studied}
                    onChange={handleChange}
                    required
                    placeholder="e.g. DSA, DBMS, Operating Systems, Machine Learning"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                      <Zap className="h-4 w-4 text-amber-400" /> Technical & Soft Skills
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Problem solving, REST APIs, Git, teamwork"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                      <Code2 className="h-4 w-4 text-purple-400" /> Programming Languages
                    </label>
                    <input
                      type="text"
                      name="programming_languages"
                      value={formData.programming_languages}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Python, Java, JavaScript"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                      <Rocket className="h-4 w-4 text-rose-400" /> Career Goals & Target Role
                    </label>
                    <input
                      type="text"
                      name="career_goals"
                      value={formData.career_goals}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Become an ML Engineer at a product company"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                      <Building2 className="h-4 w-4 text-blue-400" /> Preferred Industry
                    </label>
                    <input
                      type="text"
                      name="preferred_industry"
                      value={formData.preferred_industry}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Artificial Intelligence / Machine Learning"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Structured JSON output validated by Pydantic
                  </span>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:opacity-95 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Synthesizing with Gemma 4 (~15-20s)...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4" />
                        <span>🚀 Launch Career Roadmap</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 2: ROADMAP / LAUNCH PLAN OUTPUT PAGE                */}
        {/* ======================================================== */}
        {activeTab === 'roadmap' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
            
            {/* If no plan generated yet */}
            {!plan && !loading && (
              <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[440px]">
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <Rocket className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Launch Plan Generated Yet</h3>
                <p className="text-sm text-slate-400 max-w-md mb-6">
                  Please complete the onboarding profile on Page 1 first to receive your personalized roadmap.
                </p>
                <button
                  onClick={() => setActiveTab('input')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 transition"
                >
                  <Edit3 className="h-4 w-4" /> Go to Profile Input
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[440px] animate-pulse">
                <RefreshCw className="h-10 w-10 text-indigo-400 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Gemma 4 is Designing Your Roadmap...</h3>
                <p className="text-sm text-slate-400 max-w-md mb-4">
                  Analyzing profile strengths, detecting critical technical gaps, and outlining 30-day actionable tasks.
                </p>
                <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Model: gemma-4-26b-a4b-it
                </span>
              </div>
            )}

            {/* Generated Plan View */}
            {plan && !loading && (
              <div className="flex flex-col gap-6">
                
                {/* Roadmap Header Toolbar */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Personalized Blueprint</span>
                    <h2 className="text-2xl font-bold text-white">🚀 The Antigravity Launch Plan</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Target: <span className="text-slate-200 font-medium">{formData.career_goals}</span> ({formData.preferred_industry})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('input')}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={copyJson}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
                    >
                      {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                    <button
                      onClick={() => setShowJsonModal(!showJsonModal)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{showJsonModal ? 'Hide JSON' : 'Inspect JSON'}</span>
                    </button>
                  </div>
                </div>

                {/* JSON Modal Viewer */}
                {showJsonModal && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-80 shadow-2xl">
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                  </div>
                )}

                {/* Section 1: Profile Strengths */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-4 w-4" /> 1. Profile Strengths
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plan.profile_strengths.map((strength, i) => (
                      <div key={i} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm text-slate-200 leading-relaxed">
                        • {strength}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Missing Links */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4" /> 2. The Missing Links (Skill Gaps)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plan.missing_links.map((gap, i) => (
                      <div key={i} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-slate-200 leading-relaxed">
                        ⚠️ {gap}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Next 30 Days Milestones */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 mb-4">
                    <Rocket className="h-4 w-4" /> 3. Next 30 Days (Step-by-Step Action Items)
                  </h3>
                  <div className="flex flex-col gap-3">
                    {plan.next_30_days.map((task, i) => (
                      <div key={i} className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-sm text-slate-200 flex items-start gap-3.5 leading-relaxed">
                        <span className="h-7 w-7 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                          Day {i === 0 ? '1-10' : i === 1 ? '11-20' : '21-30'}
                        </span>
                        <div>{task}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Industry Radar */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-4">
                    <Radio className="h-4 w-4" /> 4. Industry Radar
                  </h3>
                  <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-sm text-slate-200">
                    <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                      {plan.industry_radar.topic}
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{plan.industry_radar.reason}</p>
                  </div>
                </div>

                {/* Refinement with Memory Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Refine Plan (Agent Memory)</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Give specific instructions (e.g. <em>"Focus more on Docker containerization"</em> or <em>"Add 2 mock interview checkpoints"</em>). The agent remembers your profile and adjusts the JSON plan.
                  </p>

                  <form onSubmit={handleTweak} className="flex gap-2">
                    <input
                      type="text"
                      value={tweakInput}
                      onChange={(e) => setTweakInput(e.target.value)}
                      placeholder="e.g. Adjust the 30-day plan to focus on Hugging Face fine-tuning..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                    />
                    <button
                      type="submit"
                      disabled={tweakLoading || !tweakInput.trim()}
                      className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-2 transition"
                    >
                      {tweakLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span>Refine</span>
                    </button>
                  </form>
                </div>

                {/* Chatbot CTA Banner */}
                <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Have questions about this Launch Plan?</h4>
                      <p className="text-xs text-slate-400">Ask the AI Career Mentor for interview advice or project breakdowns.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap"
                  >
                    <span>Open AI Mentor Chat</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 3: AI CAREER MENTOR CHATBOT                         */}
        {/* ======================================================== */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto flex flex-col h-[750px] bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur overflow-hidden animate-in fade-in duration-300">
            
            {/* Chatbot Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Antigravity AI Career Mentor</h3>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Aware of your profile: <span className="text-indigo-400 font-medium">{formData.degree_specialization || 'Student'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
                  gemma-4-26b-a4b-it
                </span>
              </div>
            </div>

            {/* Quick Prompt Suggestion Pills */}
            <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Suggested:</span>
              {[
                "How do I prepare for Day 1 of my plan?",
                "What mock interview questions will I face?",
                "Recommend project ideas for my missing links",
                "How to showcase this on LinkedIn?"
              ].map((pill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendChat(undefined, pill)}
                  className="text-[11px] px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 whitespace-nowrap transition"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-300 mt-1">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <span className={`block text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 text-slate-200 mt-1">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Bot Typing Indicator */}
              {chatLoading && (
                <div className="flex gap-3 items-center text-slate-400 text-xs">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-300">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-slate-400 text-xs ml-1">Gemma 4 is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90">
              <form onSubmit={handleSendChat} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask your AI Career Mentor anything (e.g. interview tips, project feedback)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 transition"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
