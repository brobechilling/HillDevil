import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Eye, DollarSign, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Bill {
  id: string;
  tableNumber: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  waiterName?: string;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = () => {
    const storedBills = localStorage.getItem('mock_bills');
    const allBills: Bill[] = storedBills ? JSON.parse(storedBills) : [];
    
    // Sort by date, most recent first
    const sortedBills = allBills.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setBills(sortedBills);
  };

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const totalRevenue = bills
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + b.total, 0);

  const todayRevenue = bills
    .filter(b => {
      const billDate = new Date(b.createdAt);
      const today = new Date();
      return billDate.toDateString() === today.toDateString() && b.status === 'paid';
    })
    .reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Bill Management</h2>
        <p className="text-muted-foreground">View bill history and details</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From paid bills today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All paid bills</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bill History</CardTitle>
          <CardDescription>View all bills and their details</CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Table {bill.tableNumber}</span>
                      {bill.customerName && (
                        <span className="text-sm text-muted-foreground">• {bill.customerName}</span>
                      )}
                      <Badge variant={getStatusBadgeVariant(bill.status)}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(bill.createdAt).toLocaleDateString()}</span>
                        <span>{new Date(bill.createdAt).toLocaleTimeString()}</span>
                      </div>
                      {bill.waiterName && (
                        <span>Waiter: {bill.waiterName}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-lg">${bill.total.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{bill.items.length} items</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewBill(bill)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
            <DialogDescription>
              View complete bill information
            </DialogDescription>
          </DialogHeader>
          
          {selectedBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Table Number</p>
                  <p className="font-semibold">{selectedBill.tableNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedBill.status)}>
                    {selectedBill.status.charAt(0).toUpperCase() + selectedBill.status.slice(1)}
                  </Badge>
                </div>
                {selectedBill.customerName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-semibold">{selectedBill.customerName}</p>
                  </div>
                )}
                {selectedBill.waiterName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Served By</p>
                    <p className="font-semibold">{selectedBill.waiterName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-semibold">
                    {new Date(selectedBill.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedBill.paidAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="font-semibold">
                      {new Date(selectedBill.paidAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedBill.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${selectedBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${selectedBill.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${selectedBill.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
