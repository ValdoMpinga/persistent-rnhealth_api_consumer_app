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

class PersistentRnHealthConsumerApp {
  private app: express.Application;
  private TWENTY_HOURS_IN_MILLISECONDS: number = 72000000;
  private SENSORS: string[] = ["D001", "D003"];
  private RN_MONITOR_API = axios.create({
    baseURL: "http://62.48.168.89:3000/api",
  });
  private RN_HEALTH_FORECASTER_API = axios.create({
    baseURL: "http://localhost:8000",
  });
  private isFirstForecast: boolean = true;
  private sixHoursInterval: number = 6 * 60 * 60 * 1000;
  private threeMinutesInterval: number = 2 * 60 * 1000;
  private intervalCounter: number = 0;

  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.app.listen(process.env.PORT || 3000, () => {
      console.log("Server is running on port 3000");
      this.initialize();
    });
  }

  private filterMeasurement(measurement) {
    return (
      measurement.T != null &&
      measurement.Rn != null &&
      measurement.H != null &&
      measurement.P != null &&
      measurement.CO2 != null &&
      measurement.sensor_id === this.SENSORS[0]
    );
  }

  private async fetchDataAndForecast() {
    console.log("Interval counter: " + this.intervalCounter);
    this.intervalCounter++;

    const date = dayjs();
    const parsedCurrentDate = date.toDate().getTime().toString();
    const parsedStartDate = (
      date.toDate().getTime() - this.TWENTY_HOURS_IN_MILLISECONDS
    ).toString();
    const requestBody: MeasurementRequestBody = {
      dateStart: parsedStartDate,
      dateEnd: parsedCurrentDate,
      groupBy: "1h",
    };

    try {
      const response = await this.RN_MONITOR_API.post(
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
        .filter(this.filterMeasurement.bind(this))
        .map((measure) => {
          delete measure.sensor_id;
          return measure;
        });

      await this.RN_HEALTH_FORECASTER_API.post("/forecast/target-sensor", {
        targetSensor: this.SENSORS[0],
      });

      console.log("Getting LSTM forecasts");
      setTimeout(() => {}, 1000);
      const lstmResponse = await this.RN_HEALTH_FORECASTER_API.post(
        "/forecast/lstm",
        filteredData
      );
      console.log(lstmResponse.data);

      console.log("Getting Bi-LSTM forecasts");
      setTimeout(() => {}, 1000);
      const biLstmResponse = await this.RN_HEALTH_FORECASTER_API.post(
        "/forecast/bi-lstm",
        filteredData
      );
      console.log(biLstmResponse.data);

      await this.saveForecastsToDB();
      if (this.isFirstForecast) {
        this.isFirstForecast = false;
      } else {
        await this.saveMeasumentsToDB();
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async saveForecastsToDB() {
    console.log("forecasts saved to database");
  }

  private async saveMeasumentsToDB() {
    console.log("measurements saved to database");
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
