import type { TaskItem, ProjectItem } from './type.ts';


/**
 * Sorts a chain of items based on their "prev" and "next" links.
 * @param chain - The chain of items to be sorted. Record<string, { prev: string | null; next: string | null; }> where each key is an item ID and the value contains item information including "prev" and "next" links.
 * @returns The sorted chain of items. [[ID, itemInfo], ...]
 */
export const sortChain = (chain: Record<string, TaskItem | ProjectItem>) => {
    const firstItem = Object.entries(chain).find(([_, chainInfo]) => chainInfo.prev === null)?.[0] ?? null;
    const sortedChain: [string, TaskItem | ProjectItem][] = [];
    if (firstItem) {
        let currentItemID: string | null = firstItem;
        while (currentItemID) {
            const itemInfo: any = chain[currentItemID];
            sortedChain.push([currentItemID, itemInfo] as [string, TaskItem | ProjectItem]);
            currentItemID = itemInfo.next;
        }
    }
    return sortedChain;
}