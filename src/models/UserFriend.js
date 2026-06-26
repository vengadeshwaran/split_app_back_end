const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserFriend extends Model {}

  UserFriend.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      friend_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'UserFriend',
      tableName: 'user_friends',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return UserFriend;
};
