import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notifications from '../schemas/Notification';
import Mail from '../../lib/Mail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  // incluir e validacao dos campos
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Falha na Validacao',
      });
    }

    const { provider_id, date } = req.body;

    if (req.userId === provider_id) {
      return res.status(401).json({
        error: 'Fornecedor nao pode agendar para si mesmo',
      });
    }

    // checar se ele é um provedor de servico

    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!checkIsProvider) {
      return res.status(401).json({
        error: 'Voce so pode agendar para fornecedores',
      });
    }
    //---------------------------------------------

    // check data valida
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: 'Data não permitida',
      });
    }

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'Data não disponivel' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });
    // pegar o nome do user
    const user = await User.findByPk(req.userId);
    // formatar a data
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:MM'h'",
      { locale: pt }
    );

    // Notificar o prestador de servico
    await Notifications.create({
      content: `Novo Agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
      ],
    });
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'Voce nao tem permissao pra cancelar esse agendamento',
      });
    }
    // diminiur 2 horas para check de cancelamento
    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'Voce só pode cancelar duas horas antes do seu agendamento',
      });
    }

    appointment.canceled_at = new Date();

    await Mail.sendMail({
      to: `${appointment.provider.name}<${appointment.provider.email}>`,
      subject: 'Agendamneto Cancelado',
      text: 'Voce tem um novo cancelamento',
    });

    await appointment.save();

    return res.json(appointment);
  }
}

export default new AppointmentController();
