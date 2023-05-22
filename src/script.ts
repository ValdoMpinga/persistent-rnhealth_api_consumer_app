import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import dayjs from "dayjs";
import { Measurement } from "./interfaces/measurement.js";
import { fetchMeasurements, filterMeasurement } from "./utils/measurementsUtils.js";
import {
  setTargetSensor,
  getLSTMForecast,
  getBiLSTMForecast,
} from "./utils/forecastsUtil.js";
// import { saveForecastsToDB, saveMeasurementsToDB } from "./databaseUtils";
dotenv.config();

class PersistentRnHealthConsumerApp {
  private app: express.Application;
  private TWENTY_HOURS_IN_MILLISECONDS: number = 72000000;
  private SENSORS: string[] = ["D001", "D003"];
  private intervalCounter: number = 0;
  private isFirstForecast: boolean = true;
  private sixHoursInterval: number = 6 * 60 * 60 * 1000;
  private threeMinutesInterval: number = 2 * 60 * 1000;

  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.app.listen(process.env.PORT || 3000, () => {
      this.initialize();
    });
  }
  private async saveForecastsToDB() {
    console.log("forecasts saved to database");
  }

  private async saveMeasumentsToDB() {
    console.log("measurements saved to database");
  }

  private async fetchDataAndForecast() {
    console.log("Interval counter: " + this.intervalCounter);
    this.intervalCounter++;

    const date = dayjs();
    const parsedCurrentDate = date.toDate().getTime().toString();
    const parsedStartDate = (
      date.toDate().getTime() - this.TWENTY_HOURS_IN_MILLISECONDS
    ).toString();
    const requestBody: Measurement = {
      dateStart: parsedStartDate,
      dateEnd: parsedCurrentDate,
      groupBy: "1h",
    };

    try
    {
      const measurements = await fetchMeasurements(requestBody);
      const filteredData = measurements.filter((measurement) =>
        filterMeasurement(measurement, this.SENSORS[0])
      );

      console.log("Target sensor: " + this.SENSORS[0]);
      
      await setTargetSensor(this.SENSORS[0])
      await getLSTMForecast(filteredData);
      await getBiLSTMForecast(filteredData);

      await this.saveForecastsToDB();
      if (!this.isFirstForecast) {
        await this.saveMeasumentsToDB();
      }

      this.isFirstForecast = false;
    } catch (error) {
      console.error(error);
    }
  }

  private async initialize() {
    setTimeout(async () => {
      try {
        await this.fetchDataAndForecast();

        setInterval(async () => {
          await this.fetchDataAndForecast();
          console.log("Forecasts re-scheduled to run in 6 hours");
        }, this.threeMinutesInterval);
      } catch (e) {
        console.log(e);
      }
    }, 0);
  }
}

new PersistentRnHealthConsumerApp();

