import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLicense } from '@/contexts/LicenseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2, Sprout, ArrowLeft } from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    duration: 30,
    features: [
      'Dashboard access',
      'Up to 2 branches',
      'Basic reports',
      'Email support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    duration: 30,
    popular: true,
    features: [
      'Everything in Basic',
      'Unlimited branches',
      'Advanced analytics',
      'Priority support',
      'API access',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    duration: 365,
    features: [
      'Everything in Professional',
      '1 year license',
      'Custom integrations',
      'Dedicated support',
      'Training sessions',
    ],
  },
];

const Purchase = () => {
  const { user, license, purchaseLicense, renewLicense, isLicenseValid } = useLicense();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (plan: typeof plans[0]) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setPurchasing(plan.id);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let success: boolean;
    if (license) {
      success = await renewLicense(plan.duration);
    } else {
      success = await purchaseLicense(plan.id, plan.duration);
    }

    setPurchasing(null);

    if (success) {
      toast({
        title: 'Purchase successful!',
        description: `Your ${plan.name} license is now active for ${plan.duration} days.`,
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Purchase failed',
        description: 'There was an error processing your purchase. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sprout className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            {license ? 'Renew Your License' : 'Choose Your Plan'}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {license 
              ? 'Extend your license to continue using all FarmHub features.'
              : 'Get started with FarmHub and unlock powerful farm management tools.'}
          </p>
          {isLicenseValid && (
            <Badge variant="outline" className="mt-4">
              Your current license is valid
            </Badge>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.duration === 365 ? 'year' : 'month'}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={() => handlePurchase(plan)}
                  disabled={purchasing !== null}
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {purchasing === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    license ? 'Renew with this plan' : 'Get Started'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          This is a demo purchase flow. No actual payment is processed.
        </p>
      </div>
    </div>
  );
};

export default Purchase;
