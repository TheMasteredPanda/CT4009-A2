import { Model, DataTypes } from "sequelize";
import * as databaseManager from "../managers/databaseManager";

class Investigation extends Model {}
Investigation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    open: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "investigations" }
);

export default databaseManager.sequelize().models.investigations;
