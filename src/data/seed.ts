import type { FinanceData } from '@/types/finance'

/**
 * Datos de demostración ficticios para desarrollo offline.
 * No contiene información financiera real.
 */
export const seedData: FinanceData = {
  incomes: [
    {
      id: 'inc-demo-1',
      date: '2026-05-15',
      source: 'Salario',
      amount: 2500,
      currency: 'EUR',
      account: 'Santander',
      notes: 'Nómina mayo (demo)',
    },
    {
      id: 'inc-demo-2',
      date: '2026-04-15',
      source: 'Salario',
      amount: 2500,
      currency: 'EUR',
      account: 'Santander',
      notes: 'Nómina abril (demo)',
    },
    {
      id: 'inc-demo-3',
      date: '2026-05-20',
      source: 'Freelance',
      amount: 450,
      currency: 'EUR',
      account: 'Efectivo',
      notes: 'Proyecto demo',
    },
  ],
  expenses: [
    { id: 'exp-demo-1', date: '2026-05-28', category: 'Super', detail: 'Compra semanal', amount: 85.4, currency: 'EUR', paymentMethod: 'Santander', notes: '' },
    { id: 'exp-demo-2', date: '2026-05-25', category: 'Transporte', detail: 'Abono mensual', amount: 40, currency: 'EUR', paymentMethod: 'Santander', notes: '' },
    { id: 'exp-demo-3', date: '2026-05-20', category: 'Alquiler', detail: 'Alquiler mayo', amount: 800, currency: 'EUR', paymentMethod: 'Santander', notes: '' },
    { id: 'exp-demo-4', date: '2026-05-18', category: 'Suscripciones', detail: 'Streaming', amount: 12.99, currency: 'EUR', paymentMethod: 'Santander', notes: '' },
    { id: 'exp-demo-5', date: '2026-05-10', category: 'OCIO', detail: 'Cena restaurante', amount: 45, currency: 'EUR', paymentMethod: 'Santander', notes: '' },
    { id: 'exp-demo-6', date: '2026-05-05', category: 'Comida', detail: 'Delivery', amount: 22.5, currency: 'EUR', paymentMethod: 'Santander', notes: '' },
    { id: 'exp-demo-7', date: '2026-04-20', category: 'Alquiler', detail: 'Alquiler abril', amount: 800, currency: 'EUR', paymentMethod: 'Santander', notes: '' },
    { id: 'exp-demo-8', date: '2026-04-15', category: 'Super', detail: 'Compra mensual', amount: 120, currency: 'EUR', paymentMethod: 'Santander', notes: '' },
  ],
  accountBalances: [
    { account: 'Efectivo', amount: 500, currency: 'EUR' },
    { account: 'Santander', amount: 3200, currency: 'EUR' },
    { account: 'Wells Fargo Checking', amount: 5000, currency: 'USD' },
    { account: 'IBKR', amount: 10000, currency: 'USD' },
    { account: 'TradeRepublic', amount: 1500, currency: 'EUR' },
  ],
  debts: [
    { id: 'debt-demo-1', name: 'Préstamo familiar', amount: 200, currency: 'EUR' },
    { id: 'debt-demo-2', name: 'Tarjeta', amount: 350, currency: 'EUR' },
  ],
  holdings: [
    { id: 'hold-demo-1', ticker: 'VWCE', platform: 'IBKR', units: 10, avgPrice: 100, currentPrice: 105 },
    { id: 'hold-demo-2', ticker: 'MSFT', platform: 'IBKR', units: 2, avgPrice: 400, currentPrice: 420 },
    { id: 'hold-demo-3', ticker: 'MSCI World', platform: 'TradeRepublic', units: 5, avgPrice: 50, currentPrice: 52 },
  ],
  fixedIncome: [
    { id: 'fi-demo-1', bank: 'Banco Demo', type: 'Depósito', capital: 5000, annualRate: 0.03 },
  ],
  balanceHistory: [
    { date: '2026-04-30', balanceUSD: 15000, debtUSD: 0, balanceEUR: 4000, debtEUR: 550 },
    { date: '2026-05-31', balanceUSD: 15000, debtUSD: 0, balanceEUR: 4200, debtEUR: 550 },
  ],
  settings: {
    defaultCurrency: 'EUR',
    exchangeRates: { EUR: 1, USD: 1.08, ARS: 1200 },
    fiscalYear: 2026,
    projection: {
      initialCapital: 5000,
      monthlyContribution: 200,
      annualGrowthRate: 0.07,
      years: 10,
    },
  },
}