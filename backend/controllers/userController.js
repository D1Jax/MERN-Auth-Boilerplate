import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import User from '../models/userModel.js'

// @description Auth user/ set token
// route POST/api/users/auth
// @access PUBLIC

const authUser = asyncHandler( async (req, res) =>  {
 const { email, password } = req.body;

 const user = await User.findOne({email})

 if(user && await user.matchPassword(password)){
    generateToken(res, user._id)
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email:user.email
    });
   }else{
    res.status(401);
    throw new Error('Invalid email or password');
   }
});

// @description Register a new user
// route POST/api/users
// @access PUBLIC

const registerUser = asyncHandler( async (req, res) =>  {
   const { name, email, password } = req.body
  
   const userExists = await User.findOne({ email });

   if(userExists){
    res.status(400)
    throw new Error ('User already exists')
   }

   const user = await User.create({
    name,
    email,
    password
   });

   if(user){
    generateToken(res, user._id)
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email:user.email
    });
   }else{
    res.status(400);
    throw new Error('Invalid user data');
   }
   
 });

 // @description Logout user
// route POST/api/users/logout
// @access PUBLIC

const logoutUser = asyncHandler( async (req, res) =>  {
    res.cookie('jwt', '',{
        httpOnly:true,
        expires: new Date(0)
    })

    res.status(200).json({message: 'User logged Out'})
 });

// @description Get user profile
// route GET/api/users/profile
// @access Private

const getUserProfile = asyncHandler( async (req, res) =>  {
    const user ={
        _id: req.user._id,
        name:req.user.name,
        email: req.user.email
    }
    res.status(200).json(user)
 });

 // @description Update User Profile
// route PUT/api/users/profile
// @access Private

const updateUserProfile = asyncHandler( async (req, res) =>  {
const user = await User.findById(req.user._id);

if(user){
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    
    if(req.body.password){
        user.password = req.body.password
    }

    const updateUser = await user.save();

    res.status(200).json({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email
    })

}else{
    res.status(404);
    throw new Error('User not found')
}

 });


export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile
};