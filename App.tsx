
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  ChevronRight, 
  Zap, 
  Activity,
  MessageSquare,
  Globe,
  Star,
  Layers,
  Sparkles,
  ArrowUpRight,
  X,
  BookOpen,
  Building2,
  ThumbsUp,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Compass,
  Book,
  Mic,
  MicOff,
  Video,
  Image as ImageIcon,
  Send,
  Loader2,
  MapPin,
  Search as SearchIcon,
  Brain,
  Upload,
  Trophy,
  Network,
  Cpu,
  Target,
  CircleDot
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";

import { 
  INITIAL_USERS, 
  INITIAL_ARTIFACTS, 
  NETWORK_MILESTONES, 
  MOCK_METRICS, 
  COLLABORATION_TREND,
  GOVERNANCE_POLICIES,
  ADVISOR_REVIEWS,
  OPPORTUNITIES,
  INITIAL_CLIENTS
} from './constants';
import { UI_TEXT, DOC_SECTIONS, DOC_CATEGORIES } from './content';
import { User, Artifact, NetworkMilestone, KPIMetrics, GovernancePolicy, AdvisorReview, Opportunity, Client } from './types';
import { analyzePilotPerformance } from './services/geminiService';

// --- Utility Functions ---
const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const encodeBase64 = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- Components ---

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profiles' | 'actions' | 'roadmap' | 'governance' | 'experts' | 'marketplace' | 'docs' | 'clients' | 'intelligence'>('dashboard');
  const [activeDocCategory, setActiveDocCategory] = useState<string>(DOC_CATEGORIES[0].id);
  
  // App Data
  const [users] = useState<User[]>(INITIAL_USERS);
  const [artifacts, setArtifacts] = useState<Artifact[]>(INITIAL_ARTIFACTS);
  const [milestones] = useState<NetworkMilestone[]>(NETWORK_MILESTONES);
  const [policies] = useState<GovernancePolicy[]>(GOVERNANCE_POLICIES);
  const [advisors] = useState<AdvisorReview[]>(ADVISOR_REVIEWS);
  const [opportunities] = useState<Opportunity[]>(OPPORTUNITIES);
  const [clients] = useState<Client[]>(INITIAL_CLIENTS);
  const [metrics] = useState<KPIMetrics>(MOCK_METRICS);
  const [modalContent, setModalContent] = useState<{ title: string, content: React.ReactNode } | null>(null);

  // AI & Intelligence State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string, type?: 'status' | 'info' | 'error', grounding?: any[]}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [useMaps, setUseMaps] = useState(false);

  // Live API Voice State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Generation States
  const [genPrompt, setGenPrompt] = useState('');
  const [genSize, setGenSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [genAspectRatio, setGenAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  // --- Handlers ---

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzePilotPerformance(metrics, artifacts);
    setAiInsight(result || "Analysis offline.");
    setIsAnalyzing(false);
  };

  const toggleVerification = (id: string) => {
    setArtifacts(prev => prev.map(a => a.id === id ? { ...a, verified: !a.verified } : a));
  };

  // --- VCN Assistant (Chat) ---
  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatLoading(true);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-3-pro-preview';
    
    const config: any = {
      tools: [],
    };

    if (useSearch) config.tools.push({ googleSearch: {} });
    if (useMaps) {
      config.tools.push({ googleMaps: {} });
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        config.toolConfig = {
          retrievalConfig: { latLng: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } }
        };
      } catch (e) { console.warn("Geo blocked, using global context"); }
    }

    if (thinkingMode) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: msg,
        config
      });

      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      setChatMessages(prev => [...prev, { role: 'model', text: response.text || "No response", grounding }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Service error: " + (e as any).message, type: 'error' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Image Generation (Gemini 3 Pro) ---
  const generateImage = async () => {
    if (!genPrompt.trim()) return;
    setIsGenerating(true);
    try {
      if (!(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: genPrompt }] },
        config: {
          imageConfig: { aspectRatio: genAspectRatio, imageSize: genSize }
        }
      });
      const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imgPart?.inlineData) {
        setGeneratedMedia({ type: 'image', url: `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}` });
      }
    } catch (e) {
      console.error(e);
      alert("Gen failed: " + (e as any).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Video Generation (Veo) ---
  const generateVideo = async () => {
    if (!genPrompt.trim() && !uploadFile) return;
    setIsGenerating(true);
    try {
      if (!(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let config: any = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: genAspectRatio === '1:1' ? '16:9' : genAspectRatio
      };

      const payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: genPrompt,
        config
      };

      if (uploadFile) {
        payload.image = {
          imageBytes: await blobToBase64(uploadFile),
          mimeType: uploadFile.type
        };
      }

      let operation = await ai.models.generateVideos(payload);
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      setGeneratedMedia({ type: 'video', url: URL.createObjectURL(blob) });
    } catch (e) {
      console.error(e);
      alert("Veo failed: " + (e as any).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Image Edit (Flash Image) ---
  const editImage = async () => {
    if (!uploadFile || !editPrompt) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: await blobToBase64(uploadFile), mimeType: uploadFile.type } },
            { text: editPrompt }
          ]
        }
      });
      const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imgPart?.inlineData) {
        setGeneratedMedia({ type: 'image', url: `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}` });
      }
    } catch (e) {
      console.error(e);
      alert("Edit failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Live Voice API ---
  const startLive = async () => {
    setIsLiveActive(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outCtx;

    const session = await ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const inCtx = new AudioContext({ sampleRate: 16000 });
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
              session.sendRealtimeInput({ media: { data: encodeBase64(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } });
            };
            source.connect(processor);
            processor.connect(inCtx.destination);
          });
        },
        onmessage: async (msg: LiveServerMessage) => {
          const audioB64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioB64) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            const buffer = await decodeAudioData(decodeBase64(audioB64), outCtx, 24000, 1);
            const source = outCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outCtx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            audioSourcesRef.current.add(source);
            source.onended = () => audioSourcesRef.current.delete(source);
          }
          if (msg.serverContent?.interrupted) {
            audioSourcesRef.current.forEach(s => s.stop());
            audioSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsLiveActive(false),
        onerror: (e) => { console.error(e); setIsLiveActive(false); }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: "You are the VCN Strategic Voice Assistant. Help the user navigate decentralized PMO tasks with professional clarity."
      }
    });
    liveSessionRef.current = session;
  };

  const stopLive = () => {
    liveSessionRef.current?.close();
    setIsLiveActive(false);
  };

  // --- UI Helpers ---
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
              <SidebarItem id="intelligence" icon={Sparkles} label="VCN Intelligence" />
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

      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-12 py-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span onClick={() => setActiveTab('docs')} className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 cursor-pointer">
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
            <img src="https://i.pravatar.cc/150?u=admin" className="w-12 h-12 rounded-[1.2rem] border-2 border-white shadow-xl cursor-pointer" alt="User" />
          </div>
        </header>

        <div className="p-12 max-w-[1400px] mx-auto space-y-12 pb-32">
          {activeTab === 'dashboard' && (
            <>
              {/* Dynamic Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Verified Nodes" value={metrics.verifiedContributors} subValue="Nodes Live" icon={Users} trend="+342" color="indigo" onClick={() => setActiveTab('profiles')} />
                <StatCard label="Network CSAT" value="4.9/5" subValue="Sentiment" icon={ThumbsUp} trend="+0.2" color="emerald" onClick={() => setActiveTab('clients')} />
                <StatCard label="Ledger Volume" value={metrics.totalArtifacts} subValue="Artifacts" icon={Layers} trend="+1.2k" color="purple" onClick={() => setActiveTab('actions')} />
                <StatCard label="Protocol Status" value="v2.4" subValue="Active Standard" icon={Activity} trend="99.9%" color="amber" onClick={() => setActiveTab('docs')} />
              </div>

              {/* Advanced Visualization Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Main Collaboration Chart */}
                <div className="xl:col-span-8 bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 translate-x-12"><TrendingUp size={300} /></div>
                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <div>
                      <h3 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
                        <TrendingUp size={32} className="text-indigo-600" />
                        Collaboration Velocity
                      </h3>
                      <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest">Global Network Activity Real-time Stream</p>
                    </div>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={COLLABORATION_TREND}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                        <Tooltip 
                           contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 800, padding: '20px'}} 
                           itemStyle={{color: '#4f46e5'}}
                        />
                        <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Reputation Leaderboard Visual */}
                <div className="xl:col-span-4 flex flex-col gap-10">
                  <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden text-white flex-1 flex flex-col">
                    <div className="absolute top-0 right-0 p-10 opacity-10"><Trophy size={140} /></div>
                    <div className="relative z-10 mb-8">
                       <h3 className="text-2xl font-black flex items-center gap-3 mb-2">
                        <Star size={28} className="text-amber-400" />
                        Network Top Contributors
                      </h3>
                      <p className="text-slate-400 text-sm font-medium">Nodes with highest verified impact scores</p>
                    </div>
                    
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 no-scrollbar">
                      {users.sort((a,b) => b.reputation - a.reputation).slice(0, 3).map((u, i) => (
                        <div key={u.id} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group">
                           <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm">#{i+1}</div>
                           <img src={u.avatar} className="w-12 h-12 rounded-2xl border-2 border-indigo-500/30" />
                           <div className="flex-1">
                              <h4 className="font-black text-sm">{u.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.role} Node</p>
                           </div>
                           <div className="text-right">
                              <span className="text-lg font-black text-indigo-400 tracking-tight">{u.reputation}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('profiles')} className="mt-8 bg-white/10 hover:bg-white/20 text-white w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">View All Global Nodes</button>
                  </div>

                  <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute bottom-0 right-0 p-6 opacity-10"><Cpu size={120} /></div>
                     <h3 className="text-xl font-black mb-4 flex items-center gap-3">
                        <ShieldCheck size={24} /> 
                        Protocol Stability
                     </h3>
                     <div className="flex items-end gap-6">
                        <div className="text-6xl font-black tracking-tighter leading-none">99.9%</div>
                        <div className="text-indigo-100 font-bold text-xs uppercase tracking-widest pb-1 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Consensus Verified
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Network Graph Visual / Middle Tier */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                 <div className="lg:col-span-5 bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent pointer-events-none" />
                    <div className="relative z-10 text-center mb-10">
                       <h3 className="text-2xl font-black tracking-tighter mb-2">Network Cluster Visualization</h3>
                       <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Strategic Node Distribution Map</p>
                    </div>
                    {/* Visual Cluster Representation */}
                    <div className="relative w-64 h-64 mb-10 group-hover:scale-105 transition-transform duration-700">
                       <div className="absolute inset-0 bg-indigo-600/5 rounded-full animate-ping duration-[3s]" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-200 flex items-center justify-center text-white relative z-20">
                             <Brain size={48} />
                          </div>
                          {/* Floating Orbit Nodes */}
                          {[0, 72, 144, 216, 288].map((deg, i) => (
                             <div key={i} className="absolute w-12 h-12 bg-white border border-slate-100 rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 animate-float" style={{ transform: `rotate(${deg}deg) translate(100px) rotate(-${deg}deg)`, animationDelay: `${i * 0.5}s` }}>
                                <CircleDot size={20} />
                             </div>
                          ))}
                          {/* Connection Lines (Simulated with simple CSS) */}
                          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 256 256">
                             {[0, 72, 144, 216, 288].map((deg, i) => {
                               const r = 100;
                               const cx = 128 + r * Math.cos((deg * Math.PI) / 180);
                               const cy = 128 + r * Math.sin((deg * Math.PI) / 180);
                               return <line key={i} x1="128" y1="128" x2={cx} y2={cy} stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />;
                             })}
                          </svg>
                       </div>
                    </div>
                    <div className="flex gap-10 w-full border-t border-slate-50 pt-10 px-4">
                       <div className="flex-1 text-center">
                          <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">12.4k</p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Active Links</p>
                       </div>
                       <div className="flex-1 text-center">
                          <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">8.2</p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Link Density</p>
                       </div>
                    </div>
                 </div>

                 <div className="lg:col-span-7 bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12"><ShieldCheck size={200} /></div>
                    <div className="relative z-10 space-y-8">
                       <div className="inline-flex items-center gap-3 bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                          <Target size={16} /> Protocol Engine v2.4
                       </div>
                       <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                          Verified Value Propagation Consensus.
                       </h2>
                       <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                          The VCN Protocol intelligently weights peer-verified deliverables against organizational outcomes to dynamically calculate real-time reputation.
                       </p>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all">
                             <div className="text-indigo-600 font-black mb-2 flex items-center gap-2">0.5P <ChevronRight size={14}/></div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Peer Endorsement Weight</p>
                          </div>
                          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all">
                             <div className="text-indigo-600 font-black mb-2 flex items-center gap-2">0.3O <ChevronRight size={14}/></div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Outcome Delivery Weight</p>
                          </div>
                          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all">
                             <div className="text-indigo-600 font-black mb-2 flex items-center gap-2">0.2I <ChevronRight size={14}/></div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Initiative Velocity Weight</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* AI Insight Bar */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[4rem] p-16 shadow-2xl flex flex-col md:flex-row items-center gap-16 group relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                   <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]" />
                </div>
                <div className="flex-1 space-y-8 relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20 backdrop-blur-md">
                    <Zap size={18} className="fill-white" /> Network Architecture Intelligence
                  </div>
                  <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter">{UI_TEXT.dashboard.aiTitle}</h2>
                  <p className="text-2xl text-indigo-100 font-medium leading-relaxed max-w-3xl opacity-90">
                    {aiInsight || UI_TEXT.dashboard.aiDesc}
                  </p>
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-white text-indigo-700 px-12 py-6 rounded-[1.8rem] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-4 group"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
                    Generate Strategic Protocol Audit
                  </button>
                </div>
                <div className="hidden xl:block shrink-0 relative z-10">
                  <div className="w-72 h-72 rounded-[4rem] border-[12px] border-white/10 flex items-center justify-center relative shadow-2xl backdrop-blur-sm">
                    <div className="absolute inset-0 border-[12px] border-white/40 rounded-[4rem] border-t-transparent animate-spin duration-[4s]" />
                    <Brain size={100} className="text-white opacity-40 animate-pulse" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Other tabs follow the previously defined logic but now within the refreshed main container... */}
          {activeTab === 'intelligence' && (
            <div className="space-y-12 animate-in fade-in duration-700 pb-20">
              <header className="space-y-4">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight flex items-center gap-6">
                  <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-100">
                    <Zap size={40} />
                  </div>
                  VCN Intelligence Suite
                </h2>
                <p className="text-2xl text-slate-400 font-medium">Advanced multimodal neural agents for strategic operations.</p>
              </header>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* VCN Assistant Column */}
                <div className="xl:col-span-7 space-y-10">
                  <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col h-[750px] overflow-hidden relative group">
                    <div className="p-10 border-b flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100"><MessageSquare size={24} /></div>
                        <div>
                          <h3 className="font-black text-xl tracking-tight leading-none">Strategic AI Assistant</h3>
                          <div className="flex gap-4 mt-3">
                             <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors">
                               <input type="checkbox" checked={thinkingMode} onChange={e => setThinkingMode(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" /> Deep Thinking
                             </label>
                             <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors">
                               <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" /> Search
                             </label>
                             <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors">
                               <input type="checkbox" checked={useMaps} onChange={e => setUseMaps(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" /> Maps
                             </label>
                          </div>
                        </div>
                      </div>
                      <button onClick={isLiveActive ? stopLive : startLive} className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-lg ${isLiveActive ? 'bg-red-500 text-white animate-pulse shadow-red-100' : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 shadow-indigo-50'}`}>
                        {isLiveActive ? <><MicOff size={20} /> End Live Sync</> : <><Mic size={20} /> Start Live Voice</>}
                      </button>
                    </div>

                    <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-slate-50/20">
                      {chatMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-6">
                          <div className="p-10 bg-slate-100 rounded-[3rem] border border-slate-200">
                             <Brain size={80} className="text-indigo-400" />
                          </div>
                          <p className="text-xl font-black text-slate-400 uppercase tracking-widest max-w-sm">VCN Neural Core Online. Waiting for Strategic Prompt.</p>
                        </div>
                      )}
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                          <div className={`max-w-[85%] rounded-[2.5rem] p-8 shadow-xl border ${m.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'}`}>
                            <p className="text-xl font-medium leading-relaxed">{m.text}</p>
                            {m.grounding && (
                              <div className="mt-6 pt-6 border-t border-slate-100/20 flex flex-wrap gap-3">
                                {m.grounding.map((chunk: any, ci: number) => {
                                  const uri = chunk.web?.uri || chunk.maps?.uri;
                                  const title = chunk.web?.title || chunk.maps?.title;
                                  if (!uri) return null;
                                  return (
                                    <a key={ci} href={uri} target="_blank" className="bg-slate-50/10 hover:bg-white/20 text-[10px] font-black text-indigo-400 px-4 py-2.5 rounded-xl border border-slate-100/10 flex items-center gap-2 transition-all">
                                      {chunk.maps ? <MapPin size={14} /> : <SearchIcon size={14} />} {title || "Reference Source"}
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 flex items-center gap-4 shadow-xl">
                            <Loader2 size={24} className="animate-spin text-indigo-600" />
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Processing Core Logic...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-10 bg-white border-t border-slate-100 flex gap-6">
                      <input 
                        value={chatInput} 
                        onChange={e => setChatInput(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Inquire about VCN protocol standards, network health, or strategic node routing..." 
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-xl font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                      />
                      <button onClick={sendMessage} disabled={isChatLoading} className="bg-indigo-600 text-white w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                        <Send size={28} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generative Studio Column */}
                <div className="xl:col-span-5 space-y-10">
                  <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-12 space-y-10 group hover:border-indigo-500/30 transition-all">
                    <header className="flex items-center gap-5">
                      <div className="bg-indigo-50 p-4 rounded-3xl text-indigo-600 shadow-lg shadow-indigo-50"><Sparkles size={32} /></div>
                      <div>
                        <h3 className="text-3xl font-black tracking-tight leading-none">Generative Engine</h3>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Neural Artifact Creation Studio</p>
                      </div>
                    </header>

                    <div className="space-y-8">
                       <textarea 
                        value={genPrompt} 
                        onChange={e => setGenPrompt(e.target.value)}
                        placeholder="Define the strategic vision or professional artifact to render..." 
                        className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 h-40 text-xl font-medium outline-none focus:border-indigo-500 focus:bg-white resize-none transition-all shadow-inner"
                       />

                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Output Fidelity</label>
                             <select value={genSize} onChange={e => setGenSize(e.target.value as any)} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-[1.5rem] font-bold text-sm shadow-sm outline-none">
                               <option value="1K">Standard High (1K)</option>
                               <option value="2K">Retina Detail (2K)</option>
                               <option value="4K">Strategic Asset (4K)</option>
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Aspect Protocol</label>
                             <select value={genAspectRatio} onChange={e => setGenAspectRatio(e.target.value as any)} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-[1.5rem] font-bold text-sm shadow-sm outline-none">
                               <option value="1:1">Standard (1:1)</option>
                               <option value="16:9">Widescreen (16:9)</option>
                               <option value="9:16">Portrait (9:16)</option>
                               <option value="4:3">Classic (4:3)</option>
                             </select>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="flex gap-6">
                             <button onClick={generateImage} disabled={isGenerating} className="flex-1 bg-indigo-600 text-white py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group">
                               {isGenerating ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} className="group-hover:rotate-6 transition-transform" />} Render Image
                             </button>
                             <button onClick={generateVideo} disabled={isGenerating} className="flex-1 bg-slate-900 text-white py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group">
                               {isGenerating ? <Loader2 className="animate-spin" /> : <Video size={20} className="group-hover:rotate-6 transition-transform" />} Render Video
                             </button>
                          </div>
                          
                          <div className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-dashed border-slate-200 space-y-4">
                             <label className="flex items-center gap-4 bg-white border border-slate-100 px-8 py-5 rounded-[1.5rem] cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm">
                                <Upload size={24} className="text-indigo-600" />
                                <div className="flex-1 overflow-hidden">
                                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Base Reference</p>
                                   <span className="text-sm font-bold text-slate-600 truncate block">{uploadFile ? uploadFile.name : 'Upload Source Media'}</span>
                                </div>
                                <input type="file" className="hidden" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                             </label>
                             
                             {uploadFile && (
                                <div className="flex gap-4 animate-in slide-in-from-top-4 duration-300">
                                   <input value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="Neural transformation prompt..." className="flex-1 bg-white border border-slate-100 px-6 py-4 rounded-[1.2rem] text-sm font-bold outline-none shadow-sm focus:border-indigo-500 transition-colors" />
                                   <button onClick={editImage} disabled={isGenerating} className="bg-indigo-600 text-white px-8 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center justify-center">
                                      {isGenerating ? <Loader2 size={16} className="animate-spin" /> : 'Execute'}
                                   </button>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>

                    {generatedMedia && (
                      <div className="mt-10 border-t border-slate-100 pt-10 space-y-6 animate-in fade-in zoom-in duration-700">
                        <div className="bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl relative group border-4 border-white ring-1 ring-slate-100">
                           {generatedMedia.type === 'image' ? (
                             <img src={generatedMedia.url} className="w-full h-auto" />
                           ) : (
                             <video src={generatedMedia.url} controls className="w-full" autoPlay loop />
                           )}
                           <button onClick={() => setGeneratedMedia(null)} className="absolute top-6 right-6 bg-slate-900/40 backdrop-blur-xl p-3 rounded-full text-white hover:bg-slate-900/60 transition-colors opacity-0 group-hover:opacity-100">
                             <X size={24} />
                           </button>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol Artifact Sync Successful</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Docs, Profiles, Actions, etc. remain structurally the same but benefit from the new main-layout paddings and rounded styles */}
          {activeTab === 'profiles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {users.map(user => (
                <UserCard key={user.id} user={user} artifacts={artifacts.filter(a => a.userId === user.id)} onViewPortfolio={() => setModalContent({
                  title: `${user.name} - Network Reputation Graph`,
                  content: (
                    <div className="space-y-10">
                      <div className="p-10 bg-indigo-600 rounded-[3rem] text-white flex justify-between items-center shadow-2xl shadow-indigo-100">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Social Capital Balance</p>
                          <span className="text-7xl font-black tracking-tighter leading-none">{user.reputation}</span>
                        </div>
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

              <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                {DOC_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveDocCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-3 px-10 py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest border transition-all ${
                      activeDocCategory === cat.id 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl shadow-indigo-100' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    <Layers size={20} />
                    {cat.title}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-12 mt-8">
                {activeDocs.map(s => (
                  <section key={s.id} className="bg-white rounded-[4rem] p-16 shadow-2xl shadow-slate-100 border border-slate-50 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                    <div className="absolute top-0 left-0 w-3 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-5xl font-black text-slate-900 mb-10 tracking-tighter leading-tight">{s.title}</h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 text-2xl font-medium leading-loose whitespace-pre-line">
                        {s.content}
                      </p>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
             <div className="space-y-10">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight flex items-center gap-6">
                  <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-100">
                    <ShieldCheck size={40} />
                  </div>
                  Global Trust Ledger
                </h2>
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-4">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Artifact Detail</th>
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Node</th>
                        <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Sync</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {artifacts.map(a => (
                        <tr key={a.id} className="hover:bg-indigo-50/20 transition-all group">
                          <td className="px-10 py-10">
                            <span className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{a.title}</span>
                            <p className="text-[10px] font-black text-slate-300 uppercase mt-2 tracking-[0.2em]">{a.timestamp}</p>
                          </td>
                          <td className="px-10 py-10">
                            <div className="flex items-center gap-5">
                              <img src={users.find(u => u.id === a.userId)?.avatar} className="w-14 h-14 rounded-2xl border-2 border-white shadow-xl" />
                              <span className="font-black text-slate-700 tracking-tight text-lg">{users.find(u => u.id === a.userId)?.name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-10">
                            {a.verified ? (
                              <div className="flex items-center gap-3 text-emerald-600 font-black text-xs uppercase tracking-widest">
                                <ShieldCheck size={24} /> Verified Protocol Sync
                              </div>
                            ) : (
                              <button onClick={() => toggleVerification(a.id)} className="bg-indigo-600 text-white px-10 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:scale-[1.05] transition-all">
                                Execute Consensus Sync
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
        </div>
      </main>

      {/* Product Global Floating Action Button */}
      <div className="fixed bottom-12 right-12 z-50 flex flex-col gap-6 items-end">
        {activeTab !== 'intelligence' && (
           <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] p-4 flex gap-4 animate-in slide-in-from-right-10 duration-500">
             <button onClick={() => setActiveTab('intelligence')} className="bg-indigo-600 text-white w-20 h-20 rounded-[2rem] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-indigo-100 group relative">
                <Sparkles size={32} />
                <div className="absolute -top-12 right-0 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">VCN Intel</div>
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

/* StatCard Helper */
const StatCard = ({ label, value, subValue, icon: Icon, trend, color, onClick }: any) => {
  const themes: any = {
    indigo: 'from-indigo-600/5 to-indigo-600/10 text-indigo-600 shadow-indigo-100/20',
    emerald: 'from-emerald-600/5 to-emerald-600/10 text-emerald-600 shadow-emerald-100/20',
    purple: 'from-purple-600/5 to-purple-600/10 text-purple-600 shadow-purple-100/20',
    amber: 'from-amber-600/5 to-amber-600/10 text-amber-600 shadow-amber-100/20',
  };

  return (
    <div 
      onClick={onClick} 
      className="bg-white border border-slate-100 p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-12">
        <div className={`p-6 rounded-[2rem] bg-gradient-to-br ${themes[color] || themes.indigo} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
          <Icon size={32} />
        </div>
        <div className="flex flex-col items-end gap-1">
           <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">
             {trend}
           </span>
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3">{label}</h4>
        <div className="flex items-baseline gap-4">
          <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{subValue}</span>
        </div>
      </div>
    </div>
  );
};

/* UserCard Helper */
const UserCard = ({ user, artifacts, onViewPortfolio }: any) => {
  return (
    <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
      <div className="flex items-center gap-10 mb-12">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
          <img src={user.avatar} className="w-32 h-32 rounded-[3rem] border-4 border-white shadow-2xl transition-transform duration-700 relative z-10" alt={user.name} />
          <div className="absolute -bottom-4 -right-4 bg-indigo-600 text-white p-4 rounded-[1.5rem] shadow-2xl z-20 border-4 border-white">
            <ShieldCheck size={24} />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{user.name}</h3>
          <span className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 mt-4 inline-block">
            {user.role} Architecture Node
          </span>
        </div>
        <div className="text-right">
          <div className="text-7xl font-black text-indigo-600 tracking-tighter leading-none">{user.reputation}</div>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-3">Rep Capital</div>
        </div>
      </div>
      <button 
        onClick={onViewPortfolio} 
        className="w-full bg-slate-50 text-slate-800 py-8 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-4 shadow-sm group/btn"
      >
        Audit Node Value Artifacts <ChevronRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
      </button>
    </div>
  );
};

export default App;
