require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const { message } = require('telegraf/filters');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const libre = require('libreoffice-convert');
const { promisify } = require('util');

const libreConvert = promisify(libre.convert);
libre.soffice = process.env.LIBREOFFICE_PATH || 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';

// ============================================================
// INIT
// ============================================================
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.use(session());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASSWORD }
});

// Queue jadwal kirim: { id, pdfPath, data, nomorPenawaran, targetEmail, sendAt, timeoutRef }
const scheduleQueue = new Map();

// ============================================================
// HELPER: JSON parser
// ============================================================
function extractJSON(text) {
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(cleaned); } catch (_) {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) return JSON.parse(cleaned.substring(start, end + 1));
  throw new Error('Gagal parse JSON');
}

// ============================================================
// HELPER: Generate DOCX
// ============================================================
function generateDocx(data, nomorPenawaran) {
  const templatePath = path.resolve(__dirname, 'Template_Penawaran.docx');
  if (!fs.existsSync(templatePath)) throw new Error('Template_Penawaran.docx tidak ditemukan');

  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true, linebreaks: true,
    delimiters: { start: '{{', end: '}}' }
  });

  const dateNow = new Date();
  const dateBerlaku = new Date(dateNow.getTime() + 14 * 24 * 60 * 60 * 1000);

  doc.render({
    NomorPenawaran: nomorPenawaran,
    Tanggal: dateNow.toLocaleDateString('id-ID'),
    BerlakuHingga: dateBerlaku.toLocaleDateString('id-ID'),
    NamaKlien: data.NamaKlien || '-',
    AlamatKlien: data.AlamatKlien || '-',
    KotaKlien: data.KotaKlien || '-',
    TelpKlien: data.TelpKlien || '-',
    EmailKlien: data.EmailKlien || '-',
    Pekerjaan: data.Pekerjaan || '-',
    DeskripsiDetail: data.DeskripsiDetail || '-',
    Harga: data.Harga || '-',
  });

  const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  const safeName = (data.NamaKlien || 'Klien').replace(/[^a-zA-Z0-9]/g, '_');
  const docxPath = path.resolve(__dirname, `Penawaran_${safeName}_${nomorPenawaran}.docx`);
  fs.writeFileSync(docxPath, buf);
  return { docxPath, buf, safeName };
}

// ============================================================
// HELPER: Convert ke PDF
// ============================================================
async function convertToPdf(buf, safeName, nomorPenawaran) {
  const pdfBuf = await libreConvert(buf, '.pdf', undefined);
  const pdfPath = path.resolve(__dirname, `Penawaran_${safeName}_${nomorPenawaran}.pdf`);
  fs.writeFileSync(pdfPath, pdfBuf);
  return pdfPath;
}

// ============================================================
// HELPER: Cleanup file
// ============================================================
function cleanup(...filePaths) {
  for (const f of filePaths) {
    try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {}
  }
}

// ============================================================
// HELPER: Kirim email
// ============================================================
async function sendEmail(targetEmail, data, nomorPenawaran, pdfPath) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  const emailResult = await model.generateContent(
    `Buatkan body email formal dan sopan dalam Bahasa Indonesia untuk mengirim surat penawaran harga.
Nama klien: ${data.NamaKlien}
Jenis pekerjaan: ${data.Pekerjaan}
Nomor surat: ${nomorPenawaran}

Aturan:
- Sampaikan bahwa surat penawaran terlampir
- JANGAN sebutkan nominal harga di body email
- JANGAN sebutkan masa berlaku
- Tulis pembuka, isi singkat, penutup sopan
- Tanpa subject, tanpa tanda tangan`
  );

  await transporter.sendMail({
    from: `"${process.env.NAMA_PERUSAHAAN || 'Tim Penawaran'}" <${process.env.GMAIL_USER}>`,
    to: targetEmail,
    subject: `Surat Penawaran Harga ${nomorPenawaran} - ${data.NamaKlien}`,
    text: emailResult.response.text(),
    attachments: [{ filename: path.basename(pdfPath), path: pdfPath }]
  });
}

