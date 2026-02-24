import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 const handleSubmit = (e) => {
    e.preventDefault();
    
    // ตั้งรหัสผ่านสำหรับทดสอบตรงนี้
    if (email === 'admin@gmail.com' && password === '123456') {
      onLogin();
    } else {
      alert('อีเมลหรือรหัสผ่านไม่ถูกต้องครับ');
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-[#060A13] transition-colors duration-500 relative overflow-hidden">
      
      {/* พื้นหลังตารางใหญ่ 64px */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>
      
      {/* แสง Ambient Glow เบื้องหลัง */}
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-400/30 dark:from-blue-600/40 dark:to-cyan-600/40 blur-[150px] pointer-events-none"></div>
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-purple-400/30 to-pink-400/30 dark:from-purple-600/40 dark:to-pink-600/40 blur-[150px] pointer-events-none"></div>

      {/* กล่องล็อกอิน Glassmorphism */}
      <div className="w-full max-w-[1100px] min-h-[750px] flex bg-white/80 dark:bg-[#0E1525]/80 backdrop-blur-3xl border border-white dark:border-[#1E293B] rounded-[50px] shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-hidden z-10">
        
        {/* ฝั่งซ้าย: Branding & Aura Logo */}
        <div className="hidden lg:flex w-1/2 bg-slate-50/50 dark:bg-[#0B1121]/50 p-16 flex-col justify-between border-r border-slate-200 dark:border-[#1E293B] relative">
          <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col items-center text-center relative z-10">
            {/* --- โลโก้ไร้ขอบ พร้อมรัศมี Aura สีฟ้า --- */}
            <div className="w-80 h-80 flex items-center justify-center mb-10 relative group">
               {/* รัศมีแสงฟุ้งสีฟ้า (Aura Glow) */}
               <div className="absolute -inset-10 bg-blue-600/60 dark:bg-blue-500/50 blur-[80px] rounded-full animate-pulse transition-all duration-700 group-hover:bg-blue-400/70 -z-10"></div>
               <div className="absolute -inset-4 bg-blue-400/20 blur-[40px] rounded-full -z-10"></div>
               
               {/* ตัวโลโก้ */}
               <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full shadow-[0_0_50px_rgba(59,130,246,0.2)] transform group-hover:scale-105 transition-transform duration-700 relative z-10" />
            </div>
            
            <h1 className="text-5xl font-black text-slate-800 dark:text-white mb-3 uppercase tracking-tighter">Money<span className="text-[#3B82F6]">Tracker</span></h1>
            <p className="text-sm text-slate-500 dark:text-[#94A3B8] font-black uppercase tracking-[0.4em] mb-14">Church Accounting System</p>

            {/* รายการฟีเจอร์พร้อมจุดแสงฟุ้งสีฟ้า */}
            <div className="space-y-6 w-full text-left max-w-[320px]">
                {[
                  "ติดตามรายรับ-รายจ่าย Real-time",
                  "วิเคราะห์แนวโน้มด้วยกราฟ",
                  "จัดหมวดหมู่รายการอัตโนมัติ",
                  "รายงานสรุปรายเดือน-รายปี"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-5 group">
                    {/* จุดแสงสีฟ้าฟุ้งๆ */}
                    <div className="relative">
                       <div className="absolute inset-0 bg-blue-400 blur-md rounded-full opacity-70 group-hover:blur-lg transition-all"></div>
                       <div className="w-3.5 h-3.5 bg-blue-500 rounded-full relative z-10 border-2 border-white dark:border-[#0E1525]"></div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-[#94A3B8] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{feature}</span>
                  </div>
                ))}
            </div>
          </div><br></br>

          <div className="text-slate-400 dark:text-[#475569] text-xs text-center font-bold tracking-widest relative z-10 uppercase">© 2026 THE HOUSE OF WORSHIP & PRAYER</div>
        </div>

        {/* ฝั่งขวา: ฟอร์มล็อกอิน (Glass UI) */}
        <div className="w-full lg:w-1/2 p-16 flex flex-col justify-center bg-white/30 dark:bg-transparent">
          <div className="max-w-[400px] mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">ยินดีต้อนรับกลับ</h2>
              <p className="text-slate-500 dark:text-[#64748B] font-bold">เข้าสู่ระบบเพื่อจัดการบัญชีของคุณ</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-700 dark:text-[#94A3B8] ml-2 uppercase tracking-widest">อีเมลผู้ใช้งาน</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6] transition-colors" size={22} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@gmail.com" className="w-full pl-14 pr-6 py-5 bg-slate-100/50 dark:bg-[#060A13] border-2 border-slate-100 dark:border-[#1E293B] rounded-[24px] text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" required />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-700 dark:text-[#94A3B8] ml-2 uppercase tracking-widest">รหัสผ่าน</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6] transition-colors" size={22} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-14 pr-14 py-5 bg-slate-100/50 dark:bg-[#060A13] border-2 border-slate-100 dark:border-[#1E293B] rounded-[24px] text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}</button>
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white rounded-[24px] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl shadow-blue-500/40 transition-all duration-300 transform active:scale-95 mb-10">
                <span>เข้าสู่ระบบ</span><ArrowRight size={24} />
              </button>
            </form>

            <button className="w-full text-center text-xs font-black text-slate-400 hover:text-[#3B82F6] transition-colors flex items-center justify-center space-x-3 group uppercase tracking-widest">
              <span className="group-hover:-translate-x-2 transition-transform rotate-180"><ArrowRight size={18} /></span><span>กลับหน้าหลัก</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}