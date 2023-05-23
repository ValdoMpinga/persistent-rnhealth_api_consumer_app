import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseHelper {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    // Assign the Supabase client instance
    this.supabase = supabase;
  }

  async getLastInsertedRecordId(tableName: string): Promise<number | null> {
    try {
      // Make a query to fetch the last inserted record ID
      const { data, error } = await this.supabase
        .from(tableName)
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      // Extract the ID of the last inserted record
      const lastInsertedRecordId = data[0]?.id;

      return lastInsertedRecordId;
    } catch (error) {
      console.error("Error retrieving last inserted record ID:", error.message);
      return null;
    }
  }
}
