import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  // Handle email confirmation
  useEffect(() => {
    const confirmEmail = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const error = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      
      // Handle email confirmation errors
      if (error) {
        let errorMessage = "Email confirmation failed";
        if (errorCode === 'otp_expired') {
          errorMessage = "The confirmation link has expired. Please sign up again.";
        } else if (error === 'access_denied') {
          errorMessage = "The confirmation link is invalid or has expired. Please sign up again.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      
      if (accessToken && refreshToken) {
        setLoading(true);
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            toast({
              title: "Error",
              description: "Failed to confirm email. Please try again or request a new confirmation email.",
              variant: "destructive",
            });
          } else {
            setEmailConfirmed(true);
            toast({
              title: "Success",
              description: "Email confirmed successfully! You can now sign in.",
            });
            await refreshUser();
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to confirm email. Please try again or request a new confirmation email.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    confirmEmail();
  }, [searchParams, toast, refreshUser]);

const handleResendConfirmation = async () => {
  if (!email) {
    toast({
      title: "Error",
      description: "Please enter your email address",
      variant: "destructive",
    });
    return;
  }

  setResendLoading(true);
  
  // Use a fixed redirect URL for development
  const redirectUrl = 'http://localhost:5173/auth';

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Resend error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend confirmation email. Please try again.",
        variant: "destructive",
      });
    } else {
      console.log("Resend successful");
      toast({
        title: "Success",
        description: "Confirmation email sent! Please check your inbox (and spam folder).",
      });
    }
  } catch (error) {
    console.error("Unexpected error during resend:", error);
    toast({
      title: "Error",
      description: "Failed to resend confirmation email. Please try again.",
      variant: "destructive",
    });
  } finally {
    setResendLoading(false);
  }
};

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Use a fixed redirect URL for development
    const redirectUrl = 'http://localhost:5173/auth';

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("Signup error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create account. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("Signup successful");
        setMessage("Account created successfully! Please check your email to verify your account.");
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to verify your account.",
        });
      }
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      await refreshUser();
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-secondary/20 flex items-center justify-center p-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to The Right Knot</CardTitle>
          <CardDescription>Sign in or create an account</CardDescription>
        </CardHeader>
        <CardContent>
          {emailConfirmed && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800">Email confirmed successfully! You can now sign in.</p>
            </div>
          )}
          
          {message && !emailConfirmed && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{message}</p>
              {message.includes("check your email") && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="text-xs"
                  >
                    {resendLoading ? "Sending..." : "Resend confirmation email"}
                  </Button>
                </div>
              )}
            </div>
          )}
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={(e) => { e.preventDefault(); handleSignIn(e); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="•••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={(e) => { e.preventDefault(); handleSignUp(e); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="•••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
