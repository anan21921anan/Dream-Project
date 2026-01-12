
import React, { useState } from 'react';
import { PhotoRecord } from '../types';
import { Download, Calendar, Search, Image as ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface HistoryViewProps {
  photos: PhotoRecord[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ photos }) => {
  const [filterDate, setFilterDate] = useState('');

  const filteredPhotos = photos.filter(p => {
    if (!filterDate) return true;
    return format(new Date(p.created_at), 'yyyy-MM-dd') === filterDate;
  });

  const downloadImage = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `anan_tech_photo_${id}.png`;
    link.click();
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white/40 p-10 rounded-[3rem] border border-white shadow-xl shadow-slate-200/50">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">ছবির ইতিহাস</h2>
          <p className="text-slate-500 font-bold text-lg">আপনার তৈরি করা আগের সকল স্টুডিও কোয়ালিটি ছবি এখানে পাবেন।</p>
        </div>
        
        <div className="relative group">
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[1.8rem] shadow-lg border border-slate-100 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <Calendar size={22} className="text-blue-500" />
            <input 
              type="date" 
              className="outline-none text-sm font-black text-slate-700 bg-transparent"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')} 
                className="p-1 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"
              >
                <X size={16}/>
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="glass bg-white p-24 flex flex-col items-center justify-center text-center rounded-[3.5rem] shadow-xl border border-white animate-fadeIn">
          <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
            <ImageIcon size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">কোনো ছবি পাওয়া যায়নি</h3>
          <p className="text-slate-500 font-bold max-w-xs leading-relaxed">আপনি এখনো কোনো ছবি তৈরি করেননি অথবা আপনার সিলেক্ট করা তারিখে কোনো ছবি নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="group relative bg-white rounded-[2.5rem] p-3 shadow-xl shadow-slate-200/60 border border-white hover:shadow-2xl hover:-translate-y-3 transition-all duration-500">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-slate-50">
                <img 
                  src={photo.result_image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  alt="Result" 
                />
                
                {/* Overlay Action */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-[3px]">
                   <button 
                     onClick={() => downloadImage(photo.result_image, photo.id)}
                     className="bg-white text-slate-900 p-5 rounded-[1.5rem] shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-blue-600 hover:text-white"
                   >
                     <Download size={28} />
                   </button>
                </div>

                {/* Date Badge */}
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                  {format(new Date(photo.created_at), 'dd MMM', { locale: bn })}
                </div>
              </div>
              
              <div className="p-4 mt-2">
                <div className="flex items-center gap-2 mb-1.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="font-black text-slate-900 text-[13px] truncate">{photo.options.dress}</p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>{photo.options.size}</span>
                  <span>{format(new Date(photo.created_at), 'p', { locale: bn })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
