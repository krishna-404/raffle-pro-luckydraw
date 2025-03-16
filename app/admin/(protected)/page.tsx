'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CalendarDays, ChevronRight, Gift, QrCode, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardStats, type DashboardStats } from "./actions";
import { DashboardHeader } from "./components/header";
import { Overview } from "./components/overview";
import { DashboardShell } from "./components/shell";

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQrCodes: 0,
    totalEvents: 0,
    totalEntries: 0,
    totalWinners: 0,
    recentEntries: [],
    monthlyStats: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Dashboard" 
        text="Overview of your raffle system's performance and statistics."
      />
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/qr-codes" className="block">
              <Card className="transition-all hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total QR Codes
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <QrCode className="h-4 w-4 text-muted-foreground" />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalQrCodes}</div>
                  <p className="text-xs text-muted-foreground">
                    Generated across all events
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/events" className="block">
              <Card className="transition-all hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Events
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently running events
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/entries" className="block">
              <Card className="transition-all hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Entries
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEntries}</div>
                  <p className="text-xs text-muted-foreground">
                    Participants across all events
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/winners" className="block">
              <Card className="transition-all hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Winners
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalWinners}</div>
                  <p className="text-xs text-muted-foreground">
                    Winners across all events
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview data={stats.monthlyStats} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {stats.recentEntries.map((entry) => (
                    <div className="flex items-center" key={entry.id}>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {entry.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.event_name}
                        </p>
                      </div>
                      <div className="ml-auto text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), 'PPp')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <p className="text-muted-foreground">
                Analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <p className="text-muted-foreground">
                Reports dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
} 