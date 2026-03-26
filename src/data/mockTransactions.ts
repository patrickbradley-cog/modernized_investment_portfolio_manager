import type { Transaction, TransactionType, TransactionStatus } from '../types/transaction';

// Seed data: 20 transactions across all types and statuses
// Field values match TRNREC.cpy constraints:
//   Account: 9-digit numeric (>= 100000000)
//   Portfolio ID: 8-char alphanumeric
//   Fund ID: 6-char alphanumeric
//   Quantity/Price: 4 decimal places (COMP-3)
const seedTransactions: Transaction[] = [
  {
    transactionId: '20260315-0001',
    transactionType: 'BU',
    accountNumber: '100000001',
    portfolioId: 'PORT0001',
    transactionDate: '2026-03-15',
    fundId: 'AAPL01',
    quantity: 100.0000,
    price: 185.5000,
    amount: 18550.0000,
    currency: 'USD',
    status: 'P',
  },
  {
    transactionId: '20260315-0002',
    transactionType: 'SL',
    accountNumber: '100000002',
    portfolioId: 'PORT0002',
    transactionDate: '2026-03-15',
    fundId: 'MSFT02',
    quantity: 50.0000,
    price: 420.2500,
    amount: 21012.5000,
    currency: 'USD',
    status: 'D',
  },
  {
    transactionId: '20260314-0001',
    transactionType: 'TR',
    accountNumber: '100000003',
    portfolioId: 'PORT0003',
    transactionDate: '2026-03-14',
    fundId: 'BOND03',
    quantity: 200.0000,
    price: 0.0000,
    amount: 0.0000,
    currency: 'USD',
    status: 'P',
    sourceAccount: '100000003',
    destinationAccount: '100000004',
  },
  {
    transactionId: '20260314-0002',
    transactionType: 'FE',
    accountNumber: '100000001',
    portfolioId: 'PORT0001',
    transactionDate: '2026-03-14',
    fundId: '',
    quantity: 0.0000,
    price: 0.0000,
    amount: 25.0000,
    currency: 'USD',
    status: 'D',
    description: 'Annual management fee',
  },
  {
    transactionId: '20260313-0001',
    transactionType: 'BU',
    accountNumber: '100000005',
    portfolioId: 'PORT0004',
    transactionDate: '2026-03-13',
    fundId: 'GOOGL1',
    quantity: 25.0000,
    price: 172.3000,
    amount: 4307.5000,
    currency: 'USD',
    status: 'F',
  },
  {
    transactionId: '20260313-0002',
    transactionType: 'SL',
    accountNumber: '100000006',
    portfolioId: 'PORT0005',
    transactionDate: '2026-03-13',
    fundId: 'AMZN01',
    quantity: 30.0000,
    price: 195.7500,
    amount: 5872.5000,
    currency: 'USD',
    status: 'R',
  },
  {
    transactionId: '20260312-0001',
    transactionType: 'BU',
    accountNumber: '100000002',
    portfolioId: 'PORT0002',
    transactionDate: '2026-03-12',
    fundId: 'TSLA01',
    quantity: 75.0000,
    price: 245.0000,
    amount: 18375.0000,
    currency: 'USD',
    status: 'D',
  },
  {
    transactionId: '20260312-0002',
    transactionType: 'TR',
    accountNumber: '100000007',
    portfolioId: 'PORT0006',
    transactionDate: '2026-03-12',
    fundId: 'AAPL01',
    quantity: 50.0000,
    price: 0.0000,
    amount: 0.0000,
    currency: 'USD',
    status: 'D',
    sourceAccount: '100000007',
    destinationAccount: '100000008',
  },
  {
    transactionId: '20260311-0001',
    transactionType: 'FE',
    accountNumber: '100000005',
    portfolioId: 'PORT0004',
    transactionDate: '2026-03-11',
    fundId: '',
    quantity: 0.0000,
    price: 0.0000,
    amount: 15.5000,
    currency: 'USD',
    status: 'P',
    description: 'Wire transfer fee',
  },
  {
    transactionId: '20260311-0002',
    transactionType: 'BU',
    accountNumber: '100000009',
    portfolioId: 'PORT0007',
    transactionDate: '2026-03-11',
    fundId: 'NVDA01',
    quantity: 40.0000,
    price: 890.0000,
    amount: 35600.0000,
    currency: 'USD',
    status: 'P',
  },
  {
    transactionId: '20260310-0001',
    transactionType: 'SL',
    accountNumber: '100000001',
    portfolioId: 'PORT0001',
    transactionDate: '2026-03-10',
    fundId: 'BOND03',
    quantity: 150.0000,
    price: 98.5000,
    amount: 14775.0000,
    currency: 'USD',
    status: 'D',
  },
  {
    transactionId: '20260310-0002',
    transactionType: 'TR',
    accountNumber: '100000010',
    portfolioId: 'PORT0008',
    transactionDate: '2026-03-10',
    fundId: 'MSFT02',
    quantity: 100.0000,
    price: 0.0000,
    amount: 0.0000,
    currency: 'USD',
    status: 'F',
    sourceAccount: '100000010',
    destinationAccount: '100000011',
  },
  {
    transactionId: '20260309-0001',
    transactionType: 'FE',
    accountNumber: '100000002',
    portfolioId: 'PORT0002',
    transactionDate: '2026-03-09',
    fundId: '',
    quantity: 0.0000,
    price: 0.0000,
    amount: 50.0000,
    currency: 'USD',
    status: 'D',
    description: 'Quarterly advisory fee',
  },
  {
    transactionId: '20260309-0002',
    transactionType: 'BU',
    accountNumber: '100000003',
    portfolioId: 'PORT0003',
    transactionDate: '2026-03-09',
    fundId: 'META01',
    quantity: 60.0000,
    price: 510.2500,
    amount: 30615.0000,
    currency: 'USD',
    status: 'R',
  },
  {
    transactionId: '20260308-0001',
    transactionType: 'SL',
    accountNumber: '100000004',
    portfolioId: 'PORT0003',
    transactionDate: '2026-03-08',
    fundId: 'AAPL01',
    quantity: 80.0000,
    price: 182.0000,
    amount: 14560.0000,
    currency: 'USD',
    status: 'P',
  },
  {
    transactionId: '20260308-0002',
    transactionType: 'BU',
    accountNumber: '100000006',
    portfolioId: 'PORT0005',
    transactionDate: '2026-03-08',
    fundId: 'INTC01',
    quantity: 200.0000,
    price: 32.7500,
    amount: 6550.0000,
    currency: 'USD',
    status: 'D',
  },
  {
    transactionId: '20260307-0001',
    transactionType: 'TR',
    accountNumber: '100000012',
    portfolioId: 'PORT0009',
    transactionDate: '2026-03-07',
    fundId: 'TSLA01',
    quantity: 25.0000,
    price: 0.0000,
    amount: 0.0000,
    currency: 'USD',
    status: 'R',
    sourceAccount: '100000012',
    destinationAccount: '100000013',
  },
  {
    transactionId: '20260307-0002',
    transactionType: 'FE',
    accountNumber: '100000009',
    portfolioId: 'PORT0007',
    transactionDate: '2026-03-07',
    fundId: '',
    quantity: 0.0000,
    price: 0.0000,
    amount: 75.0000,
    currency: 'USD',
    status: 'F',
    description: 'Late payment penalty',
  },
  {
    transactionId: '20260306-0001',
    transactionType: 'SL',
    accountNumber: '100000008',
    portfolioId: 'PORT0006',
    transactionDate: '2026-03-06',
    fundId: 'NVDA01',
    quantity: 10.0000,
    price: 885.5000,
    amount: 8855.0000,
    currency: 'USD',
    status: 'D',
  },
  {
    transactionId: '20260306-0002',
    transactionType: 'BU',
    accountNumber: '100000011',
    portfolioId: 'PORT0010',
    transactionDate: '2026-03-06',
    fundId: 'BOND03',
    quantity: 500.0000,
    price: 99.2500,
    amount: 49625.0000,
    currency: 'USD',
    status: 'P',
  },
];

