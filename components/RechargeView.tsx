
import React, { useState } from 'react';
import { User, RechargeRequest, SystemSettings } from '../types';
import { Wallet, CreditCard, Send, History, CheckCircle, Info, Image as ImageIcon, Copy, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { supabase } from '../supabase';

interface RechargeViewProps {
  currentUser: User;
  recharges: RechargeRequest[];
  setRecharges: React.Dispatch<React.SetStateAction<RechargeRequest[]>>;
  settings: SystemSettings;
}

const RechargeView: React.FC<RechargeViewProps> = ({ currentUser, recharges, setRecharges, settings }) => {
  const [formData, setFormData] = useState({
    amount: '',
    method: settings.paymentMethods[0]?.name || '',
    senderNumber: '',
    trxId: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Temporary visual feedback could be added here
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.senderNumber || !formData.trxId) return;

    setError('');
    setIsProcessing(true);

    try {
      const { data, error: insertError } = await supabase.from('recharge_requests').insert({
        user_id: currentUser.id,
        user_name: currentUser.name,
        amount: parseFloat(formData.amount),
        method: formData.method,
        sender_number: formData.senderNumber,
        trx_id: formData.trxId,
        status: 'PENDING'
      }).select().single();

      if (insertError) {
        if (insertError.code === '23505') throw new Error('এই TrxID দিয়ে আগে অনুরোধ করা হয়েছে।');
        throw insertError;
      }

      if (data) {
        setRecharges(prev => [data, ...prev]);
        setSuccess(true);
        setFormData({ ...formData, amount: '', senderNumber: '', trxId: '' });
        setTimeout(() => setSuccess(false), 8000);
      }
    } catch (err: any) {
      setError(err.message || 'অনুরোধ জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fadeIn max-w-7xl mx-auto pb-20">
      <div className="space-y-8">
        <div className="glass bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200/60 border border-white">
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-[1.5rem] shadow-xl shadow-blue-200">
              <CreditCard size={32}/>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">ব্যালেন্স রিচার্জ</h2>
              <p className="text-slate-500 font-bold">নিচের নম্বরগুলোতে পেমেন্ট করে ট্রানজেকশন তথ্য দিন।</p>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            {settings.paymentMethods.map(pm => (
              <div key={pm.name} className="bg-slate-50/80 p-6 rounded-[2rem] flex items-center justify-between border border-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner p-2 border border-slate-100">
                    {pm.logo ? (
                      <img src={pm.logo} className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={32} />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-1">{pm.name} নম্বর (Cash Out)</p>
                    <p className="text-xl font-black text-slate-900 font-mono select-all tracking-tight">{pm.number}</p>
                  </div>
                </div>
                <button 
                  onClick={() => copyToClipboard(pm.number)}
                  className="p-3 bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                  title="নম্বর কপি করুন"
                >
                  <Copy size={20} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
             {error && (
               <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl font-bold border border-rose-100 flex items-center gap-3 animate-shake">
                 <AlertCircle size={20}/> {error}
               </div>
             )}

             {success && (
               <div className="p-6 bg-emerald-50 text-emerald-700 rounded-2xl font-black border border-emerald-100 flex items-center gap-4 animate-pop">
                 <div className="p-2 bg-white rounded-full"><CheckCircle size={24}/></div>
                 <div>
                    <p className="leading-none mb-1">সফলভাবে জমা হয়েছে!</p>
                    <p className="text-xs font-bold opacity-70">এডমিন চেক করে ৫-১০ মিনিটের মধ্যে ব্যালেন্স যোগ করবেন।</p>
                 </div>
               </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">পরিমাণ (৳)</label>
                  <input type="number" placeholder="৳০০.০০" className="w-full bg-white border border-slate-100 p-4.5 rounded-[1.5rem] font-black outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm" value={formData.amount} onChange={e=>setFormData({...formData, amount:e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">মেথড</label>
                  <select className="w-full bg-white border border-slate-100 p-4.5 rounded-[1.5rem] font-black outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer" value={formData.method} onChange={e=>setFormData({...formData, method:e.target.value})}>
                     {settings.paymentMethods.map(pm => <option key={pm.name} value={pm.name}>{pm.name}</option>)}
                  </select>
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">প্রেরক নম্বর</label>
                <input type="text" placeholder="০১৭xxxxxxxx" className="w-full bg-white border border-slate-100 p-4.5 rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm" value={formData.senderNumber} onChange={e=>setFormData({...formData, senderNumber:e.target.value})} required />
             </div>

             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">ট্রানজেকশন আইডি (TrxID)</label>
                <input type="text" placeholder="8N7H6V..." className="w-full bg-white border border-slate-100 p-4.5 rounded-[1.5rem] font-black font-mono text-blue-600 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm tracking-widest" value={formData.trxId} onChange={e=>setFormData({...formData, trxId:e.target.value})} required />
             </div>

             <button 
                disabled={isProcessing}
                type="submit" 
                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[1.8rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
             >
                {isProcessing ? <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                  <>
                    রিচার্জ সাবমিট করুন <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
             </button>
          </form>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight"><History className="text-indigo-600"/> রিচার্জ রেকর্ড</h3>
          <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 shadow-sm">{recharges.length} টি অনুরোধ</span>
        </div>

        <div className="space-y-5">
          {recharges.length === 0 ? (
            <div className="glass bg-white/40 p-16 rounded-[3.5rem] text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
               <div className="p-6 bg-slate-100 rounded-3xl text-slate-300 mb-6"><History size={40}/></div>
               <p className="text-slate-400 font-bold max-w-[200px]">আপনার কোনো রিচার্জ হিস্টোরি নেই।</p>
            </div>
          ) : (
            recharges.map(req => (
              <div key={req.id} className="bg-white p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white hover:shadow-2xl transition-all duration-500 group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Wallet size={24}/>
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">{req.method}</p>
                       <h4 className="text-3xl font-black text-slate-900 tracking-tighter">৳{req.amount}</h4>
                     </div>
                  </div>
                  <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                    req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    req.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {req.status === 'PENDING' && <Clock size={12} className="animate-spin" />}
                    {req.status === 'APPROVED' ? 'অনুমোদিত' : req.status === 'REJECTED' ? 'বাতিল' : 'অপেক্ষমান'}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TrxID</p>
                    <p className="font-mono text-xs font-black text-blue-500 tracking-wider">{req.trx_id}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">তারিখ ও সময়</p>
                    <p className="text-[11px] font-bold text-slate-500">{format(new Date(req.created_at), 'dd MMM, p', {locale: bn})}</p>
                  </div>
                </div>

                {req.rejection_reason && (
                  <div className="mt-6 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">বাতিলের কারণ</p>
                    <p className="text-sm font-bold text-rose-600">{req.rejection_reason}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RechargeView;
