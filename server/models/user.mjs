/**
 * User model
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {string} uuid - Unique identifier (UUIDv4)
 * @property {string} username - User's username
 * @property {string} email - User's email address
 * @property {string} password - Hashed password
 * @property {string} role - User role (enum: 'admin', 'patient', 'doctor')
 * @property {string} [profilePicURL] - URL for user's profile picture (optional)
 * @property {string} [profilePicPublicId] - Public ID for cloud storage of profile picture (optional)
 */

export default (db, DataTypes) => {
  return db.define('user', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'patient', 'doctor'),
      allowNull: false,
    },
    profilePicURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePicPublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
};
