import { useState, useRef } from 'react';
import { useImmer } from 'use-immer';
import './App.css';

import Todolist from './components/Todolist.tsx';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DragDropContextProps } from '@hello-pangea/dnd';
import type { TaskItem, NewTaskItem, Actions, Projects, ProjectItem, NewProjectItem } from './components/type.ts';
import { loadInitData, loadProjects, loadTestUserData } from './data/loadInitData.ts'

/**
 * Main application component.
 * This component initializes the application state and handles task and project management.
 * It provides functions to add, update, delete tasks and projects, and manages the drag-and-drop functionality.
 */
function App() {

  // Load initial data for tasks, projects, and user status
  const testInitData = loadInitData();
  const testProjectsData = loadProjects();
  const testUserData = loadTestUserData();

  // State management using useImmer for tasks, projects, user status, and dragged task
  const [tasks, setTasks] = useImmer<TaskItem[]>(testInitData); // Initial tasks data loaded from testInitData
  const [projects, setProjects] = useImmer<ProjectItem[]>(testProjectsData); // Initial projects data loaded from testProjectsData
  const [userStatus, setUserStatus] = useImmer(testUserData); // Initial user status data loaded from testUserData. It is not finished yet.
  const [draggedTask, setDraggedTask] = useImmer<[string] | null>(null); // State to track the currently dragged task, if any

  /**
   * Function to add a new task to the task list.
   * It generates a unique ID for the new task, adds it to the tasks state,
   * and reindexs the tasks based on their status and project after the addition.
   * @param newTask - The new task item to be added - without an ID - ID will be generated automatically.
   */
  const addTask = (newTask: NewTaskItem) => {
    setTasks(draft => {
      const id = crypto.randomUUID();
      draft.push({ ...newTask, id });
      console.log(`Task added with id: ${id}`);

      const filtered = draft.filter(t => t.status === newTask.status && t.project === newTask.project).sort((a, b) => a.order - b.order);
      filtered.forEach((task, index) => {
        task.order = index;
      })
    });
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
      const task = draft.find(task => task.id === id);
      if (task) {
        Object.assign(task, updatedFields);
      } else {
        console.warn(`Task with id ${id} not found.`);
      }
      const filtered = draft.filter(t => t.status === task?.status && t.project === task.project).sort((a, b) => a.order - b.order);
      filtered.forEach((task, index) => {
        task.order = index;
      })
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
      const index = draft.findIndex(task => task.id === id);
      const deletedTask = draft[index];
      if (index !== -1) {
        draft[index].status = -1; // Mark as deleted
      }
      // reorder tasks in the previous status, the deleted task was in
      const filtered = draft.filter(t => t.status === deletedTask.previousStatus).sort((a, b) => a.order - b.order);
      filtered.forEach((task, index) => {
        task.order = index;
      })
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
      const index = draft.findIndex(task => task.id === id);
      if (index !== -1) {
        draft.splice(index, 1);
      }
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
   */
  const addProject = (newProject: NewProjectItem) => {
    setProjects(draft => {
      const id = crypto.randomUUID();
      draft.push({ ...newProject, id });
      console.log(`Task added with id: ${id}`);

      draft.forEach((project, index) => {
        project.order = index;
      })
    });
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
      const project = draft.find(project => project.id === id);
      if (project) {
        Object.assign(project, updatedFields);
      } else {
        console.warn(`Task with id ${id} not found.`);
      }
      draft.forEach((project, index) => {
        project.order = index;
      })
    });
  };

  /**
   * Function to delete a project from the project list.
   * This function will permanently remove the project list, and permanently delete all tasks in the project.
   * It finds the project by its ID and removes it from the projects state.
   * @param id - The ID of the project to be deleted.
   */
  const deleteProject = (id: string) => {
    setProjects(draft => {
      const index = draft.findIndex(project => project.id === id);
      draft.splice(index, 1)
      draft.forEach((project, index) => {
        project.order = index;
      })
    });

    // Also delete all tasks in the project
    setTasks(draft => {
      draft.forEach(task => {
        if (task.project === id) {
          hardDeleteTask(task.id);
        }
      })
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
  };

  /**
   * Function to handle the end of a drag and drop event for the DragDropContext - hello-pangea/dnd.
   * It updates the task or project order based on the drag result.
   */
  const onDragEnd: DragDropContextProps['onDragEnd'] = (result) => {
    // handle "task" type drag and drop
    if (result.type === 'task') {
      console.log('onDragEnd', result); // Log the drag result for debugging
      if (result.destination) { // If true, the task was dropped in a valid droppable area. If false, it means the task was dropped outside of a droppable area.
        setTasks(draft => {
          const task = draft.find(t => t.id === result.draggableId); // Find the task being dragged by its ID

          if (task && result.destination) {
            // Get the previous and new status and order
            const previousStatus = task.status;
            const previousOrder = task.order;
            const resultStatus = Number(result.destination.droppableId);
            const resultIndex = result.destination.index;

            // If the task is moving within the same status
            if (resultStatus === previousStatus && resultIndex !== previousOrder) {
              if (resultIndex > previousOrder) { // If moving down (3 to 5 ex.), change 4, 5 to 3, 4  for example
                draft.filter(t => t.status === resultStatus &&
                  t.order > previousOrder &&
                  t.order <= resultIndex)
                  .forEach(t => {
                    t.order -= 1
                  })
              } else { // If moving up (5 to 3 ex.), change 3, 4 to 4, 5  for example
                draft.filter(t => t.status === resultStatus &&
                  t.order >= resultIndex &&
                  t.order < previousOrder)
                  .forEach(t => {
                    t.order += 1
                  })
              }
            }

            // If the task is moving to a different status
            if (resultStatus !== previousStatus) {
              draft.filter(t => t.status === previousStatus &&
                t.order > previousOrder)
                .forEach(t => {
                  t.order -= 1; // Decrease order of tasks in the previous status
                });
              draft.filter(t => t.status === resultStatus &&
                t.order >= resultIndex)
                .forEach(t => {
                  t.order += 1; // Increase order of tasks in the new status
                });
            }

            // Update the task's order and status
            task.order = resultIndex;
            task.status = resultStatus;

            // Log the changes for debugging
            console.log('previousStatus:', previousStatus);
            console.log('resultStatus:', resultStatus);
            console.log('previousOrder:', previousOrder);
            console.log('resultIndex:', resultIndex);
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
          const project = draft.find(p => p.id === result.draggableId);
          const resultIndex = result.destination!.index;
          if (project) { // If the project was found
            if (result.destination!.index > result.source.index) { // Moving down  if project move 3=>5  change 4,5=>3,4 for example
              draft.filter((p, index) => p.order > result.source.index && p.order <= result.destination!.index)
                .forEach((p, index) => {
                  p.order -= 1; // Decrease order of projects in the range
                });
              console.log('Moving project down');
            } else if (result.destination!.index < result.source.index) { // Moving up  if project move 5=>3  change 3,4=>4,5 for example
              draft.filter((p, index) => p.order >= result.destination!.index && p.order < result.source.index)
                .forEach((p, index) => {
                  p.order += 1; // Increase order of projects in the range
                });
              console.log('Moving project up');
            } else {
              // Handle the case where the project is not moving
              // Doing nothing here for now
            }
            project!.order = resultIndex; // Update the order of the project
          }
        })
      }
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
      <Todolist tasks={tasks} projects={projects} userStatus={userStatus} actions={actions} draggedTask={draggedTask}
      />
    </DragDropContext>
  )
}

export default App