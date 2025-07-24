import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { getClerkInstance } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto"; // Add polyfill

const SUPABASE_URL = "https://nhzzlxtvtlbvboesexcp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oenpseHR2dGxidmJvZXNleGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMzODMsImV4cCI6MjA1OTQxOTM4M30.r1MXVkHv3nk0l3z3jG3Mt1fDWh8Z1CotJIMZY_BDKYc";

let client = null;

export const useSupabaseClient = () => {
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const init = async () => {
      const Clerk = getClerkInstance();

      client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage, // Persist auth sessions
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
        accessToken: () => {
          return Clerk.session?.getToken();
        },
      });

      setSupabase(client);
    };

    init();
  }, []);

  return supabase;
};
