# 📄 Quotation Letter Bot

An AI-powered Telegram bot that automatically generates professional quotation letters (Surat Penawaran) as PDF — all through a simple chat interface.

## ✨ Features

- 💬 **Conversational input** — User provides details naturally via Telegram chat, no forms needed
- 🤖 **AI-powered generation** — Gemini AI extracts and structures the data automatically
- 📄 **Template-based output** — Fills a pre-defined quotation letter template with user data
- 📑 **PDF output** — Final document is converted and ready to send
- ✅ **Confirmation step** — User reviews the generated letter before it gets sent
- 📧 **Auto-send to Gmail** — Approved letter is sent directly to the recipient's email

## 🔄 How It Works

```
User chats on Telegram (free text)
        ↓
AI extracts: client name, items, prices, date, etc.
        ↓
Bot fills quotation letter template
        ↓
Convert to PDF
        ↓
Bot sends preview → User confirms
        ↓
Bot sends PDF to recipient via Gmail
```

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Bot Framework | Telegraf (Node.js) |
| AI Engine | Google Gemini AI |
| Document Template | Docxtemplater |
| PDF Conversion | LibreOffice |
| Email Delivery | Gmail API / Nodemailer |

## 📸 Demo

```
User:   "Buat surat penawaran untuk PT Maju Jaya, 
         produk: 10 unit laptop @5jt, 5 unit printer @2jt"

Bot:    ✅ Surat penawaran sudah dibuat!
        
        Preview:
        - Client: PT Maju Jaya
        - Items: 10x Laptop (Rp 50.000.000)
                 5x Printer (Rp 10.000.000)
        - Total: Rp 60.000.000
        
        Kirim ke email klien? [✅ Ya] [✏️ Edit]

User:   ✅ Ya

Bot:    📧 Surat penawaran berhasil dikirim ke pt.majujaya@email.com
```

## ⚙️ Setup

1. Clone the repo
```bash
git clone https://github.com/didikbilikhsan09-alt/Quotation-Letter-bot
cd Quotation-Letter-bot
npm install
```

2. Configure environment variables
```
TELEGRAM_BOT_TOKEN=your_token
GEMINI_API_KEY=your_key
GMAIL_USER=your_email
GMAIL_PASS=your_app_password
```

3. Run the bot
```bash
node penawaran_bot.js
```

## 📬 Contact

Built by [Ikhsan](www.linkedin.com/in/didik-bil-ikhsan-0093a040a) — AI Automation Developer  
Open for freelance projects and collaborations.
