import type { FinanceData } from '@/types/finance'

/**
 * Datos de demostración generados desde Finanzaspersonales.xlsx y CSV IBKR.
 * Regenerar: node scripts/generate-seed.mjs
 * Los datos personales del CSV (nombre, cuenta, etc.) no se incluyen.
 */
export const seedData: FinanceData = {
  incomes: [
    {
      id: "inc-seed-1",
      date: "2026-05-29",
      source: "Trabajo",
      amount: 116,
      currency: "EUR",
      account: "Efectivo",
      notes: "Propina 07-05 a 29-05"
    },
    {
      id: "inc-seed-2",
      date: "2026-05-06",
      source: "Trabajo",
      amount: 123.7,
      currency: "EUR",
      account: "Efectivo",
      notes: "Propina 27-03 a 06-05"
    },
    {
      id: "inc-seed-3",
      date: "2026-04-30",
      source: "Trabajo",
      amount: 1437.99,
      currency: "EUR",
      account: "Santander",
      notes: "Nomina abril"
    },
    {
      id: "inc-seed-4",
      date: "2026-03-30",
      source: "Trabajo",
      amount: 230.81,
      currency: "EUR",
      account: "Santander",
      notes: "Nomina marzo"
    },
    {
      id: "inc-seed-5",
      date: "2026-01-09",
      source: "Trabajo",
      amount: 1494.3,
      currency: "EUR",
      account: "Santander",
      notes: "Ingresos enero manpower"
    },
    {
      id: "inc-seed-6",
      date: "2026-05-30",
      source: "Trabajo",
      amount: 1437.99,
      currency: "EUR",
      account: "Santander",
      notes: ""
    }
  ],
  expenses: [
    {
      id: "exp-seed-1",
      date: "2026-05-28",
      category: "Otro",
      detail: "Aire",
      amount: 1.5,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-2",
      date: "2026-05-27",
      category: "Suscripciones",
      detail: "Spotify",
      amount: 11.99,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-3",
      date: "2026-05-25",
      category: "Transporte",
      detail: "Estanco bus",
      amount: 9.9,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-4",
      date: "2026-05-25",
      category: "Comida",
      detail: "Burritos y helado",
      amount: 20.8,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-5",
      date: "2026-05-22",
      category: "Super",
      detail: "Charter",
      amount: 0.89,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-6",
      date: "2026-05-21",
      category: "Super",
      detail: "Consum",
      amount: 4.08,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-7",
      date: "2026-05-20",
      category: "OCIO",
      detail: "Birra sadi",
      amount: 6,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-8",
      date: "2026-05-19",
      category: "OCIO",
      detail: "Mercabanal birra",
      amount: 3.5,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-9",
      date: "2026-05-19",
      category: "Super",
      detail: "Consum",
      amount: 2.75,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-10",
      date: "2026-05-19",
      category: "OCIO",
      detail: "Esquinita mia",
      amount: 5.5,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-11",
      date: "2026-05-18",
      category: "OCIO",
      detail: "Mercabanal",
      amount: 6.65,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-12",
      date: "2026-05-16",
      category: "Super",
      detail: "Consum",
      amount: 1.8,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-13",
      date: "2026-05-11",
      category: "Viaje",
      detail: "Renfe cercanias",
      amount: 11.1,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-14",
      date: "2026-05-08",
      category: "Super",
      detail: "Comida stock",
      amount: 20.74,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-15",
      date: "2026-05-07",
      category: "Transporte",
      detail: "Uber llegada tarde",
      amount: 9.06,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-16",
      date: "2026-05-04",
      category: "Devolucion",
      detail: "Pago euge",
      amount: 226.3,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-17",
      date: "2026-05-04",
      category: "Devolucion",
      detail: "Pago Emi",
      amount: 291.62,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-18",
      date: "2026-05-04",
      category: "Devolucion",
      detail: "Pago lucho",
      amount: 459.68,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-19",
      date: "2026-05-02",
      category: "Viaje",
      detail: "Tren de Nord",
      amount: 16.05,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-20",
      date: "2026-04-30",
      category: "Comida",
      detail: "Muerde la pasta",
      amount: 10.95,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-21",
      date: "2026-04-25",
      category: "Super",
      detail: "Consum",
      amount: 22.05,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-22",
      date: "2026-04-25",
      category: "Super",
      detail: "Consum",
      amount: 7.79,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-23",
      date: "2026-04-23",
      category: "Super",
      detail: "Consum",
      amount: 3.12,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-24",
      date: "2026-04-23",
      category: "Super",
      detail: "Consum",
      amount: 6.16,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-25",
      date: "2026-04-22",
      category: "Super",
      detail: "Consum",
      amount: 2.08,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-26",
      date: "2026-04-21",
      category: "Transporte",
      detail: "Bondii",
      amount: 2,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-27",
      date: "2026-04-20",
      category: "Alquiler",
      detail: "Alquiler mes abril",
      amount: 240,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-28",
      date: "2026-04-17",
      category: "Otro",
      detail: "Impresiones",
      amount: 0.1,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-29",
      date: "2026-04-16",
      category: "Otro",
      detail: "Impresiones",
      amount: 1.85,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-30",
      date: "2026-04-16",
      category: "Super",
      detail: "Consum",
      amount: 2.95,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-31",
      date: "2026-04-15",
      category: "Super",
      detail: "Consum",
      amount: 13.29,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-32",
      date: "2026-04-04",
      category: "Super",
      detail: "Consum",
      amount: 14.4,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-33",
      date: "2026-04-03",
      category: "Super",
      detail: "Consum",
      amount: 0.96,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-34",
      date: "2026-04-02",
      category: "Super",
      detail: "Consum",
      amount: 7.8,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-35",
      date: "2026-04-02",
      category: "Transporte",
      detail: "Bondi",
      amount: 2,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-36",
      date: "2026-04-02",
      category: "Super",
      detail: "Consum",
      amount: 6.16,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-37",
      date: "2026-04-01",
      category: "Super",
      detail: "Consum",
      amount: 12.48,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-38",
      date: "2026-03-20",
      category: "Alquiler",
      detail: "Alquiler mes marzo",
      amount: 240,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-39",
      date: "2026-03-15",
      category: "Devolucion",
      detail: "Pago deuda euge",
      amount: 1000,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-40",
      date: "2026-03-01",
      category: "Super",
      detail: "Gastos marzo simplificado",
      amount: 242.48,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-41",
      date: "2026-02-20",
      category: "Alquiler",
      detail: "Alquiler mes febrero",
      amount: 240,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-42",
      date: "2026-02-01",
      category: "Super",
      detail: "Gastos febrero simplificado",
      amount: 229.24,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-43",
      date: "2026-01-20",
      category: "Alquiler",
      detail: "Alquiler mes enerto",
      amount: 240,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-44",
      date: "2026-01-01",
      category: "Super",
      detail: "Gastos enero simplificado",
      amount: 140.55,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    },
    {
      id: "exp-seed-45",
      date: "2025-12-20",
      category: "Alquiler",
      detail: "Alquiler mes diciembre",
      amount: 240,
      currency: "EUR",
      paymentMethod: "Santander",
      notes: ""
    }
  ],
  accountBalances: [
    {
      account: "Efectivo",
      amount: 8060,
      currency: "EUR"
    },
    {
      account: "Wells Fargo Checking",
      amount: 20206.22,
      currency: "USD"
    },
    {
      account: "Wells Fargo AC",
      amount: 0,
      currency: "USD"
    },
    {
      account: "Capital One Savings",
      amount: 5092.23,
      currency: "USD"
    },
    {
      account: "Capital One Credit",
      amount: 0,
      currency: "USD"
    },
    {
      account: "Discover Credit",
      amount: 0,
      currency: "USD"
    },
    {
      account: "Santander",
      amount: 0,
      currency: "EUR"
    },
    {
      account: "IBKR",
      amount: 7546.16,
      currency: "USD"
    },
    {
      account: "TradeRepublic",
      amount: 0,
      currency: "EUR"
    }
  ],
  savedAccounts: [
    "Capital One Credit",
    "Capital One Savings",
    "Discover Credit",
    "Efectivo",
    "IBKR",
    "Santander",
    "TradeRepublic",
    "Wells Fargo AC",
    "Wells Fargo Checking"
  ],
  debts: [
    {
      id: "debt-seed-1",
      name: "Emi",
      amount: 66.35,
      currency: "EUR"
    },
    {
      id: "debt-seed-2",
      name: "Euge",
      amount: 1446.52,
      currency: "EUR"
    },
    {
      id: "debt-seed-3",
      name: "Lucho",
      amount: 105.6,
      currency: "EUR"
    }
  ],
  holdings: [
    {
      id: "hold-seed-1",
      ticker: "CSPX",
      platform: "IBKR",
      units: 0.949,
      avgPrice: 792.091359326,
      currentPrice: 794.13
    },
    {
      id: "hold-seed-2",
      ticker: "EIMI",
      platform: "IBKR",
      units: 18.1653,
      avgPrice: 55.147989023,
      currentPrice: 54.96
    },
    {
      id: "hold-seed-3",
      ticker: "IGLN",
      platform: "IBKR",
      units: 2,
      avgPrice: 93.76,
      currentPrice: 79.185
    },
    {
      id: "hold-seed-4",
      ticker: "MSFT",
      platform: "IBKR",
      units: 0.83,
      avgPrice: 413.295450602,
      currentPrice: 372.97
    },
    {
      id: "hold-seed-5",
      ticker: "O",
      platform: "IBKR",
      units: 2.3518,
      avgPrice: 64.205209201,
      currentPrice: 63.12
    },
    {
      id: "hold-seed-6",
      ticker: "VUSD",
      platform: "IBKR",
      units: 3.7036,
      avgPrice: 136.082730316,
      currentPrice: 139.6925
    },
    {
      id: "hold-seed-7",
      ticker: "VWRA",
      platform: "IBKR",
      units: 20.058,
      avgPrice: 189.715474723,
      currentPrice: 186.64
    },
    {
      id: "hold-seed-8",
      ticker: "EM IMI",
      platform: "TradeRepublic",
      units: 2.324554,
      avgPrice: 43.45,
      currentPrice: 47.98
    },
    {
      id: "hold-seed-9",
      ticker: "MSCI World",
      platform: "TradeRepublic",
      units: 0.855895,
      avgPrice: 115.67,
      currentPrice: 123.37
    }
  ],
  fixedIncome: [],
  balanceHistory: [
    {
      date: "2026-05-12",
      balanceUSD: 40858.45,
      debtUSD: 0,
      balanceEUR: 934.25,
      debtEUR: 2141.84
    },
    {
      date: "2026-05-12",
      balanceUSD: 40858.45,
      debtUSD: 0,
      balanceEUR: 934.25,
      debtEUR: 2141.84
    },
    {
      date: "2026-05-29",
      balanceUSD: 40904.61,
      debtUSD: 0,
      balanceEUR: 962.8399999999999,
      debtEUR: 2492.6899999999996
    }
  ],
  settings: {
    defaultCurrency: "EUR",
    exchangeRates: {
      EUR: 1,
      USD: 1.08,
      ARS: 1200
    },
    fiscalYear: 2026,
    projection: {
      initialCapital: 5000,
      monthlyContribution: 200,
      annualGrowthRate: 0.07,
      years: 10
    }
  }
}
