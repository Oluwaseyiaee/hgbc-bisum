const nodemailer=require("nodemailer")
const Mailgen = require('mailgen');

const config={
     service: process.env.SERVICE,
    auth:{
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_PASS
        }
}

    
const sendEmail = async (option) => {
 const transporter = nodemailer.createTransport(config);
 // Initialize Mailgen with your options
const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Your product name or logo
        name: 'Higher Ground Baptist Church',
        link: option.link
    }
});
//generate mail
 const emailTemplate = mailGenerator.generate(option.html);
 let emailOptions = {
    from: process.env.COMPANY_EMAIL,
    to: option.email,
    subject: option.subject || 'Registered Successfully For BISUM 2024',
    html: emailTemplate
}
await transporter.sendMail(emailOptions);
};
    
module.exports = sendEmail;