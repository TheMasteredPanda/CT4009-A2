import * as databaseManager from "../managers/databaseManager";
import { Model, DataTypes } from "sequelize";

class Bikes extends Model {}

let BikesModel = Bikes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    part_number: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "N/A",
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "road",
        "mountain",
        "hybrid_or_commuter",
        "cyclocross",
        "folding",
        "electric",
        "touring",
        "womens"
      ),
      allowNull: false,
      defaultValue: "hybrid_or_commuter",
    },
    wheel_size: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0.0,
    },
    colours: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "[]",
    },
    gear_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    brake_type: {
      type: DataTypes.ENUM(
        "spoon",
        "duck",
        "rim",
        "disc",
        "drum",
        "coaster",
        "drag",
        "band",
        "mechanical",
        "hydraulic",
        "hybrid",
        "v-brake",
        "cantilever"
      ),
      allowNull: false,
      defaultValue: "v-brake",
    },
    suspension: {
      type: DataTypes.ENUM(
        "front",
        "rear",
        "seatpost",
        "saddle",
        "stem",
        "hub",
        "none"
      ),
      allowNull: false,
      defaultValue: "none",
    },
    gender: {
      type: DataTypes.ENUM("womens", "mens", "boys", "girls", "unisex"),
      allowNull: false,
      defaultValue: "unisex",
    },
    age_group: {
      type: DataTypes.ENUM("toddler", "children", "adult"),
      allowNull: false,
      defaultValue: "adult",
    },
  },
  { sequelize: databaseManager.sequelize(), modelName: "bikes" }
);

export default databaseManager.sequelize().models.bikes;
