import { useState, useCallback } from 'react';
import type { Worker, Policy, Claim, City, WorkZone, DisruptionType, Platform } from './types';
import { calculatePremium, calculateIncomeLoss, detectFraud, forceDisruption, generateTransactionId } from './ai-engine';

// Generate unique IDs
const uid = () => Math.random().toString(36).substring(2, 10);

function getStoredData<T>(key: string, fallback: T): T {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}

function setStoredData(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed sample workers
const SEED_WORKERS: Worker[] = [
  { id: 'w1', name: 'Rahul Sharma', city: 'Mumbai', platform: 'Zomato', avgDailyIncome: 650, workZone: 'Central', registeredAt: new Date(Date.now() - 14 * 86400000).toISOString(), gpsLocations: [{ lat: 19.076, lng: 72.877, timestamp: new Date().toISOString() }] },
  { id: 'w2', name: 'Priya Patel', city: 'Delhi', platform: 'Swiggy', avgDailyIncome: 580, workZone: 'Suburban', registeredAt: new Date(Date.now() - 7 * 86400000).toISOString(), gpsLocations: [{ lat: 28.613, lng: 77.209, timestamp: new Date().toISOString() }] },
  { id: 'w3', name: 'Amit Kumar', city: 'Bangalore', platform: 'Zepto', avgDailyIncome: 720, workZone: 'Central', registeredAt: new Date(Date.now() - 21 * 86400000).toISOString(), gpsLocations: [{ lat: 12.971, lng: 77.594, timestamp: new Date().toISOString() }] },
  { id: 'w4', name: 'Sneha Reddy', city: 'Hyderabad', platform: 'Dunzo', avgDailyIncome: 500, workZone: 'Outskirts', registeredAt: new Date(Date.now() - 5 * 86400000).toISOString(), gpsLocations: [{ lat: 17.385, lng: 78.486, timestamp: new Date().toISOString() }] },
];

const now = new Date();
const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);

const SEED_POLICIES: Policy[] = SEED_WORKERS.map(w => {
  const calc = calculatePremium(w.city, w.workZone, w.avgDailyIncome);
  return { id: `p-${w.id}`, workerId: w.id, weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString(), weeklyPremium: calc.premium, coverageHours: 60, riskScore: calc.riskScore, status: 'Active' as const, createdAt: w.registeredAt };
});

const SEED_CLAIMS: Claim[] = [
  { id: 'c1', workerId: 'w1', policyId: 'p-w1', disruptionType: 'Heavy Rain', detectedAt: new Date(Date.now() - 2 * 86400000).toISOString(), approvedAt: new Date(Date.now() - 2 * 86400000 + 60000).toISOString(), paidAt: new Date(Date.now() - 2 * 86400000 + 180000).toISOString(), status: 'Paid', incomeLoss: 910, payoutAmount: 819, fraudScore: 5, fraudFlags: [], transactionId: 'UPI8K2MN4XQ' },
  { id: 'c2', workerId: 'w2', policyId: 'p-w2', disruptionType: 'Pollution Spike', detectedAt: new Date(Date.now() - 86400000).toISOString(), approvedAt: new Date(Date.now() - 86400000 + 45000).toISOString(), paidAt: null, status: 'Approved', incomeLoss: 580, payoutAmount: 522, fraudScore: 12, fraudFlags: [], transactionId: null },
];

export function useStore() {
  const [workers, setWorkers] = useState<Worker[]>(() => getStoredData('gs_workers', SEED_WORKERS));
  const [policies, setPolicies] = useState<Policy[]>(() => getStoredData('gs_policies', SEED_POLICIES));
  const [claims, setClaims] = useState<Claim[]>(() => getStoredData('gs_claims', SEED_CLAIMS));

  const save = useCallback((w: Worker[], p: Policy[], c: Claim[]) => {
    setStoredData('gs_workers', w);
    setStoredData('gs_policies', p);
    setStoredData('gs_claims', c);
  }, []);

  const registerWorker = useCallback((data: { name: string; city: City; platform: Platform; avgDailyIncome: number; workZone: WorkZone }) => {
    const worker: Worker = {
      id: uid(),
      ...data,
      registeredAt: new Date().toISOString(),
      gpsLocations: [{ lat: 19 + Math.random() * 10, lng: 72 + Math.random() * 8, timestamp: new Date().toISOString() }],
    };
    const calc = calculatePremium(data.city, data.workZone, data.avgDailyIncome);
    const policy: Policy = {
      id: uid(),
      workerId: worker.id,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      weeklyPremium: calc.premium,
      coverageHours: 60,
      riskScore: calc.riskScore,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    const nw = [...workers, worker];
    const np = [...policies, policy];
    setWorkers(nw);
    setPolicies(np);
    save(nw, np, claims);
    return { worker, policy, calc };
  }, [workers, policies, claims, save]);

  const simulateDisruption = useCallback((workerId: string, disruptionType: DisruptionType) => {
    const worker = workers.find(w => w.id === workerId);
    const policy = policies.find(p => p.workerId === workerId && p.status === 'Active');
    if (!worker || !policy) return null;

    const disruption = forceDisruption(disruptionType);
    const incomeLoss = calculateIncomeLoss(worker.avgDailyIncome, disruption.severity);
    const payoutAmount = Math.round(incomeLoss * 0.9);
    const workerClaims = claims.filter(c => c.workerId === workerId);
    const fraud = detectFraud({ incomeLoss }, workerClaims, worker.gpsLocations);

    const now = new Date();
    const claim: Claim = {
      id: uid(),
      workerId,
      policyId: policy.id,
      disruptionType,
      detectedAt: now.toISOString(),
      approvedAt: fraud.score < 60 ? new Date(now.getTime() + 30000).toISOString() : null,
      paidAt: fraud.score < 60 ? new Date(now.getTime() + 90000).toISOString() : null,
      status: fraud.score < 60 ? 'Paid' : 'Detected',
      incomeLoss,
      payoutAmount: fraud.score < 60 ? payoutAmount : 0,
      fraudScore: fraud.score,
      fraudFlags: fraud.flags,
      transactionId: fraud.score < 60 ? generateTransactionId() : null,
    };

    const nc = [...claims, claim];
    setClaims(nc);
    save(workers, policies, nc);
    return { claim, disruption, fraud };
  }, [workers, policies, claims, save]);

  return { workers, policies, claims, registerWorker, simulateDisruption };
}
