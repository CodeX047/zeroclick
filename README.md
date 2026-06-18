# ZeroClick

ZeroClick is a unified, AI-powered command center that brings **Gmail** and **Google Calendar** together into one keyboard-first, intelligent interface. Instead of clicking through tabs and manually copying information, users can manage their inbox, draft responses, schedule events, check conflicts, and trigger workflows instantly.

Live Website: [https://zeroclick-xi.vercel.app](https://zeroclick-xi.vercel.app)

Special thanks to [Corsair](https://corsair.dev/) for providing the integration SDK that connects Gmail and Google Calendar to our AI engine. It was a huge help in building this project!

---

## Key Features

- **Intelligent Command Bar**  
  An interactive, command-line interface powered by Gemini to handle natural language commands (e.g., _"Summarize my unread emails"_ or _"Schedule a meeting tomorrow at 11 AM"_).

- **Google Calendar Conflict Detection**  
  Automatic checking of calendar conflicts before booking new events. If there is an overlap, the AI automatically computes and suggests three alternative free slots.

- **Spacious Email Inbox & Full Body Preview**  
  Browse emails in a list sorted chronologically and view their full HTML or plain text bodies inside an isolated, theme-aware sandboxed iframe.

- **AI Suggestion Pills**  
  Quickly click actions on any selected email inside the preview panel (e.g., **Summarize**, **Reply**, **Create Meeting**) to get instant AI-generated drafts and details.

- **Interactive Full Calendar Panel**  
  Upgrade over static calendar UIs supporting **Month**, **Week**, and **Day** views, calendar navigation controls (Prev, Next, Today), and timezone-safe, absolute-positioned event rendering.

- **Google Verification Compliant**  
  Public-facing, detailed **Privacy Policy** (`/privacy`) and **Terms of Service** (`/terms`) linked across sign-in/sign-up pages and landing footers.

- **Secure Authentication & Management**  
  Integrated authentication via Clerk. Includes secure Sign Out controls directly in the settings panel.

---

## Tech Stack

- **Frontend Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Vanilla CSS & utility components)
- **Authentication:** Clerk
- **API Integrations:** Google Workspace API via Corsair SDK
- **UI Icons:** Lucide React
- **Markdown Rendering:** React Markdown

---

## Local Development

### 1. Prerequisites

Ensure you have Node.js and `pnpm` installed on your machine. You will also need a `.env` file in the root directory containing your API credentials (Clerk publishable keys, secret keys, Corsair variables, etc.).

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for Production

To build the optimized production bundle:

```bash
pnpm build
```

To run the built production code locally:

```bash
pnpm start
```
