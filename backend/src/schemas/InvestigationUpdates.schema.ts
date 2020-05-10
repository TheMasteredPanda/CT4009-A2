import { DataTypes, Model } from "sequelize";
import * as databaseManager from "../managers/databaseManager";

class InvestigationUpdates extends Model {}

InvestigationUpdates.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "investigation_updates" }
);

export default databaseManager.sequelize().models.investigation_updates;
