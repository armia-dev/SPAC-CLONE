import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const authHeader = req.headers.get('Authorization') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Verify caller session using user token
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Valid session required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Verify caller has Admin or Owner role in staff_profiles
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: callerProfile, error: profileError } = await adminClient
      .from('staff_profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (profileError || !callerProfile || callerProfile.status !== 'Active' || !['Owner', 'Admin'].includes(callerProfile.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin privileges required to create staff accounts' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Parse and validate body
    const { email, password, fullName, role, contactNumber } = await req.json();

    if (!email || !password || !fullName || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, password, fullName, and role are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validRoles = ['Owner', 'Admin', 'Manager', 'Staff', 'Cashier', 'Court Attendant'];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (role === 'Owner' && callerProfile.role !== 'Owner') {
      return new Response(JSON.stringify({ error: 'Only an Owner can assign the Owner role' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Create user in Supabase Auth via adminClient
    const { data: createdAuth, error: createAuthError } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createAuthError) {
      return new Response(JSON.stringify({ error: createAuthError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Generate next staff_id and insert staff profile
    const { data: seqData } = await adminClient.rpc('next_staff_id');
    const staffId = seqData || `ACC-${Date.now().toString().slice(-4)}`;

    const { data: staffData, error: staffInsertError } = await adminClient
      .from('staff_profiles')
      .insert({
        id: createdAuth.user.id,
        staff_id: staffId,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        status: 'Active',
        contact_number: contactNumber || null,
        date_added: new Date().toISOString(),
      })
      .select()
      .single();

    if (staffInsertError) {
      // Rollback auth user creation if profile insert failed
      await adminClient.auth.admin.deleteUser(createdAuth.user.id);
      return new Response(JSON.stringify({ error: staffInsertError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, staff: staffData }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
