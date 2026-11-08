import { useApiList } from '../api/useApiList.js';
import { ResourceSection } from './ResourceSection.js';

type Suggestion = { _id?: string; title: string; reason: string };

// Seeded user used for the exercise; the API looks suggestions up by email.
const suggestionsPath = `/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`;

export default function Workouts() {
  const state = useApiList<Suggestion>(suggestionsPath, 'suggestions');
  return (
    <ResourceSection
      title="Workout suggestions"
      state={state}
      loadingText="Loading workout suggestions…"
      errorText="Unable to load workout suggestions. Please try again."
      emptyText="No workout suggestions yet."
    >
      {(suggestions) => (
        <ul className="list-group">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion._id ?? index} className="list-group-item">
              <h3 className="h6 mb-1">{suggestion.title}</h3>
              <p className="mb-0 text-secondary">{suggestion.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </ResourceSection>
  );
}
