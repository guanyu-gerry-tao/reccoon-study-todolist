import '../App.css';
import './Todolist.css';
import './TaskDropArea.css';

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import AIChatPanel from './AIChatPanel.tsx'

import type { TaskItem , Actions, Projects, UserStatus, ProjectItem } from './type.ts'
import { useImmer } from 'use-immer'
import TaskDropArea from './TaskDropArea.tsx'


function Todolist({tasks, projects, userStatus, actions, draggedTask}: 
  {tasks: TaskItem[], projects: ProjectItem[], userStatus: UserStatus, actions: Actions, draggedTask: [string] | null } ) {

  const [currentProjectID, setCurrentProjectID] = useImmer<string>(userStatus.project);
  const [isDeletedTaskClicked, setIsDeletedTaskClicked] = useImmer<boolean>(false);
  const [isCompletedTaskClicked, setIsCompletedTaskClicked] = useImmer<boolean>(false);
  const [isMouseOverDropZone, setIsMouseOverDropZone] = useImmer(false);

  return (
    <>

      <div className='dropArea completeDropArea'>
        <TaskDropArea status={0} setIsMouseOverDropZone={setIsMouseOverDropZone} />
        <div className='dropAreaVisual completeDropArea'
          style={{ opacity: isMouseOverDropZone ? '1' : '0', transform: isMouseOverDropZone ? 'translateX(0)' : 'translateX(-150%)' }}
        >
          <p>Drop to Complete</p>
        </div>
      </div>
      <div className='dropArea deleteDropArea'
      >
        <TaskDropArea status={-1} setIsMouseOverDropZone={setIsMouseOverDropZone} />
        <div className='dropAreaVisual deleteDropArea'
          style={{ opacity: isMouseOverDropZone ? '1' : '0.5', transform: isMouseOverDropZone ? 'translateX(0)' : 'translateX(-150%)' }}
        >
          <p>Drop to Delete</p>
        </div>
      </div>


      <div className='todolistContainer'>
          <Menubar actions={actions} draggedTask={draggedTask} projects={projects} currentProjectID={currentProjectID} setCurrentProjectID={setCurrentProjectID} isMouseOverDropZone={isMouseOverDropZone} />


        <div className='todolistColumns'>
          {/* 在这里添加已经删除和已经完成的任务列 */}


          <TodoColumn title={"Completed"} 
          bgColor='#e8fdec' 
          status={0} 
          actions={actions} 
          tasks={tasks.filter(task => task.status === 0 && task.project === currentProjectID)} 
          currentProjectID={currentProjectID}
          />
          
          <TodoColumn title={"Deleted"} 
          bgColor='#f0f1fd' 
          status={-1} 
          actions={actions} 
          tasks={tasks.filter(task => task.status === -1 && task.project === currentProjectID)} 
          currentProjectID={currentProjectID}
          />

          <TodoColumn title={"Now"} 
          bgColor='#e8fdec' 
          status={1} 
          actions={actions} 
          tasks={tasks.filter(task => task.status === 1 && task.project === currentProjectID)} 
          currentProjectID={currentProjectID}
          />
          
          <TodoColumn title={"Next"} 
          bgColor='#f0f1fd' 
          status={2} 
          actions={actions} 
          tasks={tasks.filter(task => task.status === 2 && task.project === currentProjectID)} 
          currentProjectID={currentProjectID}
          />
          
          <TodoColumn title={"Later"} 
          bgColor='#fff8e8' 
          status={3} 
          actions={actions} 
          tasks={tasks.filter(task => task.status === 3 && task.project === currentProjectID)} 
          currentProjectID={currentProjectID}
          />
          </div>
      
      <div className='todolistRightPanel'>
        <AIChatPanel />
      </div>

      </div>

      

    </>
  )
}

export default Todolist