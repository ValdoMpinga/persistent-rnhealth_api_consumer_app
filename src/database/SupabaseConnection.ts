import {
  createClient,
  SupabaseClient,
  AuthResponse,
} from "@supabase/supabase-js";

export class SupabaseConnection {
  private static instance: SupabaseConnection;
  private supabase: SupabaseClient;

  private constructor(private apiKey: string, private apiUrl: string) {
    this.supabase = createClient(apiUrl, apiKey);
  }

  public static getInstance(
    apiKey: string,
    apiUrl: string
  ): SupabaseConnection
  {    
    if (!SupabaseConnection.instance) {
      SupabaseConnection.instance = new SupabaseConnection(
        apiKey,
        apiUrl
      );
    }

    return SupabaseConnection.instance;
  }

  public async getAuthenticatedSupabase(): Promise<AuthResponse> {
    try {
      const session = await this.supabase.auth.signInWithPassword({
        email: process.env.SUPABASE_USER,
        password: process.env.SUPABASE_PASSWORD,
      });

      return session;
    } catch (e) {
      console.error(e);
      throw new Error("Failed to authenticate with Supabase");
    }
  }

  public async getSupabaseInstanceWithSession(): Promise<{
    supabase: SupabaseClient;
    session: AuthResponse;
  }> {
    try {
      const session = await this.getAuthenticatedSupabase();
      return { supabase: this.supabase, session };
    } catch (e) {
      console.error(e);
      throw new Error("Failed to get Supabase instance with session");
    }
  }
}
