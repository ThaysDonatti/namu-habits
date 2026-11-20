import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

import { database } from '../config/database';

export class Checkin extends Model<
  InferAttributes<Checkin>,
  InferCreationAttributes<Checkin>
> {
  declare id: CreationOptional<number>;
  declare habitId: number;
  declare date: string;
  declare notes: string | null;
}

Checkin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    habitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'habit_id',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: database,
    tableName: 'checkins',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['habit_id', 'date'],
      },
    ],
  }
);