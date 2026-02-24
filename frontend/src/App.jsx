import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, ArrowLeftRight, Tags, PieChart as PieChartIcon, Sun, LogOut, 
  TrendingUp, TrendingDown, Wallet, Receipt, ReceiptText, 
  Plus, Edit, Trash2, Image as ImageIcon, X, ArrowLeft, Upload,
  ChevronLeft, ChevronRight, Activity // นำเข้าไอคอนเพิ่มเติมสำหรับหน้ารายงาน
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area // นำเข้า AreaChart สำหรับกราฟคลื่น
} from 'recharts';

const CATEGORY_COLORS = [
  '#EF4444', '#F87171', '#F97316', '#EAB308', '#84CC16', '#10B981', '#059669', '#14B8A6', 
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#64748B'
];

const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('overview'); 
  const [filterType, setFilterType] = useState('ALL'); 
  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [editingId, setEditingId] = useState(null); 

  // State หมวดหมู่
  const [categoryTab, setCategoryTab] = useState('EXPENSE'); 
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false); 
  const [categories, setCategories] = useState([
    { id: 1, name: 'ถุงถวาย', type: 'INCOME', color: '#10B981' },
    { id: 2, name: 'เงินสนับสนุน', type: 'INCOME', color: '#3B82F6' },
    { id: 3, name: 'ค่าไฟ', type: 'EXPENSE', color: '#EF4444' },
    { id: 4, name: 'ค่าซ่อมบำรุง', type: 'EXPENSE', color: '#F59E0B' },
    { id: 5, name: 'กิจกรรมเยาวชน', type: 'EXPENSE', color: '#8B5CF6' },
  ]);

  const [categoryFormData, setCategoryFormData] = useState({
    id: null, name: '', type: 'EXPENSE', color: CATEGORY_COLORS[2]
  });

  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
    description: '',
    amount: '',
    note: '' 
  });

  const [imagePreview, setImagePreview] = useState(null); 
  const fileInputRef = useRef(null); 
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState(null);

  // State สำหรับหน้ารายงาน (เลือกปี)
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const fetchTransactions = () => {
    setLoading(true);
    fetch('http://localhost/church_accounting/church_api/get_transactions.php')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setTransactions(data);
      })
      .catch(err => console.error("Error fetching:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleTypeChange = (newType) => setFormData({ ...formData, type: newType, description: '' });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImagePreview(compressedDataUrl); 
      };
    };
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenAddTransaction = () => {
    setEditingId(null); 
    setFormData({
      transaction_date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE', description: '', amount: '', note: ''
    });
    setImagePreview(null);
    setIsFormOpen(true);
  };

  const handleOpenEditTransaction = (tx) => {
    setEditingId(tx.id); 
    setFormData({
      transaction_date: tx.transaction_date,
      type: tx.type, description: tx.description, amount: tx.amount, note: tx.note || '' 
    });
    setImagePreview(tx.image_url || null); 
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่? ข้อมูลจะถูกลบถาวร")) {
      fetch('http://localhost/church_accounting/church_api/delete_transaction.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id }),
      }).then(res => res.json()).then(data => {
        if(data.status === 'success') fetchTransactions(); 
        else alert('เกิดข้อผิดพลาด: ' + data.message);
      }).catch(err => alert("ไม่สามารถเชื่อมต่อระบบเพื่อลบข้อมูลได้"));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingId 
      ? 'http://localhost/church_accounting/church_api/update_transaction.php' 
      : 'http://localhost/church_accounting/church_api/add_transaction.php';
    const dataToSend = {
      id: editingId, transaction_date: formData.transaction_date, type: formData.type,
      description: formData.description, amount: formData.amount, note: formData.note, image_url: imagePreview 
    };
    fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend),
    }).then(res => res.json()).then(data => {
      if(data.status === 'success') {
        fetchTransactions(); 
        setFormData({ transaction_date: new Date().toISOString().split('T')[0], type: 'EXPENSE', description: '', amount: '', note: '' }); 
        setImagePreview(null); setEditingId(null); setIsFormOpen(false); 
      } else { alert('เกิดข้อผิดพลาด: ' + data.message); }
    }).catch(err => alert("ไม่สามารถเชื่อมต่อระบบหลังบ้านได้ (กรุณาเช็กว่าเปิด XAMPP ครบถ้วน)"));
  };

  const handleOpenAddCategory = () => { setCategoryFormData({ id: null, name: '', type: categoryTab, color: CATEGORY_COLORS[11] }); setIsCategoryFormOpen(true); };
  const handleOpenEditCategory = (cat) => { setCategoryFormData(cat); setIsCategoryFormOpen(true); };
  const handleDeleteCategory = (id) => { if (window.confirm('คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?')) setCategories(categories.filter(c => c.id !== id)); };
  
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;
    if (categoryFormData.id) { setCategories(categories.map(c => c.id === categoryFormData.id ? categoryFormData : c)); } 
    else {
      const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
      setCategories([...categories, { ...categoryFormData, id: newId }]); setCategoryTab(categoryFormData.type); 
    }
    setIsCategoryFormOpen(false);
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }); } 
    catch { return '-'; }
  };
  const fmt = (n) => `${(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })}`;

  // ==========================================
  // การประมวลผลข้อมูล (ภาพรวมเดือนปัจจุบัน)
  // ==========================================
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const [y, m] = t.transaction_date.split('-');
    return parseInt(m) === currentMonthNum && parseInt(y) === currentYearNum;
  });

  const totalIncome = currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpense;
  const transactionCount = currentMonthTransactions.length;

  const monthlyData = (() => {
    const md = {};
    MONTHS_TH.forEach(m => md[m] = { name: m, income: 0, expense: 0 });
    // กรองเอาเฉพาะข้อมูลปีปัจจุบันมาทำกราฟ 6 เดือนล่าสุด (จำลองดึงทุกเดือนของปีนี้)
    transactions.filter(t => t.transaction_date.startsWith(currentYearNum.toString())).forEach(t => {
      const [, month] = t.transaction_date.split('-');
      const monthName = MONTHS_TH[parseInt(month) - 1];
      if (t.type === 'INCOME') md[monthName].income += parseFloat(t.amount);
      else md[monthName].expense += parseFloat(t.amount);
    });
    return Object.values(md).slice(0, 6); // ตัดมาแค่ 6 เดือน
  })();

  const categoryData = (() => {
    const ed = {};
    currentMonthTransactions.forEach(t => {
      if (t.type === 'EXPENSE') {
        const desc = t.description || 'อื่นๆ';
        ed[desc] = (ed[desc] || 0) + parseFloat(t.amount);
      }
    });
    return Object.keys(ed).map(key => ({ name: key, value: ed[key] }));
  })();
  const PIE_COLORS = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6366F1'];

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  // ==========================================
  // การประมวลผลข้อมูล (หน้ารายงานประจำปี)
  // ==========================================
  const reportTransactions = transactions.filter(t => t.transaction_date.startsWith(selectedYear.toString()));
  const reportYearlyIncome = reportTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const reportYearlyExpense = reportTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const reportYearlyBalance = reportYearlyIncome - reportYearlyExpense;
  const reportSavingsRate = reportYearlyIncome > 0 ? ((reportYearlyBalance / reportYearlyIncome) * 100).toFixed(1) : 0;

  const reportMonthlyStats = MONTHS_TH.map((monthName, index) => {
    const monthIndexStr = (index + 1).toString().padStart(2, '0');
    const monthTx = reportTransactions.filter(t => t.transaction_date.startsWith(`${selectedYear}-${monthIndexStr}`));
    
    let inc = 0, exp = 0;
    monthTx.forEach(t => {
      if (t.type === 'INCOME') inc += parseFloat(t.amount);
      else exp += parseFloat(t.amount);
    });
    return { name: monthName, income: inc, expense: exp, balance: inc - exp };
  });

  // ฟังก์ชันแสดงรูป
  const handleViewImage = (url) => {
    if(!url) return;
    setViewImageUrl(url);
    setIsImageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060A13] flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060A13] text-white font-sans flex relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-64 border-r border-[#1E293B] bg-[#080D1A] flex flex-col justify-between hidden md:flex relative z-10">
        <div>
          <div className="p-6 border-b border-[#1E293B]">
            <h1 className="text-xl font-bold leading-tight tracking-wide">
              The House of worship<br />
              <span className="text-[#3B82F6]">and prayer</span>
            </h1>
            <p className="text-xs text-slate-500 mt-2 font-medium">ระบบบัญชีคริสตจักร</p>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-xs text-slate-600 font-semibold mb-4 px-2 tracking-wider">เมนู</p>
            <button onClick={() => setActiveMenu('overview')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeMenu === 'overview' ? 'bg-[#1E293B]/50 text-white border border-[#334155]/50 shadow-[inset_4px_0_0_0_rgba(59,130,246,1)]' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/30'}`}>
              <LayoutDashboard size={20} />
              <span className="font-medium">ภาพรวม</span>
            </button>
            <button onClick={() => setActiveMenu('record')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeMenu === 'record' ? 'bg-[#1E293B]/50 text-white border border-[#334155]/50 shadow-[inset_4px_0_0_0_rgba(59,130,246,1)]' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/30'}`}>
              <ArrowLeftRight size={20} />
              <span className="font-medium">บันทึกการเงิน</span>
            </button>
            <button onClick={() => setActiveMenu('categories')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeMenu === 'categories' ? 'bg-[#1E293B]/50 text-white border border-[#334155]/50 shadow-[inset_4px_0_0_0_rgba(59,130,246,1)]' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/30'}`}>
              <Tags size={20} />
              <span className="font-medium">ประเภทรายการ</span>
            </button>
            {/* ปลดล็อกปุ่มรายงานการเงิน */}
            <button onClick={() => setActiveMenu('reports')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeMenu === 'reports' ? 'bg-[#1E293B]/50 text-white border border-[#334155]/50 shadow-[inset_4px_0_0_0_rgba(59,130,246,1)]' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/30'}`}>
              <PieChartIcon size={20} />
              <span className="font-medium">รายงานการเงิน</span>
            </button>
          </div>
        </div>
        <div className="p-4 space-y-2 border-t border-[#1E293B]">
          <button className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl border border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 transition-all duration-300">
            <Sun size={18} />
            <span className="font-medium text-sm">Light Mode</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300">
            <LogOut size={18} />
            <span className="font-medium text-sm">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
        
        {/* ================= หน้า Dashboard ================= */}
        {activeMenu === 'overview' && (
          <div className="max-w-7xl mx-auto animate-fade-in">
             <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">ภาพรวมคริสตจักร</h1>
              <p className="text-[#94A3B8] text-sm">สรุปการเงินเดือนปัจจุบัน ({MONTHS_TH[currentMonthNum - 1]} {currentYearNum + 543})</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-[#334155] shadow-lg group">
                <div>
                  <div className="text-[#94A3B8] text-sm font-medium mb-1">รายรับ</div>
                  <div className="text-3xl font-bold text-[#4ADE80] tracking-tight">฿{fmt(totalIncome)}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-[#4ADE80]" />
                </div>
              </div>
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-[#334155] shadow-lg group">
                <div>
                  <div className="text-[#94A3B8] text-sm font-medium mb-1">รายจ่าย</div>
                  <div className="text-3xl font-bold text-[#FB7185] tracking-tight">฿{fmt(totalExpense)}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <TrendingDown size={20} className="text-[#FB7185]" />
                </div>
              </div>
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-[#334155] shadow-lg group">
                <div>
                  <div className="text-[#94A3B8] text-sm font-medium mb-1">คงเหลือ</div>
                  <div className={`text-3xl font-bold tracking-tight ${balance >= 0 ? 'text-[#4ADE80]' : 'text-[#FB7185]'}`}>
                    ฿{fmt(balance)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Wallet size={20} className="text-[#A78BFA]" />
                </div>
              </div>
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-[#334155] shadow-lg group">
                <div>
                  <div className="text-[#94A3B8] text-sm font-medium mb-1">บันทึกทั้งหมด</div>
                  <div className="text-3xl font-bold text-white tracking-tight">{transactionCount}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center border border-[#1E293B]">
                  <Receipt size={20} className="text-[#94A3B8]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl shadow-lg flex flex-col h-[400px] transition-all duration-300 hover:-translate-y-1 hover:border-[#334155]">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-1 h-5 bg-[#3B82F6] rounded-full"></div>
                  <h3 className="text-lg font-bold text-white">รายรับรายจ่าย 6 เดือนล่าสุด</h3>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/><stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.8}/></linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={1}/><stop offset="100%" stopColor="#7F1D1D" stopOpacity={0.8}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? (val/1000)+'k' : val} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0B1121', borderColor: '#1E293B', borderRadius: '8px', color: '#fff' }} cursor={{fill: '#1E293B', opacity: 0.4}} />
                      <Bar dataKey="income" name="รายรับ" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} maxBarSize={16} />
                      <Bar dataKey="expense" name="รายจ่าย" fill="url(#colorExpense)" radius={[6, 6, 0, 0]} maxBarSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl shadow-lg flex flex-col h-[400px] transition-all duration-300 hover:-translate-y-1 hover:border-[#334155]">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-1 h-5 bg-[#3B82F6] rounded-full"></div>
                  <h3 className="text-lg font-bold text-white">รายจ่ายตามประเภท</h3>
                </div>
                <div className="flex-1 flex items-center">
                  <div className="w-1/2 h-full">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                            {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0B1121', borderColor: '#1E293B', borderRadius: '8px', color: '#fff' }} formatter={(value) => `฿${fmt(value)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-[#64748B] text-sm">ไม่มีข้อมูล</div>}
                  </div>
                  <div className="w-1/2 flex flex-col justify-center space-y-4 pl-6 border-l border-[#1E293B]">
                    {categoryData.map((entry, index) => (
                      <div key={index} className="flex justify-between items-center pr-4">
                        <div className="flex items-center space-x-3">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                          <span className="text-[#94A3B8] text-sm">{entry.name}</span>
                        </div>
                        <span className="font-bold text-white text-sm">฿{fmt(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:block bg-[#0E1525] border border-[#1E293B] rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:border-[#334155]">
              <div className="px-6 py-5 border-b border-[#1E293B] flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">บันทึกล่าสุด</h3>
                <button onClick={() => setActiveMenu('record')} className="text-sm text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors">ดูทั้งหมด</button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B1121]/50 text-[#94A3B8] text-sm border-b border-[#1E293B]">
                    <th className="p-4 text-center font-medium tracking-wide">วันที่</th>
                    <th className="p-4 text-center font-medium tracking-wide">หมวดหมู่</th>
                    <th className="p-4 text-center font-medium tracking-wide">หมายเหตุ</th>
                    <th className="p-4 text-center font-medium tracking-wide">หลักฐาน</th>
                    <th className="p-4 text-center font-medium tracking-wide">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#1E293B]/30 transition-colors duration-200 group">
                      <td className="p-4 text-center text-[#94A3B8] text-sm group-hover:text-white transition-colors">{formatThaiDate(tx.transaction_date)}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-2 text-[#E2E8F0]">
                          <span className={`w-2 h-2 rounded-full ${tx.type === 'INCOME' ? 'bg-[#4ADE80]' : 'bg-[#FB7185]'}`}></span>
                          <span className="group-hover:text-white transition-colors">{tx.description}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center text-[#64748B] text-sm">{tx.note || '-'}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleViewImage(tx.image_url)} className={`group/btn relative inline-flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#060A13] border border-[#1E293B] overflow-hidden transition-all duration-300 mx-auto ${tx.image_url ? 'hover:border-[#3B82F6] cursor-pointer' : 'cursor-default opacity-50'}`}>
                          {tx.image_url ? (
                            <>
                              <img src={tx.image_url} alt="Evidence" className="w-full h-full object-cover group-hover/btn:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <ImageIcon size={16} className="text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-[#64748B]">
                              <ImageIcon size={16} />
                              <span className="text-[9px] mt-1 tracking-wider">Evide</span>
                            </div>
                          )}
                        </button>
                      </td>
                      <td className={`p-4 text-center font-bold tracking-wide ${tx.type === 'INCOME' ? 'text-[#4ADE80]' : 'text-[#FB7185]'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}฿{fmt(tx.amount)}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                     <tr><td colSpan="5" className="p-10 text-center text-[#64748B]">ยังไม่มีข้อมูลการทำรายการ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= หน้าบันทึกการเงิน ================= */}
        {activeMenu === 'record' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
             <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">บันทึกการเงิน</h2>
                <p className="text-[#94A3B8] text-sm">รายการรับและจ่ายคริสตจักร</p>
              </div>
              <button onClick={handleOpenAddTransaction} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-[0_4px_14px_0_rgb(59,130,246,0.39)] hover:-translate-y-1 active:scale-95">
                <Plus size={18} />
                <span>บันทึกรายการ</span>
              </button>
            </div>

            <div className="flex bg-[#0E1525] border border-[#1E293B] rounded-xl p-1.5 mb-6 max-w-2xl shadow-sm">
              <button onClick={() => setFilterType('ALL')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === 'ALL' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50'}`}>ทั้งหมด</button>
              <button onClick={() => setFilterType('INCOME')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === 'INCOME' ? 'bg-[#1E293B] text-white shadow-md' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50'}`}>รายรับ</button>
              <button onClick={() => setFilterType('EXPENSE')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === 'EXPENSE' ? 'bg-[#1E293B] text-white shadow-md' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50'}`}>รายจ่าย</button>
            </div>

            <div className="bg-[#0E1525] border border-[#1E293B] rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#0B1121]/50 border-b border-[#1E293B] text-[#94A3B8] text-sm">
                      <th className="p-5 font-medium tracking-wide">วันที่</th>
                      <th className="p-5 font-medium tracking-wide">หมวดหมู่</th>
                      <th className="p-5 font-medium text-center tracking-wide">ประเภท</th>
                      <th className="p-5 font-medium text-center tracking-wide">หลักฐาน</th>
                      <th className="p-5 font-medium text-right tracking-wide">จำนวนเงิน</th>
                      <th className="p-5 font-medium text-center tracking-wide">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-[#1E293B]/30 transition-colors duration-200 group">
                        <td className="p-5 text-[#94A3B8] text-sm group-hover:text-white transition-colors">{formatThaiDate(t.transaction_date)}</td>
                        <td className="p-5 text-[#E2E8F0]">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${t.type === 'INCOME' ? 'bg-[#4ADE80]' : 'bg-[#FB7185]'}`}></span>
                            <span className="group-hover:text-white transition-colors">{t.description}</span>
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-[#4ADE80] border-emerald-500/20' : 'bg-rose-500/10 text-[#FB7185] border-rose-500/20'}`}>
                            {t.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <button onClick={() => handleViewImage(t.image_url)} className={`group/btn relative inline-flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#060A13] border border-[#1E293B] overflow-hidden transition-all duration-300 mx-auto ${t.image_url ? 'hover:border-[#3B82F6] cursor-pointer' : 'cursor-default opacity-50'}`}>
                            {t.image_url ? (
                              <>
                                <img src={t.image_url} alt="Evidence" className="w-full h-full object-cover group-hover/btn:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                  <ImageIcon size={16} className="text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-[#64748B]">
                                <ImageIcon size={16} />
                                <span className="text-[9px] mt-1 tracking-wider">Evide</span>
                              </div>
                            )}
                          </button>
                        </td>
                        <td className={`p-5 text-right font-bold tracking-wide ${t.type === 'INCOME' ? 'text-[#4ADE80]' : 'text-[#FB7185]'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}฿{fmt(t.amount)}
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                            <button onClick={() => handleOpenEditTransaction(t)} className="w-8 h-8 rounded-lg bg-[#1E293B]/50 hover:bg-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:text-[#3B82F6] transition-all"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteTransaction(t.id)} className="w-8 h-8 rounded-lg bg-[#1E293B]/50 hover:bg-rose-500/20 flex items-center justify-center text-[#94A3B8] hover:text-rose-400 transition-all"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr><td colSpan="6" className="p-10 text-center text-[#64748B]">ไม่พบรายการในหมวดหมู่นี้</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= หน้าประเภทรายการ ================= */}
        {activeMenu === 'categories' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">หมวดหมู่</h2>
                <p className="text-[#94A3B8] text-sm">จัดการหมวดหมู่รายรับรายจ่าย</p>
              </div>
              <button onClick={handleOpenAddCategory} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-1 active:scale-95">
                <Plus size={18} />
                <span>เพิ่มหมวดหมู่</span>
              </button>
            </div>
            <div className="flex bg-[#0E1525] border border-[#1E293B] rounded-xl overflow-hidden mb-6 shadow-sm">
              <button onClick={() => setCategoryTab('EXPENSE')} className={`flex-1 py-3 text-sm font-bold transition-all duration-300 ${categoryTab === 'EXPENSE' ? 'bg-[#FB7185] text-white shadow-md' : 'text-[#94A3B8] hover:bg-[#1E293B]/50 hover:text-white'}`}>รายจ่าย ({expenseCategories.length})</button>
              <button onClick={() => setCategoryTab('INCOME')} className={`flex-1 py-3 text-sm font-bold transition-all duration-300 ${categoryTab === 'INCOME' ? 'bg-[#10B981] text-white shadow-md' : 'text-[#94A3B8] hover:bg-[#1E293B]/50 hover:text-white'}`}>รายรับ ({incomeCategories.length})</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentCategories.map(c => {
                const usageCount = transactions.filter(t => t.description === c.name).length;
                return (
                  <div key={c.id} className="bg-[#0E1525] border border-[#1E293B] p-4 rounded-xl flex justify-between items-center group hover:border-[#334155] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg cursor-default">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#060A13] border border-[#1E293B]">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: c.color, boxShadow: `0 0 12px ${c.color}`}}></div>
                      </div>
                      <div>
                        <div className="text-white font-bold tracking-wide">{c.name}</div>
                        <div className="text-[#64748B] text-xs mt-0.5">{usageCount} รายการ</div>
                      </div>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => handleOpenEditCategory(c)} className="p-2.5 bg-[#1E293B]/50 rounded-lg text-[#94A3B8] hover:bg-[#1E293B] hover:text-white transition-all shadow-sm"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteCategory(c.id)} className="p-2.5 bg-[#1E293B]/50 rounded-lg text-[#94A3B8] hover:bg-rose-500/20 hover:text-rose-400 transition-all shadow-sm"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
              {currentCategories.length === 0 && (
                <div className="col-span-full p-10 text-center text-[#64748B] bg-[#0E1525] rounded-xl border border-[#1E293B]">ยังไม่มีหมวดหมู่ในระบบ</div>
              )}
            </div>
          </div>
        )}

        {/* ================= หน้ารายงานการเงิน (หน้าใหม่ล่าสุด!) ================= */}
        {activeMenu === 'reports' && (
          <div className="max-w-7xl mx-auto animate-fade-in">
            {/* Header หน้ารายงาน (พร้อมปุ่มเลือกปี) */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">รายงานการเงิน</h1>
                <p className="text-[#94A3B8] text-sm">สรุปการเงินคริสตจักร ประจำปี {selectedYear}</p>
              </div>
              <div className="flex items-center bg-[#0E1525] border border-[#1E293B] rounded-xl overflow-hidden shadow-lg p-1">
                <button 
                  onClick={() => setSelectedYear(y => y - 1)}
                  className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="px-6 font-bold text-white tracking-widest text-lg">{selectedYear}</div>
                <button 
                  onClick={() => setSelectedYear(y => y + 1)}
                  className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            {/* การ์ดสรุปยอดรายปี 4 ใบ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-[#334155] shadow-lg group">
                <div>
                  <div className="text-[#94A3B8] text-sm font-medium mb-1">รายรับรวม</div>
                  <div className="text-3xl font-bold text-[#4ADE80] tracking-tight">฿{fmt(reportYearlyIncome)}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-[#4ADE80]" />
                </div>
              </div>
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-[#334155] shadow-lg group">
                <div>
                  <div className="text-[#94A3B8] text-sm font-medium mb-1">รายจ่ายรวม</div>
                  <div className="text-3xl font-bold text-[#FB7185] tracking-tight">฿{fmt(reportYearlyExpense)}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <TrendingDown size={20} className="text-[#FB7185]" />
                </div>
              </div>
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-[#334155] shadow-lg group">
                <div>
                  <div className="text-[#94A3B8] text-sm font-medium mb-1">คงเหลือสุทธิ</div>
                  <div className={`text-3xl font-bold tracking-tight ${reportYearlyBalance >= 0 ? 'text-[#4ADE80]' : 'text-[#FB7185]'}`}>
                    ฿{fmt(reportYearlyBalance)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Wallet size={20} className="text-[#A78BFA]" />
                </div>
              </div>
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-[#334155] shadow-lg group">
                <div>
                  <div className="text-[#94A3B8] text-sm font-medium mb-1">อัตราออม</div>
                  <div className={`text-3xl font-bold tracking-tight ${reportSavingsRate >= 0 ? 'text-[#4ADE80]' : 'text-[#FB7185]'}`}>
                    {reportSavingsRate > 0 ? '+' : ''}{reportSavingsRate}%
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center border border-[#1E293B]">
                  <Activity size={20} className="text-[#94A3B8]" />
                </div>
              </div>
            </div>

            {/* กราฟรายงานรายปี (Area Chart & Bar Chart แบบรูปอ้างอิง) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              
              {/* กราฟแนวโน้มรายรับรายจ่าย (Area Chart) */}
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl shadow-lg flex flex-col h-[400px] transition-all duration-300 hover:-translate-y-1 hover:border-[#334155]">
                <div className="flex items-center space-x-2 mb-6">
                  <h3 className="text-lg font-bold text-white">แนวโน้มรายรับรายจ่าย</h3>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportMonthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FB7185" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? (val/1000)+'k' : val} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0B1121', borderColor: '#1E293B', borderRadius: '8px', color: '#fff' }} cursor={{stroke: '#1E293B', strokeWidth: 2, strokeDasharray: '4 4'}} />
                      <Area type="monotone" dataKey="income" name="รายรับ" stroke="#4ADE80" strokeWidth={3} fillOpacity={1} fill="url(#colorIncArea)" />
                      <Area type="monotone" dataKey="expense" name="รายจ่าย" stroke="#FB7185" strokeWidth={3} fillOpacity={1} fill="url(#colorExpArea)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* กราฟยอดคงเหลือรายเดือน (Bar Chart ยอดสุทธิ) */}
              <div className="bg-[#0E1525] border border-[#1E293B] p-6 rounded-2xl shadow-lg flex flex-col h-[400px] transition-all duration-300 hover:-translate-y-1 hover:border-[#334155]">
                <div className="flex items-center space-x-2 mb-6">
                  <h3 className="text-lg font-bold text-white">ยอดคงเหลือรายเดือน</h3>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportMonthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? (val/1000)+'k' : (val <= -1000 ? (val/1000)+'k' : val)} />
                      <RechartsTooltip cursor={{fill: '#1E293B', opacity: 0.4}} contentStyle={{ backgroundColor: '#0B1121', borderColor: '#1E293B', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="balance" name="คงเหลือ" radius={[4, 4, 4, 4]} maxBarSize={30}>
                        {reportMonthlyStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.balance >= 0 ? '#3B82F6' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ส่วนกล่องสรุปย่อย 12 เดือน (Grid Cards) */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white tracking-wide">สรุปรายเดือน (มกราคม - ธันวาคม)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
              {reportMonthlyStats.map((month, index) => {
                // เช็กว่าเป็นเดือนปัจจุบันหรือไม่ (เพื่อให้กรอบเรืองแสงตามรูปเรฟเฟอเรนซ์)
                const isCurrentMonth = (index + 1) === currentMonthNum && selectedYear === currentYearNum;
                
                return (
                  <div key={index} className={`bg-[#060A13] border p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#3B82F6]/50 ${isCurrentMonth ? 'border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-[#1E293B]'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-white font-bold text-lg">{month.name}</h4>
                      {/* แคปซูลสถานะคงเหลือ */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${month.balance >= 0 ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#FB7185]/10 text-[#FB7185]'}`}>
                        {month.balance >= 0 ? 'คงเหลือ' : 'ติดลบ'} {month.balance >= 0 ? '+' : ''}฿{fmt(month.balance)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
                        <span className="text-[#94A3B8] text-sm font-medium">รายรับ</span>
                        <span className="text-[#4ADE80] font-bold text-sm tracking-wide">+{fmt(month.income)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#94A3B8] text-sm font-medium">รายจ่าย</span>
                        <span className="text-[#FB7185] font-bold text-sm tracking-wide">-{fmt(month.expense)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        )}

      </main>

      {/* ป๊อปอัปฟอร์ม "เพิ่ม/แก้ไข หมวดหมู่" */}
      {isCategoryFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0E1525] border border-[#1E293B] rounded-2xl shadow-2xl w-full max-w-[450px] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[#1E293B]">
              <h3 className="text-xl font-bold text-white tracking-wide">
                {categoryFormData.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
              </h3>
              <button onClick={() => setIsCategoryFormOpen(false)} className="text-[#94A3B8] hover:text-white bg-[#1E293B]/50 hover:bg-[#1E293B] p-2 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2 font-medium">ชื่อหมวดหมู่</label>
                <input type="text" value={categoryFormData.name} onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})} required placeholder="เช่น อาหาร, เงินเดือน" className="w-full p-3.5 bg-[#060A13] border border-[#1E293B] rounded-xl text-white placeholder:text-[#475569] focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2 font-medium">ประเภท</label>
                <div className="flex bg-[#060A13] border border-[#1E293B] rounded-xl p-1.5">
                  <button type="button" onClick={() => setCategoryFormData({...categoryFormData, type: 'INCOME'})} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${categoryFormData.type === 'INCOME' ? 'bg-[#10B981] text-white shadow-md' : 'text-[#64748B] hover:text-white'}`}>รายรับ</button>
                  <button type="button" onClick={() => setCategoryFormData({...categoryFormData, type: 'EXPENSE'})} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${categoryFormData.type === 'EXPENSE' ? 'bg-[#EF4444] text-white shadow-md' : 'text-[#64748B] hover:text-white'}`}>รายจ่าย</button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-3 font-medium">สี</label>
                <div className="flex flex-wrap gap-3">
                  {CATEGORY_COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setCategoryFormData({...categoryFormData, color: color})} className={`w-9 h-9 rounded-lg transition-all duration-200 ${categoryFormData.color === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#0E1525]' : 'hover:scale-110'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98]">
                  {categoryFormData.id ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ป๊อปอัปฟอร์ม "เพิ่ม/แก้ไข รายการการเงิน" */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0E1525] border border-[#1E293B] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden flex flex-col max-h-full transform transition-all">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-[#1E293B] shrink-0 bg-[#0E1525] z-10">
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  {editingId ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
                </h3>
                <p className="text-sm text-[#64748B] mt-1">กรอกข้อมูลธุรกรรมของคุณ</p>
              </div>
              <button onClick={() => { setIsFormOpen(false); setImagePreview(null); setEditingId(null); }} className="text-[#94A3B8] hover:text-white bg-[#1E293B]/50 hover:bg-[#1E293B] p-2 rounded-full transition-all hover:rotate-90">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex bg-[#060A13] rounded-xl p-1 border border-[#1E293B] shadow-inner">
                <button type="button" onClick={() => handleTypeChange('INCOME')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-300 ${formData.type === 'INCOME' ? 'bg-[#1E293B] text-white shadow-sm' : 'text-[#64748B] hover:text-[#94A3B8]'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${formData.type === 'INCOME' ? 'bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]' : 'bg-[#475569]'}`}></div>
                  <span>รายรับ</span>
                </button>
                <button type="button" onClick={() => handleTypeChange('EXPENSE')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-300 ${formData.type === 'EXPENSE' ? 'bg-[#7F1D1D]/40 text-white border border-[#EF4444]/20 shadow-sm' : 'text-[#64748B] hover:text-[#94A3B8]'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${formData.type === 'EXPENSE' ? 'bg-[#FB7185] shadow-[0_0_8px_#FB7185]' : 'bg-[#475569]'}`}></div>
                  <span>รายจ่าย</span>
                </button>
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2 font-medium">จำนวนเงิน (บาท)</label>
                <div className="relative">
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0" step="0.25" placeholder="0.00" className="w-full py-5 text-4xl font-black text-center text-white bg-[#060A13] border border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all placeholder:text-[#1E293B]" />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#475569] font-bold text-lg">THB</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2 font-medium">หมวดหมู่</label>
                <select name="description" value={formData.description} onChange={handleChange} required className="w-full p-3.5 bg-[#060A13] border border-[#1E293B] rounded-xl text-white focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none transition-all appearance-none cursor-pointer">
                  <option value="" disabled>เลือกหมวดหมู่...</option>
                  {categories.filter(c => c.type === formData.type).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2 font-medium">วันที่</label>
                <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} required className="w-full p-3.5 bg-[#060A13] border border-[#1E293B] rounded-xl text-white focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2 font-medium">หมายเหตุ</label>
                <input type="text" name="note" value={formData.note} onChange={handleChange} placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" className="w-full p-3.5 bg-[#060A13] border border-[#1E293B] rounded-xl text-white placeholder:text-[#475569] focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2 font-medium">รูปภาพหลักฐาน</label>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                {imagePreview ? (
                   <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-[#1E293B] group">
                     <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                       <button type="button" onClick={handleRemoveImage} className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg">
                         <Trash2 size={16} /><span>ลบรูปภาพ</span>
                       </button>
                     </div>
                   </div>
                ) : (
                  <div onClick={() => fileInputRef.current.click()} className="w-full p-8 bg-[#060A13] border-2 border-[#1E293B] border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/5 transition-all duration-300 group">
                    <Upload size={24} className="text-[#475569] mb-3 group-hover:text-[#8B5CF6] transition-colors duration-300 group-hover:-translate-y-1" />
                    <span className="text-sm font-medium text-[#64748B] group-hover:text-[#8B5CF6] transition-colors">คลิกเพื่ออัปโหลดรูปภาพ</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 pt-4 border-t border-[#1E293B] shrink-0 bg-[#0E1525] z-10">
              <button onClick={handleSubmit} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-[0.98]">
                {editingId ? 'บันทึกการแก้ไข' : 'ยืนยันรายการ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ป๊อปอัปดูรูปภาพหลักฐาน */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative flex flex-col items-center justify-center max-w-5xl w-full h-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsImageModalOpen(false)} className="absolute top-4 right-4 md:top-8 md:right-8 z-10 flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-rose-500/80 text-white rounded-full backdrop-blur-md transition-all duration-300 shadow-xl">
              <X size={24} />
            </button>
            <img src={viewImageUrl} alt="Evidence Full View" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#1E293B]" />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;