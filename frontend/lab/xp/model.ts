export type LabProgress = { xp: number; maximum: number; completed: number; total: number };
export type LabReward = { stage: number; earned: number; from: number; to: number; maximum: number; finished: boolean };

const count = (value: number) => Number.isSafeInteger(value) && value >= 0 ? value : 0;
export function normalizeProgress({ xp,maximum,completed,total }: LabProgress): LabProgress {
  const cap = count(maximum) || 300;
  const stages = count(total);
  return { xp:Math.min(cap,count(xp)), maximum:cap, completed:Math.min(stages,count(completed)), total:stages };
}

export function normalizeReward(reward: LabReward): LabReward | null {
  const { stage,earned,from,to,maximum } = reward;
  if (![stage,earned,from,to,maximum].every(Number.isSafeInteger) ||
      stage < 0 || from < 0 || earned <= 0 || to <= from || to > maximum || earned > to) return null;
  return reward;
}

export const remainingRing = (xp: number, maximum: number) => 100 - xp / maximum * 100;
