const mongoose=require("mongoose");
//0.0.0.0:27017
const uri=process.env.MONGO_DB_URL;
mongoose.connect(uri,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("database connected");
}).catch((err)=>{
    console.log("database not connected"+err);
})