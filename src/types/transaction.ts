// Transaction types matching legacy TRNREC.cpy 88-level conditions
export type TransactionType = 'BU' | 'SL' | 'TR' | 'FE';

// Status codes matching batch pipeline: TRNVAL00 → POSUPD00 → HISTLD00
export type TransactionStatus = 'P' | 'D' | 'F' | 'R';

export interface Transaction {
  transactionId: string;       // Format: YYYYMMDD-NNNN
  transactionType: TransactionType;
  accountNumber: string;       // 9-digit numeric string
  portfolioId: string;         // 8-char alphanumeric (PIC X(8))
  transactionDate: string;     // YYYY-MM-DD
  fundId: string;              // 6-char alphanumeric (PIC X(6))
  quantity: number;            // 4 decimal places (COMP-3 PIC S9(9)V9(4))
  price: number;               // 4 decimal places (COMP-3 PIC S9(9)V9(4))
  amount: number;              // Auto-calculated: quantity × price
  currency: string;            // 3-char ISO (PIC X(3))
  status: TransactionStatus;
  sourceAccount?: string;      // For transfers (9-digit)
  destinationAccount?: string; // For transfers (9-digit)
  description?: string;        // For fees (PIC X(50))
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

// Legacy error codes from PORTVAL.cpy return codes and data dictionary
export const LEGACY_ERROR_CODES: Record<string, string> = {
  'E001': 'Invalid account number — must be 9 digits, minimum 100000000 (PORTVAL +1)',
  'E002': 'Invalid fund identifier — must be 6 alphanumeric characters (PORTVAL +2)',
  'E003': 'Invalid transaction type — must be BU, SL, TR, or FE (PORTVAL +3)',
  'VAL-INVALID-ID': 'Invalid portfolio ID — must be 8 alphanumeric characters',
  'VAL-INVALID-AMT': 'Invalid amount — fee transactions require a non-zero amount',
  'W001': 'Warning: zero-dollar transaction — amount calculates to $0.00. Submission is allowed.',
};

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  'P': 'Pending',
  'D': 'Processed',
  'F': 'Failed',
  'R': 'Reversed',
};

export const STATUS_COLORS: Record<TransactionStatus, string> = {
  'P': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'D': 'bg-green-100 text-green-800 border-green-300',
  'F': 'bg-red-100 text-red-800 border-red-300',
  'R': 'bg-gray-100 text-gray-800 border-gray-300',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  'BU': 'Buy',
  'SL': 'Sell',
  'TR': 'Transfer',
  'FE': 'Fee',
};
