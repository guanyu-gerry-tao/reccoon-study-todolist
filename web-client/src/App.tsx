import { useState } from 'react'
import './App.css'

import Todolist from './components/Todolist.tsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='relative bg-[#fbfbfb] m-4 p-2 rounded-3xl [height:calc(100vh-2rem)]'>
        <Todolist />
        
      </div>
    </>
  )
}

export default App