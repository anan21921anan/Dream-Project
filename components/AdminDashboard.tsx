
import React, { useState } from 'react';
import { User, PhotoRecord, RechargeRequest, SystemSettings, UserRole } from '../types';
import { Users, CreditCard, History, Settings, Plus, Minus, Check, X, Ban, Activity, Globe, Eye, EyeOff, DollarSign, UserCheck, BellRing, Trash2, Send, Megaphone, ShieldAlert, Image as ImageIcon, Search, PhoneCall, Wallet, UserPlus, Key, Mail, User as UserIcon, Lock, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface AdminDashboardProps {
  activeTab: string;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  photos: PhotoRecord[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoRecord[]>>;
  recharges: RechargeRequest[];
  setRecharges: React.Dispatch<React.SetStateAction<RechargeRequest[]>>;
  settings: SystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab, users, setUsers, photos, setPhotos, recharges, setRecharges, settings, setSettings
}) => {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [adjustAmount, setAdjustAmount] = useState<{[key: string]: string}>({});
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [userFilter, setUserFilter] = useState('');
  const [photoUserFilter, setPhotoUserFilter] = useState('');
  const [notifyUserId, setNotifyUserId] = useState<string | null>(null);
  const [personalNoticeInput, setPersonalNoticeInput] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);
  
  // New User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    balance: '10'
  });

  const handleLogoUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newPm = [...settings.paymentMethods];
        newPm[idx].logo = ev.target?.result as string;
        setSettings({ ...settings, paymentMethods: newPm });
      };
      reader.readAsDataURL(file);
    }
  };

  const approveRecharge = (req: RechargeRequest) => {
    setRecharges(prev => prev.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r));
    // Fix: Changed req.userId to req.user_id as per the 'RechargeRequest' type definition.
    setUsers(prev => prev.map(u => u.id === req.user_id ? { ...u, balance: u.balance + req.amount } : u));
  };

  const handleAdjustBalance = (userId: string, type: 'ADD' | 'SUB') => {
    const amount = parseFloat(adjustAmount[userId] || '0');
    if (isNaN(amount) || amount <= 0) return;

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, balance: type === 'ADD' ? u.balance + amount : Math.max(0, u.balance - amount) };
      }
      return u;
    }));
    setAdjustAmount(prev => ({ ...prev, [userId]: '' }));
  };

  const handleToggleSuspend = (userId: string) => {
    // Fix: Changed u.isSuspended to u.is_suspended as per the 'User' type definition.
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u));
  };

  const handleSendNotice = () => {
    if (!notifyUserId) return;
    // Fix: Changed u.personalNotice and u.hasUnreadNotice to u.personal_notice and u.has_unread_notice.
    setUsers(prev => prev.map(u => u.id === notifyUserId ? { ...u, personal_notice: personalNoticeInput, has_unread_notice: true } : u));
    setNotifyUserId(null);
    setPersonalNoticeInput('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) return;
    
    const referralCodeStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUserForm.name,
      email: newUserForm.email,
      password: newUserForm.password,
      balance: parseFloat(newUserForm.balance) || 0,
      role: UserRole.USER,
      referral_code: referralCodeStr,
      // Fix: Removed non-existent property 'referralCode' and corrected 'isSuspended' to 'is_suspended'.
      is_suspended: false,
      created_at: new Date().toISOString()
    };
    
    setUsers(prev => [...prev, newUser]);
    setIsCreateModalOpen(false);
    setNewUserForm({ name: '', email: '', password: '', balance: '10' });
  };

  const filteredPhotos = photoUserFilter 
    // Fix: Changed p.userId and p.userName to p.user_id and p.user_name.
    ? photos.filter(p => p.user_id === photoUserFilter || p.user_name.toLowerCase().includes(photoUserFilter.toLowerCase())) 
    : photos;

  const filteredUsers = userFilter 
    // Fix: Changed u.referralCode to u.referral_code.
    ? users.filter(u => u.name.toLowerCase().includes(userFilter.toLowerCase()) || u.email.toLowerCase().includes(userFilter.toLowerCase()) || (u.referral_code && u.referral_code.includes(userFilter.toUpperCase())))
    : users;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
            <div className="glass p-10 rounded-[3rem] shadow-xl">
               <Users size={32} className="text-blue-600 mb-4"/>
               <p className="text-slate-400 font-black text-xs uppercase">মোট ইউজার</p>
               <h3 className="text-5xl font-black">{users.length}</h3>
            </div>
            <div className="glass p-10 rounded-[3rem] shadow-xl">
               <CreditCard size={32} className="text-emerald-600 mb-4"/>
               <p className="text-slate-400 font-black text-xs uppercase">পেন্ডিং রিচার্জ</p>
               <h3 className="text-5xl font-black text-emerald-600">{recharges.filter(r => r.status === 'PENDING').length}</h3>
            </div>
            <div className="glass p-10 rounded-[3rem] shadow-xl">
               <History size={32} className="text-indigo-600 mb-4"/>
               <p className="text-slate-400 font-black text-xs uppercase">মোট তৈরি করা ছবি</p>
               <h3 className="text-5xl font-black text-indigo-600">{photos.length}</h3>
            </div>
          </div>
        );
      case 'recharges':
        return (
          <div className="glass rounded-[3rem] overflow-hidden shadow-2xl border-white/40">
            <div className="p-8 border-b border-white/20 flex justify-between items-center">
              <h3 className="font-black text-2xl flex items-center gap-3"><DollarSign className="text-emerald-600"/> রিচার্জ রিকোয়েস্ট</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[11px] uppercase font-black">
                  <tr>
                    <th className="p-6">ইউজার</th>
                    <th className="p-6">পরিমাণ</th>
                    <th className="p-6">মেথড ও নম্বর</th>
                    <th className="p-6">TrxID</th>
                    <th className="p-6 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {recharges.map(req => (
                    <tr key={req.id} className="hover:bg-white/30 transition-all">
                      {/* Fix: Changed req.userName, req.method, req.senderNumber, and req.trxId to snake_case. */}
                      <td className="p-6 font-bold">{req.user_name}</td>
                      <td className="p-6 font-black text-blue-600">৳{req.amount}</td>
                      <td className="p-6 font-bold">{req.method} ({req.sender_number})</td>
                      <td className="p-6 font-mono text-xs">{req.trx_id}</td>
                      <td className="p-6 text-right">
                        {req.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => approveRecharge(req)} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg"><Check size={18}/></button>
                            <button onClick={() => setRejectId(req.id)} className="p-3 bg-rose-500 text-white rounded-xl shadow-lg"><X size={18}/></button>
                          </div>
                        )}
                        {req.status !== 'PENDING' && (
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {req.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
              <div className="glass p-6 rounded-3xl flex items-center gap-4 flex-1">
                <Search className="text-slate-400" />
                <input 
                  placeholder="ইউজার নাম, ইমেইল বা আইডি দিয়ে খুঁজুন..." 
                  className="bg-transparent outline-none flex-1 font-bold"
                  value={userFilter}
                  onChange={e => setUserFilter(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black flex items-center justify-center gap-3 shadow-lg hover:bg-blue-700 transition-all"
              >
                <UserPlus size={20} /> নতুন ইউজার
              </button>
            </div>

            <div className="glass rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[11px] uppercase font-black">
                    <tr>
                      <th className="p-6">ইউজার তথ্য</th>
                      <th className="p-6">পাসওয়ার্ড</th>
                      <th className="p-6">ব্যালেন্স ও ছবি</th>
                      <th className="p-6">ব্যালেন্স অ্যাড/রিমুভ</th>
                      <th className="p-6 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map(user => {
                      // Fix: Changed p.userId to p.user_id.
                      const userPhotoCount = photos.filter(p => p.user_id === user.id).length;
                      return (
                        <tr key={user.id} className="hover:bg-white/30 transition-all">
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <p className="font-black text-slate-900">{user.name}</p>
                              {/* Fix: Changed user.hasUnreadNotice to user.has_unread_notice. */}
                              {user.has_unread_notice && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" title="আনরিড নোটিশ আছে"></span>}
                            </div>
                            {/* Fix: Changed user.referralCode to user.referral_code. */}
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.referral_code} &bull; {user.email}</p>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-xl border border-slate-200 w-fit">
                              <Key size={14} className="text-slate-400" />
                              <span className="font-mono text-sm font-bold min-w-[80px]">
                                {showPasswords[user.id] ? user.password : '••••••••'}
                              </span>
                              <button 
                                onClick={() => setShowPasswords({...showPasswords, [user.id]: !showPasswords[user.id]})}
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                {showPasswords[user.id] ? <EyeOff size={16}/> : <Eye size={16}/>}
                              </button>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="space-y-1">
                               <p className="font-black text-blue-600 text-lg leading-none">৳{user.balance.toFixed(2)}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <ImageIcon size={10}/> {userPhotoCount} টি ছবি
                               </p>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                placeholder="৳" 
                                className="w-20 bg-white/50 border p-2 rounded-xl font-black outline-none"
                                value={adjustAmount[user.id] || ''}
                                onChange={e => setAdjustAmount({ ...adjustAmount, [user.id]: e.target.value })}
                              />
                              <button onClick={() => handleAdjustBalance(user.id, 'ADD')} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Plus size={16}/></button>
                              <button onClick={() => handleAdjustBalance(user.id, 'SUB')} className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Minus size={16}/></button>
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                               {/* Fix: Changed user.hasUnreadNotice and user.personalNotice to snake_case. */}
                               <button onClick={() => { setNotifyUserId(user.id); setPersonalNoticeInput(user.personal_notice || ''); }} className={`p-3 rounded-xl ${user.has_unread_notice ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`} title="নোটিশ পাঠান"><BellRing size={18}/></button>
                               <button onClick={() => handleToggleSuspend(user.id)} className={`p-3 rounded-xl ${user.is_suspended ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`} title={user.is_suspended ? 'আন-সাসপেন্ড' : 'সাসপেন্ড'}>
                                 {user.is_suspended ? <Check size={18}/> : <Ban size={18}/>}
                               </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'photos':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="glass p-6 rounded-3xl flex items-center gap-4">
              <Search className="text-slate-400" />
              <input 
                placeholder="ইউজার নাম বা আইডি দিয়ে ফিল্টার করুন..." 
                className="bg-transparent outline-none flex-1 font-bold"
                value={photoUserFilter}
                onChange={e => setPhotoUserFilter(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredPhotos.map(p => (
                <div key={p.id} className="glass rounded-[2rem] overflow-hidden group shadow-lg border-white/60">
                  {/* Fix: Changed p.resultImage, p.userName, and p.createdAt to snake_case. */}
                  <img src={p.result_image} className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="p-4 bg-white/40">
                    <p className="font-black text-xs truncate">{p.user_name}</p>
                    <p className="text-[10px] font-bold text-slate-500">{format(new Date(p.created_at), 'dd MMM', { locale: bn })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
             {/* Security PIN Settings */}
             <div className="glass p-10 rounded-[3rem] shadow-xl border-white/40 relative overflow-hidden">
               <div className="absolute -right-6 -top-6 text-slate-100 rotate-12"><ShieldCheck size={120}/></div>
               <div className="relative z-10">
                 <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><ShieldAlert className="text-amber-500"/> এডমিন সিকিউরিটি পিন</h3>
                 <div className="max-w-md space-y-4">
                    <p className="text-xs font-bold text-slate-500 mb-4">লগইন করার সময় এই পিনটি প্রয়োজন হয়। এটি অত্যন্ত গোপন রাখুন।</p>
                    <div className="flex items-center gap-4">
                       <div className="relative flex-1">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type={showAdminPin ? "text" : "password"} 
                            className="w-full bg-white border border-slate-100 pl-12 pr-12 py-4 rounded-2xl font-black outline-none focus:ring-4 focus:ring-amber-50 focus:border-amber-500 transition-all shadow-sm tracking-[0.4em]" 
                            value={settings.adminPin} 
                            onChange={e => setSettings({...settings, adminPin: e.target.value})} 
                          />
                          <button 
                            type="button"
                            onClick={() => setShowAdminPin(!showAdminPin)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                          >
                            {showAdminPin ? <EyeOff size={20}/> : <Eye size={20}/>}
                          </button>
                       </div>
                    </div>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-2">পিনটি পরিবর্তন করার সাথে সাথেই তা সেভ হয়ে যাবে।</p>
                 </div>
               </div>
             </div>

             <div className="glass p-10 rounded-[3rem] shadow-xl border-white/40">
               <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Megaphone className="text-blue-600"/> গ্লোবাল নোটিশ</h3>
               <textarea className="w-full glass-card p-6 rounded-2xl h-40 font-bold mb-6 outline-none" value={settings.notice} onChange={e => setSettings({...settings, notice: e.target.value})} />
               <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">নোটিশ আপডেট করুন</button>
             </div>

             <div className="glass p-10 rounded-[3rem] shadow-xl border-white/40">
               <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><PhoneCall className="text-emerald-600"/> হটলাইন সাপোর্ট নম্বর</h3>
               <div className="flex gap-4">
                  <input 
                    type="text" 
                    className="flex-1 glass-card p-4 rounded-2xl font-black outline-none border focus:border-emerald-400" 
                    value={settings.helpline} 
                    onChange={e => setSettings({...settings, helpline: e.target.value})} 
                    placeholder="হটলাইন নম্বর লিখুন..."
                  />
               </div>
             </div>

             <div className="glass p-10 rounded-[3rem] shadow-xl border-white/40">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black flex items-center gap-3"><Wallet className="text-emerald-600"/> পেমেন্ট মেথড ও লোগো</h3>
                  <button onClick={() => setSettings({...settings, paymentMethods: [...settings.paymentMethods, {name:'', number:'', logo:''}]})} className="p-3 bg-slate-900 text-white rounded-xl"><Plus/></button>
                </div>
                <div className="space-y-6">
                  {settings.paymentMethods.map((pm, idx) => (
                    <div key={idx} className="glass-card p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 relative group">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">মেথড লোগো</label>
                        <div className="flex items-center gap-4">
                           {pm.logo ? <img src={pm.logo} className="w-12 h-12 rounded-xl object-contain bg-white p-1 border" /> : <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center"><ImageIcon className="text-slate-300"/></div>}
                           <input type="file" onChange={e => handleLogoUpload(idx, e)} className="text-[10px] w-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">নাম</label>
                         <input className="w-full bg-white/50 p-3 rounded-xl font-bold border" value={pm.name} onChange={e => { const m=[...settings.paymentMethods]; m[idx].name=e.target.value; setSettings({...settings, paymentMethods:m}) }} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">নম্বর</label>
                         <input className="w-full bg-white/50 p-3 rounded-xl font-bold border" value={pm.number} onChange={e => { const m=[...settings.paymentMethods]; m[idx].number=e.target.value; setSettings({...settings, paymentMethods:m}) }} />
                      </div>
                      <button onClick={() => setSettings({...settings, paymentMethods: settings.paymentMethods.filter((_,i)=>i!==idx)})} className="absolute -top-2 -right-2 bg-rose-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn relative">
      {renderContent()}

      {/* Improved Create New User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="glass bg-white/90 p-1 rounded-[3.5rem] w-full max-w-lg shadow-2xl relative z-10 animate-pop border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/20">
                    <UserPlus size={32} />
                 </div>
                 <h3 className="text-3xl font-black tracking-tight mb-2">নতুন ইউজার পোর্টাল</h3>
                 <p className="text-blue-100 font-medium opacity-80">সিস্টেমে নতুন একজন ইউজার নিবন্ধিত করুন</p>
               </div>
            </div>

            <div className="p-10 space-y-6">
              <form onSubmit={handleCreateUser} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">পুরো নাম</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        className="w-full bg-white border border-slate-100 pl-12 pr-4 py-4 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm" 
                        value={newUserForm.name} 
                        onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} 
                        placeholder="জন ডো"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ইমেইল এড্রেস</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email"
                        className="w-full bg-white border border-slate-100 pl-12 pr-4 py-4 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm" 
                        value={newUserForm.email} 
                        onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} 
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">পাসওয়ার্ড</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        className="w-full bg-white border border-slate-100 pl-12 pr-4 py-4 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm" 
                        value={newUserForm.password} 
                        onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} 
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">প্রাথমিক ব্যালেন্স (৳)</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-100 pl-12 pr-4 py-4 rounded-2xl font-black outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all shadow-sm text-emerald-600" 
                        value={newUserForm.balance} 
                        onChange={e => setNewUserForm({...newUserForm, balance: e.target.value})} 
                        placeholder="১০.০০"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateModalOpen(false)} 
                    className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.8rem] font-black hover:bg-slate-200 transition-all active:scale-95"
                  >
                    বাতিল করুন
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[1.5] py-5 bg-slate-900 text-white rounded-[1.8rem] font-black shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    ইউজার তৈরি করুন <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Personal Notice Modal for Admin */}
      {notifyUserId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setNotifyUserId(null)}></div>
          <div className="glass bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative z-10 animate-pop">
            <h3 className="text-2xl font-black mb-6">ইউজারকে নোটিশ পাঠান</h3>
            <textarea 
              className="w-full glass-card p-4 rounded-2xl h-32 font-bold mb-6 outline-none border" 
              placeholder="আপনার মেসেজ লিখুন..."
              value={personalNoticeInput}
              onChange={e => setPersonalNoticeInput(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setNotifyUserId(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">বাতিল</button>
              <button onClick={handleSendNotice} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2"><Send size={18}/> পাঠান</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setRejectId(null)}></div>
          <div className="glass bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative z-10 animate-pop">
            <h3 className="text-2xl font-black mb-6">বাতিলের কারণ</h3>
            <textarea 
              className="w-full glass-card p-4 rounded-2xl h-32 font-bold mb-6 outline-none border" 
              placeholder="কেন রিজেক্ট করছেন?"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setRejectId(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">না</button>
              <button onClick={() => {
                // Fix: Changed rejectionReason to rejection_reason.
                setRecharges(prev => prev.map(r => r.id === rejectId ? { ...r, status: 'REJECTED', rejection_reason: rejectReason } : r));
                setRejectId(null);
                setRejectReason('');
              }} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black">নিশ্চিত করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
