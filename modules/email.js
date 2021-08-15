const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const config = require('./../config');

module.exports = class Email {
  constructor (user, code) {
    this.to = user.email;
    this.firstName = user.name;
    this.code = code;
    this.from = config.email.user;
  }

  newTransport () {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'gmail',
      port: 25,
      secure: false,// true for 465, false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.pass
      },
      tls: {
        rejectUnauthorized: false
      },
      logger: true,
      debug: false,
    });
  }

  // send the actual email
  async send (template, subject) {
    // 1) Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      code: this.code,
      subject
    });
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
      // html:
    };

    // 3) Create a tranport and send email
    await this.newTransport().sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error.message);
      } else {
       // console.log('Send', response.response);
      }
    });
  }

  async sendWelcome () {
    await this.send('welcome', 'Welcome to Arab Security Cyber Wargames Family!');
  }

  async sendPasswordReset () {
    await this.send(
      'passwordReset',
      'Your Password reset code'
    );
  }
};