import * as databaseManager from "../managers/databaseManager";
import { Model, DataTypes } from "sequelize";

/**
 * A junction table relating an image entry to a report.
 */
class ReportImages extends Model {}

ReportImages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "report_images" }
);

export default databaseManager.sequelize().models.report_images;
