import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Users, FileCheck, AlertTriangle, TrendingUp, MapPin, Activity, IndianRupee, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { generateForecasts, cityRiskProfiles } from '@/lib/ai-engine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const COLORS = ['hsl(152,60%,42%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)', 'hsl(210,100%,52%)', 'hsl(280,60%,50%)', 'hsl(170,70%,38%)', 'hsl(340,65%,47%)'];
const riskBadge = (level: string) => {
  const v: Record<string, string> = { Critical: 'bg-destructive text-destructive-foreground', High: 'bg-accent text-accent-foreground', Medium: 'bg-info text-info-foreground', Low: 'bg-primary text-primary-foreground' };
  return v[level] || '';
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { workers, policies, claims } = useStore();
  const forecasts = useMemo(() => generateForecasts(), []);

  const totalPremiums = policies.filter(p => p.status === 'Active').reduce((s, p) => s + p.weeklyPremium, 0);
  const totalPayouts = claims.filter(c => c.status === 'Paid').reduce((s, c) => s + c.payoutAmount, 0);
  const lossRatio = totalPremiums > 0 ? ((totalPayouts / (totalPremiums * 4)) * 100).toFixed(1) : '0';
  const fraudPrevented = claims.filter(c => c.fraudScore >= 60).length;
  const todayClaims = claims.filter(c => new Date(c.detectedAt).toDateString() === new Date().toDateString()).length;

  const claimsByType = useMemo(() => {
    const map: Record<string, number> = {};
    claims.forEach(c => { map[c.disruptionType] = (map[c.disruptionType] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [claims]);

  const cityData = useMemo(() => {
    return Object.entries(cityRiskProfiles).map(([city, profile]) => ({
      city,
      risk: profile.baseRisk,
      workers: workers.filter(w => w.city === city).length,
      claims: claims.filter(c => workers.find(w => w.id === c.workerId)?.city === city).length,
    }));
  }, [workers, claims]);

  const weeklyTrend = useMemo(() => {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      day,
      claims: Math.round(2 + Math.random() * 8),
      premiums: Math.round(150 + Math.random() * 300),
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4" /></Button>
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">GigShield AI — Insurer Analytics</p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary text-primary">Live</Badge>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Workers Insured', value: workers.length, icon: Users, prefix: '' },
            { label: 'Claims Today', value: todayClaims, icon: FileCheck, prefix: '' },
            { label: 'Fraud Prevented', value: fraudPrevented, icon: AlertTriangle, prefix: '' },
            { label: 'Loss Ratio', value: `${lossRatio}%`, icon: TrendingUp, prefix: '' },
            { label: 'Total Payouts', value: `₹${totalPayouts.toLocaleString()}`, icon: IndianRupee, prefix: '' },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
              <div className="text-xl font-bold">{m.prefix}{m.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Claims by type */}
          <div className="bg-card rounded-xl border shadow-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Claims by Type</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={claimsByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {claimsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* City risk chart */}
          <div className="bg-card rounded-xl border shadow-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> City Risk Scores</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cityData}>
                <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="risk" fill="hsl(152,60%,42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly trend */}
          <div className="bg-card rounded-xl border shadow-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Weekly Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="claims" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="premiums" stroke="hsl(152,60%,42%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive Forecasts */}
        <div className="bg-card rounded-xl border shadow-card p-6 mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Next Week Risk Forecast — AI Prediction</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {forecasts.map((f, i) => (
              <motion.div key={f.city} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{f.city}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${riskBadge(f.riskLevel)}`}>{f.riskLevel}</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between text-muted-foreground"><span>Primary Threat</span><span className="font-medium text-foreground">{f.primaryThreat}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Probability</span><span className="font-medium text-foreground">{f.probability}%</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Expected Claims</span><span className="font-medium text-foreground">{f.expectedClaims}</span></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{f.recommendation}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Workers Table */}
        <div className="bg-card rounded-xl border shadow-card p-6">
          <h3 className="font-semibold mb-4">Insured Workers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground text-left">
                <th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">City</th><th className="pb-2 font-medium">Platform</th><th className="pb-2 font-medium">Zone</th><th className="pb-2 font-medium">Premium</th><th className="pb-2 font-medium">Risk</th><th className="pb-2 font-medium">Claims</th><th className="pb-2 font-medium"></th>
              </tr></thead>
              <tbody>
                {workers.map(w => {
                  const p = policies.find(pol => pol.workerId === w.id);
                  const wc = claims.filter(c => c.workerId === w.id).length;
                  return (
                    <tr key={w.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-medium">{w.name}</td>
                      <td className="py-3">{w.city}</td>
                      <td className="py-3">{w.platform}</td>
                      <td className="py-3">{w.workZone}</td>
                      <td className="py-3">₹{p?.weeklyPremium || '-'}</td>
                      <td className="py-3"><span className={p && p.riskScore > 60 ? 'text-destructive font-semibold' : ''}>{p?.riskScore || '-'}%</span></td>
                      <td className="py-3">{wc}</td>
                      <td className="py-3"><Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/${w.id}`)}>View</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
