Finny Chatbot 4.8.1 (Local Backup)
- Geen Azure nodig. Werkt lokaal, GitHub/Render.
- /api/chat gebruikt OpenAI als OPENAI_API_KEY is gezet; anders stub-antwoord.
- Prompt 9.9 staat in prompts/prompt_finny_mini.txt.

ENV (optioneel)
- OPENAI_API_KEY=...
- OPENAI_MODEL=gpt-4o-mini
- PROMPT_FILE=prompts/prompt_finny_mini.txt

Testen
- npm ci && npm start
- /health  |  /debug/prompt  |  /  (chat UI)
Build: 2025-09-01T10:58:10.795957Z