// ============================================================
// HELPER: Parse waktu dari teks natural
// Contoh: "sekarang", "besok jam 9", "jam 14:30", "30 menit lagi"
// ============================================================
function parseScheduleTime(text) {
  const input = text.toLowerCase().trim();
  const now = new Date();

  function setJam(date, jam, menit = 0) {
    const d = new Date(date);
    d.setHours(jam, menit, 0, 0);
    return d;
  }

  function formatLabel(date) {
    return date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  }

  function extractJam(str) {
    const m = str.match(/jam\s*(\d{1,2})(?:[.::](\d{2}))?/) ||
              str.match(/(\d{1,2})[.:](\d{2})/);
    if (m) return { jam: parseInt(m[1]), menit: parseInt(m[2] || '0') };
    return null;
  }

  // "sekarang" / "segera" / "langsung"
  if (/sekarang|segera|langsung|now|saat ini/.test(input)) {
    return { sendAt: now, label: 'sekarang' };
  }

  // "X menit lagi"
  const menitLagi = input.match(/(\d+)\s*menit\s*lagi/);
  if (menitLagi) {
    const sendAt = new Date(now.getTime() + parseInt(menitLagi[1]) * 60 * 1000);
    return { sendAt, label: `${menitLagi[1]} menit lagi (${formatLabel(sendAt)})` };
  }

  // "X jam lagi"
  const jamLagi = input.match(/(\d+)\s*jam\s*lagi/);
  if (jamLagi) {
    const sendAt = new Date(now.getTime() + parseInt(jamLagi[1]) * 3600 * 1000);
    return { sendAt, label: `${jamLagi[1]} jam lagi (${formatLabel(sendAt)})` };
  }

  // "besok jam X"
  if (/besok/.test(input)) {
    const besok = new Date(now);
    besok.setDate(besok.getDate() + 1);
    const jamInfo = extractJam(input);
    const sendAt = jamInfo ? setJam(besok, jamInfo.jam, jamInfo.menit) : setJam(besok, 9, 0);
    return { sendAt, label: formatLabel(sendAt) };
  }

  // "lusa jam X"
  if (/lusa/.test(input)) {
    const lusa = new Date(now);
    lusa.setDate(lusa.getDate() + 2);
    const jamInfo = extractJam(input);
    const sendAt = jamInfo ? setJam(lusa, jamInfo.jam, jamInfo.menit) : setJam(lusa, 9, 0);
    return { sendAt, label: formatLabel(sendAt) };
  }

  // "jam X" → hari ini, kalau udah lewat → besok
  const jamInfo = extractJam(input);
  if (jamInfo) {
    let sendAt = setJam(new Date(now), jamInfo.jam, jamInfo.menit);
    if (sendAt <= now) sendAt.setDate(sendAt.getDate() + 1);
    return { sendAt, label: formatLabel(sendAt) };
  }

  // Fallback: sekarang
  return { sendAt: now, label: 'sekarang' };
}

// ============================================================
// SYSTEM PROMPT ekstrak multi-klien
// ============================================================
const SYSTEM_PROMPT = `Kamu adalah asisten bot Telegram yang membantu membuat Surat Penawaran Harga.
Tugasmu mengumpulkan data dari pengguna. Pengguna bisa input 1 klien atau beberapa klien sekaligus.

Untuk setiap klien, kumpulkan:
- NamaKlien (wajib)
- AlamatKlien (opsional, default "-")
- KotaKlien (opsional, default "-")
- TelpKlien (wajib)
- EmailKlien (wajib)
- Pekerjaan (wajib)
- DeskripsiDetail (opsional, default "-")
- Harga (wajib, format Rupiah)

Aturan:
1. Ngobrol natural, jangan kaku
2. Jangan minta ulang data yang sudah ada
3. Data opsional yang tidak disebutkan langsung isi "-"
4. Kalau ada data wajib yang kurang, tanya singkat
5. Bisa handle input beberapa klien sekaligus dalam 1 pesan

Kalau SEMUA data wajib untuk SEMUA klien sudah lengkap, balas HANYA dengan JSON (tanpa markdown):
{"status":"COMPLETE","clients":[{"NamaKlien":"...","AlamatKlien":"...","KotaKlien":"...","TelpKlien":"...","EmailKlien":"...","Pekerjaan":"...","DeskripsiDetail":"...","Harga":"..."}]}

Kalau belum lengkap, balas teks biasa saja.`;

async function processWithAgent(history) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  const contents = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
  const result = await model.generateContent({ systemInstruction: SYSTEM_PROMPT, contents });
  return result.response.text().trim();
}

