import { Model, DataTypes } from "sequelize";
import * as databaseManager from "../managers/databaseManager";

class Reports extends Model {}

Reports.init(
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
    place_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    open: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    investigating: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "reports" }
);

export default databaseManager.sequelize().models.reports;
