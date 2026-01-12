
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, PhotoRecord, RechargeRequest, SystemSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { LogOut, LayoutDashboard, Camera, History, Wallet, Settings, Menu, X, Bell, Sparkles, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<string>('studio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const sirenRef = useRef<HTMLAudioElement | null>(null);
  const prevPendingCount = useRef(0);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('atan_users');
      const storedPhotos = localStorage.getItem('atan_photos');
      const storedRecharges = localStorage.getItem('atan_recharges');
      const storedSettings = localStorage.getItem('atan_settings');

      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedPhotos) setPhotos(JSON.parse(storedPhotos));
      if (storedRecharges) setRecharges(JSON.parse(storedRecharges));
      if (storedSettings) setSettings(JSON.parse(storedSettings));
    } catch (e) {
      console.warn("Failed to load data from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('atan_users', JSON.stringify(users));
      // Limit stored photos to prevent storage overflow
      const photosToStore = photos.slice(0, 10);
      localStorage.setItem('atan_photos', JSON.stringify(photosToStore));
      localStorage.setItem('atan_recharges', JSON.stringify(recharges));
      localStorage.setItem('atan_settings', JSON.stringify(settings));
    } catch (e) {
      console.error("LocalStorage Storage Error (Quota possibly full):", e);
      // Even if storage fails, we keep running in memory
    }

    if (role === UserRole.ADMIN) {
      const currentPending = recharges.filter(r => r.status === 'PENDING').length;
      if (currentPending > prevPendingCount.current) {
        sirenRef.current?.play().catch(e => console.log("Audio play blocked"));
      }
      prevPendingCount.current = currentPending;
    }
  }, [users, photos, recharges, settings, role]);

  const handleLoginSuccess = (user: User, r: UserRole) => {
    setCurrentUser(user);
    setRole(r);
    setActiveTab(r === UserRole.ADMIN ? 'dashboard' : 'studio');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRole(null);
  };

  const markNoticeAsRead = () => {
    if (currentUser && currentUser.hasUnreadNotice) {
      const updatedUser = { ...currentUser, hasUnreadNotice: false };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    }
    setShowNotifications(true);
  };

  if (!currentUser) {
    return (
      <Auth 
        onLogin={handleLoginSuccess}
        users={users}
        setUsers={setUsers}
        welcomeBonus={settings.welcomeBonus}
        settings={settings}
      />
    );
  }

  const navItems = role === UserRole.ADMIN ? [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'recharges', label: 'রিচার্জসমূহ', icon: Wallet },
    { id: 'users', label: 'ইউজারসমূহ', icon: UserIcon },
    { id: 'photos', label: 'সকল ছবি', icon: History },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ] : [
    { id: 'studio', label: 'এআই স্টুডিও', icon: Camera },
    { id: 'history', label: 'ইতিহাস', icon: History },
    { id: 'recharge', label: 'রিচার্জ', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      <audio ref={sirenRef} src="https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3" preload="auto" />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-blue-400/15 rounded-full blur-[100px] animate-blob-1"></div>
        <div className="absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-indigo-400/15 rounded-full blur-[120px] animate-blob-2"></div>
        <div className="absolute bottom-[5%] left-[15%] w-[350px] h-[350px] bg-amber-400/10 rounded-full blur-[90px] animate-blob-3"></div>
      </div>

      {settings.notice && (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-2 overflow-hidden shadow-sm z-50">
          <div className="animate-marquee inline-block whitespace-nowrap px-4 font-bold text-sm tracking-wide">
            📢 {settings.notice} &nbsp;&nbsp;&nbsp;&nbsp; 🚀 Anan Tech .ai এ স্বাগতম! &nbsp;&nbsp;&nbsp;&nbsp; 📢 {settings.notice}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 px-4 pt-4 pb-2">
        <div className="max-w-7xl mx-auto glass rounded-3xl px-6 py-3 flex items-center justify-between shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Sparkles size={20} />
            </div>
            <div className="hidden sm:block overflow-hidden">
              <div className="brand-font font-black text-slate-900 text-xl leading-none typing-effect">
                Anan Tech <span className="text-blue-600">.ai</span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-white/30 p-1 rounded-2xl border border-white/40">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                    activeTab === item.id 
                      ? 'bg-white shadow-md text-blue-600' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
             {role === UserRole.USER && (
               <div className="hidden lg:flex items-center gap-3 border-r border-white/60 pr-4">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ব্যালেন্স</p>
                    <p className="text-sm font-black text-blue-600 leading-none">৳{currentUser.balance.toFixed(2)}</p>
                  </div>
               </div>
             )}

             {role === UserRole.USER && (
               <button 
                 onClick={markNoticeAsRead}
                 className={`p-3 rounded-2xl border transition-all relative ${currentUser.hasUnreadNotice ? 'bg-rose-50 border-rose-100 text-rose-500 animate-pulse' : 'bg-white/60 text-slate-600 border-white/80'}`}
               >
                 <Bell size={20} />
                 {currentUser.hasUnreadNotice && (
                   <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white"></span>
                 )}
               </button>
             )}

             <button onClick={handleLogout} className="p-3 bg-rose-50/80 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100">
               <LogOut size={20} />
             </button>

             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-3 bg-white/60 text-slate-600 rounded-2xl border border-white/80">
               {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-2 glass rounded-[2.5rem] p-4 shadow-2xl animate-pop border-white/60 z-50">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                >
                  <item.icon size={20} /> {item.label}
                </button>
              ))}
            </div>
            {role === UserRole.USER && (
               <div className="mt-4 pt-4 border-t border-white/40 flex items-center justify-between px-2">
                  <p className="text-xs font-black text-slate-400 uppercase">ব্যালেন্স</p>
                  <p className="text-blue-600 font-black">৳{currentUser.balance.toFixed(2)}</p>
               </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full z-10 overflow-y-auto">
        {role === UserRole.ADMIN ? (
          <AdminDashboard 
            activeTab={activeTab}
            users={users} setUsers={setUsers}
            photos={photos} setPhotos={setPhotos}
            recharges={recharges} setRecharges={setRecharges}
            settings={settings} setSettings={setSettings}
          />
        ) : (
          <UserDashboard 
            activeTab={activeTab}
            currentUser={currentUser} setCurrentUser={setCurrentUser}
            users={users} setUsers={setUsers}
            photos={photos} setPhotos={setPhotos}
            recharges={recharges} setRecharges={setRecharges}
            settings={settings}
            onOpenNotifications={markNoticeAsRead}
          />
        )}
      </main>

      {/* Global User Notifications Modal */}
      {showNotifications && role === UserRole.USER && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowNotifications(false)}></div>
          <div className="glass bg-white p-10 rounded-[3rem] w-full max-w-sm shadow-2xl border border-white relative z-10 animate-pop">
            <button 
              onClick={() => setShowNotifications(false)}
              className="absolute top-8 right-8 p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="p-6 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-[2rem] mb-8 shadow-xl shadow-blue-100">
                <Bell size={48} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">নোটিফিকেশন</h3>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-8">ব্যক্তিগত বার্তা বোর্ড</p>
              
              <div className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-white w-full shadow-inner min-h-[140px] flex items-center justify-center">
                {currentUser.personalNotice ? (
                  <p className="text-slate-700 font-bold leading-relaxed">{currentUser.personalNotice}</p>
                ) : (
                  <p className="text-slate-400 font-medium italic">আপনার জন্য কোনো নতুন বার্তা নেই।</p>
                )}
              </div>
              
              <button 
                onClick={() => setShowNotifications(false)}
                className="mt-10 w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black hover:bg-black transition-all shadow-xl active:scale-95"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="p-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 z-10 relative">
        Anan Tech .ai &bull; ২০২৫
      </footer>
    </div>
  );
};

export default App;
