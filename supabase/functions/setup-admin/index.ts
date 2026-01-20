import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Create profiles table
    await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
          email text UNIQUE NOT NULL,
          name text DEFAULT '',
          balance numeric DEFAULT 0,
          referral_code text UNIQUE,
          is_suspended boolean DEFAULT false,
          personal_notice text,
          role text DEFAULT 'USER',
          pin text,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `,
    }).catch(() => {});

    // Enable RLS
    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
    }).catch(() => {});

    // Create admin user via auth
    const { data: { user: existingAdmin }, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", "anantech.ad@gmail.com")
      .maybeSingle();

    if (!existingAdmin) {
      const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
        email: "anantech.ad@gmail.com",
        password: "Anan21",
        email_confirm: true,
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);
      }

      if (user) {
        // Insert profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: "anantech.ad@gmail.com",
            name: "Admin",
            role: "ADMIN",
            pin: "2161",
            balance: 999999,
          });

        if (profileError) {
          console.error("Profile insert error:", profileError);
        }
      }
    } else {
      // Update existing admin
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: "Admin",
          role: "ADMIN",
          pin: "2161",
          balance: 999999,
        })
        .eq("email", "anantech.ad@gmail.com");

      if (updateError) {
        console.error("Update error:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Admin user setup complete" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
