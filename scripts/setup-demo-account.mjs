/**
 * Crea la cuenta demo en Supabase y carga datos ficticios de ejemplo.
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
  { date: '2026-06-30', source: 'Salario', amount: 2450, currency: 'EUR', account: 'Cuenta Nómina', notes: 'Nómina junio' },
  { date: '2026-06-15', source: 'Freelance', amount: 680, currency: 'EUR', account: 'Revolut', notes: 'Proyecto diseño web' },
  { date: '2026-06-08', source: 'Reembolso', amount: 34.5, currency: 'EUR', account: 'Cuenta Nómina', notes: 'Devolución compra online' },
  { date: '2026-06-03', source: 'Inversiones', amount: 42.8, currency: 'EUR', account: 'Degiro', notes: 'Dividendo ETF acumulativo' },
  { date: '2026-05-31', source: 'Salario', amount: 2450, currency: 'EUR', account: 'Cuenta Nómina', notes: 'Nómina mayo' },
  { date: '2026-05-22', source: 'Freelance', amount: 520, currency: 'EUR', account: 'Revolut', notes: 'Consultoría marketing digital' },
  { date: '2026-05-18', source: 'Alquiler', amount: 350, currency: 'EUR', account: 'Revolut', notes: 'Ingreso por habitación alquilada' },
  { date: '2026-05-12', source: 'Venta', amount: 85, currency: 'EUR', account: 'Efectivo', notes: 'Venta mueble de segunda mano' },
  { date: '2026-05-05', source: 'Reembolso', amount: 120, currency: 'EUR', account: 'Cuenta Nómina', notes: 'Reembolso seguro médico' },
  { date: '2026-05-01', source: 'Salario', amount: 400, currency: 'EUR', account: 'Cuenta Nómina', notes: 'Bonus trimestral' },
]

const demoExpenses = [
  { date: '2026-06-28', category: 'Vivienda', detail: 'Alquiler junio', amount: 750, currency: 'EUR', paymentMethod: 'Cuenta Nómina' },
  { date: '2026-06-25', category: 'Alimentación', detail: 'Compra semanal supermercado', amount: 78.45, currency: 'EUR', paymentMethod: 'Revolut' },
  { date: '2026-06-20', category: 'Transporte', detail: 'Abono transporte público', amount: 35, currency: 'EUR', paymentMethod: 'Revolut' },
  { date: '2026-06-15', category: 'Suscripciones', detail: 'Streaming y música', amount: 22.98, currency: 'EUR', paymentMethod: 'Cuenta Nómina' },
  { date: '2026-06-10', category: 'Ocio', detail: 'Cena en restaurante', amount: 58.3, currency: 'EUR', paymentMethod: 'Revolut' },
  { date: '2026-05-28', category: 'Salud', detail: 'Farmacia y parafarmacia', amount: 24.6, currency: 'EUR', paymentMethod: 'Cuenta Nómina' },
  { date: '2026-05-22', category: 'Servicios', detail: 'Factura electricidad', amount: 68.4, currency: 'EUR', paymentMethod: 'Cuenta Nómina' },
  { date: '2026-05-18', category: 'Alimentación', detail: 'Compra mensual alimentación', amount: 92.15, currency: 'EUR', paymentMethod: 'Revolut' },
  { date: '2026-05-12', category: 'Transporte', detail: 'Repostaje', amount: 45.8, currency: 'EUR', paymentMethod: 'Revolut' },
  { date: '2026-05-05', category: 'Ocio', detail: 'Entradas concierto', amount: 65, currency: 'EUR', paymentMethod: 'Cuenta Nómina' },
]

const demoInvestments = [
  { asset: 'VWCE', platform: 'Degiro', quantity: 15, buy_price: 102.5, current_price: 108.2, currency: 'USD' },
  { asset: 'MSFT', platform: 'Degiro', quantity: 3, buy_price: 380, current_price: 415.5, currency: 'USD' },
  { asset: 'NVDA', platform: 'Interactive Brokers', quantity: 5, buy_price: 125, current_price: 142.3, currency: 'USD' },
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

  const retry = await supabase.auth.signInWithPassword({ email, password })
  if (retry.error || !retry.data.user) {
    console.error('Cuenta creada pero no se pudo iniciar sesión:', retry.error?.message)
    console.log('Confirma el email en Supabase Dashboard o desactiva confirmación por email.')
    process.exit(1)
  }

  console.log('✓ Cuenta demo creada:', email)
  return retry.data.user
}

async function clearDemoData(userId) {
  const { error: txDelError } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)

  if (txDelError) {
    console.error('Error al borrar transacciones demo:', txDelError.message)
    process.exit(1)
  }

  const { error: invDelError } = await supabase
    .from('investments')
    .delete()
    .eq('user_id', userId)

  if (invDelError) {
    console.error('Error al borrar inversiones demo:', invDelError.message)
    process.exit(1)
  }

  console.log('✓ Datos anteriores de la cuenta demo eliminados')
}

async function seedDemoData(userId) {
  await clearDemoData(userId)

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