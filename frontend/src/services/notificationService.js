// Notification Service for LINE (Webhook & Messaging API) and Telegram Automation

const SETTINGS_KEY = 'hwp_notification_settings';

export const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: true,
  notify_all: true, // แจ้งเตือนทุกรายการตามความต้องการของผู้ใช้
  line_webhook_url: '',
  line_access_token: '',
  line_target_id: '',
  telegram_bot_token: '',
  telegram_chat_id: '',
};

// Upload removed - Google Apps Script handles image hosting via Google Drive directly

export function getNotificationSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load notification settings:", e);
  }
  return { ...DEFAULT_NOTIFICATION_SETTINGS };
}

export function saveNotificationSettings(settings) {
  try {
    const updated = { ...getNotificationSettings(), ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save notification settings:", e);
    return null;
  }
}

// ========== Send raw text/payload to configured platforms ==========
export async function sendPlatformMessage(messageText, rawData = {}) {
  const settings = getNotificationSettings();
  if (!settings.enabled) return { status: 'disabled' };

  const results = { line: false, telegram: false };

  // 1. Send via LINE Webhook (Make / Zapier / Google Apps Script / Custom Webhook)
  if (settings.line_webhook_url && settings.line_webhook_url.trim()) {
    try {
      const targetUrl = settings.line_webhook_url.trim();
      const payload = JSON.stringify({
        message: messageText,
        text: messageText,
        imageUrl: rawData.imageUrl || null,
        base64Image: rawData.base64Image || null,
        timestamp: new Date().toISOString()
      });

      // Try sending with no-cors mode for Google Apps Script compatibility
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload
      });
      results.line = true;
    } catch (err) {
      console.warn("LINE Webhook error:", err);
    }
  }

  // 2. Send via LINE Messaging API (Direct Channel Access Token)
  if (settings.line_access_token && settings.line_target_id) {
    try {
      await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.line_access_token.trim()}`
        },
        body: JSON.stringify({
          to: settings.line_target_id.trim(),
          messages: [{ type: 'text', text: messageText }]
        })
      });
      results.line = true;
    } catch (err) {
      console.warn("LINE Messaging API error:", err);
    }
  }

  // 3. Send via Telegram Bot API
  if (settings.telegram_bot_token && settings.telegram_chat_id) {
    try {
      const url = `https://api.telegram.org/bot${settings.telegram_bot_token.trim()}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegram_chat_id.trim(),
          text: messageText,
          parse_mode: 'HTML'
        })
      });
      results.telegram = true;
    } catch (err) {
      console.warn("Telegram Bot error:", err);
    }
  }

  return results;
}

// ========== Format & Send Transaction Alert (ทุกรายการ) ==========
export async function sendTransactionNotification(tx, actionType = 'ADD') {
  const settings = getNotificationSettings();
  if (!settings.enabled || !settings.notify_all) return;

  const isIncome = tx.type === 'INCOME';
  const typeLabel = isIncome ? '🟢 รายรับ (Income)' : '🔴 รายจ่าย (Expense)';
  const actionTitle = actionType === 'ADD' ? '🔔 มีการบันทึกรายการใหม่' : '🔔 มีการแก้ไขรายการ';
  const formattedAmount = Number(tx.amount).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  let dateFormatted = tx.transaction_date;
  try {
    dateFormatted = new Date(tx.transaction_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {}

  const msg = [
    actionTitle,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 ประเภท: ${typeLabel}`,
    `💰 จำนวนเงิน: ฿${formattedAmount} บาท`,
    `📂 หมวดหมู่: ${tx.description || 'ไม่ระบุ'}`,
    `📅 วันที่: ${dateFormatted}`,
    tx.note ? `📝 หมายเหตุ: ${tx.note}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⛪ คริสตจักรบ้านนมัสการและอธิษฐาน`
  ].filter(Boolean).join('\n');

  return await sendPlatformMessage(msg, { 
    transaction: tx, 
    action: actionType,
    base64Image: tx.image_url || null,
    imageUrl: tx.image_url && tx.image_url.startsWith('https://') ? tx.image_url : null
  });
}

// ========== Format & Send Monthly Summary (สรุปรายเดือน) ==========
export async function sendMonthlySummaryNotification(year, monthNum, allTransactions, fmt) {
  const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const monthName = MONTHS_TH[monthNum - 1];
  const monthStr = monthNum.toString().padStart(2, '0');

  // Filter transactions for this month
  const monthTx = allTransactions.filter(t => t.transaction_date.startsWith(`${year}-${monthStr}`));
  
  let totalIncome = 0;
  let totalExpense = 0;
  monthTx.forEach(t => {
    if (t.type === 'INCOME') totalIncome += parseFloat(t.amount);
    else totalExpense += parseFloat(t.amount);
  });
  const netBalance = totalIncome - totalExpense;

  // Calculate accumulated total balance across all history
  let totalOverallIncome = 0;
  let totalOverallExpense = 0;
  allTransactions.forEach(t => {
    if (t.type === 'INCOME') totalOverallIncome += parseFloat(t.amount);
    else totalOverallExpense += parseFloat(t.amount);
  });
  const accumulatedBalance = totalOverallIncome - totalOverallExpense;

  const msg = [
    `📊 สรุปการเงินประจำเดือน ${monthName} ${year}`,
    `⛪ คริสตจักรบ้านนมัสการและอธิษฐาน`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🟢 รายรับรวมเดือนนี้:  +฿${fmt ? fmt(totalIncome) : totalIncome.toLocaleString('th-TH')} บาท`,
    `🔴 รายจ่ายรวมเดือนนี้: -฿${fmt ? fmt(totalExpense) : totalExpense.toLocaleString('th-TH')} บาท`,
    `⚡ คงเหลือสุทธิเดือนนี้:  ${netBalance >= 0 ? '+' : '-'}${fmt ? fmt(Math.abs(netBalance)) : Math.abs(netBalance).toLocaleString('th-TH')} บาท`,
    `🏦 ยอดเงินคงเหลือสะสมคริสตจักร: ฿${fmt ? fmt(accumulatedBalance) : accumulatedBalance.toLocaleString('th-TH')} บาท`,
    `📋 จำนวนรายการทั้งหมดเดือนนี้: ${monthTx.length} รายการ`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 เข้าดูระบบเพิ่มเติม: https://church-accounting.pages.dev`,
    `🙏 ขอพระเจ้าทรงอวยพระพรทุกท่าน`
  ].join('\n');

  return await sendPlatformMessage(msg, { year, monthNum, monthName, totalIncome, totalExpense, netBalance, accumulatedBalance });
}

// ========== Send Test Notification ==========
export async function sendTestNotification() {
  const msg = [
    `🧪 [HWP Accounting] ทดสอบการเชื่อมต่อการแจ้งเตือน`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✅ ระบบแจ้งเตือน LINE / Telegram ทำงานถูกต้องเรียบร้อยแล้ว!`,
    `⏰ เวลาทดสอบ: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⛪ คริสตจักร The House of Worship and Prayer`
  ].join('\n');

  return await sendPlatformMessage(msg, { test: true });
}
