// measurementUtils.ts

import axios from "axios";
import { Measurement } from './../interfaces/measurement.js'

export async function fetchMeasurements(requestBody: Measurement) {
  const RN_MONITOR_API = axios.create({
    baseURL: "http://62.48.168.89:3000/api",
  });

  try {
    const response = await RN_MONITOR_API.post(
      "/measurement/get",
      requestBody,
      {
        headers: {
          Authorization: process.env.RN_MONITOR_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch measurements");
  }
}

export function filterMeasurement(measurement, sensors) {
  return (
    measurement.T != null &&
    measurement.Rn != null &&
    measurement.H != null &&
    measurement.P != null &&
    measurement.CO2 != null &&
    sensors.includes(measurement.sensor_id)
  );
}
