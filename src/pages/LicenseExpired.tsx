import { useNavigate } from 'react-router-dom';
import { useLicense } from '@/contexts/LicenseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, LogOut, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

const LicenseExpired = () => {
  const { user, license, signOut, isLicenseValid } = useLicense();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handlePurchase = () => {
    navigate('/purchase');
  };

  // If license is valid, redirect to dashboard
  if (isLicenseValid) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-display text-destructive">
            License Expired
          </CardTitle>
          <CardDescription className="text-base">
            Your FarmHub license has expired. Please renew to continue using the platform.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Account</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            {license && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium capitalize">{license.plan_type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Expired On</span>
                  <span className="font-medium text-destructive flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(license.expires_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h3 className="font-semibold text-sm mb-2">What you're missing:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Full access to dashboard analytics</li>
              <li>• Branch and inventory management</li>
              <li>• Financial reports and tracking</li>
              <li>• Staff attendance monitoring</li>
              <li>• Customer and supplier management</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handlePurchase} className="w-full gap-2" size="lg">
            <ShoppingCart className="h-4 w-4" />
            Renew License
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full text-muted-foreground text-sm gap-2"
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LicenseExpired;
