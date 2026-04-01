
## HR & Payroll Module Implementation Plan

### 1. Database Tables (Migration)
- **employees** — Full HR profile: name, id_number, tax_number, department, position, employment_date, basic_salary, housing_allowance, transport_allowance, tax_deduction, pension_deduction, medical_aid_deduction, bank_name, bank_account, branch_id, status, user_id (link to auth)
- **payroll_runs** — period_start, period_end, run_date, status (draft/approved/paid), total_gross, total_deductions, total_net, gl_account_id, gl_sub_account_id, branch_id, processed_by
- **payroll_items** — payroll_run_id, employee_id, basic_salary, housing_allowance, transport_allowance, gross_pay, tax_deduction, pension_deduction, medical_aid_deduction, total_deductions, net_pay

### 2. UI Pages & Components
- **HR Page** (`/hr`) with tabs: Employees | Payroll | Payslips | Reports
- **EmployeesList** — CRUD for employee profiles
- **PayrollProcessor** — Create payroll run, auto-calculate from employee records, link GL account, approve/finalize
- **PayslipViewer** — View and print individual payslips with earnings/deductions breakdown
- **PayrollReports** — Filterable by date range, branch, department; summary totals; GL posting details; CSV export

### 3. GL Integration
- Payroll processing requires selecting a GL account (expense type)
- On approval, GL entries are posted for each payroll run

### 4. Navigation
- Add HR module to sidebar with appropriate icon
