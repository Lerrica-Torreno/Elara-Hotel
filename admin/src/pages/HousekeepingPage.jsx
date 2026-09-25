import { useState } from "react";
import { Brush } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { housekeepingTasks as initialTasks } from "../data/mockData";

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState(initialTasks);

  function completeTask(id) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status: "Completed" } : task));
  }

  return (
    <>
      <PageHeader title="Housekeeping" description="Track cleaning, inspection, linen, and room-readiness tasks before rooms return to sellable inventory." />
      <Card title="Housekeeping queue" subtitle={`${tasks.filter((t) => t.status !== "Completed").length} unfinished sample tasks`}>
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex flex-col gap-4 rounded-2xl border border-forest-900/10 p-4 sm:flex-row sm:items-center">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mist"><Brush size={18} aria-hidden="true" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Room {task.room} · {task.task}</p>
                <p className="text-sm text-forest-900/55">{task.assignedTo} · Priority: {task.priority}</p>
              </div>
              <Badge tone={task.status === "Completed" ? "green" : task.priority === "High" ? "red" : "amber"}>{task.status}</Badge>
              {task.status !== "Completed" && <button type="button" onClick={() => completeTask(task.id)} className="rounded-xl border border-forest-900/15 px-3 py-2 text-sm font-semibold">Mark complete</button>}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
