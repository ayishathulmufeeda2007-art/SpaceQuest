# SPACE QUEST – Simulation Assumptions and Engineering Models

This document outlines the mathematical equations, engineering trade-offs, and physical simplifications used in the **SPACE QUEST** simulation engine.

---

## 1. Units of Measurement
To ensure scientific consistency throughout the simulation engine:
- **Mass:** Kilograms ($kg$)
- **Power:** Watts ($W$)
- **Energy / Battery Capacity:** Watt-hours ($Wh$)
- **Cost / Budget:** Space Credits ($M / Million Credits)
- **Data Volume:** Megabytes ($MB$) and Gigabytes ($GB$)
- **Data Transmission Rate:** Kilobits/Megabits per second ($kbps / Mbps$)
- **Velocity / Delta-V:** Kilometers per second ($km/s$)
- **Distance:** Astronomical Units ($AU$) or Kilometers ($km$)
- **Mission Time:** Hours, Days, or Months (scaled to simulation ticks)

---

## 2. Power Subsystem (EPS) Model
Spacecraft electrical power relies on solar generation and battery storage:
$$P_{gen} = P_{base\_array} \times \eta_{degrade} \times \left(\frac{1 AU}{r}\right)^2 \times \cos(\theta_{sun})$$
- **Solar Flux Inverse Square Law:** Solar panel output scales inversely with the square of the distance from the Sun $r$ (e.g., at Mars $r \approx 1.524 AU$, solar power drops to $\approx 43\%$ of Earth-orbit levels).
- **Eclipse Operations:** During orbital eclipses or nightside passes, $P_{gen} = 0$, requiring battery drain:
  $$E_{battery}(t+\Delta t) = E_{battery}(t) - P_{consumption} \times \Delta t$$
- **Depth of Discharge (DoD):** If battery drops below 20%, emergency brownout mode is triggered. If depleted (0%), spacecraft enters critical power fault.

---

## 3. Launch Vehicle & Orbital Mechanics (GMAT-Inspired Simplifications)
- **Mass Margin Check:**
  $$\text{Margin}_{\text{launch}} = \frac{M_{\text{capacity}} - M_{\text{spacecraft}}}{M_{\text{capacity}}} \times 100\%$$
  If $M_{\text{spacecraft}} > M_{\text{capacity}}$, the launch is blocked (insufficient rocket thrust).
- **Vis-Viva Equation for Circular Velocity:**
  $$v = \sqrt{\frac{\mu}{r}}$$
  Where $\mu = G M_{central}$.
- **Hohmann Transfer Energy & Delta-V:**
  $$\Delta v_{1} = \sqrt{\frac{\mu}{r_1}} \left(\sqrt{\frac{2 r_2}{r_1 + r_2}} - 1\right)$$
  Transfer times are modeled based on standard orbital dynamics:
  - LEO: 90 minutes orbital period.
  - GEO: 24 hours orbital period.
  - Lunar Transfer: ~3 days transit.
  - Mars Transfer: ~7 months (210 days) transit.
  - Deep Space (Outer Solar System): ~2 to 5 years transit.

---

## 4. Telemetry & Communications Model
Ground communication uses simplified link budget relations:
- Signal attenuation obeys the inverse-square law with distance $d$:
  $$\text{Signal Strength} \propto \frac{P_{tx} \cdot G_{antenna}}{d^2}$$
- **Data Downlink Throughput:** High-gain Ka-band dish yields up to 20 Mbps in Earth/Lunar orbit and 500 kbps at Mars; omnidirectional patch antennas provide telemetry-only (10-64 kbps).
- **Onboard Solid-State Recorder (SSR):** Instruments generate raw data. If data generation exceeds downlink bandwidth, data buffers into onboard flash memory. If SSR capacity reaches 100%, scientific data overflow occurs and measurements are lost.

---

## 5. Scientific Yield & Scoring Formula
Total Mission Score ($S \in [0, 100]$) is computed transparently:
$$S = 0.35 \cdot S_{science} + 0.20 \cdot S_{survival} + 0.15 \cdot S_{margin} + 0.15 \cdot S_{comms} + 0.15 \cdot S_{budget}$$

Where:
- $S_{science}$ (35 pts): Ratio of collected science to mission objectives, scaled by instrument suitability (Compatible = 1.0, Partially Useful = 0.5, Unsuitable = 0.0).
- $S_{survival}$ (20 pts): Spacecraft structural, thermal, and power health at mission completion.
- $S_{margin}$ (15 pts): Prudent engineering margins (mass margin $> 10\%$, power margin $> 15\%$).
- $S_{comms}$ (15 pts): Percentage of acquired scientific data successfully transmitted to Earth.
- $S_{budget}$ (15 pts): Remaining budget reserve (penalizes budget overruns, rewards cost-efficient engineering).

Ranks:
- **90–100:** Legendary Commander
- **75–89:** Expert Explorer
- **50–74:** Skilled Engineer
- **30–49:** Rookie Explorer
- **< 30:** Mission Failure
