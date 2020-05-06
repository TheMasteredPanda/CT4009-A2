import { Model, DataTypes } from "sequelize";
import * as databaseManager from "../managers/databaseManager";

class ReportComment extends Model {}

ReportComment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("civilian", "police"),
      allowNull: false,
      defaultValue: "civilian",
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "reports_comments" }
);

export default databaseManager.sequelize().models.reports_comments;
