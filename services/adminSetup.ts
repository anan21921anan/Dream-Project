import { supabase } from '../supabase';

export async function setupAdminUser() {
  try {
    // Create profiles table
    const { error: tableError } = await supabase.rpc('exec_sql', {
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
    }).catch(() => null);

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'anantech.ad@gmail.com')
      .maybeSingle();

    if (!existingAdmin) {
      // Sign up admin user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: 'anantech.ad@gmail.com',
        password: 'Anan21',
      });

      if (signUpError) {
        console.error('Admin signup error:', signUpError);
        return false;
      }

      if (user) {
        // Insert admin profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: 'anantech.ad@gmail.com',
            name: 'Admin',
            role: 'ADMIN',
            pin: '2161',
            balance: 999999,
            referral_code: 'ADMIN001',
          });

        if (profileError) {
          console.error('Admin profile insert error:', profileError);
          return false;
        }
      }
    } else {
      // Update existing admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: 'Admin',
          role: 'ADMIN',
          pin: '2161',
          balance: 999999,
        })
        .eq('email', 'anantech.ad@gmail.com');

      if (updateError) {
        console.error('Admin profile update error:', updateError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Admin setup error:', error);
    return false;
  }
}
