const mongoose=require("mongoose");

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    service:{
        type:String,
        required:true
    },
    status:{
        type:String
        
    },
    updated:{
        type:String
       
    },
    follow:{
        type:String
       
    },
    followdate:{
        type:Date
       
    },
    createdAt: {
        type: Date
        
      }
})

const Ventureshelp=new mongoose.model("Ventureshelp",UserSchema);
module.exports=Ventureshelp;