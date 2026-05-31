import nodemailer from "nodemailer";

let transporter = null;

// Only create transporter if email credentials exist
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export const sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
  
  console.log("========================================");
  console.log("VERIFICATION EMAIL (would be sent to:", email);
  console.log("Verification link:", verificationUrl);
  console.log("========================================");
  
  // If email service is configured, actually send the email
  if (transporter) {
    const mailOptions = {
      from: `"FundMate" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email Address - FundMate",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FundMate</h1>
          </div>
          <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937;">Welcome, ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for registering with FundMate. Please click the button below to verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #2563eb, #1e40af); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 8px;
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Or copy and paste this link: <br/>
              <span style="color: #3b82f6;">${verificationUrl}</span>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This link will expire in 24 hours.
            </p>
          </div>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  console.log("========================================");
  console.log("WELCOME EMAIL (would be sent to:", email);
  console.log("Welcome,", name);
  console.log("========================================");
  
  if (transporter) {
    const mailOptions = {
      from: `"FundMate" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to FundMate!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FundMate</h1>
          </div>
          <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937;">Welcome to FundMate, ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Your email has been verified successfully. You can now log in and start your journey.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                 style="background: linear-gradient(135deg, #2563eb, #1e40af); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 8px;
                        display: inline-block;">
                Login to Your Account
              </a>
            </div>
          </div>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
};