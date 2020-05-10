import { Model, DataTypes } from "sequelize";
import * as databaseManager from "../managers/databaseManager";

class Investigators extends Model {}

Investigators.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    sequelize: databaseManager.sequelize(),
    modelName: "investigation_investigators",
  }
);

export default databaseManager.sequelize().models.investigation_investigators;
