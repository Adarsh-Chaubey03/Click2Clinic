// import React from 'react'

import { useState } from "react";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
const AddDoctor = () => {
  const [lattitude,setLattitude] = useState(null);
  const [longitude,setLongitude] = useState(null);
  const [docImg,setDocImg] = useState(false)
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [experience,setExperience] = useState('1 year')
  const [fees,setFees] = useState('')
  const [about,setAbout] = useState('')
  const [degree,setDegree] = useState('')
  const [address1,setAddress1] = useState('')
  const [address2,setAddress2] = useState('')
  const [speciality , setSpeciality] = useState('General physician')
  
  const {backendUrl,aToken} = useContext(AdminContext)


  const onSubmitHandler = async(e)=> {
    e.preventDefault();
    try {
      if(!docImg){
        return toast.error('Image not selected')
      }

      const formData = new FormData()

      formData.append('image',docImg)
      formData.append('name',name)
      formData.append('email',email)
      formData.append('lattitude',lattitude)
      formData.append('longitude',longitude)
      formData.append('password',password)
      formData.append('experience',experience)
      formData.append('fees',Number(fees))
      formData.append('about',about)
      formData.append('speciality',speciality)
      formData.append('degree',degree)
      formData.append('address',JSON.stringify({line1:address1,line2:address2}))

      //clg of form data
      // formData.forEach((value,key)=>{
      //   console.log(`${key} : ${value}`)
      // })

      const {data} = await axios.post(backendUrl + '/api/admin/add-doctor',formData,{headers:{aToken}})

      if(data.success){
        toast.success(data.message)
        setDocImg(false)
        setName('')
        setPassword('')
        setEmail('')
        setAddress1('')
        setAddress2('')
        setDegree('')
        setAbout('')
        setFees('')
        setLattitude(null)
        setLongitude(null)
      }else{
        toast.error(data.message)
      }


    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="w-full min-w-0 p-3 sm:p-5">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>
      <div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded border bg-white px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={docImg ? URL.createObjectURL(docImg)  : assets.upload_area}
              alt=""
            />
          </label>
          <input 
          onChange={(e)=>setDocImg(e.target.files[0])}
           type="file" id="doc-img" hidden />
          <p>
            Upload Doctor <br />
            picture
          </p>
        </div>

        <div className="flex flex-col items-start gap-6 text-gray-600 lg:flex-row lg:gap-10">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor name</p>
              <input
              onChange={(e)=> setName(e.target.value)}
              className="border rounded px-3 py-2"
               type="text" placeholder=" Name" value={name} required />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor email</p>
              <input
              onChange={(e)=> setEmail(e.target.value)} 
              className="border rounded px-3 py-2"
              type="email" value={email} placeholder=" Email" required />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Password</p>
              <input
              onChange={(e)=> setPassword(e.target.value)} 
              className="border rounded px-3 py-2"
              type="password" value={password} placeholder=" Password" required />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Experience</p>
              <select
              onChange={(e)=> setExperience(e.target.value)} 
              className="border rounded px-3 py-2"
              name="" value={experience} id="experience">
                <option value="1 year">1 year</option>
                <option value="2 year">2 year</option>
                <option value="3 year">3 year</option>
                <option value="4 year">4 year</option>
                <option value="5 year">5 year</option>
                <option value="6 year">6 year</option>
                <option value="7 year">7 year</option>
                <option value="8 year">8 year</option>
                <option value="9 year">9 year</option>
                <option value="10 year">10 year</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Fees</p>
              <input 
              onChange={(e)=> setFees(e.target.value)}
              className="border rounded px-3 py-2"
              type="number" value={fees} placeholder=" fees" required />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">

            <div className="flex-1 flex flex-col gap-1">
              <p>Speciality</p>
              <select
              onChange={(e)=> setSpeciality(e.target.value)} 
              className="border rounded px-3 py-2"
              name="" id="speciality" value={speciality}>
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Education</p>
              <input 
              onChange={(e)=> setDegree(e.target.value)}
              className="border rounded px-3 py-2"
              type="text" value={degree} placeholder=" Education" required />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Address</p>
              <input 
              onChange={(e)=> setAddress1(e.target.value)}
              className="border rounded px-3 py-2"
              type="text" value={address1} placeholder=" address 1" required />
              <input
              onChange={(e)=> setAddress2(e.target.value)} 
              className="border rounded px-3 py-2"
              type="text" value={address2} placeholder=" address 2" required />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Coordinates of location</p>
              <input 
              onChange={(e)=> setLattitude(e.target.value)}
              className="border rounded px-3 py-2"
              type="text" value={lattitude} placeholder=" lattitude" required />
              <input
              onChange={(e)=> setLongitude(e.target.value)} 
              className="border rounded px-3 py-2"
              type="text" value={longitude} placeholder=" longitude" required />
            </div>

          </div>
        </div>

        <div>
          <p className="mt-4 mb-2">About Doctor</p>
          <textarea 
          onChange={(e)=> setAbout(e.target.value)}
          className="w-full px-4 pt-2 border rounded"
          placeholder=" write about doctor" value={about} rows={5} required />
        </div>

        <button
        type="submit"
        className="bg-primary px-10 py-3 mt-4 text-white rounded-full"
        >Add doctor</button>
      </div>
    </form>
  );
};

export default AddDoctor;
