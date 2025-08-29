import { useAppSelector } from "@/app/redux";
import { useGetTasksQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: Number(id) });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    if (!tasks) return [];

    const validTasks = tasks
      .map((task) => {
        try {
          // Ensure we have valid dates
          const startDate = task.startDate
            ? new Date(task.startDate)
            : new Date();
          const dueDate = task.dueDate
            ? new Date(task.dueDate)
            : new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

          // Validate dates
          if (
            !startDate ||
            !dueDate ||
            isNaN(startDate.getTime()) ||
            isNaN(dueDate.getTime())
          ) {
            console.warn(`Invalid dates for task ${task.id}:`, {
              startDate: task.startDate,
              dueDate: task.dueDate,
            });
            return undefined;
          }

          return {
            start: startDate,
            end: dueDate,
            name: task.title || "Untitled Task",
            id: `Task-${task.id}`,
            type: "task" as TaskTypeItems,
            progress: task.points ? (task.points / 10) * 100 : 0,
            isDisabled: false,
          };
        } catch (error) {
          console.error(`Error processing task ${task.id}:`, error);
          return undefined;
        }
      })
      .filter((task): task is NonNullable<typeof task> => task !== undefined);

    return validTasks;
  }, [tasks]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Loading tasks...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center text-red-600 dark:text-red-400">
          <div className="text-lg font-medium">Error loading tasks</div>
          <div className="mt-2 text-sm">{error.toString()}</div>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-600 dark:text-gray-300">
            No tasks found
          </div>
          <button
            className="mt-4 rounded bg-blue-primary px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Create First Task
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 xl:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 py-5">
        <h1 className="me-2 text-lg font-bold dark:text-white">
          Project Tasks Timeline
        </h1>
        <div className="relative inline-block w-64">
          <select
            className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white">
        <div className="timeline">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="100px"
            barBackgroundColor={isDarkMode ? "#101214" : "#aeb8c2"}
            barBackgroundSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
          />
        </div>
        <div className="px-4 pb-5 pt-1">
          <button
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add New Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
