import mongoose from "mongoose";

 const db_connect=async function db_connect(){
    const db=await mongoose.connect("mongodb+srv://dulesh:Dulesh%40123@cluster0.wqjb6kj.mongodb.net/Brainly")
    if(db){
        console.log("db connected succesfully")
    }else{
        console.log("unable to connect to db")
    }
}

export default db_connect;