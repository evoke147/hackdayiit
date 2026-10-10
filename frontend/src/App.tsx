import React, { useState, useEffect } from 'react';
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
  Layers
} from 'lucide-react';
import type { OnboardingData, RoadmapResponse, LaunchPlan } from './types';
import { generateRoadmap, tweakRoadmap, checkBackendHealth } from './api';

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
    subjects_studied: 'Web Tech, Computer Networks, Software Engineering, Cloud',
    skills: 'Responsive UI, state management, Docker basics, Git',
    programming_languages: 'TypeScript, JavaScript, Python, SQL',
    career_goals: 'Secure a High-Growth Startup Full-Stack Engineer role',
    preferred_industry: 'SaaS / Web Platforms',
  },
  'Data Analyst': {
    degree_specialization: 'B.S. Data Science & Business Computing',
    year_semester: '3rd Year, Semester 6',
    subjects_studied: 'Applied Statistics, Database Systems, Business Intelligence',
    skills: 'Data storytelling, dashboarding, A/B testing, presentation',
    programming_languages: 'Python, SQL, R',
    career_goals: 'Land a Product Analytics internship at a top Fintech firm',
    preferred_industry: 'Fintech & Banking',
  },
};

export default function App() {
  const [formData, setFormData] = useState<OnboardingData>(PRESETS['AI / ML Engineer']);
  const [loading, setLoading] = useState<boolean>(false);
  const [tweakLoading, setTweakLoading] = useState<boolean>(false);
  const [tweakInput, setTweakInput] = useState<string>('');
  const [response, setResponse] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);

  useEffect(() => {
    checkBackendHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

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
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Antigravity Launch Plan
            </h1>
            <p className="text-xs text-slate-400">AI Career Accelerator for Indian Students</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-800 bg-slate-900/80">
            <span className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="text-slate-300">
              {backendOnline === null ? 'Checking Backend...' : backendOnline ? 'Backend Online (Gemma 4)' : 'Backend Disconnected'}
            </span>
          </div>

          <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Model: gemma-4-26b-a4b-it
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Student Onboarding Form */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">Student Onboarding</h2>
              </div>
              <span className="text-xs text-slate-400">1 Click Setup</span>
            </div>

            {/* Persona Preset Buttons */}
            <div className="mb-6">
              <label className="text-xs font-medium text-slate-400 mb-2 block">Quick Sample Personas:</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(PRESETS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyPreset(key)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-400" /> Degree & Specialization
                </label>
                <input
                  type="text"
                  name="degree_specialization"
                  value={formData.degree_specialization}
                  onChange={handleChange}
                  required
                  placeholder="e.g. B.Tech Computer Science with AI specialization"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Current Year / Semester
                </label>
                <input
                  type="text"
                  name="year_semester"
                  value={formData.year_semester}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 3rd Year, Semester 5"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <Layers className="h-3.5 w-3.5 text-emerald-400" /> Subjects Studied
                </label>
                <input
                  type="text"
                  name="subjects_studied"
                  value={formData.subjects_studied}
                  onChange={handleChange}
                  required
                  placeholder="e.g. DSA, DBMS, OS, Machine Learning"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Technical & Non-Technical Skills
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Problem solving, REST APIs, Git, teamwork"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <Code2 className="h-3.5 w-3.5 text-purple-400" /> Programming Languages
                </label>
                <input
                  type="text"
                  name="programming_languages"
                  value={formData.programming_languages}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Python, Java, JavaScript"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <Rocket className="h-3.5 w-3.5 text-rose-400" /> Career Goals
                </label>
                <input
                  type="text"
                  name="career_goals"
                  value={formData.career_goals}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Become an ML Engineer at a product company"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-400" /> Preferred Industry
                </label>
                <input
                  type="text"
                  name="preferred_industry"
                  value={formData.preferred_industry}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Artificial Intelligence / Machine Learning"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:opacity-95 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing with Gemma 4 (~15-20s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Launch Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Roadmap Output & Refinement */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="block font-semibold">Error:</strong>
                {error}
              </div>
            </div>
          )}

          {/* Empty / Loading State */}
          {!plan && !loading && (
            <div className="bg-slate-900/50 border border-slate-800/80 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Rocket className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Launch Your Career Plan</h3>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                Fill in your details or pick a sample persona on the left, then click <strong>"Generate Launch Plan"</strong> to receive an actionable, Gemma 4-powered roadmap.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Strict JSON schema • Verified against Gemini API</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] animate-pulse">
              <RefreshCw className="h-10 w-10 text-indigo-400 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Consulting Gemma 4 Intelligence...</h3>
              <p className="text-sm text-slate-400 max-w-sm mb-4">
                Benchmarking your subjects, identifying high-leverage skill gaps, and generating 30-day milestones.
              </p>
              <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Model: gemma-4-26b-a4b-it
              </span>
            </div>
          )}

          {/* Generated Plan */}
          {plan && !loading && (
            <div className="flex flex-col gap-6">
              
              {/* Top Banner */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Antigravity Accelerate</span>
                    <h2 className="text-xl font-bold text-white">🚀 The Antigravity Launch Plan</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyJson}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
                    >
                      {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
                    </button>
                    <button
                      onClick={() => setShowJsonModal(!showJsonModal)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{showJsonModal ? 'Hide JSON' : 'Inspect JSON'}</span>
                    </button>
                  </div>
                </div>

                {/* Raw JSON viewer toggle */}
                {showJsonModal && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-72">
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                  </div>
                )}

                {/* Section 1: Profile Strengths */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4" /> 1. Profile Strengths
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {plan.profile_strengths.map((strength, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm text-slate-200 leading-relaxed">
                        • {strength}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Missing Links */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4" /> 2. The Missing Links (Skill & Project Gaps)
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {plan.missing_links.map((gap, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-slate-200 leading-relaxed">
                        ⚠️ {gap}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Next 30 Days */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 mb-3">
                    <Rocket className="h-4 w-4" /> 3. Next 30 Days (Action Items)
                  </h3>
                  <div className="flex flex-col gap-3">
                    {plan.next_30_days.map((task, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-sm text-slate-200 flex items-start gap-3 leading-relaxed">
                        <span className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div>{task}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Industry Radar */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-3">
                    <Radio className="h-4 w-4" /> 4. Industry Radar
                  </h3>
                  <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-sm text-slate-200">
                    <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                      {plan.industry_radar.topic}
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{plan.industry_radar.reason}</p>
                  </div>
                </div>
              </div>

              {/* Refine / Tweak with Memory Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Refine Plan (Agent Memory)</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Ask to adjust timeline, swap skills, or emphasize target companies. The agent remembers your profile and tweaks the JSON accordingly.
                </p>

                <form onSubmit={handleTweak} className="flex gap-2">
                  <input
                    type="text"
                    value={tweakInput}
                    onChange={(e) => setTweakInput(e.target.value)}
                    placeholder="e.g. Focus more on PyTorch and securing a research internship..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={tweakLoading || !tweakInput.trim()}
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-2 transition"
                  >
                    {tweakLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>Refine</span>
                  </button>
                </form>
              </div>

            </div>
          )}

        </section>
      </main>
    </div>
  );
}
