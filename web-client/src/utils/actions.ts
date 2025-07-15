import type { UserProfileData, TaskId, TaskType, TaskData, ProjectId, ProjectType, ProjectData, StatusId, StatusType, StatusData, Actions, States, SetStates } from "./type.ts";
import { useRef, useEffect } from "react";
import { useImmer } from "use-immer";
import { sortChain } from './utils.ts';
import type { DragDropContextProps } from '@hello-pangea/dnd';

import { loadTestTasks, loadTestProjects, loadTestUserProfile, loadTestStatuses } from "../data/loadInitData";


export const createActions = (states: States, setStates: SetStates): Actions => {
  /**
   * Function to add new tasks to the task list.
   * It generates a unique ID for the new tasks, adds them to the tasks state,
   * Notice: this function only add tasks to one status bar, not multiple status bars.
   * The new tasks will be added to the top of a status bar.
   * @param newTask - The new task items to be added - without an ID - ID will be generated automatically.
   * @param nextTask - The ID of the next task in the chain, used to link the new tasks to the existing tasks. If the status bar is empty, nextTask should be null.
   */
  const addTasks = (newTask: Omit<TaskType, 'id'>[], targetStatusId: StatusId): TaskId[] => {
    // before optismistically updating, backup the current tasks state:
    const backupTasks = { ...states.tasks };

    const targetStatusTasks = Object.fromEntries(Object.entries(states.tasks).filter(([_, t]) => t.status === targetStatusId && t.projectId === newTask[0].projectId));
    const sortedTargetStatusTasks = sortChain(targetStatusTasks);

    // Generate a unique ID for the new task:
    const newTaskWithId: TaskType[] = newTask.map(task => ({
      ...task,
      id: crypto.randomUUID(), // Generate a unique ID for the new task
    }));

    // optimistic update the tasks state:
    newTaskWithId.forEach((task, index, taskArray) => {

      // generate prev and next links for the new task:
      let taskPrev: TaskId | null = null;
      let taskNext: TaskId | null = null;
      let targetStatusFirstTaskId: TaskId | null;

      if (sortedTargetStatusTasks.length > 0) {
        targetStatusFirstTaskId = sortedTargetStatusTasks[0][0];
      } else {
        targetStatusFirstTaskId = null; // If there are no tasks in the target status, set first task ID to null
      }

      if (taskArray.length > 1) {
        if (index === 0) {
          taskPrev = null;
          taskNext = taskArray[index + 1].id; // If it's the first task, set prev to null and next to the second task's ID or null if it's the only task
        } else if (index === taskArray.length - 1) {
          taskPrev = taskArray[index - 1].id;
          taskNext = targetStatusFirstTaskId; // If it's the last task, set next to nextTask from the parameter
        } else {
          taskPrev = taskArray[index - 1].id;
          taskNext = taskArray[index + 1].id;
        }
      } else {
        taskPrev = null;
        taskNext = targetStatusFirstTaskId; // If it's the only task, set prev to null and next to nextTask from the parameter
        // Note: if the status bar is empty, nextTask parameter should be null, so the next task will be null.
      }

      // Update the tasks state with the new task:
      setStates.setTasks(draft => {
        draft[task.id] = {
          id: task.id,
          title: task.title,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          description: task.description,
          status: task.status,
          previousStatus: task.previousStatus,
          projectId: task.projectId,
          prev: taskPrev,
          next: taskNext,
          userId: task.userId,
        };
        console.log(`Task added with id: ${task.id}`);
      });
    });

    // Send the new task to the server:
    (async () => {

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskWithId),
      });
      if (!res.ok) {
        throw new Error(`Failed to add task: ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Task added successfully:', data);

    })().catch(error => {
      console.error('Error adding task:', error);
      setStates.setTasks(backupTasks); // Restore the tasks state from the backup
    });

    return newTaskWithId.map(task => task.id) as TaskId[]; // Return the IDs of the newly added tasks
  };


  /**
   * Function to update existing tasks in the task list.
   * @param updatePayloads - An array of objects containing the ID of the task to be updated and the fields to be updated.
   */
  const updateTasks = (updatePayloads: { id: TaskId; updatedFields: Partial<TaskType> }[]) => {
    // before optismistically updating, backup the current tasks state:
    const backupTasks = { ...states.tasks };

    // Optimistically update the tasks state:
    setStates.setTasks(draft => {
      updatePayloads.forEach(({ id, updatedFields }) => {
        const task = draft[id];
        if (task) {
          Object.assign(task, updatedFields);
          console.log(`Task with id ${id} updated locally`)
        } else {
          console.warn(`Task with id ${id} not found.`);
        }
      });
    });

    // Send the updated task to the server:
    (async () => {
      const res = await fetch(`/api/tasks`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayloads),
      });
      if (!res.ok) {
        throw new Error(`Failed to update task: ${res.statusText}`);
      }
      const data = await res.json() as { id: TaskId; updatedFields: Partial<TaskType> }[];
      console.log('Task updated successfully:', data);
    })().catch(error => {
      console.error('Error updating task:', error);
      setStates.setTasks(backupTasks); // Restore the tasks state from the backup
      console.warn('Tasks state restored from backup due to error:', error);
    });
  };


  /**
   * Function to hard delete tasks.
   * This function will permanently remove the tasks.
   * Used for the trash bin feature. Soft delete -> trash bin -> want to perminate delete? -> hard delete.
   * It finds the tasks by their IDs and removes them from the tasks state.
   * @param ids - The IDs of the tasks to be hard deleted.
   */
  const hardDeleteTasks = async (ids: TaskId[]) => {
    const backupTasks = { ...states.tasks }; // Backup the current tasks state

    setStates.setTasks(draft => {
      ids.forEach(id => {
        delete draft[id]; // Remove the task from the tasks state
        console.log(`Task with id ${id} has been hard deleted.`);
      });
    });

    try {
      const res = await fetch(`/api/tasks`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        throw new Error(`Failed to hard delete tasks: ${res.statusText}`);
      }
    } catch (error) {
      console.error('Error hard deleting task:', error);
      setStates.setTasks(backupTasks); // Restore the tasks state from the backup
      console.warn('Tasks state restored from backup due to error:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  /**
   * Function to change the status of multiple tasks. 
   * Will only transfer the tasks to the top of the target status.
   * Should not use in the case of Drag and Drop.
   * Only use this function for handlebutton click, or other cases where the tasks are not dragged and dropped.
   * This function is capsulated of the updateTasks function.
   * @param ids - The IDs of the tasks to be updated.
   * @param targetStatusId - The target status ID to set for the tasks.
   */
  const changeStatusOfTasks = (ids: TaskId[], targetStatusId: StatusId) => {
    // AI: I need to generate a list for completed tasks, then use updateTasks to update the tasks state all together. Ignore the commented codes.
    const targetStatusTasks = Object.fromEntries(Object.entries(states.tasks).filter(([_, t]) => t.status === targetStatusId && t.projectId === states.tasks[ids[0]].projectId));
    const sortedTargetStatusTasks = sortChain(targetStatusTasks);
    const updatePayloads: { id: TaskId; updatedFields: Partial<TaskType> }[] = [];
    ids.forEach((id, index, taskArray) => {
      const task = states.tasks[id];

      if (task) {
        let taskPrev: TaskId | null = null;
        let taskNext: TaskId | null = null;
        let targetStatusFirstTaskId: TaskId | null;

        if (sortedTargetStatusTasks.length > 0) {
          targetStatusFirstTaskId = sortedTargetStatusTasks[0][0];
        } else {
          targetStatusFirstTaskId = null; // If there are no tasks in the target status, set first task ID to null
        }
        if (taskArray.length > 1) {
          if (index === 0) {
            taskPrev = null; // If it's the first task, set prev to null
            taskNext = taskArray[index + 1];
          } else if (index === ids.length - 1) {
            taskPrev = taskArray[index - 1];
            taskNext = targetStatusFirstTaskId; // If it's the last task, set next to the first task in the sorted list
          } else {
            taskPrev = taskArray[index - 1];
            taskNext = taskArray[index + 1];
          }
        } else if (taskArray.length === 1) {
          taskPrev = null;
          taskNext = targetStatusFirstTaskId;
        }

        const taskPreviousStatus = task.status;
        const taskStatus = targetStatusId;

        updatePayloads.push({
          id: task.id,
          updatedFields: {
            prev: taskPrev,
            next: taskNext,
            status: taskStatus,
            previousStatus: taskPreviousStatus
          }
        });

      } else {
        console.warn(`Task with id ${id} not found.`);
      }
    });

    updateTasks(updatePayloads);
  };


  /**
   * Function to add a new project to the project list.
   * It generates a unique ID for the new project, adds it to the projects state,
   * and reindexs the projects based on their order.
   * @param newProject - The new project item to be added.
   * @returns The ID of the newly added project.
   */
  const addProject = (newProject: Omit<ProjectType, 'id'>): ProjectId => {
    // before optismistically updating, backup the current projects state:
    const backupProjects = { ...states.projects };

    // Generate a unique ID for the new project:
    const id = crypto.randomUUID();

    // optimistically update the projects state:
    setStates.setProjects(draft => {
      draft[id] = { ...newProject, id: id };
      console.log(`Project added with id: ${id}`);
    });

    // Send the new project to the server, async:
    (async () => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newProject, id }),
      });
      if (!res.ok) {
        throw new Error(`Failed to add project: ${res.statusText}`);
      }
    })().catch(error => {
      console.error('Error adding project:', error);
      setStates.setProjects(backupProjects); // Restore the projects state from the backup
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
  const updateProject = (id: ProjectId, updatedFields: Partial<ProjectType>) => {
    // before optismistically updating, backup the current projects state:
    const backupProjects = { ...states.projects };

    // Optimistically update the projects state:
    setStates.setProjects(draft => {
      const project = draft[id];
      if (project) {
        Object.assign(project, updatedFields);
      } else {
        console.warn(`Project with id ${id} not found.`);
      }
    });

    // Send the updated project to the server:
    (async () => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updatedFields }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update project: ${res.statusText}`);
      }
    })().catch(error => {
      console.error('Error updating project:', error);
      setStates.setProjects(backupProjects); // Restore the projects state from the backup
    });
  };

  /**
   * Function to delete a project from the project list.
   * This function will permanently remove the project list, and permanently delete all tasks in the project.
   * It finds the project by its ID and removes it from the projects state.
   * @param projectId - The ID of the project to be deleted.
   */
  const deleteProject = async (projectId: string) => {
    const backupProjects = { ...states.projects }; // Backup the current projects state
    const backupTasks = { ...states.tasks }; // Backup the current tasks state

    // optimistically update the projects state:
    setStates.setProjects(draft => {
      delete draft[projectId];
    });

    // Send the delete request to the server:
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        // If the delete request failed, rollback the optimistic update
        throw new Error(`Failed to delete project ${projectId}: ${res.statusText}`);
        // Also delete all tasks in the project
      }
      const tasksToDelete = Object.entries(states.tasks).filter(([_, task]) => task.projectId === projectId).map(([id, _]) => id) as TaskId[];
      await hardDeleteTasks(tasksToDelete);
    } catch (error) {
      console.error(`Failed to delete project ${projectId}:`, error);
      setStates.setProjects(backupProjects);
      setStates.setTasks(backupTasks); // Restore the tasks state from the backup
    }
  };


  /**
   * Removes an item from a list and updates the list accordingly.
   * This function can not only handle deleting the item from the list,
   * but also can handle complete, as long as the item is removed from the list.
   * @param fromList - The list from which the item will be removed.
   * @param item - The item to be removed.
   * @param updateMethodItem - The method to update the item.
   * @param updateMethodOriginList - The method to update the original item's item.
   */


  const transferItemFromList = (fromList: any[], item: any,
    updateMethodItem: (updatePayloads: { id: TaskId; updatedFields: Partial<TaskType> }[]) => Promise<void>,
    updateMethodOriginList: any) => {
    const index = fromList.indexOf(item);

    updateMethodItem(item[0]);
    fromList.splice(index, 1); // Remove the project from the projects array
    console.log(`called transferItemFromList, deleted item: ${item[1].title}, index: ${index}, list length: ${fromList.length}`);

    // 1. [A, B, C] -> [A, C] when deleting B,, C.prev = A, A.next = C,, 
    // 2. [A, B, C] -> [A, B] when deleting C,, B.next = null,, index === 2 === projects.length - 1
    // 3. [A, B, C] -> [B, C] when deleting A,, B.prev = null,, index === 0
    // 4. [A, B] -> [B] when deleting A,, B.prev = null
    // 5. [A, B] -> [A] when deleting B,, A.next = null
    // 6. [A] -> [] when deleting A, do nothing, as there is no next or previous project

    // if the first project is deleted, and there is project left,
    // index===0 is the next one of the deleted project,
    // set the index===0 project.prev to null
    // scenario 3, 4
    if (index === 0 && fromList.length > 0) {
      updateMethodOriginList(fromList[0][0], { prev: null });
      console.log(`Deleted the first project: ${item[1].title}, set its next project to null.`);
    }

    // if the last project is deleted, and there is still project left,
    // set the index===last project.next to null
    // index===length- is the previous one of the deleted project,
    // scenario 2, 5
    if (index === fromList.length && fromList.length > 0) {
      updateMethodOriginList(fromList[index - 1][0], { next: null });
      console.log(`Deleted the last project: ${item[1].title}, set its previous project to null.`);
    }

    // if the project is in the middle of the list,
    // set the previous project's next to the next project,
    // and the next project's prev to the previous project.
    // scenario 1
    if (index > 0 && index < fromList.length) {
      updateMethodOriginList(fromList[index - 1][0], { next: fromList[index][0] });
      updateMethodOriginList(fromList[index][0], { prev: fromList[index - 1][0] });
      console.log(`Deleted the project: ${item[1].title}, set its previous project's next to the next project and the next project's prev to the previous project.`);
    }

    // if the project was the only project in the list,
    // do nothing, as there is no next or previous project.
    // scenario 6
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
        const taskId = result.draggableId; // Get the ID of the dragged task
        const task = states.tasks[taskId]; // Find the task being dragged by its ID
        if (task) {
          const originStatus = task.status;
          const resultStatus = result.destination!.droppableId; // the status === droppableId, as defined in the TodoColumn component

          const originTasks = Object.fromEntries(Object.entries(states.tasks)
            .filter(([id, t]) => t.status === originStatus &&
              t.projectId === task.projectId)); // Get all tasks in the result status
          const sortedOriginTasks = sortChain(originTasks);

          const resultTasks = Object.fromEntries(Object.entries(states.tasks)
            .filter(([id, t]) => t.status === resultStatus &&
              t.projectId === task.projectId)); // Get all tasks in the result status
          const sortedResultTasks = sortChain(resultTasks).filter(([id, t]) => id !== taskId); // Get all tasks in the result status except the dragged task

          const originPrevTask = task.prev;
          const originNextTask = task.next;
          const originIndex = sortedOriginTasks.findIndex(t => t[0] === result.draggableId); // Find the index of the task in the current status
          const resultIndex = result.destination!.index; // The index of the task in the destination status

          const resultPrevTask = sortedResultTasks[result.destination!.index - 1]?.[0] ?? null; // Get the previous task in the result status
          const resultNextTask = sortedResultTasks[result.destination!.index]?.[0] ?? null; // Get the next task in the result status


          console.log(`originStatus: ${originStatus}, resultStatus: ${resultStatus}`);
          console.log(`originIndex: ${originIndex}, resultIndex: ${resultIndex}`);

          if (resultStatus === originStatus && originIndex === resultIndex) {
            console.log('Task was moved within the same status and order, no changes made.');
            return;
          } else {
            const payloads = [{
              id: taskId, updatedFields: {
                prev: resultPrevTask,
                next: resultNextTask,
                status: resultStatus,
                previousStatus: originStatus
              }
            }] as { id: TaskId; updatedFields: Partial<TaskType> }[]; // Prepare payloads for batch update

            if (resultPrevTask) {
              payloads.push({ id: resultPrevTask, updatedFields: { next: taskId } }); // Update the previous task's next task to the dragged task
            }

            if (resultNextTask) {
              payloads.push({ id: resultNextTask, updatedFields: { prev: taskId } }); // Update the next task's previous task to the dragged task
            }

            if (originPrevTask) {
              payloads.push({ id: originPrevTask, updatedFields: { next: originNextTask } }); // Update the previous task's next task to the original task's next task
            }
            if (originNextTask) {
              payloads.push({ id: originNextTask, updatedFields: { prev: originPrevTask } }); // Update the next task's previous task to the original task's previous task
            }
            updateTasks(payloads);
          }
        }


        // setTasks(draft => {
        //   const task = draft[result.draggableId]; // Find the task being dragged by its ID
        //   if (task) { // If the task was found and task was moved
        //     const originStatus = task.status;
        //     const resultStatus = result.destination!.droppableId; // the status === droppableId, as defined in the TodoColumn component

        //     // handle original and result task's previous and next tasks:

        //     // handle original task's previous and next tasks
        //     const originPrevTask = task.prev;
        //     const originNextTask = task.next;
        //     if (originPrevTask) { // If the original task is not the first task, update its previous task to the original's next task (skip the original task)
        //       draft[originPrevTask].next = originNextTask;
        //     }
        //     if (originNextTask) { // If the original task is not the last task, update its next task to the original's previous task (skip the original task)
        //       draft[originNextTask].prev = originPrevTask;
        //     }

        //     // handle result task's previous and next tasks and the dragged task
        //     const resultTasks = Object.fromEntries(Object.entries(draft)
        //       .filter(([id, t]) => t.status === resultStatus &&
        //         t.projectId === task.projectId &&
        //         id !== result.draggableId)); // Get all tasks in the result status
        //     const sortedTasks = sortChain(resultTasks);

        //     const resultPrevTask = sortedTasks[result.destination!.index - 1]?.[0] ?? null; // Get the previous task in the result status
        //     const resultNextTask = sortedTasks[result.destination!.index]?.[0] ?? null; // Get the next task in the result status

        //     if (resultPrevTask) { // If the result task is not the first task, handle A task and result task, [A(null), B(A)] -> [A(null), Result(A), B(Result)], B is handled in the next step
        //       draft[resultPrevTask].next = result.draggableId; // Update the previous task's next task to the dragged task
        //     }
        //     if (resultNextTask) { // If the result task is not the last task, handle B task and result task, [A(B), B(null)] -> [A(Result), Result(null), B(Result)], A is handled in the previous step
        //       draft[resultNextTask].prev = result.draggableId; // Update the next task's previous task to the dragged task
        //     }


        //     task.prev = resultPrevTask;
        //     task.next = resultNextTask;


        //     if (originStatus !== resultStatus) { // If the task's status has changed (i.e., it was moved to a different column)
        //       task.previousStatus = originStatus; // Save the previous status of the task before updating it
        //       task.status = resultStatus; // Update the task's status to the result status
        //     } // else do nothing
        //   }
        // });
      } else {
        // If the task was dropped outside of a droppable area
        // This is a placeholder for handling tasks dropped outside of valid areas
        // Do nothing for now
      }
      console.log('onDragEnd completed');
    }


    // handle "project" type drag and drop
    if (result.type === 'project') {
      console.log('onDragEnd for project', result); // Log the drag result for debugging
      if (result.destination) { // Check if the destination is valid. If true, the project was dropped in a valid droppable area. If false, it means the project was dropped outside of a droppable area.
        setStates.setProjects(draft => {
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
        });
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
      setStates.setDraggedTask([start.draggableId]);
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


  // Define the actions that can be performed on tasks and projects.
  // These actions will be passed down to the Todolist component.
  // They include functions to add, update, delete tasks and projects, and refresh tasks.
  // It is just convenient to put all the actions in one place.
  return {
    addTasks,
    updateTasks,
    hardDeleteTasks,
    changeStatusOfTasks,
    addProject,
    updateProject,
    deleteProject,
    onDragEnd,
    onDragStart,
    onDragUpdate,
  }
}