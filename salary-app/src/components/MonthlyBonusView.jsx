import React from 'react';
import { Coins, ChevronDown, Calendar } from 'lucide-react';
import { InputGroup } from './CommonComponents';

export const MonthlyBonusView = ({ 
  incomeItems, handleIncomeChange, handleLevelSelectChange, handleLevelAmountChange, 
  selectedLevelCode, LEVEL_OPTIONS, formatCurrency, blockInvalidChar, bonusBase
}) => {
  const timeline = [
    { 
      id: 1, 
      month: '1~2月份 (春節前)', 
      items: [
        { name: '績效獎金(預發)', months: 2.0, color: 'text-indigo-600 dark:text-indigo-400' },
        { name: '企業化獎金(預發)', months: 0.5, color: 'text-purple-600 dark:text-purple-400' },
        { name: '春節獎金', months: 1.0, color: 'text-red-600 dark:text-red-400' }
      ]
    },
    { id: 2, month: '4月', items: [{ name: '績效獎金(尾款)', months: 0.6, color: 'text-indigo-600 dark:text-indigo-400' }] },
    { id: 3, month: '5月', items: [{ name: '企業化獎金(尾款)', months: 1.5, color: 'text-purple-600 dark:text-purple-400' }] },
    { id: 4, month: '6月', items: [{ name: '端午節獎金', months: 0.3, color: 'text-emerald-600 dark:text-emerald-400' }] },
    { id: 5, month: '7月', items: [{ name: '員工酬勞', months: 1.0, color: 'text-orange-600 dark:text-orange-400' }] },
    { id: 6, month: '9月', items: [{ name: '中秋節獎金', months: 0.3, color: 'text-emerald-600 dark:text-emerald-400' }] },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-6 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">獎金計算基數設定</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="1. 薪額 (獎金基底)" value={incomeItems.base} onChange={(v) => handleIncomeChange('base', v)} highlight onKeyDown={blockInvalidChar} />
          <div className="md:col-span-1">
            <label className="block text-xs font-medium mb-1 text-blue-600 dark:text-blue-400">2. 層次職加 (獎金基底)</label>
            <div className="flex gap-2">
              <div className="relative w-1/3">
                <select value={selectedLevelCode} onChange={handleLevelSelectChange} 
                  className="w-full h-full p-2 pl-2 text-sm bg-blue-50 dark:bg-slate-700 border border-blue-300 dark:border-slate-600 rounded outline-none focus:ring-2 focus:ring-blue-200 appearance-none font-mono dark:text-slate-200">
                  <option value="">選擇</option>
                  <option value="custom">自訂</option>
                  {LEVEL_OPTIONS.map(opt => <option key={opt.code} value={opt.code}>{opt.code}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-3 w-3 h-3 text-blue-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                  <input type="number" min="0" value={incomeItems.level} onChange={(e) => handleLevelAmountChange(e.target.value)} onKeyDown={blockInvalidChar}
                  placeholder="輸入金額" className="w-full p-2 pl-3 text-right border border-blue-300 bg-blue-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded outline-none transition font-mono focus:ring-2 focus:ring-blue-200 placeholder:text-slate-300 dark:placeholder:text-slate-500" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">目前計算基數 (1個月):</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">{formatCurrency(bonusBase)}</span>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-sm space-y-2 text-slate-600 dark:text-slate-300">
        <h3 className="font-bold text-slate-800 dark:text-white mb-2">💡 獎金構成說明</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>春節 1.0 + 績效 2.6 + 端午 0.3 + 中秋 0.3 = <span className="font-bold text-blue-600 dark:text-blue-400">4.2 個月</span></li>
          <li>企業化獎金：2.0 個月 (非固定，依公司營運)</li>
          <li>員工酬勞：1.0 個月 (非固定，依公司獲利)</li>
          <li>全勤獎金：0.4 個月 (已平均於每月薪資發放)</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeline.map((slot) => {
          const slotTotalMonths = slot.items.reduce((acc, item) => acc + item.months, 0);
          return (
            <div key={slot.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors">
              <div className="bg-slate-100 dark:bg-slate-900/50 px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {slot.month}
                </div>
                <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                  共 {slotTotalMonths.toFixed(1)} 個月
                </span>
              </div>
              <div className="p-4 flex-1 space-y-3">
                {slot.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className={item.color}>{item.name}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">{item.months}m</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">預估金額</span>
                <span className="font-bold text-slate-800 dark:text-white font-mono text-lg">
                  {formatCurrency(Math.round(bonusBase * slotTotalMonths))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};