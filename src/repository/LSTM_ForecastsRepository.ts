import { SupabaseConnection } from "../database/SupabaseConnection.js";
import { IBiLstm } from "../interfaces/biLstmInterface.js";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseHelper } from "../database/SupabaseHelper.js";
import { DB_TABLE_NAMES, TABLE_FIELD_NAMES } from "../utils/constants.js";

export class LSTM_ForecastsRepository {
  private connection: SupabaseConnection;
  private supabase: SupabaseClient;
  private isInitialized: boolean;
  private subaseHelper: SupabaseHelper;

  constructor(connection: SupabaseConnection) {
    console.log("Constructing connection");

    this.connection = connection;
  }

  private async initialize() {
    try {
      const { supabase, session } =
        await this.connection.getSupabaseInstanceWithSession();
      this.supabase = supabase;
      this.subaseHelper = new SupabaseHelper(this.supabase);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to initialize LSTM_ForecastsRepository");
    }
  }

  async setLastInsertedForecastsMeasurementsId() {
    await this.runInitialize();

    let lastInsertedLstmForecastId =
      await this.subaseHelper.getLastInsertedRecordId(DB_TABLE_NAMES.lstm);
    let lastInsertedMeasurementId =
      await this.subaseHelper.getLastInsertedRecordId(
        DB_TABLE_NAMES.measurements
      );

    const { data, error } = await this.supabase
      .from(DB_TABLE_NAMES.lstm)
      .update({
        [TABLE_FIELD_NAMES.real_measurements_id]: lastInsertedMeasurementId,
      })
      .eq("id", lastInsertedLstmForecastId);

    console.log("\n");
    console.log(
      "----------------Bi_LSTM_Forecasts Update---------------------"
    );
    console.log(data);
    console.log(error);
    console.log("-------------------------------------");
    console.log("\n");
  }

  async insertLstmForecastData(forecasts: IBiLstm) {
    await this.runInitialize();

    try {
      const { data, error } = await this.supabase
        .from("LSTM_Forecasts")
        .insert(forecasts);
      console.log("\n");
      console.log("----------------LSTM_Forecasts---------------------");
      console.log(data);
      console.log(error);
      console.log("-------------------------------------");
      console.log("\n");
    } catch (e) {
      console.log(e);
    }
  }

  async runInitialize() {
    if (!this.isInitialized) await this.initialize();
  }
}
