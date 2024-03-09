const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{
    if(req.method === 'OPTIONS')return next();
    try{
        // console.log('again stuck', req.headers);
        const token = req.headers.authorization.split(' ')[1];
        if(!token){
            return res.status(401).json({message:"Unauthenticated access"});
        }
        const decodedToken=jwt.verify(token, process.env.JWT_SECRET_KEY);
        // console.log('this is decoded access ',decodedToken);
        req.userData = {userId:decodedToken.userId};
        next();
    }catch(err){
        console.log(err)
        return res.status(403).json({ message: "Unauthenticated access" });
    }
}