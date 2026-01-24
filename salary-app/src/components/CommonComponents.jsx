import React, { useState } from 'react';
import { ShieldCheck, Megaphone, X, ChevronDown, Lock } from 'lucide-react';

// 隱私聲明彈窗
export const DisclaimerModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">隱私安全聲明</h3>
          <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2 text-left bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
            <p>👋 您好！感謝使用薪資試算模擬器。為了讓您安心使用，特此說明：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-bold text-slate-800 dark:text-slate-200">無後端資料庫</span>：本網站為純靜態網頁。</li>
              <li><span className="font-bold text-slate-800 dark:text-slate-200">資料不外流</span>：所有計算皆在您的瀏覽器中執行。</li>
              <li><span className="font-bold text-slate-800 dark:text-slate-200">本機暫存</span>：資料僅暫存於您的裝置 (Local Storage)。</li>
            </ul>
          </div>
          <button onClick={onClose} className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30">
            我瞭解了，開始試算
          </button>
        </div>
      </div>
    </div>
  );
};

// 公告欄
export const BulletinBoard = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4 mb-2 flex items-start gap-4 relative animate-in slide-in-from-top-2 duration-300 shadow-sm">
      <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300 flex-shrink-0">
        <Megaphone className="w-5 h-5" />
      </div>
      <div className="flex-1 pr-6">
        <h4 className="font-bold text-indigo-800 dark:text-indigo-200 text-sm mb-1">最新公告：支援 PWA 與 RWD</h4>
        <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed opacity-90">
          本工具支援 <strong>PWA</strong>，可將網頁「加入主畫面」離線使用！
        </p>
      </div>
      <button onClick={() => setVisible(false)} className="absolute top-2 right-2 p-1 text-indigo-400 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-300 transition-colors rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// 可摺疊卡片
export const CollapsibleCard = ({ title, summary, headerColor, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <div className={`${headerColor} px-6 py-4 flex justify-between items-center cursor-pointer select-none transition-colors group`} onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2 text-white font-bold">
           {title}<ChevronDown className={`w-5 h-5 text-white/80 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
        </div>
        <div onClick={(e) => e.stopPropagation()}>{summary}</div>
      </div>
      {isOpen && <div className="animate-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
};

// 輸入框群組
export const InputGroup = ({ label, value, onChange, highlight = false, placeholder = "輸入金額", readOnly = false, locked = false, onKeyDown, step = 1, suffix }) => (
  <div>
    <label className={`block text-xs font-medium mb-1 ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{label}</label>
    <div className="relative">
      <input type="number" min="0" step={step} value={value} onChange={(e) => !readOnly && onChange(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} readOnly={readOnly}
        className={`w-full p-2 pl-3 ${suffix ? 'pr-8' : 'pr-3'} text-right border rounded outline-none transition font-mono 
        ${readOnly ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed' : 'bg-white dark:bg-slate-900 focus:border-slate-400'} 
        ${highlight ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800' : 'border-slate-200 dark:border-slate-600'} 
        text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600`} />
      {locked && <Lock className="absolute left-3 top-2.5 w-3 h-3 text-slate-400" />}
      {suffix && <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">{suffix}</span>}
    </div>
  </div>
);

// 長條圖項目
export const BarItem = ({ label, value, total, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1 text-slate-500 dark:text-slate-400"><span>{label}</span><span>{total > 0 ? Math.round((value / total) * 100) : 0}%</span></div>
    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden"><div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}></div></div>
  </div>
);