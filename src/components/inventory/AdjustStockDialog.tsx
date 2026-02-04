import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InventoryItem } from '@/data/dummyData';

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onConfirm: (itemId: string, adjustment: number, type: 'add' | 'remove') => void;
}

export const AdjustStockDialog = ({ open, onOpenChange, item, onConfirm }: AdjustStockDialogProps) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState(0);

  const handleConfirm = () => {
    if (item && amount > 0) {
      onConfirm(item.id, amount, adjustmentType);
      setAmount(0);
      setAdjustmentType('add');
      onOpenChange(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock: {item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Current Stock: <span className="font-medium text-foreground">{item.quantity} {item.unit}</span>
            </p>
          </div>
          <div>
            <Label>Adjustment Type</Label>
            <RadioGroup
              value={adjustmentType}
              onValueChange={(v) => setAdjustmentType(v as 'add' | 'remove')}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="cursor-pointer">Add Stock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="remove" id="remove" />
                <Label htmlFor="remove" className="cursor-pointer">Remove Stock</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="amount">Amount ({item.unit})</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              min={1}
              max={adjustmentType === 'remove' ? item.quantity : undefined}
            />
          </div>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              New Stock: <span className="font-medium text-foreground">
                {adjustmentType === 'add' 
                  ? item.quantity + amount 
                  : Math.max(0, item.quantity - amount)} {item.unit}
              </span>
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" className="flex-1" onClick={handleConfirm} disabled={amount <= 0}>
              Confirm Adjustment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
