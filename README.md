# War Game Server

Node/Express + TypeScript server for the War card game assignment.

## Features
- Student registration and login
- JWT auth
- Start a new game vs computer
- Play a game round-by-round until complete
- Save finished games to history
- MySQL persistence
- Winston logging
- Strict TypeScript enabled

## Setup
1. Create a MySQL database.
2. Import `schema/export/war_game.sql`.
3. Copy `.env.example` to `.env` and fill in values.
4. Install packages:
   ```bash
   npm install
   ```
5. Run in development:
   ```bash
   npm run dev
   ```
6. Build for production:
   ```bash
   npm run build
   npm start
   ```

## API
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /user/register` (client-compatible alias)
- `POST /user` (client-compatible login alias)

### Games
- `POST /api/games/start`
- `GET /api/games/current`
- `POST /api/games/current/play-round`
- `GET /api/games/history`

## Notes
- Only one active game per student is allowed at a time.
- Card state is stored as JSON in the database to keep the logic simple and easy to inspect.
