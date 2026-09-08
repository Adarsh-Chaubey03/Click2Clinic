import mongoose ,{ Schema } from "mongoose";

const hireDoctorSchema = new Schema({
name:{
    type:String,
    required:true
},
specialization:{
    type:String,
    required:true
},
experience:{
    type:Number,
    required:true
},
degree:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true
},
licenseNumber:{
    type:String,
    required:true
},
phone:{
    type:Number,
    required:true
},
address:{
    type:String,
    required:true
},
about:{
    type:String,
    required:true
},
photo:{
    type:String,
    required:true
},
status:{
    type:Boolean,
    default:true
}
})


const hireDoctorModel = mongoose.models.hireDoctor || mongoose.model('hireDoctor',hireDoctorSchema)

export default hireDoctorModel