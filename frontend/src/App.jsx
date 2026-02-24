import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, ArrowLeftRight, Tags, PieChart as PieChartIcon, 
  Sun, Moon, LogOut, X, Trash2, Upload 
} from 'lucide-react';

import Overview from './pages/Overview';
import Record from './pages/Record';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Login from './pages/Login';

const CATEGORY_COLORS = ['#EF4444', '#F87171', '#F97316', '#EAB308', '#84CC16', '#10B981', '#059669', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#64748B'];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark' || true);
  const [transactions, setTransactions] = useState([]);
  
  // สีหมวดหมู่เริ่มต้นอิงตามรูปตัวอย่าง
  const [categories, setCategories] = useState([
    { id: 1, name: 'ถุงถวาย', type: 'INCOME', color: '#10B981' },
    { id: 2, name: 'เงินสนับสนุน', type: 'INCOME', color: '#3B82F6' },
    { id: 3, name: 'ค่าไฟ', type: 'EXPENSE', color: '#8B5CF6' }, // สีม่วง
    { id: 4, name: 'ค่าซ่อมบำรุง', type: 'EXPENSE', color: '#F43F5E' }, // สีแดงอมชมพู
  ]);

  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('overview'); 
  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [formData, setFormData] = useState({ transaction_date: new Date().toISOString().split('T')[0], type: 'EXPENSE', description: '', amount: '', note: '' });
  const [categoryFormData, setCategoryFormData] = useState({ id: null, name: '', type: 'EXPENSE', color: CATEGORY_COLORS[11] });
  const [imagePreview, setImagePreview] = useState(null); 
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const fetchTransactions = () => {
    setLoading(true);
    fetch('http://localhost/church_accounting/church_api/get_transactions.php')
      .then(res => res.json()).then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleOpenAddTransaction = () => {
    setEditingId(null); setFormData({ transaction_date: new Date().toISOString().split('T')[0], type: 'EXPENSE', description: '', amount: '', note: '' });
    setImagePreview(null); setIsFormOpen(true);
  };

  const handleOpenEditTransaction = (tx) => {
    setEditingId(tx.id); setFormData({ transaction_date: tx.transaction_date, type: tx.type, description: tx.description, amount: tx.amount, note: tx.note || '' });
    setImagePreview(tx.image_url || null); setIsFormOpen(true);
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm("ยืนยันการลบรายการนี้?")) {
      fetch('http://localhost/church_accounting/church_api/delete_transaction.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      .then(res => res.json()).then(data => { if(data.status === 'success') fetchTransactions(); })
      .catch(() => alert("เกิดข้อผิดพลาด"));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image(); img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800; let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setImagePreview(canvas.toDataURL('image/jpeg', 0.7)); 
      };
    };
  };

  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    const url = editingId ? 'http://localhost/church_accounting/church_api/update_transaction.php' : 'http://localhost/church_accounting/church_api/add_transaction.php';
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, id: editingId, image_url: imagePreview }) })
    .then(res => res.json()).then(data => { if(data.status === 'success') { fetchTransactions(); setIsFormOpen(false); } })
    .catch(() => alert("บันทึกไม่สำเร็จ"));
  };

  const handleOpenAddCategory = () => { setCategoryFormData({ id: null, name: '', type: 'EXPENSE', color: CATEGORY_COLORS[11] }); setIsCategoryFormOpen(true); };
  const handleOpenEditCategory = (cat) => { setCategoryFormData(cat); setIsCategoryFormOpen(true); };
  const handleDeleteCategory = (id) => { if (window.confirm('ลบหมวดหมู่นี้?')) setCategories(categories.filter(c => c.id !== id)); };
  
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (categoryFormData.id) setCategories(categories.map(c => c.id === categoryFormData.id ? categoryFormData : c));
    else setCategories([...categories, { ...categoryFormData, id: Date.now() }]);
    setIsCategoryFormOpen(false);
  };

  const fmt = (n) => Number(n || 0).toLocaleString('th-TH');
  const formatThaiDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  if (loading) return <div className="h-screen bg-slate-50 dark:bg-[#060A13] flex items-center justify-center font-black text-slate-400 animate-pulse text-2xl tracking-[0.5em]">WORSHIP</div>;
  if (!isLoggedIn) return <Login onLogin={() => { sessionStorage.setItem('isLoggedIn', 'true'); setIsLoggedIn(true); }} />;

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#060A13] text-slate-800 dark:text-white font-sans flex overflow-hidden relative transition-colors duration-500">
      
      {/* Background & Aura Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-600/20 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[120px] pointer-events-none"></div>

      {/* Sidebar ล็อกติดหน้าจอ */}
      <aside className="w-64 h-full border-r border-slate-200 dark:border-[#1E293B] bg-white/80 dark:bg-[#080D1A]/80 backdrop-blur-xl flex flex-col justify-between hidden md:flex shrink-0 z-20">
        <div>
          <div className="p-8 border-b border-slate-100 dark:border-[#1E293B] flex flex-col items-center">
            <div className="w-24 h-24 mb-4 rounded-full border-4 border-white dark:border-[#1E293B] overflow-hidden shadow-2xl">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-center text-sm font-black uppercase leading-tight tracking-tighter">The House of <br /><span className="text-blue-600 dark:text-[#3B82F6]">worship</span></h1>
          </div>
          <div className="p-4 space-y-1">
            <button onClick={() => setActiveMenu('overview')} className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all ${activeMenu === 'overview' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1E293B]'}`}><LayoutDashboard size={20} /><span>ภาพรวม</span></button>
            <button onClick={() => setActiveMenu('record')} className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all ${activeMenu === 'record' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1E293B]'}`}><ArrowLeftRight size={20} /><span>บันทึกการเงิน</span></button>
            <button onClick={() => setActiveMenu('categories')} className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all ${activeMenu === 'categories' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1E293B]'}`}><Tags size={20} /><span>ประเภทรายการ</span></button>
            <button onClick={() => setActiveMenu('reports')} className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all ${activeMenu === 'reports' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1E293B]'}`}><PieChartIcon size={20} /><span>รายงานการเงิน</span></button>
          </div>
        </div>
        <div className="p-4 space-y-2 border-t border-slate-100 dark:border-[#1E293B]">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1E293B] text-slate-500 font-bold text-sm">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}<span>{isDarkMode ? 'Light' : 'Dark'}</span></button>
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-500 font-bold transition-all"><LogOut size={18} /><span>ออกจากระบบ</span></button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-8 relative z-10 custom-scrollbar">
        {activeMenu === 'overview' && <Overview transactions={transactions} categories={categories} formatThaiDate={formatThaiDate} fmt={fmt} handleViewImage={(url) => {setViewImageUrl(url); setIsImageModalOpen(true);}} setActiveMenu={setActiveMenu} />}
        {activeMenu === 'record' && <Record transactions={transactions} formatThaiDate={formatThaiDate} fmt={fmt} handleViewImage={(url) => {setViewImageUrl(url); setIsImageModalOpen(true);}} handleOpenAddTransaction={handleOpenAddTransaction} handleOpenEditTransaction={handleOpenEditTransaction} handleDeleteTransaction={handleDeleteTransaction} />}
        {activeMenu === 'categories' && <Categories categories={categories} transactions={transactions} handleOpenAddCategory={handleOpenAddCategory} handleOpenEditCategory={handleOpenEditCategory} handleDeleteCategory={handleDeleteCategory} />}
        {activeMenu === 'reports' && <Reports transactions={transactions} categories={categories} fmt={fmt} formatThaiDate={formatThaiDate} />}
      </main>

      {/* 1. Modal บันทึกรายการ (กู้คืนช่องหมายเหตุและอัปโหลดรูป) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060A13]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1120] border border-[#1E293B] rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-8 border-b border-[#1E293B] shrink-0">
              <h3 className="text-2xl font-black text-white">{editingId ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2.5 bg-[#1E293B] text-[#94A3B8] rounded-full hover:text-white hover:rotate-90 transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitTransaction} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="flex bg-[#0F172A] border border-[#1E293B] rounded-2xl p-1">
                <button type="button" onClick={() => setFormData({...formData, type: 'INCOME', description: ''})} className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${formData.type === 'INCOME' ? 'bg-[#10B981] text-white shadow-md' : 'text-[#64748B]'}`}>รายรับ</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'EXPENSE', description: ''})} className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${formData.type === 'EXPENSE' ? 'bg-[#F43F5E] text-white shadow-md' : 'text-[#64748B]'}`}>รายจ่าย</button>
              </div>
              
              <div>
                <label className="block text-xs font-black text-[#64748B] mb-2 uppercase tracking-[0.1em] ml-1">จำนวนเงิน (บาท)</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required className="w-full py-5 text-4xl font-black text-center bg-[#060A13] border border-[#1E293B] rounded-[20px] outline-none text-white focus:border-blue-500 transition-colors" placeholder="0.00" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#64748B] mb-2 uppercase tracking-[0.1em] ml-1">หมวดหมู่</label>
                  <select value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required className="w-full p-4 bg-[#0F172A] border border-[#1E293B] rounded-[20px] outline-none text-white">
                    <option value="">เลือก...</option>
                    {categories.filter(c => c.type === formData.type).map(c => (<option key={c.id} value={c.name}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-[#64748B] mb-2 uppercase tracking-[0.1em] ml-1">วันที่</label>
                  <input type="date" value={formData.transaction_date} onChange={(e) => setFormData({...formData, transaction_date: e.target.value})} required className="w-full p-4 bg-[#0F172A] border border-[#1E293B] rounded-[20px] outline-none text-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#64748B] mb-2 uppercase tracking-[0.1em] ml-1">หมายเหตุ</label>
                <input type="text" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} placeholder="ระบุรายละเอียดเพิ่มเติม..." className="w-full p-4 bg-[#0F172A] border border-[#1E293B] rounded-[20px] outline-none text-white focus:border-blue-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-black text-[#64748B] mb-3 uppercase tracking-[0.1em] ml-1">หลักฐานการทำรายการ</label>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-[20px] overflow-hidden border-2 border-[#1E293B] group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <button type="button" onClick={() => setImagePreview(null)} className="p-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg flex items-center space-x-2 hover:bg-rose-600 transition-colors"><Trash2 size={16} /><span>ลบรูปภาพ</span></button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current.click()} className="w-full py-10 bg-[#060A13] border-2 border-[#1E293B] border-dashed rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all group">
                    <Upload size={32} className="text-[#334155] mb-3 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs font-black text-[#64748B] uppercase tracking-widest group-hover:text-blue-500">คลิกเพื่ออัปโหลดสลิป</span>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-[20px] font-black text-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                บันทึกข้อมูล
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal จัดการหมวดหมู่ (ดีไซน์สี่เหลี่ยมขอบมน + สีกรมท่า) */}
      {isCategoryFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#060A13]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1120] border border-[#1E293B] rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-center p-8 border-b border-[#1E293B] bg-[#0F172A]/50">
              <h3 className="text-2xl font-black text-white tracking-tight">{categoryFormData.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h3>
              <button onClick={() => setIsCategoryFormOpen(false)} className="p-2.5 bg-[#1E293B] text-[#94A3B8] rounded-full hover:text-white hover:bg-[#334155] transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="p-8 space-y-8">
              
              <div>
                <label className="block text-xs font-black text-[#64748B] mb-3 uppercase tracking-[0.1em] ml-1">ชื่อหมวดหมู่</label>
                <input 
                  type="text" 
                  value={categoryFormData.name} 
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})} 
                  placeholder="เช่น อาหาร, ถุงถวาย"
                  required 
                  className="w-full p-4 bg-[#060A13] border border-[#1E293B] rounded-[20px] text-white font-bold outline-none focus:border-blue-500 transition-colors" 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#64748B] mb-3 uppercase tracking-[0.1em] ml-1">ประเภท</label>
                <div className="flex bg-[#0F172A] border border-[#1E293B] rounded-2xl p-1">
                  <button type="button" onClick={() => setCategoryFormData({...categoryFormData, type: 'INCOME'})} className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${categoryFormData.type === 'INCOME' ? 'bg-[#10B981] text-white shadow-md' : 'text-[#64748B] hover:text-white'}`}>รายรับ</button>
                  <button type="button" onClick={() => setCategoryFormData({...categoryFormData, type: 'EXPENSE'})} className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${categoryFormData.type === 'EXPENSE' ? 'bg-[#F43F5E] text-white shadow-md' : 'text-[#64748B] hover:text-white'}`}>รายจ่าย</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#64748B] mb-4 uppercase tracking-[0.1em] ml-1 text-center">เลือกสีประจำหมวดหมู่</label>
                <div className="flex flex-wrap gap-3.5 justify-center">
                  {CATEGORY_COLORS.map(color => (
                    <button 
                      key={color} 
                      type="button" 
                      onClick={() => setCategoryFormData({...categoryFormData, color: color})} 
                      // เปลี่ยนปุ่มสีเป็นแบบสี่เหลี่ยมขอบมน (rounded-xl) ตามดีไซน์ที่คุณชอบ
                      className={`w-10 h-10 rounded-xl transition-all duration-300 ${categoryFormData.color === color ? 'ring-[4px] ring-white scale-125 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'hover:scale-110 opacity-70 hover:opacity-100'}`} 
                      style={{ backgroundColor: color }} 
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full mt-2 py-5 bg-gradient-to-r from-[#60A5FA] to-[#A855F7] text-white rounded-[20px] font-black text-lg shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                {categoryFormData.id ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 3. Modal ดูรูปภาพ */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#060A13]/95 backdrop-blur-2xl animate-fade-in" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative flex flex-col items-center max-w-5xl w-full h-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsImageModalOpen(false)} className="absolute top-4 right-4 z-10 w-16 h-16 bg-[#1E293B] hover:bg-rose-500 text-white rounded-full flex items-center justify-center transition-all"><X size={32} /></button>
            <img src={viewImageUrl} alt="Full View" className="max-w-full max-h-[85vh] object-contain rounded-[32px] shadow-2xl border border-[#1E293B]" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;