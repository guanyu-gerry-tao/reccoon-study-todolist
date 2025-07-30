import { useLayoutEffect } from "react";
import type {
  UserProfileData,
  TaskId,
  Task,
  TaskMap,
  ProjectId,
  Project,
  ProjectMap,
  StatusId,
  Status,
  StatusMap,
  States,
  SetStates,
  BulkPayload,
  UserId,
  Conversation,
  Message,
  ConversationId,
  MessageId,
  ConversationMap,
  MessageMap,
  Actions
} from "./type.ts";
import { sortChain, createBulkPayload, optimisticUIUpdate, postPayloadToServer, restoreBackup } from './utils.ts';
import type { DragDropContextProps, DropResult } from '@hello-pangea/dnd';
import { animate } from 'motion';
import { nav } from "framer-motion/client";
import { Navigate } from "react-router-dom";

function sortOutPrevNext<T extends { prev: string | null, next: string | null }>(
  prev: TaskId | "start" | null,
  next: TaskId | "end" | null,
  sortedChainWithoutSelf: [string, T][]
) {
  // 1. handle "start"
  if (prev === "start") {
    return {
      newPrev: null,
      newNext: sortedChainWithoutSelf[0]?.[0] || null
    };
  }

  // 2. handle "end" or both null by default
  if (next === "end" || (prev === null && next === null)) {
    return {
      newPrev: sortedChainWithoutSelf[sortedChainWithoutSelf.length - 1]?.[0] || null,
      newNext: null
    };
  }

  // 3. handle explicit prev (prior to next)
  if (prev !== null) {
    const prevIndex = sortedChainWithoutSelf.findIndex(task => task[0] === prev);
    if (prevIndex !== -1) { // prev exists in the chain
      return {
        newPrev: prev,
        newNext: sortedChainWithoutSelf[prevIndex + 1]?.[0] || null
      };
    } else { // prev does not exist in the chain, this is an unexpected case
      console.warn(`sortOutPrevNext: prev ID "${prev}" not found in chain, fallback to end`);
      return {
        newPrev: sortedChainWithoutSelf[sortedChainWithoutSelf.length - 1]?.[0] || null,
        newNext: null
      };
    }
  }

  // 4. handle explicit next (after prev)
  if (next !== null) {
    const nextIndex = sortedChainWithoutSelf.findIndex(task => task[0] === next);
    if (nextIndex !== -1) { // next exists in the chain
      return {
        newPrev: sortedChainWithoutSelf[nextIndex - 1]?.[0] || null,
        newNext: next
      };
    } else { // next does not exist in the chain, this is an unexpected case
      console.warn(`sortOutPrevNext: next ID "${next}" not found in chain, fallback to end`);
      return {
        newPrev: sortedChainWithoutSelf[sortedChainWithoutSelf.length - 1]?.[0] || null,
        newNext: null
      };
    }
  }

  // 5. handle unexpected cases (theoretically should not reach here)
  console.error(`sortOutPrevNext: Unexpected case - prev: ${prev}, next: ${next}`);
  return {
    newPrev: sortedChainWithoutSelf[sortedChainWithoutSelf.length - 1]?.[0] || null,
    newNext: null
  };
}

