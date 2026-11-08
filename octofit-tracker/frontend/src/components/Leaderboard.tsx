import { useApiList } from '../api/useApiList.js';
import { ResourceSection } from './ResourceSection.js';

type LeaderboardRow = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const state = useApiList<LeaderboardRow>('/api/leaderboard', 'leaderboard');
  return (
    <ResourceSection
      title="Leaderboard"
      state={state}
      loadingText="Loading leaderboard…"
      errorText="Unable to load the leaderboard. Please try again."
      emptyText="No rankings yet."
    >
      {(rows) => (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Points</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rank}><td>{row.rank}</td><td>{row.teamName}</td><td>{row.totalPoints}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ResourceSection>
  );
}
