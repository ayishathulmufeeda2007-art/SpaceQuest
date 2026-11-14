import { 
  MissionDefinition, 
  ResourceMetrics, 
  MissionScoreResult, 
  ScientificDiscovery 
} from '../types';

export function calculateMissionScore(
  mission: MissionDefinition,
  metrics: ResourceMetrics,
  scienceYieldScore: number,
  discoveries: ScientificDiscovery[],
  eventsResolvedCount: number,
  missionSurvived: boolean,
  dataDownlinkedRatio: number
): MissionScoreResult {
  const evaluations: string[] = [];
  const achievements: string[] = [];

  // 1. Science Achievement (Max 35 pts)
  const sciencePts = Math.round((scienceYieldScore / 100) * 35);
  if (scienceYieldScore >= 90) {
    evaluations.push(`Outstanding scientific payload configuration! Returned ${discoveries.length} peer-reviewed quality discoveries.`);
    achievements.push('Scientific Excellence Award: All primary mission objectives met or exceeded');
  } else if (scienceYieldScore >= 60) {
    evaluations.push(`Solid scientific yield (${scienceYieldScore}%). Some secondary questions remain unanswered.`);
  } else {
    evaluations.push(`Sub-optimal scientific return (${scienceYieldScore}%). Crucial instruments were missing or mismatched.`);
  }

  // 2. Spacecraft Survival & Reliability (Max 20 pts)
  let survivalPts = 0;
  if (missionSurvived) {
    survivalPts = Math.round((metrics.systemReliabilityPct / 100) * 20);
    if (metrics.systemReliabilityPct >= 90) {
      achievements.push('High Reliability Spacecraft: Redundant systems kept the probe pristine');
    }
  } else {
    survivalPts = 0;
    evaluations.push('Mission Terminal Anomaly: The spacecraft was incapacitated or lost prior to mission completion.');
  }

  // 3. Engineering Design & Margins (Max 15 pts)
  let engineeringPts = 0;
  let designQuality = 0;

  // Mass Margin check
  if (metrics.massMarginPct >= 10) {
    designQuality += 5;
  } else if (metrics.massMarginPct >= 0) {
    designQuality += 3;
    evaluations.push(`Tight launch vehicle mass margin (${metrics.massMarginPct}%). Prudent systems engineering recommends >10%.`);
  } else {
    evaluations.push(`Overweight payload! Mass margin was negative (${metrics.massMarginPct}%). Rocket was over capacity.`);
  }

  // Power Margin check
  if (metrics.powerMarginPct >= 15 && metrics.eclipseReserveHours >= 1.5) {
    designQuality += 5;
  } else if (metrics.powerMarginPct >= 0) {
    designQuality += 3;
    evaluations.push(`Low power margin (${metrics.powerMarginPct}%). Battery drain during planetary eclipse was critical.`);
  } else {
    evaluations.push(`Power deficit! The spacecraft generated less power than consumed.`);
  }

  // Delta-V check
  if (metrics.deltaVAvailableMs >= 500) {
    designQuality += 5;
  } else {
    designQuality += 2;
  }

  engineeringPts = Math.min(15, designQuality);
  if (engineeringPts >= 13) {
    achievements.push('NASA MDL Master Class: Balanced mass, power, and propulsion margins');
  }

  // 4. Communication & Ground Downlink (Max 15 pts)
  const commPts = Math.round(dataDownlinkedRatio * 15);
  if (dataDownlinkedRatio >= 0.95) {
    evaluations.push('Ground segment downlink was flawless. 100% telemetry and scientific data reached Earth.');
    achievements.push('Deep Space Network Telemetry Whiz: Zero lost scientific packets');
  } else if (dataDownlinkedRatio >= 0.6) {
    evaluations.push(`Partial data downlink (${Math.round(dataDownlinkedRatio * 100)}%). Bandwidth or ground station contact windows were constricted.`);
  } else {
    evaluations.push(`Severe telemetry loss! High volumes of raw sensor data remained un-downlinked in flash memory.`);
  }

  // 5. Budget Management & Cost Reserves (Max 15 pts)
  let budgetPts = 0;
  if (metrics.budgetReservePct >= 15) {
    budgetPts = 15;
    evaluations.push(`Frugal and responsible fiscal management. Mission completed with ${metrics.budgetReservePct}% budget reserve.`);
    achievements.push('Fiscal Prudence: Completed mission well under budget cap');
  } else if (metrics.budgetReservePct >= 0) {
    budgetPts = 10 + Math.round((metrics.budgetReservePct / 15) * 5);
    evaluations.push(`Mission remained within budget cap (${metrics.budgetReservePct}% remaining).`);
  } else {
    budgetPts = Math.max(0, 8 + Math.round(metrics.budgetReservePct / 5));
    evaluations.push(`Cost Overrun Alert! Total mission expenditure exceeded initial congressional appropriation.`);
  }

  // Events Resolved Bonus
  if (eventsResolvedCount > 0) {
    achievements.push(`Crisis Navigator: Successfully tackled ${eventsResolvedCount} unforeseen deep space anomalies`);
  }

  // Total Score
  const totalScore = Math.min(100, Math.max(0, sciencePts + survivalPts + engineeringPts + commPts + budgetPts));

  // Determine Title and Rating
  let ratingTitle: MissionScoreResult['ratingTitle'] = 'MISSION FAILURE';
  let ratingColor = '#ef4444';

  if (!missionSurvived || totalScore < 30) {
    ratingTitle = 'MISSION FAILURE';
    ratingColor = '#ef4444';
  } else if (totalScore >= 90) {
    ratingTitle = 'LEGENDARY COMMANDER';
    ratingColor = '#f59e0b'; // Gold
  } else if (totalScore >= 75) {
    ratingTitle = 'EXPERT EXPLORER';
    ratingColor = '#10b981'; // Emerald
  } else if (totalScore >= 50) {
    ratingTitle = 'SKILLED ENGINEER';
    ratingColor = '#06b6d4'; // Cyan
  } else {
    ratingTitle = 'ROOKIE EXPLORER';
    ratingColor = '#a855f7'; // Purple
  }

  return {
    totalScore,
    ratingTitle,
    ratingColor,
    breakdown: {
      scienceAchievement: sciencePts,
      spacecraftSurvival: survivalPts,
      engineeringDesign: engineeringPts,
      communicationSuccess: commPts,
      budgetManagement: budgetPts
    },
    evaluationSummary: evaluations,
    achievements,
    discoveredItems: discoveries
  };
}
