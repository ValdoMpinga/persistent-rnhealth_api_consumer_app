import { SupabaseConnection } from "./../database/supabaseConnSingleton.js";


export class Bi_LSTM_ForecastsRepository {
    private connection: SupabaseConnection;

    constructor(connection: SupabaseConnection)
    {
        this.connection = connection
            // this.supabaseInstance = new SupabaseConnectionClass(apiKey, apiUrl);
    }

    insertForecasts()
    {
      this.connection;
      // public getAuthentication() {
      //   this.supabaseInstance
      //     .getSupabaseInstanceWithSession()
      //     .then(async ({ supabase, session }) => {
      //       // console.log("Supabase instance: ", supabase);
      //       // console.log("Session: \n\n\n\n\n\n", session);
      //       let currentSession = {
      //         access_token: session.data.session.access_token,
      //         refresh_token: session.data.session.refresh_token,
      //       };
      //       console.log(currentSession);

      //       await supabase.auth.signInWithIdToken(session.data);

      //       let { data: Bi_LSTM_Forecats, error } = await supabase
      //         .from("Bi_LSTM_Forecats")
      //         .select("*");

      //       console.log(Bi_LSTM_Forecats);
      //       console.log(error);
      //       // console.log(error);
      //     });
      // }
    }


}
