import { useState, useRef, useEffect } from 'react';
import { useImmer } from 'use-immer';
import './App.css';

import Todolist from './components/Todolist.tsx';
import ResetTestButton from './components/ResetTestButton.tsx';
import { DragDropContext } from '@hello-pangea/dnd';
import { loadAllData } from './data/loadInitData.ts'

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
    loadAllData().then((d) => {
      console.log("tasks loaded raw", d);
      setStates.setTasks(draft => {
        Object.assign(draft, d.taskData);
        console.log("tasks loaded", states.tasks);
      });
      setStates.setProjects(draft => {
        Object.assign(draft, d.projectData);
        console.log("projects loaded", states.projects);
      });
      setStates.setStatuses(draft => {
        Object.assign(draft, d.statusData);
        console.log("statuses loaded", states.statuses);
      });
      setStates.setUserProfile(draft => {
        draft.id = d.userProfileData.id; // Set a default user ID for testing
        draft.nickname = d.userProfileData.nickname; // Set a default nickname for testing
        draft.lastProjectId = d.userProfileData.lastProjectId; // Set a default last project ID for testing
        draft.avatarUrl = d.userProfileData.avatarUrl; // Set a default avatar URL for testing
        draft.language = d.userProfileData.language; // Set a default language for testing
      });
      console.log("user profile loaded", states.userProfile);
    }).catch((error) => {
      console.error('Error loading initial data:', error);
      // Optionally, you can load test data here if the initial data loading fails
      // loadTestTasks().then(tasks => setStates.setTasks(tasks));
      // loadTestProjects().then(projects => setStates.setProjects(projects));
      // loadTestStatuses().then(statuses => setStates.setStatuses(statuses));
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