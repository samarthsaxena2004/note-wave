# 🌊 NoteWave

**NoteWave** is an AI-powered "Second Brain" and immersive research ecosystem. It transforms static PDF documents into dynamic knowledge graphs, interactive research studios, and voice-enabled learning environments.

Built with **Next.js 16 (Turbopack)**, NoteWave utilizes high-integrity LLM orchestration, vector search, and real-time audio processing to redefine document interaction.

## ⚠️ Important Notice

**It is strongly recommended to run this application locally.**

The publicly deployed version is intended as a portfolio demo. Because it relies on free-tier API keys (Groq & ElevenLabs), it may be **rate-limited**, become unavailable, or run out of credits without notice. Running it locally gives you full control and guarantees data privacy.

---

## 🚀 The Intelligence Studios (v4.0)

NoteWave is organized into specialized "Studios," each designed for a specific cognitive task:

* **📄 RAG-Powered Chat:** Professional document analysis with semantic source citing using **Pinecone** and **Groq (Llama 3.3 70B)**.
* **🎙️ Podcast Studio:** Generates an engaging audio deep-dive conversation between AI hosts. Supports MP3 downloads and real-time script tracking.
* **🧠 Flashcard Studio:** AI-driven concept extraction with a 3D flip UI and "Creator Mode" for manual additions.
* **⚡ Knowledge Graph:** A **3D Force-Directed Graph** that visualizes the relationship between concepts found in your research.
* **⚖️ Agentic Debate:** A multi-persona research environment where *Dr. Skeptic*, *The Weaver*, and *Veritas* debate the core thesis of your files.
* **🛡️ Verified Vault:** An integrity auditor that scans documents for bias, logical fallacies, and "hallucination" scores.
* **📝 Quiz Studio:** Adaptive learning module that generates custom assessments and provides detailed mastery reports.
* **🎤 Voice Immersion:** A hands-free mode using **Deepgram Nova-2** for speech-to-text and **OpenAI TTS-1** for neural voice replies.

---

## ✨ Immersive Features

* **Adaptive Settings Studio:** Houses a **Bio-Adaptive Profile** that tracks cognitive load and suggests learning styles (Kinesthetic, Visual, etc.).
* **Focus Mode:** A UI transformation that dims background elements and simplifies the workspace for deep work.
* **Command Orchestration:** A global `/` command palette with full keyboard navigation for instant studio switching.
* **Local Persistence:** All session settings and document metadata are synced to `localStorage` for privacy-first continuity.

---

## 📸 Interface Preview

### 1. The Dashboard (3-Column Active State)
The interface features a centered chat with resizable sidebars for source management and learning studios.

![NoteWave Dashboard](https://github.com/samarthsaxena2004/note-wave/blob/main/public/active-state.png)

### 2. Studio Hub (Zero State)
A professional directory that guides users through the available AI specialized tools.

![NoteWave Landing](https://github.com/samarthsaxena2004/note-wave/blob/main/public/zero-state.png)

---

## 🛠️ Tech Stack

* **Core:** [Next.js 16](https://nextjs.org/), TypeScript, Tailwind CSS, Shadcn/UI
* **Intelligence:** Llama 3.3 70B via **Groq**
* **Vector Engine:** **Pinecone** (Serverless)
* **Embeddings:** Hugging Face (`all-MiniLM-L6-v2`)
* **Voice STT:** **Deepgram** Nova-2 (Sub-300ms latency)
* **Voice TTS:** **OpenAI** TTS-1 / ElevenLabs
* **Spatial UI:** `react-force-graph-3d` & Three.js

## 🧠 System Architecture

1.  **Ingestion Pipeline:** PDF text is semantically split, vectorized, and stored in Pinecone with strict filename filtering.
2.  **Hardened Chat Logic:** The AI assistant uses a high-integrity system prompt to prevent hallucinations and maintain academic rigor.
3.  **Flashcard Generation:** AI identifies key concepts and definitions from context to generate interactive study decks.
4.  **Command Orchestration:** A custom `/` command palette with keyboard navigation (Up/Down/Enter) allows users to swap studios instantly.

## 🧪 Challenges & Learnings

* **Streaming Synchronization:** Solved "text stuttering" in streaming responses by implementing an accumulator pattern and `TextDecoder` stream handling.
* **Layout Fluidity:** Engineered a resizable sidebar system that maintains perfectly straight header margins across three columns.
* **Conversational Awareness:** Fine-tuned the system prompt to handle professional greetings (e.g., "Hello") while maintaining strict document-only research integrity.
---

## 🚀 How to Run Locally

1.  **Clone & Install:**
    ```bash
    git clone [https://github.com/samarthsaxena2004/note-wave.git](https://github.com/samarthsaxena2004/note-wave.git)
    cd note-wave
    npm install
    ```

2.  **Environment Variables (`.env.local`):**
    ```env
    GROQ_API_KEY=your_key
    PINECONE_API_KEY=your_key
    PINECONE_INDEX_NAME=note-wave
    HUGGINGFACE_API_KEY=your_key
    DEEPGRAM_API_KEY=your_key
    OPENAI_API_KEY=your_key
    ELEVENLABS_API_KEY=your_key
    ```

3.  **Install Radix Primitives (If missing):**
    ```bash
    npx shadcn-ui@latest add switch progress dialog badge
    ```

4.  **Run:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Troubleshooting:** If the application fails due to a retired model or deprecated API call, please refer to the comprehensive debugging steps in the [`MAINTENANCE_GUIDE.md`](MAINTENANCE_GUIDE.md) file in the repository root.
---

## 🔮 Roadmap

- [x] **Phase 3 (Personalization):** Quiz Studio, Mastery Tracking, and Settings Studio.
- [x] **Phase 4 (Immersion):** Functional Voice-to-Concept (V2C) and Neural TTS.
- [ ] **Phase 5 (Synthesis):** Recursive multi-document summaries and Insight Export (PDF/Markdown).
- [ ] **Phase 6 (Sovereignty):** Cloud Sync via Supabase and user authentication.
- [ ] **Phase 7 (Neural Performance):** Edge deployment and local LLM fallback (Ollama).

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for features (e.g., persistent database storage, user authentication), feel free to fork the repo and submit a PR.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 🙏 Acknowledgements

* **Project Blueprint:** Inspired by **Google NotebookLM**'s core research and application design.
* **Architectural Guidance:** Strategic design, debugging, and quality assurance provided by the **Gemini 2.5 Flash** AI assistant.

### Crafted with ❤️ by [Samarth Saxena](https://samarthsaxena.dev/)
