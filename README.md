# 💪 Fitness Buddy — AI-Powered Health & Fitness Coach

An intelligent, conversational fitness assistant powered by **IBM Granite** (via IBM Watsonx.ai). Fitness Buddy provides personalized workout recommendations, nutrition guidance, habit-building tips, and daily motivation — all through a sleek chat interface.

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🏃 **Workout Plans** | Personalized home workout routines — HIIT, strength, yoga, cardio |
| 🥗 **Nutrition Guidance** | Simple, healthy meal ideas and macro tips |
| 💡 **Daily Motivation** | Fitness quotes, goal-setting strategies, habit tracking |
| 🧘 **Lifestyle Advice** | Sleep, hydration, stress, and recovery guidance |
| 🤖 **IBM Granite AI** | Powered by IBM Granite via IBM Watsonx.ai cloud services |
| 📱 **Responsive UI** | Works on desktop and mobile |

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS — zero dependencies
- **Backend**: Node.js + Express.js
- **AI Model**: IBM Granite (`ibm/granite-13b-chat-v2`) via IBM Watsonx.ai
- **Authentication**: IBM IAM token-based auth

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
cd fitnessbuddy
npm install
```

### 2. Configure IBM Cloud Credentials

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
IBM_API_KEY=your_ibm_cloud_api_key_here
IBM_PROJECT_ID=your_ibm_watsonx_project_id_here
IBM_WATSONX_URL=https://us-south.ml.cloud.ibm.com
IBM_IAM_URL=https://iam.cloud.ibm.com/identity/token
IBM_MODEL_ID=ibm/granite-13b-chat-v2
PORT=3000
```

#### How to get IBM credentials:

1. **IBM Cloud Account**: Sign up at [cloud.ibm.com](https://cloud.ibm.com) (Lite tier available)
2. **API Key**: Go to `Manage → Access (IAM) → API keys → Create`
3. **Watsonx.ai Project**: Go to [watsonx.ai](https://dataplatform.cloud.ibm.com/wx/home), create a project, and copy the Project ID from project settings
4. **Model**: `ibm/granite-13b-chat-v2` is available on Lite tier

### 3. Run the App

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
fitnessbuddy/
├── backend/
│   ├── server.js                  # Express server entry point
│   ├── routes/
│   │   ├── chat.js                # POST /api/chat
│   │   └── health.js              # GET /api/health
│   ├── controllers/
│   │   └── chatController.js      # Orchestrates AI + fallback logic
│   └── services/
│       ├── ibmGranite.js          # IBM Watsonx.ai / Granite API client
│       └── promptBuilder.js       # Prompt engineering + intent detection
├── frontend/
│   └── public/
│       ├── index.html             # Single-page chat UI
│       ├── style.css              # Dark theme, responsive layout
│       └── app.js                 # Chat logic, API calls, markdown
├── .env                           # Your credentials (git-ignored)
├── .env.example                   # Template for credentials
├── package.json
└── README.md
```

---

## 🔌 API Reference

### `POST /api/chat`

```json
{
  "message": "Give me a 20-minute home workout",
  "history": [
    { "role": "user", "content": "Hi!" },
    { "role": "assistant", "content": "Hey! I'm Fitness Buddy..." }
  ]
}
```

**Response:**
```json
{
  "reply": "Here's a great 20-minute home workout..."
}
```

### `GET /api/health`

Returns server and model status.

---

## ⚠️ Demo Mode

If `IBM_API_KEY` is not set, the app runs in **demo mode** with pre-built fitness responses for testing the UI.

---

## 📄 License

MIT — Built for the IBM Cloud Fitness Buddy Challenge.
