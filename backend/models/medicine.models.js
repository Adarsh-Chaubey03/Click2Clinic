import mongoose,{Schema} from 'mongoose'

const medicineSchema = new Schema({

name:{
    type:String,
    required:true,
    unique:true,
},
category:{
    type:String,
    required:true
},
price:{
    type:Number,
    required:true,
},
available:{
    type:Boolean,
    default:true
},
image:{
    type:String,
    required:true,
},
})

const medicineModel = mongoose.models.medicine || mongoose.model('medicine',medicineSchema)

export default medicineModel