# KrishiMix: 3-Minute Live Demonstration Script

**Role:** Senior Full-Stack Agronomy Engineer presenting to agricultural extension officers and smallholder farmer leaders.

---

### [0:00 - 0:30] Introduction & The Agronomic Problem
- **Voiceover**:
  > *"Choosing a high-yielding seed variety is great, but when a smallholder farmer plants two crops together, standard tools fail. Taller maize can shade out groundnut, or a 90-day pulse can dry out waiting for a 160-day companion.
  > Welcome to **KrishiMix**, an AI-assisted decision support system built from the ground up for smallholder farmers. It evaluates variety combinations, validates agronomic compatibility, produces to-scale planting layouts, and estimates exact seed and fertilizer quantities—with strict evidence transparency."*
- **Action**:
  - Show the clean earth-green homepage (`http://localhost:5173`).
  - Demonstrate the language switcher: toggle between **English**, **ಕನ್ನಡ (Kannada)**, and **हिन्दी (Hindi)**.
  - Click the **Read Aloud** button to demonstrate voice accessibility for low-literacy farmers.

---

### [0:30 - 1:15] The 5-Step Guided Wizard (Empirical OBSERVED Flow)
- **Voiceover**:
  > *"Let's plan 1 acre of land in Dharwad during the Kharif season."*
- **Action**:
  - **Step 1 (Season & Location)**: Select `Kharif (Monsoon)` and `Dharwad, Karnataka`. Click *Continue*.
  - **Step 2 (Land Dimensions)**: Select `1 Acre` ($63.6\text{m} \times 63.6\text{m}$), orientation `North-South` (for optimal multi-tier solar capture). Click *Continue*.
  - **Step 3 (Soil & Water)**: Select `Red Sandy Loam`, pH `6.8` (Neutral Optimum), `Rainfed (Dryland)`. Click *Continue*.
  - **Step 4 (Crop Selection)**:
    - Primary Crop: Choose `Maize` (single cross hybrid `DHM-117`).
    - Click **"✨ Suggest Best Companion For Me"** — the recommendation engine evaluates biological nitrogen synergy and suggests `Pigeonpea (ICP-8863 Maruti)` in a `2:1` ratio.
    - Click **"Evaluate Intercropping Plan"**.

---

### [1:15 - 2:00] Results, Evidence Transparency & To-Scale Layout
- **Voiceover**:
  > *"Notice the immediate result: KrishiMix leads with a clear, one-line verdict: 'Recommended: Demonstrated 53% land-use advantage documented in institutional field trials'.
  > Look at the badge: 🟢 **OBSERVED TRIAL**. KrishiMix never confuses predictions with facts. We cite the UAS Dharwad AICRP Research Station trial with rainfall and soil parameters."*
- **Action**:
  - Point to the **OBSERVED** badge and open the **Evidence Legend**.
  - Show the **Planting Layout Map (To-Scale SVG)**:
    - Point out the tractor headland margins, border protection rows, and access walkways every 12 rows.
    - Point to the **Dimension Table**: 86 total rows, exact plant counts per row, and plant population.
    - Click **"Export PNG"** and **"PDF Print"** to show instant downloadable field schematics.
  - Switch to the **Resource Estimator**:
    - Show itemized seed quantities (kg), N:P:K fertilizer (accounting for 15% biological nitrogen credit), and labour days.
    - Click **"Customize Costs"**, change daily labour rate, and click **"Update Calculations"** to demonstrate real-time financial recalculation and Benefit-Cost Ratio (BCR).

---

### [2:00 - 2:30] Conflict Detection & Unsupported Crop Handler
- **Voiceover**:
  > *"What happens if a farmer picks incompatible crops—like a 65-day dwarf crop with a 180-day late pulse, or crops with conflicting water needs?"*
- **Action**:
  - Click Back to Step 4. Select `Maize` + `Maize` (or conflicting heights).
  - Click Evaluate.
  - **Show the Rejection Screen**: The 🔴 **UNSUPPORTED** badge appears.
  - Point out that **no false planting map or exaggerated yield is fabricated**. The system explains the physiological conflict in plain language:
    - *"Severe solar competition: dominant canopy towers over companion crop..."*
  - Demonstrate the **Recommended Supported Alternatives**: Click **"Switch to This Alternative"** (`Maize + Pigeonpea` or `Groundnut + Pigeonpea`), which immediately restores a safe, validated planting layout.

---

### [2:30 - 3:00] Compare View & Admin Governance Portal
- **Voiceover**:
  > *"Farmers can compare up to 4 supported configurations side-by-side."*
- **Action**:
  - Click **Compare** in the top navigation:
    - Show side-by-side cards comparing `Maize + Pigeonpea`, `Groundnut + Pigeonpea`, `Ragi + Field Bean`, and `Sorghum + Cowpea`.
    - Show the interactive Recharts bar graph comparing LER, yield, and net profit.
  - Click **Admin**:
    - Show the catalog of 14 verified trial records with explicit `[SAMPLE DATA]` markers.
    - Point out the ML Model Governance panel: Random Forest Regressor, $R^2$ score ($0.88$), Mean Absolute Error ($\pm 0.033$), and feature importances.
    - Demonstrate the CSV ingestion portal for uploading new ICAR trial data.
- **Closing**:
  > *"KrishiMix bridges the gap between agricultural research trials and real smallholder field decisions—making intercropping safe, dimensioned, and profitable."*
