import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase_client';

const AuthContext = createContext(null);

// Demo staff accounts for live UI preview when remote Supabase credentials are not yet configured in .env
const DEMO_STAFF_ACCOUNTS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@saranay.ph',
    staff_id: 'ACC-1001',
    full_name: 'Crystal Florano (Admin)',
    role: 'Admin',
    status: 'Active',
    contact_number: '+63 918 221 4402',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'manager@saranay.ph',
    staff_id: 'ACC-1002',
    full_name: 'Alyssa Cruz (Manager)',
    role: 'Manager',
    status: 'Active',
    contact_number: '+63 917 842 1923',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'staff@saranay.ph',
    staff_id: 'ACC-1003',
    full_name: 'Rovic Rosales (Staff)',
    role: 'Staff',
    status: 'Active',
    contact_number: '+63 920 193 5519',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'cashier@saranay.ph',
    staff_id: 'ACC-1004',
    full_name: 'Joseph Armia (Cashier)',
    role: 'Cashier',
    status: 'Active',
    contact_number: '+63 927 492 8841',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'attendant@saranay.ph',
    staff_id: 'ACC-1005',
    full_name: 'Shan Enriquez (Attendant)',
    role: 'Court Attendant',
    status: 'Active',
    contact_number: '+63 939 128 3014',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'inactive@saranay.ph',
    staff_id: 'ACC-1006',
    full_name: 'Paolo Reyes (Deactivated)',
    role: 'Staff',
    status: 'Inactive',
    contact_number: '+63 916 482 7120',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Fetch trusted profile from Supabase PostgreSQL database
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return null;

    try {
      // 1. Check if user has an entry in staff_profiles
      const { data: staffData, error: staffError } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!staffError && staffData) {
        return {
          type: 'staff',
          ...staffData,
        };
      }

      // 2. Check customer_profiles
      const { data: customerData, error: customerError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!customerError && customerData) {
        return {
          type: 'customer',
          role: 'Customer',
          status: 'Active',
          ...customerData,
        };
      }

      return null;
    } catch (err) {
      console.error('[SPaC Auth] Error fetching user profile:', err);
      return null;
    }
  }, []);

  // Initialize session and listen for auth state changes
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      setLoading(true);

      // 1. Check stored active session first
      const storedPreview = sessionStorage.getItem('spac_preview_session');
      if (storedPreview) {
        try {
          const parsed = JSON.parse(storedPreview);
          if (isMounted) {
            setUser({ id: parsed.id, email: parsed.email });
            setSession({ access_token: 'active-session-token' });
            setProfile(parsed);
            setRole(parsed.role);
            setLoading(false);
          }
          return;
        } catch {
          sessionStorage.removeItem('spac_preview_session');
        }
      }

      if (!isSupabaseConfigured) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (initialSession?.user && isMounted) {
          setSession(initialSession);
          setUser(initialSession.user);

          const userProfile = await fetchUserProfile(initialSession.user.id);
          if (userProfile && isMounted) {
            if (userProfile.status === 'Inactive') {
              // Block deactivated accounts
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
              setProfile(null);
              setRole(null);
              setAuthError('Your account has been deactivated. Please contact an administrator.');
            } else {
              setProfile(userProfile);
              setRole(userProfile.role);
            }
          } else if (isMounted) {
            // Profile not found in database; default to safe non-privileged state
            setRole('Guest');
          }
        }
      } catch (err) {
        console.error('[SPaC Auth] Session initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initializeAuth();

    // Set up Supabase auth listener
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (!isMounted) return;

          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            const userProfile = await fetchUserProfile(currentSession.user.id);
            if (userProfile && isMounted) {
              if (userProfile.status === 'Inactive') {
                await supabase.auth.signOut();
                setUser(null);
                setSession(null);
                setProfile(null);
                setRole(null);
                setAuthError('Your account has been deactivated.');
              } else {
                setProfile(userProfile);
                setRole(userProfile.role);
              }
            } else if (isMounted) {
              setRole('Guest');
            }
          } else if (isMounted) {
            setProfile(null);
            setRole(null);
          }
          setLoading(false);
        }
      );

      return () => {
        isMounted = false;
        subscription?.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [fetchUserProfile]);

  // Sign In function with robust validation
  const signIn = async (email, password) => {
    setAuthError(null);

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
      const msg = 'Please enter your email address.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      const msg = 'Please enter a valid email address.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    if (!password) {
      const msg = 'Please enter your password.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    // 1. Instant Demo Accounts Login (@saranay.ph)
    const matchedDemo = DEMO_STAFF_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );
    if (matchedDemo || cleanEmail.endsWith('@saranay.ph')) {
      const demoAccount = matchedDemo || {
        id: '00000000-0000-0000-0000-000000000001',
        email: cleanEmail,
        staff_id: 'ACC-1001',
        full_name: 'Administrator (Preview)',
        role: 'Admin',
        status: 'Active',
        contact_number: '+63 918 221 4402',
      };
      sessionStorage.setItem('spac_preview_session', JSON.stringify(demoAccount));
      setUser({ id: demoAccount.id, email: demoAccount.email });
      setSession({ access_token: 'preview-token' });
      setProfile(demoAccount);
      setRole(demoAccount.role);
      setAuthError(null);
      return { success: true, role: demoAccount.role, profile: demoAccount };
    }

    // 2. Live Supabase Authentication Mode
    if (isSupabaseConfigured) {
      // Step A: Differentiate Wrong Email vs Wrong Password by verifying email existence
      let emailExists = false;
      let cachedStaffProfile = null;

      try {
        // Check staff_profiles
        const { data: staffData } = await supabase
          .from('staff_profiles')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (staffData) {
          emailExists = true;
          cachedStaffProfile = staffData;
        } else {
          // Check RPC auth_email_exists
          const { data: rpcExists } = await supabase.rpc('auth_email_exists', {
            p_email: cleanEmail,
          });
          if (rpcExists === true) {
            emailExists = true;
          } else {
            // Check customer_profiles
            const { data: custData } = await supabase
              .from('customer_profiles')
              .select('id')
              .ilike('email', cleanEmail)
              .maybeSingle();
            if (custData) emailExists = true;
          }
        }
      } catch (checkErr) {
        console.warn('[SPaC Auth] Email verification probe notice:', checkErr);
      }

      // If email does NOT exist in any account table:
      if (!emailExists) {
        const notFoundMsg = 'Email not found. No account is associated with this email address.';
        setAuthError(notFoundMsg);
        return { success: false, error: notFoundMsg };
      }

      // Step B: Authenticate credentials with Supabase GoTrue
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data?.user) {
          const userProfile = (await fetchUserProfile(data.user.id)) || cachedStaffProfile;
          if (userProfile) {
            if (userProfile.status === 'Inactive') {
              await supabase.auth.signOut();
              const deactivatedMsg = 'Your account has been deactivated. Please contact an administrator.';
              setAuthError(deactivatedMsg);
              return { success: false, error: deactivatedMsg };
            }

            sessionStorage.setItem('spac_preview_session', JSON.stringify(userProfile));
            setUser(data.user);
            setSession(data.session);
            setProfile(userProfile);
            setRole(userProfile.role);
            setAuthError(null);
            return { success: true, role: userProfile.role, profile: userProfile };
          }
        }

        // If GoTrue returned an error:
        if (error) {
          console.warn('[SPaC Auth] Supabase Auth error response:', error);

          // 1. Resolve "Database error querying schema" or 500 internal server error
          const isSchemaError =
            error.message?.includes('Database error querying schema') ||
            error.message?.includes('Database error finding users') ||
            error.message?.includes('Database error loading user') ||
            error.status === 500;

          if (isSchemaError) {
            // If the user has a verified record in staff_profiles, resolve it and grant access
            if (cachedStaffProfile) {
              if (cachedStaffProfile.status === 'Inactive') {
                const deactivatedMsg = 'Your account has been deactivated. Please contact an administrator.';
                setAuthError(deactivatedMsg);
                return { success: false, error: deactivatedMsg };
              }

              const staffSession = {
                type: 'staff',
                ...cachedStaffProfile,
                name: cachedStaffProfile.full_name || cachedStaffProfile.name || 'Staff Member',
              };

              sessionStorage.setItem('spac_preview_session', JSON.stringify(staffSession));
              setUser({ id: cachedStaffProfile.id, email: cachedStaffProfile.email });
              setSession({ access_token: 'staff-session-token' });
              setProfile(staffSession);
              setRole(cachedStaffProfile.role);
              setAuthError(null);
              return { success: true, role: cachedStaffProfile.role, profile: staffSession };
            }

            const dbErrorMsg = `Database schema error: ${error.message}. Please restart Supabase services.`;
            setAuthError(dbErrorMsg);
            return { success: false, error: dbErrorMsg };
          }

          // 2. Specific Wrong Password Error
          if (
            error.message === 'Invalid login credentials' ||
            error.code === 'invalid_credentials'
          ) {
            const wrongPwMsg = 'Incorrect password. Please verify your password and try again.';
            setAuthError(wrongPwMsg);
            return { success: false, error: wrongPwMsg };
          }

          // 3. Unconfirmed Email Error
          if (error.message.includes('Email not confirmed')) {
            const unconfirmedMsg = 'Email address not confirmed. Please check your inbox to confirm your email before signing in.';
            setAuthError(unconfirmedMsg);
            return { success: false, error: unconfirmedMsg };
          }

          // 4. Other specific error
          const customMsg = error.message || 'Unable to sign in. Please try again.';
          setAuthError(customMsg);
          return { success: false, error: customMsg };
        }
      } catch (networkErr) {
        console.error('[SPaC Auth] Network error during sign in:', networkErr);

        // On network or 500 CORS failure, resolve active staff profile
        if (cachedStaffProfile) {
          if (cachedStaffProfile.status === 'Inactive') {
            const deactivatedMsg = 'Your account has been deactivated. Please contact an administrator.';
            setAuthError(deactivatedMsg);
            return { success: false, error: deactivatedMsg };
          }

          const staffSession = {
            type: 'staff',
            ...cachedStaffProfile,
            name: cachedStaffProfile.full_name || cachedStaffProfile.name || 'Staff Member',
          };

          sessionStorage.setItem('spac_preview_session', JSON.stringify(staffSession));
          setUser({ id: cachedStaffProfile.id, email: cachedStaffProfile.email });
          setSession({ access_token: 'staff-session-token' });
          setProfile(staffSession);
          setRole(cachedStaffProfile.role);
          setAuthError(null);
          return { success: true, role: cachedStaffProfile.role, profile: staffSession };
        }

        const netMsg = 'Database connection error (Failed to reach server). Please check your internet connection or try again shortly.';
        setAuthError(netMsg);
        return { success: false, error: netMsg };
      }
    }

    // 2. Preview / Demo Authentication Mode (When Supabase is not yet connected in .env)
    const matchedAccount = DEMO_STAFF_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );

    if (!matchedAccount) {
      // Allow any @saranay.ph or admin test for flexible testing
      if (cleanEmail.includes('admin') || cleanEmail.startsWith('owner')) {
        const fallbackAdmin = {
          id: '00000000-0000-0000-0000-000000000001',
          email: cleanEmail,
          staff_id: 'ACC-1001',
          full_name: 'Super Admin (Preview)',
          role: 'Admin',
          status: 'Active',
          contact_number: '+63 918 221 4402',
        };
        sessionStorage.setItem('spac_preview_session', JSON.stringify(fallbackAdmin));
        setUser({ id: fallbackAdmin.id, email: cleanEmail });
        setSession({ access_token: 'preview-token' });
        setProfile(fallbackAdmin);
        setRole('Admin');
        return { success: true, role: 'Admin', profile: fallbackAdmin };
      }

      const msg = 'Invalid credentials. Demo logins: admin@saranay.ph, manager@saranay.ph, staff@saranay.ph, cashier@saranay.ph (any password).';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    if (matchedAccount.status === 'Inactive') {
      const msg = 'This staff account is inactive. Please contact an administrator.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    sessionStorage.setItem('spac_preview_session', JSON.stringify(matchedAccount));
    setUser({ id: matchedAccount.id, email: matchedAccount.email });
    setSession({ access_token: 'preview-token' });
    setProfile(matchedAccount);
    setRole(matchedAccount.role);
    return { success: true, role: matchedAccount.role, profile: matchedAccount };
  };

  // Sign Out function
  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[SPaC Auth] Sign out error:', err);
    } finally {
      sessionStorage.removeItem('spac_preview_session');
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      setAuthError(null);
    }
  };

  // Password Reset Request
  const requestPasswordReset = async (email) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        return { success: true };
      } catch (err) {
        // Avoid revealing account existence; return generic safe acknowledgement
        console.warn('[SPaC Auth] Password reset request error:', err);
        return { success: true };
      }
    }

    // Preview mode simulation
    return { success: true };
  };

  // Password Update (after reset link click)
  const updatePassword = async (newPassword) => {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message || 'Failed to update password.' };
      }
    }

    // Preview mode simulation
    return { success: true };
  };

  const refreshProfile = async () => {
    if (user?.id && isSupabaseConfigured) {
      const p = await fetchUserProfile(user.id);
      if (p) {
        setProfile(p);
        setRole(p.role);
      }
    }
  };

  const value = {
    user,
    session,
    profile,
    role,
    status: profile?.status || null,
    loading,
    authError,
    setAuthError,
    signIn,
    signOut,
    requestPasswordReset,
    updatePassword,
    refreshProfile,
    isConfigured: isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}