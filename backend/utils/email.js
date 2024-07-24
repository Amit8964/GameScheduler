const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_EMAIL_PASS,
  },
});

const send_email = async (email, subject, content, attachment) => {
  try {
    let mail_options = {
      from: "xviper821@gmail.com",
      to: email,
      subject: subject,
      html: content,
    };
    if (attachment) mail_options.attachments = attachment;
    await transporter.sendMail(mail_options, (err, res) => {
      if (err) {
        throw err;
      }
    });

    return true;
  } catch (err) {
    throw err; // have to complete
  }
};

const send_template_email = async (to, subject, templateName, data) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates",
      `${templateName}.ejs`
    );
    console.log(templatePath, "checking the email template path");
    const html = await ejs.renderFile(templatePath, data);

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        throw err;
      }
    });

    console.log(`Email sent to ${to}`);
    return true;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  send_email,
  send_template_email,
};
