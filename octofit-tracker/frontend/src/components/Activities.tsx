import { useApiList } from '../api/useApiList.js';
import { ResourceSection } from './ResourceSection.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };

export default function Activities() {
  const state = useApiList<Activity>('/api/activities', 'activities');
  return (
    <ResourceSection
      title="Activities"
      state={state}
      loadingText="Loading activities…"
      errorText="Unable to load activities. Please try again."
      emptyText="No activities logged yet."
    >
      {(activities) => (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead><tr><th scope="col">Type</th><th scope="col">Minutes</th><th scope="col">Points</th></tr></thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={activity._id ?? index}><td>{activity.type}</td><td>{activity.minutes}</td><td>{activity.points}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ResourceSection>
  );
}
