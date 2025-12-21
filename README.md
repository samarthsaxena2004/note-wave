# 🌊 NoteWave

**NoteWave** is an AI-powered "Second Brain" application inspired by Google's NotebookLM. It transforms static PDF documents into interactive research hubs, engaging audio podcasts, and specialized study tools.

Built as a showcase of bleeding-edge **Full-Stack AI Engineering**, utilizing **Next.js 16**, Vector Search, and high-integrity LLM orchestration.

## ⚠️ Important Notice

**It is strongly recommended to run this application locally.**

The publicly deployed version is intended as a portfolio demo. Because it relies on free-tier API keys (Groq & ElevenLabs), it may be **rate-limited**, become unavailable, or run out of credits without notice. Running it locally gives you full control and guarantees data privacy.

---

## 🚀 What It Does (v2.0)

* **📄 RAG-Powered Chat:** Upload any PDF and chat with it. The AI cites its sources by finding relevant context using Vector Search (Pinecone).
* **🎙️ Podcast Studio:** Generates a scripted "Deep Dive" audio conversation between two AI hosts who discuss the uploaded content.
* **🧠 Flashcard Studio:** AI-driven concept extraction with a custom 3D flip UI. Includes a **Creator Mode** for adding manual study cards.
* **✨ Studio Hub (Zero Stage):** A specialized landing state for the sidebar that showcases available AI tools and their capabilities when no tool is active.
* **↔️ Fluid 3-Column Layout:** A modern UI where the Chat Assistant remains centered while sidebars can be collapsed or expanded (Wide Mode) for deep focus.
* **⚡ High-Integrity Assistant:** A hardened system prompt ensures the AI remains professional, honest, and resistant to adversarial "jailbreak" attempts.

## 📸 Interface Preview

### 1. The Dashboard (3-Column Active State)
The interface features a centered chat with resizable sidebars for source management and learning studios.

![NoteWave Dashboard](https://github.com/samarthsaxena2004/note-wave/blob/main/public/active-state.png)

### 2. Studio Hub (Zero State)
A professional directory that guides users through the available AI specialized tools.

![NoteWave Landing](https://github.com/samarthsaxena2004/note-wave/blob/main/public/zero-state.png)

---

## 🛠️ Tech Stack

* **Frontend:** [Next.js 16 (Turbopack)](https://nextjs.org/) - *Utilizing the latest React features.*
* **Language:** TypeScript
* **Styling:** Tailwind CSS, Shadcn/UI, Lucide React
* **AI Engine:** Llama 3.3 70B (via Groq) for high-speed, low-latency reasoning
* **Vector DB:** Pinecone (Serverless) for semantic retrieval
* **Embeddings:** Hugging Face (`all-MiniLM-L6-v2`)
* **Audio Engine:** ElevenLabs API for neural speech synthesis

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

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/yourusername/notewave.git](https://github.com/yourusername/notewave.git)
    cd notewave
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set Up Environment Variables (`.env.local`):**
    ```env
    GROQ_API_KEY=gsk_...
    PINECONE_API_KEY=pcsk_...
    PINECONE_INDEX_NAME=note-wave
    HUGGINGFACE_API_KEY=hf_...
    ELEVENLABS_API_KEY=sk_...
    ```
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Troubleshooting:** If the application fails due to a retired model or deprecated API call, please refer to the comprehensive debugging steps in the [`MAINTENANCE_GUIDE.md`](MAINTENANCE_GUIDE.md) file in the repository root.

---

## 🔮 Roadmap
* **Phase 3:** Interactive Quiz Studio with real-time scoring and leaderboard.
* **Phase 4:** Summary Studio for condensing deep research into executive briefs.

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
