import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';

class Mail {
  constructor() {
    const { host, post, secure, auth } = mailConfig;

    this.transporter = nodemailer.createTransport({
      host,
      post,
      secure,
      auth: auth.user ? auth : null, // algumas nao precisa de autenticacao
    });
  }

  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message,
    });
  }
}

export default new Mail();
