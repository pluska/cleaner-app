import { NextResponse } from "next/server";
import { TaskType } from "@/components/dashboard/TaskItem";

const ALL_MOCK_TASKS: TaskType[] = [
  { id: "p1", title: "Clean Kitchen View", room: "KITCHEN", duration: 15, completed: false },
  { id: "p2", title: "Mop living room floor", room: "LIVING ROOM", duration: 10, completed: false },
  { id: "p3", title: "Clean bathroom mirrors", room: "BATHROOM", duration: 5, completed: false },
  { id: "p4", title: "Deep clean oven", room: "KITCHEN", duration: 45, completed: false },
  { id: "s1", title: "Change bed sheets", room: "BEDROOM", duration: 15, completed: true },
  { id: "s2", title: "Load dishwasher", room: "KITCHEN", duration: 5, completed: false },
  { id: "s3", title: "Take out trash", room: "KITCHEN", duration: 5, completed: false },
  { id: "s4", title: "Scrub toilet", room: "BATHROOM", duration: 15, completed: false },
  { id: "s5", title: "Vacuum rugs", room: "LIVING ROOM", duration: 20, completed: false },
  { id: "s6", title: "Wipe counters", room: "KITCHEN", duration: 10, completed: false },
  { id: "s7", title: "Organize nightstand", room: "BEDROOM", duration: 10, completed: false },
  { id: "s8", title: "Dust blinds", room: "LIVING ROOM", duration: 15, completed: false },
  { id: "s9", title: "Clean shower head", room: "BATHROOM", duration: 20, completed: false },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  if (!dateParam) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  // Artificial delay to simulate network request
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Pseudo-random deterministic generation based on the date string
  const dateHash = dateParam.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Pick between 3 and 8 tasks for any given day
  const taskCount = (dateHash % 6) + 3;
  
  // Shuffle array using our seed
  const shuffled = [...ALL_MOCK_TASKS].sort((a, b) => {
    const hashA = a.id.charCodeAt(a.id.length - 1);
    const hashB = b.id.charCodeAt(b.id.length - 1);
    return ((hashA * dateHash) % 100) - ((hashB * dateHash) % 100);
  });

  const dailyTasks = shuffled.slice(0, taskCount);

  // Randomly mark some as complete
  const tasksWithFakeStatus = dailyTasks.map((task, index) => ({
    ...task,
    completed: ((dateHash + index) % 3) === 0
  }));

  return NextResponse.json({
    date: dateParam,
    tasks: tasksWithFakeStatus,
  });
}
