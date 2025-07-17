import type { UserProfileData, TaskId, TaskType, TaskData, ProjectId, ProjectType, ProjectData, StatusId, StatusType, StatusData, Actions, States, SetStates, BulkPayload } from "./type.ts";
import { useRef, useEffect } from "react";
import { useImmer } from "use-immer";
import { updateLinkedList, sortChain, optimisticUpdateItems, createBulkPayload } from './utils.ts';
import type { DragDropContextProps } from '@hello-pangea/dnd';

import { loadTestTasks, loadTestProjects, loadTestUserProfile, loadTestStatuses } from "../data/loadInitData";
import { b } from "motion/react-client";


export const createActions = (states: States, setStates: SetStates): Actions => {

  /**
   * Function to add new tasks to the task list.
   * It generates unique IDs for the new tasks, adds them to the tasks state,
   * Notice: this function only add tasks to one status bar, not multiple status bars.
   * @param newTask - The new task items to be added - without an ID - ID will be generated automatically. next and prev can be null if added to last. Specific prev or next to insert at desired position.
   * @param bulkPayload - The bulk payload to be used for the add operation.
   */
  const addTasks = (newTask: Omit<TaskType, 'id'>[], bulkPayload: BulkPayload): TaskId[] => {
    const returnTasksId: TaskId[] = []
    newTask.forEach(task => {
      const id = crypto.randomUUID(); // Generate a unique ID for the new task
      const targetStatusExistingTasks = Object.fromEntries(Object.entries(states.tasks).filter(([_, t]) => t.status === task.status && t.projectId === task.projectId));
      const sortedTargetStatusTasks = sortChain(targetStatusExistingTasks);
      // Generate a unique ID for the new task:
      const newTaskWithId: TaskType = ({
        ...task,
        id: id
      });

      // find the index based on provided newTask.prev or newTask.next
      let index: number = 0;
      if (newTaskWithId.prev && sortedTargetStatusTasks.map(task => task[0]).includes(newTaskWithId.prev)) {
        index = sortedTargetStatusTasks.findIndex(task => task[0] === newTaskWithId.prev) + 1;
      } else if (newTaskWithId.next && sortedTargetStatusTasks.map(task => task[0]).includes(newTaskWithId.next)) {
        index = sortedTargetStatusTasks.findIndex(task => task[0] === newTaskWithId.next);
      } else {
        index = sortedTargetStatusTasks.length - 1; // Default to the end of the tasks
      }
      const { updatedArray, updatedItems } = updateLinkedList(Object.fromEntries(sortedTargetStatusTasks), [], [newTaskWithId], index);

      // Optimistically update the tasks state:
      optimisticUpdateItems(setStates.setTasks, updatedArray);

      // pack the payload for the new task and updated tasks:
      bulkPayload.tasks.new.push(newTaskWithId);
      (updatedItems as TaskType[]).forEach(task => {
        bulkPayload.tasks.update.push({
          id: task.id,
          updatedFields: {
            prev: task.prev,
            next: task.next
          }
        });
      });
      returnTasksId.push(id);
    });
    return returnTasksId;
  };


  /**
   * Function to update existing tasks in the task list.
   * @param updatePayloads - An array of objects containing the ID of the task to be updated and the fields to be updated.
   */
  const updateTasks = (updatePayloads: { id: TaskId; updatedFields: Partial<TaskType> }[], bulkPayload: BulkPayload) => {

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

    // Add the updated tasks to the bulk payload:
    bulkPayload.tasks.update.push(...updatePayloads);
  };


  /**
   * Function to hard delete tasks.
   * This function will permanently remove the tasks.
   * Used for the trash bin feature. Soft delete -> trash bin -> want to perminate delete? -> hard delete.
   * It finds the tasks by their IDs and removes them from the tasks state.
   * Safe to use in multiple statuses.
   * @param ids - The IDs of the tasks to be hard deleted.
   * @param bulkPayload - The bulk payload to be used for the hard delete operation.
   */
  const hardDeleteTasks = async (ids: TaskId[], bulkPayload: BulkPayload) => {
    // Check if the tasks exist before deleting them
    ids.forEach(id => {
      const task = states.tasks[id];
      if (!task) {
        throw new Error(`Task with id ${id} not found. Cannot hard delete.`);
      }
    });

    // find all involved statuses, which are the statuses of the tasks to be deleted.
    const involvedStatusesId: StatusId[] = ids.map(id => states.tasks[id].status);
    involvedStatusesId.forEach(status => {
      const targetStatusChain = Object.fromEntries(Object.entries(states.tasks).filter(([_, task]) => task.status === status && task.projectId === states.currentProjectID));
      const { updatedArray, updatedItems, removedItems } = updateLinkedList(targetStatusChain, ids.map(id => states.tasks[id]), [], null);
      // optimistically update the tasks state:
      optimisticUpdateItems(setStates.setTasks, updatedArray);

      // build the bulk payload for the tasks:
      updatedItems.forEach(item => {
        bulkPayload.tasks.update.push({
          id: item.id,
          updatedFields: {
            prev: item.prev,
            next: item.next
          }
        });
      });
      removedItems.forEach(item => {
        bulkPayload.tasks.delete.push(item.id);
      });
    });
  };

  /**
   * Function to move multiple tasks. 
   * It can move tasks from one status to another, or reorder tasks within the same status.
   * It can move multiple tasks, to the same status or different statuses, or both.
   * 
   * 这个方法可以同时移动不同status下多个task到同一个status。
   * @ids - The IDs of the tasks to be moved.
   * @targetStatusId - The ID of the target status to move the tasks to.
   * @index - The index to insert the tasks at. It can be a number, "start", or "end".
   * @bulkPayload - The bulk payload to be used for the move operation.
   */
  const moveTasks = (ids: TaskId[], targetStatusId: StatusId, index: number | "start" | "end", bulkPayload: BulkPayload) => {
    // check if the status is exist
    if (Object.keys(states.statuses).includes(targetStatusId) === false) {
      throw new Error(`Status with id ${targetStatusId} does not exist.`);
    }

    // get the target status chain
    const targetStatusChain = Object.fromEntries(Object.entries(states.tasks).filter(([_, task]) => task.status === targetStatusId && task.projectId === states.currentProjectID));

    // convert index to a number if it's a string. If index is out of bounds, set it to the start or end of the tasks.
    if (index === "start" || index as number < 0) {
      index = 0;
    } else if (index === "end" || index as number >= Object.keys(targetStatusChain).length) {
      index = Object.keys(targetStatusChain).length - 1; // Set index to the end of the tasks
    }

    // check if the ids are valid
    ids.forEach(id => {
      const task = states.tasks[id];
      if (!task) {
        throw new Error(`Task with id ${id} not found.`);
      }
    });

    // find all involved statuses, which are the statuses of the tasks to be moved.
    const involvedStatusesId: StatusId[] = ids.map(id => states.tasks[id].status);

    // go through each involved status and rebuild the linked list array for the target status chain.
    involvedStatusesId.forEach(status => {
      const { updatedArray, addedItems, updatedItems } = updateLinkedList(targetStatusChain, ids.map(id => states.tasks[id]), status === targetStatusId ? ids.map(id => states.tasks[id]) : [], index);
      // optimistically update the tasks state:
      setStates.setTasks(draft => {
        updatedArray.map(item => {
          draft[item.id] = item; // Update the task in the tasks state
        });
      });

      // build the bulk payload for the tasks:
      addedItems.forEach(item => {
        bulkPayload.tasks.new.push(item);
      });
      updatedItems.forEach(item => {
        bulkPayload.tasks.update.push({
          id: item.id,
          updatedFields: {
            prev: item.prev,
            next: item.next,
            status: targetStatusId, // Update the status to the target status
            previousStatus: states.tasks[item.id].status, // Keep the previous status for reference
          }
        });
      });
    });
  };


  /**
   * Function to add a new project to the project list.
   * It generates a unique ID for the new project, adds it to the projects state,
   * and reindexs the projects based on their order.
   * @param newProject - The new project item to be added. next and prev can be null if added to last. Specific prev or next to insert at desired position.
   * @returns The ID of the newly added project.
   */
  const addProject = (newProject: Omit<ProjectType, 'id'>, bulkPayload: BulkPayload): ProjectId => {

    // Generate a unique ID for the new project:
    const id = crypto.randomUUID();
    const newProjectWithId: ProjectType = {
      id,
      ...newProject
    };

    // Sort the existing projects
    const sortedProjects = sortChain(states.projects);

    let index: number = 0;
    if (newProjectWithId.prev && sortedProjects.map(task => task[0]).includes(newProjectWithId.prev)) {
      index = sortedProjects.findIndex(task => task[0] === newProjectWithId.prev) + 1;
    } else if (newProjectWithId.next && sortedProjects.map(task => task[0]).includes(newProjectWithId.next)) {
      index = sortedProjects.findIndex(task => task[0] === newProjectWithId.next);
    } else {
      index = sortedProjects.length - 1; // Default to the end of the tasks
    }

    // Rebuild the linked list array for the projects, inserting the new project at the specified index.
    const { updatedArray, updatedItems, addedItems } = updateLinkedList(Object.fromEntries(sortedProjects), [], [newProjectWithId], index);

    // Optimistically update the projects state:
    optimisticUpdateItems(setStates.setProjects, updatedArray);

    // pack the payload for the new project and updated projects:
    addedItems.forEach(item => {
      bulkPayload.projects.new.push(item);
    });
    updatedItems.forEach(item => {
      bulkPayload.projects.update.push({
        id: item.id,
        updatedFields: {
          prev: item.prev,
          next: item.next,
        }
      });
    });

    return id; // Return the ID of the newly added project
  };

  const moveProject = (id: ProjectId, index: number, bulkPayload: BulkPayload) => {

    const sortedProjects = sortChain(states.projects);
    const currentProjectIndex = sortedProjects.findIndex(([projectId, _]) => projectId === id);

    // rebuild the linked list array for the projects, inserting the project at the specified index.
    if (currentProjectIndex === -1) {
      throw new Error(`Project with id ${id} not found.`);
    }
    if (index < 0 || index >= sortedProjects.length) {
      throw new Error(`Index ${index} is out of bounds for the project list.`);
    }

    if (currentProjectIndex === index) {
      console.warn(`Project with id ${id} is already at index ${index}. No action taken.`);
      return; // No need to move if the project is already at the desired index
    }


    // Note: we need to at most update 5 projects:
    // 1. The project being moved
    // 2. The project before the destination position (if exists)
    // 3. The project after the destination position (if exists)
    // 4. The project before the origin position (if exists)
    // 5. The project after the origin position (if exists)
    //
    // the project being moved, has prev and next. Whatever the destination is,
    // that is because if it is moved to the end or start, the prev and next will be updated to null.
    // however, the rest four projects may not exist, so we need to check if they exist before updating them.

    // get prev and next projectIds of the origin position:
    const originProjectPrev = states.projects[id].prev;
    const originProjectNext = states.projects[id].next;

    // get prev and next projectIds of the destination position:
    const newProjectPrev = index === 0 ? null : sortedProjects[index - 1][0]; // If moving to the start, prev is null
    const newProjectNext = index === sortedProjects.length - 1 ? null : sortedProjects[index][0]; // If moving to the end, next is null

    // update the moved project's prev, even if there is a project in front of the destination -- the prev is just null:
    bulkPayload.projects.update.push({ id, updatedFields: { prev: newProjectPrev } });
    setStates.setProjects(draft => {
      draft[id].prev = newProjectPrev; // Update the project's prev to the new prev
    });

    // update the moved project's next, even if there is a project after the destination -- the next is just null:
    bulkPayload.projects.update.push({ id, updatedFields: { next: newProjectNext } });
    setStates.setProjects(draft => {
      draft[id].next = newProjectNext; // Update the project's next to the new next
    });

    // if there is a project before the origin position:
    if (originProjectPrev) { // if before move, the project has a previous project
      bulkPayload.projects.update.push({ id: originProjectPrev, updatedFields: { next: originProjectNext } }); // Update the previous project's next to the new next
      setStates.setProjects(draft => {
        draft[originProjectPrev].next = originProjectNext; // Update the previous project's next to the new next
      });
    }

    // if there is a project after the origin position:
    if (originProjectNext) { // if before move, the project has a next project
      bulkPayload.projects.update.push({ id: originProjectNext, updatedFields: { prev: originProjectPrev } }); // Update the next project's prev to the new prev
      setStates.setProjects(draft => {
        draft[originProjectNext].prev = originProjectPrev; // Update the next project's prev to the new prev
      });
    }

    // when there is a project before the destination position:
    if (newProjectPrev) {
      bulkPayload.projects.update.push({ id: newProjectPrev, updatedFields: { next: id } });
      setStates.setProjects(draft => {
        draft[newProjectPrev].next = id; // Update the previous project's next to the current project
      });
    }

    // when there is a project after the destination position:
    if (newProjectNext) {
      bulkPayload.projects.update.push({ id: newProjectNext, updatedFields: { prev: id } });
      setStates.setProjects(draft => {
        draft[newProjectNext].prev = id; // Update the next project's prev to the new prev
      });
    }
  };

  /**
   * Updates a project in the state and adds the update to the bulk payload.
   * @param id - The ID of the project to be updated.
   * @param updatedFields - The fields to be updated in the project.
   * @param bulkPayload - The bulk payload to be used for the update operation.
   */
  const updateProject = (id: ProjectId, updatedFields: Partial<ProjectType>, bulkPayload: BulkPayload) => {
    const project = states.projects[id];
    // Optimistically update the projects state:
    if (project) {
      setStates.setProjects(draft => {
        Object.assign(draft[id], updatedFields);
      });
    };

    // Add the updated project to the bulk payload:
    bulkPayload.projects.update.push({
      id,
      updatedFields
    });
  };

  /**
   * Function to delete a project from the project list.
   * This function will permanently remove the project list, and permanently delete all tasks in the project.
   * It finds the project by its ID and removes it from the projects state.
   * @param projectId - The ID of the project to be deleted.
   */
  const deleteProject = (projectId: ProjectId, bulkPayload: BulkPayload) => {
    // Check if the project exists before deleting it
    // if (!states.projects[projectId]) {
    //   throw new Error(`Project with id ${projectId} not found. Cannot delete.`);
    // }

    const { updatedItems } = updateLinkedList(
      states.projects,
      [states.projects[projectId]], // no origin items to remove, as we are deleting the project
      [], // no new items to add, as we are deleting the project
      null // no index to insert at, as we are deleting the project
    );


    // optimistically update the projects state:
    optimisticUpdateItems(setStates.setProjects, updatedItems);

    // add the deleted project to the bulk payload:
    bulkPayload.projects.delete.push(projectId);
  };



  // /**
  //  * Removes an item from a list and updates the list accordingly.
  //  * This function can not only handle deleting the item from the list,
  //  * but also can handle complete, as long as the item is removed from the list.
  //  * @param fromList - The list from which the item will be removed.
  //  * @param item - The item to be removed.
  //  * @param updateMethodItem - The method to update the item.
  //  * @param updateMethodOriginList - The method to update the original item's item.
  //  */
  // const transferItemFromList = (fromList: any[], item: any,
  //   updateMethodItem: (updatePayloads: { id: TaskId; updatedFields: Partial<TaskType> }[]) => Promise<void>,
  //   updateMethodOriginList: any) => {
  //   const index = fromList.indexOf(item);

  //   updateMethodItem(item[0]);
  //   fromList.splice(index, 1); // Remove the project from the projects array
  //   console.log(`called transferItemFromList, deleted item: ${item[1].title}, index: ${index}, list length: ${fromList.length}`);

  //   // 1. [A, B, C] -> [A, C] when deleting B,, C.prev = A, A.next = C,, 
  //   // 2. [A, B, C] -> [A, B] when deleting C,, B.next = null,, index === 2 === projects.length - 1
  //   // 3. [A, B, C] -> [B, C] when deleting A,, B.prev = null,, index === 0
  //   // 4. [A, B] -> [B] when deleting A,, B.prev = null
  //   // 5. [A, B] -> [A] when deleting B,, A.next = null
  //   // 6. [A] -> [] when deleting A, do nothing, as there is no next or previous project

  //   // if the first project is deleted, and there is project left,
  //   // index===0 is the next one of the deleted project,
  //   // set the index===0 project.prev to null
  //   // scenario 3, 4
  //   if (index === 0 && fromList.length > 0) {
  //     updateMethodOriginList(fromList[0][0], { prev: null });
  //     console.log(`Deleted the first project: ${item[1].title}, set its next project to null.`);
  //   }

  //   // if the last project is deleted, and there is still project left,
  //   // set the index===last project.next to null
  //   // index===length- is the previous one of the deleted project,
  //   // scenario 2, 5
  //   if (index === fromList.length && fromList.length > 0) {
  //     updateMethodOriginList(fromList[index - 1][0], { next: null });
  //     console.log(`Deleted the last project: ${item[1].title}, set its previous project to null.`);
  //   }

  //   // if the project is in the middle of the list,
  //   // set the previous project's next to the next project,
  //   // and the next project's prev to the previous project.
  //   // scenario 1
  //   if (index > 0 && index < fromList.length) {
  //     updateMethodOriginList(fromList[index - 1][0], { next: fromList[index][0] });
  //     updateMethodOriginList(fromList[index][0], { prev: fromList[index - 1][0] });
  //     console.log(`Deleted the project: ${item[1].title}, set its previous project's next to the next project and the next project's prev to the previous project.`);
  //   }

  //   // if the project was the only project in the list,
  //   // do nothing, as there is no next or previous project.
  //   // scenario 6
  // };





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
          const payload = createBulkPayload(); // Create a bulk payload for the update operation
          moveTasks([taskId], resultStatus, result.destination!.index, payload);









          //   const originTasks = Object.fromEntries(Object.entries(states.tasks)
          //     .filter(([id, t]) => t.status === originStatus &&
          //       t.projectId === task.projectId)); // Get all tasks in the result status
          //   const sortedOriginTasks = sortChain(originTasks);

          //   const resultTasks = Object.fromEntries(Object.entries(states.tasks)
          //     .filter(([id, t]) => t.status === resultStatus &&
          //       t.projectId === task.projectId)); // Get all tasks in the result status
          //   const sortedResultTasks = sortChain(resultTasks).filter(([id, t]) => id !== taskId); // Get all tasks in the result status except the dragged task

          //   const originPrevTask = task.prev;
          //   const originNextTask = task.next;
          //   const originIndex = sortedOriginTasks.findIndex(t => t[0] === result.draggableId); // Find the index of the task in the current status
          //   const resultIndex = result.destination!.index; // The index of the task in the destination status

          //   const resultPrevTask = sortedResultTasks[result.destination!.index - 1]?.[0] ?? null; // Get the previous task in the result status
          //   const resultNextTask = sortedResultTasks[result.destination!.index]?.[0] ?? null; // Get the next task in the result status


          //   console.log(`originStatus: ${originStatus}, resultStatus: ${resultStatus}`);
          //   console.log(`originIndex: ${originIndex}, resultIndex: ${resultIndex}`);

          //   if (resultStatus === originStatus && originIndex === resultIndex) {
          //     console.log('Task was moved within the same status and order, no changes made.');
          //     return;
          //   } else {
          //     const payloads = [{
          //       id: taskId, updatedFields: {
          //         prev: resultPrevTask,
          //         next: resultNextTask,
          //         status: resultStatus,
          //         previousStatus: originStatus
          //       }
          //     }] as { id: TaskId; updatedFields: Partial<TaskType> }[]; // Prepare payloads for batch update

          //     if (resultPrevTask) {
          //       payloads.push({ id: resultPrevTask, updatedFields: { next: taskId } }); // Update the previous task's next task to the dragged task
          //     }

          //     if (resultNextTask) {
          //       payloads.push({ id: resultNextTask, updatedFields: { prev: taskId } }); // Update the next task's previous task to the dragged task
          //     }

          //     if (originPrevTask) {
          //       payloads.push({ id: originPrevTask, updatedFields: { next: originNextTask } }); // Update the previous task's next task to the original task's next task
          //     }
          //     if (originNextTask) {
          //       payloads.push({ id: originNextTask, updatedFields: { prev: originPrevTask } }); // Update the next task's previous task to the original task's previous task
          //     }
          //     updateTasks(payloads);
          //   }
          // }


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

            const payload = createBulkPayload(); // Create a bulk payload for the update operation
            moveProject(result.draggableId, result.destination!.index, payload);






            // if (originPrevProject) { // If the original task is not the first task, update its previous task to the original's next task (skip the original task)
            //   draft[originPrevProject].next = originNextProject;
            // }
            // if (originNextProject) { // If the original task is not the last task, update its next task to the original's previous task (skip the original task)
            //   draft[originNextProject].prev = originPrevProject;
            // }

            // // handle result task's previous and next tasks and the dragged task
            // const resultProjects = Object.fromEntries(Object.entries(draft)
            //   .filter(([id, t]) => id !== result.draggableId)); // Get all tasks in the result status
            // const sortedProjects = sortChain(resultProjects);

            // const resultPrevProject = sortedProjects[result.destination!.index - 1]?.[0] ?? null; // Get the previous project in the result status
            // const resultNextProject = sortedProjects[result.destination!.index]?.[0] ?? null; // Get the next project in the result status

            // if (resultPrevProject) { // If the result project is not the first project, handle A project and result project, [A(null), B(A)] -> [A(null), Result(A), B(Result)], B is handled in the next step
            //   draft[resultPrevProject].next = result.draggableId; // Update the previous project's next project to the dragged project
            // }
            // if (resultNextProject) { // If the result project is not the last project, handle B project and result project, [A(B), B(null)] -> [A(Result), Result(null), B(Result)], A is handled in the previous step
            //   draft[resultNextProject].prev = result.draggableId; // Update the next project's previous project to the dragged project
            // }

            // project.prev = resultPrevProject;
            // project.next = resultNextProject;
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
  //   if (start.type === 'task') {
  //     setStates.setDraggedTask([start.draggableId]);
  //   }
  //   if (start.type === 'project') {

  //   }

  //   // Store the previous droppable ID to handle drag updates.
  //   // Not in use. Stored here for future use.
  //   const prevDroppableId = useRef<string | null>(null);
  //   // Function to handle updates during a drag and drop event.
  //   // Not in use. Stored here for future use.
  }
  const onDragUpdate: DragDropContextProps['onDragUpdate'] = (update) => {
  //   const current = update.destination?.droppableId || null;
  //   if (current !== prevDroppableId.current) {
  //     if (prevDroppableId.current === '-1') { // exit delete-zone
  //       document.querySelectorAll(`#${update.draggableId}`).forEach(el => {
  //         // Remove the class indicating the draggable is over the delete area
  //       });
  //     }
  //     if (current === '-1') { // enter delete-zone
  //       document.querySelectorAll(`#${update.draggableId}`).forEach(el => {
  //         // Add a class to indicate the draggable is over the delete area
  //       });
  //     }
  //     if (prevDroppableId.current !== null && current === null) { // exit all Droppable
  //       // places to handle when the draggable is not over any droppable area
  //     }
  //     prevDroppableId.current = current;
  //   }
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
    moveTasks,
    addProject,
    updateProject,
    moveProject,
    deleteProject,
    onDragEnd,
    onDragStart,
    onDragUpdate,
  };
};