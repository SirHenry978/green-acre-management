import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { branches, getRoleLabel } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog';
import { MyPayslips } from '@/components/profile/MyPayslips';
import { supabase } from '@/lib/backend';
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Edit,
  Lock,
  MapPin,
  CreditCard,
  Receipt,
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    id_number: '',
    address: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (data) {
        setProfileData({
          full_name: data.full_name || user?.name || '',
          phone: data.phone || user?.phone || '',
          id_number: data.id_number || '',
          address: data.address || '',
        });
        setAvatarUrl(data.avatar_url);
      }
    };
    fetchProfile();
  }, [user]);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getBranchName = (branchId?: string) => {
    if (!branchId) return 'All Branches';
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  const displayName = profileData.full_name || user?.name || 'User';

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your account information</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)} className="gap-2">
              <Lock className="h-4 w-4" /> Change Password
            </Button>
            <Button onClick={() => setIsEditDialogOpen(true)} className="gap-2">
              <Edit className="h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="card-farm p-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <AvatarUpload
              userId={user?.id || ''}
              avatarUrl={avatarUrl}
              initials={getInitials(displayName)}
              onAvatarUpdated={setAvatarUrl}
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-display font-bold">{displayName}</h2>
              <Badge className="mt-2 bg-primary/10 text-primary gap-1">
                <Shield className="h-3 w-3" />
                {user?.role ? getRoleLabel(user.role) : 'Unknown Role'}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 mt-8 sm:grid-cols-2">
            <InfoTile icon={Mail} label="Email Address" value={user?.email || 'Not set'} />
            <InfoTile icon={Phone} label="Phone Number" value={profileData.phone || 'Not set'} />
            <InfoTile icon={Building2} label="Assigned Branch" value={getBranchName(user?.branchId)} />
            <InfoTile icon={User} label="User ID" value={user?.id || ''} mono />
            <InfoTile icon={CreditCard} label="ID Number" value={profileData.id_number || 'Not set'} />
            <InfoTile icon={MapPin} label="Address" value={profileData.address || 'Not set'} />
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

        {/* My Payslips */}
        <div className="card-farm p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> My Payslips
          </h3>
          <MyPayslips />
        </div>

        {/* Dialogs */}
        <EditProfileDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          userId={user?.id || ''}
          initialData={profileData}
          onProfileUpdated={setProfileData}
        />
        <ChangePasswordDialog
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
};

const InfoTile = ({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
    <div className="rounded-full bg-primary/10 p-3">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium truncate ${mono ? 'font-mono text-sm' : ''}`}>{value}</p>
    </div>
  </div>
);

export default Profile;
