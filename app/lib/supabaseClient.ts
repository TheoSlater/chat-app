import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://updlbtcplrupjoszojpt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZGxidGNwbHJ1cGpvc3pvanB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NTIzOTQsImV4cCI6MjA1NzEyODM5NH0.UW4dgLNSaRrAbBIBJI-sEQj7pl9Jf4TOl4qG1jcAJTk";

export const supabase = createClient(supabaseUrl, supabaseKey);