// ============================================================
// HELPER: Kirim preview 1 klien ke Telegram
// ============================================================
async function sendClientPreview(ctx, client, index, total) {
  const label = total > 1 ? ` (${index + 1}/${total})` : '';
  const nomor = client.nomorPenawaran;

  await ctx.reply(
    `📋 *Preview Surat Penawaran${label}*\n\n` +
    `🔖 No: \`${nomor}\`\n` +
    `👤 Klien: ${client.NamaKlien}\n` +
    `📍 Kota: ${client.KotaKlien || '-'}\n` +
    `📞 Telp: ${client.TelpKlien || '-'}\n` +
    `📧 Email: ${client.EmailKlien || '-'}\n` +
    `💼 Pekerjaan: ${client.Pekerjaan}\n` +
    `💰 Harga: ${client.Harga}\n\n` +
    `PDF di bawah 👇`,
    { parse_mode: 'Markdown' }
  );

  await ctx.replyWithDocument(
    { source: client.pdfPath, filename: path.basename(client.pdfPath) },
    {
      caption: `📄 ${client.NamaKlien}`,
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Approve', callback_data: `APPROVE_${nomor}` },
          { text: '❌ Revisi', callback_data: `REJECT_${nomor}` }
        ]]
      }
    }
  );

  cleanup(client.pdfPath);
  client.pdfPath = null;
}

// ============================================================
// /start
// ============================================================
bot.command('start', (ctx) => {
  ctx.session = { step: 'CHATTING', history: [], clients: [] };

  ctx.reply(
    '📋 *Bot Surat Penawaran Harga*\n\n' +
    'Silakan informasikan detail penawaran. Bisa untuk satu atau beberapa klien sekaligus.\n\n' +
    '*Wajib diisi (per klien):*\n' +
    '▪️ Nama klien / perusahaan\n' +
    '▪️ Jenis pekerjaan atau jasa\n' +
    '▪️ Harga penawaran\n' +
    '▪️ Nomor HP / Telepon klien\n' +
    '▪️ Email klien\n\n' +
    '*Opsional:*\n' +
    '▪️ Alamat & kota klien\n' +
    '▪️ Deskripsi detail pekerjaan\n\n' +
    'Sampaikan saja, sistem akan memandu jika ada data yang kurang.',
    { parse_mode: 'Markdown' }
  );
});

