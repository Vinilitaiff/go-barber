import Sequelize, { Model } from 'sequelize';
import { isBefore, parseISO, subHours } from 'date-fns';

class Appointment extends Model {
  static init(sequelize) {
    // INIT CHAMADO AUTOMATICAMENTE PELO SEQUELIZE
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(parseISO(this.date), new Date());
          },
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(parseISO(this.date), 2));
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    // com dois relacimamentos é preciso ter o 'as' (apelido)
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' }); // relaciomento com a tabela
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' }); // relaciomento com a tabela
  }
}

export default Appointment;
