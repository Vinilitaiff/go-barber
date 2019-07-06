import nodemailer from 'nodemailer';
import { resolve } from 'path'; // indicar um diretorio de template de email
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';
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

    this.configureTemplates();
  }

  configureTemplates() {
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    this.transporter.use(
      'compile', // compile do nodemailer = compilar os templates de emails
      nodemailerhbs({
        // params dentro da doc do nodemailer
        viewEngine: exphbs.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }

  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message,
    });
  }
}

export default new Mail();
