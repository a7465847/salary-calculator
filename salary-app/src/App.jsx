import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, DollarSign, PieChart, Plus, Trash2, Wallet, ArrowDownCircle, ArrowUpCircle, HelpCircle, FileText, X, ChevronDown, Lock, RotateCcw, Moon, Sun, Calendar, Coins } from 'lucide-react';

// --- 共用小元件 ---
const InputGroup = ({ label, value, onChange, highlight = false, placeholder = "輸入金額", readOnly = false, locked = false, onKeyDown }) => (
  <div>
    <label className={`block text-xs font-medium mb-1 ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{label}</label>
    <div className="relative">
      <input type="number" min="0" value={value} onChange={(e) => !readOnly && onChange(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} readOnly={readOnly}
        className={`w-full p-2 pl-3 text-right border rounded outline-none transition font-mono 
          ${readOnly ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed' : 'bg-white dark:bg-slate-900 focus:border-slate-400'} 
          ${highlight ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800' : 'border-slate-200 dark:border-slate-600'} 
          text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600`} />
      {locked && <Lock className="absolute left-3 top-2.5 w-3 h-3 text-slate-400" />}
    </div>
  </div>
);

const BarItem = ({ label, value, total, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1 text-slate-500 dark:text-slate-400"><span>{label}</span><span>{total > 0 ? Math.round((value / total) * 100) : 0}%</span></div>
    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden"><div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}></div></div>
  </div>
);

const App = () => {
  // --- 常數設定 ---
  const LEVEL_OPTIONS = useMemo(() => [
    { code: '19', value: 51795 }, { code: '18', value: 44735 }, { code: '17', value: 39435 }, { code: '16', value: 35905 },
    { code: '15', value: 32370 }, { code: '14', value: 28840 }, { code: '13', value: 25310 }, { code: '12', value: 21780 },
    { code: '11', value: 19135 }, { code: '10', value: 16480 }, { code: '09', value: 13835 }, { code: '08', value: 11190 },
    { code: '07', value: 9420 }, { code: '06', value: 8245 }, { code: '05', value: 7070 }, { code: '04', value: 5890 },
    { code: '03', value: 4715 }, { code: '02', value: 3535 }, { code: '01', value: 2360 }, { code: '00', value: 0 },
  ], []);

  const HEALTH_INSURANCE_GRADES = useMemo(() => [
    40100, 42000, 43900, 45800, 48200, 50600, 53000, 55400, 57800, 60800,
    63800, 66800, 69800, 72800, 76500, 80200, 83900, 87600, 92100, 96600,
    101100, 105600, 110100, 115500, 120900, 126300, 131700, 137100, 142500, 147900,
    150000, 156400, 162800, 169200, 175600, 182000, 189500, 197000, 204500
  ], []);

  const DEFAULT_INCOME = { base: '', level: '', meal: 3000, transport: 2500, attendance: '', stockBonus: '', retentionBonus: '' };
  const DEFAULT_DEDUCTION = { unionFee: '', unionMutual: '', labor: '', welfare: '', health: '', stockTrust: '', stockBonus: '', retentionBonus: '' };
  const DEFAULT_BONUSES = [
    { id: 1, name: '春節獎金', type: 'month', value: 1.0 },
    { id: 2, name: '端午節獎金', type: 'month', value: 0.3 },
    { id: 3, name: '中秋節獎金', type: 'month', value: 0.3 },
    { id: 5, name: '績效獎金', type: 'month', value: 2.6 },
    { id: 6, name: '企業化特別獎金', type: 'fixed', value: 200000 },
    { id: 7, name: '員工酬勞', type: 'fixed', value: 50000 },
  ];

  const loadState = (key, defaultValue) => {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : defaultValue; } 
    catch (e) { return defaultValue; }
  };

  const val = (v) => (v === '' || isNaN(Number(v))) ? 0 : Number(v);
  const formatCurrency = (num) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(num);
  const blockInvalidChar = (e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); };

  // --- Global State ---
  const [activeTab, setActiveTab] = useState('annual'); // 'annual' | 'monthly'
  const [incomeItems, setIncomeItems] = useState(() => loadState('salary_income', DEFAULT_INCOME));
  const [selectedLevelCode, setSelectedLevelCode] = useState(() => loadState('salary_level_code', ''));
  const [deductionItems, setDeductionItems] = useState(() => loadState('salary_deduction', DEFAULT_DEDUCTION));
  const [bonuses, setBonuses] = useState(() => loadState('salary_bonuses', DEFAULT_BONUSES));
  const [showDetails, setShowDetails] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => loadState('salary_dark_mode', false));
  const [results, setResults] = useState({
    monthlyGross: 0, monthlyCashGross: 0, monthlyDeduction: 0, monthlyNet: 0,
    bonusBase: 0, totalBonus: 0, annualGross: 0, annualCashGross: 0, annualNet: 0,
  });

  // Persistence
  useEffect(() => { localStorage.setItem('salary_income', JSON.stringify(incomeItems)); }, [incomeItems]);
  useEffect(() => { localStorage.setItem('salary_level_code', JSON.stringify(selectedLevelCode)); }, [selectedLevelCode]);
  useEffect(() => { localStorage.setItem('salary_deduction', JSON.stringify(deductionItems)); }, [deductionItems]);
  useEffect(() => { localStorage.setItem('salary_bonuses', JSON.stringify(bonuses)); }, [bonuses]);
  useEffect(() => {
    localStorage.setItem('salary_dark_mode', JSON.stringify(isDarkMode));
    isDarkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleReset = () => {
    if (window.confirm('確定要清除所有輸入的資料並重置嗎？')) {
      setIncomeItems(DEFAULT_INCOME);
      setDeductionItems(DEFAULT_DEDUCTION);
      setBonuses(DEFAULT_BONUSES);
      setSelectedLevelCode('');
      localStorage.removeItem('salary_income'); localStorage.removeItem('salary_deduction');
      localStorage.removeItem('salary_bonuses'); localStorage.removeItem('salary_level_code');
    }
  };

  // --- Handlers ---
  const handleIncomeChange = (field, value) => setIncomeItems(prev => ({ ...prev, [field]: value }));
  const handleDeductionChange = (field, value) => setDeductionItems(prev => ({ ...prev, [field]: value }));
  const handleBonusChange = (id, field, value) => setBonuses(bonuses.map(b => b.id === id ? { ...b, [field]: value } : b));
  const addBonus = () => {
    const newId = Math.max(...bonuses.map(b => b.id), 0) + 1;
    setBonuses([...bonuses, { id: newId, name: '新增獎金', type: 'fixed', value: '' }]);
  };
  const removeBonus = (id) => setBonuses(bonuses.filter(b => b.id !== id));

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

  // --- Effects & Logic ---
  // 1. 收入相關 (全勤、持股、留才)
  useEffect(() => {
    const base = val(incomeItems.base);
    const level = val(incomeItems.level);
    let newAttendance = incomeItems.attendance;
    if (base === 0 && level === 0) {
      if (incomeItems.attendance !== '') newAttendance = '';
    } else {
      const calcAttendance = Math.round((base + level) / 30);
      if (val(incomeItems.attendance) !== calcAttendance) newAttendance = calcAttendance;
    }
    const baseTotal = base + level;
    const factor = Math.floor(baseTotal * 13.6 / 12 / 1000);
    const calcStockBonus = Math.round(factor * 100 * 0.3);
    const calcRetentionBonus = Math.round(factor * 100 * 0.375);

    if (newAttendance !== incomeItems.attendance || calcStockBonus !== val(incomeItems.stockBonus) || calcRetentionBonus !== val(incomeItems.retentionBonus)) {
      setIncomeItems(prev => ({
        ...prev, attendance: newAttendance,
        stockBonus: calcStockBonus === 0 && baseTotal === 0 ? '' : calcStockBonus,
        retentionBonus: calcRetentionBonus === 0 && baseTotal === 0 ? '' : calcRetentionBonus
      }));
    }
  }, [incomeItems.base, incomeItems.level, incomeItems.attendance, incomeItems.stockBonus, incomeItems.retentionBonus]);

  // 2. 扣款相關
  useEffect(() => {
    const base = val(incomeItems.base);
    const level = val(incomeItems.level);
    const baseTotal = base + level;
    
    const calcUnionFee = Math.round(baseTotal * 0.005);
    let newUnionFee = calcUnionFee === 0 && baseTotal === 0 ? '' : calcUnionFee;
    const calcWelfare = Math.round(baseTotal * 0.005);
    let newWelfare = calcWelfare === 0 && baseTotal === 0 ? '' : calcWelfare;
    const factor = Math.floor(baseTotal * 13.6 / 12 / 1000);
    const calcStockTrust = factor * 100;
    let newStockTrust = calcStockTrust === 0 && baseTotal === 0 ? '' : calcStockTrust;
    let newLabor = deductionItems.labor;
    if (baseTotal > 45800) newLabor = 1145;

    const meal = val(incomeItems.meal);
    const transport = val(incomeItems.transport);
    const attendance = val(incomeItems.attendance);
    const healthBase = base + level + meal + transport + attendance;
    let newHealth = ''; 
    const minGrade = HEALTH_INSURANCE_GRADES[0];
    const maxGrade = HEALTH_INSURANCE_GRADES[HEALTH_INSURANCE_GRADES.length - 1];
    if (healthBase >= minGrade && healthBase <= maxGrade) {
        const matchedGrade = HEALTH_INSURANCE_GRADES.find(grade => grade >= healthBase);
        if (matchedGrade) newHealth = Math.round(matchedGrade * 0.0517 * 0.3);
    }

    if (val(deductionItems.unionFee) !== val(newUnionFee) || val(deductionItems.welfare) !== val(newWelfare) ||
        newStockTrust !== deductionItems.stockTrust || newLabor !== deductionItems.labor || newHealth !== deductionItems.health ||
        val(incomeItems.stockBonus) !== val(deductionItems.stockBonus) || val(incomeItems.retentionBonus) !== val(deductionItems.retentionBonus)) {
        setDeductionItems(prev => ({
            ...prev, unionFee: newUnionFee, welfare: newWelfare, stockTrust: newStockTrust, labor: newLabor, health: newHealth,
            stockBonus: incomeItems.stockBonus, retentionBonus: incomeItems.retentionBonus 
        }));
    }
  }, [incomeItems, deductionItems.labor, deductionItems.health, deductionItems.stockTrust, HEALTH_INSURANCE_GRADES]);

  // 3. 總計邏輯
  useEffect(() => {
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
    const annualCashGross = (monthlyCashGross * 12) + totalBonus;
    const annualNet = (monthlyNet * 12) + totalBonus; 
    setResults({ monthlyGross, monthlyCashGross, monthlyDeduction, monthlyNet, bonusBase, totalBonus, annualGross, annualCashGross, annualNet });
  }, [incomeItems, deductionItems, bonuses]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-2 md:p-6 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 relative">
        
        {/* Top Bar: Tabs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('annual')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'annual' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              年薪計算
            </button>
            <button 
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'monthly' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              各月份獎金明細
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2 md:mt-0">
             <button 
               onClick={() => setIsDarkMode(!isDarkMode)}
               className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
             >
               {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
             <button 
               onClick={handleReset}
               className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition px-3 py-1 bg-slate-50 dark:bg-slate-700 rounded-full"
             >
               <RotateCcw className="w-3 h-3" /> 清除緩存
             </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'annual' ? (
          <AnnualSalaryView 
            incomeItems={incomeItems} 
            setIncomeItems={setIncomeItems} // Need specific handlers normally, but direct set is mostly fine for simple inputs not triggering logic immediately in child
            deductionItems={deductionItems}
            bonuses={bonuses}
            results={results}
            handleIncomeChange={handleIncomeChange}
            handleLevelSelectChange={handleLevelSelectChange}
            handleLevelAmountChange={handleLevelAmountChange}
            handleDeductionChange={handleDeductionChange}
            handleBonusChange={handleBonusChange}
            addBonus={addBonus}
            removeBonus={removeBonus}
            selectedLevelCode={selectedLevelCode}
            LEVEL_OPTIONS={LEVEL_OPTIONS}
            formatCurrency={formatCurrency}
            blockInvalidChar={blockInvalidChar}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
          />
        ) : (
          <MonthlyBonusView 
            incomeItems={incomeItems}
            handleIncomeChange={handleIncomeChange}
            handleLevelSelectChange={handleLevelSelectChange}
            handleLevelAmountChange={handleLevelAmountChange}
            selectedLevelCode={selectedLevelCode}
            LEVEL_OPTIONS={LEVEL_OPTIONS}
            formatCurrency={formatCurrency}
            blockInvalidChar={blockInvalidChar}
            bonusBase={results.bonusBase}
          />
        )}

      </div>
    </div>
  );
};

// --- Sub-Components ---

// 1. Annual Salary View (The original view)
const AnnualSalaryView = ({ 
  incomeItems, deductionItems, bonuses, results, 
  handleIncomeChange, handleLevelSelectChange, handleLevelAmountChange, handleDeductionChange, handleBonusChange, addBonus, removeBonus,
  selectedLevelCode, LEVEL_OPTIONS, formatCurrency, blockInvalidChar, showDetails, setShowDetails
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95 duration-300">
    {/* Left Side */}
    <div className="lg:col-span-7 space-y-6">
      {/* Income */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="bg-blue-600 dark:bg-blue-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-2"><ArrowUpCircle className="w-5 h-5" /> 每月薪津項目 (收入)</h2>
          <div className="text-right">
            <div className="text-blue-100 text-sm">應領小計: {formatCurrency(results.monthlyGross)}</div>
            {results.monthlyGross !== results.monthlyCashGross && (<div className="text-blue-200 text-xs">(現金應領: {formatCurrency(results.monthlyCashGross)})</div>)}
          </div>
        </div>
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
      </div>

      {/* Deduction */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="bg-slate-700 dark:bg-slate-900 px-6 py-4 flex justify-between items-center transition-colors">
          <h2 className="text-white font-bold flex items-center gap-2"><ArrowDownCircle className="w-5 h-5 text-red-400" /> 每月扣款／提存</h2>
            <span className="text-slate-300 text-sm">小計: -{formatCurrency(results.monthlyDeduction)}</span>
        </div>
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
      </div>

      {/* Bonus */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="bg-emerald-600 dark:bg-emerald-800 px-6 py-4 flex justify-between items-center transition-colors">
          <h2 className="text-white font-bold flex items-center gap-2"><Wallet className="w-5 h-5" /> 年度獎金與分紅</h2>
          <button onClick={addBonus} className="text-xs bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-3 py-1 rounded-full transition flex items-center gap-1"><Plus className="w-3 h-3" /> 新增</button>
        </div>
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
        <div className="bg-emerald-50 dark:bg-slate-700/50 px-6 py-2 text-right text-sm font-bold text-emerald-800 dark:text-emerald-400 transition-colors">獎金總計: {formatCurrency(results.totalBonus)}</div>
      </div>
    </div>

    {/* Right Side */}
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

// 2. New Monthly Bonus Breakdown View
const MonthlyBonusView = ({ 
  incomeItems, handleIncomeChange, handleLevelSelectChange, handleLevelAmountChange, 
  selectedLevelCode, LEVEL_OPTIONS, formatCurrency, blockInvalidChar, bonusBase
}) => {
  
  // Define the timeline data based on base
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
      
      {/* Top Input Section - Reusing logic to sync with main tab */}
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

      {/* Bonus Structure Summary */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-sm space-y-2 text-slate-600 dark:text-slate-300">
        <h3 className="font-bold text-slate-800 dark:text-white mb-2">💡 獎金構成說明</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>春節 1.0 + 績效 2.6 + 端午 0.3 + 中秋 0.3 = <span className="font-bold text-blue-600 dark:text-blue-400">4.2 個月</span></li>
          <li>企業化獎金：2.0 個月 (非固定，依公司營運)</li>
          <li>員工酬勞：1.0 個月 (非固定，依公司獲利)</li>
          <li>全勤獎金：0.4 個月 (已平均於每月薪資發放)</li>
        </ul>
      </div>

      {/* Timeline Grid */}
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

export default App;