let sequenceCounter = seedTransactions.length;

function nextSequence(): number {
  sequenceCounter += 1;
  return sequenceCounter;
}

// In-memory transaction store
let transactions: Transaction[] = [...seedTransactions];

export const transactionStore = {
  getAll(): Transaction[] {
    return [...transactions];
  },

  getById(id: string): Transaction | undefined {
    return transactions.find((t) => t.transactionId === id);
  },

  add(transaction: Transaction): Transaction {
    transactions = [transaction, ...transactions];
    return transaction;
  },

  updateStatus(id: string, status: TransactionStatus): Transaction | undefined {
    const index = transactions.findIndex((t) => t.transactionId === id);
    if (index === -1) return undefined;
    transactions[index] = { ...transactions[index], status };
    return transactions[index];
  },

  filter(params: {
    status?: TransactionStatus;
    accountNumber?: string;
    startDate?: string;
    endDate?: string;
    transactionType?: TransactionType;
  }): Transaction[] {
    return transactions.filter((t) => {
      if (params.status && t.status !== params.status) return false;
      if (params.accountNumber && !t.accountNumber.includes(params.accountNumber)) return false;
      if (params.startDate && t.transactionDate < params.startDate) return false;
      if (params.endDate && t.transactionDate > params.endDate) return false;
      if (params.transactionType && t.transactionType !== params.transactionType) return false;
      return true;
    });
  },

  sort(list: Transaction[], field: keyof Transaction, direction: 'asc' | 'desc'): Transaction[] {
    return [...list].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === 'asc' ? -1 : 1;
      if (bVal == null) return direction === 'asc' ? 1 : -1;
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  generateId(): string {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const seq = nextSequence().toString().padStart(4, '0');
    return `${dateStr}-${seq}`;
  },
};
