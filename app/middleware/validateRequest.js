
const validateRequest=(schema)=>{
return (req,res,next)=>{
    const { error, value } = schema.validate(req.body, { abortEarly: false});
    if(error){
        console.log(error);
        const errorMsg=error.details.map((detail)=>detail.message);
        return res.status(400).json({
            status:false,
            message:errorMsg
        })
    }
    req.body=value;
    return next();
}
}

module.exports=validateRequest;