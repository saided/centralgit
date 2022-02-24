const express = require('express');

const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const createError  = require('http-errors');
const cors = require('cors')
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/store')
.then(()=>{
    console.log('Db connected....');
})

app.use(cors({
    origin: "http://localhost:4200",
    credentials: true
})
)

const ProductRoute = require('./Routes/Products.route')
app.use(express.json())
app.use('/products',ProductRoute)
// app.get('/',(req,res,next)=>{
//     console.log(req.url);
//     console.log(req.method);
//     res.send("Hello dude")
// })

// app.get('/:sai',(req,res,next)=>{
//     console.log(req.url);
//     console.log(req.method);
//     console.log(req.params);
//     res.send(`Hello ${req.params.sai}`)
// })

// app.post('/create',(req,res,next)=>{
//     //console.log(req);
//     console.log(req.body);
//     res.send('creating .....')
// })
//To handle the invalid/not existing routes
// this throws an error
app.use(async(req,res,next)=>{
    next(createError.NotFound('Path does not exist'))
})

app.use((err,req,res,next)=>{
    res.status(err.status||500)
    res.send({
        error:{
            status:err.status||500,
            message:err.message
        }
    })
})
app.listen(3000,()=>{
    console.log('server is up');
})