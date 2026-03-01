"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Search, Calendar } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";

interface Task {
  id: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  weight: number;
  status: string;
  assignedTo: string | null;
}

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface ResourcesClientProps {
  users: User[];
  tasks: Task[];
}

export default function ResourcesClient({
  users,
  tasks,
}: ResourcesClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate week range
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter users
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate Workload
  const workloadData = useMemo(() => {
    return filteredUsers.map((user) => {
      // Get user's tasks
      const userTasks = tasks.filter(
        (t) => t.assignedTo === user.id && t.status !== "completed" && t.status !== "cancelled"
      );

      const dailyLoad = weekDays.map((day) => {
        // Find tasks active on this day
        const activeTasks = userTasks.filter((task) => {
          if (!task.startDate || !task.endDate) return false;
          const start = parseISO(task.startDate);
          const end = parseISO(task.endDate);
          return isWithinInterval(day, { start, end });
        });

        // Calculate load score
        // Assumption: Weight is total effort. Daily effort = Weight / Duration (days)
        const load = activeTasks.reduce((acc, task) => {
           // If weight is 0 or missing, assume 1
           const weight = task.weight || 1; 
           const start = parseISO(task.startDate!);
           const end = parseISO(task.endDate!);
           const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
           
           return acc + (weight / duration);
        }, 0);

        return {
          date: day,
          load: Number(load.toFixed(1)),
          tasks: activeTasks,
        };
      });

      const totalLoad = dailyLoad.reduce((acc, d) => acc + d.load, 0);

      return {
        user,
        dailyLoad,
        totalLoad,
      };
    });
  }, [filteredUsers, tasks, weekDays]);

  const getLoadColor = (load: number) => {
    if (load === 0) return "bg-slate-50 text-slate-400";
    if (load < 1) return "bg-blue-50 text-blue-600"; // Light load
    if (load < 3) return "bg-green-100 text-green-700"; // Healthy load
    if (load < 5) return "bg-yellow-100 text-yellow-700"; // Heavy load
    return "bg-red-100 text-red-700"; // Overload
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 bg-card border p-1 rounded-md shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-2 min-w-[200px] justify-center text-sm font-medium">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {format(weekStart, "d MMM")} - {format(weekEnd, "d MMM yyyy")}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground w-[250px]">
                    Team Member
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.toISOString()}
                      className={`text-center py-4 px-2 font-medium ${
                        isSameDay(day, new Date())
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs uppercase">
                          {format(day, "EEE")}
                        </span>
                        <span
                          className={`w-8 h-8 flex items-center justify-center rounded-full ${
                            isSameDay(day, new Date())
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground w-[100px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {workloadData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      No team members found.
                    </td>
                  </tr>
                ) : (
                  workloadData.map(({ user, dailyLoad, totalLoad }) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                             <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {user.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {dailyLoad.map((day, idx) => (
                        <td key={idx} className="py-4 px-2 text-center">
                          <div className="flex flex-col items-center gap-1 group relative">
                            <span
                              className={`w-full max-w-[60px] py-1.5 rounded-md font-medium text-xs cursor-default transition-all ${getLoadColor(
                                day.load
                              )}`}
                            >
                              {day.load > 0 ? day.load : "-"}
                            </span>
                            
                            {/* Tooltip for Tasks */}
                            {day.tasks.length > 0 && (
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-popover border text-popover-foreground text-xs rounded-md shadow-md p-2 hidden group-hover:block z-50">
                                <div className="font-semibold mb-1 border-b pb-1">Tasks</div>
                                <ul className="space-y-1">
                                  {day.tasks.map(t => (
                                    <li key={t.id} className="truncate text-left">
                                      • {t.title}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="py-4 px-4 text-center">
                        <Badge variant={totalLoad > 20 ? "destructive" : "secondary"}>
                          {totalLoad.toFixed(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></div>
            <span>Light</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
            <span>Healthy</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
            <span>Heavy</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
            <span>Overload</span>
        </div>
      </div>
    </div>
  );
}
