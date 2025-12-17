import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error, resetToken } = await resetPassword(email);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      setIsSubmitted(true);
      
      // In development mode, reset token might be returned
      if (resetToken) {
        toast({
          title: "Reset token (Development)",
          description: `Reset token: ${resetToken}. Use this in the reset password page.`,
        });
      } else {
        toast({
          title: "Email sent!",
          description: "Check your inbox for password reset instructions.",
        });
      }
      
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center lg:text-left">
          <p className="text-accent font-bold text-lg mb-4">Bibles</p>
          <h2 className="text-3xl font-bold text-foreground">Reset your password</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Enter the email address associated with your account and we will send you a link to reset your password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            
            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  variant="modern"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link
                to="/"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>

              <Button
                type="submit"
                variant="success"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
