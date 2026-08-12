import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Save, X } from 'lucide-react';
import { supabase } from '@/lib/backend';
import { toast } from 'sonner';

interface ProfileFormData {
  full_name: string;
  phone: string;
  id_number: string;
  address: string;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialData: ProfileFormData;
  onProfileUpdated: (data: ProfileFormData) => void;
}

export const EditProfileDialog = ({
  open,
  onOpenChange,
  userId,
  initialData,
  onProfileUpdated,
}: EditProfileDialogProps) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          id_number: formData.id_number.trim() || null,
          address: formData.address.trim() || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      onProfileUpdated(formData);
      toast.success('Profile updated successfully!');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="input-farm"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ID Number</label>
            <input
              type="text"
              value={formData.id_number}
              onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
              className="input-farm"
              placeholder="National ID / Passport"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-farm"
              placeholder="+263-77-000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-farm min-h-[80px] resize-none"
              placeholder="Physical address"
              maxLength={500}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
              <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
