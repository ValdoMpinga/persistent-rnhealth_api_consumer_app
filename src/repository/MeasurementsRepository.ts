import { SupabaseConnection } from "../database/SupabaseConnection.js";
import { IMeasurements } from "../interfaces/measurementsInterface.js";
import { SupabaseClient, AuthResponse } from "@supabase/supabase-js";

export class MeasurementsRepository {
  private connection: SupabaseConnection;
  private supabase: SupabaseClient;
  private session: AuthResponse;
  private isInitialized: boolean;

  constructor(connection: SupabaseConnection) {
    this.connection = connection;
  }

  private async initialize() {
    try {
      const { supabase, session } =
        await this.connection.getSupabaseInstanceWithSession();
      this.supabase = supabase;
      this.session = session;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to initialize MeasurementsRepository");
    }
  }

  async getLastInsertedRecordId() {
    await this.runInitialize();

    try {
      // Make a query to fetch the last inserted record ID
      const { data, error } = await this.supabase
        .from("Measurements")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return data[0]?.id;

      // Extract the ID of the last inserted record
    } catch (error) {
      console.error("Error retrieving last inserted record ID:", error.message);
    }
    // let { data: Bi_LSTM_Forecasts, error } = await this.supabase
    //   .from("MeasurementsRepository")
    //   .select("*");
    // console.log(Bi_LSTM_Forecasts);
    // console.log(error);
  }

  async insertMeasurements(measurements: IMeasurements) {
    await this.runInitialize();

    console.log("inside!!");

    try {
      const { data, error } = await this.supabase
        .from("Measurements")
        .insert(measurements);

      console.log("\n");
      console.log("----------------Measurements---------------------");
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
