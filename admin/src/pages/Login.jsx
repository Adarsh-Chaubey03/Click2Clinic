'use-client'
import { useState,useContext } from 'react'
// import {assets} from '../assets/assets'
import {AdminContext} from '../context/AdminContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext.jsx'

const MailIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="3"/><path d="M3 6.5l9 7 9-7"/></svg>
);
const LockIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="8" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>
);
const UserIcon = () => (
  <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.5 3.5-4.5 8-4.5s8 2 8 4.5V21H4v-1z"/></svg>
);

const Login = () => {
  const [state,setState] = useState('Admin')
  const {setAToken,backendUrl} = useContext(AdminContext)
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const {setDToken} = useContext(DoctorContext)
  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      if(state === 'Admin'){
        const {data} = await axios.post(backendUrl + '/api/admin/login',{email,password})
        if(data.success){
          localStorage.setItem('aToken',data.token)
          setAToken(data.token)
        }else{
          toast.error(data.message)
        }

      }
      else{
        const {data} = await axios.post(backendUrl+'/api/doctor/login',{email,password})
        if(data.success){
          localStorage.setItem('dToken',data.token)
          setDToken(data.token)
          console.log(data.token)
        }else{
          toast.error(data.message)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fafdff] to-[#f3fafd] px-4 py-8">
      <form onSubmit={onSubmitHandler} className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 flex flex-col gap-6 items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-teal-400 flex items-center justify-center mb-2">
            <UserIcon />
          </div>
          <h2 className="text-2xl font-bold text-center">
            <span className="text-blue-600">{state}</span> Login
          </h2>
          <p className="text-gray-500 text-center -mt-3 mb-2">Welcome back! Please sign in to your account.</p>
          <div className="w-full text-left">
            <label className="block font-semibold mb-1">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><MailIcon /></span>
              <input 
              onChange={(e)=> setEmail(e.target.value)}
              value={email}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 bg-[#f3fafd] focus:outline-none focus:ring-2 focus:ring-blue-200 text-base placeholder-gray-400"
              type="email" required placeholder="Enter your email" />
            </div>
          </div>
          <div className="w-full text-left">
            <label className="block font-semibold mb-1">Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LockIcon /></span>
              <input 
              onChange={(e)=> setPassword(e.target.value)}
              value={password}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 bg-[#f3fafd] focus:outline-none focus:ring-2 focus:ring-blue-200 text-base placeholder-gray-400"
              type="password" required placeholder="Enter your password" />
            </div>
          </div>
          <button className="mt-2 w-full bg-gradient-to-r from-blue-600 to-teal-400 text-white py-2 rounded-lg text-lg font-semibold shadow hover:from-blue-700 hover:to-teal-500 transition-all">
            Sign In
          </button>
          <hr className="w-full my-2 border-gray-200" />
          <div className="text-center text-gray-500 text-base mt-2">
            {state === 'Admin'
            ? <>Doctor Login? <span className="text-blue-600 font-semibold underline cursor-pointer" onClick={()=> setState('Doctor')}>Click here</span></>
            : <>Admin Login? <span className="text-blue-600 font-semibold underline cursor-pointer" onClick={()=>setState('Admin')}>Click here</span></>
            }
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
