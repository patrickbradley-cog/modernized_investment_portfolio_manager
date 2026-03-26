import { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROUTES } from '../types/routes';
import { Container, PageHeader, Card, Button } from '../components';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Input } from '../components/ui/input';
import { TRANSACTION_TYPE_LABELS, LEGACY_ERROR_CODES } from '../types/transaction';
import type { TransactionType } from '../types/transaction';
import { transactionStore } from '../data/mockTransactions';
import TransactionConfirmDialog from '../components/TransactionConfirmDialog';

// --- Zod schema with legacy error code mapping ---

const VALID_TYPES: TransactionType[] = ['BU', 'SL', 'TR', 'FE'];

const transactionSchema = z.object({
  transactionType: z.enum(['BU', 'SL', 'TR', 'FE'], {
    error: `E003: ${LEGACY_ERROR_CODES['E003']}`,
  }),
  accountNumber: z.string()
    .regex(/^\d{9}$/, `E001: ${LEGACY_ERROR_CODES['E001']}`)
    .refine((val) => parseInt(val, 10) >= 100000000, {
      message: `E001: ${LEGACY_ERROR_CODES['E001']}`,
    }),
  portfolioId: z.string()
    .regex(/^[A-Z0-9]{8}$/, `VAL-INVALID-ID: ${LEGACY_ERROR_CODES['VAL-INVALID-ID']}`),
  fundId: z.string().optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
  amount: z.number().optional(),
  currency: z.string().length(3, 'Currency must be a 3-character ISO code'),
  transactionDate: z.string().min(1, 'Date is required'),
  sourceAccount: z.string().optional(),
  destinationAccount: z.string().optional(),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  const type = data.transactionType;
  const isBuySell = type === 'BU' || type === 'SL';
  const isTransfer = type === 'TR';
  const isFee = type === 'FE';

  // Fund ID required for BUY/SELL/TRANSFER
  if ((isBuySell || isTransfer) && data.fundId) {
    if (!/^[A-Z0-9]{6}$/.test(data.fundId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fundId'],
        message: `E002: ${LEGACY_ERROR_CODES['E002']}`,
      });
    }
  }
  if ((isBuySell || isTransfer) && !data.fundId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fundId'],
      message: `E002: ${LEGACY_ERROR_CODES['E002']}`,
    });
  }

  // Quantity > 0 for BUY/SELL
  if (isBuySell && (data.quantity == null || data.quantity <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['quantity'],
      message: 'Quantity must be greater than 0',
    });
  }

  // Price > 0 for BUY/SELL
  if (isBuySell && (data.price == null || data.price <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['price'],
      message: 'Price must be greater than 0',
    });
  }

  // Transfer: quantity > 0
  if (isTransfer && (data.quantity == null || data.quantity <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['quantity'],
      message: 'Quantity must be greater than 0',
    });
  }

  // Transfer: source + destination account validation
  if (isTransfer) {
    if (!data.sourceAccount || !/^\d{9}$/.test(data.sourceAccount) || parseInt(data.sourceAccount, 10) < 100000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sourceAccount'],
        message: `E001: ${LEGACY_ERROR_CODES['E001']}`,
      });
    }
    if (!data.destinationAccount || !/^\d{9}$/.test(data.destinationAccount) || parseInt(data.destinationAccount, 10) < 100000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['destinationAccount'],
        message: `E001: ${LEGACY_ERROR_CODES['E001']}`,
      });
    }
  }

  // Fee: amount !== 0
  if (isFee && (data.amount == null || data.amount === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['amount'],
      message: `VAL-INVALID-AMT: ${LEGACY_ERROR_CODES['VAL-INVALID-AMT']}`,
    });
  }

  // Date <= today
  if (data.transactionDate) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const txDate = new Date(data.transactionDate + 'T00:00:00');
    if (txDate > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['transactionDate'],
        message: 'Transaction date cannot be in the future',
      });
    }
  }
});

type TransactionFormData = z.infer<typeof transactionSchema>;

function getTodayString(): string {
  const now = new Date();
  return now.getFullYear() + '-' +
    (now.getMonth() + 1).toString().padStart(2, '0') + '-' +
    now.getDate().toString().padStart(2, '0');
}

