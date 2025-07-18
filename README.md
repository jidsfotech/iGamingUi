## iGaming Development Approach

This project simulates a real-time game where users join active game sessions, select a number, and receive results based on random game outcomes.

# Game Flow & Logic

1️⃣ . Authentication & Onboarding

* Users register or log in.
* After successful authentication, users are redirected to the home screen.
* The home screen calls GET /game/session to fetch the current game session.

2️⃣ Game Session Management

* The backend controls all session timings.
  * Each session has startTime and endTime.
  * The frontend calculates the countdown based on the endTime.
* If there’s no active session, the user sees a toast notification, and the "Join" button is disabled until a new session starts.

3️⃣ Joining a Session

* When the user clicks "Join", the click action triggers a call to the backend API POST game/join. They are added to the current active game session and redirected to the game screen (/game).
* The game screen again calls GET /game/session to get the latest session state.
* The frontend displays information like:
  * Total players that have joined
  * Session countdown timer
* Once the user inputs a number:
  * The input field is disabled to prevent changes.
  * A request is sent to POST /game/join to record the user’s participation.

4️⃣ Session Completion

* When the countdown hits zero, the user is redirected to the results screen.
* The frontend calls GET /game/ended-session/:id to get:
  * winningNumber
  * totalPlayers
  * totalWins
  * nextSessionStartTime

5️⃣ Top Players

* The frontend also calls GET /game/top-players to display the top winners in the sidebar.
* If there are no winners, it displays zero or empty states.

---

Summary of Key Features

* Backend manages game session lifecycle
* Frontend handles real-time display via countdown timers using session endTime
* All interactions are API-driven to ensure fairness and consistency

---

Deployment

* The application is deployed on vercel and accessible via the link.

https://i-gaming-mi24xzypa-jidsfotechs-projects.vercel.app/

## Tech Stack
| Layer             | Technology                                                      |
| ----------------- | --------------------------------------------------------------- |
| **Frontend**      | Next.js (App Router) + TypeScript + Tailwind CSS                |
| **Backend**       | NestJS + TypeScript + JWT Auth + Typeorm ORM (for DB management) |
| **Database**      | MySQL                                     |
| **Communication** | REST API          |
