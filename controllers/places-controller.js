const {validationResult} = require('express-validator');
const d = require('uuid');

const getCordFromAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');

const uuid = d.v4;





const getPlaceByPlaceId = async (req, res, next) => {
  // console.log(req.params);
  let placeId = req.params.placeId;
  let pid_details;
  try{
    pid_details = await Place.findById(placeId);
  }catch(error){
    return res.statuse(404).json({message:"could not find place by provided id"});
  }
  // console.log(pid_details);
  if (!pid_details) {
    return res.status(404).json({ error: "No place found by placeId" });
  }
  res.json({ place: pid_details.toObject({getters:true})});
};








const getPlacesByUserID = async (req, res, next) => {
  let userId = req.params.userId;
  let user;
  // console.log(userId);
  let places;
  try{
    places = await Place.find({creatorId:userId});
    user = await User.findById(userId);
  }catch(error){
    return res.status(404).json({message:"could not find place by provided user id"});
  }

  if (!places) {
    return res.status(404).json({ message: "No user places exist by this user id" });
  }
  let name=null;
  if(user)name = user.name;
  // console.log(places);
  res.json({user:name===null? 'you': user.name, places: places.map((place)=>place.toObject({getters:true}))});
};










const createPlace = async(req, res, next) => {
  const error = validationResult(req);
  if(!error.isEmpty()){
    return res.json({message:"can not register data without user input"});
  }
  console.log(req.body);
  const {title, description, address, creatorId} = req.body;
  let coordinates;
  try{
    coordinates = await getCordFromAddress(address);
  }catch(error){
    console.log(error.message);
    return res.status(404).json({message:"Error while fetching coordinates from address..."});
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    image: req.file.path,
    location: coordinates,
    creatorId,
  });

  let user;
  try{
    user = await User.findById(creatorId);
  }catch(err){
    return res.status(400).json({ message: "Creating a place failed..." });
  }
  if(!user){
    return res.status(400).json({ message: "User with this uid does not exist..." });
  }

  // console.log(user);//prints whole document.
  // console.log(createdPlace);
  try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session:sess});
    user.places.push(createdPlace);
    await user.save({session:sess});
    await sess.commitTransaction();
  }catch(error){
    console.log(error);
    return res.status(400).json({message:"Creating a place in failed in try-catch..."});
  }
  res.status(201).json({place:createdPlace});
}











const updatePlace = async (req, res, next)=>{
  const error  = validationResult(req);
  if(!error.isEmpty()){
    res.status(401).json({error:"Please enter required details to update..."});
  }
  // console.log(req.body);
  const {title, description} = req.body;
  const placeId = req.params.placeId;
  let place;
  try{
    place = await Place.findById(placeId);
  }catch(error){
    return res.status(500).json({message:"could not fetch Place by placeId"})
  }

  console.log(place.creatorId.toString(), req.userData.userId);
  if(place.creatorId.toString() !== req.userData.userId){
    return res.status(401).json({message:"Un-authorized access"});
  }



  place.title = title;
  place.description = description;
  try{
    await place.save();
  }catch(error){
    return res.status(500).json({message:"failed to save the updated data into the database..."});
  }
  res.status(200).json({place: place.toObject({getters:true})});
}














const deletePlace = async (req, res, next)=>{
  const placeId = req.params.placeId;
  let place;
  try{
    place=await Place.findById(placeId).populate('creatorId');
  }catch(error){
    return res.status(500).json({message:"Something went wrong while deleting plsce"});
  }

  if(!place){
    return res.status(400).json({message: "Could not find place to delete by place id"});
  }
  
  if(place.creatorId.id  !== req.userData.userId){
    return res.status(401).json({message:"Un-authorized access..."});
  }

  try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({session:sess});
    place.creatorId.places.pull(place); //not (placeId); check notes...
    await place.creatorId.save({session:sess});
    sess.commitTransaction();
  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Could not delete place..."});
  }
  console.log('hii');
  // console.log(place);
  res.status(200).json({message:'place deleted...'});
}

module.exports = {getPlaceByPlaceId, getPlacesByUserID, createPlace, updatePlace, deletePlace};
