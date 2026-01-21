import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { branches, getRoleLabel } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId) return 'All Branches';
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    toast.success('Profile updated successfully!');
    setIsEditDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your account information
            </p>
          </div>
          <Button onClick={() => setIsEditDialogOpen(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Card */}
        <div className="card-farm p-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {user ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-display font-bold">{user?.name}</h2>
              <Badge className="mt-2 bg-primary/10 text-primary gap-1">
                <Shield className="h-3 w-3" />
                {user?.role ? getRoleLabel(user.role) : 'Unknown Role'}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 mt-8 sm:grid-cols-2">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="rounded-full bg-primary/10 p-3">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{user?.phone || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="rounded-full bg-primary/10 p-3">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Branch</p>
                <p className="font-medium">{getBranchName(user?.branchId)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="rounded-full bg-primary/10 p-3">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium font-mono text-sm">{user?.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="card-farm p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Account Activity</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">45</p>
              <p className="text-sm text-muted-foreground">Days Active</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-success">128</p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-accent-foreground">98%</p>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-farm"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-farm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-farm"
                  placeholder="+1-555-0100"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 gap-2" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
