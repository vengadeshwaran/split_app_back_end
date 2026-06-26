'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OtpVerification extends Model {}

  OtpVerification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      otp: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      hashed_password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      color_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'OtpVerification',
      tableName: 'otp_verifications',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return OtpVerification;
};
