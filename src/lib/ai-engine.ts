import type { City, WorkZone, DisruptionType, WeatherData, CityRiskProfile, PredictionForecast, Claim } from './types';

// City risk profiles (simulated historical data)
export const cityRiskProfiles: Record<City, CityRiskProfile> = {
  Mumbai: { city: 'Mumbai', baseRisk: 72, rainProbability: 0.65, heatProbability: 0.3, pollutionProbability: 0.4, historicalDisruptions: 34 },
  Delhi: { city: 'Delhi', baseRisk: 68, rainProbability: 0.35, heatProbability: 0.55, pollutionProbability: 0.8, historicalDisruptions: 42 },
  Bangalore: { city: 'Bangalore', baseRisk: 45, rainProbability: 0.45, heatProbability: 0.2, pollutionProbability: 0.25, historicalDisruptions: 18 },
  Chennai: { city: 'Chennai', baseRisk: 62, rainProbability: 0.55, heatProbability: 0.5, pollutionProbability: 0.3, historicalDisruptions: 28 },
  Hyderabad: { city: 'Hyderabad', baseRisk: 48, rainProbability: 0.4, heatProbability: 0.45, pollutionProbability: 0.35, historicalDisruptions: 22 },
  Pune: { city: 'Pune', baseRisk: 42, rainProbability: 0.5, heatProbability: 0.25, pollutionProbability: 0.2, historicalDisruptions: 15 },
  Kolkata: { city: 'Kolkata', baseRisk: 58, rainProbability: 0.5, heatProbability: 0.4, pollutionProbability: 0.55, historicalDisruptions: 30 },
};

const zoneMultiplier: Record<WorkZone, number> = { Central: 0.8, Suburban: 1.0, Outskirts: 1.3 };

// AI Premium Calculation
export function calculatePremium(city: City, zone: WorkZone, avgDailyIncome: number): { premium: number; riskScore: number; breakdown: Record<string, number> } {
  const profile = cityRiskProfiles[city];
  const zm = zoneMultiplier[zone];
  
  const weatherRisk = (profile.rainProbability * 30 + profile.heatProbability * 20 + profile.pollutionProbability * 25) * zm;
  const incomeRisk = Math.min(avgDailyIncome / 100, 1) * 15;
  const historicalRisk = Math.min(profile.historicalDisruptions / 50, 1) * 10;
  
  const riskScore = Math.min(Math.round(weatherRisk + incomeRisk + historicalRisk), 100);
  const premium = Math.round(Math.max(10, Math.min(80, 10 + (riskScore / 100) * 70)));
  
  return {
    premium,
    riskScore,
    breakdown: {
      'Weather Risk': Math.round(weatherRisk),
      'Income Factor': Math.round(incomeRisk),
      'Historical Risk': Math.round(historicalRisk),
      'Zone Multiplier': zm,
    },
  };
}

// Simulated weather data
export function getWeatherData(city: City): WeatherData {
  const profiles: Record<City, () => WeatherData> = {
    Mumbai: () => ({ city: 'Mumbai', rainfall: 45 + Math.random() * 80, temperature: 28 + Math.random() * 8, aqi: 80 + Math.random() * 120, humidity: 75 + Math.random() * 20, description: 'Heavy monsoon showers expected' }),
    Delhi: () => ({ city: 'Delhi', rainfall: 5 + Math.random() * 30, temperature: 35 + Math.random() * 12, aqi: 200 + Math.random() * 200, humidity: 40 + Math.random() * 30, description: 'Severe pollution advisory' }),
    Bangalore: () => ({ city: 'Bangalore', rainfall: 10 + Math.random() * 40, temperature: 24 + Math.random() * 8, aqi: 50 + Math.random() * 80, humidity: 60 + Math.random() * 20, description: 'Moderate weather conditions' }),
    Chennai: () => ({ city: 'Chennai', rainfall: 20 + Math.random() * 60, temperature: 32 + Math.random() * 8, aqi: 70 + Math.random() * 80, humidity: 70 + Math.random() * 25, description: 'Cyclone warning in coastal areas' }),
    Hyderabad: () => ({ city: 'Hyderabad', rainfall: 8 + Math.random() * 35, temperature: 30 + Math.random() * 10, aqi: 90 + Math.random() * 100, humidity: 55 + Math.random() * 25, description: 'Warm conditions with sporadic rain' }),
    Pune: () => ({ city: 'Pune', rainfall: 15 + Math.random() * 45, temperature: 26 + Math.random() * 7, aqi: 45 + Math.random() * 60, humidity: 65 + Math.random() * 20, description: 'Pleasant with occasional showers' }),
    Kolkata: () => ({ city: 'Kolkata', rainfall: 25 + Math.random() * 55, temperature: 30 + Math.random() * 8, aqi: 120 + Math.random() * 130, humidity: 70 + Math.random() * 25, description: 'Heavy humidity and smog' }),
  };
  return profiles[city]();
}

