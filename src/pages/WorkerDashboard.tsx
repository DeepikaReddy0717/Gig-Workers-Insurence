import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowLeft, CloudRain, Thermometer, Wind, Zap, AlertTriangle, CheckCircle2, Clock, IndianRupee, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { getWeatherData } from '@/lib/ai-engine';
import type { DisruptionType } from '@/lib/types';

const disruptions: DisruptionType[] = ['Heavy Rain', 'Extreme Heat', 'Pollution Spike', 'Flood', 'Curfew'];
const disruptionIcons: Record<DisruptionType, typeof CloudRain> = {
  'Heavy Rain': CloudRain, 'Extreme Heat': Thermometer, 'Pollution Spike': Wind, 'Flood': CloudRain, 'Curfew': AlertTriangle,
};

export default function WorkerDashboard() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { workers, policies, claims, simulateDisruption } = useStore();
  const [selectedDisruption, setSelectedDisruption] = useState<DisruptionType>('Heavy Rain');
  const [simResult, setSimResult] = useState<ReturnType<typeof simulateDisruption>>(null);
  const [simulating, setSimulating] = useState(false);

  const worker = workers.find(w => w.id === workerId);
  const policy = policies.find(p => p.workerId === workerId && p.status === 'Active');
  const workerClaims = useMemo(() => claims.filter(c => c.workerId === workerId).sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()), [claims, workerId]);
  const weather = useMemo(() => worker ? getWeatherData(worker.city) : null, [worker]);
  const totalPaid = workerClaims.filter(c => c.status === 'Paid').reduce((s, c) => s + c.payoutAmount, 0);

  if (!worker || !weather) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Worker not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => {
      const res = simulateDisruption(worker.id, selectedDisruption);
      setSimResult(res);
      setSimulating(false);
    }, 1500);
  };

  const riskColor = (score: number) => score > 60 ? 'text-destructive' : score > 35 ? 'text-accent' : 'text-primary';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4" /></Button>
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">{worker.name}</h1>
              <p className="text-sm text-muted-foreground">{worker.platform} • {worker.city} • {worker.workZone}</p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary text-primary">{policy ? 'Active Coverage' : 'No Coverage'}</Badge>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Weekly Premium', value: `₹${policy?.weeklyPremium || 0}`, icon: IndianRupee },
            { label: 'Risk Score', value: `${policy?.riskScore || 0}%`, icon: Activity, color: riskColor(policy?.riskScore || 0) },
            { label: 'Earnings Protected', value: `₹${totalPaid}`, icon: Shield },
            { label: 'Claims Filed', value: String(workerClaims.length), icon: Clock },
            { label: 'Coverage Hours', value: `${policy?.coverageHours || 0}h`, icon: Zap },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className={`h-4 w-4 ${m.color || 'text-muted-foreground'}`} />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
              <div className={`text-xl font-bold ${m.color || ''}`}>{m.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Simulate */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-primary" /> Simulate Disruption
              </h3>
              <Select value={selectedDisruption} onValueChange={v => { setSelectedDisruption(v as DisruptionType); setSimResult(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{disruptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={handleSimulate} disabled={simulating || !policy} className="w-full mt-4 bg-gradient-primary text-primary-foreground hover:opacity-90">
                {simulating ? 'Detecting disruption...' : 'Trigger Disruption'}
              </Button>

              <AnimatePresence>
                {simResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mt-4">
                    <div className={`rounded-lg p-4 text-sm space-y-2 ${simResult.claim.fraudScore >= 60 ? 'bg-destructive/10 border border-destructive/30' : 'bg-primary/10 border border-primary/30'}`}>
                      {simResult.claim.fraudScore >= 60 ? (
                        <>
                          <div className="flex items-center gap-2 font-semibold text-destructive"><AlertTriangle className="h-4 w-4" /> Claim Flagged</div>
                          <p className="text-muted-foreground">Fraud score: {simResult.claim.fraudScore}%</p>
                          {simResult.claim.fraudFlags.map((f, i) => <p key={i} className="text-xs text-destructive">• {f}</p>)}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 font-semibold text-primary"><CheckCircle2 className="h-4 w-4" /> Claim Auto-Approved!</div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Income Loss</span><span>₹{simResult.claim.incomeLoss}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Payout</span><span className="font-bold text-primary">₹{simResult.claim.payoutAmount}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Fraud Score</span><span>{simResult.claim.fraudScore}%</span></div>
                          {simResult.claim.transactionId && (
                            <div className="mt-2 bg-card rounded p-2 font-mono text-xs text-center">
                              ✅ ₹{simResult.claim.payoutAmount} transferred via UPI<br />
                              TXN: {simResult.claim.transactionId}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Weather */}
            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="font-semibold mb-3 text-sm">Live Weather — {worker.city}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Rainfall</span><span>{weather.rainfall.toFixed(0)} mm</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Temperature</span><span>{weather.temperature.toFixed(0)}°C</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">AQI</span><span className={weather.aqi > 200 ? 'text-destructive font-semibold' : ''}>{weather.aqi.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Humidity</span><span>{weather.humidity.toFixed(0)}%</span></div>
                <p className="text-xs text-muted-foreground pt-2 border-t">{weather.description}</p>
              </div>
            </div>
          </div>

          {/* Claims History */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="font-semibold mb-4">Claims History</h3>
              {workerClaims.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No claims yet. Simulate a disruption to see the automated flow.</p>
              ) : (
                <div className="space-y-3">
                  {workerClaims.map((claim, i) => {
                    const Icon = disruptionIcons[claim.disruptionType] || CloudRain;
                    return (
                      <motion.div key={claim.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{claim.disruptionType}</span>
                          </div>
                          <Badge variant={claim.status === 'Paid' ? 'default' : claim.status === 'Approved' ? 'secondary' : 'outline'} className={claim.status === 'Paid' ? 'bg-primary' : ''}>
                            {claim.status}
                          </Badge>
                        </div>
                        {/* Timeline */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <span className="bg-muted px-2 py-0.5 rounded">Detected {new Date(claim.detectedAt).toLocaleTimeString()}</span>
                          {claim.approvedAt && <>
                            <ChevronRight className="h-3 w-3" />
                            <span className="bg-muted px-2 py-0.5 rounded">Approved</span>
                          </>}
                          {claim.paidAt && <>
                            <ChevronRight className="h-3 w-3" />
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">Paid</span>
                          </>}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><span className="text-muted-foreground text-xs block">Income Loss</span><span className="font-semibold">₹{claim.incomeLoss}</span></div>
                          <div><span className="text-muted-foreground text-xs block">Payout</span><span className="font-semibold text-primary">₹{claim.payoutAmount}</span></div>
                          <div><span className="text-muted-foreground text-xs block">Fraud Score</span><span className={`font-semibold ${claim.fraudScore > 40 ? 'text-destructive' : ''}`}>{claim.fraudScore}%</span></div>
                        </div>
                        {claim.fraudFlags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {claim.fraudFlags.map((f, fi) => <span key={fi} className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">{f}</span>)}
                          </div>
                        )}
                        {claim.transactionId && (
                          <div className="mt-2 text-xs font-mono text-muted-foreground">TXN: {claim.transactionId}</div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
  );
}
