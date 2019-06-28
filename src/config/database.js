module.exports = {
  dialect: 'postgres',
  host: '0.0.0.0',
  port: '5433',
  username: 'postgres',
  password: 'docker',
  database: 'gobarber',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
