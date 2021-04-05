import { Schema, model, Types, Document, Model } from 'mongoose';

const recipeSchema = new Schema(
  {
    recipeName: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
      required: false,
      default: null,
    },
    ingredients: [
      {
        ingredient: {
          type: String,
          required: true,
        },
        value: {
          type: Number,
          required: false,
          default: 0,
        },
        unit: {
          type: String,
          required: true,
        },
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
      },
    ],
    comments: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

interface RecipeProps extends Document {
  recipeName: string;
  picture: string;
  likes: Types.ObjectId;
  comments: [{ userId: Types.ObjectId; text: string }];
  _doc: Types.EmbeddedDocument;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

type StringIndexer = {
  [K in keyof RecipeProps]: RecipeProps[K];
};

export type RecipeInterface = StringIndexer & RecipeProps;

const Recipe: Model<RecipeInterface> = model('Recipe', recipeSchema);

export default Recipe;
