const express=require("express"),
      multer=require("multer"),
      Photizo=require("../model/photizo"),
      sendMail=require("../utils/mail")
      const memoryStorage = multer.memoryStorage();
const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit, adjust as necessary
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            req.flash('error', 'Please upload an image file.');
            return cb(null, false, new Error('Only images are allowed'));
        }
        cb(null, true);
    }
});

const router = express.Router();
router.route("/").get((_,res)=>{
  res.render('index',{});
})
router.route("/register").get((_,res)=>{
    res.render("form",{})
})
router.route("/admin/UrO89GZnBXTuVToc/tomS6CdYNFXuIJhXCKdoOCbYSA=/table/:admin").get(async(_,res)=>{
    const photizoUser= await Photizo.find();
    res.render("table",{photizoUser})
})
router.route("/register").post(upload.single('file'),async(req,res,next)=>{
    if(!req.file){
     req.flash('error','Please upload your receipt image.');
     return res.status(400).redirect('/bisum/register');
    } 
    if (req.file.size > 1048576) {
        req.flash('error', 'Image size exceeds 1MB limit.');
        return res.status(400).redirect('/bisum/register');
    }
    try{
        const photoBuffer = req.file.buffer; // Get the uploaded image buffer
        // Convert image buffer to base64
        const photoData = photoBuffer.toString('base64');
        const newBody={...req.body,...{photo: `data:image/png;base64,${photoData}`}}
        const checkEmail=await Photizo.findOne({email: req.body.email});
        if(checkEmail){
            //update the details of this user
            const updatedUser=await Photizo.findByIdAndUpdate(checkEmail._id,newBody,{new: true,runValidators: true})
            if(updatedUser){
                const mail = {
                        body: {
                            greeting: `Hello,${updatedUser.lastName} ${updatedUser.firstName}`,
                            intro: `Your details has successfully been updated,thanks for joining us.\n\nYour serial number remains the same : ${updatedUser.serialNo}`,
                            outro: 'If you have any questions or need assistance, feel free to reach out to us/mail this email.'
                        }
                    };
        
                    await sendMail({
                        email: updatedUser.email,
                        html: mail,
                        link: `${req.protocol}://${req.hostname}/`,
                        subject: `You have successfully updated your details.`
                    });  
                    req.flash('success',`${updatedUser.lastName} ${updatedUser.firstName} has successfully updated his/her Bisum 2024 details.`);
                    return res.redirect('/bisum');
            }
        }else{
        const photizoUser=await Photizo.create(newBody);
        if(photizoUser){
          const mail = {
                body: {
                    greeting: `Hello,${photizoUser.lastName} ${photizoUser.firstName}`,
                    intro: `Welcome to Bisum 2024!\n\nThank you for joining us. We're excited to have you on board\n\nYour serial number is ${photizoUser.serialNo}`,
                    outro: 'If you have any questions or need assistance, feel free to reach out to us/mail this email.'
                }
            };

              await sendMail({
                email: photizoUser.email,
                html: mail,
                link: `${req.protocol}://${req.hostname}/`
              });  
            req.flash('success',`${photizoUser.lastName} ${photizoUser.firstName} have successfully registered for Bisum 2024.`);
            return res.redirect('/bisum');
        }
     }
    }catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.log(err);
        }
        next(err); // Pass errors to centralized error handler
    }
})

// Centralized error handling middleware
router.use((err, req, res,next) => {
    let msg;
    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            req.flash('error', 'The uploaded file exceeds the 1MB size limit.');
            return res.status(400).redirect('/bisum/register');
        } else {
            req.flash('error', `File upload error: ${err.message}`);
            return res.status(400).redirect('/bisum/register');
        }
    }else if (err.name === 'CastError') {
        msg = `The provided value for "${err.path}" is invalid. Please double-check your input.`;
        req.flash('error', msg);
        return res.status(400).redirect('/bisum/register');

    } else if (err.code === 11000) {
        const field = err.keyValue.name || err.keyValue.email;
        msg = `A user with this ${field ? `value for "${field}"` : 'information'} already exists. Please use a different one.`;
        req.flash('error', msg);
        return res.status(400).redirect('/bisum/register');
    } else if (err.name === 'ValidationError') {
        const fieldErrors = Object.values(err.errors).map(error => {
            // Create friendly messages based on validation type
            if (error.kind === 'minlength') {
                return `The ${error.path} must be at least ${error.properties.minlength} characters.`;
            } else if (error.kind === 'maxlength') {
                return `The ${error.path} cannot exceed ${error.properties.maxlength} characters.`;
            } else if (error.kind === 'required') {
                return `The ${error.path} is required.`;
            } else {
                return `Invalid value for ${error.path}. Please review your input.`;
            }
        });
        // Join all error messages for fields, if multiple exist
        msg = fieldErrors.join(' ');
        req.flash('error', msg);
        return res.status(400).redirect('/bisum/register');
    } else if (err.name === 'TokenExpiredError') {
        msg = `Your session has expired. Please refresh the page and try again.`;
        req.flash('error', msg);
        return res.status(400).redirect('/bisum/register');

    } else if (err.name === 'JsonWebTokenError') {
        msg = `There was an issue with your session. Please try logging in again.`;
        req.flash('error', msg);
        return res.status(400).redirect('/bisum/register');
    } else {
        msg = err.message || 'Something went wrong. Please try again later.';
        req.flash('error', msg);
        return res.status(500).redirect('/bisum/register');
    }
});

module.exports = router