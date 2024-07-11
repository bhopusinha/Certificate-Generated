const express=require('express');
const app=express();
const dotenv=require('dotenv');
const bodyParser=require('body-parser');
const cors=require('cors');
const path=require('path');

// route
const certificateRoute=require('./routers/certificateRoute');

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

dotenv.config();

// connect DB
require('./db/db')();



const PORT=process.env.PORT || 4000;

app.use('/certificates',certificateRoute);

app.use(express.static(path.join(__dirname,'./frontend/dist')))

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'./frontend/dist/index.html'));
})

app.listen(PORT,()=>{
    console.log(`server is live on http://localhost:${PORT}`);
})