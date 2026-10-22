import { householdRequest } from '@/libs/server/household-http';
import { readJson } from '@/libs/server/http';
import { listHouseholds, createHousehold } from '@/services/householdService';

export function GET(request: Request) {
  return householdRequest(request, userId => listHouseholds(userId));
}
export function POST(request: Request) {
  return householdRequest(request, async userId => createHousehold(userId,(await readJson(request)).name),201);
}
