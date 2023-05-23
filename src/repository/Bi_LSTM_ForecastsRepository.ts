import { SupabaseConnection } from "../database/SupabaseConnection.js";
import { SupabaseHelper } from "../database/SupabaseHelper.js";
import { IBiLstm } from "../interfaces/BiLstmInterface.js";
import { SupabaseClient, AuthResponse } from "@supabase/supabase-js";
import { DB_TABLE_NAMES, TABLE_FIELD_NAMES } from "../utils/constants.js";

export class Bi_LSTM_ForecastsRepository {
  private connection: SupabaseConnection;
  private supabase: SupabaseClient;
  private session: AuthResponse;
  private subaseHelper: SupabaseHelper;
  private isInitialized: boolean;

  constructor(connection: SupabaseConnection) {
    console.log("Constructing connection");

    this.connection = connection;
  }

  private async initialize() {
    try {
      const { supabase, session } =
        await this.connection.getSupabaseInstanceWithSession();
      this.supabase = supabase;
      this.session = session;
      this.subaseHelper = new SupabaseHelper(this.supabase);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to initialize Bi_LSTM_ForecastsRepository");
    }
  }

  async setLastInsertedForecastsMeasurementsId() {
    await this.runInitialize();

    let lastInsertedBiLstmForecastId =
      await this.subaseHelper.getLastInsertedRecordId(DB_TABLE_NAMES.bi_lstm);
    let lastInsertedMeasurementId =
      await this.subaseHelper.getLastInsertedRecordId(
        DB_TABLE_NAMES.measurements
      );

    const { data, error } = await this.supabase
      .from(DB_TABLE_NAMES.bi_lstm)
      .update({ [TABLE_FIELD_NAMES.real_measurements_id]: lastInsertedMeasurementId })
      .eq("id", lastInsertedBiLstmForecastId);
    
          console.log("\n");
          console.log("----------------Bi_LSTM_Forecasts Update---------------------");
          console.log(data);
          console.log(error);
          console.log("-------------------------------------");
          console.log("\n");
  }

  async insertBiLstmForecastData(forecasts: IBiLstm) {
    await this.runInitialize();

    try {
      const { data, error } = await this.supabase
        .from("Bi_LSTM_Forecasts")
        .insert(forecasts);
      console.log("\n");
      console.log("----------------Bi_LSTM_Forecasts---------------------");
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
