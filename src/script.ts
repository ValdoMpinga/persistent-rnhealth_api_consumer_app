import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import dayjs from "dayjs";

dotenv.config();

interface MeasurementRequestBody {
  dateStart: string;
  dateEnd: string;
  groupBy: string;
}

const app = express();
const TWENTY_HOURS_IN_MILLISECONDS = 72000000;
const SENSORS = ["D001", "D003"];
const RN_MONITOR_API = axios.create({
  baseURL: "http://62.48.168.89:3000/api",
});

const RN_HEALTH_FORECASTER_API = axios.create({
  baseURL: "http://localhost:8000",
});
let isFirstForecast = true;
const sixHoursInterval = 6 * 60 * 60 * 1000;
const threeMinutesInterval = 2 * 60 * 1000;
let intervalCounter = 0;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function filterMeasurement(measurement) {
  return (
    measurement.T != null &&
    measurement.Rn != null &&
    measurement.H != null &&
    measurement.P != null &&
    measurement.CO2 != null &&
    measurement.sensor_id === SENSORS[0]
  );
}

async function fetchDataAndForecast() {
  console.log("In");
  console.log("Interval counter: " + intervalCounter);
  intervalCounter++;

  const date = dayjs();
  const parsedCurrentDate = date.toDate().getTime().toString();
  const parsedStartDate = (
    date.toDate().getTime() - TWENTY_HOURS_IN_MILLISECONDS
  ).toString();
  const requestBody: MeasurementRequestBody = {
    dateStart: parsedStartDate,
    dateEnd: parsedCurrentDate,
    groupBy: "1h",
  };
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

    const filteredData = response.data
      .filter(filterMeasurement)
      .map((measure) => {
        delete measure.sensor_id;
        return measure;
      });
    // console.log(filteredData);
    await RN_HEALTH_FORECASTER_API.post("/forecast/target-sensor", {
      targetSensor: SENSORS[0],
    });

    console.log("Getting LSTM forecasts");
    setTimeout(() => {}, 1000);
    const lstmResponse = await RN_HEALTH_FORECASTER_API.post(
      "/forecast/lstm",
      filteredData
    );
    console.log(lstmResponse.data);

    // await saveForecastsToDB();
    console.log("Getting Bi-LSTM forecasts");
    setTimeout(() => {}, 1000);

    const biLstmResponse = await RN_HEALTH_FORECASTER_API.post(
      "/forecast/bi-lstm",
      filteredData
    );
    console.log(biLstmResponse.data);

    await saveForecastsToDB();
    if (isFirstForecast) {
      isFirstForecast = false;
    } else {
      await saveMeasumentsToDB();
    }

  } catch (error) {
    console.error(error);
  }
}

setTimeout(() => {
  try {
    fetchDataAndForecast();

    setInterval(() => {
      console.log("Forecasts re-schaduled to run in 6 hours");
      fetchDataAndForecast();
    }, threeMinutesInterval);
  } catch (e) {
    console.log(e);
  }
}, 0);

async function saveForecastsToDB() {
  console.log("forecasts saved to database");
}

async function saveMeasumentsToDB() {
  console.log("measurements saved to database");
}
