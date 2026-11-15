# SPACE QUEST
### *Build It. Launch It. Explore It!*

**SPACE QUEST** is a fully functional, highly interactive space mission design simulation game developed for NASA Space Apps and space engineering education.

Instead of a static website that simply talks about space, **SPACE QUEST** places players directly in the commander's seat. Players make real engineering trade-offs, design modular spacecraft, select launch vehicles, calculate orbital trajectories, launch rockets, operate ground stations, handle unforeseen space anomalies, and analyze downlinked scientific discoveries.

---

## 🚀 Key Features

- **Interactive 3D Spacecraft CAD Builder (Three.js):** Real-time 3D inspection of spacecraft components (CubeSat, SmallSat, Flagship buses, solar wings, RTGs, antennas, thrusters, and sensors).
- **Thrilling 3D Rocket Launch Sequence:** Multi-stage rocket launchpad with 10-second countdown, ignition roar, smoke particles, atmospheric climb, dynamic gravity turn, and stage separation.
- **Interactive 3D Solar System Flight Simulation:** Inspired by NASA Mission Viz and VR Challenge. Fly between Earth, Moon, Mars, and deep space with animated trajectory paths, active sensor scanning cones, and ground downlink beams.
- **Authentic Engineering Trade-Offs (NASA MDL):** Connected engineering margins where payload mass, power draw, battery eclipse storage, thermal control, and launcher capacity directly affect mission feasibility.
- **Objective-Driven Science Lab (NASA Webb BYG):** Select instruments (Cameras, IR, Spectrometers, SAR Radars, Magnetometers, Atmospheric Sounders, Mass Spectrometers) with wavelength and destination compatibility badges (`COMPATIBLE`, `PARTIALLY USEFUL`, `NOT SUITABLE`).
- **Dynamic Space Events & Humor (CSA Game Design):** Unexpected space weather events (Solar Storms, Battery Brownouts, Micrometeorites, DSN Jitter) with meaningful consequence-based decisions and friendly humor.
- **Ground Segment & Deep Space Network:** Lock onto DSN ground stations (Goldstone, Madrid, Canberra), tune frequencies, and downlink telemetry packets.
- **Transparent 100-Point Scoring & PDF Report:** Scientific yield (35 pts), Spacecraft survival (20 pts), Engineering design (15 pts), Comms (15 pts), and Budget management (15 pts). Generates printable mission reports.
- **Zero-Dependency Procedural Audio Engine:** Web Audio API sound synthesis generates all countdown voice beeps, rocket roars, telemetry blips, alarm sirens, ambient cosmic synth music, and fanfares without external audio dependencies.
- **Three Game Modes:**
  - **Solo Mode:** Direct all mission segments individually.
  - **Team Mode:** Local co-op for up to 4 players on one device (Mission Commander, Systems Engineer, Chief Scientist, Flight Controller).
  - **Sandbox Mode:** Unconstrained budget and mass experiments.

---

## 📚 NASA & CSA Resource Traceability

| NASA / CSA Resource | In-Game Feature Integration |
|---|---|
| **1. NASA Design & Develop Science Missions** | Core 4-segment mission lifecycle (Launch, Space, Ground, User segments) with readiness indicators and verification checklists. |
| **2. NASA GMAT (General Mission Analysis Tool)** | Simplified educational orbital mechanics (LEO, SSO, GEO, Lunar Transfer, Mars Hohmann Transfer, Deep Space Trajectory), Vis-Viva speeds, orbital periods, and eclipse durations. |
| **3. NASA/JPL Concept Maturity Levels (CML)** | Progressive design gates from CML 1 (Mission Concept) through CML 4 (Flight Readiness Review). |
| **4. NASA Goddard Mission Design Lab (MDL)** | Concurrent systems engineering: interconnected mass, power, communications, thermal, delta-V, reliability, and cost margins. |
| **5. NASA Mission Viz** | Interactive 3D celestial bodies (Sun, Earth, Moon, Mars), transfer orbits, and camera tracking modes (Chase Craft, Target Focus, Free Orbit). |
| **6. NASA Webb Build-It-Yourself Game** | Objective-driven instrument selection, wavelength matching, data generation, and compatibility scoring. |
| **7. NASA CubeSat 101** | Accessible 6U CubeSat micro-bus option, standardized EPS, ADCS, CDH, and thermal subsystem specifications. |
| **8. NASA Space Mission VR Challenge** | 8-phase mission flight progression (Launch, Orbit Insertion, Cruise, Planetary Approach, Science Scanning, Data Downlink, Mission Complete). |
| **9. Canadian Space Agency (CSA) Youth Games** | Accessible educational tips, interactive tooltips, beginner-friendly warnings, and humorous mission control banter. |

For detailed engineering models and mathematical equations, see:
- [`docs/resource-mapping.md`](docs/resource-mapping.md)
- [`docs/simulation-assumptions.md`](docs/simulation-assumptions.md)

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Three.js, Lucide React, Canvas Confetti.
- **Game Engine:** Centralized deterministic simulation engine (Physics, Science Yield, Scoring, Audio).
- **Backend:** Node.js, Express, TypeScript (Leaderboard, Health, Simulation Verification API).

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm

### 1. Start the Frontend
```bash
cd frontend
npm install
#To run the Frontend
npm run dev
(OR)
npm.cmd --prefix frontend run dev
```
The game will be available at: `http://localhost:5173`

### 2. (Optional) Start the Backend API
```bash
cd backend
npm install
npm run dev
```
The backend API runs at: `http://localhost:3001`

### 3. Run Automated Simulation Unit Tests
```bash
cd backend
npx tsx ../frontend/src/tests/simulation.test.ts
```

---

## 🏆 Scoring Categories

- **90–100:** LEGENDARY COMMANDER (Gold)
- **75–89:** EXPERT EXPLORER (Emerald)
- **50–74:** SKILLED ENGINEER (Cyan)
- **30–49:** ROOKIE EXPLORER (Purple)
- **< 30:** MISSION FAILURE (Red)
