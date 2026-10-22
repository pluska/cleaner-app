export interface HouseholdSummary {
  id: string;
  name: string;
  role: 'owner' | 'member';
  memberCount: number;
}
export interface HouseholdList {
  households: HouseholdSummary[];
  activeHouseholdId: string | null;
}
export interface HouseholdDetail extends HouseholdSummary {
  members: { userId: string; name: string; role: 'owner' | 'member'; joinedAt: number }[];
  invitations: { id: string; email: string; createdAt: number; expiresAt: number; revokedAt: number | null; acceptedAt: number | null }[];
}
