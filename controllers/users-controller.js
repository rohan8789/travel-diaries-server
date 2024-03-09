const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');


const getAllUserDetails = async (req, res, next) =>{
    let users;
    try{
        users = await User.find({}, '-password -repassword -email');
    }catch(err){
        return res.status(500).json({message:"Fetching user failed, try again..."});
    }
    console.log(users);
    res.status(201).json({users:users.map((user)=>user.toObject({getters:true}))});
}








const registerUser = async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(404).json({message:"Enter correct credientials"});
    }
    const {name, email, password, repassword} = req.body;
    let existingUser;
    try{
        existingUser = await User.findOne({email:email});
    }catch(err){
        return res.status(500).json({message:"Sign-up failed. Try again..."});
    }

    if(existingUser){
        return res.status(422).json({message:"User already registered, Login instead"});
    }

    if(password !== repassword){
        return res.status(404).json({message:"Re-entered password did not match..."});
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password, 12);
    }catch(err){
        return res.status(500).json({message:"password encryption failed"});
    }

    const createdUser = new User({
      name, //as good as name: name
      email,
      image:req.file.path,
      password:hashedPassword,
      places: [],
    });
    try{
        await createdUser.save();
    }catch(error){
        return res.status(500).json({message: "failed to insert user details to db..."});
    }

    let token;
    try{
        token = jwt.sign(
          { userId: createdUser.id, email: createdUser.email },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1h" }
        );
    }catch(err){
        // console.log(err);
        return res.status(500).json({message:"Something went wrong while token creation in signup..."});
    }

    res
    .status(201)
    .json({message:"Registration Successful, Please Login...", userId:createdUser.id, email:createdUser.email, token:token});
};











const loginUser = async (req, res, next) => {
    // console.log(req.body);
    const {email, password} = req.body;
    let existingUser;
    try{
        existingUser = await User.findOne({email:email});
    }catch(err){
        return res.status(500).json({message:"Login failed..."});
    }
    if(!existingUser){
        return res.status(403).json({message:"User does not exist in our database"});
    }
    let isValidPassword=false;
    try{
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    }catch(err){
        return res.status(500).json({ message: "Invalid credientials" });
    }
    if(!isValidPassword){
        return res.status(403).json({message:"Invalid credientials"});
    }
    let token;
    try{
        token = jwt.sign({userId:existingUser.id, email:existingUser.email}, process.env.JWT_SECRET_KEY, {expiresIn:'1h'});
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Something went wrong while token creation in login..." });
    }
    console.log('we reached here');
    res.status(201).json({name:existingUser.name, userId:existingUser.id, email:existingUser.email, token:token });

};


module.exports = { registerUser, loginUser, getAllUserDetails};
