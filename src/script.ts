import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import dayjs from "dayjs";
import { IMeasurementBody } from "./interfaces/measurementsRequestBodyInterface.js";
import {
  fetchMeasurements,
  filterMeasurement,
} from "./utils/measurementsUtils.js";
import {
  setTargetSensor,
  getLSTMForecast,
  getBiLSTMForecast,
} from "./utils/forecastsUtil.js";
import { SupabaseConnection } from "./database/SupabaseConnection.js";
import { Bi_LSTM_ForecastsRepository } from "./repository/Bi_LSTM_ForecastsRepository.js";
import { LSTM_ForecastsRepository } from "./repository/LSTM_ForecastsRepository.js";
import { MeasurementsRepository } from "./repository/MeasurementsRepository.js";

dotenv.config();

class PersistentRnHealthConsumerApp {
  private app: express.Application;
  private TWENTY_HOURS_IN_MILLISECONDS: number = 72000000;
  private SENSORS: string[] = ["D001", "D003"];
  private intervalCounter: number = 1;
  private isFirstForecast: boolean = true;
  private sevenHoursInterval: number = 7 * 60 * 60 * 1000;
  private threeMinutesInterval: number = 2 * 60 * 1000;

  //DB instances
  private biLstmForecastsRepositoryInstance: Bi_LSTM_ForecastsRepository;
  private lstmForecastsdRepositoryInstance: LSTM_ForecastsRepository;
  private measurementsRepositoryInstance: MeasurementsRepository;

  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
      this.initialize();
   ;
    this.biLstmForecastsRepositoryInstance = new Bi_LSTM_ForecastsRepository(
      SupabaseConnection.getInstance(
        process.env.SUPABASE_KEY,
        process.env.SUPABASE_URL
      )
    );
    this.lstmForecastsdRepositoryInstance = new LSTM_ForecastsRepository(
      SupabaseConnection.getInstance(
        process.env.SUPABASE_KEY,
        process.env.SUPABASE_URL
      )
    );
    this.measurementsRepositoryInstance = new MeasurementsRepository(
      SupabaseConnection.getInstance(
        process.env.SUPABASE_KEY,
        process.env.SUPABASE_URL
      )
    );
  }

  private async fetchDataAndForecast() {
    console.log("Interval counter: " + this.intervalCounter);

    const date = dayjs();
    const parsedCurrentDate = date.toDate().getTime().toString();
    const parsedStartDate = (
      date.toDate().getTime() - this.TWENTY_HOURS_IN_MILLISECONDS
    ).toString();
    const requestBody: IMeasurementBody = {
      dateStart: parsedStartDate,
      dateEnd: parsedCurrentDate,
      groupBy: "1h",
    };

    try {
      let measurements = await fetchMeasurements(requestBody);
      let filteredData = measurements.filter((measurement) =>
        filterMeasurement(measurement, this.SENSORS[0])
      );

      console.log("Target sensor: " + this.SENSORS[0]);
      await setTargetSensor(this.SENSORS[0]);
      let lstmForecasts = await getLSTMForecast(filteredData);
      let biLstmForecasts = await getBiLSTMForecast(filteredData);

      if (!this.isFirstForecast) {
        await this.saveMeasumentsToDB(filteredData.slice(-6));

        if (this.intervalCounter == 2) {
          await this.lstmForecastsdRepositoryInstance.setLastInsertedForecastsMeasurementsId();
          await this.biLstmForecastsRepositoryInstance.setLastInsertedForecastsMeasurementsId();
        }
      }

      if (this.intervalCounter > 2) {
        await this.lstmForecastsdRepositoryInstance.setLastInsertedForecastsMeasurementsId();
        await this.biLstmForecastsRepositoryInstance.setLastInsertedForecastsMeasurementsId();
      }

      await this.saveForecastsToDB(lstmForecasts, biLstmForecasts);

      this.isFirstForecast = false;
      this.intervalCounter++;
    } catch (error) {
      console.error(error);
    }
  }

  private async initialize() {
    setTimeout(async () => {
      try {
        await this.fetchDataAndForecast();

        console.log(
          "Forecasts re-scheduled to run in 7 hours. Actual time: " + new Date()
        );

        setInterval(async () => {
          await this.fetchDataAndForecast();
          "Forecasts re-scheduled to run in 7 hours. Actual time: " +
            new Date();
        }, this.threeMinutesInterval);
      } catch (e) {
        console.log(e);
      }
    }, 0);
  }

  private async saveMeasumentsToDB(measururemnts: Object) {
    await this.measurementsRepositoryInstance.insertMeasurements({
      created_at: new Date().toISOString(),
      measurements: JSON.stringify(measururemnts),
    });
  }

  private async saveForecastsToDB(
    lstmForecats: Object,
    biLstmForecats: Object
  ) {
    await this.lstmForecastsdRepositoryInstance.insertLstmForecastData({
      created_at: new Date().toISOString(),
      forecasts: JSON.stringify(lstmForecats),
      real_measurements_id: null,
    });

    await this.biLstmForecastsRepositoryInstance.insertBiLstmForecastData({
      created_at: new Date().toISOString(),
      forecasts: JSON.stringify(biLstmForecats),
      real_measurements_id: null,
    });
  }
}

new PersistentRnHealthConsumerApp();
