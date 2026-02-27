import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { mockAccessLogs } from "@/lib/data";
import { TierBadge } from "@/components/MemberCard";
import Layout from "@/components/Layout";

const statusConfig = {
  granted: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  denied: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
};

const AccessLogPage = () => {
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Access Log</h1>
          <p className="text-muted-foreground mt-1">Recent entry verification attempts</p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Status</span>
            <span>Member</span>
            <span>Tier</span>
            <span>Confidence</span>
            <span>Timestamp</span>
            <span>Action</span>
          </div>
          {mockAccessLogs.map((log) => {
            const cfg = statusConfig[log.status];
            const Icon = cfg.icon;
            return (
              <div key={log.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center hover:bg-secondary/30 transition-colors">
                <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex items-center gap-3">
                  {log.photoUrl ? (
                    <img src={log.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">?</div>
                  )}
                  <span className="text-sm text-foreground font-medium">{log.memberName}</span>
                </div>
                <TierBadge tier={log.tier} />
                <span className={`text-sm font-mono ${log.confidence > 80 ? "text-success" : "text-destructive"}`}>
                  {log.confidence}%
                </span>
                <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                <span className={`text-xs font-medium capitalize ${cfg.color}`}>{log.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default AccessLogPage;
