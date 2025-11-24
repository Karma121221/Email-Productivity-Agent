# Ocean AI - Prompt-Driven Email Productivity Agent

A sophisticated, intelligent email productivity system that uses **AI-powered prompt engineering** to categorize emails, extract action items, and draft professional replies. Built with React, Python Flask, and Google Gemini AI.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Complete File Structure](#complete-file-structure)
4. [Technology Stack](#technology-stack)
5. [Setup Instructions](#setup-instructions)
6. [Running the Application](#running-the-application)
7. [Features & Usage](#features--usage)
8. [Prompt Configuration](#prompt-configuration)
9. [API Documentation](#api-documentation)
10. [Data Flow & Processing](#data-flow--processing)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## 📖 Project Overview

### What is Ocean AI?

Ocean AI is a **prompt-driven email productivity agent** that automates email management tasks using Large Language Models (LLMs). Instead of hardcoded rules, the system uses customizable AI prompts to:

- **Categorize emails** (Important, Newsletter, Spam, To-Do)
- **Extract action items** with deadlines and priorities
- **Draft intelligent replies** based on email context
- **Enable chat-based inbox interaction** for queries and commands

### Why Prompt-Driven?

Traditional email automation uses rigid rules. Ocean AI uses **flexible AI prompts** that can be edited by users to match their specific needs. Change a prompt, and the AI's behavior changes instantly—no code required.

### Key Use Cases

1. **Inbox Zero**: Automatically categorize and prioritize emails
2. **Task Management**: Extract actionable items from emails automatically
3. **Reply Assistance**: Generate professional reply drafts in seconds
4. **Email Intelligence**: Chat with your inbox to find information quickly

---

## 🏗️ Architecture & Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  (React 18 + Vite + Tailwind CSS + Zustand)                 │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Inbox    │  │  Prompts   │  │    Chat    │           │
│  │    Tab     │  │    Tab     │  │    Tab     │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         │              │                 │                  │
│         └──────────────┴─────────────────┘                  │
│                        │                                    │
│                 ┌──────▼──────┐                            │
│                 │  Zustand    │                            │
│                 │   Store     │                            │
│                 └──────┬──────┘                            │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTP/Fetch
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Flask)                          │
│                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  API Routes │───▶│   Services   │───▶│  LLM Service │  │
│  │ (index.py)  │    │(email/chat)  │    │   (Gemini)   │  │
│  └─────────────┘    └──────────────┘    └──────────────┘  │
│         │                                        │          │
│         ▼                                        ▼          │
│  ┌─────────────┐                      ┌──────────────────┐ │
│  │    Data     │                      │  Google Gemini   │ │
│  │   Storage   │                      │      API         │ │
│  │ (JSON Files)│                      └──────────────────┘ │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Design Philosophy

**3-Phase Architecture:**
1. **Phase 1: Ingestion** - Load emails and configure prompts
2. **Phase 2: Processing** - Categorize and extract with LLM
3. **Phase 3: Interaction** - Chat interface and draft generation

**Separation of Concerns:**
- **UI Components** (React) - Presentation layer
- **State Management** (Zustand) - Global state
- **Services** (Python) - Business logic
- **LLM Integration** (Gemini API) - AI processing

---

## 📁 Complete File Structure

```
Ocean AI/
│
├── 📂 frontend/                    # React Frontend Application
│   ├── 📂 src/
│   │   ├── 📂 components/          # UI Components
│   │   │   ├── InboxTab.jsx        # Email list and detail view
│   │   │   ├── PromptsTab.jsx      # Prompt configuration UI
│   │   │   ├── ChatTab.jsx         # AI chat interface
│   │   │   ├── DraftsTab.jsx       # Draft management UI
│   │   │   ├── EmailCard.jsx       # Individual email card
│   │   │   ├── EmailDetail.jsx     # Detailed email view
│   │   │   ├── PromptCard.jsx      # Prompt editor card
│   │   │   ├── Layout.jsx          # Main layout wrapper
│   │   │   ├── Header.jsx          # Application header
│   │   │   └── 📂 ui/              # Reusable UI components (shadcn/ui)
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── tabs.jsx
│   │   │       ├── badge.jsx
│   │   │       ├── separator.jsx
│   │   │       ├── skeleton.jsx
│   │   │       ├── textarea.jsx
│   │   │       ├── label.jsx
│   │   │       ├── accordion.jsx
│   │   │       └── dropdown-menu.jsx
│   │   │
│   │   ├── 📂 store/               # State Management
│   │   │   └── useStore.js         # Zustand global state store
│   │   │
│   │   ├── 📂 contexts/            # React Contexts
│   │   │   └── ToastContext.jsx    # Toast notification system
│   │   │
│   │   ├── 📂 lib/                 # Utilities
│   │   │   └── utils.js            # Helper functions (cn, etc.)
│   │   │
│   │   ├── App.jsx                 # Root application component
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles (Tailwind)
│   │
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── jsconfig.json               # JavaScript path aliases
│   └── components.json             # shadcn/ui configuration
│
├── 📂 api/                         # Python Flask Backend
│   ├── 📂 services/                # Business Logic Services
│   │   ├── llm_service.py          # Google Gemini API integration
│   │   ├── email_processor.py      # Email categorization & action extraction
│   │   ├── chat_service.py         # Chat query processing
│   │   └── __init__.py             # Package initializer
│   │
│   ├── 📂 data/                    # Data Storage (JSON)
│   │   ├── mock_inbox.json         # 15 sample emails
│   │   ├── default_prompts.json    # Default AI prompts
│   │   └── drafts.json             # Saved email drafts
│   │
│   ├── index.py                    # Flask app & API routes
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Environment variables (API key)
│
├── vercel.json                     # Vercel deployment config
├── package.json                    # Root convenience scripts
├── README.md                       # This file
└── .gitignore                      # Git ignore rules
```

---

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose | Why We Use It |
|------------|---------|---------|---------------|
| **React** | 18.3.1 | UI Framework | Component-based architecture, efficient rendering |
| **Vite** | 5.4.11 | Build Tool | Lightning-fast HMR, modern ES modules |
| **Tailwind CSS** | 3.4.17 | Styling | Utility-first, rapid UI development |
| **Zustand** | 5.0.8 | State Management | Simple, minimal boilerplate vs Redux |
| **Lucide React** | 0.554.0 | Icons | Beautiful, consistent icon library |
| **Radix UI** | Various | UI Primitives | Accessible, unstyled components |
| **shadcn/ui** | Custom | Component Library | Beautiful pre-built components |

### Backend Technologies

| Technology | Version | Purpose | Why We Use It |
|------------|---------|---------|---------------|
| **Python** | 3.9+ | Backend Language | Easy integration with AI libraries |
| **Flask** | 3.1.0 | Web Framework | Lightweight, perfect for APIs |
| **Flask-CORS** | 5.0.0 | CORS Handling | Enable cross-origin requests |
| **Google Gemini** | 0.8.3 | LLM Service | Powerful, cost-effective AI |
| **python-dotenv** | 1.0.1 | Environment Vars | Secure API key management |

### Development Tools

- **pnpm** - Fast, efficient package manager
- **Vercel** - Serverless deployment platform
- **Git** - Version control

---

## ⚙️ Setup Instructions

### Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **pnpm** (Package manager)
   - Install: `npm install -g pnpm`
   - Check: `pnpm --version`

3. **Python** (v3.9 or higher)
   - Check: `python --version` or `python3 --version`
   - Download: https://www.python.org/

4. **pip** (Python package manager)
   - Comes with Python
   - Check: `pip --version`

5. **Google Gemini API Key** (for AI features)
   - Get free key: https://makersuite.google.com/app/apikey
   - Free tier: 60 requests/minute

### Step-by-Step Setup

#### Step 1: Clone/Download the Project

```bash
# If using Git
git clone <repository-url>
cd "Ocean AI"

# Or download and extract ZIP, then navigate to folder
```

#### Step 2: Install Frontend Dependencies

```bash
cd frontend
pnpm install
```

**What this does:**
- Installs React, Vite, Tailwind CSS, and all UI libraries
- Downloads ~500MB of node_modules
- Takes 1-3 minutes depending on internet speed

**Expected output:**
```
Progress: resolved 312, reused 312, downloaded 0, added 312, done
```

#### Step 3: Install Backend Dependencies

```bash
cd ../api
pip install -r requirements.txt
```

**What this installs:**
- Flask (web server)
- Flask-CORS (cross-origin support)
- google-generativeai (Gemini AI SDK)
- python-dotenv (environment variables)

**Expected output:**
```
Successfully installed Flask-3.1.0 flask-cors-5.0.0 google-generativeai-0.8.3 python-dotenv-1.0.1
```

#### Step 4: Configure Environment Variables

Create a `.env` file in the `api/` directory:

```bash
# In api/ directory
touch .env  # Linux/Mac
# or
type nul > .env  # Windows
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
MOCK_LLM=false
```

**Getting Your API Key:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Paste into `.env` file

**Mock Mode (Optional):**
If you don't have an API key yet, set `MOCK_LLM=true` to use simulated responses:

```env
GEMINI_API_KEY=
MOCK_LLM=true
```

#### Step 5: Verify Data Files

Ensure these files exist in `api/data/`:

```bash
api/data/
├── mock_inbox.json       # ✓ Should have 15 emails
├── default_prompts.json  # ✓ Should have 3 prompt templates
└── drafts.json           # ✓ Can be empty []
```

If `drafts.json` doesn't exist, create it:

```bash
echo [] > api/data/drafts.json
```

---

## 🚀 Running the Application

### Local Development (Recommended)

You need **two terminal windows** running simultaneously:

#### Terminal 1: Start Backend Server

```bash
cd api
python index.py
```

**Expected output:**
```
✓ Gemini API initialized successfully
 * Serving Flask app 'index'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

**What this does:**
- Starts Flask development server on port 5000
- Initializes Gemini API connection
- Loads email and prompt data into memory
- Enables hot-reload (auto-restart on file changes)

**Troubleshooting:**
- Port 5000 in use? Change port in `index.py`: `app.run(debug=True, port=5001)`
- API key error? Check `.env` file format
- Import errors? Reinstall: `pip install -r requirements.txt`

#### Terminal 2: Start Frontend Server

```bash
cd frontend
pnpm run dev
```

**Expected output:**
```
  VITE v5.4.11  ready in 423 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**What this does:**
- Starts Vite development server on port 3000
- Enables Hot Module Replacement (HMR) for instant updates
- Proxies `/api/*` requests to backend (port 5000)
- Opens browser automatically (optional)

**Troubleshooting:**
- Port 3000 in use? Vite auto-selects 3001, 3002, etc.
- Blank screen? Check browser console (F12) for errors
- Module errors? Delete `node_modules` and reinstall

### Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

You should see:
- **Header** with "Ocean AI" and wave icon
- **Tab Navigation**: Inbox | Prompts | Chat | Drafts
- **Process Inbox** button in header
- **Inbox** tab showing "Loading..." then 15 emails

### Verify Everything Works

**Quick Test Checklist:**

1. ✅ **Backend Health Check**
   - Visit: http://localhost:5000/api/hello
   - Should see: `{"message": "Hello from Ocean AI Backend!", "status": "success"}`

2. ✅ **Frontend Loads**
   - Visit: http://localhost:3000
   - No errors in browser console (F12)
   - Emails appear in Inbox tab

3. ✅ **Email Loading**
   - Inbox tab shows 15 emails
   - Toast notification: "Inbox loaded"

4. ✅ **Email Selection**
   - Click any email
   - Detail panel slides in from right
   - Close button (X) works

5. ✅ **Prompt Configuration**
   - Click "Prompts" tab
   - See 3 prompt cards (Categorization, Action Extraction, Auto-Reply)
   - Edit a prompt and save

6. ✅ **Process Inbox**
   - Click "Process Inbox" button (header)
   - Shows loading spinner
   - Emails get category badges
   - Action items appear under emails

7. ✅ **Chat Interface**
   - Click "Chat" tab
   - See empty state with suggested queries
   - Type "Summarize this email" (select an email first)
   - Get AI response

---

## 📚 Features & Usage

### Feature 1: Email Inbox Management

**Purpose:** View, browse, and select emails from your inbox.

**How to Use:**

1. **Navigate to Inbox Tab** (default view on load)

2. **Browse Emails:**
   - Scroll through list of 15 sample emails
   - Each card shows:
     - Sender name and email
     - Subject line
     - Body preview (truncated)
     - Timestamp (relative, e.g., "2 days ago")
     - Category badge (after processing)
     - Action items count

3. **Select an Email:**
   - Click any email card
   - Detail panel slides in from right
   - Inbox list narrows to 40% width
   - See full email content

4. **Read Email Details:**
   - Full sender information
   - Complete subject
   - Entire email body
   - Attachment indicator (if any)
   - Action items accordion (expandable)
   - Reply/Archive/More buttons

5. **Close Detail View:**
   - Click "X Close" button (top right)
   - Detail panel slides out
   - Inbox returns to full width

**Technical Details:**
- Component: `InboxTab.jsx`, `EmailCard.jsx`, `EmailDetail.jsx`
- State: Managed by Zustand store (`emails`, `selectedEmail`)
- API: `GET /api/emails/load` - Fetches mock inbox JSON
- Animation: Smooth transitions with Tailwind CSS

---

### Feature 2: Process Inbox (AI Categorization)

**Purpose:** Automatically categorize all emails and extract action items using AI.

**How to Use:**

1. **Click "Process Inbox"** button in header

2. **Watch Progress:**
   - Button shows loading spinner
   - Disabled during processing
   - Takes 5-10 seconds

3. **View Results:**
   - Each email gets a category badge:
     - 🔴 **Important** - Urgent emails, key stakeholders
     - 📰 **Newsletter** - Promotional content, updates
     - 🗑️ **Spam** - Unsolicited, suspicious emails
     - ✅ **To-Do** - Action requests, tasks
   - Action items appear under Important/To-Do emails
   - Toast notification: "Processed 15 emails!"

**How It Works (Under the Hood):**

```
User clicks "Process Inbox"
    ↓
Frontend sends: POST /api/emails/process
    - emails: [array of email objects]
    - prompts: {categorization, actionExtraction}
    ↓
Backend (email_processor.py):
    1. Build batch prompt with ALL emails
    2. Call Gemini API ONCE for categorization
    3. Parse JSON response → map categories to emails
    4. Build batch prompt for Important/To-Do emails
    5. Call Gemini API ONCE for action extraction
    6. Parse JSON response → map actions to emails
    7. Return results
    ↓
Frontend updates:
    - Store categories in emails array
    - Store action items in emails array
    - Re-render email cards with badges
    - Show toast notification
```

**Technical Details:**
- **Optimization:** Uses batch processing (2 API calls vs 30+)
- **Prompt:** Uses user-configured categorization prompt
- **Error Handling:** Gracefully handles API failures
- **Fallback:** Mock mode works without API key

---

### Feature 3: Prompt Configuration

**Purpose:** Customize AI behavior by editing prompts that control categorization, action extraction, and reply generation.

**How to Use:**

1. **Navigate to Prompts Tab**

2. **View Prompt Cards:**
   - **Email Categorization** - Controls how emails are categorized
   - **Action Item Extraction** - Controls what tasks are identified
   - **Auto-Reply Draft Generation** - Controls reply style and tone

3. **Edit a Prompt:**
   - Click inside the large textarea
   - Modify instructions, add rules, change tone
   - Example edits:
     ```
     Original: "Categorize emails into: Important, Newsletter, Spam, To-Do."
     
     Custom: "Categorize emails into: Important, Newsletter, Spam, To-Do.
              Mark emails from my boss (sarah@company.com) as Important.
              Any email with 'URGENT' in subject should be Important."
     ```

4. **Save Changes:**
   - Click "Save All Changes" button (bottom right)
   - Prompts saved to browser localStorage
   - Also synced to Zustand store
   - Toast: "All prompts saved successfully!"

5. **Reset to Defaults:**
   - Click "Reset to Defaults" button (individual card)
   - Or "Reset All to Defaults" button (bottom left)
   - Confirms before resetting
   - Fetches original prompts from `default_prompts.json`

**Prompt Engineering Tips:**

**Good Prompt:**
```
Categorize emails into: Important, Newsletter, Spam, To-Do.

Rules:
- Important: Emails from CEO, urgent matters, project deadlines
- Newsletter: Marketing emails, weekly digests, subscriptions
- Spam: Promotional offers, suspicious links, unsolicited
- To-Do: Direct action requests, meeting invites, review requests

Respond with ONLY the category name.
```

**Bad Prompt:**
```
Can you please categorize this email? Maybe put it in one of these categories if you think it fits: important or spam or whatever. Thanks!
```

**Why Good Prompts Matter:**
- Clear instructions → consistent results
- Specific rules → accurate categorization
- Structured output → easy parsing
- Concise format → faster processing

**Technical Details:**
- **Storage:** Browser localStorage (persists across sessions)
- **Sync:** Zustand store for global access
- **API:** Fetches defaults from `GET /api/data/default_prompts.json`
- **Format:** JSON with `{name, description, prompt}` structure

---

### Feature 4: Email Agent Chat

**Purpose:** Interact with your inbox through natural language queries. Ask questions, get summaries, draft replies.

**How to Use:**

1. **Navigate to Chat Tab**

2. **Select an Email (Optional):**
   - Go to Inbox tab
   - Click an email
   - Return to Chat tab
   - See "Context: Discussing [email subject]" banner

3. **Type a Query:**
   - Example queries:
     - "Summarize this email"
     - "What tasks do I need to do?"
     - "Draft a reply to this email"
     - "Show me all important emails"
     - "What does this email want me to do?"

4. **Send Query:**
   - Click Send button or press Enter
   - Agent processes query with AI
   - Response appears in chat bubble

5. **View Response:**
   - Bot messages: Gray background, left side
   - Your messages: Blue background, right side
   - Timestamp below each message

6. **Suggested Queries (Empty State):**
   - When chat is empty, see 4 suggested queries
   - Click any to auto-fill input
   - Great for learning what the agent can do

**Query Types & Examples:**

| Query Type | Example | What Happens |
|------------|---------|--------------|
| **Summarize** | "Summarize this email" | AI extracts key points in 2-3 sentences |
| **Tasks** | "What tasks do I need to do?" | Lists all action items from email(s) |
| **Draft Reply** | "Draft a reply to this email" | Generates professional reply, saves to Drafts |
| **Filter** | "Show me all important emails" | Lists emails by category |
| **General** | "Who sent me the most emails?" | AI analyzes inbox data |

**Chat Routing Logic:**

The chat service intelligently routes queries:

```
User Query → Chat Service Analyzer
    ↓
Is it a draft request? (keywords: draft, reply, respond)
    → Generate draft using auto-reply prompt
    → Save to Drafts tab
    → Return confirmation message
    ↓
Is it a summarize request? (keywords: summarize, tldr, brief)
    → Build summarization prompt with email content
    → Call Gemini API
    → Return summary
    ↓
Is it a task request? (keywords: tasks, to-do, action items)
    → Extract action items from email(s)
    → Format as bulleted list
    → Return task list
    ↓
Is it a filter request? (keywords: show, list, important, spam)
    → Filter emails by category
    → Return filtered list
    ↓
General query?
    → Build context with email/inbox data
    → Call Gemini API with general instruction
    → Return AI response
```

**Context Awareness:**

- **With Email Selected:** Agent knows email details (sender, subject, body)
- **Without Email:** Agent can query entire inbox
- **Clear Context:** Click "Clear Chat" to remove context and start fresh

**Technical Details:**
- **Component:** `ChatTab.jsx`
- **Service:** `chat_service.py` - Query routing logic
- **State:** Zustand store (`chatMessages`, `selectedEmail`)
- **API:** `POST /api/chat/query`
- **Auto-scroll:** Messages auto-scroll to bottom

---

### Feature 5: Draft Management

**Purpose:** Generate, edit, save, and manage email reply drafts.

**How to Use:**

1. **Generate a Draft:**
   - Go to Chat tab
   - Select an email
   - Type: "Draft a reply to this email"
   - Draft automatically saved
   - Toast: "Draft saved - You can find it in the Drafts tab"

2. **View Drafts:**
   - Navigate to Drafts tab
   - See list of all generated drafts
   - Each card shows:
     - Subject line
     - Body preview
     - Creation timestamp
     - Original email context

3. **Edit a Draft:**
   - Click "Edit" button on draft card
   - Subject and body become editable
   - Modify text as needed
   - Click "Save Changes"
   - Toast: "Draft updated successfully"

4. **Delete a Draft:**
   - Click "Delete" button (trash icon)
   - Draft immediately removed
   - Toast: "Draft deleted"

5. **Send Draft (Manual):**
   - Drafts are never auto-sent (safety feature)
   - Copy draft content to your email client
   - Review before sending
   - Send manually

**Draft Structure:**

```json
{
  "id": "draft-email-001-1637284920",
  "originalEmailId": "email-001",
  "subject": "Re: Q4 Planning Meeting - Action Required",
  "body": "Hi Sarah,\n\nThank you for the meeting invitation...",
  "createdAt": 1637284920,
  "metadata": {
    "originalSender": "Sarah Johnson",
    "originalSubject": "Q4 Planning Meeting",
    "category": "Important"
  }
}
```

**Technical Details:**
- **Storage:** `api/data/drafts.json` (persistent)
- **API Endpoints:**
  - `GET /api/drafts` - Fetch all drafts
  - `POST /api/drafts` - Save/update draft
  - `DELETE /api/drafts/<id>` - Delete draft
- **Component:** `DraftsTab.jsx`
- **State:** Zustand store (`drafts`)

---

## 🎯 Prompt Configuration

### Understanding Prompts

**Prompts** are instructions you give to the AI. They control:
- **What** the AI looks for (keywords, patterns)
- **How** it categorizes or extracts information
- **Format** of the output (JSON, text, bullets)

### Default Prompts

#### 1. Email Categorization Prompt

**Purpose:** Determines how emails are classified into categories.

**Default Prompt:**
```
You are an email categorization assistant. Categorize the following email into exactly ONE of these categories:

- Important: Emails requiring urgent attention, from key stakeholders, or containing critical information
- Newsletter: Promotional content, updates, subscriptions, or marketing emails
- Spam: Unsolicited emails, suspicious content, or potential phishing attempts
- To-Do: Emails containing direct action requests, tasks, or items requiring follow-up

Analyze the email content, sender, and subject line. Respond with ONLY the category name (Important, Newsletter, Spam, or To-Do), nothing else.
```

**When It's Used:**
- When user clicks "Process Inbox" button
- Before action item extraction (determines which emails need actions)

**Customization Examples:**

**Example 1: Prioritize Boss Emails**
```
...existing prompt...

Additional Rules:
- ANY email from sarah.johnson@company.com should be marked Important
- Emails with "CEO" or "URGENT" in subject are Important
```

**Example 2: Custom Categories** (requires code change)
```
Categorize into: Critical, Normal, Promotional, Junk

- Critical: Urgent or from leadership
- Normal: Regular work emails
- Promotional: Marketing and newsletters
- Junk: Spam and unwanted
```

#### 2. Action Item Extraction Prompt

**Purpose:** Identifies tasks and to-dos from email content.

**Default Prompt:**
```
Extract all actionable tasks from this email. For each task, identify:
- The specific task or action required
- Any deadline mentioned (use 'none' if not specified)
- Priority level (high, medium, or low)

Respond ONLY with valid JSON in this exact format:
[
  {"task": "description of task", "deadline": "date or 'none'", "priority": "high/medium/low"}
]

If no tasks exist, respond with an empty array: []

Do not include any explanation or additional text, only the JSON array.
```

**When It's Used:**
- After categorization, for "Important" and "To-Do" emails only
- Results appear in email detail view under "Action Items" accordion

**Customization Examples:**

**Example 1: Stricter Task Detection**
```
Extract actionable tasks ONLY if they are explicit action requests.

Criteria:
- Must contain action verbs: "please review", "need to", "must complete"
- Ignore vague statements like "let me know your thoughts"
- Each task must be specific and measurable

...rest of format instructions...
```

**Example 2: Add Context Field**
```
Respond with JSON format:
[
  {
    "task": "description",
    "deadline": "date or 'none'",
    "priority": "high/medium/low",
    "context": "relevant email section"
  }
]
```

#### 3. Auto-Reply Draft Generation Prompt

**Purpose:** Controls tone, style, and content of generated email replies.

**Default Prompt:**
```
Generate a professional email reply based on the email content and context.

Guidelines:
- Be polite, concise, and professional
- Match the tone of the original email
- If it's a meeting request, ask for an agenda and confirm availability
- If it's a task request, acknowledge receipt and provide an estimated timeline
- If it's informational, acknowledge and ask relevant follow-up questions if needed
- Keep the reply under 150 words
- Use proper email formatting

Provide the reply in this exact format:
Subject: Re: [original subject]

Body:
[your professional reply here]

Do not include any explanation before or after the email draft.
```

**When It's Used:**
- When user types "draft a reply" in Chat
- When clicking "Reply" button (if implemented)

**Customization Examples:**

**Example 1: Casual Tone**
```
Generate a friendly, casual email reply.

Guidelines:
- Use conversational tone
- Keep it short and to the point
- Use contractions (I'm, don't, can't)
- Skip formal greetings like "Dear Sir/Madam"
- End with casual sign-offs like "Thanks!" or "Cheers!"

...rest of format...
```

**Example 2: Executive Style**
```
Generate a brief, executive-style email reply.

Guidelines:
- Maximum 3 sentences
- Direct and action-oriented
- No small talk
- Focus on decisions or next steps
- Use bullet points if multiple items

...rest of format...
```

### Prompt Best Practices

**DO:**
- ✅ Be specific about expected output format
- ✅ Provide clear category definitions
- ✅ Include examples for complex extractions
- ✅ Use structured formats (JSON, bullet points)
- ✅ Test prompts with various email types

**DON'T:**
- ❌ Use vague instructions ("do a good job")
- ❌ Make prompts too long (>1000 words)
- ❌ Include contradictory rules
- ❌ Forget to specify output format
- ❌ Use overly casual language for serious tasks

---

## 🔌 API Documentation

### Base URL

**Local Development:**
```
http://localhost:5000/api
```

**Production (Vercel):**
```
https://your-app.vercel.app/api
```

### Endpoints

#### 1. Health Check

**GET** `/api/hello`

**Description:** Simple health check endpoint.

**Response:**
```json
{
  "message": "Hello from Ocean AI Backend!",
  "status": "success"
}
```

---

#### 2. Get System Status

**GET** `/api/status`

**Description:** Returns backend status and version.

**Response:**
```json
{
  "status": "online",
  "version": "1.0.0"
}
```

---

#### 3. Get Default Prompts

**GET** `/api/data/default_prompts.json`

**Description:** Fetches default prompt templates.

**Response:**
```json
{
  "categorization": {
    "name": "Email Categorization",
    "description": "Categorizes emails into predefined categories",
    "prompt": "You are an email categorization assistant..."
  },
  "actionExtraction": { ... },
  "autoReply": { ... }
}
```

---

#### 4. Load Mock Inbox

**GET** `/api/emails/load`

**Description:** Loads sample emails from mock inbox.

**Response:**
```json
{
  "success": true,
  "emails": [
    {
      "id": "email-001",
      "sender": "sarah.johnson@techcorp.com",
      "senderName": "Sarah Johnson",
      "subject": "Q4 Planning Meeting - Action Required",
      "body": "Hi Team...",
      "timestamp": "2025-11-20T09:15:00Z",
      "category": null,
      "actionItems": [],
      "isRead": false,
      "hasAttachments": true
    },
    ...
  ],
  "count": 15
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

#### 5. Process Emails (AI Categorization)

**POST** `/api/emails/process`

**Description:** Batch process emails with AI categorization and action extraction.

**Request Body:**
```json
{
  "emails": [
    {
      "id": "email-001",
      "sender": "user@example.com",
      "senderName": "User Name",
      "subject": "Meeting Request",
      "body": "Can we meet tomorrow?"
    },
    ...
  ],
  "prompts": {
    "categorization": {
      "prompt": "Categorize into Important, Newsletter, Spam, To-Do..."
    },
    "actionExtraction": {
      "prompt": "Extract action items..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "processed": 15,
  "failed": 0,
  "results": [
    {
      "id": "email-001",
      "category": "Important",
      "actionItems": [
        {
          "task": "Schedule meeting",
          "deadline": "tomorrow",
          "priority": "high"
        }
      ],
      "error": null
    },
    ...
  ],
  "errors": []
}
```

**Processing Logic:**
1. Batch categorize ALL emails (1 API call)
2. Batch extract actions for Important/To-Do emails (1 API call)
3. Return results with categories and action items

---

#### 6. Chat Query

**POST** `/api/chat/query`

**Description:** Process natural language query about inbox or emails.

**Request Body:**
```json
{
  "query": "Summarize this email",
  "emailId": "email-001",
  "emails": [ ... ],
  "prompts": { ... }
}
```

**Parameters:**
- `query` (required): User's question or command
- `emailId` (optional): ID of selected email for context
- `emails` (optional): Array of all emails for general queries
- `prompts` (optional): Prompt configurations

**Response:**
```json
{
  "success": true,
  "response": "This email is a meeting request for Q4 planning...",
  "draft": null
}
```

**Response (Draft Generated):**
```json
{
  "success": true,
  "response": "I've generated a draft reply...",
  "draft": {
    "id": "draft-email-001-1637284920",
    "originalEmailId": "email-001",
    "subject": "Re: Meeting Request",
    "body": "Thank you for reaching out...",
    "createdAt": 1637284920,
    "metadata": { ... }
  }
}
```

---

#### 7. Get Drafts

**GET** `/api/drafts`

**Description:** Fetch all saved email drafts.

**Response:**
```json
{
  "success": true,
  "drafts": [
    {
      "id": "draft-001",
      "subject": "Re: Meeting Request",
      "body": "...",
      "createdAt": 1637284920
    },
    ...
  ],
  "count": 5
}
```

---

#### 8. Save Draft

**POST** `/api/drafts`

**Description:** Save new draft or update existing.

**Request Body:**
```json
{
  "id": "draft-001",
  "subject": "Re: Project Update",
  "body": "Thank you for the update...",
  "originalEmailId": "email-005"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Draft saved successfully",
  "draft": { ... }
}
```

---

#### 9. Delete Draft

**DELETE** `/api/drafts/<draft_id>`

**Description:** Delete a specific draft.

**Response:**
```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

---

## 🔄 Data Flow & Processing

### Email Processing Pipeline

```
┌──────────────────────────────────────────────────────────┐
│  USER ACTION: Click "Process Inbox"                      │
└────────────────────┬─────────────────────────────────────┘
                     ▼
┌──────────────────────────────────────────────────────────┐
│  FRONTEND (App.jsx): handleProcessEmails()               │
│  - Collect emails from Zustand store                     │
│  - Collect prompts from Zustand store                    │
│  - Send POST /api/emails/process                         │
└────────────────────┬─────────────────────────────────────┘
                     ▼
┌──────────────────────────────────────────────────────────┐
│  BACKEND API (index.py): process_emails()                │
│  - Validate request data                                 │
│  - Extract emails and prompts                            │
│  - Call process_emails_batch()                           │
└────────────────────┬─────────────────────────────────────┘
                     ▼
┌──────────────────────────────────────────────────────────┐
│  EMAIL PROCESSOR (email_processor.py):                   │
│  process_emails_batch()                                  │
│                                                           │
│  STEP 1: Batch Categorization                           │
│  ├─ Build single prompt with ALL 15 emails              │
│  ├─ Call Gemini API once                                │
│  ├─ Parse JSON response                                 │
│  └─ Map categories to email IDs                         │
│                                                           │
│  STEP 2: Batch Action Extraction                        │
│  ├─ Filter Important/To-Do emails (e.g., 6 emails)     │
│  ├─ Build single prompt with filtered emails            │
│  ├─ Call Gemini API once                                │
│  ├─ Parse JSON response                                 │
│  └─ Map action items to email IDs                       │
│                                                           │
│  RESULT: 2 API calls instead of 30+ (15×2)             │
└────────────────────┬─────────────────────────────────────┘
                     ▼
┌──────────────────────────────────────────────────────────┐
│  LLM SERVICE (llm_service.py):                          │
│  - generate_json(prompt)                                 │
│  - Call Gemini API: model.generate_content()            │
│  - Parse JSON from response                              │
│  - Return structured data                                │
└────────────────────┬─────────────────────────────────────┘
                     ▼
┌──────────────────────────────────────────────────────────┐
│  BACKEND API: Return response                            │
│  {                                                        │
│    "success": true,                                       │
│    "processed": 15,                                       │
│    "results": [                                           │
│      {"id": "email-001", "category": "Important", ...},  │
│      ...                                                  │
│    ]                                                      │
│  }                                                        │
└────────────────────┬─────────────────────────────────────┘
                     ▼
┌──────────────────────────────────────────────────────────┐
│  FRONTEND: Update UI                                     │
│  - Loop through results                                  │
│  - Update email.category in store                        │
│  - Update email.actionItems in store                     │
│  - Trigger re-render                                     │
│  - Show toast notification                               │
└──────────────────────────────────────────────────────────┘
```

### Chat Query Flow

```
User types: "Draft a reply to this email"
    ↓
ChatTab.jsx: sendQuery()
    ↓
POST /api/chat/query
    - query: "Draft a reply..."
    - emailId: "email-001"
    - emails: [...]
    - prompts: {...}
    ↓
chat_service.py: process_chat_query()
    ↓
Keyword Analysis:
    "draft" keyword detected → Route to _generate_draft()
    ↓
_generate_draft():
    1. Get auto-reply prompt from prompts
    2. Build context with original email
    3. Construct full prompt
    4. Call llm_service.generate_text()
    5. Parse response for subject/body
    6. Create draft object with metadata
    7. Return draft
    ↓
index.py: Save draft to drafts.json
    ↓
Return response:
    {
        "success": true,
        "response": "I've generated a draft...",
        "draft": { ... }
    }
    ↓
ChatTab.jsx:
    - Add message to chat
    - Call addDraft() to update store
    - Show toast notification
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

#### Prerequisites

1. **Vercel Account** (free tier available)
   - Sign up: https://vercel.com/signup

2. **Vercel CLI**
   ```bash
   npm install -g vercel
   ```

#### Deployment Steps

**Step 1: Login to Vercel**
```bash
vercel login
```

**Step 2: Deploy from Root Directory**
```bash
cd "Ocean AI"
vercel
```

**Interactive Prompts:**
```
? Set up and deploy "Ocean AI"? Y
? Which scope? Your Account
? Link to existing project? N
? What's your project's name? ocean-ai-email-agent
? In which directory is your code located? ./
```

**Step 3: Configure Environment Variables**

In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add: `GEMINI_API_KEY` = `your_actual_api_key`
4. Add: `MOCK_LLM` = `false`

**Step 4: Redeploy**
```bash
vercel --prod
```

**Step 5: Access Your App**
```
https://ocean-ai-email-agent.vercel.app
```

#### How Vercel Works

**Frontend Build:**
- Runs `cd frontend && pnpm install && pnpm build`
- Outputs static files to `frontend/dist/`
- Serves as static assets

**Backend (Serverless Functions):**
- Each route in `api/index.py` becomes a serverless function
- Auto-scales on demand
- Cold start: ~1-2 seconds

**Routing:**
- `vercel.json` configures `/api/*` → serverless functions
- All other routes → frontend static files

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Port 5000 already in use"

**Symptoms:** Backend won't start, error message about port.

**Solutions:**
1. Kill process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

2. Change port in `api/index.py`:
   ```python
   app.run(debug=True, port=5001)  # Use 5001 instead
   ```

---

#### Issue: "GEMINI_API_KEY not found"

**Symptoms:** Backend starts with warning, mock mode enabled.

**Solutions:**
1. Check `.env` file exists in `api/` directory
2. Verify format:
   ```env
   GEMINI_API_KEY=AIzaSyD...actual_key_here
   MOCK_LLM=false
   ```
3. Restart backend server
4. Verify key is valid: https://makersuite.google.com/app/apikey

---

#### Issue: Frontend shows blank screen

**Symptoms:** Browser loads but nothing appears.

**Solutions:**
1. Open browser console (F12) and check for errors
2. Common errors:
   - **Module not found:** Delete `node_modules`, reinstall
     ```bash
     rm -rf node_modules pnpm-lock.yaml
     pnpm install
     ```
   - **Port conflict:** Vite will auto-select different port
   - **API connection:** Check backend is running on port 5000

---

#### Issue: Emails not loading

**Symptoms:** Inbox shows "No emails" or loading forever.

**Solutions:**
1. Check backend logs for errors
2. Verify `api/data/mock_inbox.json` exists
3. Test API directly: `curl http://localhost:5000/api/emails/load`
4. Check browser console for fetch errors
5. Verify CORS is enabled (Flask-CORS installed)

---

#### Issue: "Process Inbox" button does nothing

**Symptoms:** Click button, no response or errors.

**Solutions:**
1. Check browser console for errors
2. Verify backend is running
3. Check Gemini API key is configured
4. Test with mock mode: Set `MOCK_LLM=true` in `.env`
5. Check API endpoint: `curl -X POST http://localhost:5000/api/emails/process`

---

#### Issue: Chat doesn't respond

**Symptoms:** Send message, no reply or error.

**Solutions:**
1. Check browser console for errors
2. Verify backend logs for exceptions
3. Ensure Gemini API key is valid
4. Test with simple query: "Hello"
5. Check if email is selected (for email-specific queries)

---

## 📝 File-by-File Detailed Explanation

*(Due to length, this section would continue with detailed explanations of each file's purpose, functions, and code structure. Let me know if you'd like me to continue with specific files.)*

---

## 🤝 Contributing

Contributions welcome! Please follow:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Open pull request

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

## 📧 Support

For issues or questions:
- Open GitHub issue
- Check troubleshooting section
- Review API documentation

---

**Built with ❤️ using React, Python, and Google Gemini AI**
