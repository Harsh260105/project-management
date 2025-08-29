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
    if (!projects?.length) return [];

    const validTasks: GanttTask[] = [];
    const defaultDate = new Date();

    const tasks = projects
      .map((project) => {
        try {
          if (!project) return undefined;

          let startDate: Date;
          try {
            startDate = project.startDate
              ? new Date(project.startDate)
              : defaultDate;
            if (isNaN(startDate.getTime())) {
              console.warn(
                `Invalid start date for project ${project.id}, using default`,
              );
              startDate = defaultDate;
            }
          } catch {
            startDate = defaultDate;
          }

          let endDate: Date;
          try {
            endDate = project.endDate
              ? new Date(project.endDate)
              : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week after start
            if (isNaN(endDate.getTime())) {
              console.warn(
                `Invalid end date for project ${project.id}, using default`,
              );
              endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            }
          } catch {
            endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          }

          return {
            start: startDate,
            end: endDate,
            name: project.name || "Untitled Project",
            id: `Project-${project.id}`,
            type: "task" as TaskTypeItems, // Changed from "project" to "task"
            progress: 50,
            isDisabled: false,
          };
        } catch (error) {
          console.error(`Error processing project ${project?.id}:`, error);
          return undefined;
        }
      })
      .filter((task): task is NonNullable<typeof task> => task !== undefined);

    return tasks;

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
            barBackgroundColor={isDarkMode ? "#101214" : "#aeb8c2"}
            barProgressColor={isDarkMode ? "#1f2937" : "#aeb8c2"}
            barProgressSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
            rowHeight={50}
            fontSize="14px"
            headerHeight={50}
            rtl={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
