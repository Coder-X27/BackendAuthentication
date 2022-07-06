const express =require("express")
const User=require('../models/User')
const router=express.Router()
const {body,validationResult}= require('express-validator')
const bcrypt=require('bcryptjs')
const jwt=require("jsonwebtoken")
const JWT_SECRET="karanisagoodb$oy"
const fetchuser=require('../middleware/fetchuser')

// ROUTE 1 TO create a user The endpoint is localhost:/5000/api/auth/createuser

router.post('/createuser',[
    body('name',"Enter a valid Name").isLength({min:3}),
    body('email',"Enter a valid Email").isEmail(),
    body('password').isLength({min:5}),
],async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        
        let user=await User.findOne({email:req.body.email})
        if (user){
            return res.status(400).json({error:"Sorry a user with this email already exist."})
        }
        const salt=await bcrypt.genSalt(10)
        const secPass=await bcrypt.hash(req.body.password,salt)
        user=await User.create({
            name:req.body.name,
            email:req.body.email,
            password:secPass
        })
        const data={
            user:{
                id:user.id
            }
        }
        const authtoken=jwt.sign(data,JWT_SECRET)
        res.json({authtoken})
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some Error Occured")
    }
})


// ROUTE 2 TO login the user with the credentials The endpoint is localhost:/5000/api/auth/login

router.post('/login',[
    body('email',"Enter a valid Email").isEmail(),
    body('email',"Password cannot be blank").exists()
],async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {email,password}=req.body
    try {
        let user=await User.findOne({email})
        if(!user){
            return res.status(400).json({error:"Please try to log in with correct credentials"})
        }
        const passwordCompare=await bcrypt.compare(password,user.password)
        if(!passwordCompare){
            return res.status(400).json({error:"Please try to log in with correct credentials"})
        }
        const data={
            user:{
                id:user.id
            }
        }
        const authtoken=jwt.sign(data,JWT_SECRET)
        res.json({authtoken})
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some Error Occured")
    }
})
// ROUTE 3 TO give details of the logeed in user The endpoint is localhost:/5000/api/auth/getuser
router.post('/getuser',fetchuser,async(req,res)=>{
    try {
        userId=req.user.id
        const user=await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some Error Occured")
    }
})

module.exports=router