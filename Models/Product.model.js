const express  = require('express');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

const ProductSchema = new schema(
    {
        name:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        date: { type: Date, default: Date.now }
    }
)
//Mongoose middlewre to hash password before storing in the db
ProductSchema.pre('save',async function (){
    console.log("Before storing...");
    try {
        console.log(this.name,this.password)
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password,salt)
        this.password = hashedPassword
    } catch (error) {
        next(error)
        
    }

})

ProductSchema.methods.validPassword = async function(password){
    try {
        console.log(password);
       return await bcrypt.compare(password,this.password)
    } catch (error) {
        throw error
    }
}
const Product  = mongoose.model('product',ProductSchema)
module.exports = Product