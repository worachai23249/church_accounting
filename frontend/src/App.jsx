import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, ArrowLeftRight, Tags, PieChart as PieChartIcon,
  Sun, Moon, LogOut, X, Trash2, Upload, Lock, AlertTriangle, CheckCircle, Menu, Bell
} from 'lucide-react';

import Overview from './pages/Overview';
import Record from './pages/Record';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Login from './pages/Login';

const CATEGORY_COLORS = ['#EF4444', '#F87171', '#F97316', '#EAB308', '#84CC16', '#10B981', '#059669', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#64748B'];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true');
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [transactions, setTransactions] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: '', title: '', message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  const showSuccess = (title, message) => {
    setSuccessModal({ isOpen: true, title, message });
    setTimeout(() => {
      setSuccessModal(prev => ({ ...prev, isOpen: false }));
    }, 2500);
  };

  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        alert('เบราว์เซอร์หรืออุปกรณ์ของคุณไม่รองรับการแจ้งเตือนแบบ Push');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        alert('✅ อนุญาตการเข้าถึงการแจ้งเตือนแล้ว!\n(ในการแจ้งเตือนแบบ Real-time หลังจากนี้ จะต้องเชื่อมต่อระบบหลังบ้านเข้ากับ Firebase Messaging เพิ่มเติมครับ)');
      } else {
        alert('❌ คุณได้ปฏิเสธการแจ้งเตือน (สามารถไปเปิดได้ในการตั้งค่าเบราว์เซอร์)');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการขอสิทธิ์');
    }
  };

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(() => sessionStorage.getItem('activeMenu') || 'overview');

  useEffect(() => {
    sessionStorage.setItem('activeMenu', activeMenu);
  }, [activeMenu]);

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

  const fetchTransactions = (showLoading = false) => {
    if (showLoading) setLoading(true);
    fetch('/church_api/get_transactions.php')
      .then(res => res.json()).then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([])).finally(() => { if (showLoading) setLoading(false); });
  };

  const fetchCategories = () => {
    fetch('/church_api/get_categories.php')
      .then(res => res.json()).then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  };

  useEffect(() => { fetchTransactions(true); fetchCategories(); }, []);

  const handleOpenAddTransaction = () => {
    setEditingId(null); setFormData({ transaction_date: new Date().toISOString().split('T')[0], type: 'EXPENSE', description: '', amount: '', note: '' });
    setImagePreview(null); setIsFormOpen(true);
  };

  const handleOpenEditTransaction = (tx) => {
    setEditingId(tx.id); setFormData({ transaction_date: tx.transaction_date, type: tx.type, description: tx.description, amount: tx.amount, note: tx.note || '' });
    setImagePreview(tx.image_url || null); setIsFormOpen(true);
  };

  const handleDeleteTransaction = (id) => {
    setDeleteModal({
      isOpen: true,
      id: id,
      type: 'TRANSACTION',
      title: 'ต้องการลบรายการนี้?',
      message: 'การลบรายการนี้จะไม่สามารถกู้คืนได้ กรุณายืนยันการดำเนินการ'
    });
  };

  const confirmDelete = () => {
    if (deleteModal.type === 'TRANSACTION') {
      fetch('/church_api/delete_transaction.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteModal.id }) })
        .then(res => res.json()).then(data => {
          if (data.status === 'success') {
            fetchTransactions();
            showSuccess('ลบสำเร็จ', 'ข้อมูลรายการถูกลบเรียบร้อยแล้ว');
          }
        })
        .catch(() => alert("เกิดข้อผิดพลาด"));
    } else if (deleteModal.type === 'CATEGORY') {
      fetch('/church_api/delete_category.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteModal.id }) })
        .then(res => res.json()).then(data => {
          if (data.status === 'success') {
            fetchCategories();
            showSuccess('ลบสำเร็จ', 'หมวดหมู่ถูกลบเรียบร้อยแล้ว');
          }
        })
        .catch(() => alert("เกิดข้อผิดพลาด"));
    }
    setDeleteModal({ ...deleteModal, isOpen: false });
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
    const url = editingId ? '/church_api/update_transaction.php' : '/church_api/add_transaction.php';
    const isEdit = !!editingId;
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, id: editingId, image_url: imagePreview }) })
      .then(res => res.json()).then(data => {
        if (data.status === 'success') {
          fetchTransactions();
          setIsFormOpen(false);
          showSuccess(isEdit ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ', isEdit ? 'ข้อมูลรายการถูกอัปเดตเรียบร้อยแล้ว' : 'สร้างรายการใหม่เรียบร้อยแล้ว');
        } else {
          alert("ไม่สามารถบันทึกได้: " + (data.message || JSON.stringify(data)));
        }
      })
      .catch((err) => {
        console.error(err);
        alert("เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่");
      });
  };

  const handleOpenAddCategory = () => { setCategoryFormData({ id: null, name: '', type: 'EXPENSE', color: CATEGORY_COLORS[11] }); setIsCategoryFormOpen(true); };
  const handleOpenEditCategory = (cat) => { setCategoryFormData(cat); setIsCategoryFormOpen(true); };
  const handleDeleteCategory = (id) => {
    setDeleteModal({
      isOpen: true,
      id: id,
      type: 'CATEGORY',
      title: 'ต้องการลบหมวดหมู่นี้?',
      message: 'การลบหมวดหมู่จะไม่สามารถกู้คืนได้ กรุณายืนยันการดำเนินการ'
    });
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    const isEdit = !!categoryFormData.id;
    const url = isEdit ? '/church_api/update_category.php' : '/church_api/add_category.php';

    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryFormData) })
      .then(res => res.json()).then(data => {
        if (data.status === 'success') {
          fetchCategories();
          setIsCategoryFormOpen(false);
          showSuccess(isEdit ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ', `หมวดหมู่ "${categoryFormData.name}" ${isEdit ? 'ถูกแก้ไขเรียบร้อยแล้ว' : 'ถูกสร้างเรียบร้อยแล้ว'}`);
        } else {
          alert(data.message);
        }
      })
      .catch(() => alert("บันทึกไม่สำเร็จ"));
  };

  const fmt = (n) => Number(n || 0).toLocaleString('th-TH');
  const formatThaiDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  if (loading) return (
    <div className="h-screen bg-slate-50 dark:bg-[#060A13] flex flex-col items-center justify-center">
      <div className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500 animate-pulse drop-shadow-sm flex flex-col items-center">
        <span className="text-sm md:text-lg leading-[1.6em] tracking-[0.2em] uppercase">The House of worship</span>
        <span className="text-md md:text-xl leading-[1.2em] tracking-[0.15em] mt-1 uppercase">and prayer</span>
      </div>
    </div>
  );
  if (!isLoggedIn && showLoginScreen) return <Login onLogin={() => { sessionStorage.setItem('isLoggedIn', 'true'); setIsLoggedIn(true); setShowLoginScreen(false); }} onBack={() => setShowLoginScreen(false)} />;

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#060A13] text-slate-800 dark:text-white font-sans flex overflow-hidden relative transition-colors duration-500">

      {/* Background & Aura Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-600/20 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[120px] pointer-events-none"></div>

      {/* Sidebar ล็อกติดหน้าจอ (Hi-Tech Version) & Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 dark:bg-black/40 backdrop-blur-sm z-[90] animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className={`w-72 h-full border-r border-slate-200/50 dark:border-white/5 bg-slate-50/95 dark:bg-[#030610]/95 backdrop-blur-2xl flex flex-col justify-between shrink-0 z-[100] shadow-[10px_0_30px_-10px_rgba(0,0,0,0.1)] fixed lg:relative transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} left-0`}>
        <div>
          <div className="p-8 border-b border-slate-200/50 dark:border-white/5 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/10 dark:from-blue-600/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="relative mb-6 transition-transform duration-700 z-10 flex justify-center items-center group-hover:-translate-y-2">
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-60 blur-[30px] group-hover:opacity-100 group-hover:blur-[40px] transition-all duration-1000 animate-pulse-glow"></div>
              <div className="w-36 h-36 relative z-10">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700" />
              </div>
            </div>

            <h1 className="text-center font-black uppercase relative z-10 w-full px-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500 drop-shadow-sm flex flex-col items-center group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-500">
              <span className="text-[10px] leading-[1.6em] tracking-[0.2em]">The House of worship</span>
              <span className="text-[14px] leading-[1.2em] tracking-[0.15em] mt-0.5">and prayer</span>
            </h1>
          </div>

          <div className="p-5 space-y-3">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'ภาพรวม' },
              ...(isLoggedIn ? [
                { id: 'record', icon: ArrowLeftRight, label: 'บันทึกการเงิน' },
                { id: 'categories', icon: Tags, label: 'ประเภทรายการ' }
              ] : []),
              { id: 'reports', icon: PieChartIcon, label: 'รายงานการเงิน' }
            ].map(menu => {
              const isActive = activeMenu === menu.id;
              const Icon = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => { setActiveMenu(menu.id); setIsMobileMenuOpen(false); }}
                  className={`group relative w-full flex items-center space-x-4 px-5 py-3.5 rounded-[18px] transition-all duration-500 overflow-hidden font-black tracking-[0.15em] text-[11px] uppercase ${isActive ? 'text-blue-600 dark:text-white border border-blue-500/40 dark:border-blue-500/30 shadow-[0_5px_20px_-5px_rgba(59,130,246,0.2)] bg-blue-50/80 dark:bg-blue-900/10' : 'text-slate-500 dark:text-[#64748B] hover:text-slate-800 dark:hover:text-white border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 hover:bg-slate-100/50 dark:hover:bg-white/[0.03]'}`}
                >
                  {/* Indicator Edge Rail */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3/4 bg-blue-500 dark:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)] rounded-r-full z-10 transition-all duration-500"></div>
                  )}

                  {/* Glass Background Slide */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"></div>
                  )}

                  {/* Icon Container Plate */}
                  <div className={`relative z-10 flex items-center justify-center p-2.5 rounded-[12px] transition-all duration-500 ${isActive ? 'bg-blue-100 dark:bg-blue-500/20 shadow-inner' : 'bg-transparent group-hover:bg-slate-200/60 dark:group-hover:bg-white/10'}`}>
                    <Icon size={18} className={`transition-all duration-500 ${isActive ? 'text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)] scale-110' : 'group-hover:scale-110 group-hover:rotate-[8deg] group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                  </div>

                  <span className={`relative z-10 translate-y-[1px] transition-colors duration-500 ${isActive ? 'text-blue-700 dark:text-white' : ''}`}>{menu.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-4 border-t border-slate-200/50 dark:border-white/5 bg-gradient-to-b from-transparent to-slate-100/50 dark:to-[#060A13]/80 backdrop-blur-md">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="group relative w-full flex items-center space-x-4 px-5 py-4 rounded-[18px] bg-slate-50/80 dark:bg-[#0A101D]/80 border border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400 font-black overflow-hidden transition-all duration-500 hover:border-blue-400/50 dark:hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:bg-white dark:hover:bg-[#0F172A]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-500/5 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex items-center justify-center p-2 rounded-[12px] bg-transparent group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 transition-all duration-500">
              <div className={`transition-transform duration-700 ${isDarkMode ? 'rotate-[360deg]' : 'rotate-0'}`}>
                {isDarkMode ? <Sun size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" /> : <Moon size={18} className="text-blue-600 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
              </div>
            </div>
            <span className="relative z-10 text-[10px] uppercase tracking-[0.2em] group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors translate-y-[1px]">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {isLoggedIn && (
            <button
              onClick={requestNotificationPermission}
              className="group relative w-full flex items-center space-x-4 px-5 py-4 rounded-[18px] bg-slate-50/80 dark:bg-[#0A101D]/80 border border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400 font-black overflow-hidden transition-all duration-500 hover:border-emerald-400/50 dark:hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] hover:bg-white dark:hover:bg-[#0F172A]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 to-emerald-500/5 dark:to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center justify-center p-2 rounded-[12px] bg-transparent group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/20 transition-all duration-500">
                <Bell size={18} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] group-hover:animate-bounce" />
              </div>
              <span className="relative z-10 text-[10px] uppercase tracking-[0.2em] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors translate-y-[1px]">เปิดการแจ้งเตือน</span>
            </button>
          )}

          {!isLoggedIn ? (
            <button
              onClick={() => { setShowLoginScreen(true); setIsMobileMenuOpen(false); }}
              className="group relative w-full flex items-center space-x-4 px-5 py-4 rounded-[18px] bg-slate-50/80 dark:bg-[#0A101D]/80 border border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400 font-black overflow-hidden transition-all duration-500 hover:border-blue-400/50 dark:hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:bg-white dark:hover:bg-[#0F172A]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-500/5 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center justify-center p-2 rounded-[12px] bg-transparent group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 transition-all duration-500">
                <Lock size={18} className="group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="relative z-10 text-[10px] uppercase tracking-[0.2em] group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors translate-y-[1px]">สำหรับเจ้าหน้าที่</span>
            </button>
          ) : (
            <button
              onClick={() => { sessionStorage.removeItem('isLoggedIn'); setIsLoggedIn(false); setActiveMenu('overview'); setIsMobileMenuOpen(false); }}
              className="group relative w-full flex items-center space-x-4 px-5 py-4 rounded-[18px] bg-slate-50/80 dark:bg-[#0A101D]/80 border border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400 font-black overflow-hidden transition-all duration-500 hover:border-rose-400/50 dark:hover:border-rose-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:bg-white dark:hover:bg-[#0F172A]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/0 to-rose-500/5 dark:to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center justify-center p-2 rounded-[12px] bg-transparent group-hover:bg-rose-50 dark:group-hover:bg-rose-500/20 transition-all duration-500">
                <LogOut size={18} className="group-hover:-translate-x-1 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="relative z-10 text-[10px] uppercase tracking-[0.2em] group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors translate-y-[1px]">ออกจากระบบ</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-50/90 dark:bg-[#030610]/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 z-[80] flex items-center px-4 shadow-sm">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-blue-500">
          <Menu size={24} />
        </button>
        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain ml-2 shrink-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
        <span className="ml-2 text-[11px] uppercase font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-500 whitespace-nowrap">The House of Worship and Prayer</span>
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8 pb-8 lg:pb-8 relative z-10 custom-scrollbar w-full">
        {activeMenu === 'overview' && <Overview transactions={transactions} categories={categories} formatThaiDate={formatThaiDate} fmt={fmt} handleViewImage={(url) => { setViewImageUrl(url); setIsImageModalOpen(true); }} setActiveMenu={setActiveMenu} isLoggedIn={isLoggedIn} />}
        {activeMenu === 'record' && <Record transactions={transactions} formatThaiDate={formatThaiDate} fmt={fmt} handleViewImage={(url) => { setViewImageUrl(url); setIsImageModalOpen(true); }} handleOpenAddTransaction={handleOpenAddTransaction} handleOpenEditTransaction={handleOpenEditTransaction} handleDeleteTransaction={handleDeleteTransaction} />}
        {activeMenu === 'categories' && <Categories categories={categories} transactions={transactions} handleOpenAddCategory={handleOpenAddCategory} handleOpenEditCategory={handleOpenEditCategory} handleDeleteCategory={handleDeleteCategory} />}
        {activeMenu === 'reports' && <Reports transactions={transactions} categories={categories} fmt={fmt} formatThaiDate={formatThaiDate} handleViewImage={(url) => { setViewImageUrl(url); setIsImageModalOpen(true); }} handleOpenEditTransaction={handleOpenEditTransaction} handleDeleteTransaction={handleDeleteTransaction} isLoggedIn={isLoggedIn} />}
      </main>

      {/* 1. Modal บันทึกรายการ */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-[#060A13]/80 backdrop-blur-xl animate-fade-in">
          <div className="glass-panel w-[92vw] sm:w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] rounded-[24px] md:rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.2)] animate-fade-in-up">
            <div className="flex justify-between items-center p-5 md:p-8 border-b border-slate-200/50 dark:border-white/10 shrink-0 bg-white/30 dark:bg-[#0F172A]/30">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">{editingId ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 md:p-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-transparent text-slate-500 dark:text-[#94A3B8] rounded-full hover:text-white hover:bg-slate-800 dark:hover:bg-[#334155] hover:rotate-90 transition-all shadow-sm"><X size={18} className="md:w-5 md:h-5" /></button>
            </div>
            <form onSubmit={handleSubmitTransaction} className="p-5 md:p-8 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar bg-white/40 dark:bg-transparent">
              <div className="flex bg-white/70 dark:bg-[#0F172A]/80 border border-slate-200/50 dark:border-[#1E293B] rounded-[16px] md:rounded-2xl p-1 md:p-1.5 shadow-inner">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'INCOME', description: '' })} className={`flex-1 py-3 md:py-3.5 rounded-xl md:rounded-xl text-xs md:text-sm font-black tracking-widest uppercase transition-all duration-300 ${formData.type === 'INCOME' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-500 dark:text-[#64748B] hover:text-emerald-500'}`}>รายรับ</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'EXPENSE', description: '' })} className={`flex-1 py-3 md:py-3.5 rounded-xl md:rounded-xl text-xs md:text-sm font-black tracking-widest uppercase transition-all duration-300 ${formData.type === 'EXPENSE' ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-slate-500 dark:text-[#64748B] hover:text-rose-500'}`}>รายจ่าย</button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-[#64748B] mb-2 uppercase tracking-[0.2em] ml-1">จำนวนเงิน (บาท)</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required className="w-full py-4 md:py-5 text-3xl md:text-4xl font-black text-center bg-white/60 dark:bg-[#060A13]/60 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-[16px] md:rounded-[20px] outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm font-sans" placeholder="0.00" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-[#64748B] mb-2 uppercase tracking-[0.2em] ml-1">หมวดหมู่</label>
                  <select value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="w-full p-3.5 md:p-4 bg-white/60 dark:bg-[#060A13]/60 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-[16px] md:rounded-[20px] outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm font-bold text-sm md:text-base">
                    <option value="">เลือก...</option>
                    {categories.filter(c => c.type === formData.type).map(c => (<option key={c.id} value={c.name}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-[#64748B] mb-2 uppercase tracking-[0.2em] ml-1">วันที่</label>
                  <input type="date" value={formData.transaction_date} onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })} required className="w-full p-3.5 md:p-4 bg-white/60 dark:bg-[#060A13]/60 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-[16px] md:rounded-[20px] outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm font-bold text-sm md:text-base [color-scheme:light_dark]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-[#64748B] mb-2 uppercase tracking-[0.2em] ml-1">หมายเหตุ</label>
                <input type="text" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="ระบุรายละเอียดเพิ่มเติม..." className="w-full p-3.5 md:p-4 bg-white/60 dark:bg-[#060A13]/60 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-[16px] md:rounded-[20px] outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm font-bold text-sm md:text-base" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-[#64748B] mb-3 uppercase tracking-[0.2em] ml-1">หลักฐานการทำรายการ</label>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-[20px] overflow-hidden border-2 border-slate-200/50 dark:border-[#1E293B] group shadow-sm">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                      <button type="button" onClick={() => setImagePreview(null)} className="p-3 bg-rose-500 text-white rounded-xl font-black tracking-wider uppercase text-xs shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center space-x-2 hover:bg-rose-600 transition-colors hover:scale-105 active:scale-95"><Trash2 size={16} /><span>ลบรูปภาพ</span></button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current.click()} className="w-full py-10 bg-white/40 dark:bg-[#060A13]/40 border-2 border-slate-300 dark:border-[#1E293B] border-dashed rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <Upload size={32} className="text-slate-400 dark:text-[#334155] mb-3 group-hover:text-blue-500 group-hover:animate-bounce transition-colors" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-[#64748B] uppercase tracking-[0.2em] group-hover:text-blue-500">คลิกเพื่ออัปโหลดสลิป</span>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-[20px] font-black tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:-translate-y-1 active:scale-95 transition-all duration-300">
                บันทึกข้อมูล
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal จัดการหมวดหมู่ */}
      {isCategoryFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-[#060A13]/80 backdrop-blur-xl animate-fade-in">
          <div className="glass-panel w-[92vw] sm:w-full max-w-md rounded-[24px] md:rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col animate-fade-in-up">

            <div className="flex justify-between items-center p-5 md:p-8 border-b border-slate-200/50 dark:border-[#1E293B] bg-white/30 dark:bg-[#0F172A]/30">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">{categoryFormData.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h3>
              <button onClick={() => setIsCategoryFormOpen(false)} className="p-2 md:p-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-transparent text-slate-500 dark:text-[#94A3B8] rounded-full hover:text-white hover:bg-slate-800 dark:hover:bg-[#334155] hover:rotate-90 transition-all shadow-sm"><X size={18} className="md:w-5 md:h-5" /></button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-5 md:p-8 space-y-6 md:space-y-8 bg-white/40 dark:bg-transparent">

              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-[#64748B] mb-3 uppercase tracking-[0.2em] ml-1">ชื่อหมวดหมู่</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="เช่น อาหาร, ถุงถวาย"
                  required
                  className="w-full p-3.5 md:p-4 bg-white/60 dark:bg-[#060A13]/60 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-[16px] md:rounded-[20px] text-slate-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors shadow-sm text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-[#64748B] mb-3 uppercase tracking-[0.2em] ml-1">ประเภท</label>
                <div className="flex bg-white/70 dark:bg-[#0F172A]/80 border border-slate-200/50 dark:border-[#1E293B] rounded-[16px] md:rounded-2xl p-1 md:p-1.5 shadow-inner">
                  <button type="button" onClick={() => setCategoryFormData({ ...categoryFormData, type: 'INCOME' })} className={`flex-1 py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 ${categoryFormData.type === 'INCOME' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-500 dark:text-[#64748B] hover:text-emerald-500'}`}>รายรับ</button>
                  <button type="button" onClick={() => setCategoryFormData({ ...categoryFormData, type: 'EXPENSE' })} className={`flex-1 py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 ${categoryFormData.type === 'EXPENSE' ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-slate-500 dark:text-[#64748B] hover:text-rose-500'}`}>รายจ่าย</button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-[#64748B] mb-4 uppercase tracking-[0.2em] ml-1 text-center">เลือกสีประจำหมวดหมู่</label>
                <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                  {CATEGORY_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCategoryFormData({ ...categoryFormData, color: color })}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-[12px] md:rounded-[16px] transition-all duration-300 relative group overflow-hidden ${categoryFormData.color === color ? 'scale-110 shadow-lg' : 'hover:scale-110 opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {categoryFormData.color === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 border-[3px] border-white/80 rounded-[12px]"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-5 bg-gradient-to-r from-[#60A5FA] to-[#A855F7] hover:from-[#3B82F6] hover:to-[#9333EA] text-white rounded-[20px] font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
              >
                {categoryFormData.id ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 4. Modal ยืนยันการลบ (แทน window.confirm) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#030610]/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-[92vw] sm:w-full max-w-md overflow-hidden flex flex-col rounded-[24px] md:rounded-[32px] bg-[#13151c] border border-white/5 shadow-[0_0_80px_rgba(255,42,95,0.15)] animate-fade-in-up">

            {/* Ambient Red Glow Behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#ff2a5f]/10 blur-[120px] pointer-events-none"></div>

            <div className="flex justify-end p-4 md:p-5 pb-0 relative z-10">
              <button onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })} className="w-8 h-8 md:w-10 md:h-10 bg-[#1e202b] border border-[#2a2d3c] text-slate-400 rounded-full flex items-center justify-center hover:text-white hover:bg-[#282b3a] hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:rotate-90 transition-all duration-300"><X size={16} /></button>
            </div>

            <div className="p-6 md:p-8 pt-0 pb-8 md:pb-10 flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#ff2a5f]/10 border-2 border-[#ff2a5f]/40 shadow-[0_0_40px_rgba(255,42,95,0.3),inset_0_0_20px_rgba(255,42,95,0.4)] flex items-center justify-center mb-6 md:mb-8 relative group">
                <div className="absolute inset-0 rounded-full bg-[#ff2a5f] blur-2xl opacity-30 animate-pulse"></div>
                <AlertTriangle size={36} className="text-[#ff2a5f] drop-shadow-[0_0_12px_rgba(255,42,95,0.8)] relative z-10 w-8 md:w-10" />
              </div>

              <h3 className="text-xl md:text-2xl font-black text-[#ff2a5f] tracking-tight mb-3 md:mb-4 drop-shadow-[0_0_15px_rgba(255,42,95,0.6)]">
                {deleteModal.title}
              </h3>

              <p className="text-xs md:text-sm text-[#94a3b8] leading-relaxed max-w-[280px] mx-auto mb-8 font-bold">
                {deleteModal.message}
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4 w-full px-2">
                <button
                  onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                  className="w-full py-3.5 md:py-4 px-2 bg-[#212431] hover:bg-[#2a2e3d] border border-[#2d3142] text-white rounded-[16px] md:rounded-[20px] font-black uppercase tracking-widest text-[12px] md:text-[13px] transition-all shadow-sm active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-full py-3.5 md:py-4 px-2 bg-[#ff2a5f] hover:bg-[#ff154d] border border-[#ff2a5f]/50 text-white rounded-[16px] md:rounded-[20px] font-black uppercase tracking-widest text-[12px] md:text-[13px] shadow-[0_0_30px_rgba(255,42,95,0.4)] hover:shadow-[0_0_40px_rgba(255,42,95,0.6)] hover:-translate-y-1 active:scale-95 transition-all outline-none"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal ดูรูปภาพ */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 dark:bg-[#060A13]/95 backdrop-blur-2xl animate-fade-in" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative flex flex-col items-center justify-center max-w-5xl w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsImageModalOpen(false)} className="fixed top-6 right-6 md:top-8 md:right-8 z-[110] w-14 h-14 bg-white/10 hover:bg-rose-500 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-[0_0_20px_rgba(0,0,0,0.3)]"><X size={28} /></button>
            <img src={viewImageUrl} alt="Full View" className="max-w-full max-h-[90vh] object-contain rounded-[20px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 dark:border-white/5" />
          </div>
        </div>
      )}

      {/* 5. Modal แจ้งเตือนสำเร็จ (Jesus Image) - 🌟 MAGNIFICENT GRAND EDITION 🌟 */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#010408]/90 backdrop-blur-xl animate-fade-in" onClick={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="relative w-[92vw] sm:w-full max-w-[420px] flex flex-col items-center animate-fade-in-up" style={{ animationDuration: '0.6s', animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>

            {/* 🌟 GRAND LAYER 1: Rotating Divine God Rays */}
            <div className="absolute top-[30px] w-[600px] h-[600px] rounded-full pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-30 mask-radial-gradient mix-blend-screen">
              <div className="w-[150%] h-[150%] animate-[spin_20s_linear_infinite]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(74,222,128,0.8) 10deg, transparent 20deg, rgba(74,222,128,0.8) 30deg, transparent 40deg, rgba(74,222,128,0.8) 50deg, transparent 60deg, rgba(74,222,128,0.8) 70deg, transparent 80deg, rgba(74,222,128,0.8) 90deg, transparent 100deg, rgba(74,222,128,0.8) 110deg, transparent 120deg, rgba(74,222,128,0.8) 130deg, transparent 140deg, rgba(74,222,128,0.8) 150deg, transparent 160deg, rgba(74,222,128,0.8) 170deg, transparent 180deg, rgba(74,222,128,0.8) 190deg, transparent 200deg, rgba(74,222,128,0.8) 210deg, transparent 220deg, rgba(74,222,128,0.8) 230deg, transparent 240deg, rgba(74,222,128,0.8) 250deg, transparent 260deg, rgba(74,222,128,0.8) 270deg, transparent 280deg, rgba(74,222,128,0.8) 290deg, transparent 300deg, rgba(74,222,128,0.8) 310deg, transparent 320deg, rgba(74,222,128,0.8) 330deg, transparent 340deg, rgba(74,222,128,0.8) 350deg, transparent 360deg)' }}></div>
            </div>

            {/* 🌟 GRAND LAYER 2: Pulsing Intense Emerald Aura */}
            <div className="absolute top-[50px] w-[350px] h-[350px] bg-gradient-to-r from-[#22c55e] via-[#10b981] to-[#34d399] rounded-full blur-[80px] opacity-70 animate-pulse pointer-events-none z-0 shadow-[0_0_150px_rgba(34,197,94,0.6)]"></div>

            {/* 🌟 GRAND LAYER 3: Floating Particles / Light Sparks */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="absolute w-2.5 h-2.5 bg-[#86efac] rounded-full blur-[1px] animate-[float-ray_4s_ease-in-out_infinite]" style={{ left: `${15 + i * 10}%`, top: `${50 + (i % 4) * 10}%`, animationDelay: `${i * 0.5}s`, boxShadow: '0 0 10px #4ade80' }}></div>
              ))}
            </div>

            {/* 👑 Jesus Image (Giant Floating Effect) */}
            <div className="relative z-10 w-[380px] -mb-16 drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)] animate-[float_4s_ease-in-out_infinite] hover:scale-110 hover:-translate-y-4 hover:drop-shadow-[0_0_50px_rgba(74,222,128,0.6)] transition-all duration-700 cursor-pointer">
              <img src="/jesus.png" alt="Success" className="w-full h-auto object-contain pointer-events-none" />
            </div>

            {/* 💎 Main Card: Glassmorphism + Thick Glowing Border */}
            <div className="w-full bg-gradient-to-br from-[#e8fdf0] to-[#bbf7d0] border-[5px] border-[#86efac] rounded-[36px] shadow-[0_0_80px_rgba(34,197,94,0.3),inset_0_0_30px_rgba(255,255,255,0.8)] relative z-20 flex flex-col items-center pt-14 pb-12 px-8">

              {/* Inner glass highlight line */}
              <div className="absolute inset-0 rounded-[30px] border-2 border-white/60 pointer-events-none"></div>

              {/* ✨ Giant Check Icon Centered on Top Border */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-[#16a34a] to-[#15803d] border-[6px] border-[#e8fdf0] flex items-center justify-center shadow-[0_10px_30px_rgba(22,163,74,0.6),inset_0_0_20px_rgba(255,255,255,0.4)] z-30 group overflow-hidden">
                <div className="absolute w-full h-full bg-white opacity-20 -rotate-45 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-in-out"></div>
                <CheckCircle className="text-white w-12 h-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]" style={{ animation: 'bounce 2s infinite' }} strokeWidth={2.5} />
              </div>

              {/* 📜 Text Content */}
              <h3 className="text-[#14532d] font-black text-3xl mb-2 mt-3 tracking-tighter drop-shadow-md uppercase relative z-10">{successModal.title}</h3>
              <p className="text-[#166534] text-[15px] font-bold w-full text-center leading-relaxed mb-6 pb-4 border-b-2 border-[#22c55e]/30 relative z-10 shadow-[0_1px_0_rgba(255,255,255,0.5)]">
                {successModal.message}
              </p>

              {/* 🌟 Three Grand Bouncing Orbs */}
              <div className="flex space-x-3 mt-2 relative z-10">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] shadow-[0_0_12px_#22c55e]" style={{ animation: 'bounce 1s infinite 0s' }}></div>
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] shadow-[0_0_12px_#22c55e]" style={{ animation: 'bounce 1s infinite 0.2s' }}></div>
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] shadow-[0_0_12px_#22c55e]" style={{ animation: 'bounce 1s infinite 0.4s' }}></div>
              </div>

              {/* ⚡ Incredible Inset Progress Bar at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-[10px] overflow-hidden rounded-b-[30px] pointer-events-none">
                <div className="h-full bg-gradient-to-r from-[#22c55e] via-[#86efac] to-[#22c55e] animate-[progress-shrink_2.5s_linear_forwards] w-full origin-left rounded-bl-[30px] shadow-[0_-5px_20px_rgba(34,197,94,0.8)]"></div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;