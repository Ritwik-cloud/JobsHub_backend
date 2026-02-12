const mongoose=require('mongoose');

const industrySchema=new mongoose.Schema({
    name:{type:String,required:true},
    normalized:{type:String,required:true,unique:true}
},{timestamps:true})

module.exports=mongoose.model('Industry',industrySchema);