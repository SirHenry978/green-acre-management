import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Branch, users } from '@/data/dummyData';

interface BranchFormProps {
  branch?: Branch | null;
  onSubmit: (branchData: Omit<Branch, 'id' | 'totalStaff' | 'monthlyRevenue' | 'monthlyExpenses'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const farmTypes = [
  { value: 'crops', label: 'Crops' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'aquaculture', label: 'Aquaculture' },
  { value: 'mixed', label: 'Mixed Farming' },
];

export const BranchForm = ({ branch, onSubmit, onCancel, isEdit = false }: BranchFormProps) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [farmType, setFarmType] = useState<Branch['farmType']>('crops');
  const [size, setSize] = useState('');
  const [managerId, setManagerId] = useState('');
  const [status, setStatus] = useState<Branch['status']>('active');

  const managers = users.filter(u => u.role === 'branch_manager');

  useEffect(() => {
    if (branch) {
      setName(branch.name);
      setLocation(branch.location);
      setFarmType(branch.farmType);
      setSize(branch.size);
      setManagerId(branch.managerId);
      setStatus(branch.status);
    }
  }, [branch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      location,
      farmType,
      size,
      managerId,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="name" className="block text-sm font-medium mb-2">Branch Name</Label>
        <input 
          id="name"
          type="text" 
          className="input-farm" 
          placeholder="Enter branch name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="location" className="block text-sm font-medium mb-2">Location</Label>
        <input 
          id="location"
          type="text" 
          className="input-farm" 
          placeholder="City, State/Country"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="farmType" className="block text-sm font-medium mb-2">Farm Type</Label>
        <select 
          id="farmType"
          className="input-farm"
          value={farmType}
          onChange={(e) => setFarmType(e.target.value as Branch['farmType'])}
        >
          {farmTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="size" className="block text-sm font-medium mb-2">Size</Label>
        <input 
          id="size"
          type="text" 
          className="input-farm" 
          placeholder="e.g., 500 acres"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="manager" className="block text-sm font-medium mb-2">Assign Manager</Label>
        <select 
          id="manager"
          className="input-farm"
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          required
        >
          <option value="">Select a manager</option>
          {managers.map(manager => (
            <option key={manager.id} value={manager.id}>{manager.name}</option>
          ))}
        </select>
      </div>
      {isEdit && (
        <div>
          <Label htmlFor="status" className="block text-sm font-medium mb-2">Status</Label>
          <select 
            id="status"
            className="input-farm"
            value={status}
            onChange={(e) => setStatus(e.target.value as Branch['status'])}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {isEdit ? 'Update Branch' : 'Create Branch'}
        </Button>
      </div>
    </form>
  );
};
