/**
 * Removes an item from a list and updates the list accordingly.
 * This function can not only handle deleting the item from the list,
 * but also can handle complete, as long as the item is removed from the list.
 * @param list - The list from which the item will be removed.
 * @param item - The item to be removed.
 * @param removeMethod - The method to remove the item.
 * @param updateMethod - The method to update the item.
 */
export const removeItemFromList = (list: any[], item: any, removeMethod: any, updateMethod: any) => {
    const index = list.indexOf(item);

    removeMethod(item[0]);
    list.splice(index, 1); // Remove the project from the projects array
    console.log(`called removeItemFromList, deleted item: ${item[1].title}, index: ${index}, list length: ${list.length}`);

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
    if (index === 0 && list.length > 0) {
        updateMethod(list[0][0], { prev: null });
        console.log(`Deleted the first project: ${item[1].title}, set its next project to null.`);
    }

    // if the last project is deleted, and there is still project left,
    // set the index===last project.next to null
    // index===length- is the previous one of the deleted project,
    // scenario 2, 5
    if (index === list.length && list.length > 0) {
        updateMethod(list[index - 1][0], { next: null });
        console.log(`Deleted the last project: ${item[1].title}, set its previous project to null.`);
    }

    // if the project is in the middle of the list,
    // set the previous project's next to the next project,
    // and the next project's prev to the previous project.
    // scenario 1
    if (index > 0 && index < list.length) {
        updateMethod(list[index - 1][0], { next: list[index][0] });
        updateMethod(list[index][0], { prev: list[index - 1][0] });
        console.log(`Deleted the project: ${item[1].title}, set its previous project's next to the next project and the next project's prev to the previous project.`);
    }

    // if the project was the only project in the list,
    // do nothing, as there is no next or previous project.
    // scenario 6
}

