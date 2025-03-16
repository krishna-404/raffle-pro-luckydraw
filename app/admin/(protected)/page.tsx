'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CalendarDays, ChevronRight, QrCode, Users } from "lucide-react";
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
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total QR Codes
                </CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQrCodes}</div>
                <p className="text-xs text-muted-foreground">
                  Generated across all events
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Events
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Currently running events
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Entries
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEntries}</div>
                <p className="text-xs text-muted-foreground">
                  Participants across all events
                </p>
              </CardContent>
            </Card>
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
                  {stats.recentEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent entries found.</p>
                  ) : (
                    <>
                      {stats.recentEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{entry.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.event_name}
                            </p>
                          </div>
                          <div className="ml-auto text-sm text-muted-foreground">
                            {format(new Date(entry.created_at), 'PPp')}
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/admin/entries">
                            View all entries
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
} 