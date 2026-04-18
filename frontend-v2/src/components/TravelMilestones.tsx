import type { Travel, TravelStats } from "@/types/travel";

interface Milestone {
  icon: string;
  text: string;
}

export const getMilestones = (travel: Travel, stats?: TravelStats): Milestone[] => {
  if (!stats?.records) {
    return [];
  }

  const milestones: Milestone[] = [];

  if (stats.records.maxDistance?.date === travel.startTime) {
    milestones.push({ icon: '🏆', text: 'Longest travel distance' });
  }
  if (stats.records.maxDuration?.date === travel.startTime) {
    milestones.push({ icon: '⏱️', text: 'Longest travel time' });
  }
  if (stats.records.maxSpeed?.date === travel.startTime) {
    milestones.push({ icon: '🏎️', text: 'Fastest travel' });
  }

  return milestones;
};

const MilestoneIcons = ({ milestones }: { milestones: Milestone[] }) => {
  if (milestones.length === 0) return null;

  return (
    <div className="flex gap-1">
      {milestones.map((m, i) => (
        <span key={i} title={m.text} className="cursor-help text-base">
          {m.icon}
        </span>
      ))}
    </div>
  );
};

export default MilestoneIcons;
