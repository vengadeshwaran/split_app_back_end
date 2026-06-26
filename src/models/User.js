const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(User, {
        through: models.UserFriend,
        as: 'friends',
        foreignKey: 'user_id',
        otherKey: 'friend_id',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: 'Name is required' },
          notEmpty: { msg: 'Name cannot be empty' },
          len: { args: [1, 100], msg: 'Name must be between 1 and 100 characters' },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: { msg: 'Invalid email format' },
        },
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      color_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      preferred_currency: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Indian Rupee (₹)',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return User;
};
