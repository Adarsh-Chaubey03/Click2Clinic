import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import LaboratoryOverview from '../components/LaboratoryOverview'
import DiseaseOverview from '../components/DiseaseOverview'
import HireDoctorBanner from '../components/HireDoctorBanner'

export default function Home() {
  return (
    <>
    <Header/>
    <SpecialityMenu/>
    <TopDoctors/>
    <Banner/>
    <LaboratoryOverview/>
    <DiseaseOverview/>
    <HireDoctorBanner/>
    </>
  )
}
