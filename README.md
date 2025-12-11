# 🌊 NoteWave

**NoteWave** is an AI-powered application inspired by Google's NotebookLM. It transforms static PDF documents into interactive conversations and engaging audio podcasts.

Built as a showcase of bleeding-edge **Full-Stack AI Engineering**, utilizing **Next.js 16**, Vector Search, and Multi-Modal LLMs.

## ⚠️ Important Notice

**It is strongly recommended to run this application locally.**

The publicly deployed version is intended as a portfolio demo. Because it relies on free-tier API keys (Groq & ElevenLabs), it may be **rate-limited**, become unavailable, or run out of credits without notice.

Running it locally gives you full control, unlimited usage (subject to your own keys), and guarantees data privacy.

---

## 🚀 What It Does

* **📄 RAG-Powered Chat:** Upload any PDF and chat with it. The AI cites its sources by finding the exact paragraph in the document using Vector Search (Pinecone).
* **🎙️ AI Podcast Studio:** Generates a scripted "Deep Dive" audio conversation between two AI hosts (Host & Expert) who discuss the uploaded content.
* **⚡ Real-Time Streaming:** Uses React Server Components to stream AI responses token-by-token for a zero-latency feel.
* **🎨 Teleprompter UI:** A custom-built audio player that auto-scrolls through the script as the AI speaks (Karaoke style).

## 📸 Interface Preview

### 1. The Dashboard (Active State)
Once a document is uploaded, the interface transforms into a fully-featured research studio with Chat, Source Management, and the Audio Studio.

![NoteWave Dashboard](https://github.com/samarthsaxena2004/note-wave/blob/main/public/active-state.png)

### 2. The Landing Page (Zero State)
A clean, welcoming drop-zone for new users to get started immediately.

![NoteWave Landing](https://github.com/samarthsaxena2004/note-wave/blob/main/public/zero-state.png)

---

## 🛠️ Tech Stack (The "Under the Hood")

* **Frontend:** [Next.js 16 (Turbopack)](https://nextjs.org/) - *Using the latest React 19 features.*
* **Language:** TypeScript
* **Styling:** Tailwind CSS, Shadcn/UI, Lucide React.
* **AI Logic:** Llama 3.3 70B (via Groq) for high-speed reasoning.
* **Vector DB:** Pinecone (Serverless) for semantic retrieval.
* **Embeddings:** Hugging Face (`all-MiniLM-L6-v2`) for vectorization.
* **Audio Engine:** ElevenLabs API for neural speech synthesis.
* **State Management:** Complex React Hooks (`useRef`, `useEffect`) to handle async audio loops.

## 🧠 System Architecture

1.  **Ingestion Pipeline:**
    * PDF is parsed -> Text is split into semantic chunks (1000 chars) -> Chunks are vectorized -> Vectors stored in Pinecone with metadata.
2.  **Context-Aware Chat:**
    * User query is embedded -> Pinecone finds top 10 relevant matches -> Llama 3 generates answer based *only* on those matches (reducing hallucinations).
3.  **Podcast Generation:**
    * Llama 3 writes a JSON-structured script -> Frontend iterates through the script -> Calls ElevenLabs for audio -> Plays chunks sequentially.

## 🧪 Challenges & Learnings

Building this required solving several complex engineering problems:

* **API Rate Limiting:** Implemented a "Batching & Backoff" system to upload vectors to Hugging Face without hitting 429 errors.
* **Context Isolation:** Built a filtering system so the AI only searches the *active* document, preventing data leaks between files.
* **State Synchronization:** Created a robust audio controller using `useRef` to manage the pause/resume state of an asynchronous fetch loop.

---

## 🚀 How to Run Locally

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/yourusername/notewave.git](https://github.com/yourusername/notewave.git)
    cd notewave
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set Up Environment Variables:**
    Create a `.env.local` file in the root directory and add your API keys:
    ```env
    GROQ_API_KEY=gsk_...
    PINECONE_API_KEY=pcsk_...
    PINECONE_INDEX_NAME=note-wave
    HUGGINGFACE_API_KEY=hf_...
    ELEVENLABS_API_KEY=sk_...
    ```
4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Troubleshooting:** If the application fails due to a retired model or deprecated API call, please refer to the comprehensive debugging steps in the [`MAINTENANCE_GUIDE.md`](MAINTENANCE_GUIDE.md) file in the repository root.

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for features (e.g., persistent database storage, user authentication), feel free to fork the repo and submit a PR.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

### Crafted with ❤️ by [Samarth Saxena](https://enflect.tech/)
