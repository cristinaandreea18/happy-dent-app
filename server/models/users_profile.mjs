/**
 * User Profile model
 *
 * @param {object} db - Sequelize database instance
 * @param {object} DataTypes - Sequelize data types
 * @returns {object} - Sequelize model
 *
 * @property {string} profileId - Primary key (15 characters)
 * @property {string} userId - Foreign key referencing users.uuid
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} dateOfBirth - Birth date (format: YYYY-MM-DD)
 * @property {string} identificationNumber - Personal identification number
 * @property {'male'|'female'} gender - User's gender (enum)
 * @property {string} ocupation - User's occupation
 * @property {string} phoneNumber - User's phone number
 * @property {string} county - User's county of residence
 * @property {string} city - User's city of residence
 */
export default (db, DataTypes) => {
  return db.define('users_profile', {
    profileId: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'uuid',
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    identificationNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    ocupation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    county: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
