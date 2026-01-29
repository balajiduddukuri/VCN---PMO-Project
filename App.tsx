
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  Award, 
  Settings, 
  ChevronRight, 
  Zap, 
  Activity,
  MessageSquare,
  BarChart3,
  ShieldAlert,
  FileText,
  Info,
  Clock,
  ExternalLink,
  Globe,
  Star,
  Layers,
  Sparkles,
  ArrowUpRight,
  X,
  BookOpen,
  Building2,
  Quote,
  ThumbsUp,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Compass,
  Search,
  Book,
  ChevronDown
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line
} from 'recharts';

import { 
  INITIAL_USERS, 
  INITIAL_ARTIFACTS, 
  NETWORK_MILESTONES, 
  MOCK_METRICS, 
  COLLABORATION_TREND,
  GOVERNANCE_POLICIES,
  ADVISOR_REVIEWS,
  OPPORTUNITIES,
  INITIAL_CLIENTS,
  CLIENT_FEEDBACK
} from './constants';
import { UI_TEXT, DOC_SECTIONS, DOC_CATEGORIES } from './content';
import { User, Artifact, NetworkMilestone, KPIMetrics, GovernancePolicy, AdvisorReview, Opportunity, Client, ClientFeedback } from './types';
import { analyzePilotPerformance } from './services/geminiService';

