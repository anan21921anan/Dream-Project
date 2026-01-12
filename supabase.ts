
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmhumztcqpjlysufxhuq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taHVtenRjcXBqbHlzdWZ4aHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMDcwMjEsImV4cCI6MjA4Mzc4MzAyMX0.deT_Ne8Q7FnyXGIMgWorJOxoSFpGzROd5dPFCYRI_hI';

export const supabase = createClient(supabaseUrl, supabaseKey);
