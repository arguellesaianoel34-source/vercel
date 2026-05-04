import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MailPlus, CheckCircle2, MessageSquareQuote, Loader2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey()
    }
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Total Inquiries",
      value: stats?.totalContacts || 0,
      icon: Users,
      color: "text-blue-500",
      badge: null
    },
    {
      title: "New Leads",
      value: stats?.newContacts || 0,
      icon: MailPlus,
      color: "text-accent",
      badge: null
    },
    {
      title: "Responded",
      value: stats?.respondedContacts || 0,
      icon: CheckCircle2,
      color: "text-primary",
      badge: null
    },
    {
      title: "Testimonials",
      value: stats?.totalTestimonials || 0,
      icon: MessageSquareQuote,
      color: "text-purple-500",
      badge: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge className="bg-accent/20 text-accent hover:bg-accent/30 border-0">New</Badge>;
      case 'read': return <Badge variant="secondary" className="border-0">Read</Badge>;
      case 'responded': return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">Responded</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time pulse on your operations pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              {stat.badge && (
                <p className="text-xs text-muted-foreground mt-1">{stat.badge}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Inquiries</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">The latest leads hitting your pipeline.</p>
            </div>
            <Link href="/admin/contacts" className="text-sm font-medium text-primary hover:underline flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {(stats?.recentContacts || []).length > 0 ? (
              <div className="space-y-4">
                {(stats?.recentContacts || []).map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{contact.name}</span>
                        {getStatusBadge(contact.status)}
                      </div>
                      <span className="text-sm text-muted-foreground">{contact.email} • {contact.company || 'No Company'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground hidden sm:block">
                      {format(new Date(contact.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-background rounded-lg border border-border">
                No recent inquiries found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
