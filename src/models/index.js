const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const User = require('./User')(sequelize, DataTypes);
const UserFriend = require('./UserFriend')(sequelize, DataTypes);
const OtpVerification = require('./OtpVerification')(sequelize, DataTypes);

const models = { User, UserFriend, OtpVerification };

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = { sequelize, ...models };
