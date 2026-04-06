const fs = require('fs');

const appFile = 'C:/xampp/htdocs/church_accounting/frontend/src/App.jsx';
let content = fs.readFileSync(appFile, 'utf8');

const targetStr = `                ) : (
                  <div onClick={() => fileInputRef.current.click()} className="w-full py-10 bg-white/40 dark:bg-[#060A13]/40 border-2 border-slate-300 dark:border-[#1E293B] border-dashed rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <Upload size={32} className="text-slate-400 dark:text-[#334155] mb-3 group-hover:text-blue-500 group-hover:animate-bounce transition-colors" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-[#64748B] uppercase tracking-[0.2em] group-hover:text-blue-500">คลิกเพื่ออัปโหลดสลิป</span>
                  </div>
                )}`;

const replacementStr = `                ) : (
                  <div className="flex gap-3 w-full">
                    <div onClick={() => fileInputRef.current.click()} className="flex-1 py-8 bg-white/40 dark:bg-[#060A13]/40 border-2 border-slate-300 dark:border-[#1E293B] border-dashed rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                      <Upload size={28} className="text-slate-400 dark:text-[#334155] mb-2 group-hover:text-blue-500 group-hover:animate-bounce transition-colors" />
                      <span className="text-[10px] font-black text-slate-500 dark:text-[#64748B] uppercase tracking-[0.1em] group-hover:text-blue-500 px-2 text-center">อัปโหลดสลิป</span>
                    </div>
                    <div onClick={() => cameraInputRef.current.click()} className="flex-1 py-8 bg-white/40 dark:bg-[#060A13]/40 border-2 border-slate-300 dark:border-[#1E293B] border-dashed rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                      <Camera size={28} className="text-slate-400 dark:text-[#334155] mb-2 group-hover:text-blue-500 group-hover:animate-bounce transition-colors" />
                      <span className="text-[10px] font-black text-slate-500 dark:text-[#64748B] uppercase tracking-[0.1em] group-hover:text-blue-500 px-2 text-center">ถ่ายรูป</span>
                    </div>
                  </div>
                )}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(appFile, content);
  console.log("Successfully replaced buttons in App.jsx");
} else {
  console.log("Target string not found in App.jsx, maybe formatting is slightly off");
}
