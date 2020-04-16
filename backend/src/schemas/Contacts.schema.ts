import * as databaseManager from "../managers/databaseManager";
import { Model, DataTypes } from "sequelize";
/**
 * This model is the object representation of the 'users_contacts' table.
 * This table contains all the users contact information.
 */
class Contact extends Model {}

Contact.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    contact_value: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    contact_type: {
      type: DataTypes.ENUM("email", "phone_personal", "phone_business"),
      allowNull: false,
      defaultValue: "email",
    },
    contact_hierarchy_position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "users_contacts" }
);

export default databaseManager.sequelize().models.users_contacts;
