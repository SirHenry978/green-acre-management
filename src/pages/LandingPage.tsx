import { Link } from 'react-router-dom';
import { Sprout, BarChart3, Users, Package, DollarSign, MapPin, Shield, ArrowRight, Leaf, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: BarChart3, title: 'Smart Dashboard', description: 'Real-time analytics and insights across all your farm operations in one unified view.' },
  { icon: Package, title: 'Inventory Tracking', description: 'Monitor stock levels, track supplies, and manage farm inputs with precision.' },
  { icon: DollarSign, title: 'Financial Management', description: 'Invoices, receipts, quotations and full revenue tracking at your fingertips.' },
  { icon: Users, title: 'Staff & Attendance', description: 'Manage your workforce, track attendance, and coordinate field activities.' },
  { icon: MapPin, title: 'Multi-Branch Support', description: 'Oversee multiple farm locations from a single centralized platform.' },
  { icon: Shield, title: 'Role-Based Access', description: 'Secure access control with roles for managers, accountants, and field staff.' },
];

const stats = [
  { value: '5+', label: 'Farm Types Supported' },
  { value: '100+', label: 'Staff Managed' },
  { value: '$2M+', label: 'Revenue Tracked' },
  { value: '99.9%', label: 'Uptime Guaranteed' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Sprout className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">FarmIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gap-1.5">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 right-10 opacity-10">
          <Leaf className="h-72 w-72 text-primary rotate-12" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <TrendingUp className="h-3.5 w-3.5" />
              Smart Farm Management
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Manage Your Farm
              <span className="block text-primary">With Confidence</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              FarmIQ is a comprehensive farm management system that helps you track inventory, manage staff, monitor finances, and oversee all your operations from one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/login">
                <Button size="lg" className="gap-2 text-base px-8 h-12 w-full sm:w-auto">
                  Start Managing <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 w-full sm:w-auto">
                  Explore Features
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-display font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Everything You Need to Run Your Farm
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From daily operations to financial reporting, FarmIQ covers every aspect of modern farm management.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-10 sm:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground mb-4">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of farm owners who trust FarmIQ to streamline their operations and boost productivity.
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="gap-2 text-base px-8 h-12">
                Get Started Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">FarmIQ</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 FarmIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
