# SPACE QUEST – NASA Resource Traceability Matrix

This document maps the educational and technical concepts from official NASA and CSA resources directly to the implementation within **SPACE QUEST**.

---

## 1. NASA: Design and Develop Science Missions
**Source:** [NASA Science Mission Directorate Guide](https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf)  
**In-Game Implementation:**  
The game's primary lifecycle architecture is structured into the four canonical mission segments:
- **Launch Segment:** Launch vehicle selection (Small, Medium, Heavy, Super Heavy), launch pad verification checklist, mass-to-orbit margin calculations, launch countdown and atmospheric ascent simulation.
- **Space Segment:** Spacecraft bus sizing (CubeSat, SmallSat, Flagship), electrical power subsystem (solar flux $1/r^2$, battery capacity, orbital eclipse discharge), thermal control, attitude determination & control (reaction wheels/star trackers), chemical/electric propulsion ($\Delta V$), and science payload instruments.
- **Ground Segment:** Ground stations (Deep Space Network nodes: Goldstone, Madrid, Canberra), communication frequency bands (UHF, X-Band, Ka-Band), link budget margin, transmission windows, latency, and data reception buffers.
- **User Segment:** Ground data processing pipeline, simulated instrument telemetry synthesis (spectroscopy curves, false-color imagery, magnetometer readings, soil mass spectrometry), anomaly investigation, and final mission scientific reporting.

---

## 2. NASA General Mission Analysis Tool (GMAT)
**Source:** [NASA GMAT GSC-19468-1](https://software.nasa.gov/software/GSC-19468-1)  
**In-Game Implementation:**  
Simplified educational flight dynamics based on GMAT concepts:
- **Orbital Regimes:** Low Earth Orbit (LEO, 400 km), Sun-Synchronous Orbit (SSO, 700 km, 98°), Geostationary Orbit (GEO, 35,786 km), Trans-Lunar Injection (TLI), Mars Transfer (Hohmann interplanetary transfer), and Deep Space Escape trajectories.
- **Keplerian & Vis-Viva Physics:** Orbital speed $v = \sqrt{\mu (2/r - 1/a)}$, period $T = 2\pi\sqrt{a^3/\mu}$, eclipse duration calculations during shadow transit.
- **Trajectory Calculations:** Realistic $\Delta V$ requirements, transfer times (hours for LEO/GEO, 3 days for Lunar, ~210 days for Mars), and mid-course correction maneuvers during random space events.

---

## 3. NASA/JPL Concept Maturity Levels (CML)
**Source:** [JPL Concept Maturity Level Matrix](https://dataverse.jpl.nasa.gov/dataset.xhtml?persistentId=hdl:2014/44299)  
**In-Game Implementation:**  
The mission planning HUD displays and progresses through four CML gates:
- **CML 1 (Mission Concept):** Defining core science objectives (e.g., Lunar Water Ice, Martian Organics, Climate Monitoring).
- **CML 2 (Feasibility & Trades):** Balancing mass, power, cost, and payload requirements; identifying critical bottlenecks.
- **CML 3 (Subsystem Architecture):** Finalizing spacecraft bus, propulsion type, power subsystem, and communication links.
- **CML 4 (Preliminary Design & Launch Approval):** Launch verification checklist, subsystem go/no-go polling, and flight clearance.

---

## 4. NASA Mission Design Lab (MDL)
**Source:** [Goddard Space Flight Center MDL](https://etd.gsfc.nasa.gov/capabilities/integrated-design-center/mission-design-lab/)  
**In-Game Implementation:**  
Concurrent Engineering Model:
- **Connected Trades:** Adding a high-demand sensor (e.g., Synthetic Aperture Radar) increases mass, requires larger solar arrays and batteries, demands higher telemetry bandwidth, increases total spacecraft dry mass, and may force an upgrade to a more expensive launcher.
- **Resource Margins:** Real-time margin monitoring (Mass Margin %, Power Margin %, Budget Reserve %, Data Buffer %).
- **Risk Assessment:** System reliability calculated as a function of component redundancy and stress margins.

---

## 5. NASA Mission Viz
**Source:** [NASA Mission Viz Visualization Project](https://nasa.github.io/mission-viz/)  
**In-Game Implementation:**  
Interactive 3D Three.js environment:
- Rendered celestial bodies: Sun with procedural corona, Earth with day/night terminator and cloud layer, Moon with surface texture, Mars with red dust glow.
- Accurate orbital paths and dynamic transfer conic sections.
- Multiple camera view modes: Free Orbit Controls, Spacecraft Chase Cam, and Destination Focus Cam.
- Visual scan cones during science acquisition phases.

---

## 6. NASA Webb Telescope Build-It-Yourself Game
**Source:** [NASA Webb Educational Interactive](https://science.nasa.gov/mission/webb/game-build-it-yourself/)  
**In-Game Implementation:**  
Objective-driven payload selection:
- Instruments: High-Res Optical Camera, Infrared Sensor, Multi-Band Spectrometer, Synthetic Aperture Radar, Magnetometer, Atmospheric Sounder, Radiation Dosimeter, Planetary Soil Mass Spectrometer.
- Science Objective Matching: Each mission objective has primary and secondary instrument affinities. Real-time compatibility badges show `COMPATIBLE` (100% science yield), `PARTIALLY USEFUL` (50% yield), or `NOT SUITABLE` (0% yield).
- Wavelength & sensor trade-offs: Mass, power draw, and data output rate vary realistically.

---

## 7. NASA CubeSat 101
**Source:** [NASA CubeSat Launch Initiative Basic Concepts](https://www3.nasa.gov/sites/default/files/atoms/files/nasa_csli_cubesat_101_508.pdf)  
**In-Game Implementation:**  
- **CubeSat Architecture:** Accessible 3U/6U CubeSat configuration option featuring standardized deployable solar panels, patch antennas, micro-reaction wheels, and miniaturized payloads.
- **Subsystem Breakdown:** Clear division into Structure, EPS (Electrical Power), ADCS (Attitude Determination & Control), CDH (Command & Data Handling), Comms, and Payloads.

---

## 8. NASA Space Mission VR Challenge
**Source:** [NASA Space Apps VR Challenge](https://www.spaceappschallenge.org/2023/challenges/visualize-a-space-mission-using-virtual-reality/)  
**In-Game Implementation:**  
- 8-phase mission flight progression: Launch & Ascent, LEO Insertion, Trans-Trajectory Cruise, Planetary Arrival, Science Observation Scan, Data Acquisition, Deep Space Downlink, Mission Finalization.
- Spacecraft positioning, animated solar arrays, orientation alignment toward targets, and real-time telemetry streaming.

---

## 9. Canadian Space Agency (CSA) Digital Games & Activities
**Source:** [CSA Youth & Educator Resources](https://www.asc-csa.gc.ca/eng/youth-educators/digital-games-and-activities.asp)  
**In-Game Implementation:**  
- Engaging, accessible tone with educational tooltips, witty mission control commentary ("Houston, our coffee maker tripped the circuit breaker... check battery reserves!").
- Step-by-step role definitions in Team Mode (Commander, Spacecraft Engineer, Chief Scientist, Flight Controller).
- Beginner-friendly explanations for complex concepts like Delta-V, Solar Flux, and Link Budgets.
