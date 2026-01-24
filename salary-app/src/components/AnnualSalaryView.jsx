import React from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Plus, 
  Trash2, 
  FileText, 
  Calculator, 
  X, 
  PieChart, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';
// 請確保 CommonComponents.jsx 位於同一目錄下
import { CollapsibleCard, InputGroup, BarItem } from './CommonComponents';

export const AnnualSalaryView = ({ 
  incomeItems, deductionItems, bonuses, results, 
  handleIncomeChange, handleLevelSelectChange, handleLevelAmountChange, handleDeductionChange, handleBonusChange, addBonus, removeBonus,
  selectedLevelCode, LEVEL_OPTIONS, formatCurrency, blockInvalidChar, showDetails, setShowDetails
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95 duration-300">
    {/* Left Side */}
    <div className="lg:col-span-7 space-y-6">
      {/* Income - Default Open set to true (預設展開) */}
      <CollapsibleCard 
        title={<><ArrowUpCircle className="w-5 h-5" /> 每月薪津項目 (收入)</>}
        summary={
          <div className="flex flex-col items-end">
            <span className="text-blue-100 text-sm">應領小計: {formatCurrency(results.monthlyGross)}</span>
            {results.monthlyGross !== results.monthlyCashGross && (<span className="text-blue-200 text-xs">(現金應領: {formatCurrency(results.monthlyCashGross)})</span>)}
          </div>
        }
        headerColor="bg-blue-600 dark:bg-blue-800"
        defaultOpen={true}
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <InputGroup label="3. 伙食津貼" value={incomeItems.meal} onChange={(v) => handleIncomeChange('meal', v)} onKeyDown={blockInvalidChar} />
          <InputGroup label="4. 交通津貼" value={incomeItems.transport} onChange={(v) => handleIncomeChange('transport', v)} onKeyDown={blockInvalidChar} />
          <div className="md:col-span-1">
            <InputGroup label={<span className="flex items-center gap-1">5. 全勤獎金 (月)<span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal ml-1">(薪額+職加)/30</span></span>}
              value={incomeItems.attendance} onChange={(v) => handleIncomeChange('attendance', v)} placeholder="自動計算" onKeyDown={blockInvalidChar} />
          </div>
          <InputGroup label="6. 持股信託獎勵金" value={incomeItems.stockBonus} onChange={(v) => handleIncomeChange('stockBonus', v)} placeholder="自動計算" onKeyDown={blockInvalidChar} readOnly locked />
          <InputGroup label="7. 留才增給持股" value={incomeItems.retentionBonus} onChange={(v) => handleIncomeChange('retentionBonus', v)} placeholder="自動計算" onKeyDown={blockInvalidChar} readOnly locked />
        </div>
        <div className="bg-blue-50 dark:bg-slate-700/50 px-6 py-2 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2 transition-colors">
          <HelpCircle className="w-4 h-4" /> <span>說明：已將年度全勤獎金(0.4個月)視為包含在每月的「全勤獎金」中。</span>
        </div>
      </CollapsibleCard>

      {/* Deduction */}
      <CollapsibleCard 
        title={<><ArrowDownCircle className="w-5 h-5" /> 每月扣款／提存</>}
        summary={<span className="text-slate-300 text-sm">小計: -{formatCurrency(results.monthlyDeduction)}</span>}
        headerColor="bg-slate-700 dark:bg-slate-900"
        defaultOpen={false}
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputGroup label="1. 工會會費" value={deductionItems.unionFee} onChange={(v) => handleDeductionChange('unionFee', v)} onKeyDown={blockInvalidChar} placeholder="自動計算" />
          <InputGroup label="2. 傷亡互助金" value={deductionItems.unionMutual} onChange={(v) => handleDeductionChange('unionMutual', v)} onKeyDown={blockInvalidChar} />
          <InputGroup label="3. 勞保費" value={deductionItems.labor} onChange={(v) => handleDeductionChange('labor', v)} onKeyDown={blockInvalidChar} placeholder="自動計算" />
          <InputGroup label="4. 職工福利金" value={deductionItems.welfare} onChange={(v) => handleDeductionChange('welfare', v)} onKeyDown={blockInvalidChar} placeholder="自動計算" />
          <InputGroup label="5. 全民健保費" value={deductionItems.health} onChange={(v) => handleDeductionChange('health', v)} onKeyDown={blockInvalidChar} placeholder="自動計算" />
          <InputGroup label="6. 持股信託提存金" value={deductionItems.stockTrust} onChange={(v) => handleDeductionChange('stockTrust', v)} onKeyDown={blockInvalidChar} placeholder="自動計算" readOnly locked />
          <InputGroup label="7. 持股信託獎勵金" value={deductionItems.stockBonus} onChange={()=>{}} placeholder="自動帶入" readOnly locked />
          <InputGroup label="8. 留才增給持股" value={deductionItems.retentionBonus} onChange={()=>{}} placeholder="自動帶入" readOnly locked />
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span>說明：健保級距是以薪額+層次職加+伙食津貼+交通津貼+全勤獎金做計算。</span>
        </div>
      </CollapsibleCard>

      {/* Bonus */}
      <CollapsibleCard 
        title={<><Wallet className="w-5 h-5" /> 年度獎金與分紅</>}
        summary={
          <div className="flex items-center gap-3">
             <span className="text-white/90 text-sm hidden sm:inline">獎金總計: {formatCurrency(results.totalBonus)}</span>
             <button onClick={(e) => { e.stopPropagation(); addBonus(); }} className="text-xs bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-3 py-1 rounded-full transition flex items-center gap-1 shadow-sm border border-emerald-500"><Plus className="w-3 h-3" /> 新增</button>
          </div>
        }
        headerColor="bg-emerald-600 dark:bg-emerald-800"
        defaultOpen={false}
      >
        <div className="p-4 space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 dark:text-slate-400 px-2 mb-1">
            <div className="col-span-4">項目名稱</div><div className="col-span-3">類型</div><div className="col-span-3">數值</div><div className="col-span-2 text-right">預估金額</div>
          </div>
          {bonuses.map((bonus) => (
            <div key={bonus.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <div className="col-span-4">
                <input type="text" value={bonus.name} onChange={(e) => handleBonusChange(bonus.id, 'name', e.target.value)}
                  className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 outline-none text-sm font-medium dark:text-slate-200" />
              </div>
              <div className="col-span-3">
                <select value={bonus.type} onChange={(e) => handleBonusChange(bonus.id, 'type', e.target.value)} className="w-full text-xs p-1 bg-white dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500 border border-slate-300 rounded" >
                  <option value="month">個月 (Base)</option><option value="fixed">固定金額</option>
                </select>
              </div>
              <div className="col-span-3 relative">
                <input type="number" min="0" value={bonus.value} onChange={(e) => handleBonusChange(bonus.id, 'value', e.target.value)} onKeyDown={blockInvalidChar} step={bonus.type === 'month' ? 0.1 : 1000} className="w-full p-1 text-right text-sm bg-white dark:bg-slate-600 dark:text-white border border-slate-300 dark:border-slate-500 rounded outline-none focus:border-emerald-500" />
              </div>
              <div className="col-span-2 flex justify-end items-center gap-2">
                <span className="text-sm font-mono text-emerald-700 dark:text-emerald-400">
                  {bonus.type === 'month' ? ((Number(bonus.value) || 0) * results.bonusBase / 10000).toFixed(1) + '萬' : ((Number(bonus.value) || 0) / 10000).toFixed(1) + '萬'}
                </span>
                <button onClick={() => removeBonus(bonus.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="w-3 h-3"/></button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-emerald-50 dark:bg-slate-700/50 px-6 py-2 text-right text-sm font-bold text-emerald-800 dark:text-emerald-400 transition-colors sm:hidden">獎金總計: {formatCurrency(results.totalBonus)}</div>
      </CollapsibleCard>
    </div>

    {/* Right Side - Summary */}
    <div className="lg:col-span-5 space-y-6">
      <div className="bg-slate-800 dark:bg-slate-900 text-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500"></div>
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">預估稅前總年薪 (含股票)</h3>
        <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono tracking-tight">{formatCurrency(results.annualGross)}</div>
        <div className="text-slate-400 text-sm mb-6 flex flex-col items-center gap-1">
          <span>(不含股票約 {formatCurrency(results.annualCashGross)})</span>
          <span className="text-xs text-slate-500 mt-1">月實領約 {formatCurrency(results.monthlyNet)}</span>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-700 pt-6">
          <div className="text-left"><div className="text-xs text-slate-400 mb-1">固定薪資 (12個月)</div><div className="text-lg font-semibold text-blue-300">{formatCurrency(results.monthlyGross * 12)}</div></div>
          <div className="text-right"><div className="text-xs text-slate-400 mb-1">變動獎金與分紅</div><div className="text-lg font-semibold text-emerald-300">{formatCurrency(results.totalBonus)}</div></div>
        </div>
         <button onClick={() => setShowDetails(!showDetails)} className="mt-6 w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded text-sm flex items-center justify-center gap-2 transition border border-slate-600 hover:border-slate-500"><FileText className="w-4 h-4" />{showDetails ? '隱藏計算明細' : '查看計算過程明細'}</button>
      </div>

      {showDetails && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-in fade-in zoom-in-95 duration-200 transition-colors">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Calculator className="w-5 h-5 text-blue-500" /> 計算過程明細</h3>
            <button onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-4 h-4"/></button>
          </div>
          <div className="space-y-4 text-sm font-mono text-slate-600 dark:text-slate-300">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
               <div className="font-bold text-slate-800 dark:text-white mb-2 text-base">一、每月實領計算 (Cash Flow)</div>
               <div className="pl-2 space-y-2">
                  <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">1. 應領月薪總額 (Gross)</span><span className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(results.monthlyGross)}</span></div>
                  <div className="text-xs text-slate-400 pl-4 mb-2">(含 薪額+職加+伙食+交通+全勤+持股+留才)</div>
                  <div className="flex justify-between items-center text-red-400 dark:text-red-300"><span>2. 應扣款項總額 (Deduction)</span><span>- {formatCurrency(results.monthlyDeduction)}</span></div>
                  <div className="text-xs text-slate-400 pl-4 mb-2">(含 工會+勞健保+福利金+持股自提+持股獎勵+留才)</div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded text-xs space-y-1 mt-2">
                    <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">實領計算說明：</div>
                    <div className="flex justify-between"><span>現金項目 (薪+職+伙+交+勤)</span><span>{formatCurrency(results.monthlyCashGross)}</span></div>
                    <div className="flex justify-between text-slate-400"><span>非現金項目 (持股+留才)</span><span>+ {formatCurrency((Number(incomeItems.stockBonus)||0) + (Number(incomeItems.retentionBonus)||0))}</span></div>
                    <div className="flex justify-between text-slate-400 border-b border-slate-200 dark:border-slate-600 pb-1"><span>非現金扣回 (持股+留才)</span><span>- {formatCurrency((Number(deductionItems.stockBonus)||0) + (Number(deductionItems.retentionBonus)||0))}</span></div>
                    <div className="flex justify-between text-red-400 dark:text-red-300 pt-1"><span>常規扣款 (勞健保等)</span><span>- {formatCurrency(results.monthlyDeduction - (Number(deductionItems.stockBonus)||0) - (Number(deductionItems.retentionBonus)||0))}</span></div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-lg text-slate-800 dark:text-white"><span>每月實領 (Net)</span><span>{formatCurrency(results.monthlyNet)}</span></div>
               </div>
            </div>
            <div>
              <div className="font-bold text-slate-800 dark:text-white mb-1">二、年度獎金明細</div>
              <div className="pl-4 border-l-2 border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="mb-2 text-xs text-slate-500 dark:text-slate-400"><span>獎金基底 (薪額+職加) = </span><span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(results.bonusBase)}</span></div>
                {bonuses.map(b => {
                  const val = Number(b.value) || 0;
                  return (<div key={b.id} className="flex justify-between"><span>{b.name} {b.type === 'month' ? ` (${val}個月)` : ''}</span><span>{b.type === 'month' ? `${formatCurrency(results.bonusBase)} × ${val} = ${formatCurrency(val * results.bonusBase)}` : formatCurrency(val)}</span></div>);
                })}
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-100 dark:border-slate-700 pt-1 mt-1"><span>獎金總計</span><span>= {formatCurrency(results.totalBonus)}</span></div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2"><div className="flex justify-between font-bold text-base text-slate-900 dark:text-white"><span>總年薪 (月薪x12 + 獎金)</span><span>{formatCurrency(results.annualGross)}</span></div></div>
          </div>
        </div>
      )}

      {!showDetails && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2"><PieChart className="w-5 h-5" /> 薪資結構分析</h3>
          <div className="space-y-4">
            <BarItem label="底薪結構 (薪額+職加)" value={results.bonusBase * 12} total={results.annualGross} color="bg-blue-500" />
            <BarItem label="月津貼 (含伙食、交通、持股等)" value={(results.monthlyGross - results.bonusBase) * 12} total={results.annualGross} color="bg-blue-300" />
            <BarItem label="年節與績效獎金" value={results.totalBonus} total={results.annualGross} color="bg-emerald-500" />
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">快速摘要</h4>
            <ul className="text-sm space-y-2 text-slate-500 dark:text-slate-400">
              <li className="flex justify-between"><span>月薪總額 (應領):</span><span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(results.monthlyGross)}</span></li>
              <li className="flex justify-between text-red-400 dark:text-red-300"><span>每月扣款:</span><span className="font-mono">- {formatCurrency(results.monthlyDeduction)}</span></li>
              <li className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-2 font-bold"><span>每月實領 (Net):</span><span className="font-mono text-slate-800 dark:text-slate-100">{formatCurrency(results.monthlyNet)}</span></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  </div>
);
