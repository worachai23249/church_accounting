import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Categories({ categories = [], transactions = [], handleOpenAddCategory, handleOpenEditCategory, handleDeleteCategory }) {
  const [categoryTab, setCategoryTab] = useState('EXPENSE'); 
  
  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const currentCategories = categoryTab === 'INCOME' ? incomeCategories : expenseCategories;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in relative z-10 font-sans">
      {/* ส่วนหัว */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">หมวดหมู่</h2>
          <p className="text-slate-400 text-sm">จัดการหมวดหมู่รายรับรายจ่าย</p>
        </div>
        <button 
          onClick={handleOpenAddCategory}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#60A5FA] to-[#A855F7] text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>เพิ่มหมวดหมู่</span>
        </button>
      </div>

      {/* Tabs แบบปุ่มมนยาว */}
      <div className="flex bg-[#0B1120] border border-[#1E293B] rounded-2xl p-1 mb-8 max-w-2xl">
        <button 
          onClick={() => setCategoryTab('EXPENSE')} 
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${categoryTab === 'EXPENSE' ? 'bg-[#F43F5E] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
          รายจ่าย ({expenseCategories.length})
        </button>
        <button 
          onClick={() => setCategoryTab('INCOME')} 
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${categoryTab === 'INCOME' ? 'bg-[#10B981] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
          รายรับ ({incomeCategories.length})
        </button>
      </div>

      {/* Grid การ์ดหมวดหมู่ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentCategories.map(c => {
          const usageCount = transactions.filter(t => t.description === c.name).length;
          return (
            <div key={c.id} className="group bg-[#0B1120]/80 border border-[#1E293B] p-4 rounded-3xl flex justify-between items-center hover:border-[#3B82F6]/50 transition-all duration-300 shadow-lg">
              <div className="flex items-center space-x-4">
                {/* ไอคอนกล่องดำ + จุดสีเรืองแสง */}
                <div className="w-12 h-12 rounded-2xl bg-[#060A13] border border-[#1E293B] flex items-center justify-center relative overflow-hidden">
                   <div className="w-2.5 h-2.5 rounded-full relative z-10" style={{ backgroundColor: c.color, boxShadow: `0 0 10px ${c.color}, 0 0 20px ${c.color}` }}></div>
                   <div className="absolute inset-0 opacity-20 blur-md" style={{ backgroundColor: c.color }}></div>
                </div>
                <div>
                  <div className="text-white font-bold text-base">{c.name}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{usageCount} รายการ</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleOpenEditCategory(c)} className="w-9 h-9 flex items-center justify-center bg-[#1E293B] rounded-xl text-slate-400 hover:text-white hover:bg-blue-500 transition-all"><Edit2 size={14} /></button>
                <button onClick={() => handleDeleteCategory(c.id)} className="w-9 h-9 flex items-center justify-center bg-[#1E293B] rounded-xl text-slate-400 hover:text-white hover:bg-rose-500 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}