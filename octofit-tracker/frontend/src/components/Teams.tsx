import { useApiList } from '../api/useApiList.js';
import { ResourceSection } from './ResourceSection.js';

type Team = { _id?: string; name: string; mascot?: string; members?: unknown[] };

export default function Teams() {
  const state = useApiList<Team>('/api/teams', 'teams');
  return (
    <ResourceSection
      title="Teams"
      state={state}
      loadingText="Loading teams…"
      errorText="Unable to load teams. Please try again."
      emptyText="No teams yet."
    >
      {(teams) => (
        <ul className="list-group">
          {teams.map((team, index) => (
            <li key={team._id ?? index} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <strong>{team.name}</strong>
                {team.mascot && <span className="text-secondary"> · {team.mascot}</span>}
              </span>
              <span className="badge text-bg-secondary">{team.members?.length ?? 0} members</span>
            </li>
          ))}
        </ul>
      )}
    </ResourceSection>
  );
}
