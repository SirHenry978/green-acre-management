import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Home, BedDouble, ClipboardList, Users, BarChart3, MessageSquareWarning, UserCircle } from 'lucide-react';
import { useAccommodation } from '@/hooks/useAccommodation';
import { useEmployees } from '@/hooks/useEmployees';
import { AccommodationDashboard } from '@/components/accommodation/AccommodationDashboard';
import { HousesManager } from '@/components/accommodation/HousesManager';
import { RoomsManager } from '@/components/accommodation/RoomsManager';
import { ApplicationsPanel } from '@/components/accommodation/ApplicationsPanel';
import { AllocationsPanel } from '@/components/accommodation/AllocationsPanel';
import { AccommodationReports } from '@/components/accommodation/AccommodationReports';
import { RequestsPanel } from '@/components/accommodation/RequestsPanel';
import { MyHousingPanel } from '@/components/accommodation/MyHousingPanel';

const Accommodation = () => {
  const acc = useAccommodation();
  const { employees } = useEmployees();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'dashboard';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Accommodation</h1>
          <p className="text-muted-foreground">Manage houses, rooms, applications, allocations and payroll deductions</p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setSearchParams({ tab: v })}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full max-w-5xl">
            <TabsTrigger value="my-housing" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" /><span className="hidden sm:inline">My Housing</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="houses" className="flex items-center gap-2">
              <Home className="h-4 w-4" /><span className="hidden sm:inline">Houses</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <BedDouble className="h-4 w-4" /><span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /><span className="hidden sm:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger value="allocations" className="flex items-center gap-2">
              <Users className="h-4 w-4" /><span className="hidden sm:inline">Allocations</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4" /><span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-housing">
            <MyHousingPanel acc={acc} employees={employees} />
          </TabsContent>
          <TabsContent value="dashboard">
            <AccommodationDashboard
              houses={acc.houses} rooms={acc.rooms}
              applications={acc.applications} allocations={acc.allocations}
              checkins={acc.checkins}
            />
          </TabsContent>
          <TabsContent value="houses">
            <HousesManager houses={acc.houses} rooms={acc.rooms} acc={acc} />
          </TabsContent>
          <TabsContent value="rooms">
            <RoomsManager houses={acc.houses} rooms={acc.rooms} acc={acc} />
          </TabsContent>
          <TabsContent value="applications">
            <ApplicationsPanel
              applications={acc.applications} rooms={acc.rooms} houses={acc.houses}
              employees={employees} acc={acc}
            />
          </TabsContent>
          <TabsContent value="allocations">
            <AllocationsPanel
              allocations={acc.allocations} rooms={acc.rooms} houses={acc.houses}
              employees={employees} acc={acc}
            />
          </TabsContent>
          <TabsContent value="requests">
            <RequestsPanel
              requests={acc.requests} allocations={acc.allocations}
              rooms={acc.rooms} houses={acc.houses}
              employees={employees} acc={acc}
            />
          </TabsContent>
          <TabsContent value="reports">
            <AccommodationReports
              houses={acc.houses} rooms={acc.rooms} assets={acc.assets}
              applications={acc.applications} allocations={acc.allocations}
              checkins={acc.checkins} employees={employees}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Accommodation;
