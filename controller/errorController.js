const customError = require("../utils/customError");
const prodError=(res,error)=>{
    if(error.isOperational){
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
         })
    }else{
        res.status(500).json({
            status: 'error',
            message: error.message || 'Something went wrong, please try to re-login....!'
         })
    }
}
const devError=(res,error)=>{
    console.log(error)
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error: error
     })
}
const castErrorHandler=(err)=>{
    const msg='Failed to give Devon access to this user account';
    return new customError(msg,500);
}
const googleApiError=(err)=>{
    const msg=`Invalid value for ${err.path} : ${err.value}`;
    return new customError(msg,400);
}

const duplicateKeyError=(err)=>{
    const msg=`The model already exist, make changes and try again.`;
    return new customError(msg,400);
}
const validatorError=(err)=>{
    const msg=err.message;
    return new customError(msg,400);
}
const tokenExpiredError=(err)=>{
    const msg=err.message;
    return new customError(msg,400);
}
const JsonWebTokenError=(err)=>{
    const msg="You do not have a session token, login or sign up to access page";
    return new customError(msg,400);
}
const documentNotFoundError=(err)=>{
    return new customError('Document not found', 404)
}
const ENOTFOUNDERROR=(err)=>{
    return  new customError('Failed to delete resource, due to bad network connection', 404);
}
const FileLimitSizeError=(err)=>{
    return new customError('File size is too large. Maximum allowed size is 450kb.', 400);
}
const GooGLEAPIERROR2=(err)=>{
    return new customError('Failed to obtain access token from your google account, try again later...', 500);
}
const ERR_ASSERTION=(err)=>{
    return new customError('Failed to process request...', 500);
}
const globalErrorController=(error,req,res,next)=>{
    error.statusCode=error.statusCode || 500;
    error.status=error.status || 'error';
    if(process.env.NODE_ENV === 'development'){
        devError(res,error);
    }else if(process.env.NODE_ENV==='production'){
        if(error.name==='CastError'){
           error = castErrorHandler(error);
        }
        if(error.code===11000){
            error = duplicateKeyError(error);
        }
        if(error.name==='ValidationError'){
            error=validatorError(error)
        }       
        if(error.name==='TokenExpiredError'){
            error=tokenExpiredError(error)
        }
        if(error.name==='JsonWebTokenError'){
            error=JsonWebTokenError(error)
        }
        if (error.code === 'ENOTFOUND') {
            error=ENOTFOUNDERROR(error)
        }
        if (error.name === 'DocumentNotFoundError') {
            error=documentNotFoundError(error)
        }
        if (error.code === 'LIMIT_FILE_SIZE') {
            error=FileLimitSizeError(error)
        }
        if (error.code === 'invalid_grant') {
            error=googleApiError(error)
        }
        if (error.InternalOAuthError==="InternalOAuthError") {
            error=GooGLEAPIERROR2(error)
        }
        if(error.code==='ERR_ASSERTION'){
            error=ERR_ASSERTION(error);
        }
        prodError(res,error);
    }
     next();
}
module.exports = globalErrorController;
