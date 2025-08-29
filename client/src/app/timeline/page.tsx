"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { useGetProjectsQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: projects, isLoading, isError } = useGetProjectsQuery();

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    if (!projects) return [];

    const validProjects = projects
      .map((project) => {
        try {
          if (!project) {
            console.warn("Encountered undefined project");
            return undefined;
          }

          // Create a default date if needed (today)
          const defaultDate = new Date();

          // Ensure we have valid dates with defensive checks
          let startDate: Date;
          try {
            startDate = project.startDate
              ? new Date(project.startDate)
              : defaultDate;
            if (!startDate || isNaN(startDate.getTime())) {
              console.warn(
                `Invalid start date for project ${project.id}, using default`,
              );
              startDate = defaultDate;
            }
          } catch (e) {
            console.warn(
              `Error parsing start date for project ${project.id}, using default`,
            );
            startDate = defaultDate;
          }

          let endDate: Date;
          try {
            endDate = project.endDate
              ? new Date(project.endDate)
              : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days after start
            if (!endDate || isNaN(endDate.getTime())) {
              console.warn(
                `Invalid end date for project ${project.id}, using default`,
              );
              endDate = new Date(
                startDate.getTime() + 30 * 24 * 60 * 60 * 1000,
              );
            }
          } catch (e) {
            console.warn(
              `Error parsing end date for project ${project.id}, using default`,
            );
            endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          }

          // Final validation check
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn(
              `Invalid dates for project ${project.id} after all attempts:`,
              {
                startDate: project.startDate,
                endDate: project.endDate,
              },
            );
            return undefined;
          }

          return {
            start: startDate,
            end: endDate,
            name: project.name || "Untitled Project",
            id: `Project-${project.id}`,
            type: "project" as TaskTypeItems,
            progress: 50,
            isDisabled: false,
          };
        } catch (error) {
          console.error(`Error processing project ${project.id}:`, error);
          return undefined;
        }
      })
      .filter(
        (project): project is NonNullable<typeof project> =>
          project !== undefined,
      );

    return validProjects;
  }, [projects]);

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
            Loading projects...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center text-red-600 dark:text-red-400">
          <div className="text-lg font-medium">Error loading projects</div>
          <div className="mt-2 text-sm">{isError.toString()}</div>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-600 dark:text-gray-300">
            No projects found
          </div>
        </div>
      </div>
    );
  }

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
