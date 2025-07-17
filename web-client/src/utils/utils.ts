import { th } from 'motion/react-client';
import type { TaskType, ProjectType, StatusType, BulkPayload, SetStates, TaskData, ProjectData, StatusData, States } from './type.ts';
import type { Updater } from 'use-immer';


/**
 * Sorts a chain of items based on their "prev" and "next" links.
 * @param chain - The chain of items to be sorted. Record<string, { prev: string | null; next: string | null; }> where each key is an item ID and the value contains item information including "prev" and "next" links.
 * @returns The sorted chain of items. [[ID, itemInfo], ...]
 * 
 * 整理一个链表数组，基于它们的 "prev" 和 "next" 链接。
 * @param chain - 需要被排序的链表数组。Record<string, { prev: string | null; next: string | null; }>，其中每个键是一个项目 ID，值包含项目信息，包括 "prev" 和 "next" 链接。
 * @returns 返回排序后的链表数组。[[ID, itemInfo], ...]
 */
export const sortChain = <T extends { id: string; prev: string | null; next: string | null }>(chain: Record<string, T>) => {
  const firstItem = Object.entries(chain).find(([_, chainInfo]) => chainInfo.prev === null)?.[0] ?? null;
  const sortedChain: [string, T][] = [];
  if (firstItem) {
    let index = 0;
    let currentItemID: string | null = firstItem;
    while (currentItemID) {
      const itemInfo: any = chain[currentItemID];
      sortedChain.push([currentItemID, itemInfo] as [string, T]);
      currentItemID = itemInfo.next;
      index++;
    }
    if (index !== Object.keys(chain).length) {
      console.warn(`sortChain: The chain is not complete. Expected ${Object.keys(chain).length} items, but found ${index} items.`);
    }
  }
  return sortedChain;
}


/** 
 * Creates a bulk payload for tasks, projects, and statuses.
 * 
 * 工厂函数，用于创建一个批量操作的payload对象。
 */
export const createBulkPayload = (): BulkPayload => {
  return {
    tasks: { new: [], update: [], delete: [] },
    projects: { new: [], update: [], delete: [] },
    statuses: { new: [], update: [], delete: [] },
    backup: { statuses: {}, tasks: {}, projects: {} } // Initialize backup as empty objects
  };
}

export const createBackup = (states: States, existingPayload: BulkPayload): BulkPayload => {
  return {
    ...existingPayload,
    backup: {
      statuses: states.statuses,
      tasks: states.tasks,
      projects: states.projects
    }
  };
}

export const restoreBackup = (setStates: SetStates, backupPayload: BulkPayload) => {
  setStates.setTasks(backupPayload.backup.tasks);
  setStates.setProjects(backupPayload.backup.projects);
  setStates.setStatuses(backupPayload.backup.statuses);
};


/**
 * Rebuilds a linked list array from a chain object.
 * It can remove items, insert new items, and rebuild the prev/next links.
 * Use for tasks, projects, or statuses, adding, moving and removing items.
 *  
 * @param chainObj - The chain object to be rebuilt. Record<string, T> where each key is an item ID and the value contains item information.
 * @param ItemsToRemove - An array of items T[] to be removed from the chain. Default is an empty array.
 * @param ItemsToAdd - An array of items T[] to be inserted into the chain. Default is an empty array.
 * @param insertIndex - The index at which to insert the new items.
 * @returns {updatedArray, addedItems, updatedItems, removedItems} - new repaired linked list array, added items array, updated, and removed items array.
 */
export function updateLinkedList<T extends { id: string; prev: string | null; next: string | null }>(
  chainObj: Record<string, T>,
  ItemsToRemove: T[] = [],
  ItemsToAdd: T[] = [],
  insertIndex: number | null = 0
): {
  updatedArray: T[],
  addedItems: T[],
  updatedItems: T[],
  removedItems: T[]
} {
  // 1. Chain to array
  let array = sortChain(chainObj).map(([_, item]) => ({ ...item })); // Convert to array and clone items to avoid mutation of original chain

  // 2. preserve old chain for later comparison
  const oldChain = Object.fromEntries(array.map(item => [item.id, { prev: item.prev, next: item.next }]));

  // 3. Remove items
  const removedItems: T[] = ItemsToRemove.filter(i => array.map(item => item.id).includes(i.id)); // Filter out items that are to be removed
  array = array.filter(item => !removedItems.map(i => i.id).includes(item.id)); // Filter out items that are to be removed

  // 4. Insert new items
  let AddedItems: T[] = [];
  if (ItemsToAdd.length > 0 && insertIndex !== null) { // If insertIndex is null, we will not insert new items
    AddedItems = ItemsToAdd.filter(i => array.map(item => item.id).includes(i.id) === false); // Filter out items that already exist in the array
    array.splice(insertIndex, 0, ...ItemsToAdd); // Insert new items at the specified index
  }

  // 5. Rebuild prev/next
  array.forEach((item, index) => {
    item.prev = index === 0 ? null : array[index - 1].id;
    item.next = index === array.length - 1 ? null : array[index + 1].id;
  });

  // 6. find all items that are going to be update (due to prev/next change)
  const updatedItems = array.filter(item => {
    const oldItem = oldChain[item.id];
    return !oldItem || oldItem.prev !== item.prev || oldItem.next !== item.next;
  });

  return { updatedArray: array, addedItems: AddedItems, updatedItems: updatedItems, removedItems: removedItems };
}

export const optimisticUpdateItems = (setMethod: Updater<TaskData> | Updater<ProjectData> | Updater<StatusData>, updatedArray: Array<TaskType | ProjectType | StatusType>) => { // TODO: fix any type
  setMethod((draft: any) => {
    Object.keys(draft).forEach(id => {
      delete draft[id]; // Clear all old tasks
    });
    updatedArray.forEach(item => {
      draft[item.id] = {
        ...item
      }
    });
  });
};