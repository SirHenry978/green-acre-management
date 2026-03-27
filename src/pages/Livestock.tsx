import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LivestockList } from '@/components/livestock/LivestockList';
import { SheltersList } from '@/components/livestock/SheltersList';
import { HealthRecords } from '@/components/livestock/HealthRecords';
import { TransferRecords } from '@/components/livestock/TransferRecords';
import { LivestockReports } from '@/components/livestock/LivestockReports';
import { Bug, Home, Stethoscope, ArrowLeftRight, FileText } from 'lucide-react';

const Livestock = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Livestock Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all livestock, shelters, health records, transfers, and reports
          </p>
        </div>

        <Tabs defaultValue="animals" className="w-full">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="animals" className="gap-2"><Bug className="h-4 w-4" /> Animals</TabsTrigger>
            <TabsTrigger value="shelters" className="gap-2"><Home className="h-4 w-4" /> Shelters</TabsTrigger>
            <TabsTrigger value="health" className="gap-2"><Stethoscope className="h-4 w-4" /> Health</TabsTrigger>
            <TabsTrigger value="transfers" className="gap-2"><ArrowLeftRight className="h-4 w-4" /> Transfers</TabsTrigger>
            <TabsTrigger value="reports" className="gap-2"><FileText className="h-4 w-4" /> Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="animals"><LivestockList /></TabsContent>
          <TabsContent value="shelters"><SheltersList /></TabsContent>
          <TabsContent value="health"><HealthRecords /></TabsContent>
          <TabsContent value="transfers"><TransferRecords /></TabsContent>
          <TabsContent value="reports"><LivestockReports /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Livestock;
