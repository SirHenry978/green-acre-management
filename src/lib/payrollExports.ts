import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Employee, PayrollRun, PayrollItem } from '@/hooks/useEmployees';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n || 0);

export const generatePayslipPDF = (emp: Employee, item: any, run: PayrollRun) => {
  const doc = new jsPDF();
  doc.setFontSize(18); doc.text('PAYSLIP', 14, 18);
  doc.setFontSize(10);
  doc.text(`Period: ${run.period_start} to ${run.period_end}`, 14, 26);
  doc.text(`Run Date: ${run.run_date}`, 14, 32);

  doc.setFontSize(11); doc.text('Employee Details', 14, 44);
  autoTable(doc, {
    startY: 47,
    theme: 'plain',
    body: [
      ['Name', `${emp.first_name} ${emp.last_name}`],
      ['ID Number', emp.id_number || '-'],
      ['Department', emp.department || '-'],
      ['Position', emp.position || '-'],
      ['Pay Type', item.pay_type || 'monthly'],
      ['Bank', `${emp.bank_name || '-'} / ${emp.bank_account || '-'}`],
    ],
    styles: { fontSize: 9 },
  });

  const earnings: any[] = [['Basic Pay', fmt(item.basic_salary)]];
  if (item.overtime_pay > 0) earnings.push(['Overtime Pay', fmt(item.overtime_pay)]);
  if (item.housing_allowance > 0) earnings.push(['Housing Allowance', fmt(item.housing_allowance)]);
  if (item.transport_allowance > 0) earnings.push(['Transport Allowance', fmt(item.transport_allowance)]);
  if (item.food_allowance > 0) earnings.push(['Food Allowance', fmt(item.food_allowance)]);
  if (item.harvest_bonus > 0) earnings.push(['Harvest Bonus', fmt(item.harvest_bonus)]);
  if (item.other_earnings > 0) earnings.push(['Other Earnings', fmt(item.other_earnings)]);
  earnings.push([{ content: 'Gross Pay', styles: { fontStyle: 'bold' } }, { content: fmt(item.gross_pay), styles: { fontStyle: 'bold' } }]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 6,
    head: [['Earnings', 'Amount']],
    body: earnings,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 139, 34] },
  });

  const deductions: any[] = [];
  if (item.tax_deduction > 0) deductions.push(['Tax (PAYE)', fmt(item.tax_deduction)]);
  if (item.pension_deduction > 0) deductions.push(['Pension', fmt(item.pension_deduction)]);
  if (item.medical_aid_deduction > 0) deductions.push(['Medical Aid', fmt(item.medical_aid_deduction)]);
  if (item.loan_deduction > 0) deductions.push(['Loan Repayment', fmt(item.loan_deduction)]);
  if (item.accommodation_deduction > 0) deductions.push(['Accommodation', fmt(item.accommodation_deduction)]);
  if (item.absence_penalty > 0) deductions.push(['Absence Penalty', fmt(item.absence_penalty)]);
  if (item.other_deductions > 0) deductions.push(['Other Deductions', fmt(item.other_deductions)]);
  deductions.push([{ content: 'Total Deductions', styles: { fontStyle: 'bold' } }, { content: fmt(item.total_deductions), styles: { fontStyle: 'bold' } }]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 6,
    head: [['Deductions', 'Amount']],
    body: deductions,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [180, 60, 60] },
  });

  const netY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(34, 139, 34); doc.rect(14, netY, 182, 10, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(12);
  doc.text(`NET PAY: ${fmt(item.net_pay)}`, 18, netY + 7);
  doc.setTextColor(0, 0, 0); doc.setFontSize(9);
  doc.text(`Payment Method: ${(item.payment_method || 'bank').replace('_', ' ')}`, 14, netY + 18);
  if (item.paid_at) doc.text(`Paid: ${new Date(item.paid_at).toLocaleString()}`, 14, netY + 24);

  doc.save(`payslip-${emp.first_name}-${emp.last_name}-${run.period_start}.pdf`);
};

export const generatePayrollExcel = (
  run: PayrollRun,
  items: any[],
  getEmployeeById: (id: string) => Employee | undefined,
) => {
  const rows = items.map(it => {
    const e = getEmployeeById(it.employee_id);
    return {
      Employee: e ? `${e.first_name} ${e.last_name}` : 'Unknown',
      Department: e?.department || '',
      Position: e?.position || '',
      'Pay Type': it.pay_type || 'monthly',
      'Days': it.days_worked || 0,
      'Hours': it.hours_worked || 0,
      'OT Hours': it.overtime_hours || 0,
      'Quantity': it.quantity_produced || 0,
      'Basic': it.basic_salary,
      'Overtime': it.overtime_pay || 0,
      'Housing': it.housing_allowance,
      'Transport': it.transport_allowance,
      'Food': it.food_allowance || 0,
      'Bonus': it.harvest_bonus || 0,
      'Other Earnings': it.other_earnings || 0,
      'Gross Pay': it.gross_pay,
      'Tax': it.tax_deduction,
      'Pension': it.pension_deduction,
      'Medical': it.medical_aid_deduction,
      'Loan': it.loan_deduction || 0,
      'Accommodation': it.accommodation_deduction || 0,
      'Penalty': it.absence_penalty || 0,
      'Other Deductions': it.other_deductions || 0,
      'Total Deductions': it.total_deductions,
      'Net Pay': it.net_pay,
      'Payment Method': it.payment_method || 'bank',
      'Paid At': it.paid_at || '',
    };
  });

  const summary = [
    ['Period', `${run.period_start} to ${run.period_end}`],
    ['Run Date', run.run_date],
    ['Status', run.status],
    ['Total Gross', run.total_gross],
    ['Total Deductions', run.total_deductions],
    ['Total Net', run.total_net],
    ['Employee Count', items.length],
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Payroll Detail');
  XLSX.writeFile(wb, `payroll-${run.period_start}-to-${run.period_end}.xlsx`);
};
