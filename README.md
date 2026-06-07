# 🛒 Inventario Spesa

**Dashboard personale di gestione della spesa, lista della compra e organizzazione quotidiana.**

Un'applicazione web self-hosted che combina inventario della dispensa, lista della spesa intelligente, to-do list con promemoria, integrazione con Google Calendar e un bot Telegram — il tutto in un'unica interfaccia.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339935?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## 📋 Indice

- [🎯 Funzionalità](#-funzionalità)
- [🛠️ Tecnologie](#️-tecnologie)
- [🏗️ Struttura del Progetto](#️-struttura-del-progetto)
- [🚀 Installazione](#-installazione)
- [⚙️ Configurazione](#️-configurazione)
- [🤖 Bot Telegram](#-bot-telegram)
- [🗓️ Integrazione Google Calendar](#-integrazione-google-calendar)
- [⏰ Job in Background](#job-in-background)
- [🔐 Sicurezza](#-sicurezza)

---

## 🎯 Funzionalità

### 📦 Inventario Dispensa
- Aggiunta, modifica e cancellazione prodotti con dettagli completi (categoria, quantità, scadenza, luogo di conservazione, fornitore, prezzo, note)
- Soglia di scorta minima personalizzata per ogni prodotto
- **Scanner barcode** integrato — cerca prodotti automaticamente tramite l'API [Open Food Facts](https://world.openfoodfacts.org/)
- Ricerca e filtro rapido dei prodotti
- Aggiornamento veloce della quantità direttamente dalla lista
- Indicatore visivo dello stato di scadenza

### 🛒 Lista della Spesa
- **Generazione automatica** dalla lista inventario (prodotti sotto scorta o in scadenza)
- Aggiunta manuale di articoli
- Aggiornamento quantità e segnatura come "acquistato"
- **Invio alla lista via Telegram** con un click

### ✅ To-Do List
- Creazione task con descrizione, priorità, categoria, assegnatario e data di scadenza
- Task ricorrenti (giornalieri, settimanali, mensili)
- **Promemoria automatici** per i task in scadenza (nei prossimi 24 ore e ricorrenti)
- Filtro e ricerca dei task

### 📊 Dashboard
- Panoramica di tutti i moduli: prodotti sotto scorta, to-do in scadenza, lista della spesa
- Statistiche utente nella pagina profilo

### 🗓️ Google Calendar
- **Sincronizzazione OAuth2** con il tuo calendario Google
- Creazione, modifica e cancellazione eventi direttamente dall'app
- **Webhook push notifications** per sincronizzazione in tempo reale
- Rimozione del collegamento con l'account Google in qualsiasi momento

### 👤 Profilo & Preferenze
- Modifica nome, email, telefono, bio
- Cambio password con hashing **argon2**
- Collegamento dell'account Telegram al profilo
- Toggle delle notifiche: e-mail, Telegram, report giornaliero, promemoria to-do, alert scorta bassa

### 🤖 Bot Telegram (@pandroHomeBot)
- Comando `/start` per iscriversi e ricevere i report
- Comando `/list` per ricevere la lista della spesa direttamente in chat
- Report giornaliero automatico con prodotti in scadenza e scorta bassa
- Promemoria to-do nel bot

---

## 🛠️ Tecnologie

### Backend
| Tecnologia | Uso |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime JavaScript |
| [Express 5.2](https://expressjs.com/) | Framework web HTTP server |
| [MongoDB + Mongoose](https://mongoosejs.com/) | Database e ODM |
| [express-session + connect-mongodb-session](https://github.com/express-session/express-session) | Sessioni lato server su MongoDB |
| [argon2](https://github.com/ranisalt/node-argon2) | Hashing delle password |
| [agenda + @agendajs/mongo-backend](https://github.com/agenda/agenda) | Job scheduling (cron) con backend MongoDB |
| [telegraf](https://github.com/telegraf/telegraf) | SDK per il Bot Telegram |
| [googleapis + google-auth-library](https://github.com/googleapis/googleapis) | SDK per Google Calendar API e OAuth2 |
| [axios + node-html-parser](https://github.com/posthtml/node-html-parser) | Ricerca immagini (barcode lookup) |
| [csrf-csrf](https://github.com/lquabach/csrf-csrf) | Protezione CSRF con doppio token |

### Frontend
| Tecnologia | Uso |
|---|---|
| [EJS](https://ejs.co/) | Templating server-side |
| [Bootstrap 5](https://getbootstrap.com/) | Framework CSS UI |
| Vanilla JavaScript | Interattività client-side (AJAX, barcode scanner, ecc.) |

---

## 🏗️ Struttura del Progetto

```
inventario-spesa/
├── app.js                      # Entry point — middleware, rotte, DB, bot Telegram, HTTPS
├── package.json                # Dipendenze e script
├── .env                        # Variabili d'ambiente (non committare in produzione!)
├── key.pem / cert.pem          # Certificati HTTPS autofirmati
│
├── controllers/                # Controller delle rotte
│   ├── auth.js                 # Login, register, logout, auth-check
│   ├── inventory.js            # CRUD inventario
│   ├── todo.js                 # CRUD to-do list
│   ├── shoppingManager.js      # Gestione lista della spesa
│   ├── dashboard.js            # Dashboard aggregation
│   ├── user.js                 # Profilo e preferenze
│   ├── api.js                  # Barcode lookup, search images
│   ├── webhook.js              # Google Calendar webhook handler
│   ├── telegramBot.js          # Handler comandi bot
│   └── social/
│       ├── calendar.js         # Google Calendar OAuth + CRUD eventi
│       └── gym.js              # Placeholder
│
├── routes/                     # Definizione rotte Express (11 file)
│
├── models/                     # Schemi Mongoose (7 modelli)
│   ├── user.js                 # Utente
│   ├── item.js                 # Prodotto inventario
│   ├── todo.js                 # Task to-do
│   ├── shoppingManager.js      # Elementi lista della spesa
│   ├── event.js                # Evento Google Calendar
│   ├── tgUser.js               # Utente Telegram
│   └── userPreferences.js      # Preferenze utente
│
├── services/                   # Integrazione servizi esterni
│   ├── telegramBot.js          # Istanza Telegraf + wiring comandi
│   ├── googleCalendar.js       # Wrapper API Google Calendar
│   ├── watchChannel.js         # Gestione canali push webhook
│   └── mailer.js               # Servizio email (disabilitato)
│
├── jobs/                       # Job programmati (Agenda)
│   ├── agenda.js               # Istanza Agenda
│   ├── index.js                # initJobs / stopJobs
│   └── definitions/
│       ├── dailyReport.js      # Report giornaliero (8:00)
│       ├── reminders.js        # Promemoria to-do (ogni 5 min)
│       └── renewChannels.js    # Rinnovo webhook channels (mezzanotte)
│
├── middleware/                 # Middleware Express
│   ├── isAuth.js               # Auth guard basato su sessione
│   ├── csrf.js                 # Protezione CSRF
│   └── googleAuth.js           # OAuth2 client + token refresh
│
├── public/                     # Assets statici
│   ├── bootstrap/              # Bootstrap 5 CSS/JS
│   ├── css/                    # Stili personalizzati
│   ├── js/                     # JavaScript client-side
│   ├── react/                  # Componenti React (Gym)
│   └── media/                  # Immagini / icone
│
├── views/                      # Template EJS
│   ├── components/             # Componenti riutilizzabili (sidebar, navbar, ecc.)
│   └── ...                     # Pagine del progetto
│
└── util/
    └── utils.js                # Utility condivise (formattazione messaggi Telegram, ecc.)
```

---

## 🚀 Installazione

### Prerequisiti

- **Node.js** 18+
- **MongoDB** 7+ (locale o Atlas)
- Un bot Telegram (ottenuto da [@BotFather](https://t.me/BotFather))
- (Opzionale) Credenziali Google OAuth2 per l'integrazione Calendar

### Passaggi

```bash
# 1. Clona il repository
git clone https://github.com/pandroz/inventario-spesa.git
cd inventario-spesa

# 2. Installa le dipendenze
npm install

# 3. Copia il file .env.example e riempilo con i tuoi valori
cp .env.example .env

# 4. Genera i secret crittografici
npm run generate-secret

# 5. (Opzionale) Genera i certificati HTTPS autofirmati se non esistono già
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes

# 6. Avvia l'applicazione
npm start          # Produzione
# oppure
npm startDev       # Sviluppo (con nodemon per il reload automatico)
```

L'app sarà disponibile su **`https://localhost:3443`**

---

## ⚙️ Configurazione

Copia `.env.example` in `.env` e compila le variabili:

| Variabile | Descrizione | Esempio |
|---|---|---|
| `MONGO_URI` | Connection string MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `SESSION_SECRET` | Secret per il signing delle sessioni (64 char hex) | Generato con `npm run generate-secret` |
| `CSRF_SECRET` | Secret per i token CSRF (min 32 char esadecimale) | Generato con `npm run generate-secret` |
| `TELEGRAM_BOT_TOKEN` | Token del bot ottenuto da BotFather | `123456:ABCdefGHI-jklMNOpqrsTUVwxyz` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID | dal [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret | dal [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_REDIRECT_URI` | URI di callback OAuth2 | `https://localhost:3443/calendar/callback` |
| `PUBLIC_BASE_URL` | URL pubblico dell'app (per webhook) | `https://tuo-domain.com` |
| `WEBHOOK_SECRET` | Secret per validazione webhook Google | Qualsiasi stringa casuale |
| `SMTP_HOST` | SMTP server (es. Resend.com) | `smtp.resend.com` |
| `SMTP_PORT` | Porta SMTP | `465` |
| `SMTP_USER` | Utente SMTP | `resend` |
| `SMTP_PASS` | Password SMTP | — |
| `SMTP_ACTIVATED` | Abilita/disabilita email | `false` / `true` |

> **Nota:** Il modulo email è attualmente disabilitato per impostazione predefinita. Imposta `SMTP_ACTIVATED=true` per abilitarlo.

---

## ▶️ Avvio

```bash
# Produzione (modalità standard)
npm start

# Sviluppo (con nodemon — reload automatico al cambiamento dei file)
npm startDev
```

L'app gira su **HTTPS porta 3443** con certificati autofirmati.

Per la produzione, si raccomanda di:
- Utilizzare un reverse proxy (nginx/Caddy) con un certificato Let's Encrypt
- Sostituire i certificati autofirmati con uno valido

---

## 🤖 Bot Telegram

Il bot supporta i seguenti comandi:

| Comando | Descrizione |
|---|---|
| `/start` | Iscriviti per ricevere i report giornalieri |
| `/list` | Invia la lista della spesa corrente in chat |
| `/help` | Mostra la guida dei comandi disponibili |
| `/info` | Mostra informazioni sul tuo account |
| `/stop` | Disiscriviti dai report |

### Report Automatici

Ogni giorno alle **8:00** il bot invia automaticamente un report con:
- Prodotti in scadenza entro 3 giorni
- Prodotti sotto la soglia di scorta minima
- Task to-do in scadenza oggi e domani

---

## 🗓️ Integrazione Google Calendar

1. Vai su `/calendar` nell'app
2. Clicca **"Connetti Google Calendar"** e autorizza l'accesso
3. Gli eventi syncronizzati appariranno direttamente nella dashboard
4. Puoi creare, modificare ed eliminare eventi sia da Google che dall'app
5. I **webhook push** mantengono la sincronizzazione automatica in tempo reale

> **Note:** È necessario un URL pubblico (non `localhost`) per registrare i webhook con Google. In sviluppo puoi usare [ngrok](https://ngrok.com/) or tools di tunneling come Cloudflare Tunnel.

---

## ⏰ Job in Background

Il progetto utilizza **Agenda** con backend MongoDB per pianificare task ricorrenti:

| Job | Frequenza | Descrizione |
|---|---|---|
| `dailyReport` | Giornaliera alle 8:00 | Report prodotti in scadenza, scorta bassa, to-do imminenti |
| `reminders` | Ogni 5 minuti | Promemoria per to-do in scadenza nelle prossime 24h + ricorrenti |
| `renewChannels` | Notte (00:00) | Rinnovo automatico dei canali push webhook di Google Calendar |

---

## 🔐 Sicurezza

- **Hashing password**: Argon2 (standard moderno per la memorizzazione delle password)
- **CSRF protection**: Doppio token submit con `csrf-csrf` su tutte le rotte POST/PUT/DELETE
- **Sessioni**: Memorizzate su MongoDB con timeout di 1 ora — le sessioni scadute vengono distrutte automaticamente
- **HTTPS**: L'app gira su HTTPS con certificati autofirmati

### ⚠️ Importanti avvertenze di sicurezza

1. **Non committare mai il file `.env`** — contiene credenziali sensibili (MongoDB, Telegram, Google OAuth)
2. Crea un file `.env.example` con i nomi delle variabili ma senza valori reali
3. Per la produzione, usa un reverse proxy nginx/Caddy con certificato Let's Encrypt valido
4. I certificati autofirmati (`key.pem`/`cert.pem`) non sono adatti per ambienti di produzione

---

## 📝 Sviluppo

### Struttura del codice

L'app segue una separazione MVC classica:
- **Models**: Schemi Mongoose nella cartella `models/`
- **Controllers**: Logica delle rotte in `controllers/`
- **Routes**: Definizione dei percorsi Express in `routes/`
- **Services**: Integrazioni esterne (Telegram, Google Calendar) in `services/`
- **Jobs**: Task pianificati in `jobs/`

### Modalità di sviluppo

```bash
# Installa le dipendenze
npm install

# Avvia con nodemon (reload automatico)
npm startDev

# Genera un nuovo secret crittografico
npm run generate-secret
```

---

## 👤 Autore

**Pandro**

## 📄 Licenza

Questo progetto è sotto licenza [ISC](LICENSE).
