# 🛠️ NoteWave Maintenance Guide: Model Deprecation Checklist

This guide documents the critical external dependencies of NoteWave that are subject to change. If the application stops working (e.g., chat/podcast breaks or ingestion fails), follow these steps to quickly identify and fix the outdated component.

## 1. Key API Endpoints & Failure Points

| Functionality | Code Location | Dependency/Provider | Primary Failure Point |
| :--- | :--- | :--- | :--- |
| **Chat Generation** | `src/app/api/chat/route.ts` | Groq (Llama 3) | Model ID is retired (e.g., `llama-3.3-70b-versatile`). |
| **Embedding/Vector** | `src/lib/rag.ts` | Hugging Face Inference API | Embedding Model ID is retired/deprecated. |
| **Script Generation** | `src/lib/podcast-script.ts` | Groq (Llama 3) | Model ID or response format is changed. |
| **Audio Synthesis** | `src/app/api/speak/route.ts` | ElevenLabs API | Model ID (`eleven_multilingual_v2`) or specific Voice IDs are retired. |

---

## 2. Model Troubleshooting Guide (Action Plan)

Follow this flowchart if a core feature fails.

### Issue A: Chat or Script Generation Fails (Error 400 or 500)

**Error Message Keywords:** `model_decommissioned`, `invalid_request_error`, `model not found`.

1.  **Check Provider Status:** Verify the status of the Llama 3 model on the **Groq Console Deprecation Page** and identify the recommended replacement model.
2.  **Update Files:** Change the `model` string in **both** files to the new stable ID:
    * `src/app/api/chat/route.ts`
    * `src/lib/podcast-script.ts`

### Issue B: Audio Playback Fails (Error 500 in `/api/speak`)

**Error Message Keywords:** `model_deprecated_free_tier`, `model not available`, `invalid voice_id`.

1.  **Check Provider Status:** Review the ElevenLabs API documentation/changelog for model updates (especially regarding free tiers).
2.  **Find New Model ID:** Identify the newest stable multilingual model (currently `eleven_multilingual_v2` has been a common standard).
3.  **Update File:** Change the `model_id` string in:
    * `src/app/api/speak/route.ts`
4.  **Voice ID Check:** Verify the specific voice IDs used (e.g., Adam/Rachel) are still active in the ElevenLabs Voice Library and replace if necessary.

### Issue C: Ingestion Fails (Error 400 or 500 during Upload)

**Failure Condition:** The file uploads, but the system crashes during the "Generating Embeddings" step due to model retirement.

1.  **Check Model ID:** Verify the embedding model ID in `src/lib/rag.ts` (`sentence-transformers/all-MiniLM-L6-v2`) is still active on Hugging Face.
2.  **Find Replacement:** Identify a new, compatible embedding model.
3.  **Critical Step: Re-indexing:** If you change the embedding model, you **must** re-index all data.
    * **Clear Pinecone:** Delete the existing index (`note-wave`) in the Pinecone Console.
    * **Create New Index:** Create a new index with the **same dimensions (384)**.
    * **Re-upload PDFs:** Re-upload all your documents through the NoteWave UI to populate the new index with the correct vector format.

---

## 3. General Maintenance Checklist

| Task | Frequency | Purpose |
| :--- | :--- | :--- |
| **Check Env Vars** | Once per deployment | Ensure all secrets are loaded correctly (critical after Vercel deployment or restarting local server). |
| **Check SDK Versions** | Quarterly | Run `npm outdated` to update packages like `groq-sdk` and `@pinecone-database/pinecone` for bug fixes and new features. |
| **Test Ingestion** | Monthly | Upload a small test PDF to confirm the full pipeline (Parsing, Embedding, Storage) is functional and not hitting new rate limits. |
