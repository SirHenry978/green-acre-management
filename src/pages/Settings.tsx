import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  Save
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const settingSections = [
    {
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your personal information and preferences',
      fields: [
        { label: 'Full Name', type: 'text', value: user?.name || '', placeholder: 'Your name' },
        { label: 'Email', type: 'email', value: user?.email || '', placeholder: 'your@email.com' },
        { label: 'Phone', type: 'tel', value: '+1-555-0100', placeholder: 'Phone number' },
      ]
    },
  ];

  const toggleSettings = [
    { 
      title: 'Email Notifications', 
      description: 'Receive email updates about farm activities',
      icon: Bell,
      enabled: true,
      onChange: () => {}
    },
    { 
      title: 'Two-Factor Authentication', 
      description: 'Add an extra layer of security to your account',
      icon: Shield,
      enabled: false,
      onChange: () => {}
    },
    { 
      title: 'Dark Mode', 
      description: 'Switch between light and dark themes',
      icon: Palette,
      enabled: isDark,
      onChange: toggleTheme
    },
    { 
      title: 'Language', 
      description: 'Select your preferred language',
      icon: Globe,
      enabled: true,
      onChange: () => {}
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        {settingSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="card-farm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.label}>
                    <label className="block text-sm font-medium mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      placeholder={field.placeholder}
                      className="input-farm max-w-md"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          );
        })}

        {/* Toggle Settings */}
        <div className="card-farm p-6">
          <h2 className="font-display font-semibold text-lg mb-6">Preferences</h2>
          <div className="space-y-6">
            {toggleSettings.map((setting) => {
              const Icon = setting.icon;
              return (
                <div key={setting.title} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{setting.title}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Switch checked={setting.enabled} onCheckedChange={setting.onChange} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <div className="card-farm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-accent/20 p-2">
              <HelpCircle className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Need Help?</h2>
              <p className="text-sm text-muted-foreground">Get support or learn more about FarmHub</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" className="justify-start">
              Documentation
            </Button>
            <Button variant="outline" className="justify-start">
              Contact Support
            </Button>
            <Button variant="outline" className="justify-start">
              FAQs
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card-farm p-6 border-destructive/50">
          <h2 className="font-display font-semibold text-lg text-destructive mb-2">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Irreversible actions that affect your account
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
              Reset All Settings
            </Button>
            <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
