import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, FileText, BarChart3, CalendarDays, HandCoins } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useGLAccounts } from '@/hooks/useGLAccounts';
import { useLeave } from '@/hooks/useLeave';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { EmployeesList } from '@/components/hr/EmployeesList';
import { PayrollProcessor } from '@/components/hr/PayrollProcessor';
import { PayslipViewer } from '@/components/hr/PayslipViewer';
import { PayrollReports } from '@/components/hr/PayrollReports';
import { LeaveManagement } from '@/components/hr/LeaveManagement';
import { LoansAndBonuses } from '@/components/hr/LoansAndBonuses';

const HumanResources = () => {
  const {
    employees, payrollRuns, payrollItems, loading,
    createEmployee, updateEmployee, deleteEmployee,
    createPayrollRun, createPayrollItems, updatePayrollRun,
    getPayrollItemsForRun, getEmployeeById,
  } = useEmployees();

  const { accounts, createEntry } = useGLAccounts();

  const {
    balances, requests, loading: leaveLoading,
    createRequest, approveRequest, rejectRequest,
    allocateAllEmployees, getBalanceForEmployee, getUnpaidLeaveDays,
  } = useLeave();

  const { leaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } = useLeaveTypes();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Human Resources</h1>
          <p className="text-muted-foreground">Manage employees, leave, payroll, payslips, and reports</p>
        </div>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" /><span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /><span className="hidden sm:inline">Leave</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /><span className="hidden sm:inline">Payroll</span>
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center gap-2">
              <HandCoins className="h-4 w-4" /><span className="hidden sm:inline">Loans & Bonuses</span>
            </TabsTrigger>
            <TabsTrigger value="payslips" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /><span className="hidden sm:inline">Payslips</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeesList
              employees={employees}
              loading={loading}
              createEmployee={createEmployee}
              updateEmployee={updateEmployee}
              deleteEmployee={deleteEmployee}
            />
          </TabsContent>

          <TabsContent value="leave">
            <LeaveManagement
              employees={employees}
              balances={balances}
              requests={requests}
              loading={leaveLoading}
              createRequest={createRequest}
              approveRequest={approveRequest}
              rejectRequest={rejectRequest}
              allocateAllEmployees={allocateAllEmployees}
              getBalanceForEmployee={getBalanceForEmployee}
              leaveTypes={leaveTypes}
              createLeaveType={createLeaveType}
              updateLeaveType={updateLeaveType}
              deleteLeaveType={deleteLeaveType}
            />
          </TabsContent>

          <TabsContent value="payroll">
            <PayrollProcessor
              employees={employees}
              payrollRuns={payrollRuns}
              createPayrollRun={createPayrollRun}
              createPayrollItems={createPayrollItems}
              updatePayrollRun={updatePayrollRun}
              getPayrollItemsForRun={getPayrollItemsForRun}
              getEmployeeById={getEmployeeById}
              glCreateEntry={createEntry}
              getUnpaidLeaveDays={getUnpaidLeaveDays}
            />
          </TabsContent>

          <TabsContent value="loans">
            <LoansAndBonuses employees={employees} />
          </TabsContent>

          <TabsContent value="payslips">
            <PayslipViewer
              employees={employees}
              payrollRuns={payrollRuns}
              getPayrollItemsForRun={getPayrollItemsForRun}
              getEmployeeById={getEmployeeById}
            />
          </TabsContent>

          <TabsContent value="reports">
            <PayrollReports
              employees={employees}
              payrollRuns={payrollRuns}
              getPayrollItemsForRun={getPayrollItemsForRun}
              getEmployeeById={getEmployeeById}
              glAccounts={accounts}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default HumanResources;

