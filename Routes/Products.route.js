const express = require('express')
const router = express.Router()
const Product  = require('../Models/Product.model')
const createError = require('http-errors')
const {authSchema} = require('../helpers/validation.schema')
const {signAccessToken,validateToken} = require('../helpers/jwt_helpwr')
const Joi = require('joi')
const bcrypt = require('bcryptjs')


router.get('/',validateToken,async(req,res,next)=>{
    console.log(typeof req.headers.authorization); //string
    console.log(req.headers.authorization.split(' ')[1]);// to getthe access token from req headers
    //we have verify if the token is valid or notbefore sending the response
    
    const result = await Product.find()
    res.send(result)
})

router.post('/register',async (req,res,next)=>{
    //const {name,pwd} = req.body;
    //console.log(name,pwd);
    try {
        console.log('validating user details');
        //if(!name || !pwd) throw createError.BadRequest('Name and password both are required')
        //First and foremost we have to validate the request i,e email and pawd are correct formator not
        const {name,password} = await authSchema.validateAsync({
            name:req.body.name,
            password:req.body.password
        })
        console.log(name,password);
        const existUser = await Product.find({name:name})
        if(existUser.length==0){
            console.log('creating user')
            const result = await Product.create({
                name:name,
                password:password
            })
            const accesstoken = await signAccessToken(name)
            res.send(accesstoken)
        }
        else{
                 next(createError.Conflict(`User with ${name} username alraedy exists`))
            }

    } catch (error) {
        //console.log(error);
        if(error.isJoi == true) error.status = 422
        next(error)
        
    }
    // console.log(validUser.name);
    // const existUser = await Product.find({name:validUser.name})
    // console.log(existUser.length);
    // if(existUser.length==0){
    //     console.log("creating user");
    //     try {
    //         const result = await Product.create({
    //             "name":validUser.name,
    //             "password":validUser.password
    //         })
    //         res.send(result)
    //     } catch (error) {
    //         next(error);
            
    //     }
        
    // }
    // else{
    //     next(createError.Conflict(`$User with {validUser.name} username alraedy exists`))
    // }

    //bcryt the password
})

router.get('/:id',async(req,res,next)=>{
    const id = req.params.id;
    const result = await Product.findById(id)
    res.send(result)
})

router.post('/login',async(req,res,next)=>{
    console.log(req.body);
    //const {name,password} = req.body;
    try {
        // check whether input format of pwd and user is valid or not
        const {name,password} = await authSchema.validateAsync({
            name:req.body.username,
            password:req.body.password
        })
        //if format is correct check for the user in database
        const isUser = await Product.findOne({name:name})
        //console.log(isUser==null);
        //If the user is not registered throw error
        if(isUser==null) throw (createError.NotFound(" username is not registered"));
        //if user exists now check whether entered pwd is correct or not with hashed pwd
        const isValidPassword = await bcrypt.compare(password,isUser.password)
        //console.log(isValidPassword);
        //if pwd is valid now generate tokens
        if(isValidPassword){
            console.log('Login successfull generating token');
            const token = await signAccessToken(name)
            res.send({token})
        }
        else{
            throw createError.Unauthorized("Inavlid username or password")
        }

        //res.send(isUser)
        
    } catch (error) {
        if(error.isJoi) return next(createError.BadRequest("Inavlid username or password"))
        next(error)
    }
})

module.exports = router