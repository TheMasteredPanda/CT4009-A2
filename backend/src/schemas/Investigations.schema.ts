import { Model, DataTypes } from "sequelize";
import * as databaseManager from "../managers/databaseManager";

/**
 * A semi-junction table for relating a report with updates, comments, and investigation images (evidence).
 */
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
