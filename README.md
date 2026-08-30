# Marvel_PWM

A full-stack web app for browsing the Marvel universe, built for the "Progettazione Web e Mobile" university course.

**Live demo:** [marvel-pwm.vercel.app](https://marvel-pwm.vercel.app)

## What it does

Lets users browse and search Marvel characters/comics, pulling data from the official Marvel Comics API, while a custom backend and database handle app-specific state (e.g. user accounts, favorites/saved items — adjust this line to match what your DB actually stores).

## Architecture

```
React (Frontend)  →  Express API (Backend)  →  Marvel Comics API (external)
                                             ↘  own database (app data)
```

- **Frontend:** React
- **Backend:** Node.js + Express
- **External data:** [Marvel Comics API](https://developer.marvel.com/) (requires a public/private key pair — see Setup)
- **Persistence:** own database for app-specific data alongside the Marvel API data

## Setup

```bash
# Backend
cd Backend
npm install
# create a .env with your Marvel API keys, e.g.:
# MARVEL_PUBLIC_KEY=xxxx
# MARVEL_PRIVATE_KEY=xxxx
npm start

# Frontend
cd Frontend
npm install
npm start
```

## Docs

`Relazione_PWM.docx` is the original project report submitted for the course, covering requirements, design decisions, and implementation notes in more depth.

## Notes

Built as a coursework project — some hardening you'd expect in production (input validation, rate limiting around the Marvel API, auth token handling) may be minimal or missing. Noted here rather than left implicit.

This project uses the Marvel Comics API but is not endorsed, sponsored, or affiliated with Marvel or Disney. Marvel characters and related content © Marvel.
