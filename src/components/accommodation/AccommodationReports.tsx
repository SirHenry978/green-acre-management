import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { AccAllocation, AccApplication, AccCheckin, AccHouse, AccRoom, AccRoomAsset } from '@/hooks/useAccommodation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  houses: AccHouse[];
  rooms: AccRoom[];
  assets: AccRoomAsset[];
  applications: AccApplication[];
  allocations: AccAllocation[];
  checkins: AccCheckin[];
  employees: Employee[];
}

type ReportKey = 'allocations' | 'occupancy' | 'staff_housing' | 'maintenance' | 'deductions';

export const AccommodationReports = ({ houses, rooms, assets, applications, allocations, employees }: Props) => {
  const [report, setReport] = useState<ReportKey>('allocations');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const empName = (id: string) => {
    const e = employees.find(x => x.id === id);
    return e ? `${e.first_name} ${e.last_name}` : 'Unknown';
  };
  const roomLabel = (id: string) => {
    const r = rooms.find(x => x.id === id);
    if (!r) return '—';
    const h = houses.find(x => x.id === r.house_id);
    return `${h?.name || ''} / ${r.room_number}`;
  };

  const data = useMemo(() => {
    if (report === 'allocations') {
      return allocations
        .filter(a => (!dateFrom || a.start_date >= dateFrom) && (!dateTo || a.start_date <= dateTo) && (!statusFilter || a.status === statusFilter))
        .map(a => ({
          Employee: empName(a.employee_id), Room: roomLabel(a.room_id),
          Start: a.start_date, End: a.end_date || '-',
          'Monthly Charge': a.monthly_charge, Status: a.status,
        }));
    }
    if (report === 'occupancy') {
      return rooms.map(r => ({
        House: houses.find(h => h.id === r.house_id)?.name || '-',
        'Room #': r.room_number, Type: r.room_type, Capacity: r.capacity,
        'Monthly Charge': r.monthly_charge, Condition: r.condition_status, Status: r.status,
      }));
    }
    if (report === 'staff_housing') {
      return employees
        .filter(e => e.status === 'active')
        .map(e => {
          const alloc = allocations.find(a => a.employee_id === e.id && (a.status === 'occupied' || a.status === 'reserved'));
          return {
            Employee: `${e.first_name} ${e.last_name}`, Position: e.position || '-',
            Department: e.department || '-',
            Room: alloc ? roomLabel(alloc.room_id) : 'Not housed',
            'Monthly Charge': alloc ? alloc.monthly_charge : 0,
            Status: alloc ? alloc.status : '-',
          };
        });
    }
    if (report === 'maintenance') {
      const r1 = rooms.filter(r => r.condition_status !== 'good' || r.status === 'maintenance').map(r => ({
        Type: 'Room', Item: roomLabel(r.id), Condition: r.condition_status, Status: r.status, Notes: r.notes || '',
      }));
      const r2 = assets.filter(a => a.condition !== 'good').map(a => ({
        Type: 'Asset', Item: `${a.asset_name} (${roomLabel(a.room_id)})`, Condition: a.condition, Status: '-', Notes: a.notes || '',
      }));
      return [...r1, ...r2];
    }
    if (report === 'deductions') {
      return allocations
        .filter(a => a.status === 'occupied' || a.status === 'reserved')
        .map(a => ({
          Employee: empName(a.employee_id), Room: roomLabel(a.room_id),
          'Monthly Deduction': a.monthly_charge, 'Start Date': a.start_date, Status: a.status,
        }));
    }
    return [];
  }, [report, allocations, rooms, houses, assets, employees, dateFrom, dateTo, statusFilter]);

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), report);
    XLSX.writeFile(wb, `accommodation-${report}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const titles: Record<ReportKey, string> = {
      allocations: 'Accommodation Allocations',
      occupancy: 'Vacant vs Occupied Rooms',
      staff_housing: 'Staff Housing List',
      maintenance: 'Maintenance & Condition Report',
      deductions: 'Payroll Accommodation Deductions',
    };
    doc.setFontSize(16); doc.text(titles[report], 14, 18);
    doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 26);
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(d => headers.map(h => String((d as any)[h])));
      autoTable(doc, { head: [headers], body: rows, startY: 32, styles: { fontSize: 8 } });
    }
    doc.save(`accommodation-${report}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(d => headers.map(h => `"${String((d as any)[h]).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `accommodation-${report}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold">Reports</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" />Excel</Button>
          <Button variant="outline" size="sm" onClick={exportPDF}><FileText className="h-4 w-4 mr-1" />PDF</Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select className="input-farm w-56" value={report} onChange={e => setReport(e.target.value as ReportKey)}>
          <option value="allocations">Allocations</option>
          <option value="occupancy">Vacant vs Occupied Rooms</option>
          <option value="staff_housing">Staff Housing List</option>
          <option value="maintenance">Maintenance & Condition</option>
          <option value="deductions">Payroll Deductions</option>
        </select>
        {report === 'allocations' && (
          <>
            <input className="input-farm w-40" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />
            <input className="input-farm w-40" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" />
            <select className="input-farm w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All status</option>
              <option value="reserved">Reserved</option>
              <option value="occupied">Occupied</option>
              <option value="vacated">Vacated</option>
            </select>
          </>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          {data.length > 0 && (
            <thead className="bg-muted/50"><tr>
              {Object.keys(data[0]).map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}
            </tr></thead>
          )}
          <tbody className="divide-y divide-border">
            {data.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((v, j) => <td key={j} className="px-3 py-2">{String(v)}</td>)}
              </tr>
            ))}
            {data.length === 0 && <tr><td className="px-4 py-8 text-center text-muted-foreground">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