export default function TransactionSubmit() {
  const history = useHistory();
  const [showConfirm, setShowConfirm] = useState(false);
  const [zeroDollarWarning, setZeroDollarWarning] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<TransactionFormData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    mode: 'onBlur',
    defaultValues: {
      transactionType: 'BU',
      accountNumber: '',
      portfolioId: '',
      fundId: '',
      quantity: undefined,
      price: undefined,
      amount: undefined,
      currency: 'USD',
      transactionDate: getTodayString(),
      sourceAccount: '',
      destinationAccount: '',
      description: '',
    },
  });

  const transactionType = watch('transactionType') as TransactionType;
  const quantity = watch('quantity');
  const price = watch('price');

  const isBuySell = transactionType === 'BU' || transactionType === 'SL';
  const isTransfer = transactionType === 'TR';
  const isFee = transactionType === 'FE';

  // Auto-calculate amount for BUY/SELL
  useEffect(() => {
    if (isBuySell) {
      const q = typeof quantity === 'number' ? quantity : 0;
      const p = typeof price === 'number' ? price : 0;
      const calc = parseFloat((q * p).toFixed(4));
      setValue('amount', calc);
      setZeroDollarWarning(q > 0 && p > 0 && calc === 0);
    }
  }, [quantity, price, isBuySell, setValue]);

  // Check for zero-dollar warning on amount change for fees
  useEffect(() => {
    if (isBuySell) {
      const q = typeof quantity === 'number' ? quantity : 0;
      const p = typeof price === 'number' ? price : 0;
      const calc = q * p;
      setZeroDollarWarning(calc === 0 && (q > 0 || p > 0));
    } else {
      setZeroDollarWarning(false);
    }
  }, [quantity, price, isBuySell]);

  const onSubmit = (data: Record<string, unknown>) => {
    const formData = data as unknown as TransactionFormData;
    // Check W001 zero-dollar warning
    if (isBuySell) {
      const amt = (formData.quantity || 0) * (formData.price || 0);
      if (amt === 0) {
        setZeroDollarWarning(true);
      }
    }
    setPendingTransaction(formData);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!pendingTransaction) return;

    const txId = transactionStore.generateId();
    const isBuySellTx = pendingTransaction.transactionType === 'BU' || pendingTransaction.transactionType === 'SL';

    transactionStore.add({
      transactionId: txId,
      transactionType: pendingTransaction.transactionType,
      accountNumber: pendingTransaction.transactionType === 'TR'
        ? (pendingTransaction.sourceAccount || '')
        : pendingTransaction.accountNumber,
      portfolioId: pendingTransaction.portfolioId,
      transactionDate: pendingTransaction.transactionDate,
      fundId: pendingTransaction.fundId || '',
      quantity: pendingTransaction.quantity || 0,
      price: pendingTransaction.price || 0,
      amount: isBuySellTx
        ? parseFloat(((pendingTransaction.quantity || 0) * (pendingTransaction.price || 0)).toFixed(4))
        : (pendingTransaction.amount || 0),
      currency: pendingTransaction.currency,
      status: 'P',
      sourceAccount: pendingTransaction.sourceAccount,
      destinationAccount: pendingTransaction.destinationAccount,
      description: pendingTransaction.description,
    });

    setShowConfirm(false);
    history.push(`${ROUTES.TRANSACTION_STATUS}?highlight=${txId}`);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  const confirmSummary = pendingTransaction ? {
    transactionId: transactionStore.generateId(),
    transactionType: pendingTransaction.transactionType,
    accountNumber: pendingTransaction.accountNumber,
    portfolioId: pendingTransaction.portfolioId,
    transactionDate: pendingTransaction.transactionDate,
    fundId: pendingTransaction.fundId || '',
    quantity: pendingTransaction.quantity || 0,
    price: pendingTransaction.price || 0,
    amount: (pendingTransaction.transactionType === 'BU' || pendingTransaction.transactionType === 'SL')
      ? parseFloat(((pendingTransaction.quantity || 0) * (pendingTransaction.price || 0)).toFixed(4))
      : (pendingTransaction.amount || 0),
    currency: pendingTransaction.currency,
    sourceAccount: pendingTransaction.sourceAccount,
    destinationAccount: pendingTransaction.destinationAccount,
    description: pendingTransaction.description,
  } : null;

  return (
    <div className="min-h-screen bg-background py-8">
      <Container size="md">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Link to={ROUTES.MAIN_MENU}>
              <Button variant="secondary" size="sm">
                ← Back to Main Menu
              </Button>
            </Link>
          </div>
          <PageHeader
            title="Submit Transaction"
            subtitle="Enter transaction details for processing"
          />

          <main className="space-y-6 animate-slide-up">
            {zeroDollarWarning && (
              <Alert className="border-yellow-300 bg-yellow-50 text-yellow-800 animate-fade-in">
                <AlertTitle>W001: Zero-Dollar Transaction Warning</AlertTitle>
                <AlertDescription>
                  {LEGACY_ERROR_CODES['W001']}
                </AlertDescription>
              </Alert>
            )}

            <Card hover={false} className="animate-fade-in">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Transaction Type</label>
                  <select
                    {...register('transactionType')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    onBlur={() => trigger('transactionType')}
                  >
                    {VALID_TYPES.map((t) => (
                      <option key={t} value={t}>{TRANSACTION_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                  {errors.transactionType && (
                    <p className="text-sm text-destructive mt-1">{errors.transactionType.message}</p>
                  )}
                </div>

                {/* Account Number — shown for BUY/SELL/FEE */}
                {!isTransfer && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Account Number</label>
                    <Input
                      {...register('accountNumber')}
                      placeholder="123456789"
                      maxLength={9}
                      onBlur={() => trigger('accountNumber')}
                    />
                    {errors.accountNumber && (
                      <p className="text-sm text-destructive mt-1">{errors.accountNumber.message}</p>
                    )}
                  </div>
                )}

                {/* Source / Destination Accounts — TRANSFER only */}
                {isTransfer && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Source Account</label>
                      <Input
                        {...register('sourceAccount')}
                        placeholder="123456789"
                        maxLength={9}
                        onBlur={() => trigger('sourceAccount')}
                      />
                      {errors.sourceAccount && (
                        <p className="text-sm text-destructive mt-1">{errors.sourceAccount.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Destination Account</label>
                      <Input
                        {...register('destinationAccount')}
                        placeholder="123456789"
                        maxLength={9}
                        onBlur={() => trigger('destinationAccount')}
                      />
                      {errors.destinationAccount && (
                        <p className="text-sm text-destructive mt-1">{errors.destinationAccount.message}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Portfolio ID */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Portfolio ID</label>
                  <Input
                    {...register('portfolioId')}
                    placeholder="PORT0001"
                    maxLength={8}
                    onBlur={() => trigger('portfolioId')}
                  />
                  {errors.portfolioId && (
                    <p className="text-sm text-destructive mt-1">{errors.portfolioId.message}</p>
                  )}
                </div>

                {/* Fund ID — shown for BUY/SELL/TRANSFER */}
                {!isFee && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Fund ID</label>
                    <Input
                      {...register('fundId')}
                      placeholder="AAPL01"
                      maxLength={6}
                      onBlur={() => trigger('fundId')}
                    />
                    {errors.fundId && (
                      <p className="text-sm text-destructive mt-1">{errors.fundId.message}</p>
                    )}
                  </div>
                )}

                {/* Quantity — shown for BUY/SELL/TRANSFER */}
                {!isFee && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Quantity</label>
                    <Input
                      {...register('quantity', { valueAsNumber: true })}
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.0000"
                      onBlur={() => trigger('quantity')}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
                    )}
                  </div>
                )}

                {/* Price — shown for BUY/SELL only */}
                {isBuySell && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Price</label>
                    <Input
                      {...register('price', { valueAsNumber: true })}
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.0000"
                      onBlur={() => trigger('price')}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                    )}
                  </div>
                )}

                {/* Amount — auto-calc read-only for BUY/SELL, editable for FEE, hidden for TRANSFER */}
                {isBuySell && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Amount (auto-calculated)</label>
                    <Input
                      {...register('amount', { valueAsNumber: true })}
                      type="number"
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                )}
                {isFee && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Amount</label>
                    <Input
                      {...register('amount', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      onBlur={() => trigger('amount')}
                    />
                    {errors.amount && (
                      <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
                    )}
                  </div>
                )}

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Currency</label>
                  <Input
                    {...register('currency')}
                    placeholder="USD"
                    maxLength={3}
                    onBlur={() => trigger('currency')}
                  />
                  {errors.currency && (
                    <p className="text-sm text-destructive mt-1">{errors.currency.message}</p>
                  )}
                </div>

                {/* Transaction Date */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Transaction Date</label>
                  <Input
                    {...register('transactionDate')}
                    type="date"
                    max={getTodayString()}
                    onBlur={() => trigger('transactionDate')}
                  />
                  {errors.transactionDate && (
                    <p className="text-sm text-destructive mt-1">{errors.transactionDate.message}</p>
                  )}
                </div>

                {/* Description — FEE only */}
                {isFee && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description</label>
                    <Input
                      {...register('description')}
                      placeholder="Fee description"
                      maxLength={50}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Review &amp; Submit
                </Button>
              </form>
            </Card>
          </main>
        </div>
      </Container>

      <TransactionConfirmDialog
        isOpen={showConfirm}
        summary={confirmSummary}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
    </div>
  );
}
