import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Download, 
  Search, 
  Settings, 
  Eye, 
  Clock, 
  Plus, 
  Trash, 
  ExternalLink, 
  User, 
  Sliders, 
  Activity, 
  Check, 
  RotateCcw, 
  MousePointerClick, 
  Flame, 
  Gamepad2, 
  Cpu, 
  Film,
  Menu,
  Bell,
  Video,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORY_PRESETS } from './data/presets';
import { VideoItem, ThemeType, RedirectType, AdminSettings } from './types';

export default function App() {
  // --- Admin State & Storage ---
  const [settings, setSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('vlp_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      adUrl: 'https://www.google.com',
      redirectType: 'global',
      selectedTheme: 'youtube',
      pageTitle: 'YouTube Premium Portal',
      selectedCategory: 'gaming'
    };
  });

  // Load custom videos array or default to preset based on category
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('vlp_videos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [...CATEGORY_PRESETS[settings.selectedCategory]];
  });

  // Track clicks count
  const [clickCount, setClickCount] = useState<number>(() => {
    const saved = localStorage.getItem('vlp_click_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Stats Breakdown: track clicks per item ID
  const [statsBreakdown, setStatsBreakdown] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('vlp_stats_breakdown');
    return saved ? JSON.parse(saved) : {};
  });

  // UI States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const toggleAdminPanel = () => {
    if (isAdminOpen) {
      setIsAdminOpen(false);
      triggerToast('🔒 অ্যাডমিন প্যানেল বন্ধ করা হয়েছে');
    } else {
      setShowPasswordPrompt(true);
      setPasswordInput('');
    }
  };

  const handleVerifyPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === '362310') {
      setIsAdminOpen(true);
      setShowPasswordPrompt(false);
      setPasswordInput('');
      triggerToast('🔓 অ্যাডমিন প্যানেল খোলা হয়েছে!');
    } else {
      triggerToast('❌ ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
    }
  };
  
  // Custom video creation state
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newViews, setNewViews] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('');

  // Save settings when modified
  useEffect(() => {
    localStorage.setItem('vlp_settings', JSON.stringify(settings));
  }, [settings]);

  // Save videos when modified
  useEffect(() => {
    localStorage.setItem('vlp_videos', JSON.stringify(videos));
  }, [videos]);

  // Save click counts
  useEffect(() => {
    localStorage.setItem('vlp_click_count', clickCount.toString());
  }, [clickCount]);

  useEffect(() => {
    localStorage.setItem('vlp_stats_breakdown', JSON.stringify(statsBreakdown));
  }, [statsBreakdown]);

  // Trigger category changes
  const handleCategoryChange = (cat: 'movies' | 'gaming' | 'software' | 'viral' | 'custom') => {
    setSettings(prev => ({ ...prev, selectedCategory: cat }));
    if (cat === 'custom') {
      // Keep existing custom videos or provide a starting template
      if (videos.filter(v => v.category === 'custom').length === 0) {
        setVideos([
          {
            id: 'c1',
            title: 'Your Custom Premium Video 1 - Watch Now 4K BD',
            channelName: 'My Premium Network',
            channelLogo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=80',
            views: '990K views',
            timeAgo: 'Just now',
            duration: '10:00',
            thumbnailUrl: 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=640&h=360&fit=crop&q=80',
            category: 'custom'
          }
        ]);
      }
    } else {
      setVideos([...CATEGORY_PRESETS[cat]]);
    }
    triggerToast(`কোড নিস ক্যাটাগরি: ${cat.toUpperCase()} লোড হয়েছে।`);
  };

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Safe global click redirect engine
  const executeAdRedirect = (itemId?: string, actionName?: string) => {
    if (!settings.adUrl) {
      triggerToast('⚠️ দুঃখিত, কোনো অ্যাডের লিঙ্ক যুক্ত করা হয়নি!');
      return;
    }

    // Register analytics
    setClickCount(prev => prev + 1);
    if (itemId) {
      setStatsBreakdown(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1
      }));
    } else {
      setStatsBreakdown(prev => ({
        ...prev,
        'global_click': (prev['global_click'] || 0) + 1
      }));
    }

    // Log to simulated console for the creator to see
    console.log(`[Redirect System] Redirecting user to: ${settings.adUrl} on action: ${actionName || 'Global Area Click'}`);

    // Trigger redirection in new tab/window to prevent breaking workspace state
    window.open(settings.adUrl, '_blank', 'noopener,noreferrer');
  };

  // Click handler specifically for the user-view area
  const handlePortalAreaClick = (e: React.MouseEvent) => {
    // Prevent redirect if clicking on things that have their own propagation control
    // or if the element has explicit exclusions
    const target = e.target as HTMLElement;
    if (target.closest('.admin-portal-exclude')) {
      return;
    }

    // If global redirection is enabled, clicking ANYWHERE triggers redirect
    if (settings.redirectType === 'global') {
      e.preventDefault();
      e.stopPropagation();
      executeAdRedirect('global', 'Anywhere Body Click');
    }
  };

  // Add custom premium video
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: VideoItem = {
      id: 'custom_' + Date.now(),
      title: newTitle,
      channelName: newChannel || 'Verified Partner',
      channelLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&q=80',
      views: newViews || '100K views',
      timeAgo: 'Just now',
      duration: newDuration || '12:45',
      thumbnailUrl: newThumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&h=360&fit=crop&q=80',
      category: 'custom'
    };

    setVideos(prev => [newItem, ...prev]);
    setSettings(prev => ({ ...prev, selectedCategory: 'custom' }));
    
    // reset form fields
    setNewTitle('');
    setNewChannel('');
    setNewViews('');
    setNewDuration('');
    setNewThumbnail('');

    triggerToast('✅ নতুন কাস্টম থাম্বনেইল কার্ড পেজে সফলভাবে যোগ করা হয়েছে!');
  };

  // Delete video card
  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideos(prev => prev.filter(v => v.id !== id));
    triggerToast('🗑️ কার্ডটি ডিলিট করা হয়েছে!');
  };

  // Reset counters
  const handleResetStats = () => {
    setClickCount(0);
    setStatsBreakdown({});
    triggerToast('🔄 ক্লিক কাউন্টার ও অ্যানালিটিক্স রিসেট করা হয়েছে।');
  };

  // Reset to default setups
  const handleResetAllDefaults = () => {
    localStorage.clear();
    setSettings({
      adUrl: 'https://www.google.com',
      redirectType: 'global',
      selectedTheme: 'youtube',
      pageTitle: 'YouTube Premium Portal',
      selectedCategory: 'gaming'
    });
    setVideos([...CATEGORY_PRESETS['gaming']]);
    setClickCount(0);
    setStatsBreakdown({});
    triggerToast('🔄 সমস্ত অপশন এবং লিঙ্ক রিফ্রেস করে ডিফল্ট করা হয়েছে!');
  };

  return (
    <div id="vlp_root" className="min-h-screen bg-[#070708] font-sans text-gray-100 flex flex-col select-none antialiased">
      
      {/* ====================================================================== */}
      {/* 🛠️ CREATOR ADMIN CONTROL PANEL PANEL (Excluded from Global Click)      */}
      {/* ====================================================================== */}
      <div className="admin-portal-exclude relative z-50">
        {/* Admin Configurations Panel Body */}
        <AnimatePresence>
          {isAdminOpen && (
            <motion.div 
              style={{ originY: 0 }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-[#111115] border-b border-gray-800 shadow-2xl"
            >
              <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Column 1: Core Configuration */}
                <div className="lg:col-span-4 space-y-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                  <h3 className="text-sm font-bold text-gray-200 border-b border-gray-800 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="p-1 rounded bg-rose-500/10 text-rose-400"><MousePointerClick size={14} /></span>
                    অ্যাড ও ক্যাম্পেইন লিঙ্ক সেটিংস
                  </h3>

                  {/* Ad Link URL */}
                  <div>
                    <label className="block text-[11px] font-medium text-amber-400 mb-1.5 flex items-center justify-between">
                      <span>আমার অ্যাডের লিঙ্ক (Target Destination Ad URL):</span>
                      <span className="text-[10px] text-gray-500 font-mono">Real-time update</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="url"
                        placeholder="https://your-adsterra-or-propeller-link.com"
                        value={settings.adUrl}
                        onChange={(e) => setSettings(prev => ({ ...prev, adUrl: e.target.value }))}
                        className="w-full bg-[#181820] border border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-white font-mono"
                      />
                      <span className="absolute right-2.5 top-2 text-gray-500">
                        <ExternalLink size={13} />
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      💡 ইউজার যেখানেই ক্লিক করুক, তাকে সঙ্গে সঙ্গে এই অ্যাডের লিঙ্কে নিয়ে যাওয়া হবে।
                    </p>
                  </div>

                  {/* Page Title Customizer */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-300 mb-1">
                      ওয়েবসাইট হেডার নাম (Portal Top Header Page Title):
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Cinema Hub, Live Gg..."
                      value={settings.pageTitle}
                      onChange={(e) => setSettings(prev => ({ ...prev, pageTitle: e.target.value }))}
                      className="w-full bg-[#181820] border border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-white"
                    />
                  </div>

                  {/* Redirection Trigger Method */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-300 mb-1">
                      রিডাইরেক্ট মেথড (Target Redirect Mechanism):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, redirectType: 'global' }))}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                          settings.redirectType === 'global'
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-[#181820] text-gray-400 hover:text-white border border-gray-800'
                        }`}
                      >
                        গ্লোবাল ক্লিক (যেকোনো জায়গায়)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, redirectType: 'button_only' }))}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                          settings.redirectType === 'button_only'
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-[#181820] text-gray-400 hover:text-white border border-gray-800'
                        }`}
                      >
                        শুধুমাত্র ভিডিও বাটন ক্লিক
                      </button>
                    </div>
                  </div>

                  {/* Themes Customization switcher */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-300 mb-1.5">
                      ল্যান্ডিং পেজের থিম সিলেক্ট করুন (Site Visual Theme):
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['youtube', 'torrent', 'netflix'] as ThemeType[]).map((thm) => (
                        <button
                          key={thm}
                          type="button"
                          onClick={() => {
                            setSettings(prev => ({ ...prev, selectedTheme: thm }));
                            triggerToast(`ডিজাইন থিম রূপান্তর করা হয়েছে: ${thm.toUpperCase()}`);
                          }}
                          className={`py-1.5 rounded-lg text-[11px] font-semibold tracking-wide capitalize transition cursor-pointer ${
                            settings.selectedTheme === thm
                              ? 'bg-indigo-600 text-white shadow border border-indigo-400'
                              : 'bg-[#181820] text-gray-400 hover:text-white border border-gray-800'
                          }`}
                        >
                          {thm === 'youtube' ? '🍿 YouTube' : thm === 'torrent' ? '⚡ Torrent' : '🎬 Netflix'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Video Content Category & Custom Card Constructor */}
                <div className="lg:col-span-5 space-y-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <h3 className="text-sm font-bold text-gray-200 flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="p-1 rounded bg-indigo-500/10 text-indigo-400"><Film size={14} /></span>
                      ভিডিও ক্যাটাগরি ও থাম্বনেইল সেটিংস
                    </h3>
                  </div>

                  {/* Niche selector presets */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-300 mb-1.5 text-xs text-amber-500">
                      পাবলিকদের আকর্ষণের জন্য থাম্বনেইল নিস (Pre-load Video Niche):
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(['gaming', 'movies', 'software', 'viral', 'custom'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryChange(cat)}
                          className={`py-1.5 px-1 rounded-md text-[10px] font-bold text-center transition capitalize cursor-pointer ${
                            settings.selectedCategory === cat
                              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
                              : 'bg-[#181820] text-gray-400 hover:text-white border border-gray-800'
                          }`}
                        >
                          {cat === 'custom' ? '✍️ কাস্টম' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Custom Video Form */}
                  <form onSubmit={handleAddVideo} className="space-y-2 bg-[#171721] p-3 rounded-lg border border-gray-800">
                    <span className="text-[11px] font-bold text-indigo-400 block pb-1 border-b border-gray-800/60">
                      ➕ কাস্টম থাম্বনেইল কার্ড সরাসরি যুক্ত করুন:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text"
                        placeholder="ভিডিওর শিরোনাম (Video Title)"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-[#1e1e2d] border border-gray-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                      <input 
                        type="text"
                        placeholder="চ্যানেলের নাম (e.g. BD Movie Hub)"
                        value={newChannel}
                        onChange={(e) => setNewChannel(e.target.value)}
                        className="w-full bg-[#1e1e2d] border border-gray-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    {/* Thumbnail Image URL Input */}
                    <div>
                      <input 
                        type="text"
                        placeholder="থাম্বনেইল ইমেজ লিঙ্ক বসান (e.g. https://images.unsplash.com/...)"
                        value={newThumbnail}
                        onChange={(e) => setNewThumbnail(e.target.value)}
                        className="w-full bg-[#1e1e2d] border border-gray-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <input 
                        type="text"
                        placeholder="ভিউ কাউন্ট (e.g. 500K)"
                        value={newViews}
                        onChange={(e) => setNewViews(e.target.value)}
                        className="w-full bg-[#1e1e2d] border border-gray-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                      />
                      <input 
                        type="text"
                        placeholder="সময়কাল (e.g. 10:25)"
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        className="w-full bg-[#1e1e2d] border border-gray-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} />
                        যুক্ত করুন
                      </button>
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center justify-between">
                      <span>💡 থাম্বনেইল অপশনাল (ফাঁকা রাখলে অটোমেটিক ইমেজ সেট হবে)</span>
                    </div>
                  </form>

                  {/* 🖼️ ACTIVE CARD THUMBNAIL MANAGER */}
                  <div className="space-y-2 bg-[#171721] p-3 rounded-lg border border-gray-800 mt-2">
                    <span className="text-[11px] font-bold text-amber-400 block pb-1 border-b border-gray-800/60 flex items-center gap-1 justify-between">
                      <span>🖼️ রিয়েল-টাইম থাম্বনেইল ইমেজ এডিটর</span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1 rounded">সরাসরি পরিবর্তন</span>
                    </span>
                    
                    {videos.length === 0 ? (
                      <span className="text-[11px] text-gray-500 block italic">ইমেজ এডিট করার মতো কোনো ভিডিও নেই।</span>
                    ) : (
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {videos.map((vid) => (
                          <div key={vid.id} className="flex gap-2 items-center bg-[#1e1e2d] p-1.5 rounded border border-gray-850 text-xs">
                            <img 
                              src={vid.thumbnailUrl} 
                              alt="" 
                              className="w-11 h-7 object-cover rounded bg-black flex-shrink-0 border border-gray-800"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="block truncate text-[10px] text-gray-300 font-bold">{vid.title}</span>
                              <input 
                                type="text"
                                value={vid.thumbnailUrl}
                                onChange={(e) => {
                                  const newUrl = e.target.value;
                                  setVideos(prev => prev.map(v => v.id === vid.id ? { ...v, thumbnailUrl: newUrl } : v));
                                }}
                                placeholder="এখানে আপনার ইমেজ লিঙ্ক পেস্ট করুন..."
                                className="w-full bg-[#12121c] border border-gray-700/85 rounded px-1.5 py-0.5 mt-0.5 text-[10px] text-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick high CTR thumbnail template choices */}
                    <div className="pt-1.5 border-t border-gray-800/40">
                      <span className="text-[9px] text-gray-400 block mb-1">🔥 হাই-ক্লিক থাম্বনেইল টেমপ্লেটসমূহ (১-ক্লিক পরিবর্তন):</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { title: "🔴 Live Green-screen HD", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&h=360&fit=crop&q=80" },
                          { title: "🎬 Pro Streaming Poster", url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=640&h=360&fit=crop&q=80" },
                          { title: "⚡ Direct Download Button", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&h=360&fit=crop&q=80" },
                          { title: "🎮 High-action Gaming", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop&q=80" }
                        ].map((t, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (videos.length > 0) {
                                setVideos(prev => {
                                  const next = [...prev];
                                  if (next[0]) {
                                    next[0] = { ...next[0], thumbnailUrl: t.url };
                                  }
                                  return next;
                                });
                                triggerToast(`প্রথম থাম্বনেইল ইমেজটি আপডেট করা হয়েছে!`);
                              } else {
                                triggerToast(`⚠️ পরিবর্তন করার মতো কোনো ভিডিও নেই!`);
                              }
                            }}
                            className="text-[9px] bg-[#12121c] hover:bg-[#1a1a2b] text-zinc-300 px-1 py-1 rounded border border-gray-800 text-left truncate cursor-pointer transition flex items-center justify-between"
                            title="প্রথম থাম্বনেইলে সেট করুন"
                          >
                            <span>{t.title}</span>
                            <span className="text-[8px] text-amber-500 font-mono">Apply</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Stats, Realtime CTR Graph and Actions */}
                <div className="lg:col-span-3 space-y-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-200 border-b border-gray-800 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="p-1 rounded bg-teal-500/10 text-teal-400"><Activity size={14} /></span>
                      রিয়েল-টাইম অ্যাড ক্লিক কাউন্টার
                    </h3>

                    {/* Stats Widget Showcase */}
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <div className="bg-[#181823] p-3 rounded-lg border border-gray-800 text-center relative overflow-hidden group">
                        <div className="absolute top-1 right-2 flex items-center gap-0.5">
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                          <span className="text-[9px] text-emerald-400 uppercase font-mono">Live Tracker</span>
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">মোট ক্লিক রিডাইরেক্ট</span>
                        <div className="text-3xl font-black text-amber-400 mt-1 font-mono tracking-tight flex items-center justify-center gap-1.5">
                          <MousePointerClick size={22} className="text-amber-500 animate-bounce" />
                          {clickCount}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                          (আপনার দেওয়া অ্যাডের লিঙ্কে ট্র্যাফিক রিডাইরেক্ট সংখ্যা)
                        </p>
                      </div>
                    </div>

                    {/* Simple Breakdown lists */}
                    <div className="mt-3 space-y-1 text-[11px] bg-[#14141c] p-2.5 rounded border border-gray-800 max-h-[100px] overflow-y-auto">
                      <span className="text-gray-400 block font-bold mb-1 border-b border-gray-800 pb-1 text-[9px] uppercase">
                        ক্লিকের বিভাজন বিশ্লেষণ (Specific Heatmap)
                      </span>
                      {Object.keys(statsBreakdown).length === 0 ? (
                        <span className="text-gray-500 italic text-[10px] block py-1">কোনো লাইভ ট্র্যাফিক ডেটা নেই...</span>
                      ) : (
                        Object.entries(statsBreakdown).map(([key, count]) => {
                          const vObj = videos.find(v => v.id === key);
                          const name = key === 'global_click' ? 'বডির যেকোনো জায়গায় ক্লিক' : (vObj ? `কার্ড: ${vObj.title.substring(0, 15)}...` : `ID: ${key}`);
                          return (
                            <div key={key} className="flex justify-between text-[11px] text-gray-300 font-mono">
                              <span className="truncate max-w-[140px]">{name}</span>
                              <span className="text-amber-400 font-bold">{count}টি ক্লিক</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Reset Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-800">
                    <button
                      onClick={handleResetStats}
                      className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={11} />
                      কাউন্টার মুছুন
                    </button>
                    <button
                      onClick={handleResetAllDefaults}
                      className="px-2 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-900/30 rounded text-[10px] font-bold transition cursor-pointer"
                    >
                      ডিফল্ট করুন
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ====================================================================== */}
      {/* 🔮 CUSTOM TOAST NOTIFICATIONS (Excluded from Redirection click)        */}
      {/* ====================================================================== */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="admin-portal-exclude fixed bottom-6 right-6 z-50 bg-[#151522] border border-indigo-500 shadow-2xl p-4 rounded-xl flex items-center gap-2 max-w-sm text-xs"
          >
            <div className="p-1 rounded-full bg-indigo-500/20 text-indigo-400">
              <Check size={16} />
            </div>
            <span className="font-semibold text-gray-100">{notificationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================== */}
      {/* 🚀 MAIN LANDING PORTAL (Ad Target Frame Area click triggers redirects) */}
      {/* ====================================================================== */}
      <div 
        onClick={handlePortalAreaClick}
        className={`flex-1 flex flex-col relative transition-colors duration-300 cursor-pointer ${
          settings.selectedTheme === 'youtube' ? 'bg-[#0f0f0f]' :
          settings.selectedTheme === 'netflix' ? 'bg-black' :
          'bg-[#121215]'
        }`}
      >
        
        {/* Ad floating simulation banner for highly authentic looking visual baits */}
        <div className="w-full bg-[#1e140a] border-b border-amber-900/40 px-4 py-1.5 text-center text-xs text-amber-300 flex items-center justify-center gap-2 select-none hover:bg-[#281c10] transition">
          <Flame size={12} className="text-amber-500 animate-pulse" />
          <span>🔥 High-Speed Direct CDNs Available. 100% Virus-Free Premium Access.</span>
        </div>

        {/* 🍿 THEME STYLE 1: YOUTUBE CLASSIC RED & BLACK */}
        {settings.selectedTheme === 'youtube' && (
          <>
            {/* Header */}
            <header className="bg-[#0f0f0f] border-b border-gray-800 py-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Menu size={20} className="text-gray-400 hidden sm:inline" />
                <div className="flex items-center gap-1">
                  <span className="text-red-600 font-extrabold text-2xl tracking-tighter flex items-center gap-0.5">
                    <Video size={24} className="fill-current text-red-600" />
                    <span>Watch</span>
                  </span>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 rounded ml-1 uppercase">
                    BD
                  </span>
                </div>
              </div>

              {/* YouTube Style Search Bar */}
              <div className="flex-1 max-w-xl mx-4 sm:mx-8 relative lg:block">
                <div className="flex">
                  <input 
                    type="text" 
                    placeholder="পছন্দের ভিডিও বা অ্যাপ অনুসন্ধান করুন..." 
                    className="w-full bg-[#121212] border border-gray-700/85 rounded-l-full py-1.5 px-4 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-600"
                    disabled
                  />
                  <button className="bg-zinc-800 border-y border-r border-gray-700 rounded-r-full px-4 text-gray-400 flex items-center justify-center">
                    <Search size={14} />
                  </button>
                </div>
              </div>

              {/* Actions & Profiles */}
              <div className="flex items-center gap-3 text-gray-400">
                <Bell size={18} className="hidden sm:inline" />
                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-gray-300 hover:text-white border border-gray-700">
                  <User size={16} />
                </div>
              </div>
            </header>

            {/* Quick Filter Menu Items */}
            <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-gray-800/80 bg-[#0f0f0f]">
              {['অল ভিডিও (All)', 'মোস্ট ভিউড', 'বিডি স্পেশাল', 'নতুন রিলিজ', 'জনপ্রিয়', 'ডাউনলোড লিঙ্ক'].map((tag, i) => (
                <span 
                  key={i} 
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                    i === 0 ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        {/* 🎬 THEME STYLE 2: NETFLIX PREMIUM CINEMATIC GRID */}
        {settings.selectedTheme === 'netflix' && (
          <header className="bg-gradient-to-b from-black/80 to-transparent py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[#E50914] font-black text-3xl tracking-tighter uppercase font-mono">
                NETPLATE
              </span>
              <nav className="hidden md:flex items-center gap-4 text-xs text-gray-300 font-medium">
                <span className="hover:text-white transition">হোম (Home)</span>
                <span className="hover:text-white transition">নাটক ও মুভি</span>
                <span className="hover:text-white transition">গেমস</span>
                <span className="hover:text-white transition">ডাউনলোড সেন্ট্রাল</span>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <Search size={16} className="text-gray-300" />
              <button className="bg-[#E50914] text-white text-xs font-bold px-3 py-1.5 rounded uppercase hover:bg-red-700 transition">
                ভিআইপি এক্সেস
              </button>
            </div>
          </header>
        )}

        {/* ⚡ THEME STYLE 3: SLEEK MATRIX TORRENT PORTAL */}
        {settings.selectedTheme === 'torrent' && (
          <header className="bg-[#16161a] border-b-2 border-emerald-500/50 py-3 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-mono font-bold tracking-widest uppercase">
                TORRENT-RAPID
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px] text-emerald-500/80">
              <span className="bg-emerald-950/50 px-2 py-0.5 border border-emerald-500/20 rounded">
                ⚡ ৩.২ GB/S ULTRA DUAL SERVER
              </span>
            </div>
          </header>
        )}

        {/* Dynamic Title / Accent area */}
        <div className="px-4 md:px-8 pt-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {settings.selectedTheme === 'torrent' ? '⚡ ' : '🎬 '}
                {settings.pageTitle}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                নিচের যেকোনো ভিডিওতে ক্লিক করে সরাসরি ওয়াচ (Watch) অথবা ডাউনলোড (Download) করুন। 
              </p>
            </div>
            <div className="bg-rose-950/20 border border-rose-800/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs text-rose-400 font-medium">
              <Info size={13} className="text-rose-400" />
              <span>সার্ভার স্ট্যাটাস: অন-লাইন (High-speed)</span>
            </div>
          </div>
        </div>

        {/* GRID CONTAINER OF MOUNTED HIGHLIGHT CARDS */}
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full flex-1">
          {videos.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/30 border border-dashed border-gray-800 rounded-2xl">
              <span className="text-gray-400 font-medium text-sm block">কোনো ভিডিও থাম্বনেইল কার্ড পাওয়া যায়নি!</span>
              <p className="text-xs text-gray-500 mt-1">দয়া করে এডমিন প্যানেল থেকে থাম্বনেইল ক্যাটাগরি পপুলেট বা কোনো কাস্টম আইটেম যুক্ত করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((vid, idx) => (
                <motion.div
                  key={vid.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  onClick={(e) => {
                    // If button-only mode, clicking the outer card doesn't redirect
                    // otherwise clicking anywhere on card triggers redirect
                    if (settings.redirectType === 'global') {
                      e.preventDefault();
                      // Let event bubble up to the main portal click-handler
                    } else {
                      // Stop propagation so it doesn't fire double triggers if inside button click
                    }
                  }}
                  className={`group relative overflow-hidden rounded-xl border flex flex-col transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl ${
                    settings.selectedTheme === 'youtube' ? 'bg-[#181818] border-zinc-800 hover:border-zinc-700' :
                    settings.selectedTheme === 'netflix' ? 'bg-[#121212] border-zinc-900 hover:border-[#E50914]' :
                    'bg-[#19191d] border-emerald-950/40 hover:border-emerald-500/50'
                  }`}
                >
                  {/* Delete Card Button (Only active inside Admin, but let's exclude click propagation so it acts perfectly code wise) */}
                  <button
                    onClick={(e) => handleDeleteVideo(vid.id, e)}
                    className="admin-portal-exclude absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/80 text-gray-400 hover:text-rose-400 hover:bg-black transition-colors"
                    title="ডিলিট কার্ড"
                  >
                    <Trash size={12} />
                  </button>

                  {/* Thumbnail Banner with timestamp overlay */}
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                    <img 
                      src={vid.thumbnailUrl} 
                      alt={vid.title}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Dark gradient gloss */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Time Counter Badge */}
                    <span className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white font-mono flex items-center gap-1">
                      <Clock size={10} />
                      {vid.duration}
                    </span>

                    {/* Subtle Hover Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/45 duration-300">
                      <span className="p-3 bg-red-600/90 text-white rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play size={20} className="fill-current text-white" />
                      </span>
                    </div>

                    {/* Source label / badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-black uppercase tracking-wider">
                      ★ Active Web-DL
                    </span>
                  </div>

                  {/* Video Meta Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Channel Row */}
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={vid.channelLogo} 
                          alt={vid.channelName} 
                          referrerPolicy="no-referrer"
                          className="h-5 w-5 rounded-full object-cover border border-gray-800"
                        />
                        <span className="text-[11px] font-medium text-gray-400">
                          {vid.channelName}
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </div>

                      {/* Video Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-gray-100 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                        {vid.title}
                      </h4>

                      {/* Display Info Views & Upload details */}
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 mt-2 font-mono">
                        <span className="flex items-center gap-0.5">
                          <Eye size={11} />
                          {vid.views}
                        </span>
                        <span>•</span>
                        <span>{vid.timeAgo}</span>
                      </div>
                    </div>

                    {/* SUB-NAV BUTTONS: WATCH & DOWNLOAD (Target actions that fire redirect) */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          executeAdRedirect(vid.id, 'Watch Video Click');
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition duration-200 transform active:scale-95 cursor-pointer shadow-md shadow-red-950/25"
                      >
                        <Play size={12} className="fill-current" />
                        ভিডিও দেখুন (Watch)
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          executeAdRedirect(vid.id, 'Download Video Click');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition duration-200 transform active:scale-95 cursor-pointer shadow-md shadow-emerald-950/25"
                      >
                        <Download size={12} />
                        ডাউনলোড (Download)
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Visual Footer designed to mimic actual streaming portal */}
        <footer className="mt-auto py-8 text-center border-t border-zinc-900 bg-black/60 font-sans">
          <p className="text-[10px] text-gray-500 flex items-center justify-center gap-0.5">
            <span>© 2026 {settings.pageTitle} - All rights & Direct Streams Secured</span>
            <span 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleAdminPanel();
              }}
              className="admin-portal-exclude cursor-pointer select-none text-zinc-700 hover:text-amber-500 w-3 h-3 inline-flex items-center justify-center font-bold font-mono transition-colors"
              title="Portal Management System"
            >
              .
            </span>
          </p>
          <div className="flex justify-center gap-4 text-[10px] text-gray-600 mt-2">
            <span>কমিউনিটি নির্দেশিকা</span>
            <span>প্রাইভেসি পলিসি</span>
            <span>যোগাযোগ করুন</span>
            <span>অ্যাডভার্টাইজিং নেটওয়ার্ক</span>
          </div>
        </footer>

      </div>

      {/* 🔐 STEALTH SECRET CONTROL TOGGLE - Bottom Right Corner (Faint and almost invisible to ordinary users, easy to access for owner) */}
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleAdminPanel();
        }}
        className="admin-portal-exclude fixed bottom-2.5 right-2.5 z-[9999] w-7 h-7 rounded-md cursor-pointer flex items-center justify-center opacity-5 hover:opacity-100 transition-opacity duration-300 bg-black/90 text-amber-500 select-none text-xs border border-zinc-805 shadow-xl"
        title="Admin settings toggle"
      >
        ⚙️
      </div>

      {/* 🔐 PASSWORD PROMPT MODAL */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-portal-exclude fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#121216] border border-gray-800 rounded-xl p-5 w-full max-w-sm shadow-2xl relative text-center"
            >
              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                🔐 সিকিউর পোর্টালে প্রবেশ
              </h3>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                অ্যাডমিন কনফিগারেশন প্যানেল অ্যাক্সেস করতে অনুগ্রহ করে সিক্রেট পাসওয়ার্ড প্রদান করুন
              </p>

              <form onSubmit={handleVerifyPassword} className="space-y-3">
                <input 
                  type="password"
                  placeholder="পাসওয়ার্ড লিখুন..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#181820] border border-gray-700 rounded-lg px-3 py-2 text-sm text-center focus:ring-1 focus:ring-amber-500 focus:outline-none text-white tracking-widest font-mono select-text"
                  autoFocus
                  required
                />
                
                <div className="flex gap-2 text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPasswordPrompt(false)}
                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-350 rounded-lg font-bold transition cursor-pointer"
                  >
                    বাতিল (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition cursor-pointer"
                  >
                    যাচাই করুন (Submit)
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
