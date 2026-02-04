import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { branches, InventoryItem } from '@/data/dummyData';

interface InventoryItemFormProps {
  item?: InventoryItem | null;
  onSubmit: (data: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  onCancel: () => void;
}

const categories = ['seeds', 'fertilizers', 'chemicals', 'feed', 'machinery', 'tools', 'livestock'] as const;

export const InventoryItemForm = ({ item, onSubmit, onCancel }: InventoryItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'seeds' as InventoryItem['category'],
    branchId: branches[0]?.id || '',
    quantity: 0,
    unit: '',
    minStock: 0,
    value: 0,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        branchId: item.branchId,
        quantity: item.quantity,
        unit: item.unit,
        minStock: item.minStock,
        value: item.value,
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter item name"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as InventoryItem['category'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="branch">Branch</Label>
          <Select
            value={formData.branchId}
            onValueChange={(value) => setFormData({ ...formData, branchId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            placeholder="0"
            min={0}
            required
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="kg, liters, etc."
            required
          />
        </div>
        <div>
          <Label htmlFor="minStock">Min Stock</Label>
          <Input
            id="minStock"
            type="number"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
            placeholder="0"
            min={0}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="value">Value ($)</Label>
        <Input
          id="value"
          type="number"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
          placeholder="0.00"
          min={0}
          step={0.01}
          required
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {item ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
};
