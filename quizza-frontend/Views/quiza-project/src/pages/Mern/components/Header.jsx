import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../../assets/navbar/assets'
import { AppContext } from '../context/AppContext'
import './nav.css'
const Header = () => {

  const {userData} = useContext(AppContext)
  const navigate = useNavigate();
  return (
    <div className='Header flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
      <img src={assets.header_img} className='w-36 h-36 rounded-full mb-6' />
      <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>Hey {userData?.name || 'Developer'}!
        <img src={assets.hand_wave} className='w-8 aspect-square' />
      </h1>
      <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to our application.</h2>
      <p className='mb-8 max-w-md'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi repudiandae quibusdam neque. </p>
      <button onClick={() => navigate("/quiz-list")} className='border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all pointer'>Get Started</button>
    </div>
  )
}

export default Header
