import { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { trapFocus } from '../utils/accessibility';
import { TRANSACTION_TYPE_LABELS } from '../types/transaction';
import type { TransactionType } from '../types/transaction';

interface TransactionSummary {
  transactionId: string;
  transactionType: TransactionType;
  accountNumber: string;
  portfolioId: string;
  transactionDate: string;
  fundId: string;
  quantity: number;
  price: number;
  amount: number;
  currency: string;
  sourceAccount?: string;
  destinationAccount?: string;
  description?: string;
}

interface TransactionConfirmDialogProps {
  isOpen: boolean;
  summary: TransactionSummary | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function TransactionConfirmDialog({
  isOpen,
  summary,
  onConfirm,
  onCancel,
}: TransactionConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const cleanup = dialogRef.current ? trapFocus(dialogRef.current) : () => {};
      return cleanup;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

  if (!isOpen || !summary) return null;

  const isBuySell = summary.transactionType === 'BU' || summary.transactionType === 'SL';
  const isTransfer = summary.transactionType === 'TR';
  const isFee = summary.transactionType === 'FE';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <Card
        ref={dialogRef}
        className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <CardHeader>
          <CardTitle id="confirm-dialog-title" className="text-lg font-semibold">
            Confirm Transaction Submission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border p-4 space-y-1">
            <SummaryRow label="Transaction ID" value={summary.transactionId} />
            <SummaryRow label="Type" value={TRANSACTION_TYPE_LABELS[summary.transactionType]} />
            <SummaryRow label="Date" value={summary.transactionDate} />
            {isTransfer ? (
              <>
                <SummaryRow label="Source Account" value={summary.sourceAccount || ''} />
                <SummaryRow label="Destination Account" value={summary.destinationAccount || ''} />
              </>
            ) : (
              <SummaryRow label="Account Number" value={summary.accountNumber} />
            )}
            <SummaryRow label="Portfolio ID" value={summary.portfolioId} />
            {isBuySell && (
              <>
                <SummaryRow label="Fund ID" value={summary.fundId} />
                <SummaryRow label="Quantity" value={summary.quantity.toFixed(4)} />
                <SummaryRow label="Price" value={`${summary.currency} ${summary.price.toFixed(4)}`} />
              </>
            )}
            {isFee && summary.description && (
              <SummaryRow label="Description" value={summary.description} />
            )}
            {isTransfer && (
              <SummaryRow label="Fund ID" value={summary.fundId} />
            )}
            {isTransfer && (
              <SummaryRow label="Quantity" value={summary.quantity.toFixed(4)} />
            )}
            <SummaryRow label="Currency" value={summary.currency} />
          </div>

          <div className="rounded-md bg-primary/5 border border-primary/20 p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-primary">
              {summary.currency} {summary.amount.toFixed(2)}
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Edit
            </Button>
            <Button
              onClick={onConfirm}
            >
              Confirm &amp; Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
