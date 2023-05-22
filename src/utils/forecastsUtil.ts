// forecastUtils.ts

import axios from "axios";

export async function setTargetSensor(sensor_id: string) {
  const RN_HEALTH_FORECASTER_API = axios
    .create({
      baseURL: "http://localhost:8000",
    })
    .post("/forecast/target-sensor", {
      targetSensor: sensor_id,
    });
}

export async function getLSTMForecast(data) {
  const RN_HEALTH_FORECASTER_API = axios.create({
    baseURL: "http://localhost:8000",
  });

  try {
    console.log("Getting LSTM forecasts");
    setTimeout(() => {}, 1000);
    const response = await RN_HEALTH_FORECASTER_API.post(
      "/forecast/lstm",
      data
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get LSTM forecast");
  }
}

export async function getBiLSTMForecast(data) {
  const RN_HEALTH_FORECASTER_API = axios.create({
    baseURL: "http://localhost:8000",
  });

  try {
    console.log("Getting Bi-LSTM forecasts");
    setTimeout(() => {}, 1000);
    const response = await RN_HEALTH_FORECASTER_API.post(
      "/forecast/bi-lstm",
      data
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get Bi-LSTM forecast");
  }
}
