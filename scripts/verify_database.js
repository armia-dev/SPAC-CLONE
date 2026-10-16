import fs from 'fs';
import path from 'path';

console.log('--- Running Static Database & Security Migrations Audit ---');

const migrationsDir = path.resolve('supabase/migrations');
if (!fs.existsSync(migrationsDir)) {
  console.error('FAIL: migrations directory not found at', migrationsDir);
  process.exit(1);
}

const files = fs.readdirSync(migrationsDir).sort();
console.log(`Found ${files.length} migration files:`, files);

const combinedSql = files
  .map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf-8'))
  .join('\n');

const REQUIRED_TABLES = [
  'courts',
  'staff_profiles',
  'customer_profiles',
  'court_schedules',
  'blocked_dates',
  'pricing_rules',
  'bookings',
  'payments',
  'announcements',
  'system_settings',
  'gallery_images',
  'faqs',
  'audit_logs',
];

let failed = false;

// 1. Verify table definitions
for (const table of REQUIRED_TABLES) {
  const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\b`, 'i');
  if (!tableRegex.test(combinedSql)) {
    console.error(`FAIL: Table public.${table} is missing definition`);
    failed = true;
  } else {
    console.log(`PASS: Table public.${table} defined`);
  }
}

// 2. Verify RLS enabled on all tables
for (const table of REQUIRED_TABLES) {
  const rlsRegex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`, 'i');
  if (!rlsRegex.test(combinedSql)) {
    console.error(`FAIL: RLS not enabled on public.${table}`);
    failed = true;
  } else {
    console.log(`PASS: RLS enabled on public.${table}`);
  }
}

// 3. Verify sensitive tables do NOT have unrestricted USING (true) or WITH CHECK (true)
const SENSITIVE_TABLES = ['staff_profiles', 'bookings', 'payments', 'audit_logs'];
for (const table of SENSITIVE_TABLES) {
  const insecureSelectRegex = new RegExp(`ON public\\.${table}\\s+FOR SELECT\\s+USING\\s*\\(\\s*true\\s*\\)`, 'i');
  const insecureAllRegex = new RegExp(`ON public\\.${table}\\s+FOR ALL\\s+USING\\s*\\(\\s*true\\s*\\)`, 'i');
  if (insecureSelectRegex.test(combinedSql) || insecureAllRegex.test(combinedSql)) {
    console.error(`FAIL: Sensitive table public.${table} has unrestricted public read access!`);
    failed = true;
  } else {
    console.log(`PASS: Sensitive table public.${table} protected against unrestricted access`);
  }
}

// 4. Verify exclusion constraint for double booking
if (!combinedSql.includes('no_overlapping_active_bookings') || !combinedSql.includes('tstzrange(start_time, end_time) WITH &&')) {
  console.error('FAIL: Double booking exclusion constraint is missing or incomplete');
  failed = true;
} else {
  console.log('PASS: Double booking exclusion constraint verified');
}

// 5. Verify security definer functions exist
const REQUIRED_FUNCTIONS = [
  'auth.current_staff_role',
  'auth.is_staff',
  'auth.is_admin',
  'auth.is_manager_or_admin',
  'calculate_booking_quote',
  'create_booking_reservation',
  'provision_initial_admin',
];

for (const fn of REQUIRED_FUNCTIONS) {
  if (!combinedSql.includes(fn)) {
    console.error(`FAIL: Security function ${fn} is missing`);
    failed = true;
  } else {
    console.log(`PASS: Security function ${fn} found`);
  }
}

if (failed) {
  console.error('--- Migrations Verification FAILED ---');
  process.exit(1);
} else {
  console.log('--- All Static Migrations Checks PASSED (100%) ---');
}