// ============================================================
// Approve handler
// ============================================================
bot.action(/^APPROVE_(.+)$/, async (ctx) => {
  const nomor = ctx.match[1];
  await ctx.answerCbQuery('✅ Approved!');

  const client = ctx.session?.clients?.find(c => c.nomorPenawaran === nomor);
  if (!client) { await ctx.reply('Session expired, ketik /start ulang ya bro.'); return; }

  client.approved = true;
  ctx.session.step = `AWAITING_SCHEDULE_${nomor}`;

  const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  await ctx.reply(
    `✅ *${client.NamaKlien} disetujui!*\n\n` +
    `⏰ Sekarang: *${now} WIB*\n\n` +
    `Mau dikirim kapan?\n` +
    `Contoh: _"sekarang"_, _"besok jam 9"_, _"jam 14:30"_, _"1 jam lagi"_`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================================
// Reject handler
// ============================================================
bot.action(/^REJECT_(.+)$/, async (ctx) => {
  const nomor = ctx.match[1];
  await ctx.answerCbQuery('❌ Revisi');

  const clients = ctx.session?.clients || [];
  const idx = clients.findIndex(c => c.nomorPenawaran === nomor);
  if (idx !== -1) clients.splice(idx, 1);

  ctx.session.step = 'CHATTING';
  await ctx.reply(
    `❌ *Dibatalkan.*\n\nMau ubah data klien tersebut? Sampaikan saja.`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================================
// Handler pesan utama
// ============================================================
bot.on(message('text'), async (ctx) => {
  const text = ctx.message.text;
  const step = ctx.session?.step || '';

  // ── CHATTING ──────────────────────────────────────────────
  if (step === 'CHATTING') {
    ctx.session.history.push({ role: 'user', text });
    await ctx.sendChatAction('typing');

    try {
      const agentReply = await processWithAgent(ctx.session.history);

      let parsed = null;
      if (agentReply.includes('"status":"COMPLETE"') || agentReply.includes('"status": "COMPLETE"')) {
        try { parsed = extractJSON(agentReply); } catch (_) {}
      }

      if (parsed?.status === 'COMPLETE' && parsed.clients?.length > 0) {
        const total = parsed.clients.length;
        await ctx.reply(`⏳ Membuat ${total} dokumen PDF, mohon tunggu...`);
        await ctx.sendChatAction('upload_document');

        ctx.session.clients = [];

        for (let i = 0; i < total; i++) {
          const c = parsed.clients[i];
          const nomor = 'SPH-' + Date.now().toString().slice(-6) + '-' + (i + 1);
          const { docxPath, buf, safeName } = generateDocx(c, nomor);
          const pdfPath = await convertToPdf(buf, safeName, nomor);
          cleanup(docxPath);

          ctx.session.clients.push({ ...c, nomorPenawaran: nomor, pdfPath, approved: false, scheduled: false });
        }

        ctx.session.step = 'AWAITING_APPROVAL';

        // Kirim preview semua klien
        for (let i = 0; i < ctx.session.clients.length; i++) {
          await sendClientPreview(ctx, ctx.session.clients[i], i, total);
        }

        if (total > 1) {
          await ctx.reply(
            `👆 *${total} surat penawaran* siap direview.\nApprove atau revisi masing-masing ya bro.`,
            { parse_mode: 'Markdown' }
          );
        }

        ctx.session.history.push({ role: 'model', text: `${total} surat penawaran sudah dibuat dan dikirim untuk direview.` });

      } else {
        ctx.session.history.push({ role: 'model', text: agentReply });
        await ctx.reply(agentReply);
      }

    } catch (error) {
      console.error('[ERROR] Agent/PDF:', error.message);
      await ctx.reply('❌ Error membuat dokumen. Pastikan LibreOffice sudah terinstall.');
    }

  // ── AWAITING_APPROVAL ─────────────────────────────────────
  } else if (step === 'AWAITING_APPROVAL') {
    await ctx.reply('Silakan klik tombol *Approve* atau *Revisi* di atas dulu 👆', { parse_mode: 'Markdown' });

  // ── AWAITING_SCHEDULE per klien ───────────────────────────
  } else if (step.startsWith('AWAITING_SCHEDULE_')) {
    const nomor = step.replace('AWAITING_SCHEDULE_', '');
    const client = ctx.session?.clients?.find(c => c.nomorPenawaran === nomor);
    if (!client) { await ctx.reply('Session expired, ketik /start ulang.'); return; }

    await ctx.sendChatAction('typing');

    try {
      const { sendAt, label } = parseScheduleTime(text);
      const now = new Date();
      const delay = sendAt.getTime() - now.getTime();

      if (delay < -60000) {
        await ctx.reply('⚠️ Waktu yang dimasukkan sudah lewat. Coba lagi dengan waktu yang valid ya bro.');
        return;
      }

      const effectiveDelay = Math.max(delay, 0);
      client.scheduled = true;
      client.sendAt = sendAt;
      client.sendLabel = label;

      await ctx.reply(
        `⏰ *Terjadwal untuk ${client.NamaKlien}*\n` +
        `📅 Akan dikirim ke \`${client.EmailKlien}\` pada *${label}*`,
        { parse_mode: 'Markdown' }
      );

      // Set timeout kirim email
      const timeoutRef = setTimeout(async () => {
        let pdfPath = null;
        try {
          const { docxPath, buf, safeName } = generateDocx(client, nomor);
          pdfPath = await convertToPdf(buf, safeName, nomor);
          cleanup(docxPath);

          await sendEmail(client.EmailKlien, client, nomor, pdfPath);

          await ctx.reply(
            `🚀 *Email Terkirim!*\n\n` +
            `👤 Klien: ${client.NamaKlien}\n` +
            `📧 Ke: \`${client.EmailKlien}\`\n` +
            `🔖 No: \`${nomor}\``,
            { parse_mode: 'Markdown' }
          );

          scheduleQueue.delete(nomor);
        } catch (err) {
          console.error('[ERROR] Scheduled send:', err.message);
          await ctx.reply(`❌ Gagal kirim email ke ${client.NamaKlien}. Error: ${err.message}`);
        } finally {
          cleanup(pdfPath);
        }
      }, effectiveDelay);

      scheduleQueue.set(nomor, { client, timeoutRef });

      // Cek apakah semua klien udah dijadwalkan
      const allScheduled = ctx.session.clients.every(c => c.scheduled || !c.approved);
      if (allScheduled) {
        ctx.session.step = 'DONE';

        const summary = ctx.session.clients
          .filter(c => c.scheduled)
          .map(c => `▪️ ${c.NamaKlien} → ${c.sendLabel}`)
          .join('\n');

        await ctx.reply(
          `✅ *Semua surat penawaran sudah dijadwalkan!*\n\n${summary}\n\nKetik /start untuk penawaran baru.`,
          { parse_mode: 'Markdown' }
        );
      } else {
        // Masih ada klien lain yang belum dijadwalkan
        const remaining = ctx.session.clients.find(c => c.approved && !c.scheduled);
        if (remaining) {
          ctx.session.step = `AWAITING_SCHEDULE_${remaining.nomorPenawaran}`;
          const now2 = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
          await ctx.reply(
            `Sekarang untuk *${remaining.NamaKlien}* — mau dikirim kapan?\n` +
            `⏰ Sekarang: *${now2} WIB*\n\n` +
            `Contoh: _"sekarang"_, _"besok jam 9"_, _"jam 14:30"_, _"1 jam lagi"_`,
            { parse_mode: 'Markdown' }
          );
        }
      }

    } catch (error) {
      console.error('[ERROR] Schedule:', error.message);
      await ctx.reply('❌ Gagal parse waktu. Coba format lain ya, misalnya "besok jam 9" atau "sekarang".');
    }

  // ── DONE ──────────────────────────────────────────────────
  } else if (step === 'DONE') {
    await ctx.reply('Semua sudah dijadwalkan bro. Ketik /start untuk penawaran baru. 🙏');

  } else {
    await ctx.reply('Ketik /start untuk memulai. 🙏');
  }
});

// ============================================================
// /jadwal - lihat semua email yang terjadwal
// ============================================================
bot.command('jadwal', (ctx) => {
  if (scheduleQueue.size === 0) {
    ctx.reply('📭 Tidak ada email yang terjadwal saat ini.');
    return;
  }

  let msg = '📅 *Email Terjadwal:*\n\n';
  for (const [nomor, { client }] of scheduleQueue) {
    msg += `▪️ *${client.NamaKlien}*\n`;
    msg += `   📧 ${client.EmailKlien}\n`;
    msg += `   ⏰ ${client.sendLabel}\n`;
    msg += `   🔖 ${nomor}\n\n`;
  }
  ctx.reply(msg, { parse_mode: 'Markdown' });
});

// ============================================================
// /batalkan - batalkan jadwal tertentu
// ============================================================
bot.command('batalkan', async (ctx) => {
  if (scheduleQueue.size === 0) {
    await ctx.reply('Tidak ada jadwal yang aktif.');
    return;
  }

  let msg = '❌ *Batalkan jadwal mana?*\n\nBalas dengan nomor surat:\n\n';
  for (const [nomor, { client }] of scheduleQueue) {
    msg += `▪️ \`${nomor}\` - ${client.NamaKlien} (${client.sendLabel})\n`;
  }
  await ctx.reply(msg + '\nContoh: `/batalkan SPH-123456-1`', { parse_mode: 'Markdown' });
});

bot.hears(/^\/batalkan (.+)$/, async (ctx) => {
  const nomor = ctx.match[1].trim();
  const entry = scheduleQueue.get(nomor);
  if (!entry) {
    await ctx.reply(`❌ Nomor \`${nomor}\` tidak ditemukan di jadwal.`, { parse_mode: 'Markdown' });
    return;
  }
  clearTimeout(entry.timeoutRef);
  scheduleQueue.delete(nomor);
  await ctx.reply(`✅ Jadwal untuk *${entry.client.NamaKlien}* (\`${nomor}\`) berhasil dibatalkan.`, { parse_mode: 'Markdown' });
});

// ============================================================
// LAUNCH
// ============================================================
bot.launch();
console.log('=====================================');
console.log('📋 BOT SURAT PENAWARAN AKTIF!');
console.log('=====================================');
console.log('Commands: /start /jadwal /batalkan');
console.log('=====================================');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));