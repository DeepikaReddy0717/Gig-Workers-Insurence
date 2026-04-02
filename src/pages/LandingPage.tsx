import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CloudRain, Zap, BarChart3, ChevronRight, Users, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Workers Protected', value: '12,400+', icon: Users },
  { label: 'Claims Processed', value: '3,200+', icon: Clock },
  { label: 'Avg Payout Time', value: '< 3 min', icon: Zap },
  { label: 'Loss Ratio', value: '62%', icon: TrendingUp },
];

const features = [
  { icon: CloudRain, title: 'Parametric Triggers', desc: 'Auto-detect rain, heat, pollution — no manual claims needed.' },
  { icon: Zap, title: 'Instant Payouts', desc: 'UPI payouts within minutes of disruption detection.' },
  { icon: Shield, title: 'AI Fraud Guard', desc: 'GPS spoofing & pattern anomaly detection in real-time.' },
  { icon: BarChart3, title: 'Predictive Analytics', desc: 'Next-week risk forecasts for every city and zone.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">GigShield AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/admin')}>Admin Panel</Button>
            <Button onClick={() => navigate('/register')} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              Get Covered <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-[0.03]" />
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium mb-6 shadow-card">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              Parametric Insurance for India's Gig Economy
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Income Protection,{' '}
              <span className="text-gradient-primary">Powered by AI</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              When rain stops deliveries, GigShield pays. Automated triggers, zero claims paperwork, instant UPI payouts for Zomato, Swiggy & Zepto riders.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/register')} className="bg-gradient-primary text-primary-foreground hover:opacity-90 h-12 px-8 text-base">
                Register as Worker
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/dashboard/w1')} className="h-12 px-8 text-base">
                View Demo Dashboard
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="bg-card rounded-lg border p-5 text-center shadow-card">
                <s.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How GigShield Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Fully automated parametric insurance — from trigger detection to payout.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <AnimatePresence>
              {features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} onHoverStart={() => setHoveredFeature(i)} onHoverEnd={() => setHoveredFeature(null)} className={`bg-card rounded-xl border p-6 transition-all cursor-default ${hoveredFeature === i ? 'shadow-elevated border-primary/30 scale-[1.02]' : 'shadow-card'}`}>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-gradient-hero rounded-2xl p-12 max-w-3xl mx-auto text-navy-foreground">
            <h2 className="text-3xl font-bold mb-4">Ready to protect your income?</h2>
            <p className="mb-8 opacity-80">Join thousands of delivery partners already covered by GigShield AI.</p>
            <Button size="lg" onClick={() => navigate('/register')} className="bg-gradient-primary text-primary-foreground hover:opacity-90 h-12 px-8">
              Get Started — ₹10/week
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>GigShield AI — Hackathon Prototype</span>
          </div>
          <span>Built for Guidewire Hackathon 2026</span>
        </div>
      </footer>
    </div>
  );
}
