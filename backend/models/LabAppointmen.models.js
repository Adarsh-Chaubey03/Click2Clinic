import mongoose, { Schema } from 'mongoose'

const labAppointmentSchema = new Schema({
userData:{
    type:Object,
    required:true,
},
labData:{
    type:Object,
    required:true,
},
payment:{
type:Boolean,
default:false
},
isCancelled:{
    type:Boolean,
    default:false
},
isCompleted:{
    type:Boolean,
    default:false
}
},{timestamps:true})

const labAppointmentModel = mongoose.models.labAppointment || mongoose.model('labAppointment', labAppointmentSchema);

export default labAppointmentModel;