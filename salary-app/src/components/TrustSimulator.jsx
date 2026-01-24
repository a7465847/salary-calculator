import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart 
} from 'recharts';
import { 
  Calculator, DollarSign, TrendingUp, Calendar, Info, AlertCircle, 
  Table, ChevronDown, ChevronUp, Edit3, Search, X, ToggleLeft, ToggleRight, HelpCircle 
} from 'lucide-react';

// --- 內部小元件：側邊欄摺疊區塊 ---
const SidebarSection = ({ title, icon: Icon, isOpen, onToggle, children }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all">
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? 'bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
      >
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
          <Icon size={16} className="text-blue-500" /> 
          {title}
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

const TrustSimulator = () => {
  // --- Helper: 安全數值轉換 ---
  const safeNum = (val, defaultVal = 0) => {
    if (val === '' || val === null || isNaN(val)) return defaultVal;
    return Number(val);
  };

  // --- 格式化工具 ---
  const fmtMoney = (num) => {
    if (!Number.isFinite(num)) return '$0';
    return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 }).format(num);
  };
  const fmtPrice = (num) => {
    if (!Number.isFinite(num)) return '0.0';
    return new Intl.NumberFormat('zh-TW', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(num);
  };

  // --- UI 狀態：控制側邊欄摺疊 (需求 1) ---
  // 預設只有 'basic' 開啟，其他收起
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    raise: false,
    contrib: false,
    market: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // --- 基礎設定 ---
  const [currentAge, setCurrentAge] = useState(27);
  const [retireAge, setRetireAge] = useState(65);
  
  // --- 薪資與調薪參數 ---
  const [startSalaryY0, setStartSalaryY0] = useState(50020); 
  
  // 試用期滿調薪
  const [probationRaiseAmount, setProbationRaiseAmount] = useState(505);
  const [probationRaisePercent, setProbationRaisePercent] = useState(1);
  const [probationRaiseType, setProbationRaiseType] = useState('amount');
  
  const [annualRaise, setAnnualRaise] = useState(700);        
  
  // --- 結構調薪進階設定 ---
  const [structRaiseType, setStructRaiseType] = useState('fixed');
  const [structRaiseAmount, setStructRaiseAmount] = useState(0);   
  const [cycleActiveYears, setCycleActiveYears] = useState(3);      
  const [cyclePauseYears, setCyclePauseYears] = useState(2);        
  const [intervalYears, setIntervalYears] = useState(3);            
  
  // 手動覆寫結構調薪
  const [manualStructRaises, setManualStructRaises] = useState({});

  // --- 提撥比例參數 ---
  const SELF_CONTRIB_FACTOR = 13.6; 
  const [companyRate, setCompanyRate] = useState(30);                
  const [retentionRate, setRetentionRate] = useState(37.5);          
  
  // --- 第一年特殊設定 ---
  const [y0Months, setY0Months] = useState(9);          

  // --- 股票與配息參數 ---
  const [initialStockPrice, setInitialStockPrice] = useState(133);
  const [stockGrowthRate, setStockGrowthRate] = useState(1.0);
  const [dividendPerShare, setDividendPerShare] = useState(5.0);
  
  // 固定計算股價 (需求 2: 名稱優化)
  const [fixedCalcPrice, setFixedCalcPrice] = useState('');

  const [tableData, setTableData] = useState([]);
  const [summary, setSummary] = useState({ 
    totalAssets: 0, totalShares: 0, totalPrincipal: 0,
    annualDividend: 0, monthlyDividend: 0,
    p25: { assets: 0, shares: 0, annualDiv: 0 },
    p50: { assets: 0, shares: 0, annualDiv: 0 },
    p75: { assets: 0, shares: 0, annualDiv: 0 }
  });
  const [selectedYearData, setSelectedYearData] = useState(null); 
  
  // --- 其他 UI 狀態 ---
  const [showDividendHistory, setShowDividendHistory] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false); 
  const [showComparisonLines, setShowComparisonLines] = useState(false);
  const [showPriceHelp, setShowPriceHelp] = useState(false); // 新增：控制股價提示顯示

  // --- 通用輸入處理 ---
  const handleInputChange = (setter) => (e) => {
    const val = e.target.value;
    if (val === '') {
      setter(''); 
    } else {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        setter(num);
      }
    }
  };

  // --- 表格內結構調薪編輯處理 ---
  const handleTableStructRaiseChange = (year, value) => {
    if (value === '') {
      const newManual = { ...manualStructRaises };
      delete newManual[year]; 
      setManualStructRaises(newManual);
    } else {
      const num = parseFloat(value);
      if (!isNaN(num) && num >= 0) {
        setManualStructRaises(prev => ({ ...prev, [year]: num }));
      }
    }
  };

  // --- 歷史配息數據 ---
  const dividendHistory = [
    { year: 2025, dividend: 5.00 }, { year: 2024, dividend: 4.76 }, { year: 2023, dividend: 4.70 },
    { year: 2022, dividend: 4.61 }, { year: 2021, dividend: 4.31 }, { year: 2020, dividend: 4.23 },
    { year: 2019, dividend: 4.48 }, { year: 2018, dividend: 4.80 }, { year: 2017, dividend: 4.94 },
    { year: 2016, dividend: 5.49 }, { year: 2015, dividend: 4.86 }, { year: 2014, dividend: 4.53 },
    { year: 2013, dividend: 5.35 }, { year: 2012, dividend: 5.46 }, { year: 2011, dividend: 5.52 }
  ];

  const sortedDivs = [...dividendHistory].map(d => d.dividend).sort((a, b) => a - b);
  const getPercentile = (p) => {
    const index = (sortedDivs.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    if (upper === lower) return sortedDivs[index];
    return Number((sortedDivs[lower] * (1 - weight) + sortedDivs[upper] * weight).toFixed(2));
  };
  
  const stats = {
    p25: getPercentile(0.25),
    p50: getPercentile(0.50),
    p75: getPercentile(0.75)
  };
  
  // --- 核心計算邏輯 ---
  useEffect(() => {
    const s_currentAge = safeNum(currentAge, 27);
    const s_retireAge = safeNum(retireAge, 65);
    const s_startSalaryY0 = safeNum(startSalaryY0, 0);
    const s_probationRaiseAmount = safeNum(probationRaiseAmount, 0);
    const s_probationRaisePercent = safeNum(probationRaisePercent, 0);
    const s_annualRaise = safeNum(annualRaise, 0);
    const s_structAmount = safeNum(structRaiseAmount, 0);
    const s_cycleActive = safeNum(cycleActiveYears, 3);
    const s_cyclePause = safeNum(cyclePauseYears, 2);
    const s_interval = safeNum(intervalYears, 3);
    const s_companyRate = safeNum(companyRate, 0);
    const s_retentionRate = safeNum(retentionRate, 0);
    const s_y0Months = safeNum(y0Months, 0);
    const s_initialStockPrice = safeNum(initialStockPrice, 10);
    const s_stockGrowthRate = safeNum(stockGrowthRate, 0);
    const s_dividendPerShare = safeNum(dividendPerShare, 0);
    const s_fixedCalcPrice = safeNum(fixedCalcPrice, 0);

    const data = [];
    let shares = { user: 0, p25: 0, p50: 0, p75: 0 };
    let currentStockPrice = s_initialStockPrice;
    let currentStartSalary = s_startSalaryY0;
    let totalPrincipal = 0;

    const yearsToSimulate = Math.max(0, s_retireAge - s_currentAge);

    for (let i = 0; i <= yearsToSimulate; i++) {
      const year = i;
      const age = s_currentAge + i;

      let perfRaiseAmount = 0;
      if (i === 0) {
        if (probationRaiseType === 'percent') {
          perfRaiseAmount = Math.round(s_startSalaryY0 * (s_probationRaisePercent / 100));
        } else {
          perfRaiseAmount = s_probationRaiseAmount;
        }
      } else {
        perfRaiseAmount = s_annualRaise;
      }

      let structRaiseThisYear = 0;
      if (manualStructRaises[year] !== undefined) {
        structRaiseThisYear = safeNum(manualStructRaises[year], 0);
      } else if (i > 0) {
        switch (structRaiseType) {
          case 'cycle':
            const cycleLength = s_cycleActive + s_cyclePause;
            const positionInCycle = (i - 1) % cycleLength;
            if (positionInCycle < s_cycleActive) structRaiseThisYear = s_structAmount;
            break;
          case 'interval':
            if (i % s_interval === 0) structRaiseThisYear = s_structAmount;
            break;
          case 'fixed':
          default:
            structRaiseThisYear = s_structAmount;
            break;
        }
      }
      const monthlySalary = currentStartSalary + perfRaiseAmount + structRaiseThisYear;

      const calcContrib = (salary) => {
        const self = Math.floor(salary * SELF_CONTRIB_FACTOR / 12 / 1000) * 100;
        const company = Math.ceil(self * (s_companyRate / 100));
        const retention = Math.ceil(self * (s_retentionRate / 100));
        const total = self + company + retention;
        return { self, company, retention, total };
      };

      const pre = calcContrib(currentStartSalary); 
      const post = calcContrib(monthlySalary);      

      let months = 12;
      let annualTotalAmt = 0;
      let annualSelfPrincipal = 0;
      let calculationNote = "";

      if (i === 0) {
        months = s_y0Months;
        const retentionBonusMonths = Math.min(12 - months, 6);
        const retentionBonus = pre.retention * retentionBonusMonths;
        annualTotalAmt = (post.total * months) + retentionBonus;
        annualSelfPrincipal = post.self * months;
        calculationNote = `年度總金額 = 月提(後)${post.total} × ${months}個月 + 補留才(前)${pre.retention} × ${retentionBonusMonths}個月`;
      } else {
        annualTotalAmt = (pre.total * 4) + (post.total * 8);
        annualSelfPrincipal = (pre.self * 4) + (post.self * 8);
        calculationNote = `年度總金額 = 月提(前)${pre.total} × 4個月 + 月提(後)${post.total} × 8個月`;
      }
      
      totalPrincipal += annualSelfPrincipal;

      const calculationPrice = s_fixedCalcPrice > 0 ? s_fixedCalcPrice : (currentStockPrice > 0 ? currentStockPrice : 1);
      const sharesBought = Math.floor(annualTotalAmt / calculationPrice);

      const calculateScenario = (prevTotalShares, divRate) => {
        if (i === 0) return { sharesFromDiv: 0, newTotal: prevTotalShares + sharesBought };
        const dividendBaseShares = prevTotalShares + (sharesBought / 2);
        const rawDividendIncome = dividendBaseShares * divRate;
        const sharesFromDiv = Math.floor(rawDividendIncome / calculationPrice);
        return { sharesFromDiv, newTotal: prevTotalShares + sharesBought + sharesFromDiv };
      };

      const resUser = calculateScenario(shares.user, s_dividendPerShare);
      const resP25 = calculateScenario(shares.p25, stats.p25);
      const resP50 = calculateScenario(shares.p50, stats.p50);
      const resP75 = calculateScenario(shares.p75, stats.p75);

      shares.user = resUser.newTotal;
      shares.p25 = resP25.newTotal;
      shares.p50 = resP50.newTotal;
      shares.p75 = resP75.newTotal;

      const totalValueUser = Math.round(shares.user * currentStockPrice);
      const totalValueP25 = Math.round(shares.p25 * currentStockPrice);
      const totalValueP50 = Math.round(shares.p50 * currentStockPrice);
      const totalValueP75 = Math.round(shares.p75 * currentStockPrice);

      data.push({
        year,
        age,
        startSalary: currentStartSalary,
        perfRaise: perfRaiseAmount,
        structRaise: structRaiseThisYear,
        monthlySalary,
        rates: { company: s_companyRate, retention: s_retentionRate },
        pre,
        post,
        months,
        annualTotalAmt,
        calculationNote,
        retentionBonusMonths: i === 0 ? Math.min(12 - s_y0Months, 6) : 0,
        avgStockPrice: currentStockPrice,
        calculationPrice,
        sharesBought,
        dividendBaseShares: (i>0 ? (shares.user - sharesBought - resUser.sharesFromDiv) + (sharesBought/2) : 0),
        dividendIncome: Math.round((i>0 ? (shares.user - sharesBought - resUser.sharesFromDiv) + (sharesBought/2) : 0) * s_dividendPerShare),
        dividendPerShare: s_dividendPerShare, 
        sharesFromDiv: resUser.sharesFromDiv,
        prevTotalShares: (shares.user - sharesBought - resUser.sharesFromDiv), 
        totalShares: shares.user,
        totalValue: totalValueUser,
        totalValueP25,
        totalValueP50,
        totalValueP75,
        totalPrincipal
      });

      currentStartSalary = monthlySalary;
      const rawNextPrice = currentStockPrice * (1 + s_stockGrowthRate / 100);
      const floorPrice = Math.floor(rawNextPrice);
      const decimalPart = rawNextPrice - floorPrice;
      const adder = decimalPart >= 0.5 ? 1 : 0.5;
      currentStockPrice = floorPrice + adder;
    }

    setTableData(data);
    
    if (data.length > 0) {
      const last = data[data.length - 1];
      setSummary({
        totalAssets: last.totalValue,
        totalShares: last.totalShares,
        totalPrincipal: last.totalPrincipal,
        annualDividend: Math.round(last.totalShares * s_dividendPerShare),
        monthlyDividend: Math.round(last.totalShares * s_dividendPerShare / 12),
        p25: { assets: last.totalValueP25, shares: shares.p25, annualDiv: Math.round(shares.p25 * stats.p25) },
        p50: { assets: last.totalValueP50, shares: shares.p50, annualDiv: Math.round(shares.p50 * stats.p50) },
        p75: { assets: last.totalValueP75, shares: shares.p75, annualDiv: Math.round(shares.p75 * stats.p75) },
      });
    }

  }, [currentAge, retireAge, startSalaryY0, probationRaiseAmount, probationRaisePercent, probationRaiseType, annualRaise, structRaiseType, structRaiseAmount, cycleActiveYears, cyclePauseYears, intervalYears, companyRate, retentionRate, y0Months, initialStockPrice, stockGrowthRate, dividendPerShare, manualStructRaises, fixedCalcPrice]);

  return (
    <div className="min-h-0 bg-transparent p-0 font-sans text-slate-800 relative animate-in fade-in zoom-in-95 duration-300">
      <div className="max-w-full mx-auto space-y-6">
        
        {/* Header & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <header className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors">
            <div>
              <h1 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
                <Table className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                持股信託資產試算
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                依據預估薪資成長與股價表現，模擬退休資產累積狀況
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">預估退休資產 (藍色區域)</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">${fmtMoney(summary.totalAssets)}</div>
              <div className="text-xs text-slate-400 mt-1">累積總股數: {fmtMoney(summary.totalShares)} (約{(summary.totalShares/1000).toFixed(1)}張)</div>
            </div>
          </header>

          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <DollarSign size={18} className="text-green-600 dark:text-green-400"/>
              退休預估被動收入 (依目前累積股數試算)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50/50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                <div className="text-xs text-green-700 dark:text-green-400 font-bold mb-1">預估年領股利</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{fmtMoney(summary.annualDividend)} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/年</span></div>
              </div>
              <div className="bg-green-50/50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                <div className="text-xs text-green-700 dark:text-green-400 font-bold mb-1">平均月領金額</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{fmtMoney(summary.monthlyDividend)} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/月</span></div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-medium">情境參考</th>
                    <th className="px-3 py-2 font-medium text-right">配息參數</th>
                    <th className="px-3 py-2 font-medium text-right">累積股數</th>
                    <th className="px-3 py-2 font-medium text-right text-green-700 dark:text-green-400">預估年領股利</th>
                    <th className="px-3 py-2 font-medium text-right text-green-700 dark:text-green-400">平均月領</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">保守 (P25)</td>
                    <td className="px-3 py-2 text-right dark:text-slate-300">${stats.p25}</td>
                    <td className="px-3 py-2 text-right dark:text-slate-300">{fmtMoney(summary.p25.shares)}</td>
                    <td className="px-3 py-2 text-right font-medium dark:text-slate-200">{fmtMoney(summary.p25.annualDiv)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{fmtMoney(Math.round(summary.p25.annualDiv/12))}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 py-2 text-blue-600 dark:text-blue-400 font-medium">中位 (P50)</td>
                    <td className="px-3 py-2 text-right font-bold text-blue-600 dark:text-blue-400">${stats.p50}</td>
                    <td className="px-3 py-2 text-right font-medium dark:text-slate-200">{fmtMoney(summary.p50.shares)}</td>
                    <td className="px-3 py-2 text-right font-bold text-blue-700 dark:text-blue-300">{fmtMoney(summary.p50.annualDiv)}</td>
                    <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400 font-medium">{fmtMoney(Math.round(summary.p50.annualDiv/12))}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 py-2 text-orange-600 dark:text-orange-400">激進 (P75)</td>
                    <td className="px-3 py-2 text-right dark:text-slate-300">${stats.p75}</td>
                    <td className="px-3 py-2 text-right dark:text-slate-300">{fmtMoney(summary.p75.shares)}</td>
                    <td className="px-3 py-2 text-right font-medium dark:text-slate-200">{fmtMoney(summary.p75.annualDiv)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{fmtMoney(Math.round(summary.p75.annualDiv/12))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左側：參數設定面板 (改為摺疊) */}
          <div className="lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
              
              {/* 群組 1: 基礎設定 (預設開啟) */}
              <SidebarSection 
                title="基礎設定" 
                icon={Calendar} 
                isOpen={expandedSections.basic} 
                onToggle={() => toggleSection('basic')}
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1"><span>目前年齡</span><span className="font-bold text-blue-600 dark:text-blue-400">{currentAge} 歲</span></div>
                    <input type="range" min="20" max="60" value={safeNum(currentAge, 27)} onChange={handleInputChange(setCurrentAge)} className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1"><span>退休年齡</span><span className="font-bold text-blue-600 dark:text-blue-400">{retireAge} 歲</span></div>
                    <input type="range" min="50" max="80" value={safeNum(retireAge, 65)} onChange={handleInputChange(setRetireAge)} className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">起薪(薪額與層次職加)</label>
                    <div className="relative mt-1"><span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span><input type="number" min="0" value={startSalaryY0} onChange={handleInputChange(setStartSalaryY0)} className="w-full border border-slate-200 dark:border-slate-600 rounded pl-5 pr-2 py-1 text-sm font-medium text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-700" /></div>
                  </div>
                </div>
              </SidebarSection>

              {/* 群組 2: 調薪參數 (預設關閉) */}
              <SidebarSection 
                title="調薪參數" 
                icon={TrendingUp} 
                isOpen={expandedSections.raise} 
                onToggle={() => toggleSection('raise')}
              >
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-500 dark:text-slate-400">試用期滿調薪</label>
                      <div className="flex bg-slate-100 dark:bg-slate-700 rounded p-0.5">
                        <button onClick={() => setProbationRaiseType('amount')} className={`px-2 py-0.5 text-[10px] rounded transition-colors ${probationRaiseType === 'amount' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400'}`}>$</button>
                        <button onClick={() => setProbationRaiseType('percent')} className={`px-2 py-0.5 text-[10px] rounded transition-colors ${probationRaiseType === 'percent' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400'}`}>%</button>
                      </div>
                    </div>
                    <div className="relative">
                      {probationRaiseType === 'amount' && <span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span>}
                      <input type="number" min="0" step={probationRaiseType === 'percent' ? '0.1' : '1'} value={probationRaiseType === 'amount' ? probationRaiseAmount : probationRaisePercent} onChange={handleInputChange(probationRaiseType === 'amount' ? setProbationRaiseAmount : setProbationRaisePercent)} className={`w-full border border-slate-200 dark:border-slate-600 rounded pr-2 py-1 text-sm bg-white dark:bg-slate-700 dark:text-white ${probationRaiseType === 'amount' ? 'pl-5' : 'pl-2'}`} />
                      {probationRaiseType === 'percent' && <span className="absolute right-2 top-1.5 text-slate-400 text-xs">%</span>}
                    </div>
                  </div>
                  <div><label className="text-xs text-slate-500 dark:text-slate-400">年度績效調薪 (每年)</label><input type="number" min="0" value={annualRaise} onChange={handleInputChange(setAnnualRaise)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 dark:text-white" /></div>
                  <div className="bg-slate-50 dark:bg-slate-700/30 p-2 rounded border border-slate-100 dark:border-slate-700">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">年度結構調薪模式</label>
                    <select value={structRaiseType} onChange={e => setStructRaiseType(e.target.value)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm mb-2 bg-white dark:bg-slate-800 dark:text-white">
                      <option value="fixed">每年固定調薪</option><option value="cycle">週期循環調薪 (X年調, Y年停)</option><option value="interval">間隔頻率調薪 (每 N 年)</option>
                    </select>
                    <div className="space-y-2">
                      <div><label className="text-xs text-slate-500 dark:text-slate-400">每次調薪金額</label><input type="number" min="0" value={structRaiseAmount} onChange={handleInputChange(setStructRaiseAmount)} className="w-full border rounded px-2 py-1 text-sm border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-white" /></div>
                      {structRaiseType === 'cycle' && (<div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-slate-500 dark:text-slate-400">連續調薪(年)</label><input type="number" min="0" value={cycleActiveYears} onChange={handleInputChange(setCycleActiveYears)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-800 dark:text-white" /></div><div><label className="text-xs text-slate-500 dark:text-slate-400">暫停調薪(年)</label><input type="number" min="0" value={cyclePauseYears} onChange={handleInputChange(setCyclePauseYears)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-800 dark:text-white" /></div></div>)}
                      {structRaiseType === 'interval' && (<div><label className="text-xs text-slate-500 dark:text-slate-400">每隔幾年調一次</label><input type="number" min="0" value={intervalYears} onChange={handleInputChange(setIntervalYears)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-800 dark:text-white" /><div className="text-xs text-slate-400 mt-1">例如設定 3，則第 3, 6, 9... 年調薪</div></div>)}
                    </div>
                  </div>
                </div>
              </SidebarSection>

              {/* 群組 3: 提撥公式參數 (預設關閉) */}
              <SidebarSection 
                title="提撥公式參數" 
                icon={DollarSign} 
                isOpen={expandedSections.contrib} 
                onToggle={() => toggleSection('contrib')}
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs text-slate-500 dark:text-slate-400">公提比例 %</label><input type="number" step="0.1" min="0" value={companyRate} onChange={handleInputChange(setCompanyRate)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white" /></div>
                  <div><label className="text-xs text-slate-500 dark:text-slate-400">留才比例 %</label><input type="number" step="0.1" min="0" value={retentionRate} onChange={handleInputChange(setRetentionRate)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white" /></div>
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-700/30 p-3 rounded border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2"><AlertCircle size={12} /> 第0年修正</div>
                  <div><label className="text-[10px] text-slate-400 dark:text-slate-500">自提月數 (Q3)</label><input type="number" min="0" value={y0Months} onChange={handleInputChange(setY0Months)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-800 dark:text-white" /><p className="text-[10px] text-slate-400 mt-1">自動補足留才: 留才(前) × MIN(12-月數, 6)</p></div>
                </div>
              </SidebarSection>

              {/* 群組 4: 市場假設 (預設關閉) */}
              <SidebarSection 
                title="市場假設" 
                icon={TrendingUp} 
                isOpen={expandedSections.market} 
                onToggle={() => toggleSection('market')}
              >
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="col-span-1"><label className="text-[10px] text-slate-500 dark:text-slate-400">初始股價</label><input type="number" step="0.1" min="0" value={initialStockPrice} onChange={handleInputChange(setInitialStockPrice)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-1 py-1 text-sm bg-white dark:bg-slate-800 dark:text-white" /></div>
                  <div className="col-span-1"><label className="text-[10px] text-slate-500 dark:text-slate-400">股價漲幅%</label><input type="number" step="0.1" min="0" value={stockGrowthRate} onChange={handleInputChange(setStockGrowthRate)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-1 py-1 text-sm bg-white dark:bg-slate-800 dark:text-white" /></div>
                  <div className="col-span-1"><label className="text-[10px] text-slate-500 dark:text-slate-400 leading-3 block mb-1">預估現金股利<br/>(元/股)</label><input type="number" step="0.1" min="0" value={dividendPerShare} onChange={handleInputChange(setDividendPerShare)} className="w-full border border-slate-200 dark:border-slate-600 rounded px-1 py-1 text-sm bg-white dark:bg-slate-800 dark:text-white" /></div>
                  
                  {/* 需求 2: 固定計算股價 優化 + Tooltip */}
                  <div className="col-span-1">
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 leading-3 block mb-1 font-bold text-blue-600 dark:text-blue-400">
                      試算基準股價
                    </label>
                    <div className="relative">
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" step="0.1" min="0" 
                          placeholder="預設浮動" 
                          value={fixedCalcPrice} 
                          onChange={handleInputChange(setFixedCalcPrice)} 
                          className="w-full border rounded px-1 py-1 text-sm border-blue-200 bg-blue-50/30 focus:bg-white dark:bg-blue-900/20 dark:border-blue-800 dark:text-white dark:focus:bg-slate-800" 
                        />
                        <button 
                          onClick={() => setShowPriceHelp(!showPriceHelp)} 
                          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                        >
                          <HelpCircle size={14} />
                        </button>
                      </div>
                      
                      {/* 提示框 */}
                      {showPriceHelp && (
                        <div className="absolute top-full right-0 mt-2 z-20 w-48 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl animate-in fade-in slide-in-from-top-1">
                          <p className="leading-relaxed">
                            若填寫此欄位，系統將強制以「固定價格」來計算每年的購入股數與股息再投入，<span className="text-yellow-300 font-bold">完全忽略</span> 左側設定的股價漲幅。
                          </p>
                          <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-800 rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 歷史配息參考 */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button onClick={() => setShowDividendHistory(!showDividendHistory)} className="w-full flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    <span className="flex items-center gap-1"><Info size={12}/> 歷史配息參考 (近15年)</span>{showDividendHistory ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </button>
                  {showDividendHistory && (
                    <div className="p-3 bg-white dark:bg-slate-800 space-y-3">
                      <div className="flex justify-between gap-2 text-xs">
                        <button onClick={() => setDividendPerShare(Number(stats.p25))} className="flex-1 p-2 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded hover:bg-green-100 dark:hover:bg-green-900/50 text-center"><div className="text-green-600 dark:text-green-400 font-medium">保守 (P25)</div><div className="font-bold text-slate-800 dark:text-white">{stats.p25}</div></button>
                        <button onClick={() => setDividendPerShare(Number(stats.p50))} className="flex-1 p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 text-center"><div className="text-blue-600 dark:text-blue-400 font-medium">中位 (P50)</div><div className="font-bold text-slate-800 dark:text-white">{stats.p50}</div></button>
                        <button onClick={() => setDividendPerShare(Number(stats.p75))} className="flex-1 p-2 bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 rounded hover:bg-orange-100 dark:hover:bg-orange-900/50 text-center"><div className="text-orange-600 dark:text-orange-400 font-medium">激進 (P75)</div><div className="font-bold text-slate-800 dark:text-white">{stats.p75}</div></button>
                      </div>
                      <div className="max-h-[150px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded text-xs scrollbar-hide">
                        <table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-700 sticky top-0"><tr><th className="p-2 border-b border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">年度</th><th className="p-2 border-b border-slate-200 dark:border-slate-600 text-right text-slate-600 dark:text-slate-300">股利</th></tr></thead><tbody>{dividendHistory.map(row => (<tr key={row.year} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50"><td className="p-1.5 pl-2 text-slate-600 dark:text-slate-300">{row.year}</td><td className="p-1.5 pr-2 text-right text-slate-600 dark:text-slate-300">{row.dividend.toFixed(2)}</td></tr>))}</tbody></table>
                      </div>
                    </div>
                  )}
                </div>
              </SidebarSection>
          </div>

          {/* 右側：圖表與報表 (改動：確保高度與間距分離) */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 h-[calc(100vh-150px)] overflow-y-auto pr-1 scrollbar-hide pb-20">
            {/* 圖表卡片 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex-shrink-0 transition-colors">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-slate-600 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded flex items-center gap-2"><TrendingUp size={16} className="text-blue-500 dark:text-blue-400"/>資產累積趨勢預估</h3>
                 <button onClick={() => setShowComparisonLines(!showComparisonLines)} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-all ${showComparisonLines ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{showComparisonLines ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}{showComparisonLines ? '已顯示配息情境比較' : '顯示配息情境比較'}</button>
               </div>
               <div className="h-[400px] w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={tableData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}><defs><linearGradient id="colorAsset" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/></linearGradient><linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" /><XAxis dataKey="age" tick={{fontSize: 12, fill: '#94a3b8'}} interval={4} stroke="#94a3b8" label={{ value: '年齡', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 12 }} /><YAxis tickFormatter={(val)=> val >= 10000 ? `${(val/10000).toFixed(0)}萬` : val} tick={{fontSize: 12, fill: '#94a3b8'}} width={60} stroke="#94a3b8" /><Tooltip contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} labelFormatter={(label) => `${label} 歲`} formatter={(val, name) => { if (name === 'totalValue') return [fmtMoney(val), '預估資產 (自選)']; if (name === 'totalPrincipal') return [fmtMoney(val), '累積投入成本']; if (name === 'totalValueP25') return [fmtMoney(val), `保守 (P25: $${stats.p25})`]; if (name === 'totalValueP50') return [fmtMoney(val), `中位 (P50: $${stats.p50})`]; if (name === 'totalValueP75') return [fmtMoney(val), `激進 (P75: $${stats.p75})`]; return [val, name]; }} /><Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }} /><Area type="monotone" dataKey="totalValue" name="資產總值" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAsset)" /><Area type="monotone" dataKey="totalPrincipal" name="累積成本" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPrincipal)" />{showComparisonLines && (<><Line type="monotone" dataKey="totalValueP75" name={`激進($${stats.p75})`} stroke="#ea580c" strokeWidth={1.5} strokeDasharray="3 3" dot={false} /><Line type="monotone" dataKey="totalValueP50" name={`中位($${stats.p50})`} stroke="#0284c7" strokeWidth={1.5} strokeDasharray="3 3" dot={false} /><Line type="monotone" dataKey="totalValueP25" name={`保守($${stats.p25})`} stroke="#16a34a" strokeWidth={1.5} strokeDasharray="3 3" dot={false} /></>)}</ComposedChart></ResponsiveContainer></div>
            </div>
            
            {/* 表格卡片 (改動：使用 h-auto 與 flex-none，確保它是獨立區塊) */}
            <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col flex-none transition-all duration-300 ${isTableOpen ? 'h-[500px]' : 'h-auto'}`}>
              <button onClick={() => setIsTableOpen(!isTableOpen)} className="w-full py-4 px-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-t-xl group"><div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200"><Table size={18} className="text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"/>查看詳細年度數據</div><div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-full group-hover:bg-white dark:group-hover:bg-slate-600 group-hover:shadow-sm transition-all">{isTableOpen ? '收起' : '展開'}{isTableOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</div></button>
              {isTableOpen && (
                <div className="flex-1 flex flex-col min-h-0 border-t border-slate-100 dark:border-slate-700">
                  <div className="bg-blue-50/30 dark:bg-blue-900/10 px-4 py-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b border-blue-100 dark:border-blue-800 justify-between flex-shrink-0"><span className="flex items-center gap-2"><Search size={14} /> 點擊列可查看明細</span><span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-800"><Edit3 size={12}/> 結構調薪可直接輸入修改</span></div>
                  <div className="flex-1 overflow-auto relative scrollbar-hide">
                    <table className="w-max text-xs text-left border-collapse">
                      <thead className="text-slate-600 dark:text-slate-300 font-semibold shadow-sm"><tr><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 min-w-[50px] sticky top-0 left-0 bg-slate-100 dark:bg-slate-700 z-30">年度</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 min-w-[50px] sticky top-0 bg-slate-100 dark:bg-slate-700 z-20">年齡</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-blue-50 dark:bg-blue-900/20 min-w-[70px] sticky top-0 z-20">起薪</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-blue-50 dark:bg-blue-900/20 min-w-[60px] sticky top-0 z-20">績效<br/>調薪</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-blue-50 dark:bg-blue-900/20 min-w-[70px] sticky top-0 z-20">結構<br/>調薪</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-blue-100 dark:bg-blue-800/40 min-w-[70px] font-bold text-blue-700 dark:text-blue-300 sticky top-0 z-20">月薪</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 min-w-[50px] sticky top-0 bg-slate-100 dark:bg-slate-700 z-20">公提%</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 min-w-[50px] sticky top-0 bg-slate-100 dark:bg-slate-700 z-20">留才%</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-orange-50 dark:bg-orange-900/20 min-w-[60px] sticky top-0 z-20">自提<br/>(前)</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-orange-50 dark:bg-orange-900/20 min-w-[60px] sticky top-0 z-20">公提<br/>(前)</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-orange-50 dark:bg-orange-900/20 min-w-[60px] sticky top-0 z-20">留才<br/>(前)</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-orange-100 dark:bg-orange-800/40 font-semibold text-orange-800 dark:text-orange-300 min-w-[70px] sticky top-0 z-20">月提<br/>(前)</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-green-50 dark:bg-green-900/20 min-w-[60px] sticky top-0 z-20">自提<br/>(後)</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-green-50 dark:bg-green-900/20 min-w-[60px] sticky top-0 z-20">公提<br/>(後)</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-green-50 dark:bg-green-900/20 min-w-[60px] sticky top-0 z-20">留才<br/>(後)</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 bg-green-100 dark:bg-green-800/40 font-semibold text-green-800 dark:text-green-300 min-w-[70px] sticky top-0 z-20">月提<br/>(後)</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 min-w-[50px] sticky top-0 bg-slate-100 dark:bg-slate-700 z-20">月數</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 min-w-[80px] sticky top-0 z-20">年提金額</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 min-w-[60px] sticky top-0 bg-slate-100 dark:bg-slate-700 z-20">平均<br/>股價</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 min-w-[60px] sticky top-0 bg-slate-100 dark:bg-slate-700 z-20">年提<br/>股數</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 min-w-[60px] sticky top-0 bg-slate-100 dark:bg-slate-700 z-20">配息</th><th className="p-2 border-b border-r border-slate-200 dark:border-slate-600 min-w-[60px] sticky top-0 bg-slate-100 dark:bg-slate-700 z-20">配息<br/>再投入</th><th className="p-2 border-b border-slate-200 dark:border-slate-600 min-w-[80px] font-bold bg-yellow-50 dark:bg-yellow-900/20 text-slate-900 dark:text-slate-100 sticky top-0 right-0 z-30 border-l border-slate-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">總股數</th></tr></thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 cursor-pointer">
                        {tableData.map((row) => (
                          <tr key={row.year} onClick={() => setSelectedYearData(row)} className="hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors active:bg-blue-200 dark:active:bg-blue-800">
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400 sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-blue-50 z-10">{row.year}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-medium text-slate-700 dark:text-slate-300">{row.age}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-slate-600 dark:text-slate-400 bg-blue-50/10 dark:bg-blue-900/10">{fmtMoney(row.startSalary)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-slate-500 dark:text-slate-400 bg-blue-50/10 dark:bg-blue-900/10">{row.perfRaise > 0 ? `+${row.perfRaise}` : '-'}</td>
                            <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-right bg-blue-50/10 dark:bg-blue-900/10" onClick={(e) => e.stopPropagation()}>
                              <div className="relative"><input type="number" min="0" value={manualStructRaises[row.year] ?? row.structRaise} onChange={(e) => handleTableStructRaiseChange(row.year, e.target.value)} className={`w-full text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none px-1 py-0.5 ${manualStructRaises[row.year] !== undefined ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`} />{manualStructRaises[row.year] !== undefined && (<div className="absolute top-0 right-0 w-1.5 h-1.5 bg-orange-500 rounded-full -mt-0.5 -mr-0.5"></div>)}</div>
                            </td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-bold text-blue-700 dark:text-blue-300 bg-blue-100/20 dark:bg-blue-900/20">{fmtMoney(row.monthlySalary)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center text-slate-400">{row.rates.company}%</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center text-slate-400">{row.rates.retention}%</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-slate-500 dark:text-slate-400 bg-orange-50/10 dark:bg-orange-900/10">{fmtMoney(row.pre.self)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-slate-400 bg-orange-50/10 dark:bg-orange-900/10">{fmtMoney(row.pre.company)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-slate-400 bg-orange-50/10 dark:bg-orange-900/10">{fmtMoney(row.pre.retention)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-medium text-orange-700 dark:text-orange-300 bg-orange-100/10 dark:bg-orange-900/20">{fmtMoney(row.pre.total)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-slate-500 dark:text-slate-400 bg-green-50/10 dark:bg-green-900/10">{fmtMoney(row.post.self)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-slate-400 bg-green-50/10 dark:bg-green-900/10">{fmtMoney(row.post.company)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-slate-400 bg-green-50/10 dark:bg-green-900/10">{fmtMoney(row.post.retention)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-medium text-green-700 dark:text-green-300 bg-green-100/10 dark:bg-green-900/20">{fmtMoney(row.post.total)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">{row.months}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50">{fmtMoney(row.annualTotalAmt)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-slate-500 dark:text-slate-400">{fmtPrice(row.avgStockPrice)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-blue-600 dark:text-blue-400 font-medium">{fmtMoney(row.sharesBought)}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-slate-400">{row.dividendIncome > 0 ? fmtMoney(row.dividendIncome) : '-'}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right text-green-600 dark:text-green-400">{row.sharesFromDiv > 0 ? fmtMoney(row.sharesFromDiv) : '-'}</td>
                            <td className="p-2 font-bold text-slate-900 dark:text-slate-100 text-right bg-yellow-50 dark:bg-yellow-900/20 sticky right-0 z-10 border-l border-slate-200 dark:border-slate-700">{fmtMoney(row.totalShares)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedYearData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedYearData(null)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Calculator size={24} className="text-blue-600 dark:text-blue-400"/> 第 {selectedYearData.year} 年度計算明細 (Age {selectedYearData.age})</h2>
                <button onClick={() => setSelectedYearData(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-6 text-slate-800 dark:text-slate-200">
                <section>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs">1</span> 月薪計算</h3>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-sm space-y-2 font-mono">
                    <div className="flex justify-between"><span>起薪</span><span>{fmtMoney(selectedYearData.startSalary)}</span></div>
                    <div className="flex justify-between text-green-600 dark:text-green-400"><span>+ 績效調薪</span><span>{selectedYearData.perfRaise}</span></div>
                    <div className="flex justify-between text-green-600 dark:text-green-400 border-b border-slate-200 dark:border-slate-600 pb-2"><span>+ 結構調薪</span><span>{selectedYearData.structRaise}</span></div>
                    <div className="flex justify-between font-bold text-blue-700 dark:text-blue-300 text-base pt-1"><span>= 月薪 (調薪後)</span><span>{fmtMoney(selectedYearData.monthlySalary)}</span></div>
                  </div>
                </section>
                <section>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs">2</span> 單月提撥計算公式代入</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
                      <div className="font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded inline-block text-xs mb-1">調薪前 (基準: {fmtMoney(selectedYearData.startSalary)})</div>
                      <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                        <p><span className="font-semibold">自提:</span> ({selectedYearData.startSalary} × 13.6 ÷ 12 ÷ 1000) 無條件捨去 × 100 = <span className="font-bold text-slate-800 dark:text-white">{selectedYearData.pre.self}</span></p>
                        <p><span className="font-semibold">公提:</span> ({selectedYearData.pre.self} × {selectedYearData.rates.company}%) 無條件進位 = <span className="font-bold text-slate-800 dark:text-white">{selectedYearData.pre.company}</span></p>
                        <p><span className="font-semibold">留才:</span> ({selectedYearData.pre.self} × {selectedYearData.rates.retention}%) 無條件進位 = <span className="font-bold text-slate-800 dark:text-white">{selectedYearData.pre.retention}</span></p>
                        <div className="border-t border-slate-200 dark:border-slate-600 pt-1 mt-2 font-bold text-orange-600 dark:text-orange-400">合計: {selectedYearData.pre.total} /月</div>
                      </div>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
                      <div className="font-bold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded inline-block text-xs mb-1">調薪後 (基準: {fmtMoney(selectedYearData.monthlySalary)})</div>
                      <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                        <p><span className="font-semibold">自提:</span> ({selectedYearData.monthlySalary} × 13.6 ÷ 12 ÷ 1000) 無條件捨去 × 100 = <span className="font-bold text-slate-800 dark:text-white">{selectedYearData.post.self}</span></p>
                        <p><span className="font-semibold">公提:</span> ({selectedYearData.post.self} × {selectedYearData.rates.company}%) 無條件進位 = <span className="font-bold text-slate-800 dark:text-white">{selectedYearData.post.company}</span></p>
                        <p><span className="font-semibold">留才:</span> ({selectedYearData.post.self} × {selectedYearData.rates.retention}%) 無條件進位 = <span className="font-bold text-slate-800 dark:text-white">{selectedYearData.post.retention}</span></p>
                        <div className="border-t border-slate-200 dark:border-slate-600 pt-1 mt-2 font-bold text-green-600 dark:text-green-400">合計: {selectedYearData.post.total} /月</div>
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs">3</span> 年度總金額計算</h3>
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg text-sm">
                    <p className="font-mono text-slate-700 dark:text-slate-300 mb-2">{selectedYearData.calculationNote}</p>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2 text-right">= {fmtMoney(selectedYearData.annualTotalAmt)}</div>
                  </div>
                </section>
                <section>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs">4</span> 本金購買股數</h3>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-sm font-mono">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-slate-600 dark:text-slate-300">年提金額 ({fmtMoney(selectedYearData.annualTotalAmt)}) ÷ {selectedYearData.calculationPrice === selectedYearData.avgStockPrice ? '平均股價' : '固定股價'} ({selectedYearData.calculationPrice.toFixed(1)}) = </span>
                        {selectedYearData.calculationPrice !== selectedYearData.avgStockPrice && <span className="text-[10px] text-orange-500">(使用固定計算股價)</span>}
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{fmtMoney(selectedYearData.sharesBought)} 股</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 text-right">(無條件捨去)</div>
                  </div>
                </section>
                <section>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs">5</span> 配息與再投入</h3>
                  {selectedYearData.year === 0 ? (<div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-sm text-center text-slate-400">第 0 年度不計算配息與再投入</div>) : (<>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-700/30">
                           <div className="font-bold text-slate-700 dark:text-slate-200 mb-2 border-b border-slate-200 dark:border-slate-600 pb-1">配息基準</div>
                           <div className="space-y-1 text-slate-600 dark:text-slate-300">
                             <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">上年末累積</span><span>{fmtMoney(selectedYearData.prevTotalShares)}</span></div>
                             <div className="flex justify-between text-xs text-slate-400"><span className="text-slate-500 dark:text-slate-400">+ 本年購入/2</span><span>+ {fmtMoney(selectedYearData.sharesBought/2)}</span></div>
                             <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-1 font-bold text-blue-700 dark:text-blue-300 mt-1"><span>= 計算基礎股數</span><span>{fmtMoney(selectedYearData.dividendBaseShares)}</span></div>
                           </div>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-700/30">
                           <div className="font-bold text-slate-700 dark:text-slate-200 mb-2 border-b border-slate-200 dark:border-slate-600 pb-1">再投入計算</div>
                           <div className="space-y-1 text-slate-600 dark:text-slate-300">
                             <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">× 配息 (元/股)</span><span>× {selectedYearData.dividendPerShare}</span></div>
                             <div className="flex justify-between text-xs text-slate-400"><span className="text-slate-500 dark:text-slate-400">÷ {selectedYearData.calculationPrice === selectedYearData.avgStockPrice ? '平均股價' : '固定股價'}</span><span>÷ {selectedYearData.calculationPrice.toFixed(1)}</span></div>
                             <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-1 font-bold text-green-700 dark:text-green-300 mt-1"><span>= 再投入股數</span><span>{fmtMoney(selectedYearData.sharesFromDiv)} 股</span></div>
                           </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-slate-400 text-center">公式：( ( 上年末累積 + 本年購入/2 ) × 配息 ÷ {selectedYearData.calculationPrice === selectedYearData.avgStockPrice ? '平均股價' : '固定股價'} ) 取整數</div>
                    </>
                  )}
                </section>
                <section>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs">6</span> 本年度總股數驗算</h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-200">
                    <div className="flex flex-wrap items-center gap-2 justify-center md:justify-between text-center md:text-left">
                        <div><div className="text-xs text-slate-500 dark:text-slate-400 mb-1">上年末累積</div><div className="font-bold">{fmtMoney(selectedYearData.prevTotalShares)}</div></div><div className="text-slate-400">+</div>
                        <div><div className="text-xs text-slate-500 dark:text-slate-400 mb-1">本金購買</div><div className="font-bold text-blue-700 dark:text-blue-300">{fmtMoney(selectedYearData.sharesBought)}</div></div><div className="text-slate-400">+</div>
                        <div><div className="text-xs text-slate-500 dark:text-slate-400 mb-1">配息再投入</div><div className="font-bold text-green-700 dark:text-green-300">{fmtMoney(selectedYearData.sharesFromDiv)}</div></div><div className="text-slate-400">=</div>
                        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded shadow-sm border border-yellow-200 dark:border-yellow-800"><div className="text-xs text-slate-500 dark:text-slate-400 mb-1">本年末總股數</div><div className="font-bold text-xl text-slate-900 dark:text-white">{fmtMoney(selectedYearData.totalShares)} 股</div></div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end"><button onClick={() => setSelectedYearData(null)} className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">關閉</button></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrustSimulator;
