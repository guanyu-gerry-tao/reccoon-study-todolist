import { useState, useRef } from 'react';
import { useImmer } from 'use-immer';
import './App.css';

import Todolist from './components/Todolist.tsx';
import ResetTestButton from './components/ResetTestButton.tsx';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DragDropContextProps } from '@hello-pangea/dnd';
import type { TaskItem, Actions, Projects, ProjectItem } from './components/type.ts';
import { loadInitData, loadProjects, loadTestUserData } from './data/loadInitData.ts'
import { source } from 'motion/react-client';
import { sortChain } from './components/utils.ts';

/**
 * Main application component.
 * This component initializes the application state and handles task and project management.
 * It provides functions to add, update, delete tasks and projects, and manages the drag-and-drop functionality.
 */
function App() {

  // DEBUG: Load initial data for tasks, projects, and user status
  const testInitData = loadInitData();
  const testProjectsData = loadProjects();
  const testUserData = loadTestUserData();
  const testData = {testInitData, testProjectsData, testUserData};

  // State management using useImmer for tasks, projects, user status, and dragged task
  const [tasks, setTasks] = useImmer<Record<string, TaskItem>>(testData.testInitData); // Initial tasks data loaded from testInitData
  const [projects, setProjects] = useImmer<Record<string, ProjectItem>>(testData.testProjectsData); // Initial projects data loaded from testProjectsData
  const [userStatus, setUserStatus] = useImmer(testData.testUserData); // Initial user status data loaded from testUserData. It is not finished yet.
  const [draggedTask, setDraggedTask] = useImmer<[string] | null>(null); // State to track the currently dragged task, if any
  const [currentProjectID, setCurrentProjectID] = useImmer<string | null>(userStatus.project); // State to manage the current project ID, which is used to filter tasks by project.
  
  /**
   * Function to add a new task to the task list.
   * It generates a unique ID for the new task, adds it to the tasks state,
   * and reindexs the tasks based on their status and project after the addition.
   * @param newTask - The new task item to be added - without an ID - ID will be generated automatically.
   */
  const addTask = (newTask: TaskItem) => {
    const id = crypto.randomUUID();
    setTasks(draft => {
      draft[id] = {...newTask,};
      console.log(`Task added with id: ${id}`);
    });
    return id; // Return the ID of the newly added task
  };

  /**
   * Function to update an existing task in the task list.
   * It finds the task by its ID, updates the specified fields,
   * and reindexs the tasks based on their status and project after the update.
   * @param id - The ID of the task to be updated.
   * @param updatedFields - The fields to be updated in the task.
   */
  const updateTask = (id: string, updatedFields: Partial<TaskItem>) => {
    setTasks(draft => {
      const task = draft[id];
      if (task) {
        Object.assign(task, updatedFields);
      } else {
        console.warn(`Task with id ${id} not found.`);
      }
    });
  };

  /**
   * Function to soft delete a task by marking it as deleted.
   * It finds the task by its ID, marks its status as "-1" (deleted), 
   * the previousStatus is saved in the task,
   * and the task can be restored later if needed.
   * It will then reindexs the tasks in the previous status after deletion.
   * @param id - The ID of the task to be deleted.
   */
  const deleteTask = (id: string) => {
    setTasks(draft => {
      const task = draft[id];
      task.previousStatus = task.status; // Save the previous status before deletion
      task.status = -1; // Mark the task as deleted
      //FIXME: think about how to reindex the tasks in the previous status after deletion
    })
  };

  /**
   * Function to hard delete a task by removing it from the task list.
   * This function will permanently remove the task.
   * Used for the trash bin feature. Soft delete -> trash bin -> want to perminate delete? -> hard delete.
   * It finds the task by its ID and removes it from the tasks state.
   * @param id - The ID of the task to be hard deleted.
   */
  const hardDeleteTask = (id: string) => {
    setTasks(draft => {
      delete draft[id]; // Remove the task from the tasks state
      console.log(`Task with id ${id} has been hard deleted.`);
    })
  };

  /**
   * Currently, it is a placeholder and does not perform any action.
   * Function to refresh the tasks from the server or local storage.
   * This function can be used to fetch the latest tasks data and update the state.
   */
  const refreshTasks = () => {
    // This function can be used to refresh the tasks from the server or local storage
  };

  /**
   * Function to add a new project to the project list.
   * It generates a unique ID for the new project, adds it to the projects state,
   * and reindexs the projects based on their order.
   * @param newProject - The new project item to be added.
   * @returns The ID of the newly added project.
   */
  const addProject = (newProject: ProjectItem) => {
    const id = crypto.randomUUID();
    setProjects(draft => {
      draft[id] = { ...newProject };
      console.log(`Project added with id: ${id}`);
    });
    return id; // Return the ID of the newly added project
  };

  /**
   * Function to update an existing project in the project list.
   * It finds the project by its ID, updates the specified fields,
   * and reindexs the projects based on their order.
   * @param id - The ID of the project to be updated.
   * @param updatedFields - The fields to be updated in the project.
   */
  const updateProject = (id: string, updatedFields: Partial<ProjectItem>) => {
    setProjects(draft => {
      const project = draft[id];
      if (project) {
        Object.assign(project, updatedFields);
      } else {
        console.warn(`Project with id ${id} not found.`);
      }
    });
  };

  /**
   * Function to delete a project from the project list.
   * This function will permanently remove the project list, and permanently delete all tasks in the project.
   * It finds the project by its ID and removes it from the projects state.
   * @param projectId - The ID of the project to be deleted.
   */
  const deleteProject = (projectId: string) => {
    setProjects(draft => {
      delete draft[projectId];
    });

    // Also delete all tasks in the project
    setTasks(draft => {
      Object.entries(draft).filter(([taskId, task]) => task.project === projectId).forEach(([taskId, task]) => {
        hardDeleteTask(taskId);
      });
    });
  };

  // Define the actions that can be performed on tasks and projects.
  // These actions will be passed down to the Todolist component.
  // They include functions to add, update, delete tasks and projects, and refresh tasks.
  // It is just convenient to put all the actions in one place.
  const actions: Actions = {
    addTask,
    updateTask,
    deleteTask,
    hardDeleteTask,
    refreshTasks,
    addProject,
    updateProject,
    deleteProject,
    setCurrentProjectID,
  };

  /**
   * Function to handle the end of a drag and drop event for the DragDropContext - hello-pangea/dnd.
   * It updates the task or project chain based on the drag result.
   */
  const onDragEnd: DragDropContextProps['onDragEnd'] = (result) => {
    // handle "task" type drag and drop
    if (result.type === 'task') {
      console.log('onDragEnd', result); // Log the drag result for debugging
      if (result.destination) { // If true, the task was dropped in a valid droppable area. If false, it means the task was dropped outside of a droppable area.
        setTasks(draft => {
          const task = draft[result.draggableId]; // Find the task being dragged by its ID
          if (task) { // If the task was found and task was moved
            const originStatus = task.status;
            const resultStatus = Number(result.destination!.droppableId); // the status === droppableId, as defined in the TodoColumn component

            // handle original and result task's previous and next tasks:

            // handle original task's previous and next tasks
            const originPrevTask = task.prev;
            const originNextTask = task.next;
            if (originPrevTask) { // If the original task is not the first task, update its previous task to the original's next task (skip the original task)
              draft[originPrevTask].next = originNextTask;
            } 
            if (originNextTask) { // If the original task is not the last task, update its next task to the original's previous task (skip the original task)
              draft[originNextTask].prev = originPrevTask;
            }

            // handle result task's previous and next tasks and the dragged task
            const resultTasks = Object.fromEntries(Object.entries(draft)
            .filter(([id, t]) => t.status === resultStatus &&
             t.project === task.project &&
            id !== result.draggableId)); // Get all tasks in the result status
            const sortedTasks = sortChain(resultTasks); 

            const resultPrevTask = sortedTasks[result.destination!.index - 1]?.[0] ?? null; // Get the previous task in the result status
            const resultNextTask = sortedTasks[result.destination!.index]?.[0] ?? null; // Get the next task in the result status

            if (resultPrevTask) { // If the result task is not the first task, handle A task and result task, [A(null), B(A)] -> [A(null), Result(A), B(Result)], B is handled in the next step
              draft[resultPrevTask].next = result.draggableId; // Update the previous task's next task to the dragged task
            }
            if (resultNextTask) { // If the result task is not the last task, handle B task and result task, [A(B), B(null)] -> [A(Result), Result(null), B(Result)], A is handled in the previous step
              draft[resultNextTask].prev = result.draggableId; // Update the next task's previous task to the dragged task
            }
            
            task.prev = resultPrevTask;
            task.next = resultNextTask;
            
            if (originStatus !== resultStatus) { // If the task's status has changed (i.e., it was moved to a different column)
              task.previousStatus = originStatus; // Save the previous status of the task before updating it
              task.status = resultStatus; // Update the task's status to the result status
            } // else do nothing
          }
        });
      } else {
        // If the task was dropped outside of a droppable area
        // This is a placeholder for handling tasks dropped outside of valid areas
        // Do nothing for now
      }
      setDraggedTask(null); // Clear the dragged task state after the drag and drop operation is complete
      console.log('onDragEnd completed');
    }


    // handle "project" type drag and drop
    if (result.type === 'project') {
      console.log('onDragEnd for project', result); // Log the drag result for debugging
      if (result.destination) { // Check if the destination is valid. If true, the project was dropped in a valid droppable area. If false, it means the project was dropped outside of a droppable area.
        setProjects(draft => {
          const project = draft[result.draggableId]; // Find the project being dragged by its ID
          if (project) { // If the project was found and project was moved
            const originPrevProject = project.prev;
            const originNextProject = project.next;
            if (originPrevProject) { // If the original task is not the first task, update its previous task to the original's next task (skip the original task)
              draft[originPrevProject].next = originNextProject;
            } 
            if (originNextProject) { // If the original task is not the last task, update its next task to the original's previous task (skip the original task)
              draft[originNextProject].prev = originPrevProject;
            }

            // handle result task's previous and next tasks and the dragged task
            const resultProjects = Object.fromEntries(Object.entries(draft)
            .filter(([id, t]) => id !== result.draggableId)); // Get all tasks in the result status
            const sortedProjects = sortChain(resultProjects); 

            const resultPrevProject = sortedProjects[result.destination!.index - 1]?.[0] ?? null; // Get the previous project in the result status
            const resultNextProject = sortedProjects[result.destination!.index]?.[0] ?? null; // Get the next project in the result status

            if (resultPrevProject) { // If the result project is not the first project, handle A project and result project, [A(null), B(A)] -> [A(null), Result(A), B(Result)], B is handled in the next step
              draft[resultPrevProject].next = result.draggableId; // Update the previous project's next project to the dragged project
            }
            if (resultNextProject) { // If the result project is not the last project, handle B project and result project, [A(B), B(null)] -> [A(Result), Result(null), B(Result)], A is handled in the previous step
              draft[resultNextProject].prev = result.draggableId; // Update the next project's previous project to the dragged project
            }

            project.prev = resultPrevProject;
            project.next = resultNextProject;
          }
        })
      }
      console.log(projects)
    }
  };


  /**
   * Function to handle the start of a drag and drop event for the DragDropContext - hello-pangea/dnd.
   * It sets the dragged task ID if the draggable type is 'task'.
   * Currently, it does not handle project dragging. Not implemented yet.
   */
  const onDragStart: DragDropContextProps['onDragStart'] = (start) => {
    if (start.type === 'task') {
      setDraggedTask([start.draggableId]);
    }
    if (start.type === 'project') {

    }
  }

  // Store the previous droppable ID to handle drag updates.
  // Not in use. Stored here for future use.
  const prevDroppableId = useRef<string | null>(null);
  // Function to handle updates during a drag and drop event.
  // Not in use. Stored here for future use.
  const onDragUpdate: DragDropContextProps['onDragUpdate'] = (update) => {
    const current = update.destination?.droppableId || null;
    if (current !== prevDroppableId.current) {
      if (prevDroppableId.current === '-1') { // exit delete-zone
        document.querySelectorAll(`#${update.draggableId}`).forEach(el => {
          // Remove the class indicating the draggable is over the delete area
        });
      }
      if (current === '-1') { // enter delete-zone
        document.querySelectorAll(`#${update.draggableId}`).forEach(el => {
          // Add a class to indicate the draggable is over the delete area
        });
      }
      if (prevDroppableId.current !== null && current === null) { // exit all Droppable
        // places to handle when the draggable is not over any droppable area
      }
      prevDroppableId.current = current;
    }
  }
  // Stored here for future use end.

  // Note: The DragDropContext component is used to wrap the entire application to enable drag-and-drop functionality.
  // It provides the necessary context for drag-and-drop operations.
  // The onDragEnd, onDragStart, and onDragUpdate functions are passed as props to handle the drag-and-drop events.
  // The Todolist component is the main component that displays the tasks and projects.
  // It receives the tasks, projects, user status, actions, and dragged task as props.
  return (
    <DragDropContext
      onDragEnd={onDragEnd} onDragStart={onDragStart} onDragUpdate={onDragUpdate}>
      <Todolist tasks={tasks} projects={projects} userStatus={userStatus} actions={actions} draggedTask={draggedTask} currentProjectID={currentProjectID} />
      <ResetTestButton resetData={testData}/>
    </DragDropContext>
  )
}

export default App