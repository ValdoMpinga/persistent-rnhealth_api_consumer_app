import { SupabaseConnection } from "../database/SupabaseConnection.js";
import { IMeasurements } from "../interfaces/measurementsInterface.js";
import { SupabaseClient, AuthResponse } from "@supabase/supabase-js";
import { DB_TABLE_NAMES, TABLE_FIELD_NAMES } from "../utils/constants.js";

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
      const { data, error } = await this.supabase
        .from(DB_TABLE_NAMES.measurements)
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return data[0]?.id;
    } catch (error) {
      console.error("Error retrieving last inserted record ID:", error.message);
    }
  }

  async insertMeasurements(measurements: IMeasurements) {
    await this.runInitialize();
    try {
      const { data, error } = await this.supabase
        .from(DB_TABLE_NAMES.measurements)
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
