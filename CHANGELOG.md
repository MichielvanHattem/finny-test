# Changelog
Alle belangrijke wijzigingen per versie.

## [4.4.0] – 2025-06-06
### Added
- Volledige prompt-logger (`src/utils/logPrompt.js`).
- Nieuwe `src/`-structuur (scheiding utils, services, prompts).
- `.gitignore` en `.dockerignore` om node_modules, dumps en secrets te negeren.
- `src/prompts/system_9.3.txt` (nieuwe system-prompt).

### Fixed
- Ontbrekend `index.js` (entry-point) → Express start nu zonder fout.
- Documentatie in `README.md` bijgewerkt (quickstart + curl-test).

### Security
- `.env.example` toegevoegd; .env blijft lokaal dankzij `.gitignore`.
