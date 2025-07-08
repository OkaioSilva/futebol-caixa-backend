const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    // ...
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
      allowNull: false
    }
    // ...
  });
  return User;
};