// Detect disruption from weather
export function detectDisruption(weather: WeatherData): { triggered: boolean; type: DisruptionType; severity: number } | null {
  if (weather.rainfall > 60) return { triggered: true, type: 'Heavy Rain', severity: Math.min(100, Math.round(weather.rainfall * 1.2)) };
  if (weather.temperature > 42) return { triggered: true, type: 'Extreme Heat', severity: Math.min(100, Math.round((weather.temperature - 35) * 10)) };
  if (weather.aqi > 300) return { triggered: true, type: 'Pollution Spike', severity: Math.min(100, Math.round(weather.aqi / 5)) };
  return null;
}

// Force a specific disruption type
export function forceDisruption(type: DisruptionType): { type: DisruptionType; severity: number } {
  const severities: Record<DisruptionType, number> = {
    'Heavy Rain': 70 + Math.round(Math.random() * 25),
    'Extreme Heat': 65 + Math.round(Math.random() * 30),
    'Pollution Spike': 60 + Math.round(Math.random() * 35),
    'Flood': 85 + Math.round(Math.random() * 15),
    'Curfew': 90 + Math.round(Math.random() * 10),
  };
  return { type, severity: severities[type] };
}

// Calculate income loss
export function calculateIncomeLoss(avgDailyIncome: number, severity: number): number {
  const daysLost = severity > 80 ? 3 : severity > 50 ? 2 : 1;
  const lossPercent = Math.min(severity / 100, 0.9);
  return Math.round(avgDailyIncome * daysLost * lossPercent);
}

// Fraud detection
export function detectFraud(claim: Partial<Claim>, workerClaims: Claim[], gpsLocations: Array<{ lat: number; lng: number; timestamp: string }>): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  // Duplicate claims check
  const recentClaims = workerClaims.filter(c => {
    const diff = Math.abs(new Date(c.detectedAt).getTime() - Date.now());
    return diff < 24 * 60 * 60 * 1000;
  });
  if (recentClaims.length > 1) { flags.push('Multiple claims in 24h'); score += 35; }

  // GPS spoofing check
  if (gpsLocations.length >= 2) {
    const last = gpsLocations.slice(-3);
    const allSame = last.every(l => Math.abs(l.lat - last[0].lat) < 0.001 && Math.abs(l.lng - last[0].lng) < 0.001);
    if (allSame) { flags.push('GPS spoofing detected — static location'); score += 40; }
  }

  // Impossible activity pattern
  if (claim.incomeLoss && claim.incomeLoss > 2000) {
    flags.push('Unusually high income loss claim'); score += 20;
  }

  // Frequency pattern
  if (workerClaims.length > 5) {
    flags.push('High claim frequency — pattern anomaly'); score += 15;
  }

  return { score: Math.min(score, 100), flags };
}

// Predictive analytics
export function generateForecasts(): PredictionForecast[] {
  const cities: City[] = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];
  return cities.map(city => {
    const profile = cityRiskProfiles[city];
    const threats: DisruptionType[] = ['Heavy Rain', 'Extreme Heat', 'Pollution Spike'];
    const probs = [profile.rainProbability, profile.heatProbability, profile.pollutionProbability];
    const maxIdx = probs.indexOf(Math.max(...probs));
    const probability = Math.round(probs[maxIdx] * 100);
    const riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' = probability > 70 ? 'Critical' : probability > 50 ? 'High' : probability > 30 ? 'Medium' : 'Low';
    const recommendations: Record<string, string> = {
      'Critical': `Increase reserves for ${city}. Expect surge in claims.`,
      'High': `Monitor ${city} closely. Pre-approve fast payouts.`,
      'Medium': `Standard monitoring for ${city}. No action needed.`,
      'Low': `${city} outlook stable. Consider promotional pricing.`,
    };
    return {
      city,
      riskLevel,
      primaryThreat: threats[maxIdx],
      probability,
      expectedClaims: Math.round(profile.historicalDisruptions * probs[maxIdx] * (0.8 + Math.random() * 0.4)),
      recommendation: recommendations[riskLevel],
    };
  }).sort((a, b) => b.probability - a.probability);
}

export function generateTransactionId(): string {
  return `UPI${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}
