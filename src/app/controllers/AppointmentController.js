import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';

class AppointmentController {
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
        date: hourStart, // provavel erro == hourStart
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

    return res.json(appointment);
  }
}

export default new AppointmentController();