export const createActions = (states: States, setStates: SetStates): Actions => {

  /**
   * Function to add new tasks to the task list.
   * It generates unique IDs for the new tasks, adds them to the tasks state,
   * Notice: this function only add tasks to one status bar, not multiple status bars.
   * @param newTask - The new task items to be added - without an ID - ID will be generated automatically. next and prev can be both null if added to last. Specific prev or next to insert at desired position.
   * @param bulkPayload - The bulk payload to be used for the add operation.
   */
  // const addTask = (newTask: Omit<Task, 'id'>, bulkPayload: BulkPayload, addWithAnimation: boolean = false): TaskId => {
  //   const id = crypto.randomUUID(); // Generate a unique ID for the new task
  //   const targetStatusExistingTasks = Object.fromEntries(Object.entries(states.tasks).filter(([_, t]) => t.status === newTask.status && t.projectId === newTask.projectId));
  //   const sortedTargetStatusTasks = sortChain(targetStatusExistingTasks);
  //   // Generate a unique ID for the new task:
  //   const newTaskWithId: Task = ({
  //     ...newTask,
  //     id: id
  //   });

  //   // find the index based on provided newTask.prev or newTask.next
  //   let index: number = 0;
  //   if (newTaskWithId.prev && sortedTargetStatusTasks.map(task => task[0]).includes(newTaskWithId.prev)) {
  //     index = sortedTargetStatusTasks.findIndex(task => task[0] === newTaskWithId.prev) + 1;
  //   } else if (newTaskWithId.next && sortedTargetStatusTasks.map(task => task[0]).includes(newTaskWithId.next)) {
  //     index = sortedTargetStatusTasks.findIndex(task => task[0] === newTaskWithId.next);
  //   } else {
  //     index = sortedTargetStatusTasks.length; // Default to the end of the tasks
  //   }

  //   // set the prev and next correctly:
  //   if (index === 0) {
  //     newTaskWithId.prev = null; // No previous task
  //     newTaskWithId.next = sortedTargetStatusTasks.length > 0 ? sortedTargetStatusTasks[0][0] : null; // First task in the status
  //   } else if (index === sortedTargetStatusTasks.length) {
  //     newTaskWithId.prev = sortedTargetStatusTasks[sortedTargetStatusTasks.length - 1][0]; // Last task in the status
  //     newTaskWithId.next = null; // No next task
  //   } else {
  //     newTaskWithId.prev = sortedTargetStatusTasks[index - 1][0]; // Previous task in the status
  //     newTaskWithId.next = sortedTargetStatusTasks[index][0]; // Next task in the status
  //   }

  //   // add to payload:
  //   bulkPayload.ops.push({
  //     type: 'task',
  //     operation: 'add',
  //     data: newTaskWithId
  //   });

  //   // update surrounding tasks' prev and next:
  //   if (newTaskWithId.prev) {
  //     bulkPayload.ops.push({
  //       type: 'task',
  //       operation: 'update',
  //       data: {
  //         id: newTaskWithId.prev,
  //         updatedFields: { next: newTaskWithId.id }
  //       }
  //     });
  //   };
  //   if (newTaskWithId.next) {
  //     bulkPayload.ops.push({
  //       type: 'task',
  //       operation: 'update',
  //       data: {
  //         id: newTaskWithId.next,
  //         updatedFields: { prev: newTaskWithId.id }
  //       }
  //     });
  //   };
  //   console.log(`addTask: payload: ${JSON.stringify(bulkPayload)}`);
  //   if (addWithAnimation) {
  //     requestAnimationFrame(() => {
  //       const el = document.getElementById(id);
  //       if (el) {
  //         animate(el, { opacity: [0, 1], }, { duration: 0.3 }); // Animate the new project card to fade in
  //         animate(el, { height: ["0px", el.scrollHeight] }, { duration: 0.2 }); // Animate the new project card to slide up
  //       }
  //     });
  //   }
  //   return id;
  // };


  // /**
  //  * Function to hard delete tasks.
  //  * This function will permanently remove the tasks.
  //  * Used for the trash bin feature. Soft delete -> trash bin -> want to perminate delete? -> hard delete.
  //  * It finds the tasks by their IDs and removes them from the tasks state.
  //  * Safe to use in multiple statuses.
  //  * @param ids - The IDs of the tasks to be hard deleted.
  //  * @param bulkPayload - The bulk payload to be used for the hard delete operation.
  //  */
  // const hardDeleteTask = async (id: TaskId, bulkPayload: BulkPayload) => {
  //   // Check if the tasks exist before deleting them
  //   const task = states.tasks[id];
  //   if (!task) {
  //     throw new Error(`Task with id ${id} not found. Cannot hard delete.`);
  //   }

  //   const deletedTaskPrev = task.prev;
  //   const deletedTaskNext = task.next;

  //   // Add the task to the bulk payload for hard delete
  //   bulkPayload.ops.push({
  //     type: 'task',
  //     operation: 'delete',
  //     data: { id: id }
  //   });


  /**  //   if (deletedTaskPrev) {
//     bulkPayload.ops.push({
//       type: 'task',
//       operation: 'update',
//       data: {
//         id: deletedTaskPrev,
//         updatedFields: { next: deletedTaskNext } // Update the next task of the previous task
//       }
//     });
//   }
//   if (deletedTaskNext) {
//     bulkPayload.ops.push({
//       type: 'task',
//       operation: 'update',
//       data: {
//         id: deletedTaskNext,
//         updatedFields: { prev: deletedTaskPrev } // Update the previous task of the next task
//       }
//     });
//   }


// };


   * Function to add a new item to the item list.
   * It generates a unique ID for the new item, adds it to the item state,
   * and reindexs the items based on their order.
   * @param type - The type of item to be added ('project', 'status', 'conversation', 'message').
   * @param newItem - The new item to be added - without an ID - ID will be generated automatically. next and prev can be both null if added to last. Specific prev or next to insert at desired position.
   * @param itemRecord - The record of items to which the new item will be added.
   * @param bulkPayload - The bulk payload to be used for the add operation.
   * @param addWithAnimation - Whether to add the item with animation.
   * @returns The ID of the newly added item.
   */
  const addItem = <Item extends { id: string; prev: string | null; next: string | null }, ItemMap extends Record<string, Item>>
    (type: 'task' | 'project' | 'status' | 'conversation' | 'message', newItem: Omit<Item, 'id'>, itemRecord: ItemMap, bulkPayload: BulkPayload): string => {

    // Generate a unique ID for the new project:
    const id = crypto.randomUUID();
    const newItemWithId = {
      id,
      ...newItem
    } as Item;

    // Sort the existing projects
    const sortedItems = sortChain<Item>(itemRecord);

    let index: number = 0;
    if (newItemWithId.prev && sortedItems.map(task => task[0]).includes(newItemWithId.prev)) {
      index = sortedItems.findIndex(task => task[0] === newItemWithId.prev) + 1;
    } else if (newItemWithId.next && sortedItems.map(task => task[0]).includes(newItemWithId.next)) {
      index = sortedItems.findIndex(task => task[0] === newItemWithId.next);
    } else {
      index = sortedItems.length; // Default to the end of the tasks
    }

    // set the prev and next correctly:
    newItemWithId.prev = sortedItems[index - 1]?.[0] || null;
    newItemWithId.next = sortedItems[index]?.[0] || null;


    // Add the new project to the bulk payload:
    bulkPayload.ops.push({
      type: type,
      operation: 'add',
      data: newItemWithId
    });

    // Update surrounding projects' prev and next:
    if (newItemWithId.prev) {
      bulkPayload.ops.push({
        type: type,
        operation: 'update',
        data: {
          id: newItemWithId.prev,
          updatedFields: { next: newItemWithId.id }
        }
      });
    }
    if (newItemWithId.next) {
      bulkPayload.ops.push({
        type: type,
        operation: 'update',
        data: {
          id: newItemWithId.next,
          updatedFields: { prev: newItemWithId.id }
        }
      });
    }

    if (type === 'project' || type === 'conversation') {
      focusItem(type, newItemWithId.id, bulkPayload); // Focus on the new project or conversation
    }

    // if (addWithAnimation) {
    //   requestAnimationFrame(() => {
    //     const el = document.getElementById(id);
    //     if (el) {
    //       animate(el, { opacity: [0, 1], }, { duration: 0.3 }); // Animate the new project card to fade in
    //       animate(el, { height: ["0px", "1rem"] }, { duration: 0.2 }); // Animate the new project card to slide up
    //     }
    //   });
    // }

    return id; // Return the ID of the newly added project
  };


  /**
   * Updates a item in the state and adds the update to the bulk payload.
   * @type - The type of item to be updated ('task', 'project', 'status', 'conversation', 'message').
   * @param id - The ID of the item to be updated.
   * @param updatedFields - The fields to be updated in the item.
   * @param bulkPayload - The bulk payload to be used for the update operation.
   */
  const updateItem = <T extends Task | Project | Status | Conversation | Message>(type: 'task' | 'project' | 'status' | 'conversation' | 'message', id: string, updatedFields: Partial<T>, bulkPayload: BulkPayload) => {

    // Add the updated project to the bulk payload:
    bulkPayload.ops.push({
      type: type,
      operation: 'update',
      data: {
        id,
        updatedFields
      }
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
  const moveTask = (id: TaskId, targetStatusId: StatusId, prev: TaskId | "start" | null = null, next: TaskId | "end" | null = null, bulkPayload: BulkPayload) => {
    // check if the status is exist
    if (Object.keys(states.statuses).includes(targetStatusId) === false && targetStatusId !== "completed" && targetStatusId !== "deleted") {
      throw new Error(`Status with id ${targetStatusId} does not exist.`);
    }
    // check if the task is exist
    if (!states.tasks[id]) {
      throw new Error(`Task with id ${id} does not exist.`);
    }

    // get the target status chain
    const targetStatusChain = Object.fromEntries(Object.entries(states.tasks).filter(([_, task]) => task.status === targetStatusId));
    const sortedTargetChainWithoutTask = sortChain(targetStatusChain).filter(task => task[0] !== id); // Exclude the task being moved

    // convert index to a number if it's a string. If index is out of bounds, set it to the start or end of the tasks.
    // if (index === "start" || index as number < 0) {
    //   index = 0;
    // } else if (index === "end" || index as number >= sortedTargetChainWithoutTask.length) {
    //   index = sortedTargetChainWithoutTask.length; // Set index to the end of the tasks
    // }

    // sort out the prev and next based on the provided prev and next, or the index.
    const { newPrev, newNext } = sortOutPrevNext(prev, next, sortedTargetChainWithoutTask);

    // find old surrounding tasks' prev and next:
    const oldPrevTask = states.tasks[id].prev;
    const oldNextTask = states.tasks[id].next;

    // check if the task is not moving
    if (states.tasks[id].status === targetStatusId && newPrev === states.tasks[id].prev && newNext === states.tasks[id].next) { // Task is not moving
      console.log(`Task with id ${id} is already at index ${Object.keys(sortedTargetChainWithoutTask).indexOf(id)}. No action taken.`);
      return;
    }

    // update the task's status and prev/next:
    bulkPayload.ops.push({
      type: 'task',
      operation: 'update',
      data: {
        id: id,
        updatedFields: {
          status: targetStatusId, // Update the status to the target status
          previousStatus: states.tasks[id].status, // Keep the previous status for reference
          prev: newPrev, // Will be updated later
          next: newNext // Will be updated later
        }
      }
    });

    // update surrounding tasks' prev and next:
    if (oldPrevTask) {
      bulkPayload.ops.push({
        type: 'task',
        operation: 'update',
        data: {
          id: oldPrevTask,
          updatedFields: { next: oldNextTask } // Update the next task of the old previous task
        }
      });
    }
    if (oldNextTask) {
      bulkPayload.ops.push({
        type: 'task',
        operation: 'update',
        data: {
          id: oldNextTask,
          updatedFields: { prev: oldPrevTask } // Update the previous task of the old next task
        }
      });
    }

    // update new surrounding tasks' prev and next:
    if (newPrev) {
      bulkPayload.ops.push({
        type: 'task',
        operation: 'update',
        data: {
          id: newPrev,
          updatedFields: { next: id } // Update the next task of the new previous task
        }
      });
    }
    if (newNext) {
      bulkPayload.ops.push({
        type: 'task',
        operation: 'update',
        data: {
          id: newNext,
          updatedFields: { prev: id } // Update the previous task of the new next task
        }
      });
    }
    // if (moveWithAnimation) {
    //   requestAnimationFrame(() => {
    //     const el = document.getElementById(id);
    //     if (el) {
    //       animate(el, { opacity: [0, 1], }, { duration: 0.3 }); // Animate the new project card to fade in
    //       animate(el, { height: ["0px", el.scrollHeight] }, { duration: 0.2 }); // Animate the new project card to slide up
    //     }
    //   });
    // }
    // requestAnimationFrame(() => {
    //   document.getElementById(id)?.classList.remove('hide'); // Ensure the task is visible after moving
    // });
  };



  const moveItem = <Item extends { id: string; prev: string | null; next: string | null }>
    (type: 'project' | 'status' | 'conversation', id: string, itemRecord: Record<string, Item>, prev: string | "start" | null = null, next: string | "end" | null = null, bulkPayload: BulkPayload) => {
    const sortedItems = sortChain<Item>(itemRecord);
    const currentItemIndex = sortedItems.findIndex(([itemId, _]) => itemId === id);
    const sortedItemsWithoutMovedItem = sortedItems.filter(item => item[0] !== id); // Exclude the item being moved

    // rebuild the linked list array for the items, inserting the item at the specified index.
    if (currentItemIndex === -1) {
      throw new Error(`Item with id ${id} not found.`);
    }

    const { newPrev, newNext } = sortOutPrevNext(prev, next, sortedItemsWithoutMovedItem);




    // Note: we need to at most update 5 items:
    // 1. The item being moved
    // 2. The item before the destination position (if exists)
    // 3. The item after the destination position (if exists)
    // 4. The item before the origin position (if exists)
    // 5. The item after the origin position (if exists)
    //
    // the item being moved, has prev and next. Whatever the destination is,
    // that is because if it is moved to the end or start, the prev and next will be updated to null.
    // however, the rest four items may not exist, so we need to check if they exist before updating them.

    // get prev and next itemIds of the origin position:
    const oldItemPrev = itemRecord[id].prev;
    const oldItemNext = itemRecord[id].next;

    if (oldItemNext === newNext && oldItemPrev === newPrev) {
      console.log(`move Item: Item with id ${id} is already at index ${currentItemIndex}. No action taken.`);
      return; // No need to move if the item is already at the desired index
    }
    // update the moved item's prev and next, even if there is an item in front of the destination -- the prev is just null:
    bulkPayload.ops.push({
      type: type,
      operation: 'update',
      data: {
        id,
        updatedFields: {
          prev: newPrev,
          next: newNext
        }
      }
    });

    // if there is a item before the origin position:
    if (oldItemPrev) { // if before move, the item has a previous item
      bulkPayload.ops.push({
        type: type,
        operation: 'update',
        data: {
          id: oldItemPrev,
          updatedFields: { next: oldItemNext }
        }
      });
    };

    // if there is a item after the origin position:
    if (oldItemNext) { // if before move, the item has a next item
      bulkPayload.ops.push({
        type: type,
        operation: 'update',
        data: {
          id: oldItemNext,
          updatedFields: { prev: oldItemPrev }
        }
      });
    };

    // when there is a item before the destination position:
    if (newPrev) {
      bulkPayload.ops.push({
        type: type,
        operation: 'update',
        data: {
          id: newPrev,
          updatedFields: { next: id }
        }
      });
    };

    // when there is a item after the destination position:
    if (newNext) {
      bulkPayload.ops.push({
        type: type,
        operation: 'update',
        data: {
          id: newNext,
          updatedFields: { prev: id }
        }
      });
    };
  };


  /**
   * Function to delete a project from the project list.
   * This function will permanently remove the project list, and permanently delete all tasks in the project.
   * It finds the project by its ID and removes it from the projects state.
   * @param projectId - The ID of the project to be deleted.
   */
  const deleteItem = <Item extends Task | Project | Status | Conversation | Message>
    (type: 'task' | 'project' | 'status' | 'conversation' | 'message', id: string, itemMap: Record<string, Item>, bulkPayload: BulkPayload) => {
    // Check if the item exists before deleting it
    if (!itemMap[id]) {
      throw new Error(`Item with id ${id} not found. Cannot delete.`);
    }

    const deletedItem = itemMap[id];
    const deletedItemPrev = deletedItem.prev;
    const deletedItemNext = deletedItem.next;

    // Add the deleted item to the bulk payload
    if (type === 'task' || type === 'message') {
      bulkPayload.ops.push({
        type: type,
        operation: 'delete',
        data: { id: id }
      });
    } else if (type === 'status') { // handle deletion of status
      // delete the status first
      bulkPayload.ops.push({
        type: 'status',
        operation: 'delete',
        data: { id: id } // Add the status ID to the bulk payload for deletion
      });
      // then delete all tasks in the status
      const tasksInStatus = Object.entries(states.tasks).filter(([_, task]) => task.status === id);
      for (const [taskId, _] of tasksInStatus) {
        bulkPayload.ops.push({
          type: 'task',
          operation: 'delete',
          data: { id: taskId } // Add the task ID to the bulk payload for deletion
        });
      }
    } else if (type === 'project') { // handle deletion of project
      // delete the project first
      bulkPayload.ops.push({
        type: 'project',
        operation: 'delete',
        data: { id: id } // Add the project ID to the bulk payload for deletion
      });

      // then delete all statuses in the project 
      const statusesInProject = Object.entries(states.statuses).filter(([_, status]) => status.projectId === id);
      const tasksInProject = Object.entries(states.tasks).filter(([_, task]) => statusesInProject.map(([statusId, _]) => statusId).includes(task.status));
      for (const [statusId, _] of statusesInProject) {
        bulkPayload.ops.push({
          type: 'status',
          operation: 'delete',
          data: { id: statusId } // Add the status ID to the bulk payload for deletion
        });
      }
      // then delete all tasks in the project
      for (const [taskId, _] of tasksInProject) {
        bulkPayload.ops.push({
          type: 'task',
          operation: 'delete',
          data: { id: taskId } // Add the task ID to the bulk payload for deletion
        });
      }

      if (states.userProfile.focusProject === id) {
        focusItem('project', deletedItemPrev as ProjectId, bulkPayload); // Focus on the previous project if it exists
      }
    } else if (type === 'conversation') { // handle deletion of conversation

      // delete the conversation first
      bulkPayload.ops.push({
        type: 'conversation',
        operation: 'delete',
        data: { id: id } // Add the conversation ID to the bulk payload for deletion
      });

      // then delete all messages in the conversation
      const messagesInConversation = Object.entries(states.messages).filter(([_, message]) => message.conversationId === id && message.userId === states.userProfile.id);
      for (const [messageId, _] of messagesInConversation) {
        bulkPayload.ops.push({
          type: 'message',
          operation: 'delete',
          data: { id: messageId } // Add the message ID to the bulk payload for deletion
        });
      }

      // if the conversation is focused, focus on the previous conversation
      if (states.userProfile.focusConversation === id) {
        focusItem('conversation', deletedItemPrev as ConversationId, bulkPayload); // Focus on the previous conversation if it exists
      }
    }

    // update the prev and next of the surrounding items:
    if (deletedItemPrev) {
      bulkPayload.ops.push({
        type: type,
        operation: 'update',
        data: {
          id: deletedItemPrev,
          updatedFields: { next: deletedItemNext } // Update the next item of the previous item
        }
      });
    }
    if (deletedItemNext) {
      bulkPayload.ops.push({
        type: type,
        operation: 'update',
        data: {
          id: deletedItemNext,
          updatedFields: { prev: deletedItemPrev } // Update the previous item of the next item
        }
      });
    }
  };


  /**
   * Function to focus on a specific project or conversation.
   * It updates the user profile with the last focused project or conversation ID.
   * @param type - The type of item to focus on ('focusProject' or 'focusConversation').
   * @param id - The ID of the item to focus on, or null to clear the focus.
   * @param bulkPayload - The bulk payload to be used for the focus operation.
   */
  const focusItem = (type: 'project' | 'conversation', id: string | null, bulkPayload: BulkPayload) => {

    let focusType: string | null = null;
    if (type === 'project') {
      focusType = 'focusProject';
    } else if (type === 'conversation') {
      focusType = 'focusConversation';
    }

    bulkPayload.ops.push({
      type: 'userProfile',
      operation: 'update',
      data: {
        id: states.userProfile.id as UserId,
        updatedFields: {
          [`${focusType}`]: id // Update the last project ID in the user profile //TODO update backend
        }
      }
    });
  }



  // /**
  //  * Function to handle the end of a drag and drop event for the DragDropContext - hello-pangea/dnd.
  //  * It updates the task or project chain based on the drag result.
  //  */
  // const onDragEnd: DragDropContextProps['onDragEnd'] = async (result: DropResult, navigate: any) => {
  //   // handle "task" type drag and drop
  //   if (result.type === 'task') {
  //     setTimeout(() => {
  //       setStates.setDraggedTask([]); // Reset the dragged task ID after a short delay to ensure the UI updates correctly
  //     }, 100);
  //     console.log('onDragEnd', result); // Log the drag result for debugging
  //     if (result.destination) { // If true, the task was dropped in a valid droppable area. If false, it means the task was dropped outside of a droppable area.
  //       const taskId = result.draggableId; // Get the ID of the dragged task
  //       const task = states.tasks[taskId]; // Find the task being dragged by its ID

  //       if (task) {
  //         const resultStatus = result.destination!.droppableId; // the status === droppableId, as defined in the TodoColumn component
  //         const payload = createBulkPayload(states); // Create a bulk payload for the update operation

  //         try {
  //           moveTask(taskId, resultStatus, result.destination!.index, payload);
  //           optimisticUIUpdate(setStates, payload); // Optimistically update the UI with the new task order
  //           postPayloadToServer('/api/bulk', navigate, payload); // Send the update to the server
  //         } catch (error) {
  //           console.error('Error updating task:', error);
  //           restoreBackup(setStates, payload);
  //         }



  //         //   const originTasks = Object.fromEntries(Object.entries(states.tasks)
  //         //     .filter(([id, t]) => t.status === originStatus &&
  //         //       t.projectId === task.projectId)); // Get all tasks in the result status
  //         //   const sortedOriginTasks = sortChain(originTasks);

  //         //   const resultTasks = Object.fromEntries(Object.entries(states.tasks)
  //         //     .filter(([id, t]) => t.status === resultStatus &&
  //         //       t.projectId === task.projectId)); // Get all tasks in the result status
  //         //   const sortedResultTasks = sortChain(resultTasks).filter(([id, t]) => id !== taskId); // Get all tasks in the result status except the dragged task

  //         //   const originPrevTask = task.prev;
  //         //   const originNextTask = task.next;
  //         //   const originIndex = sortedOriginTasks.findIndex(t => t[0] === result.draggableId); // Find the index of the task in the current status
  //         //   const resultIndex = result.destination!.index; // The index of the task in the destination status

  //         //   const resultPrevTask = sortedResultTasks[result.destination!.index - 1]?.[0] ?? null; // Get the previous task in the result status
  //         //   const resultNextTask = sortedResultTasks[result.destination!.index]?.[0] ?? null; // Get the next task in the result status


  //         //   console.log(`originStatus: ${originStatus}, resultStatus: ${resultStatus}`);
  //         //   console.log(`originIndex: ${originIndex}, resultIndex: ${resultIndex}`);

  //         //   if (resultStatus === originStatus && originIndex === resultIndex) {
  //         //     console.log('Task was moved within the same status and order, no changes made.');
  //         //     return;
  //         //   } else {
  //         //     const payloads = [{
  //         //       id: taskId, updatedFields: {
  //         //         prev: resultPrevTask,
  //         //         next: resultNextTask,
  //         //         status: resultStatus,
  //         //         previousStatus: originStatus
  //         //       }
  //         //     }] as { id: TaskId; updatedFields: Partial<TaskType> }[]; // Prepare payloads for batch update

  //         //     if (resultPrevTask) {
  //         //       payloads.push({ id: resultPrevTask, updatedFields: { next: taskId } }); // Update the previous task's next task to the dragged task
  //         //     }

  //         //     if (resultNextTask) {
  //         //       payloads.push({ id: resultNextTask, updatedFields: { prev: taskId } }); // Update the next task's previous task to the dragged task
  //         //     }

  //         //     if (originPrevTask) {
  //         //       payloads.push({ id: originPrevTask, updatedFields: { next: originNextTask } }); // Update the previous task's next task to the original task's next task
  //         //     }
  //         //     if (originNextTask) {
  //         //       payloads.push({ id: originNextTask, updatedFields: { prev: originPrevTask } }); // Update the next task's previous task to the original task's previous task
  //         //     }
  //         //     updateTasks(payloads);
  //         //   }
  //         // }


  //         // setTasks(draft => {
  //         //   const task = draft[result.draggableId]; // Find the task being dragged by its ID
  //         //   if (task) { // If the task was found and task was moved
  //         //     const originStatus = task.status;
  //         //     const resultStatus = result.destination!.droppableId; // the status === droppableId, as defined in the TodoColumn component

  //         //     // handle original and result task's previous and next tasks:

  //         //     // handle original task's previous and next tasks
  //         //     const originPrevTask = task.prev;
  //         //     const originNextTask = task.next;
  //         //     if (originPrevTask) { // If the original task is not the first task, update its previous task to the original's next task (skip the original task)
  //         //       draft[originPrevTask].next = originNextTask;
  //         //     }
  //         //     if (originNextTask) { // If the original task is not the last task, update its next task to the original's previous task (skip the original task)
  //         //       draft[originNextTask].prev = originPrevTask;
  //         //     }

  //         //     // handle result task's previous and next tasks and the dragged task
  //         //     const resultTasks = Object.fromEntries(Object.entries(draft)
  //         //       .filter(([id, t]) => t.status === resultStatus &&
  //         //         t.projectId === task.projectId &&
  //         //         id !== result.draggableId)); // Get all tasks in the result status
  //         //     const sortedTasks = sortChain(resultTasks);

  //         //     const resultPrevTask = sortedTasks[result.destination!.index - 1]?.[0] ?? null; // Get the previous task in the result status
  //         //     const resultNextTask = sortedTasks[result.destination!.index]?.[0] ?? null; // Get the next task in the result status

  //         //     if (resultPrevTask) { // If the result task is not the first task, handle A task and result task, [A(null), B(A)] -> [A(null), Result(A), B(Result)], B is handled in the next step
  //         //       draft[resultPrevTask].next = result.draggableId; // Update the previous task's next task to the dragged task
  //         //     }
  //         //     if (resultNextTask) { // If the result task is not the last task, handle B task and result task, [A(B), B(null)] -> [A(Result), Result(null), B(Result)], A is handled in the previous step
  //         //       draft[resultNextTask].prev = result.draggableId; // Update the next task's previous task to the dragged task
  //         //     }


  //         //     task.prev = resultPrevTask;
  //         //     task.next = resultNextTask;


  //         //     if (originStatus !== resultStatus) { // If the task's status has changed (i.e., it was moved to a different column)
  //         //       task.previousStatus = originStatus; // Save the previous status of the task before updating it
  //         //       task.status = resultStatus; // Update the task's status to the result status
  //         //     } // else do nothing
  //         //   }
  //         // });
  //       } else {
  //         // If the task was dropped outside of a droppable area
  //         // This is a placeholder for handling tasks dropped outside of valid areas
  //         // Do nothing for now
  //       }
  //       console.log('onDragEnd completed');
  //     }
  //   }


  //   // handle "project" type drag and drop
  //   if (result.type === 'project') {
  //     console.log('onDragEnd for project', result); // Log the drag result for debugging
  //     if (result.destination) { // Check if the destination is valid. If true, the project was dropped in a valid droppable area. If false, it means the project was dropped outside of a droppable area.
  //       const projectId = result.draggableId; // Get the ID of the dragged project
  //       const project = states.projects[projectId]; // Find the project being dragged by its ID
  //       if (project) { // If the project was found and project was moved

  //         const payload = createBulkPayload(states); // Create a bulk payload for the update operation

  //         try {
  //           moveItem('project', projectId, states.projects, result.destination!.index, payload);
  //           optimisticUIUpdate(setStates, payload); // Optimistically update the UI with the new project order
  //           postPayloadToServer('/api/bulk', navigate, payload); // Send the update to the server
  //         } catch (error) {
  //           console.error('Error updating project:', error);
  //           restoreBackup(setStates, payload); // Restore the previous state in case of an error
  //         }





  //         // if (originPrevProject) { // If the original task is not the first task, update its previous task to the original's next task (skip the original task)
  //         //   draft[originPrevProject].next = originNextProject;
  //         // }
  //         // if (originNextProject) { // If the original task is not the last task, update its next task to the original's previous task (skip the original task)
  //         //   draft[originNextProject].prev = originPrevProject;
  //         // }

  //         // // handle result task's previous and next tasks and the dragged task
  //         // const resultProjects = Object.fromEntries(Object.entries(draft)
  //         //   .filter(([id, t]) => id !== result.draggableId)); // Get all tasks in the result status
  //         // const sortedProjects = sortChain(resultProjects);

  //         // const resultPrevProject = sortedProjects[result.destination!.index - 1]?.[0] ?? null; // Get the previous project in the result status
  //         // const resultNextProject = sortedProjects[result.destination!.index]?.[0] ?? null; // Get the next project in the result status

  //         // if (resultPrevProject) { // If the result project is not the first project, handle A project and result project, [A(null), B(A)] -> [A(null), Result(A), B(Result)], B is handled in the next step
  //         //   draft[resultPrevProject].next = result.draggableId; // Update the previous project's next project to the dragged project
  //         // }
  //         // if (resultNextProject) { // If the result project is not the last project, handle B project and result project, [A(B), B(null)] -> [A(Result), Result(null), B(Result)], A is handled in the previous step
  //         //   draft[resultNextProject].prev = result.draggableId; // Update the next project's previous project to the dragged project
  //         // }

  //         // project.prev = resultPrevProject;
  //         // project.next = resultNextProject;
  //       }
  //     }
  //   }
  // };


  // /**
  //  * Function to handle the start of a drag and drop event for the DragDropContext - hello-pangea/dnd.
  //  * It sets the dragged task ID if the draggable type is 'task'.
  //  * Currently, it does not handle project dragging. Not implemented yet.
  //  */
  // const onDragStart: DragDropContextProps['onDragStart'] = (start) => {
  //   setStates.setDraggedTask([start.draggableId]); // Set the dragged task ID to the state
  //   //   if (start.type === 'task') {
  //   //     setStates.setDraggedTask([start.draggableId]);
  //   //   }
  //   //   if (start.type === 'project') {

  //   //   }

  //   //   // Store the previous droppable ID to handle drag updates.
  //   //   // Not in use. Stored here for future use.
  //   //   const prevDroppableId = useRef<string | null>(null);
  //   //   // Function to handle updates during a drag and drop event.
  //   //   // Not in use. Stored here for future use.
  // }
  // const onDragUpdate: DragDropContextProps['onDragUpdate'] = (update) => {
  //   //   const current = update.destination?.droppableId || null;
  //   //   if (current !== prevDroppableId.current) {
  //   //     if (prevDroppableId.current === '-1') { // exit delete-zone
  //   //       document.querySelectorAll(`#${update.draggableId}`).forEach(el => {
  //   //         // Remove the class indicating the draggable is over the delete area
  //   //       });
  //   //     }
  //   //     if (current === '-1') { // enter delete-zone
  //   //       document.querySelectorAll(`#${update.draggableId}`).forEach(el => {
  //   //         // Add a class to indicate the draggable is over the delete area
  //   //       });
  //   //     }
  //   //     if (prevDroppableId.current !== null && current === null) { // exit all Droppable
  //   //       // places to handle when the draggable is not over any droppable area
  //   //     }
  //   //     prevDroppableId.current = current;
  //   //   }
  // }
  // // Stored here for future use end.


  // // Define the actions that can be performed on tasks and projects.
  // // These actions will be passed down to the Todolist component.
  // // They include functions to add, update, delete tasks and projects, and refresh tasks.
  // // It is just convenient to put all the actions in one place.
  return {
    addItem,
    moveTask,
    focusItem,
    updateItem,
    moveItem,
    deleteItem,
    // onDragEnd,
    // onDragStart,
    // onDragUpdate,
  };
};

