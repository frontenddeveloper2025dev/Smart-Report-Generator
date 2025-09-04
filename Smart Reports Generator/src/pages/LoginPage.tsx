import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { Loader2, FileText, BarChart3, Brain } from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const { sendOTP, verifyOTP, isLoading } = useAuthStore();
  const { toast } = useToast();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await sendOTP(email);
      setStep('otp');
      toast({
        title: 'Verification code sent',
        description: `Please check your email at ${email}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to send code',
        description: 'Please try again or check your email address',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    try {
      await verifyOTP(email, otp);
      toast({
        title: 'Welcome to Smart Report Generator!',
        description: 'Successfully logged in',
      });
    } catch (error) {
      toast({
        title: 'Invalid verification code',
        description: 'Please check the code and try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Smart Report Generator</h1>
            <p className="text-muted-foreground">Transform scattered work records into professional reports</p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">AI Categorization</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 bg-chart-2/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-chart-2" />
            </div>
            <p className="text-xs text-muted-foreground">Data Analysis</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Professional Reports</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle>
              {step === 'email' ? 'Get Started' : 'Enter Verification Code'}
            </CardTitle>
            <CardDescription>
              {step === 'email' 
                ? 'Enter your email to receive a verification code'
                : `We sent a 6-digit code to ${email}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <div key="email">
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div key="otp">
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Login'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep('email')}
                    disabled={isLoading}
                  >
                    Use Different Email
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Secure email-based authentication • No passwords required
        </p>
      </div>
    </div>
  );
}