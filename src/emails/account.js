const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
   sgMail.send({
      to: email,
      from: 'onishchuck.alexander@gmail.com',
      subject: 'Thanks for joining in!',
      text: `Welcome to the app, ${name}. Let me know how you get along with the app`,
   });
};

const sendCancelationEmail = (email, name) => {
   sgMail.send({
      to: email,
      from: 'onishchuk.alexander@gmail.com',
      subject: 'Goodbye',
      text: `Good luck ${name}, is there anything we could've done to have kept you on board?`,
   });
};

module.exports = {
   sendWelcomeEmail,
   sendCancelationEmail,
};
