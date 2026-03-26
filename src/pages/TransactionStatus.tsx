import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../types/routes';
import { Container, PageHeader, Card, Button } from '../components';
import { Input } from '../components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  TRANSACTION_TYPE_LABELS,
} from '../types/transaction';
import type { Transaction, TransactionStatus as TxStatus } from '../types/transaction';
import { transactionStore } from '../data/mockTransactions';

const PAGE_SIZE = 10;

type SortField = keyof Transaction;
type SortDirection = 'asc' | 'desc';

export default function TransactionStatus() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const highlightId = params.get('highlight') || '';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState<TxStatus | ''>('');
  const [accountSearch, setAccountSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<SortField>('transactionDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [highlightActive, setHighlightActive] = useState(!!highlightId);

  const loadTransactions = useCallback(() => {
    let filtered = transactionStore.filter({
      status: statusFilter || undefined,
      accountNumber: accountSearch || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    filtered = transactionStore.sort(filtered, sortField, sortDirection);
    setTransactions(filtered);
  }, [statusFilter, accountSearch, startDate, endDate, sortField, sortDirection]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Remove highlight pulse after 3 seconds
  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => setHighlightActive(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightId]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <Container size="lg">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Link to={ROUTES.MAIN_MENU}>
              <Button variant="secondary" size="sm">
                ← Back to Main Menu
              </Button>
            </Link>
            <Link to={ROUTES.TRANSACTION_SUBMIT}>
              <Button variant="primary" size="sm">
                Submit New Transaction
              </Button>
            </Link>
          </div>
          <PageHeader
            title="Transaction Status"
            subtitle="Track and monitor submitted transactions"
          />

          <main className="space-y-6 animate-slide-up">
            {/* Filter Bar */}
            <Card hover={false} padding="sm" className="animate-fade-in">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as TxStatus | ''); handleFilterChange(); }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    <option value="">All Statuses</option>
                    <option value="P">Pending</option>
                    <option value="D">Processed</option>
                    <option value="F">Failed</option>
                    <option value="R">Reversed</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Account</label>
                  <Input
                    value={accountSearch}
                    onChange={(e) => { setAccountSearch(e.target.value); handleFilterChange(); }}
                    placeholder="Search account..."
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">From Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); handleFilterChange(); }}
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">To Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); handleFilterChange(); }}
                  />
                </div>
              </div>
            </Card>

            {/* Transaction Table */}
            <div className="animate-fade-in">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('transactionId')}>
                      Transaction ID{sortIndicator('transactionId')}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('transactionDate')}>
                      Date{sortIndicator('transactionDate')}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('transactionType')}>
                      Type{sortIndicator('transactionType')}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('accountNumber')}>
                      Account{sortIndicator('accountNumber')}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('fundId')}>
                      Fund ID{sortIndicator('fundId')}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort('quantity')}>
                      Quantity{sortIndicator('quantity')}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort('price')}>
                      Price{sortIndicator('price')}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort('amount')}>
                      Amount{sortIndicator('amount')}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                      Status{sortIndicator('status')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No transactions found matching the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((tx) => {
                      const isHighlighted = highlightActive && tx.transactionId === highlightId;
                      const isExpanded = expandedRow === tx.transactionId;
                      return (
                        <React.Fragment key={tx.transactionId}>
                          <TableRow
                            className={`cursor-pointer ${isHighlighted ? 'animate-pulse bg-primary/10' : ''}`}
                            onClick={() => toggleExpand(tx.transactionId)}
                          >
                            <TableCell className="font-mono text-xs">{tx.transactionId}</TableCell>
                            <TableCell>{tx.transactionDate}</TableCell>
                            <TableCell>{TRANSACTION_TYPE_LABELS[tx.transactionType]}</TableCell>
                            <TableCell className="font-mono text-xs">{tx.accountNumber}</TableCell>
                            <TableCell className="font-mono text-xs">{tx.fundId || '—'}</TableCell>
                            <TableCell className="text-right">{tx.quantity > 0 ? tx.quantity.toFixed(4) : '—'}</TableCell>
                            <TableCell className="text-right">{tx.price > 0 ? tx.price.toFixed(4) : '—'}</TableCell>
                            <TableCell className="text-right font-medium">{tx.currency} {tx.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[tx.status]}`}>
                                {STATUS_LABELS[tx.status]}
                              </span>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={9} className="bg-muted/30 p-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Transaction ID:</span>
                                    <span className="ml-2 font-mono">{tx.transactionId}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Type:</span>
                                    <span className="ml-2">{TRANSACTION_TYPE_LABELS[tx.transactionType]}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[tx.status]}`}>
                                      {STATUS_LABELS[tx.status]}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="ml-2">{tx.transactionDate}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Account:</span>
                                    <span className="ml-2 font-mono">{tx.accountNumber}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Portfolio ID:</span>
                                    <span className="ml-2 font-mono">{tx.portfolioId}</span>
                                  </div>
                                  {tx.fundId && (
                                    <div>
                                      <span className="text-muted-foreground">Fund ID:</span>
                                      <span className="ml-2 font-mono">{tx.fundId}</span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-muted-foreground">Quantity:</span>
                                    <span className="ml-2">{tx.quantity.toFixed(4)}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Price:</span>
                                    <span className="ml-2">{tx.currency} {tx.price.toFixed(4)}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="ml-2 font-medium">{tx.currency} {tx.amount.toFixed(2)}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Currency:</span>
                                    <span className="ml-2">{tx.currency}</span>
                                  </div>
                                  {tx.sourceAccount && (
                                    <div>
                                      <span className="text-muted-foreground">Source Account:</span>
                                      <span className="ml-2 font-mono">{tx.sourceAccount}</span>
                                    </div>
                                  )}
                                  {tx.destinationAccount && (
                                    <div>
                                      <span className="text-muted-foreground">Dest. Account:</span>
                                      <span className="ml-2 font-mono">{tx.destinationAccount}</span>
                                    </div>
                                  )}
                                  {tx.description && (
                                    <div className="col-span-2 md:col-span-3">
                                      <span className="text-muted-foreground">Description:</span>
                                      <span className="ml-2">{tx.description}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between animate-fade-in">
              <p className="text-sm text-muted-foreground">
                Showing {transactions.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, transactions.length)} of {transactions.length} transactions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}
