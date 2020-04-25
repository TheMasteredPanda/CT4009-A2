import * as databaseManager from "../managers/databaseManager";
import { Model, DataTypes } from "sequelize";

/**
 * This model is the object representation of the users table. The users
 * table contains the base information of a user account. That is the username,
 * password, and id.
 */
class User extends Model {}

/**
 * A model contains the users essential information.
 */
const UserModel = User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rank: {
      type: DataTypes.ENUM("civilian", "police_officer", "police_admin"),
      allowNull: false,
      defaultValue: "civilian",
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "users" }
);

export default databaseManager.sequelize().models.users;
