import * as databaseManager from "../managers/databaseManager";
import { Model, DataTypes } from "sequelize";

class BikeImage extends Model {}
BikeImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uri: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "bike_images" }
);

export default databaseManager.sequelize().models.bike_images;
