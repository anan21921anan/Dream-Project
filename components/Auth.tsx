
import React, { useState } from 'react';
import { UserRole, SystemSettings } from '../types';
import { supabase } from '../supabase';
import { Mail, User as UserIcon, Lock, Sparkles, ArrowRight, Loader2, Key, Headset, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onLogin: (userId: string) => void;
  settings: SystemSettings;
}

const Auth: React.FC<AuthProps> = ({ onLogin, settings }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminPin: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      if (isAdminLogin) {
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw new Error('ভুল ইমেইল বা পাসওয়ার্ড।');

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
        if (profile?.role !== 'ADMIN') throw new Error('আপনার এডমিন এক্সেস নেই।');
        
        if (formData.adminPin !== settings.adminPin) throw new Error('ভুল এডমিন পিন।');

        onLogin(user!.id);
        return;
      }

      if (isLogin) {
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw new Error('ভুল তথ্য। আপনার আইডি এবং পাসওয়ার্ড চেক করুন।');
        onLogin(user!.id);
      } else {
        if (!formData.name || !formData.email || !formData.password) throw new Error('দয়া করে সব ঘর পূরণ করুন।');
        
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name }
          }
        });

        if (signUpError) throw signUpError;

        if (user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: user.id,
            name: formData.name,
            email: formData.email,
            balance: settings.welcomeBonus,
            role: 'USER',
            referral_code: Math.random().toString(36).substr(2, 6).toUpperCase()
          });
          
          if (profileError) throw profileError;
          onLogin(user.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-bengali">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/40 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="w-full max-w-[420px] z-10 animate-pop">
        {/* Logo and Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-3xl mb-6 shadow-2xl shadow-blue-200/50">
            <Sparkles size={40} className="animate-pulse" />
          </div>
          <h1 className="brand-font text-4xl font-black text-slate-900 tracking-tight mb-2">
            Anan Tech <span className="text-blue-600">.ai</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm tracking-wide">আধুনিক এআই ফটো স্টুডিও</p>
        </div>

        <div className="glass rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden p-2">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100/50 p-1.5 rounded-[2rem] mb-6 border border-slate-200/40">
            <button 
              onClick={() => { setIsAdminLogin(false); setIsLogin(true); setError(''); }} 
              className={`flex-1 py-3.5 text-xs font-black rounded-[1.5rem] transition-all duration-300 tracking-wider uppercase ${!isAdminLogin ? 'bg-white shadow-lg text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              ইউজার লগইন
            </button>
            <button 
              onClick={() => { setIsAdminLogin(true); setError(''); }} 
              className={`flex-1 py-3.5 text-xs font-black rounded-[1.5rem] transition-all duration-300 tracking-wider uppercase ${isAdminLogin ? 'bg-white shadow-lg text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              এডমিন লগইন
            </button>
          </div>

          <div className="px-6 pb-8 pt-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[13px] font-bold border border-rose-100 text-center animate-shake">
                  {error}
                </div>
              )}

              {!isLogin && !isAdminLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">আপনার নাম</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="পুরো নাম লিখুন" 
                      className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-100 rounded-[1.8rem] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm shadow-sm" 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ইমেইল এড্রেস</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="example@mail.com" 
                    className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-100 rounded-[1.8rem] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm shadow-sm" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">পাসওয়ার্ড</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full pl-14 pr-14 py-4.5 bg-white border border-slate-100 rounded-[1.8rem] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm shadow-sm" 
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {isAdminLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">এডমিন পিন</label>
                  <div className="relative group">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                      type="password" 
                      placeholder="PIN" 
                      className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-100 rounded-[1.8rem] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-black text-center tracking-[0.6em] text-lg shadow-sm" 
                      value={formData.adminPin} 
                      onChange={e => setFormData({ ...formData, adminPin: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
              )}

              <button 
                disabled={isProcessing} 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="tracking-wide">
                      {isAdminLogin ? 'ড্যাশবোর্ড প্রবেশ' : (isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট খুলুন')}
                    </span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {!isAdminLogin && (
              <div className="pt-2 text-center">
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                  className="text-sm font-black text-blue-600 hover:text-indigo-700 transition-colors px-4 py-2 rounded-xl hover:bg-blue-50"
                >
                  {isLogin ? "নতুন ইউজার? অ্যাকাউন্ট খুলুন" : "আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="mt-12 flex flex-col items-center gap-6 animate-fade-in stagger-3">
          <a 
            href={`tel:${settings.helpline}`}
            className="flex items-center gap-3 px-8 py-4 bg-white/60 border border-white rounded-[2rem] text-slate-700 font-black text-sm hover:bg-white hover:shadow-xl transition-all group"
          >
            <Headset size={20} className="text-blue-600 group-hover:rotate-12 transition-transform" />
            হটলাইন সাহায্য
          </a>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">© ২০২৫ আনন টেক এআই</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
