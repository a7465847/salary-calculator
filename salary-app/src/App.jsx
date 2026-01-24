import React, { useState, useEffect } from 'react';
import { RotateCcw, Moon, Sun } from 'lucide-react';

// --- 引入拆分後的元件 ---
// 確保這些檔案存在於您的 src/components/ 資料夾中
import { DisclaimerModal, BulletinBoard } from './components/CommonComponents';
import { AnnualSalaryView } from './components/AnnualSalaryView';
import { MonthlyBonusView } from './components/MonthlyBonusView';
import TrustSimulator from './components/TrustSimulator'; // 請確保此檔案已建立

// --- 引入工具函式與常數 ---
// 修正：補上 formatCurrency 與 blockInvalidChar 的引入
import { 
  val, 
  formatCurrency, 
  blockInvalidChar,
  LEVEL_OPTIONS, 
  HEALTH_INSURANCE_GRADES, 
  DEFAULT_INCOME, 
  DEFAULT_DEDUCTION, 
  DEFAULT_BONUSES 
} from './utils/salaryData';

const App = () => {
  // --- State Loading Logic ---
  const loadState = (key, defaultValue) => {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : defaultValue; } 
    catch (e) { return defaultValue; }
  };

  // --- Global State ---
  const [activeTab, setActiveTab] = useState('annual');
  const [incomeItems, setIncomeItems] = useState(() => loadState('salary_income', DEFAULT_INCOME));
  const [selectedLevelCode, setSelectedLevelCode] = useState(() => loadState('salary_level_code', ''));
  const [deductionItems, setDeductionItems] = useState(() => loadState('salary_deduction', DEFAULT_DEDUCTION));
  const [bonuses, setBonuses] = useState(() => loadState('salary_bonuses', DEFAULT_BONUSES));
  const [showDetails, setShowDetails] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => loadState('salary_dark_mode', false));
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [results, setResults] = useState({
    monthlyGross: 0, monthlyCashGross: 0, monthlyDeduction: 0, monthlyNet: 0,
    bonusBase: 0, totalBonus: 0, annualGross: 0, annualCashGross: 0, annualNet: 0,
  });

  // --- Effects (Persist State) ---
  useEffect(() => { localStorage.setItem('salary_income', JSON.stringify(incomeItems)); }, [incomeItems]);
  useEffect(() => { localStorage.setItem('salary_level_code', JSON.stringify(selectedLevelCode)); }, [selectedLevelCode]);
  useEffect(() => { localStorage.setItem('salary_deduction', JSON.stringify(deductionItems)); }, [deductionItems]);
  useEffect(() => { localStorage.setItem('salary_bonuses', JSON.stringify(bonuses)); }, [bonuses]);
  useEffect(() => {
    localStorage.setItem('salary_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const hasSeenDisclaimer = loadState('salary_disclaimer_seen', false);
    if (!hasSeenDisclaimer) setShowDisclaimer(true);
  }, []);

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('salary_disclaimer_seen', JSON.stringify(true));
  };

  const handleReset = () => {
    if (window.confirm('確定要清除所有輸入的資料並重置嗎？\n(這也會重置隱私聲明彈窗)')) {
      setIncomeItems(DEFAULT_INCOME);
      setDeductionItems(DEFAULT_DEDUCTION);
      setBonuses(DEFAULT_BONUSES);
      setSelectedLevelCode('');
      localStorage.removeItem('salary_income'); localStorage.removeItem('salary_deduction');
      localStorage.removeItem('salary_bonuses'); localStorage.removeItem('salary_level_code');
      localStorage.removeItem('salary_disclaimer_seen');
      window.location.reload();
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

  // --- Calculation Logic (Effects) ---
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
      
      {showDisclaimer && <DisclaimerModal onClose={handleCloseDisclaimer} />}

      <div className="max-w-6xl mx-auto flex flex-col gap-6 relative">
        
        {/* Top Bar: Tabs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg overflow-x-auto max-w-full">
            <button onClick={() => setActiveTab('annual')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === 'annual' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>年薪計算</button>
            <button onClick={() => setActiveTab('monthly')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === 'monthly' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>各月份獎金明細</button>
            {/* 啟用按鈕並切換到 'trust' */}
            <button 
              onClick={() => setActiveTab('trust')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === 'trust' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              持股信託資產試算 (Beta)
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2 md:mt-0">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
               {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
             <button onClick={handleReset} className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition px-3 py-1 bg-slate-50 dark:bg-slate-700 rounded-full">
               <RotateCcw className="w-3 h-3" /> 清除緩存
             </button>
          </div>
        </div>

        {/* 公告欄 */}
        <BulletinBoard />

        {/* Content Area */}
        {activeTab === 'annual' && (
          <AnnualSalaryView 
            incomeItems={incomeItems} 
            setIncomeItems={setIncomeItems} 
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
        )}
        
        {activeTab === 'monthly' && (
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

        {/* 員工持股信託試算 (新增) */}
        {activeTab === 'trust' && (
          <TrustSimulator />
        )}

      </div>
    </div>
  );
};

export default App;

