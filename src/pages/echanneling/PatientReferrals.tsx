import { useState, useEffect, useCallback } from "react";
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
  Gift,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { referralAPI, type ReferralData } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PatientReferrals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // Get patient ID from localStorage
  const patientId = localStorage.getItem("patient_id");

  const fetchReferralData = useCallback(async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      setError(null);

      // Generate referral code if patient doesn't have one
      await referralAPI.generateCode(patientId);

      // Get all referral data
      const data = await referralAPI.getByPatient(patientId);
      setReferralData(data);
    } catch (err: unknown) {
      console.error("Error fetching referral data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load referral data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (!patientId) {
      setError("Please log in to view your referrals");
      setLoading(false);
      return;
    }

    fetchReferralData();
  }, [patientId, fetchReferralData]);

  const handleCopyLink = () => {
    if (referralData) {
      const referralLink = `${window.location.origin}/echanneling/register?ref=${referralData.referralCode}`;
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendInvite = () => {
    // In production, this would send an email via backend
    console.log("Sending invite to:", inviteEmail);
    alert(`Referral invitation would be sent to ${inviteEmail}`);
    setInviteEmail("");
    setShareDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: "default" | "secondary" | "outline"; label: string }
    > = {
      pending: { variant: "secondary", label: "Pending" },
      completed: { variant: "default", label: "Completed" },
      expired: { variant: "outline", label: "Expired" },
    };

    return (
      <Badge variant={config[status]?.variant || "outline"}>
        {config[status]?.label || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Refer a Friend</h1>
          <p className="text-muted-foreground mt-1">
            Share ItSelfCare with friends and earn rewards
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {!patientId && (
          <Button onClick={() => navigate("/echanneling/register")}>
            Register to Get Referral Code
          </Button>
        )}
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No referral data available</p>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/echanneling/register?ref=${referralData.referralCode}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Refer a Friend</h1>
        <p className="text-muted-foreground mt-1">
          Share ItSelfCare with friends and earn rewards
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">
                  {referralData.totalReferrals}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {referralData.completedReferrals}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Gift className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RehabX Credits</p>
                <p className="text-2xl font-bold">
                  {referralData.currentRehabXCredits}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {referralData.pendingReferrals}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="bg-gradient-primary text-white">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">How It Works</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
                <span className="font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-1">Share Your Code</h4>
              <p className="text-sm opacity-90">
                Send your unique referral code{" "}
                <strong>{referralData.referralCode}</strong> to friends
              </p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
                <span className="font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-1">Friend Gets Discount</h4>
              <p className="text-sm opacity-90">
                They get 5% discount per your completed referral (up to 25%)
              </p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
                <span className="font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-1">Earn RehabX Credits</h4>
              <p className="text-sm opacity-90">
                Get 100 RehabX credits when they complete their first
                appointment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Section */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Referral Link</CardTitle>
          <CardDescription>
            Invite friends and earn rewards together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input value={referralLink} readOnly />
            </div>
            <Button onClick={handleCopyLink}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Referral Invitation</DialogTitle>
                  <DialogDescription>
                    Invite your friend to join ItSelfCare
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="email">Friend's Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="friend@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendInvite} className="w-full">
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>

            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              More
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>
            Track your referral status and rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({referralData.totalReferrals})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({referralData.completedReferrals})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({referralData.pendingReferrals})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {referralData.referrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No referrals yet. Start sharing your code!
                </div>
              ) : (
                referralData.referrals.map((referral) => (
                  <div
                    key={referral.referralId}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                        {referral.referredPatientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {referral.referredPatientName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {referral.status === "completed" && (
                          <>
                            <p className="text-sm font-semibold text-green-600">
                              +{referral.creditsEarned} credits
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${referral.discountGiven.toFixed(2)} discount
                              given
                            </p>
                          </>
                        )}
                        {referral.status === "pending" && (
                          <p className="text-sm text-muted-foreground">
                            Awaiting appointment
                          </p>
                        )}
                      </div>
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {referralData.referrals
                .filter((r) => r.status === "completed")
                .map((referral) => (
                  <div
                    key={referral.referralId}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                        {referral.referredPatientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {referral.referredPatientName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Completed:{" "}
                          {referral.completedAt
                            ? new Date(
                                referral.completedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          +{referral.creditsEarned} credits
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${referral.discountGiven.toFixed(2)} discount given
                        </p>
                      </div>
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                ))}
              {referralData.referrals.filter((r) => r.status === "completed")
                .length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No completed referrals yet
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {referralData.referrals
                .filter((r) => r.status === "pending")
                .map((referral) => (
                  <div
                    key={referral.referralId}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                        {referral.referredPatientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {referral.referredPatientName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Awaiting appointment
                        </p>
                      </div>
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                ))}
              {referralData.referrals.filter((r) => r.status === "pending")
                .length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No pending referrals
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Your Impact
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">
                Total RehabX Credits Earned
              </p>
              <p className="text-2xl font-bold text-primary">
                {referralData.totalCreditsEarned}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Savings Given to Friends
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${referralData.totalDiscountsGiven.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">How Discounts Work</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              • Friends get 5% discount per your completed referral (max 25%)
            </li>
            <li>
              • Discount comes from platform's 10% fee, not therapist payment
            </li>
            <li>
              • You earn 100 RehabX credits when friend completes first
              appointment
            </li>
            <li>• Credits can be used in RehabX 3D rehabilitation platform</li>
            <li>• Unlimited referrals allowed - share with everyone!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
