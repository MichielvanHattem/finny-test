# Finny Chatbot 4.4

**Belangrijkste wijzigingen t.o.v. 4.3**

1. **Volledige `.gitignore`** – node_modules, logs, dumps, .env, artefacts uitgesloten.
2. **Entry‑point aanwezig** – `src/index.js` (Express‑API op `/chat`).
3. **Prompt‑logger** – `src/utils/logPrompt.js`, activeer via `LOG_PROMPT=1`.
4. **OpenAI wrapper** – centrale call in `src/services/openai.js`.
5. **.env.example** – veilig voorbeeld voor keys.
6. **Versie‑bump** – package.json `4.4.0`.

## Quickstart

```bash
npm install
LOG_PROMPT=1 OPENAI_API_KEY=sk-... npm start
curl -X POST http://localhost:3000/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"system","content":"Ping"},{"role":"user","content":"Pong?"}]}'
```

Prompt‑dump vind je in `/tmp/prompt_<timestamp>.json`.
