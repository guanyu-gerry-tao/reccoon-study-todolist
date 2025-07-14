import type { TaskType, ProjectType, StatusType } from '../components/type.ts';


/**
 * Sorts a chain of items based on their "prev" and "next" links.
 * @param chain - The chain of items to be sorted. Record<string, { prev: string | null; next: string | null; }> where each key is an item ID and the value contains item information including "prev" and "next" links.
 * @returns The sorted chain of items. [[ID, itemInfo], ...]
 */
export const sortChain = (chain: Record<string, TaskType | ProjectType | StatusType>) => {
    const firstItem = Object.entries(chain).find(([_, chainInfo]) => chainInfo.prev === null)?.[0] ?? null;
    const sortedChain: [string, TaskType | ProjectType | StatusType][] = [];
    if (firstItem) {
        let index = 0;
        let currentItemID: string | null = firstItem;
        while (currentItemID) {
            const itemInfo: any = chain[currentItemID];
            sortedChain.push([currentItemID, itemInfo] as [string, TaskType | ProjectType | StatusType]);
            currentItemID = itemInfo.next;
            index++;
        }
        if (index !== Object.keys(chain).length) {
            console.warn(`sortChain: The chain is not complete. Expected ${Object.keys(chain).length} items, but found ${index} items.`);
        }
    }
    return sortedChain;
}