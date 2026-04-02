import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { calculatePremium } from '@/lib/ai-engine';
import type { City, Platform, WorkZone } from '@/lib/types';

const cities: City[] = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];
const platforms: Platform[] = ['Zomato', 'Swiggy', 'Zepto', 'Amazon', 'Dunzo'];
const zones: WorkZone[] = ['Central', 'Suburban', 'Outskirts'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerWorker } = useStore();
  const [name, setName] = useState('');
  const [city, setCity] = useState<City>('Mumbai');
  const [platform, setPlatform] = useState<Platform>('Zomato');
  const [income, setIncome] = useState('600');
  const [zone, setZone] = useState<WorkZone>('Central');
  const [result, setResult] = useState<ReturnType<typeof registerWorker> | null>(null);

  const preview = calculatePremium(city, zone, Number(income) || 600);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = registerWorker({ name: name.trim(), city, platform, avgDailyIncome: Number(income) || 600, workZone: zone });
    setResult(res);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl border shadow-elevated p-8 max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're Covered! 🎉</h2>
          <p className="text-muted-foreground mb-6">Welcome {result.worker.name}. Your policy is active.</p>
          <div className="bg-surface rounded-lg p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Weekly Premium</span><span className="font-semibold">₹{result.policy.weeklyPremium}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Risk Score</span><span className="font-semibold">{result.calc.riskScore}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Coverage</span><span className="font-semibold">60 hrs/week</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Policy Status</span><span className="font-semibold text-primary">Active</span></div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 mb-6 text-xs text-muted-foreground">
            <p className="font-medium mb-1">AI Premium Breakdown:</p>
            {Object.entries(result.calc.breakdown).map(([k, v]) => (
              <div key={k} className="flex justify-between"><span>{k}</span><span>{v}</span></div>
            ))}
          </div>
          <Button onClick={() => navigate(`/dashboard/${result.worker.id}`)} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Worker Registration</h1>
              <p className="text-muted-foreground text-sm">Get covered in under 2 minutes</p>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
              <div className="bg-card rounded-xl border shadow-card p-6 space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
                </div>
                <div>
                  <Label>City</Label>
                  <Select value={city} onValueChange={v => setCity(v as City)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={v => setPlatform(v as Platform)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="income">Average Daily Income (₹)</Label>
                  <Input id="income" type="number" min="100" max="3000" value={income} onChange={e => setIncome(e.target.value)} />
                </div>
                <div>
                  <Label>Work Zone</Label>
                  <Select value={zone} onValueChange={v => setZone(v as WorkZone)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{zones.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 h-12 text-base" disabled={!name.trim()}>
                Register & Generate Policy
              </Button>
            </form>

            {/* Live preview */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2">
              <div className="bg-card rounded-xl border shadow-card p-6 sticky top-24">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Premium Preview
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Weekly Premium</span>
                    <span className="text-2xl font-bold text-primary">₹{preview.premium}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Risk Score</span><span className="font-semibold">{preview.riskScore}%</span></div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full transition-all" style={{ width: `${preview.riskScore}%` }} />
                  </div>
                  <div className="h-px bg-border" />
                  {Object.entries(preview.breakdown).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{k}</span><span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
