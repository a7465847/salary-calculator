import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, DollarSign, PieChart, Plus, Trash2, Wallet, ArrowDownCircle, ArrowUpCircle, HelpCircle, FileText, X, ChevronDown, Lock, RotateCcw } from 'lucide-react';

const App = () => {
  // --- 常數設定 ---
  const LEVEL_OPTIONS = useMemo(() => [
    { code: '19', value: 51795 },
    { code: '18', value: 44735 },
    { code: '17', value: 39435 },
    { code: '16', value: 35905 },
    { code: '15', value: 32370 },
    { code: '14', value: 28840 },
    { code: '13', value: 25310 },
    { code: '12', value: 21780 },
    { code: '11', value: 19135 },
    { code: '10', value: 16480 },
    { code: '09', value: 13835 },
    { code: '08', value: 11190 },
    { code: '07', value: 9420 },
    { code: '06', value: 8245 },
    { code: '05', value: 7070 },
    { code: '04', value: 5890 },
    { code: '03', value: 4715 },
    { code: '02', value: 3535 },
    { code: '01', value: 2360 },
    { code: '00', value: 0 },
  ], []);

  // 定義初始預設值 (用於重置或第一次載入)
  // 更新：伙食津貼預設 3000，交通津貼預設 2500
  const DEFAULT_INCOME = {
    base: '', level: '', meal: 3000, transport: 2500, attendance: '', stockBonus: '', retentionBonus: ''
  };
  const DEFAULT_DEDUCTION = {
    unionFee: '', unionMutual: '', labor: '', welfare: '', health: '', stockTrust: '', stockBonus: '', retentionBonus: ''
  };
  const DEFAULT_BONUSES = [
    { id: 1, name: '春節獎金', type: 'month', value: 1.0 },
    { id: 2, name: '端午節獎金', type: 'month', value: 0.3 },
    { id: 3, name: '中秋節獎金', type: 'month', value: 0.3 },
    { id: 5, name: '績效獎金', type: 'month', value: 2.6 },
    { id: 6, name: '企業化特別獎金', type: 'fixed', value: 200000 },
    { id: 7, name: '員工酬勞', type: 'fixed', value: 50000 },
  ];

  // --- 輔助函式：讀取 LocalStorage ---
  const loadState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error('讀取暫存失敗:', e);
      return defaultValue;
    }
  };

  // --- 狀態管理 (初始化時優先讀取暫存) ---

  // 1. 月薪收入
  const [incomeItems, setIncomeItems] = useState(() => loadState('salary_income', DEFAULT_INCOME));

  // 層次職加選單
  const [selectedLevelCode, setSelectedLevelCode] = useState(() => loadState('salary_level_code', ''));

  // 2. 月扣款
  const [deductionItems, setDeductionItems] = useState(() => loadState('salary_deduction', DEFAULT_DEDUCTION));

  // 3. 年度獎金
  const [bonuses, setBonuses] = useState(() => loadState('salary_bonuses', DEFAULT_BONUSES));

  const [showDetails, setShowDetails] = useState(false);

  // 計算結果 (不需要存，因為每次都會重算)
  const [results, setResults] = useState({
    monthlyGross: 0, monthlyCashGross: 0, monthlyDeduction: 0, monthlyNet: 0,
    bonusBase: 0, totalBonus: 0, annualGross: 0, annualNet: 0,
  });

  // --- 監聽狀態變更並寫入 LocalStorage ---
  useEffect(() => { localStorage.setItem('salary_income', JSON.stringify(incomeItems)); }, [incomeItems]);
  useEffect(() => { localStorage.setItem('salary_level_code', JSON.stringify(selectedLevelCode)); }, [selectedLevelCode]);
  useEffect(() => { localStorage.setItem('salary_deduction', JSON.stringify(deductionItems)); }, [deductionItems]);
  useEffect(() => { localStorage.setItem('salary_bonuses', JSON.stringify(bonuses)); }, [bonuses]);

  // --- 功能：清除所有暫存 (重置) ---
  const handleReset = () => {
    if (window.confirm('確定要清除所有輸入的資料並重置嗎？')) {
      setIncomeItems(DEFAULT_INCOME);
      setDeductionItems(DEFAULT_DEDUCTION);
      setBonuses(DEFAULT_BONUSES);
      setSelectedLevelCode('');
      
      // 清除 Storage
      localStorage.removeItem('salary_income');
      localStorage.removeItem('salary_deduction');
      localStorage.removeItem('salary_bonuses');
      localStorage.removeItem('salary_level_code');
    }
  };

  // --- 自動計算 Effect: 全勤獎金 ---
  useEffect(() => {
    const base = Number(incomeItems.base) || 0;
    const level = Number(incomeItems.level) || 0;
    if (base === 0 && level === 0) {
      // 只有當兩者都被清空時，才清空全勤 (避免讀取暫存時被覆蓋)
      // 但為了保留使用者可能手動修改的彈性，這裡僅在計算邏輯觸發時更新
      // 實務上如果從暫存讀取回來，這裡會再次觸發計算，維持一致性
      if (incomeItems.attendance !== '') setIncomeItems(prev => ({ ...prev, attendance: '' }));
    } else {
      const calcAttendance = Math.round((base + level) / 30);
      // 只有數值不同時才更新，避免無限迴圈
      if (Number(incomeItems.attendance) !== calcAttendance) {
        setIncomeItems(prev => ({ ...prev, attendance: calcAttendance }));
      }
    }
  }, [incomeItems.base, incomeItems.level]);

  // --- 自動計算 Effect: 同步扣款項目 ---
  useEffect(() => {
    setDeductionItems(prev => ({
      ...prev,
      stockBonus: incomeItems.stockBonus,
      retentionBonus: incomeItems.retentionBonus
    }));
  }, [incomeItems.stockBonus, incomeItems.retentionBonus]);

  // --- 處理層次職加變更 ---
  const handleLevelSelectChange = (e) => {
    const code = e.target.value;
    setSelectedLevelCode(code);
    if (code !== 'custom') {
      const option = LEVEL_OPTIONS.find(opt => opt.code === code);
      if (option) setIncomeItems(prev => ({ ...prev, level: option.value }));
    }
  };

  const handleLevelAmountChange = (value) => {
    setIncomeItems(prev => ({ ...prev, level: value }));
    if (value !== '') {
      const numValue = Number(value);
      const matchedOption = LEVEL_OPTIONS.find(opt => opt.value === numValue);
      matchedOption ? setSelectedLevelCode(matchedOption.code) : setSelectedLevelCode('custom');
    }
  };

  // --- 主要計算邏輯 ---
  useEffect(() => {
    const val = (v) => (v === '' || isNaN(Number(v))) ? 0 : Number(v);

    const monthlyGross = Object.values(incomeItems).reduce((a, b) => a + val(b), 0);
    const stockItemsValue = val(incomeItems.stockBonus) + val(incomeItems.retentionBonus);
    const monthlyCashGross = monthlyGross - stockItemsValue;
    const monthlyDeduction = Object.values(deductionItems).reduce((a, b) => a + val(b), 0);
    const monthlyNet = monthlyGross - monthlyDeduction;
    const bonusBase = val(incomeItems.base) + val(incomeItems.level);

    const totalBonus = bonuses.reduce((sum, item) => {
      const itemValue = val(item.value);
      return item.type === 'month' ? sum + (itemValue * bonusBase) : sum + itemValue;
    }, 0);

    const annualGross = (monthlyGross * 12) + totalBonus;
    const annualNet = (monthlyNet * 12) + totalBonus; 

    setResults({ monthlyGross, monthlyCashGross, monthlyDeduction, monthlyNet, bonusBase, totalBonus, annualGross, annualNet });
  }, [incomeItems, deductionItems, bonuses]);

  // --- 輔助函式 ---
  const formatCurrency = (num) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(num);

  const handleIncomeChange = (field, value) => setIncomeItems(prev => ({ ...prev, [field]: value }));
  const handleDeductionChange = (field, value) => setDeductionItems(prev => ({ ...prev, [field]: value }));
  const handleBonusChange = (id, field, value) => setBonuses(bonuses.map(b => b.id === id ? { ...b, [field]: value } : b));

  const addBonus = () => {
    const newId = Math.max(...bonuses.map(b => b.id), 0) + 1;
    setBonuses([...bonuses, { id: newId, name: '新增獎金', type: 'fixed', value: '' }]);
  };
  const removeBonus = (id) => setBonuses(bonuses.filter(b => b.id !== id));
  
  const blockInvalidChar = (e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); };

  return (
    <div className="min-h-screen bg-slate-50 p-2 md:p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* 重置按鈕 (固定在右上角或顯眼處) */}
        <div className="lg:absolute lg:top-0 lg:right-0 mb-4 lg:mb-0 flex justify-end">
           <button 
             onClick={handleReset}
             className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition border border-slate-200 hover:border-red-200 rounded-full px-3 py-1 bg-white shadow-sm"
           >
             <RotateCcw className="w-3 h-3" /> 清除重填
           </button>
        </div>

        {/* 左側：詳細設定 (佔 7 欄) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. 月薪收入設定 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5" /> 每月薪津項目 (收入)
              </h2>
              <div className="text-right">
                <div className="text-blue-100 text-sm">應領小計: {formatCurrency(results.monthlyGross)}</div>
                {results.monthlyGross !== results.monthlyCashGross && (
                  <div className="text-blue-200 text-xs">(現金應領: {formatCurrency(results.monthlyCashGross)})</div>
                )}
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="1. 薪額 (獎金基底)" value={incomeItems.base} onChange={(v) => handleIncomeChange('base', v)} highlight onKeyDown={blockInvalidChar} />
              
              <div className="md:col-span-1">
                <label className="block text-xs font-medium mb-1 text-blue-600">2. 層次職加 (獎金基底)</label>
                <div className="flex gap-2">
                  <div className="relative w-1/3">
                    <select
                      value={selectedLevelCode}
                      onChange={handleLevelSelectChange}
                      className="w-full h-full p-2 pl-2 text-sm bg-blue-50 border border-blue-300 rounded outline-none focus:ring-2 focus:ring-blue-200 appearance-none font-mono"
                    >
                      <option value="">選擇</option>
                      <option value="custom">自訂</option>
                      {LEVEL_OPTIONS.map(opt => <option key={opt.code} value={opt.code}>{opt.code}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-3 w-3 h-3 text-blue-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1">
                      <input 
                      type="number" min="0" value={incomeItems.level} onChange={(e) => handleLevelAmountChange(e.target.value)} onKeyDown={blockInvalidChar}
                      placeholder="輸入金額" className="w-full p-2 pl-3 text-right border border-blue-300 bg-blue-50 rounded outline-none transition font-mono focus:ring-2 focus:ring-blue-200 placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              <InputGroup label="3. 伙食津貼" value={incomeItems.meal} onChange={(v) => handleIncomeChange('meal', v)} onKeyDown={blockInvalidChar} />
              <InputGroup label="4. 交通津貼" value={incomeItems.transport} onChange={(v) => handleIncomeChange('transport', v)} onKeyDown={blockInvalidChar} />
              
              <div className="md:col-span-1">
                <InputGroup 
                  label={<span className="flex items-center gap-1">5. 全勤獎金 (月)<span className="text-[10px] text-slate-400 font-normal ml-1">(薪額+職加)/30</span></span>}
                  value={incomeItems.attendance} onChange={(v) => handleIncomeChange('attendance', v)} placeholder="自動計算" onKeyDown={blockInvalidChar}
                />
              </div>

              <InputGroup label="6. 持股信託獎勵金" value={incomeItems.stockBonus} onChange={(v) => handleIncomeChange('stockBonus', v)} onKeyDown={blockInvalidChar} />
              <InputGroup label="7. 留才增給持股" value={incomeItems.retentionBonus} onChange={(v) => handleIncomeChange('retentionBonus', v)} onKeyDown={blockInvalidChar} />
            </div>
            <div className="bg-blue-50 px-6 py-2 text-xs text-blue-800 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>說明：已將年度全勤獎金(0.4個月)視為包含在每月的「全勤獎金」中。</span>
            </div>
          </div>

          {/* 2. 月扣款設定 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-red-400" /> 每月扣款／提存
              </h2>
               <span className="text-slate-300 text-sm">小計: -{formatCurrency(results.monthlyDeduction)}</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputGroup label="1. 工會會費" value={deductionItems.unionFee} onChange={(v) => handleDeductionChange('unionFee', v)} onKeyDown={blockInvalidChar} />
              <InputGroup label="2. 傷亡互助金" value={deductionItems.unionMutual} onChange={(v) => handleDeductionChange('unionMutual', v)} onKeyDown={blockInvalidChar} />
              <InputGroup label="3. 勞保費" value={deductionItems.labor} onChange={(v) => handleDeductionChange('labor', v)} onKeyDown={blockInvalidChar} />
              <InputGroup label="4. 職工福利金" value={deductionItems.welfare} onChange={(v) => handleDeductionChange('welfare', v)} onKeyDown={blockInvalidChar} />
              <InputGroup label="5. 全民健保費" value={deductionItems.health} onChange={(v) => handleDeductionChange('health', v)} onKeyDown={blockInvalidChar} />
              <InputGroup label="6. 持股信託提存金" value={deductionItems.stockTrust} onChange={(v) => handleDeductionChange('stockTrust', v)} onKeyDown={blockInvalidChar} />
              <InputGroup label="7. 持股信託獎勵金" value={deductionItems.stockBonus} onChange={()=>{}} placeholder="自動帶入" readOnly locked />
              <InputGroup label="8. 留才增給持股" value={deductionItems.retentionBonus} onChange={()=>{}} placeholder="自動帶入" readOnly locked />
            </div>
          </div>

          {/* 3. 年度獎金設定 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Wallet className="w-5 h-5" /> 年度獎金與分紅
              </h2>
              <button onClick={addBonus} className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 rounded-full transition flex items-center gap-1">
                <Plus className="w-3 h-3" /> 新增
              </button>
            </div>
            <div className="p-4 space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 px-2 mb-1">
                <div className="col-span-4">項目名稱</div>
                <div className="col-span-3">類型</div>
                <div className="col-span-3">數值</div>
                <div className="col-span-2 text-right">預估金額</div>
              </div>
              {bonuses.map((bonus) => (
                <div key={bonus.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded hover:bg-slate-100 transition">
                  <div className="col-span-4">
                    <input type="text" value={bonus.name} onChange={(e) => handleBonusChange(bonus.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 outline-none text-sm font-medium" />
                  </div>
                  <div className="col-span-3">
                    <select value={bonus.type} onChange={(e) => handleBonusChange(bonus.id, 'type', e.target.value)}
                      className="w-full text-xs p-1 bg-white border border-slate-300 rounded" >
                      <option value="month">個月 (Base)</option>
                      <option value="fixed">固定金額</option>
                    </select>
                  </div>
                  <div className="col-span-3 relative">
                    <input type="number" min="0" value={bonus.value} onChange={(e) => handleBonusChange(bonus.id, 'value', e.target.value)}
                      onKeyDown={blockInvalidChar} step={bonus.type === 'month' ? 0.1 : 1000}
                      className="w-full p-1 text-right text-sm bg-white border border-slate-300 rounded outline-none focus:border-emerald-500" />
                  </div>
                  <div className="col-span-2 flex justify-end items-center gap-2">
                    <span className="text-sm font-mono text-emerald-700">
                      {bonus.type === 'month' 
                        ? ((Number(bonus.value) || 0) * results.bonusBase / 10000).toFixed(1) + '萬'
                        : ((Number(bonus.value) || 0) / 10000).toFixed(1) + '萬'
                      }
                    </span>
                    <button onClick={() => removeBonus(bonus.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-emerald-50 px-6 py-2 text-right text-sm font-bold text-emerald-800">
              獎金總計: {formatCurrency(results.totalBonus)}
            </div>
          </div>

        </div>

        {/* 右側：儀表板 */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-800 text-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500"></div>
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">預估稅前總年薪</h3>
            <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono tracking-tight">{formatCurrency(results.annualGross)}</div>
            <div className="text-slate-400 text-sm mb-6 flex flex-col items-center gap-1"><span>(月實領約 {formatCurrency(results.monthlyNet)})</span></div>

            <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-700 pt-6">
              <div className="text-left"><div className="text-xs text-slate-400 mb-1">固定薪資 (12個月)</div><div className="text-lg font-semibold text-blue-300">{formatCurrency(results.monthlyGross * 12)}</div></div>
              <div className="text-right"><div className="text-xs text-slate-400 mb-1">變動獎金與分紅</div><div className="text-lg font-semibold text-emerald-300">{formatCurrency(results.totalBonus)}</div></div>
            </div>
             <button onClick={() => setShowDetails(!showDetails)} className="mt-6 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-300 flex items-center justify-center gap-2 transition"><FileText className="w-4 h-4" />{showDetails ? '隱藏計算明細' : '查看計算過程明細'}</button>
          </div>

          {/* 計算細節 Modal */}
          {showDetails && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><Calculator className="w-5 h-5 text-blue-500" /> 計算過程明細</h3>
                <button onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
              </div>
              <div className="space-y-4 text-sm font-mono text-slate-600">
                <div className="border-b border-slate-100 pb-4">
                   <div className="font-bold text-slate-800 mb-2 text-base">一、每月實領計算 (Cash Flow)</div>
                   <div className="pl-2 space-y-2">
                      <div className="flex justify-between items-center"><span className="text-slate-500">1. 應領月薪總額 (Gross)</span><span className="text-blue-600 font-bold">{formatCurrency(results.monthlyGross)}</span></div>
                      <div className="text-xs text-slate-400 pl-4 mb-2">(含 薪額+職加+伙食+交通+全勤+持股+留才)</div>
                      <div className="flex justify-between items-center text-red-400"><span>2. 應扣款項總額 (Deduction)</span><span>- {formatCurrency(results.monthlyDeduction)}</span></div>
                      <div className="text-xs text-slate-400 pl-4 mb-2">(含 工會+勞健保+福利金+持股自提+持股獎勵+留才)</div>
                      <div className="bg-slate-50 p-3 rounded text-xs space-y-1 mt-2">
                        <div className="font-bold text-slate-700 mb-1">實領計算說明：</div>
                        <div className="flex justify-between"><span>現金項目 (薪+職+伙+交+勤)</span><span>{formatCurrency(results.monthlyCashGross)}</span></div>
                        <div className="flex justify-between text-slate-400"><span>非現金項目 (持股+留才)</span><span>+ {formatCurrency((Number(incomeItems.stockBonus)||0) + (Number(incomeItems.retentionBonus)||0))}</span></div>
                        <div className="flex justify-between text-slate-400 border-b border-slate-200 pb-1"><span>非現金扣回 (持股+留才)</span><span>- {formatCurrency((Number(deductionItems.stockBonus)||0) + (Number(deductionItems.retentionBonus)||0))}</span></div>
                        <div className="flex justify-between text-red-400 pt-1"><span>常規扣款 (勞健保等)</span><span>- {formatCurrency(results.monthlyDeduction - (Number(deductionItems.stockBonus)||0) - (Number(deductionItems.retentionBonus)||0))}</span></div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-lg text-slate-800"><span>每月實領 (Net)</span><span>{formatCurrency(results.monthlyNet)}</span></div>
                   </div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 mb-1">二、年度獎金明細</div>
                  <div className="pl-4 border-l-2 border-emerald-200 space-y-1">
                    <div className="mb-2 text-xs text-slate-500"><span>獎金基底 (薪額+職加) = </span><span className="font-bold text-emerald-600">{formatCurrency(results.bonusBase)}</span></div>
                    {bonuses.map(b => {
                      const val = Number(b.value) || 0;
                      return (<div key={b.id} className="flex justify-between"><span>{b.name} {b.type === 'month' ? ` (${val}個月)` : ''}</span><span>{b.type === 'month' ? `${formatCurrency(results.bonusBase)} × ${val} = ${formatCurrency(val * results.bonusBase)}` : formatCurrency(val)}</span></div>);
                    })}
                    <div className="flex justify-between text-emerald-600 font-bold border-t border-slate-100 pt-1 mt-1"><span>獎金總計</span><span>= {formatCurrency(results.totalBonus)}</span></div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 mt-2"><div className="flex justify-between font-bold text-base text-slate-900"><span>總年薪 (月薪x12 + 獎金)</span><span>{formatCurrency(results.annualGross)}</span></div></div>
              </div>
            </div>
          )}

          {!showDetails && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><PieChart className="w-5 h-5" /> 薪資結構分析</h3>
              <div className="space-y-4">
                <BarItem label="底薪結構 (薪額+職加)" value={results.bonusBase * 12} total={results.annualGross} color="bg-blue-500" />
                <BarItem label="月津貼 (含伙食、交通、持股等)" value={(results.monthlyGross - results.bonusBase) * 12} total={results.annualGross} color="bg-blue-300" />
                <BarItem label="年節與績效獎金" value={results.totalBonus} total={results.annualGross} color="bg-emerald-500" />
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-600 mb-2">快速摘要</h4>
                <ul className="text-sm space-y-2 text-slate-500">
                  <li className="flex justify-between"><span>月薪總額 (應領):</span><span className="font-mono text-slate-800">{formatCurrency(results.monthlyGross)}</span></li>
                  <li className="flex justify-between text-red-400"><span>每月扣款:</span><span className="font-mono">- {formatCurrency(results.monthlyDeduction)}</span></li>
                  <li className="flex justify-between border-t border-slate-100 pt-2 font-bold"><span>每月實領 (Net):</span><span className="font-mono text-slate-800">{formatCurrency(results.monthlyNet)}</span></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 小元件
const InputGroup = ({ label, value, onChange, highlight = false, placeholder = "輸入金額", readOnly = false, locked = false, onKeyDown }) => (
  <div>
    <label className={`block text-xs font-medium mb-1 ${highlight ? 'text-blue-600' : 'text-slate-500'}`}>{label}</label>
    <div className="relative">
      <input type="number" min="0" value={value} onChange={(e) => !readOnly && onChange(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} readOnly={readOnly}
        className={`w-full p-2 pl-3 text-right border rounded outline-none transition font-mono ${readOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white focus:border-slate-400'} ${highlight ? 'border-blue-300 bg-blue-50 focus:ring-2 focus:ring-blue-200' : 'border-slate-200'} placeholder:text-slate-300`} />
      {locked && <Lock className="absolute left-3 top-2.5 w-3 h-3 text-slate-400" />}
    </div>
  </div>
);

const BarItem = ({ label, value, total, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1 text-slate-500"><span>{label}</span><span>{total > 0 ? Math.round((value / total) * 100) : 0}%</span></div>
    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}></div></div>
  </div>
);

export default App;