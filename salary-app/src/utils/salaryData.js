// --- 工具函式 ---
export const val = (v) => (v === '' || isNaN(Number(v))) ? 0 : Number(v);

export const formatCurrency = (num) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(num);

export const blockInvalidChar = (e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); };

// --- 常數資料 ---
export const LEVEL_OPTIONS = [
  { code: '19', value: 51795 }, { code: '18', value: 44735 }, { code: '17', value: 39435 }, { code: '16', value: 35905 },
  { code: '15', value: 32370 }, { code: '14', value: 28840 }, { code: '13', value: 25310 }, { code: '12', value: 21780 },
  { code: '11', value: 19135 }, { code: '10', value: 16480 }, { code: '09', value: 13835 }, { code: '08', value: 11190 },
  { code: '07', value: 9420 }, { code: '06', value: 8245 }, { code: '05', value: 7070 }, { code: '04', value: 5890 },
  { code: '03', value: 4715 }, { code: '02', value: 3535 }, { code: '01', value: 2360 }, { code: '00', value: 0 },
];

export const HEALTH_INSURANCE_GRADES = [
  40100, 42000, 43900, 45800, 48200, 50600, 53000, 55400, 57800, 60800,
  63800, 66800, 69800, 72800, 76500, 80200, 83900, 87600, 92100, 96600,
  101100, 105600, 110100, 115500, 120900, 126300, 131700, 137100, 142500, 147900,
  150000, 156400, 162800, 169200, 175600, 182000, 189500, 197000, 204500
];

export const DEFAULT_INCOME = { base: 50020, level: '', meal: 3000, transport: 2500, attendance: '', stockBonus: '', retentionBonus: '' };
export const DEFAULT_DEDUCTION = { unionFee: '', unionMutual: '', labor: '', welfare: '', health: '', stockTrust: '', stockBonus: '', retentionBonus: '' };

export const DEFAULT_BONUSES = [
  { id: 1, name: '春節獎金', type: 'month', value: 1.0 },
  { id: 2, name: '端午節獎金', type: 'month', value: 0.3 },
  { id: 3, name: '中秋節獎金', type: 'month', value: 0.3 },
  { id: 5, name: '績效獎金', type: 'month', value: 2.6 },
  { id: 6, name: '企業化特別獎金', type: 'fixed', value: 155000 }, 
  { id: 7, name: '員工酬勞', type: 'fixed', value: 95000 },
];