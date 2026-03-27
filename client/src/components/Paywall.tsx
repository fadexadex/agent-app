import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LockIcon } from "lucide-react";

declare global {
  interface Window {
    webpayCheckout: (request: unknown) => void;
  }
}

interface WebPayResponse {
  resp?: string;
  desc?: string;
  txnref?: string;
}

export const Paywall = ({ children }: { children: React.ReactNode }) => {
  const [hasPaid, setHasPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");

  useEffect(() => {
    // Check local storage for payment status
    if (localStorage.getItem("hasPaid") === "true") {
      setHasPaid(true);
    }

    // Load Interswitch script
    if (!document.getElementById("interswitch-script")) {
      const script = document.createElement("script");
      script.id = "interswitch-script";
      script.src = "https://newwebpay.qa.interswitchng.com/inline-checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (hasPaid) {
    return <>{children}</>;
  }

  const initiatePayment = () => {
    if (!custName || !custEmail || !custEmail.includes("@")) {
      alert("Please enter a valid name and email");
      return;
    }

    setIsProcessing(true);

    const generateTxnRef = () => {
      return "TXN_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    };

    const paymentRequest = {
      merchant_code: "MX6072",
      pay_item_id: "9405967",
      txn_ref: generateTxnRef(),
      amount: 5000, // Amount in minor (5000 = NGN 50.00)
      currency: 566,
      cust_name: custName,
      cust_email: custEmail,
      site_redirect_url: window.location.href,
      onComplete: (response: WebPayResponse) => {
        setIsProcessing(false);
        if (response.resp === "00") {
          localStorage.setItem("hasPaid", "true");
          setHasPaid(true);
        } else {
          alert("Payment " + (response.resp ? "Failed" : "Cancelled") + "\n\nResponse: " + (response.desc || "Transaction was cancelled"));
        }
      },
      mode: "TEST",
    };

    try {
      window.webpayCheckout(paymentRequest);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to initiate payment. Check console for details.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Blurred background content */}
      <div className="absolute inset-0 blur-md pointer-events-none select-none opacity-50 transition-all duration-300">
        {children}
      </div>

      {/* Paywall Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md shadow-2xl border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full">
              <LockIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold mb-2 tracking-wide">
                TEST MODE
              </div>
              <CardTitle className="text-2xl mb-1">Subscribe for Access</CardTitle>
              <CardDescription>
                Pay a one-time fee to unlock the AI video generator.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custName">Full Name</Label>
              <Input
                id="custName"
                placeholder="John Doe"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custEmail">Email Address</Label>
              <Input
                id="custEmail"
                type="email"
                placeholder="john@example.com"
                value={custEmail}
                onChange={(e) => setCustEmail(e.target.value)}
              />
            </div>

            <div className="bg-muted p-4 rounded-xl text-center border mt-2">
              <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                Amount Due
              </div>
              <div className="text-3xl font-bold mt-1 text-foreground">
                NGN 50.00
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full h-12 text-lg font-semibold bg-[#e85d04] hover:bg-[#d45203] text-white"
              onClick={initiatePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Pay with Interswitch"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
