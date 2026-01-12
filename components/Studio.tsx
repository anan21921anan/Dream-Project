
import React, { useState, useRef, useEffect } from 'react';
import { User, PhotoRecord, PhotoOptions } from '../types';
import { GENDER_DRESSES, SIZES, BACKGROUND_COLORS } from '../constants';
import { processImage } from '../services/gemini';
import { supabase } from '../supabase';
import { Camera, Upload, RefreshCw, Download, CheckCircle, AlertCircle, X, Sparkles, ShieldAlert, Zap, Loader2, Sliders, Sun, UserCheck, ArrowLeft, ChevronLeft, ImagePlus, Eye } from 'lucide-react';

interface StudioProps {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setPhotos: React.Dispatch<React.SetStateAction<PhotoRecord[]>>;
  generationCost: number;
}

const Studio: React.FC<StudioProps> = ({ currentUser, setCurrentUser, setUsers, setPhotos, generationCost }) => {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [hasPaidForSession, setHasPaidForSession] = useState(false);
  const [options, setOptions] = useState<PhotoOptions>({
    gender: 'male',
    size: SIZES[0],
    background: BACKGROUND_COLORS[0].name,
    dress: GENDER_DRESSES.male[0],
    faceSmooth: true,
    lightFix: true,
    brightness: 60,
    fairness: 50,
    customWidth: '',
    customHeight: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState('এআই ইঞ্জিন সক্রিয় হচ্ছে...');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      const texts = ['এআই ইঞ্জিন সক্রিয় হচ্ছে...', 'চেহারা বিশ্লেষণ করা হচ্ছে...', 'স্টুডিও লাইটিং ঠিক করা হচ্ছে...', 'পাসপোর্ট সাইজ অ্যাডজাস্ট হচ্ছে...'];
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setHasPaidForSession(false);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !currentUser) return;
    
    if (currentUser.balance < generationCost && !hasPaidForSession) {
      setError('আপনার পর্যাপ্ত ব্যালেন্স নেই। দয়া করে রিচার্জ করুন।');
      setShowWarning(false);
      return;
    }

    setShowWarning(false);
    setIsGenerating(true);
    setError('');
    
    try {
      const sizeStr = options.size === 'কাস্টম সাইজ' ? `${options.customWidth}x${options.customHeight} মিমি` : options.size;
      const processedResult = await processImage(image, { ...options, size: sizeStr });
      
      if (processedResult) {
        // Update Balance in DB if not paid yet for this image session
        if (!hasPaidForSession) {
          const newBal = currentUser.balance - generationCost;
          const { error: balError } = await supabase.from('profiles').update({ balance: newBal }).eq('id', currentUser.id);
          if (!balError) {
            setCurrentUser({ ...currentUser, balance: newBal });
            setHasPaidForSession(true);
          }
        }

        // Save Photo Record to DB
        const { data: newPhoto, error: photoError } = await supabase.from('photos').insert({
          user_id: currentUser.id,
          user_name: currentUser.name,
          original_image: image,
          result_image: processedResult,
          options: { ...options, size: sizeStr }
        }).select().single();

        if (newPhoto) {
          setPhotos(prev => [newPhoto, ...prev]);
        }

        setResult(processedResult);
        setStep(3);
      } else {
        throw new Error('AI Generation failed');
      }
    } catch (err) {
      setError('একটি ত্রুটি হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn mb-20">
      <div className="glass rounded-[3.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-white relative">
        {isGenerating && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center">
             <div className="relative mb-10">
                <div className="w-24 h-24 border-4 border-blue-600/20 rounded-full"></div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <Sparkles size={32} className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
             </div>
             <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{loadingText}</h3>
             <p className="text-slate-500 font-bold max-w-xs">আমাদের উন্নত এআই আপনার ছবিটি প্রসেস করছে, অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।</p>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3 tracking-tight"><Sparkles className="text-amber-400" /> এআই স্টুডিও</h2>
            <p className="text-blue-100 font-bold mt-1">পাসপোর্ট ও স্ট্যাম্প সাইজ ফটোর সেরা সমাধান</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 font-black text-lg flex items-center gap-2">
            <Zap size={20} className="text-amber-300" /> ৳{generationCost} <span className="text-xs opacity-60">/ ছবি</span>
          </div>
        </div>

        <div className="p-10">
          {error && (
            <div className="mb-8 p-5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center gap-3 font-bold animate-shake">
               <AlertCircle /> {error}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="group p-12 bg-slate-50 hover:bg-white rounded-[3rem] flex flex-col items-center gap-6 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 active:scale-95"
              >
                <div className="p-6 bg-blue-100 text-blue-600 rounded-[2rem] group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                  <Upload size={48} />
                </div>
                <div className="text-center">
                  <h4 className="font-black text-2xl text-slate-900 mb-1">গ্যালারি থেকে</h4>
                  <p className="text-slate-500 font-bold">আপনার ফোন থেকে ছবি সিলেক্ট করুন</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              </button>
              
              <button 
                className="group p-12 bg-slate-50 hover:bg-white rounded-[3rem] flex flex-col items-center gap-6 border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:shadow-2xl transition-all duration-500 active:scale-95 cursor-not-allowed opacity-60"
                title="শীঘ্রই আসছে"
              >
                <div className="p-6 bg-emerald-100 text-emerald-600 rounded-[2rem]">
                  <Camera size={48} />
                </div>
                <div className="text-center">
                  <h4 className="font-black text-2xl text-slate-900 mb-1">সরাসরি ক্যামেরা</h4>
                  <p className="text-slate-500 font-bold">সরাসরি ছবি তুলুন (শীঘ্রই আসছে)</p>
                </div>
              </button>
            </div>
          )}

          {step === 2 && image && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="relative group">
                  <img src={image} className="w-full rounded-[3rem] border-4 border-white shadow-2xl aspect-[3/4] object-cover" alt="Original" />
                  <div className="absolute inset-0 bg-black/40 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setStep(1)} className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black flex items-center gap-2">
                       <RefreshCw size={18} /> ছবি বদলান
                    </button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-900 font-black flex items-center gap-2 transition-colors">
                    <ArrowLeft size={16}/> অন্য ছবি আপলোড করুন
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">আপনার লিঙ্গ</label>
                  <div className="flex gap-4">
                    {['male', 'female'].map(g => (
                      <button 
                        key={g} 
                        onClick={() => setOptions({...options, gender: g as any, dress: GENDER_DRESSES[g as any][0]})}
                        className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 ${options.gender === g ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                      >
                        {g === 'male' ? 'ছেলে' : 'মেয়ে'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">পছন্দের পোশাক</label>
                  <select 
                    className="w-full bg-white border-2 border-slate-100 p-5 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    value={options.dress}
                    onChange={e => setOptions({...options, dress: e.target.value})}
                  >
                    {GENDER_DRESSES[options.gender].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">ব্যাকগ্রাউন্ড রঙ</label>
                  <div className="grid grid-cols-5 gap-3">
                    {BACKGROUND_COLORS.map(c => (
                      <button 
                        key={c.name} 
                        onClick={() => setOptions({...options, background: c.name})} 
                        className={`aspect-square rounded-2xl border-4 transition-all flex items-center justify-center ${options.background === c.name ? 'border-blue-600 scale-110 shadow-lg' : 'border-white hover:border-slate-200'}`} 
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {options.background === c.name && <CheckCircle size={20} className={c.name === 'সাদা' ? 'text-blue-600' : 'text-white'} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => setShowWarning(true)} 
                    className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 group"
                  >
                    <Zap size={28} className="text-amber-400 group-hover:scale-125 transition-transform" /> 
                    এআই জেনারেট
                  </button>
                  <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">এক ক্লিকেই স্টুডিও কোয়ালিটি রেজাল্ট</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="flex flex-col items-center py-10 animate-fadeIn">
              <div className="w-full max-w-sm glass bg-white p-2 rounded-[3.5rem] shadow-2xl border-2 border-blue-50 mb-12 transform hover:scale-[1.02] transition-transform duration-500">
                <img src={result} className="w-full rounded-[3rem] object-cover" alt="Result" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                 <button 
                   onClick={() => { const l=document.createElement('a'); l.href=result; l.download='anan_tech_ai_photo.png'; l.click(); }} 
                   className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                 >
                   <Download size={22} /> ডাউনলোড করুন
                 </button>
                 <button 
                   onClick={() => setStep(1)} 
                   className="flex-1 bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                 >
                   <RefreshCw size={22} /> নতুন ছবি বানান
                 </button>
              </div>
              
              <div className="mt-12 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4 max-w-md">
                 <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm"><CheckCircle size={24}/></div>
                 <p className="text-sm font-bold text-blue-800">আপনার ছবিটি সফলভাবে তৈরি হয়েছে! গ্যালারিতে সেভ করতে ডাউনলোড বাটনে ক্লিক করুন।</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showWarning && (
        <div className="fixed inset-0 z-[110] bg-slate-900/70 flex items-center justify-center p-6 backdrop-blur-md animate-fadeIn">
           <div className="bg-white p-12 rounded-[3.5rem] w-full max-w-sm text-center shadow-2xl border border-white relative animate-pop">
              <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-amber-500">
                <ShieldAlert size={48} />
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">ব্যালেন্স নিশ্চিত</h3>
              <p className="text-slate-500 mb-10 font-bold leading-relaxed">এই ছবিটি জেনারেট করতে আপনার একাউন্ট থেকে <span className="text-blue-600 font-black">৳{generationCost}</span> কাটা হবে।</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleGenerate} 
                  className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-[1.8rem] font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  হ্যাঁ, শুরু করুন <Zap size={18} className="text-amber-400" />
                </button>
                <button 
                  onClick={() => setShowWarning(false)} 
                  className="w-full py-5 bg-slate-100 text-slate-500 rounded-[1.8rem] font-black hover:bg-slate-200 transition-all"
                >
                  এখন না
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Studio;
