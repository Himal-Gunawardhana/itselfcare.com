import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  DollarSign,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
  cardBrand?: string;
  bankName?: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
}

export default function PatientBilling() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "pm_1",
      type: "card",
      last4: "4242",
      expiryDate: "12/25",
      isDefault: true,
      cardBrand: "Visa",
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: "tx_1",
      date: "2025-11-20",
      description: "Video Consultation - Dr. Therapist 1",
      amount: 90,
      status: "paid",
    },
    {
      id: "tx_2",
      date: "2025-11-15",
      description: "Home Visit - Dr. Therapist 2",
      amount: 100,
      status: "paid",
    },
  ]);

  const [addCardOpen, setAddCardOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const handleAddCard = () => {
    const last4 = newCard.number.slice(-4);
    const newPaymentMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: "card",
      last4,
      expiryDate: newCard.expiry,
      isDefault: paymentMethods.length === 0,
      cardBrand: "Visa",
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setNewCard({ number: "", name: "", expiry: "", cvv: "" });
    setAddCardOpen(false);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      }))
    );
  };

  const handleDeleteCard = (id: string) => {
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      paid: { variant: "default", label: "Paid" },
      pending: { variant: "secondary", label: "Pending" },
      failed: { variant: "destructive", label: "Failed" },
    };

    return (
      <Badge variant={config[status].variant}>{config[status].label}</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-muted-foreground mt-1">
          Manage your payment methods and view transaction history
        </p>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Add and manage your payment methods
              </CardDescription>
            </div>
            <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new credit or debit card
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={newCard.number}
                      onChange={(e) =>
                        setNewCard({ ...newCard, number: e.target.value })
                      }
                      maxLength={19}
                    />
                  </div>

                  <div>
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input
                      id="card-name"
                      placeholder="John Doe"
                      value={newCard.name}
                      onChange={(e) =>
                        setNewCard({ ...newCard, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="card-expiry">Expiry Date</Label>
                      <Input
                        id="card-expiry"
                        placeholder="MM/YY"
                        value={newCard.expiry}
                        onChange={(e) =>
                          setNewCard({ ...newCard, expiry: e.target.value })
                        }
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-cvv">CVV</Label>
                      <Input
                        id="card-cvv"
                        placeholder="123"
                        type="password"
                        value={newCard.cvv}
                        onChange={(e) =>
                          setNewCard({ ...newCard, cvv: e.target.value })
                        }
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddCardOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddCard}>Add Card</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment methods added yet
            </div>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {method.cardBrand || "Card"} •••• {method.last4}
                          </span>
                          {method.isDefault && (
                            <Badge variant="secondary">
                              <Check className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        {method.expiryDate && (
                          <span className="text-sm text-muted-foreground">
                            Expires {method.expiryDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCard(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View your past payments and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ${transaction.amount.toFixed(2)}
                    </p>
                    {transaction.invoiceUrl && (
                      <Button variant="link" size="sm" className="h-auto p-0">
                        View Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                All payments are processed securely through our encrypted
                payment gateway. Your card information is never stored on our
                servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
