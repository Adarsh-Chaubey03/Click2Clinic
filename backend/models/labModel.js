import mongoose, { Schema } from 'mongoose'


const labSchema = new Schema({

testname:{
    type:String,
    required:true
},

price:{
    type:Number,
    required:true
},
category:{
    type:String,
    required:true
},
resultAt:{
    type:String,
    required:true
},
address:{
    type:String,
    required:true
},
contact:{
    type:Number,
    required:true
},
longitude:{
type:Number,
required:true,
},
latitude:{
type:Number,
required:true
},
isAvailable:{
type:Boolean,
required:true,
}

},{timestamps:true})

const labModel = mongoose.models.lab || mongoose.model('lab', labSchema);

export default labModel;