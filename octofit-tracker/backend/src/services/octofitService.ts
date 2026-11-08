import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isObjectIdString(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const { userId, teamId, type, minutes } = (input ?? {}) as Record<string, unknown>;
  if (!isObjectIdString(userId) || !isObjectIdString(teamId)) {
    throw httpError(400, 'userId and teamId must be valid IDs');
  }
  if (typeof type !== 'string' || type.trim() === '') {
    throw httpError(400, 'type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw httpError(400, 'minutes must be a positive number');
  }
  const [userExists, teamExists] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!userExists || !teamExists) {
    throw httpError(404, 'user or team not found');
  }
  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const { name, mascot, members } = (input ?? {}) as Record<string, unknown>;
  if (typeof name !== 'string' || name.trim() === '') {
    throw httpError(400, 'name is required');
  }
  if (typeof mascot !== 'string' || mascot.trim() === '') {
    throw httpError(400, 'mascot is required');
  }
  const memberIds = members === undefined ? [] : members;
  if (!Array.isArray(memberIds) || !memberIds.every(isObjectIdString)) {
    throw httpError(400, 'members must be an array of valid user IDs');
  }
  if (memberIds.length > 0 && (await User.countDocuments({ _id: { $in: memberIds } })) !== new Set(memberIds).size) {
    throw httpError(404, 'one or more members not found');
  }
  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const rows = await Team.aggregate<{ teamName: string; totalPoints: number }>([
    { $lookup: { from: 'activities', localField: '_id', foreignField: 'team', as: 'activities' } },
    { $project: { _id: 0, teamName: '$name', totalPoints: { $sum: '$activities.points' } } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);
  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

const focusByActivityType: Record<string, string | undefined> = {
  run: 'endurance',
  cycle: 'endurance',
  swim: 'endurance',
  walk: 'endurance',
  strength: 'strength',
  weights: 'strength',
  yoga: 'mobility',
  stretch: 'mobility',
  mobility: 'mobility',
};

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) {
    throw httpError(404, 'user not found');
  }
  const latest = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus = latest ? focusByActivityType[latest.type] : undefined;
  const focus = activityFocus ?? user.fitnessGoal;
  const reason = latest && activityFocus
    ? `Your most recent ${latest.type} activity points to ${focus} work`
    : `Matches your ${focus} fitness goal`;
  const workouts = await Workout.find({ focus }).sort({ title: 1 }).lean();
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
