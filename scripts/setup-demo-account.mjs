/**
 * Crea la cuenta demo en Supabase y opcionalmente carga datos de ejemplo.
 * Uso: node scripts/setup-demo-account.mjs
 * Requiere VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local
 */
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnvFile(filename) {
  const path = join(root, filename)
  if (!existsSync(path)) return {}
  const vars = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

const env = { ...loadEnvFile('.env'), ...loadEnvFile('.env.local') }

const url = env.VITE_SUPABASE_URL
const anonKey = env.VITE_SUPABASE_ANON_KEY
const email = env.VITE_DEMO_EMAIL || 'demo@ecoport.io'
const password = env.VITE_DEMO_PASSWORD
if (!password) {
  console.error('Define VITE_DEMO_PASSWORD en .env.local antes de ejecutar setup:demo')
  process.exit(1)
}

if (!url || !anonKey) {
  console.error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

const demoIncomes = [
  { date: '2026-05-15', source: 'Salario', amount: 2500, currency: 'EUR', account: 'Santander', notes: 'Nómina mayo (demo)' },
  { date: '2026-04-15', source: 'Salario', amount: 2500, currency: 'EUR', account: 'Santander', notes: 'Nómina abril (demo)' },
  { date: '2026-05-20', source: 'Freelance', amount: 450, currency: 'EUR', account: 'Efectivo', notes: 'Proyecto demo' },
]

const demoExpenses = [
  { date: '2026-05-28', category: 'Super', detail: 'Compra semanal', amount: 85.4, currency: 'EUR', paymentMethod: 'Santander' },
  { date: '2026-05-25', category: 'Transporte', detail: 'Abono mensual', amount: 40, currency: 'EUR', paymentMethod: 'Santander' },
  { date: '2026-05-20', category: 'Alquiler', detail: 'Alquiler mayo', amount: 800, currency: 'EUR', paymentMethod: 'Santander' },
  { date: '2026-05-18', category: 'Suscripciones', detail: 'Streaming', amount: 12.99, currency: 'EUR', paymentMethod: 'Santander' },
  { date: '2026-05-10', category: 'OCIO', detail: 'Cena restaurante', amount: 45, currency: 'EUR', paymentMethod: 'Santander' },
]

const demoInvestments = [
  { asset: 'VWCE', platform: 'IBKR', quantity: 10, buy_price: 100, current_price: 105, currency: 'USD' },
  { asset: 'MSFT', platform: 'IBKR', quantity: 2, buy_price: 400, current_price: 420, currency: 'USD' },
]

async function ensureDemoUser() {
  let { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (!signInError && signIn.user) {
    console.log('✓ Cuenta demo ya existe:', email)
    return signIn.user
  }

  if (signInError?.message === 'Email not confirmed') {
    console.error('La cuenta demo existe pero el email no está confirmado.')
    console.log('\n→ Supabase Dashboard → Authentication → Users')
    console.log('  Busca', email, 'y pulsa "Confirm email"')
    console.log('  O desactiva "Confirm email" en Authentication → Providers → Email\n')
    process.exit(1)
  }

  if (signInError?.message?.includes('rate limit')) {
    console.error('Límite de Supabase alcanzado. Espera 1 minuto y vuelve a ejecutar.')
    process.exit(1)
  }

  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Usuario Demo' } },
  })

  if (signUpError) {
    console.error('Error al crear cuenta demo:', signUpError.message)
    if (signUpError.message.includes('confirm')) {
      console.log('\n→ Desactiva "Confirm email" en Supabase → Authentication → Providers → Email')
      console.log('  o confirma el email manualmente en Authentication → Users')
    }
    process.exit(1)
  }

  if (signUp.session?.user) {
    console.log('✓ Cuenta demo creada y confirmada:', email)
    return signUp.session.user
  }

  // Reintento login (email confirmation off)
  const retry = await supabase.auth.signInWithPassword({ email, password })
  if (retry.error || !retry.data.user) {
    console.error('Cuenta creada pero no se pudo iniciar sesión:', retry.error?.message)
    console.log('Confirma el email en Supabase Dashboard o desactiva confirmación por email.')
    process.exit(1)
  }

  console.log('✓ Cuenta demo creada:', email)
  return retry.data.user
}

async function seedDemoData(userId) {
  const { count } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (count && count > 0) {
    console.log(`✓ La cuenta demo ya tiene ${count} transacciones — omitiendo seed`)
    return
  }

  const incomeRows = demoIncomes.map((i) => ({
    user_id: userId,
    type: 'income',
    amount: i.amount,
    currency: i.currency,
    category_name: i.source,
    date: i.date,
    description: i.source,
    account: i.account,
    metadata: { notes: i.notes },
  }))

  const expenseRows = demoExpenses.map((e) => ({
    user_id: userId,
    type: 'expense',
    amount: e.amount,
    currency: e.currency,
    category_name: e.category,
    date: e.date,
    description: e.detail,
    account: e.paymentMethod,
    metadata: { notes: '' },
  }))

  const { error: txError } = await supabase
    .from('transactions')
    .insert([...incomeRows, ...expenseRows])

  if (txError) {
    console.error('Error al insertar transacciones demo:', txError.message)
    process.exit(1)
  }
  console.log(`✓ ${incomeRows.length + expenseRows.length} transacciones demo insertadas`)

  const { count: invCount } = await supabase
    .from('investments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (!invCount || invCount === 0) {
    const invRows = demoInvestments.map((inv) => ({
      user_id: userId,
      ...inv,
    }))
    const { error: invError } = await supabase.from('investments').insert(invRows)
    if (invError) {
      console.warn('Aviso inversiones demo:', invError.message)
    } else {
      console.log(`✓ ${invRows.length} inversiones demo insertadas`)
    }
  }
}

async function main() {
  console.log('Configurando cuenta demo EcoPort…\n')
  const user = await ensureDemoUser()
  await seedDemoData(user.id)
  console.log('\nListo. Credenciales demo:')
  console.log('  Email:   ', email)
  console.log('  Password:', password)
  console.log('\nAñade en Vercel / .env.local:')
  console.log('  VITE_DEMO_ENABLED=true')
  console.log('  VITE_DEMO_EMAIL=' + email)
  console.log('  VITE_DEMO_PASSWORD=' + password)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})