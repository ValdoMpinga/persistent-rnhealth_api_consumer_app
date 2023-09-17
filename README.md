# RnHealth API Consumer Application

This repository houses the code responsible for persisting forecast data generated by RnHealth AI models, which predict indoor radon concentration. The script operates continuously until manually halted by the developer. A scheduler triggers the script every 7 hours, leveraging models trained and executed within the [RnHealth Backend application](https://github.com/ValdoMpinga/rnhealthBackend).

## Functionality Overview:

- The script generates 6-hour forecasts of radon concentration using models trained in the RnHealth Backend app, every 7 hours.
- These forecasts are stored in the Supabase database.
- During subsequent runs, 7 hours later, the script retrieves real-time measurements and updates the Supabase database.
- The script then generates new forecasts based on the updated data.

This iterative process ensures that forecasts of radon concentration are accurate and up-to-date.

---

*Project Acknowledgment:*
This work is a result of the project **TECH - Technology, Environment, Creativity, and Health**, supported by Norte Portugal Regional Operational Program (NORTE 2020) under the PORTUGAL 2020 Partnership Agreement, through the European Regional Development Fund (ERDF). Project ID: Norte-01-0145-FEDER-000043.