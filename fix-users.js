const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fpynhxfjgppqfpvmyikd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweW5oeGZqZ3BwcWZwdm15aWtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5OTAzMywiZXhwIjoyMTAxNTc1MDMzfQ.SE4V9On7ZEMoQkRkKOcJZ16VR0aM-ie7WTTi7eCiH4k';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixMissingUsers() {
  console.log("Checking for users in auth.users that are missing in public.users...");
  
  // 1. Get all users from auth.users (via admin API)
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error fetching auth users:", authError);
    return;
  }
  
  const authUsers = authData.users;
  console.log(`Found ${authUsers.length} users in auth system.`);
  
  // 2. Insert missing users into public.users
  let fixedCount = 0;
  for (const user of authUsers) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (!existingUser) {
      console.log(`User ${user.email} (${user.id}) is missing from public.users! Fixing...`);
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || '',
          role: user.user_metadata?.role || 'customer'
        });
        
      if (insertError) {
        console.error(`Failed to insert user ${user.email}:`, insertError.message);
      } else {
        console.log(`Successfully synced user ${user.email} to public.users.`);
        fixedCount++;
      }
    }
  }
  
  console.log(`\nFinished! Synced ${fixedCount} missing users to public.users.`);
}

fixMissingUsers();
