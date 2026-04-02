export type Platform = 'Zomato' | 'Swiggy' | 'Zepto' | 'Amazon' | 'Dunzo';
export type City = 'Mumbai' | 'Delhi' | 'Bangalore' | 'Chennai' | 'Hyderabad' | 'Pune' | 'Kolkata';
export type WorkZone = 'Central' | 'Suburban' | 'Outskirts';
export type PolicyStatus = 'Active' | 'Inactive' | 'Expired';
export type ClaimStatus = 'Detected' | 'Approved' | 'Paid';
export type DisruptionType = 'Heavy Rain' | 'Extreme Heat' | 'Pollution Spike' | 'Flood' | 'Curfew';

export interface Worker {
  id: string;
  name: string;
  city: City;
  platform: Platform;
  avgDailyIncome: number;
  workZone: WorkZone;
  registeredAt: string;
  gpsLocations: Array<{ lat: number; lng: number; timestamp: string }>;
}

export interface Policy {
  id: string;
  workerId: string;
  weekStart: string;
  weekEnd: string;
  weeklyPremium: number;
  coverageHours: number;
  riskScore: number;
  status: PolicyStatus;
  createdAt: string;
}

export interface Claim {
  id: string;
  workerId: string;
  policyId: string;
  disruptionType: DisruptionType;
  detectedAt: string;
  approvedAt: string | null;
  paidAt: string | null;
  status: ClaimStatus;
  incomeLoss: number;
  payoutAmount: number;
  fraudScore: number;
  fraudFlags: string[];
  transactionId: string | null;
}

export interface WeatherData {
  city: City;
  rainfall: number; // mm
  temperature: number; // celsius
  aqi: number; // air quality index
  humidity: number;
  description: string;
}

export interface CityRiskProfile {
  city: City;
  baseRisk: number;
  rainProbability: number;
  heatProbability: number;
  pollutionProbability: number;
  historicalDisruptions: number;
}

export interface PredictionForecast {
  city: City;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  primaryThreat: DisruptionType;
  probability: number;
  expectedClaims: number;
  recommendation: string;
}
