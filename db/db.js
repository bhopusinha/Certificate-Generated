const mongoose=require('mongoose');

const connectDB=async()=>{
    try {
       const db= await mongoose.connect(process.env.DB);
        console.log(`databse is connected to ${db.connection.host}`);
    } catch (error) {
        console.log('Error while connecting DB');
    }
}

module.exports=connectDB;
