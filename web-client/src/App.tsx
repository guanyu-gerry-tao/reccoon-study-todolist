import { useState, useRef, useEffect } from 'react';
import { useImmer } from 'use-immer';
import './App.css';

import Todolist from './components/Todolist.tsx';
import ResetTestButton from './components/ResetTestButton.tsx';
import { DragDropContext } from '@hello-pangea/dnd';
import { loadTestTasks, loadTestProjects, loadTestUserProfile, loadTestStatuses } from './data/loadInitData.ts'

import { createStatesAndSetStates } from './utils/states.ts';
import { createActions } from './utils/actions.ts';

import { AppContext } from './components/AppContext.tsx';

/**
 * Main application component.
 * This component initializes the application state and handles task and project management.
 * It provides functions to add, update, delete tasks and projects, and manages the drag-and-drop functionality.
 */
function App() {

  // Initialize states and actions using custom hooks
  const [states, setStates] = createStatesAndSetStates();
  const actions = createActions(states, setStates);
  const appContextValue = { states, setStates, actions };

  useEffect(() => {
    loadTestTasks().then((d) => {
      console.log("tasks loaded raw", d);
      setStates.setTasks(draft => {
        Object.assign(draft, d);
      });
    });
  }, []);

  // Note: The DragDropContext component is used to wrap the entire application to enable drag-and-drop functionality.
  // It provides the necessary context for drag-and-drop operations.
  // The onDragEnd, onDragStart, and onDragUpdate functions are passed as props to handle the drag-and-drop events.
  // The Todolist component is the main component that displays the tasks and projects.
  // It receives the tasks, projects, user status, actions, and dragged task as props.
  return (
    <AppContext.Provider value={appContextValue}>
      <DragDropContext
        onDragEnd={actions.onDragEnd} onDragStart={actions.onDragStart} onDragUpdate={actions.onDragUpdate}>
        <Todolist />
      </DragDropContext>
    </AppContext.Provider>
  )
}
export default App