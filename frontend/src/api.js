// api.js — ไฟล์กลางสำหรับ URL ของ PHP API
// ค่า VITE_API_URL จะถูก inject ตอน build โดย Cloudflare Pages
// ถ้าไม่มี (local dev) จะใช้ path แบบ relative เหมือนเดิม
const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = (endpoint) => `${API_BASE}/church_api/${endpoint}`;
