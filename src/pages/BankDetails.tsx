import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Copy,
  Mail,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BankDetails = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "RehabX Glove";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get plan-specific details
  const getPlanDetails = (planName: string) => {
    const plans: Record<string, { price: string; depositAmount: string; depositPercentage: string }> = {
      "RehabX Glove": { price: "LKR 30,000", depositAmount: "LKR 3,000", depositPercentage: "10%" },
      "RehabX Full Package (Arm)": { price: "LKR 120,000", depositAmount: "LKR 12,000", depositPercentage: "10%" },
      "RehabX Full Package (Leg)": { price: "LKR 150,000", depositAmount: "LKR 15,000", depositPercentage: "10%" },
    };
    return plans[planName] || plans["RehabX Glove"];
  };

  const planDetails = getPlanDetails(plan);

  const bankDetails = {
    bankName: "National Development Bank PLC (NDB Bank)",
    accountNo: "111000258721",
    accountName: "Itself Automation (Private) Limited",
    branch: "Kandana",
    email: "info@itselfcare.com",
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendReceipt = () => {
    const subject = encodeURIComponent(`Pre-Order Payment Receipt - ${plan}`);
    const body = encodeURIComponent(
      `Hello,\n\nI have made a deposit of ${planDetails.depositAmount} for the ${plan} pre-order.\n\nDeposit Details:\nBank: ${bankDetails.bankName}\nAccount No: ${bankDetails.accountNo}\nAccount Name: ${bankDetails.accountName}\nAmount: ${planDetails.depositAmount}\n\nPlease find the payment receipt attached.\n\nThank you.`
    );
    window.location.href = `mailto:${bankDetails.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 lg:px-6 py-24">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/#preorder")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pre-Order
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Complete Your Pre-Order
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Selected Package:{" "}
              <span className="font-semibold text-primary">{plan}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Total Price: <span className="font-semibold">{planDetails.price}</span>
            </p>
          </div>

          {/* Instructions Card */}
          <Card className="mb-6 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Bank Transfer Instructions
              </CardTitle>
              <CardDescription>
                Please deposit {planDetails.depositAmount} ({planDetails.depositPercentage} of total price) to secure your pre-order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                {/* Bank Name */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      Bank Name
                    </p>
                    <p className="font-semibold text-foreground">
                      {bankDetails.bankName}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(bankDetails.bankName, "Bank Name")
                    }
                    className="flex-shrink-0"
                  >
                    {copiedField === "Bank Name" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Account Number */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      Account Number
                    </p>
                    <p className="font-semibold text-foreground text-lg">
                      {bankDetails.accountNo}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(bankDetails.accountNo, "Account Number")
                    }
                    className="flex-shrink-0"
                  >
                    {copiedField === "Account Number" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Account Name */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      Account Name
                    </p>
                    <p className="font-semibold text-foreground">
                      {bankDetails.accountName}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(bankDetails.accountName, "Account Name")
                    }
                    className="flex-shrink-0"
                  >
                    {copiedField === "Account Name" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Branch */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Branch</p>
                    <p className="font-semibold text-foreground">
                      {bankDetails.branch}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(bankDetails.branch, "Branch")
                    }
                    className="flex-shrink-0"
                  >
                    {copiedField === "Branch" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Amount */}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Deposit Amount ({planDetails.depositPercentage})
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {planDetails.depositAmount}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="text-foreground">
                  <span className="font-medium">Make the deposit</span> of {planDetails.depositAmount} ({planDetails.depositPercentage} advance payment) to the bank account above
                </li>
                <li className="text-foreground">
                  <span className="font-medium">Save your payment receipt</span>{" "}
                  from the bank
                </li>
                <li className="text-foreground">
                  <span className="font-medium">Click the button below</span> to
                  send us your receipt via email
                </li>
                <li className="text-foreground">
                  We'll{" "}
                  <span className="font-medium">confirm your pre-order</span>{" "}
                  within 24-48 hours
                </li>
                <li className="text-foreground">
                  <span className="font-medium">Pay the remaining balance</span> upon delivery
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Send Receipt Button */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full bg-gradient-primary hover:opacity-90 text-white"
              onClick={handleSendReceipt}
            >
              <Mail className="mr-2 h-5 w-5" />
              Send Payment Receipt via Email
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Need help? Contact us at{" "}
              <a
                href={`mailto:${bankDetails.email}`}
                className="text-primary hover:underline font-medium"
              >
                {bankDetails.email}
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BankDetails;
