import Sequelize, { Model } from 'sequelize';

class Appointment extends Model {
  static init(sequelize) {
    // INIT CHAMADO AUTOMATICAMENTE PELO SEQUELIZE
    super.init(
      {
        date: Sequelize.STRING,
        canceled_at: Sequelize.STRING,
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