const Modal = ({ title, isOpen, onClose, children }: { title: string, isOpen: boolean, onClose: () => void, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center px-10 py-8 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{title}</h3>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        <div className="p-10 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profiles' | 'actions' | 'roadmap' | 'governance' | 'experts' | 'marketplace' | 'docs' | 'clients'>('dashboard');
  const [activeDocCategory, setActiveDocCategory] = useState<string>(DOC_CATEGORIES[0].id);
  
  const [users] = useState<User[]>(INITIAL_USERS);
  const [artifacts, setArtifacts] = useState<Artifact[]>(INITIAL_ARTIFACTS);
  const [milestones] = useState<NetworkMilestone[]>(NETWORK_MILESTONES);
  const [policies] = useState<GovernancePolicy[]>(GOVERNANCE_POLICIES);
  const [advisors] = useState<AdvisorReview[]>(ADVISOR_REVIEWS);
  const [opportunities] = useState<Opportunity[]>(OPPORTUNITIES);
  const [clients] = useState<Client[]>(INITIAL_CLIENTS);
  const [feedback] = useState<ClientFeedback[]>(CLIENT_FEEDBACK);
  const [metrics] = useState<KPIMetrics>(MOCK_METRICS);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string, content: React.ReactNode } | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzePilotPerformance(metrics, artifacts);
    setAiInsight(result || "Analysis offline.");
    setIsAnalyzing(false);
  };

  const toggleVerification = (id: string) => {
    setArtifacts(prev => prev.map(a => a.id === id ? { ...a, verified: !a.verified } : a));
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${
        activeTab === id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      <Icon size={20} className={activeTab === id ? 'animate-pulse' : ''} />
      <span className="font-bold text-xs tracking-tight uppercase">{label}</span>
    </button>
  );

  const activeDocs = DOC_SECTIONS.filter(s => s.category === activeDocCategory);

  return (
    <div className="flex min-h-screen bg-[#fcfdfe] text-slate-900 font-['Inter'] selection:bg-indigo-100">
      <Modal title={modalContent?.title || ''} isOpen={!!modalContent} onClose={() => setModalContent(null)}>
        {modalContent?.content}
      </Modal>

      {/* Modern Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 p-8 hidden lg:flex flex-col gap-10 sticky top-0 h-screen">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-indigo-600 w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Globe size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">VCN Network</h1>
        </div>

        <nav className="flex-1 space-y-8">
          <div>
            <p className="px-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Ecosystem</p>
            <div className="space-y-1">
              <SidebarItem id="dashboard" icon={LayoutDashboard} label="Network Hub" />
              <SidebarItem id="marketplace" icon={Briefcase} label="Marketplace" />
              <SidebarItem id="profiles" icon={Users} label="Profiles" />
            </div>
          </div>
          <div>
            <p className="px-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Operations</p>
            <div className="space-y-1">
              <SidebarItem id="actions" icon={FileCheck} label="Trust Ledger" />
              <SidebarItem id="clients" icon={Building2} label="Enterprises" />
            </div>
          </div>
          <div>
            <p className="px-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Governance</p>
            <div className="space-y-1">
              <SidebarItem id="roadmap" icon={Compass} label="Evolution Roadmap" />
              <SidebarItem id="governance" icon={ShieldCheck} label="Policy Audit" />
              <SidebarItem id="experts" icon={Star} label="Advisory Board" />
            </div>
          </div>
        </nav>

        <div className="pt-8 border-t border-slate-50">
          <SidebarItem id="docs" icon={BookOpen} label="Knowledge Hub" />
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-12 py-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span 
              onClick={() => setActiveTab('docs')}
              className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors"
            >
              VCN_PROTO / v2.4.0
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-sm font-black text-slate-800 tracking-tight">Network Administrator</span>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Global Sync Live
              </span>
            </div>
            <img src="https://i.pravatar.cc/150?u=admin" className="w-12 h-12 rounded-[1.2rem] border-2 border-white shadow-xl cursor-pointer" alt="User" onClick={() => setActiveTab('profiles')} />
          </div>
        </header>

        <div className="p-12 max-w-[1400px] mx-auto space-y-12">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Verified Nodes" value={metrics.verifiedContributors} subValue="Nodes Live" icon={Users} trend="+342" color="indigo" onClick={() => setActiveTab('profiles')} />
                <StatCard label="Network CSAT" value="4.9/5" subValue="Sentiment" icon={ThumbsUp} trend="+0.2" color="emerald" onClick={() => setActiveTab('clients')} />
                <StatCard label="Ledger Volume" value={metrics.totalArtifacts} subValue="Artifacts" icon={Layers} trend="+1.2k" color="purple" onClick={() => setActiveTab('actions')} />
                <StatCard label="Protocol Status" value="v2.4" subValue="Active Standard" icon={Activity} trend="99.9%" color="amber" onClick={() => setActiveTab('docs')} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-2xl font-black flex items-center gap-3 tracking-tighter">
                        <TrendingUp size={28} className="text-indigo-600" />
                        Collaboration Velocity
                      </h3>
                      <p className="text-slate-400 font-medium text-sm mt-1">Cross-unit verified actions per day</p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={COLLABORATION_TREND}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 11, fontWeight: 700}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 11, fontWeight: 700}} />
                        <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 800}} />
                        <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={5} dot={{r: 6, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 10, strokeWidth: 0}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white">
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Layers size={140} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                      <ShieldCheck size={28} className="text-indigo-400" />
                      {UI_TEXT.dashboard.ledgerTitle}
                    </h3>
                    <div className="space-y-6">
                      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                        <div className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-2">Protocol Weighting</div>
                        <p className="text-3xl font-black font-mono tracking-tight text-white/90">0.5P + 0.3O + 0.2I</p>
                      </div>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        The VCN Protocol intelligently balances peer sentiment with hard-delivery data to produce a tamper-proof reputation score.
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10 pt-10 border-t border-white/5 mt-10">
                    <button onClick={() => setActiveTab('docs')} className="flex items-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-widest hover:text-white transition-colors">
                      View Protocol Standards <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[3rem] p-12 shadow-2xl flex flex-col md:flex-row items-center gap-12 group">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20 backdrop-blur-md">
                    <Zap size={16} className="fill-white" /> Network Architecture Intelligence
                  </div>
                  <h2 className="text-4xl font-black text-white leading-[1.1] tracking-tighter">{UI_TEXT.dashboard.aiTitle}</h2>
                  <p className="text-xl text-indigo-100 font-medium leading-relaxed max-w-2xl opacity-90">
                    {aiInsight || UI_TEXT.dashboard.aiDesc}
                  </p>
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-white text-indigo-700 px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-4"
                  >
                    {isAnalyzing ? "Processing Architecture Data..." : "Run Strategic Audit Analysis"}
                    {!isAnalyzing && <ArrowUpRight size={20} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'marketplace' && (
            <div className="space-y-10">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{UI_TEXT.opportunities.title}</h2>
                <p className="text-xl text-slate-500 font-medium mt-2">{UI_TEXT.opportunities.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {opportunities.map(opp => (
                  <div key={opp.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:border-indigo-500 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-8">
                        <div className="bg-indigo-50 p-6 rounded-3xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Briefcase size={36} />
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-indigo-600 tracking-tighter">+{opp.rewardRep}</div>
                          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Reputation Reward</div>
                        </div>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">{opp.title}</h3>
                      <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">{opp.description}</p>
                      <div className="flex flex-wrap gap-2 mb-10">
                        {opp.requiredBadges.map(badge => (
                          <span key={badge} className="px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors">
                            Requires: {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                      Submit Qualification Artifacts
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="space-y-10">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Protocol Policies</h2>
                <p className="text-xl text-slate-500 font-medium mt-2">Active network standards and verified governance policies.</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {policies.map(p => (
                  <div key={p.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row items-center gap-10 group relative border-l-8 border-l-indigo-600">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{p.governanceLevel} Scope</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol: {p.status}</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{p.title}</h3>
                      <p className="text-slate-500 font-medium leading-relaxed">{p.impact}</p>
                    </div>
                    <button className="shrink-0 bg-slate-50 text-slate-400 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                      Review Audit Log
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Evolution Roadmap</h2>
                <p className="text-xl text-slate-500 font-medium">Strategic milestones for VCN protocol decentralization.</p>
              </div>
              <div className="space-y-8 relative">
                <div className="absolute left-12 top-0 bottom-0 w-1.5 bg-slate-50 -z-10" />
                {milestones.map(m => (
                  <div key={m.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 flex gap-10 shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-24 h-24 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                      <Star size={40} className={m.status === 'Live' ? '' : 'animate-spin-slow'} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{m.title}</h4>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          m.status === 'Live' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium text-lg leading-relaxed">{m.description}</p>
                      <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden mt-6">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${m.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {users.map(user => (
                <UserCard key={user.id} user={user} artifacts={artifacts.filter(a => a.userId === user.id)} onViewPortfolio={() => setModalContent({
                  title: `${user.name} - Network Reputation Graph`,
                  content: (
                    <div className="space-y-10">
                      <div className="p-10 bg-indigo-600 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl shadow-indigo-100">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Social Capital Balance</p>
                          <span className="text-7xl font-black tracking-tighter leading-none">{user.reputation}</span>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-xl font-black text-slate-900 tracking-tight border-b pb-4">Contribution Ledger</h4>
                        {artifacts.filter(a => a.userId === user.id).map(a => (
                          <div key={a.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center hover:bg-white hover:border-indigo-200 transition-all">
                            <div>
                              <p className="font-bold text-slate-800 text-lg">{a.title}</p>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{a.timestamp}</span>
                            </div>
                            <span className="font-black text-emerald-500 text-sm">+{a.scoreContribution}PTS</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })} />
              ))}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="space-y-4">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight flex items-center gap-6">
                  <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-100">
                    <Book size={40} />
                  </div>
                  Knowledge Hub
                </h2>
                <p className="text-2xl text-slate-400 font-medium max-w-2xl">{UI_TEXT.docs.subtitle}</p>
              </div>

              {/* Enhanced Sub-Nav for Docs */}
              <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                {DOC_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveDocCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
                      activeDocCategory === cat.id 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    <Layers size={18} />
                    {cat.title}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-12 mt-8">
                {activeDocs.map(s => (
                  <section 
                    key={s.id} 
                    className="bg-white rounded-[3.5rem] p-12 lg:p-16 shadow-2xl shadow-slate-100 border border-slate-50 relative overflow-hidden group hover:border-indigo-500/30 transition-all"
                  >
                    <div className="absolute top-0 left-0 w-3 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-10 tracking-tighter leading-tight">{s.title}</h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 text-xl font-medium leading-loose whitespace-pre-line">
                        {s.content}
                      </p>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Global Trust Ledger</h2>
                  <p className="text-xl text-slate-500 font-medium">Verify cross-org artifacts to finalize reputation scores</p>
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Artifact Detail</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Node</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {artifacts.map(a => (
                      <tr key={a.id} className="hover:bg-indigo-50/20 transition-all group">
                        <td className="px-10 py-8">
                          <span className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{a.title}</span>
                          <p className="text-[10px] font-black text-slate-300 uppercase mt-1 tracking-widest">{a.timestamp}</p>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <img src={users.find(u => u.id === a.userId)?.avatar} className="w-10 h-10 rounded-2xl" />
                            <span className="font-bold text-slate-700">{users.find(u => u.id === a.userId)?.name}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          {a.verified ? (
                            <button onClick={() => toggleVerification(a.id)} className="flex items-center gap-3 text-emerald-600 font-black text-xs uppercase tracking-widest">
                              <ShieldCheck size={20} /> Verified Sync
                            </button>
                          ) : (
                            <button onClick={() => toggleVerification(a.id)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100">
                              Execute Protocol Sync
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-10">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Strategic Enterprises</h2>
                <p className="text-xl text-slate-500 font-medium mt-2">Active enterprise nodes validating the VCN professional ecosystem.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {clients.map(client => (
                  <div key={client.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl transition-all group flex items-start gap-8 cursor-pointer" onClick={() => setModalContent({
                    title: `Enterprise Node: ${client.name}`,
                    content: (
                      <div className="space-y-8">
                        <div className="flex items-center gap-6">
                           <img src={client.logo} className="w-16 h-16 object-contain" />
                           <h4 className="text-3xl font-black">{client.name}</h4>
                        </div>
                        <p className="text-slate-500 font-medium leading-loose">This strategic partner is actively utilizing VCN verified artifacts for internal project auditing and resource allocation.</p>
                      </div>
                    )
                  })}>
                    <div className="shrink-0 bg-slate-50 p-6 rounded-3xl border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <img src={client.logo} className="w-16 h-16 object-contain grayscale group-hover:grayscale-0 transition-all" alt={client.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-black text-slate-900 mb-2">{client.name}</h4>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{client.industry}</p>
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full mt-4 inline-block">{client.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'experts' && (
            <div className="space-y-10">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Advisory Board</h2>
                <p className="text-xl text-slate-500 font-medium mt-2">Specialized experts overseeing protocol health and global consensus standards.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {advisors.map(adv => (
                  <div key={adv.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl transition-all group flex items-start gap-8">
                    <img src={adv.avatar} className="w-24 h-24 rounded-[2rem] shadow-xl grayscale group-hover:grayscale-0 transition-all" />
                    <div className="flex-1 space-y-4">
                      <h4 className="text-2xl font-black text-slate-900">{adv.name}</h4>
                      <p className="text-slate-600 font-medium italic leading-relaxed text-lg">"{adv.feedback}"</p>
                      <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2" onClick={() => setActiveTab('docs')}>
                         Audit Protocol Notes <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <button className="fixed bottom-12 right-12 w-20 h-20 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-100 flex items-center justify-center group hover:scale-110 active:scale-95 transition-all z-40" onClick={() => setActiveTab('docs')}>
        <Layers size={32} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>
    </div>
  );
};

/* StatCard Helper */
const StatCard = ({ label, value, subValue, icon: Icon, trend, color, onClick }: any) => {
  const themes: any = {
    indigo: 'from-indigo-600/5 to-indigo-600/10 text-indigo-600',
    emerald: 'from-emerald-600/5 to-emerald-600/10 text-emerald-600',
    purple: 'from-purple-600/5 to-purple-600/10 text-purple-600',
    amber: 'from-amber-600/5 to-amber-600/10 text-amber-600',
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-10">
        <div className={`p-5 rounded-3xl bg-gradient-to-br ${themes[color]} group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={28} />
        </div>
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest">
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">{label}</h4>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
          <span className="text-xs font-bold text-slate-400">{subValue}</span>
        </div>
      </div>
    </div>
  );
};

/* UserCard Helper */
const UserCard = ({ user, artifacts, onViewPortfolio }: any) => {
  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
      <div className="flex items-center gap-8 mb-10">
        <div className="relative">
          <img src={user.avatar} className="w-24 h-24 rounded-[2.5rem] border-4 border-white shadow-2xl group-hover:rotate-6 transition-transform duration-500" alt={user.name} />
          <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg">
            <ShieldCheck size={16} />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{user.name}</h3>
          <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 mt-2 inline-block">
            {user.role} Node
          </span>
        </div>
        <div className="ml-auto text-right">
          <div className="text-6xl font-black text-indigo-600 tracking-tighter leading-none">{user.reputation}</div>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Capital</div>
        </div>
      </div>
      <button 
        onClick={onViewPortfolio}
        className="w-full bg-slate-50 text-slate-800 py-6 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-sm"
      >
        Audit Node Artifacts <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default App;
