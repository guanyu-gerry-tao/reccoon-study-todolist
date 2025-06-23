import { useState } from 'react'
import './App.css'

import Todolist from './components/Todolist.tsx'
import { DragDropContext } from '@hello-pangea/dnd'
import type { DragDropContextProps } from '@hello-pangea/dnd'

function App() {
  const [count, setCount] = useState(0)

  const onDragEnd: DragDropContextProps['onDragEnd'] = (result) => {
    console.log('onDragEnd', result);
    // Handle the drag end logic here
    // For example, update the task order based on the result
  }

  return (
    <DragDropContext
    onDragEnd={onDragEnd}>
      <div className='relative bg-[#fbfbfb] m-4 p-2 rounded-3xl [height:calc(100vh-2rem)]'>
        <Todolist />
        
      </div>
    </DragDropContext>
  )
}

export default App