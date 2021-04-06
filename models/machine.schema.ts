import { Schema, model, Types, Document, Model } from 'mongoose';

const machineSchema = new Schema(
  {
    machineName: {
      type: String,
      required: true,
    },
    machineID: {
      type: String,
      required: true,
      unique: true,
    },
    data: [
      {
        type: Object,
        required: false,
        default: {},
      },
    ],
  },
  { timestamps: true }
);

interface MachineProps extends Document {
  machineName: string;
  machineID: string;
  data: {};
  _doc: Types.EmbeddedDocument;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

type StringIndexer = {
  [K in keyof MachineProps]: MachineProps[K];
};

export type RecipeInterface = StringIndexer & MachineProps;

const Recipe: Model<RecipeInterface> = model('Machine', machineSchema);

export default Recipe;
