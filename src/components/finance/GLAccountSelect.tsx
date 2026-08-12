import { useState, useEffect } from 'react';
import { supabase } from '@/lib/backend';
import { GLAccount, GLSubAccount } from '@/hooks/useGLAccounts';

interface GLAccountSelectProps {
  selectedAccountId: string;
  selectedSubAccountId: string;
  onAccountChange: (accountId: string) => void;
  onSubAccountChange: (subAccountId: string) => void;
  required?: boolean;
}

const accountTypeLabels: Record<string, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expense',
};

export const GLAccountSelect = ({
  selectedAccountId,
  selectedSubAccountId,
  onAccountChange,
  onSubAccountChange,
  required = true,
}: GLAccountSelectProps) => {
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [subAccounts, setSubAccounts] = useState<GLSubAccount[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await supabase
        .from('gl_accounts')
        .select('*')
        .eq('is_active', true)
        .order('account_code');
      setAccounts((data as unknown as GLAccount[]) || []);
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      const fetchSubs = async () => {
        const { data } = await supabase
          .from('gl_sub_accounts')
          .select('*')
          .eq('parent_account_id', selectedAccountId)
          .eq('is_active', true)
          .order('sub_account_code');
        setSubAccounts((data as unknown as GLSubAccount[]) || []);
      };
      fetchSubs();
    } else {
      setSubAccounts([]);
    }
  }, [selectedAccountId]);

  // Group accounts by type
  const grouped = accounts.reduce((acc, a) => {
    if (!acc[a.account_type]) acc[a.account_type] = [];
    acc[a.account_type].push(a);
    return acc;
  }, {} as Record<string, GLAccount[]>);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">GL Account {required && <span className="text-destructive">*</span>}</label>
        <select
          className="input-farm"
          value={selectedAccountId}
          onChange={(e) => {
            onAccountChange(e.target.value);
            onSubAccountChange('');
          }}
          required={required}
        >
          <option value="">Select GL Account</option>
          {Object.entries(grouped).map(([type, accts]) => (
            <optgroup key={type} label={accountTypeLabels[type] || type}>
              {accts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.account_code} - {a.account_name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Sub-Account</label>
        <select
          className="input-farm"
          value={selectedSubAccountId}
          onChange={(e) => onSubAccountChange(e.target.value)}
          disabled={!selectedAccountId || subAccounts.length === 0}
        >
          <option value="">{subAccounts.length === 0 ? 'No sub-accounts' : 'Select sub-account'}</option>
          {subAccounts.map(s => (
            <option key={s.id} value={s.id}>
              {s.sub_account_code} - {s.sub_account_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
