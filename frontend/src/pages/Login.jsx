import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Database, Activity, PieChart, LineChart, X } from 'lucide-react';

export default function Login({ onLogin, onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('savedPassword') || '');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('savedEmail') ? true : false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === '123456') {
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }
      onLogin();
    } else {
      alert('อีเมลหรือรหัสผ่านไม่ถูกต้องครับ');
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#030610] transition-colors duration-500 overflow-hidden font-sans relative p-4 sm:p-6 lg:p-12">

      {/* Cinematic Edge Glow System (Vignette & Light Leaks) */}
      <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_80px_rgba(59,130,246,0.15),inset_0_0_120px_rgba(168,85,247,0.15)] dark:shadow-[inset_0_0_100px_rgba(30,58,138,0.4),inset_0_0_150px_rgba(88,28,135,0.4)] mix-blend-screen"></div>
      <div className="absolute top-0 left-0 w-full h-[25vh] bg-gradient-to-b from-blue-500/30 via-purple-500/10 dark:from-blue-500/20 dark:via-purple-500/10 to-transparent blur-[50px] pointer-events-none z-10 animate-pulse-glow" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-0 left-0 w-full h-[25vh] bg-gradient-to-t from-purple-500/30 via-blue-500/10 dark:from-purple-500/20 dark:via-blue-500/10 to-transparent blur-[50px] pointer-events-none z-10 animate-pulse-glow" style={{ animationDuration: '8s', animationDelay: '1s' }}></div>
      <div className="absolute top-0 left-0 w-[25vw] h-full bg-gradient-to-r from-blue-500/30 via-purple-500/10 dark:from-blue-600/20 dark:via-purple-600/10 to-transparent blur-[60px] pointer-events-none z-10 animate-pulse-glow" style={{ animationDuration: '7s', animationDelay: '0.5s' }}></div>
      <div className="absolute top-0 right-0 w-[25vw] h-full bg-gradient-to-l from-purple-500/30 via-blue-500/10 dark:from-purple-600/20 dark:via-blue-600/10 to-transparent blur-[60px] pointer-events-none z-10 animate-pulse-glow" style={{ animationDuration: '9s', animationDelay: '1.5s' }}></div>

      {/* Extreme Hi-Tech Background Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800A_1px,transparent_1px),linear-gradient(to_bottom,#8080800A_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none">
        {/* Animated Grid Highlights */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"></div>
      </div>

      {/* Cyberpunk/Futuristic Orbs */}
      <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[150px] mix-blend-screen pointer-events-none animate-pulse-glow"></div>
      <div className="absolute -bottom-[15%] right-[0%] w-[40%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen pointer-events-none animate-float"></div>

      {/* Main Glass HUD (Heads Up Display) Container */}
      <div className="w-full h-full max-w-[1400px] flex flex-col lg:flex-row rounded-[30px] lg:rounded-[40px] overflow-hidden z-10 animate-fade-in-up border border-slate-200/50 dark:border-white/5 bg-white/30 dark:bg-[#060A13]/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_rgba(0,0,0,0.5)] relative">

        {/* Edge Lighting Rails */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent z-20"></div>

        {/* Left Side: Cyber-Branding Showcase */}
        <div className="hidden lg:flex w-[55%] xl:w-3/5 p-8 xl:p-12 2xl:p-20 flex-col justify-between relative overflow-hidden border-r border-slate-200/50 dark:border-white/5 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30 dark:from-blue-900/10 dark:to-purple-900/10 z-0"></div>

          <div className="relative z-10 flex flex-col flex-1 justify-center items-center text-center">
            {/* The Artifact (Logo Hologram) */}
            <div className="w-40 h-40 xl:w-56 xl:h-56 2xl:w-72 2xl:h-72 shrink-0 flex items-center justify-center mb-6 xl:mb-10 2xl:mb-14 relative group-hover:scale-105 transition-transform duration-1000">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-20 blur-[40px] rounded-full group-hover:opacity-40 transition-all duration-700"></div>
              <div className="w-full h-full rounded-full p-[2px] bg-gradient-to-b from-white/50 to-transparent dark:from-white/10 dark:to-transparent relative shadow-xl">
                <div className="absolute inset-0 bg-white/20 dark:bg-black/20 rounded-full backdrop-blur-md"></div>
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] relative z-10 group-hover:rotate-3 transition-transform duration-1000" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 uppercase tracking-tighter drop-shadow-sm filter flex flex-col items-center">
                <span>The House of</span>
                <span className="text-[0.7em] tracking-[0.1em] mt-2">worship and prayer</span>
              </h1>
            </div>

            {/* High-Tech Stat Modules - 4 Row Layout Premium UI */}
            <div className="mt-8 xl:mt-10 2xl:mt-14 grid grid-cols-4 gap-3 2xl:gap-5 w-full max-w-3xl shrink-0">
              <div className="bg-white/30 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl p-4 2xl:p-5 flex flex-col items-center justify-center space-y-3 text-center transition-all duration-300 hover:bg-white/60 dark:hover:bg-white-[0.08] hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)] hover:border-blue-500/30 group/feat relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-500/5 dark:to-blue-500/10 opacity-0 group-hover/feat:opacity-100 transition-opacity duration-300"></div>
                <div className="w-12 h-12 2xl:w-14 2xl:h-14 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover/feat:bg-blue-500 group-hover/feat:text-white transition-all duration-300 shadow-inner group-hover/feat:shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10">
                  <Activity size={20} className="2xl:w-6 2xl:h-6" />
                </div>
                <p className="text-[10px] 2xl:text-xs font-black text-slate-700 dark:text-[#E2E8F0] leading-snug tracking-wide group-hover/feat:text-blue-600 dark:group-hover/feat:text-blue-400 transition-colors z-10">ติดตามรายรับรายจ่าย<br />แบบ Real-time</p>
              </div>

              <div className="bg-white/30 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl p-4 2xl:p-5 flex flex-col items-center justify-center space-y-3 text-center transition-all duration-300 hover:bg-white/60 dark:hover:bg-white-[0.08] hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.3)] hover:border-indigo-500/30 group/feat relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 to-indigo-500/5 dark:to-indigo-500/10 opacity-0 group-hover/feat:opacity-100 transition-opacity duration-300"></div>
                <div className="w-12 h-12 2xl:w-14 2xl:h-14 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover/feat:bg-indigo-500 group-hover/feat:text-white transition-all duration-300 shadow-inner group-hover/feat:shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10">
                  <LineChart size={20} className="2xl:w-6 2xl:h-6" />
                </div>
                <p className="text-[10px] 2xl:text-xs font-black text-slate-700 dark:text-[#E2E8F0] leading-snug tracking-wide group-hover/feat:text-indigo-600 dark:group-hover/feat:text-indigo-400 transition-colors z-10">วิเคราะห์แนวโน้ม<br />การเงินด้วยกราฟ</p>
              </div>

              <div className="bg-white/30 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl p-4 2xl:p-5 flex flex-col items-center justify-center space-y-3 text-center transition-all duration-300 hover:bg-white/60 dark:hover:bg-white-[0.08] hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(168,85,247,0.3)] hover:border-purple-500/30 group/feat relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 to-purple-500/5 dark:to-purple-500/10 opacity-0 group-hover/feat:opacity-100 transition-opacity duration-300"></div>
                <div className="w-12 h-12 2xl:w-14 2xl:h-14 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover/feat:bg-purple-500 group-hover/feat:text-white transition-all duration-300 shadow-inner group-hover/feat:shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10">
                  <Database size={20} className="2xl:w-6 2xl:h-6" />
                </div>
                <p className="text-[10px] 2xl:text-xs font-black text-slate-700 dark:text-[#E2E8F0] leading-snug tracking-wide group-hover/feat:text-purple-600 dark:group-hover/feat:text-purple-400 transition-colors z-10">จัดหมวดหมู่<br />รายการอัตโนมัติ</p>
              </div>

              <div className="bg-white/30 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl p-4 2xl:p-5 flex flex-col items-center justify-center space-y-3 text-center transition-all duration-300 hover:bg-white/60 dark:hover:bg-white-[0.08] hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)] hover:border-emerald-500/30 group/feat relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 to-emerald-500/5 dark:to-emerald-500/10 opacity-0 group-hover/feat:opacity-100 transition-opacity duration-300"></div>
                <div className="w-12 h-12 2xl:w-14 2xl:h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover/feat:bg-emerald-500 group-hover/feat:text-white transition-all duration-300 shadow-inner group-hover/feat:shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10">
                  <PieChart size={20} className="2xl:w-6 2xl:h-6" />
                </div>
                <p className="text-[10px] 2xl:text-xs font-black text-slate-700 dark:text-[#E2E8F0] leading-snug tracking-wide group-hover/feat:text-emerald-600 dark:group-hover/feat:text-emerald-400 transition-colors z-10">รายงานสรุป<br />รายเดือน-รายปี</p>
              </div>
            </div>
          </div>


        </div>

        {/* Right Side: Biometric / Login Portal */}
        <div className="w-full h-full lg:w-[45%] xl:w-2/5 p-8 sm:p-12 xl:p-16 flex flex-col justify-center relative bg-white/40 dark:bg-[#0B1121]/40 overflow-y-auto">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="absolute top-6 right-6 xl:top-8 xl:right-8 w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-rose-500 dark:text-[#94A3B8] dark:hover:text-rose-400 hover:bg-white dark:hover:bg-white/10 hover:shadow-[0_4px_20px_rgba(244,63,94,0.15)] transition-all duration-300 hover:rotate-90 hover:scale-110 z-50 cursor-pointer"
              title="ยกเลิก / กลับไปหน้าหลัก"
            >
              <X size={20} className="xl:w-6 xl:h-6" />
            </button>
          )}
          <div className="max-w-[400px] mx-auto w-full relative z-10">

            <div className="text-center mb-10 xl:mb-14 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 w-1/4 h-full bg-white/50 skew-x-[-20deg] translate-x-[-200%] group-hover:translate-x-[500%] transition-transform duration-1000"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2 relative z-10"></div>
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest relative z-10">จำเป็นต้องเข้าสู่ระบบ</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">เข้าสู่ระบบ</h2>
              <p className="text-slate-500 dark:text-[#94A3B8] font-bold text-sm tracking-wide">กรุณายืนยันตัวตนเพื่อเข้าใช้งาน</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex justify-between">
                  <label className="text-[10px] font-black text-slate-500 dark:text-[#94A3B8] ml-2 uppercase tracking-[0.2em]">อีเมลผู้ใช้งาน</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="text-slate-400 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="กรอกอีเมลของคุณ..."
                    className="w-full pl-14 pr-6 py-4 xl:py-5 bg-white/80 dark:bg-[#060A13]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-[18px] text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-bold tracking-wide shadow-inner text-sm"
                    required
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 transition-colors group-focus-within:bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] opacity-0 group-focus-within:opacity-100"></div>
                </div>
              </div>

              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex justify-between">
                  <label className="text-[10px] font-black text-slate-500 dark:text-[#94A3B8] ml-2 uppercase tracking-[0.2em]">รหัสผ่าน</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="text-slate-400 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-16 py-4 xl:py-5 bg-white/80 dark:bg-[#060A13]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-[18px] text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-black tracking-widest shadow-inner text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 pb-4 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0B1121] transition-all group-hover:border-blue-500 shadow-inner overflow-hidden">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-500 scale-0 opacity-0 peer-checked:scale-100 peer-checked:opacity-100 transition-all duration-300"></div>
                    <svg className="w-3 h-3 text-white relative z-10 opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300 delay-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 dark:text-[#94A3B8] tracking-[0.1em] uppercase transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">จดจำการเข้าสู่ระบบ</span>
                </label>
              </div>

              <div className="pt-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <button
                  type="submit"
                  className="group relative w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 xl:py-5 rounded-[18px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_0_rgba(79,70,229,0.7)] hover:-translate-y-1 active:scale-95 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] group-hover:animate-[bg-shine_2s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
                  <div className="absolute inset-[-2px] rounded-[20px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-500 z-0 pointer-events-none"></div>
                  <span className="relative z-20 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">เข้าสู่ระบบ</span>
                  <div className="relative z-20 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all duration-500 group-hover:translate-x-3">
                    <ArrowRight size={12} className="transition-transform duration-500" />
                  </div>
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}