import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success('Password reset link sent to your email');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-xl bg-primary/10"><ShieldCheck className="h-8 w-8 text-primary" /></div>
          </div>
          <CardTitle className="font-heading text-2xl">Reset Password</CardTitle>
          <CardDescription>{sent ? 'Check your email for reset instructions' : 'Enter your email to receive a reset link'}</CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <Button type="submit" className="w-full">Send Reset Link</Button>
            </form>
          ) : (
            <Button variant="outline" className="w-full" asChild><Link to="/login"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Login</Link></Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
