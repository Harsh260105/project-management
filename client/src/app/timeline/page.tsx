"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { useGetProjectsQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";

type TaskTypeItems = "task" | "milestone" | "project";

interface GanttTask {
  start: Date;
  end: Date;
  name: string;
  id: string;
  type: TaskTypeItems;
  progress: number;
  isDisabled: boolean;
  project?: string;
  dependencies?: string[];
}

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: projects, isLoading, isError } = useGetProjectsQuery();

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo<GanttTask[]>(() => {
    // Early return if no projects
    if (!projects?.length) return [];

    const validTasks: GanttTask[] = [];

    // Create a dummy task to initialize the chart (prevents getTime undefined error)
    const now = new Date();
    validTasks.push({
      start: now,
      end: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      name: "Loading Projects...",
      id: "dummy",
      type: "task",
      progress: 0,
      isDisabled: true,
    });

    // Process each project
    for (const project of projects) {
      try {
        // Skip if missing required data
        if (!project?.startDate || !project?.endDate || !project?.name) {
          console.warn(
            `Skipping project ${project?.id}: Missing required data`,
          );
          continue;
        }

        // Create dates with proper validation
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);

        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn(`Skipping project ${project.id}: Invalid dates`);
          continue;
        }

        // Add valid project
        validTasks.push({
          start: startDate,
          end: endDate,
          name: project.name,
          id: `Project-${project.id}`,
          type: "project",
          progress: 50,
          isDisabled: false,
        });
      } catch (error) {
        console.error(`Error processing project ${project?.id}:`, error);
        continue;
      }
    }

    // Remove dummy task if we have valid projects
    if (validTasks.length > 1) {
      validTasks.shift(); // Remove the dummy task
    }

    return validTasks;
  }, [projects]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !projects)
    return <div>An error occurred while fetching projects</div>;

  return (
    <div className="max-w-full p-8">
      <header className="mb-4 flex items-center justify-between">
        <Header name="Projects Timeline" />
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
      </header>

      <div className="overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white">
        <div className="timeline">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="100px"
            projectBackgroundColor={isDarkMode ? "#101214" : "#1f2937"}
            projectProgressColor={isDarkMode ? "#1f2937" : "#aeb8c2"}
            projectProgressSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
