import { Schema, model, Types, Document, Model } from 'mongoose';

const recipeSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
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
        comment: {
          type: String,
          required: false,
          default: null,
        },
      },
    ],
    descriptions: [
      {
        topic: {
          type: String,
          required: false,
        },
        text: {
          type: String,
          required: false,
        },
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    totalLikes: {
      type: Number,
      required: false,
      default: 0,
    },
    disLikes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    totalDislikes: {
      type: Number,
      required: false,
      default: 0,
    },
    comments: [
      {
        userID: {
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
  userID: Types.ObjectId;
  recipeName: string;
  picture: string;
  likes: Array<Types.ObjectId>;
  totalLikes: number;
  disLikes: Array<Types.ObjectId>;
  totalDislikes: number;
  comments: Array<{
    _id: Types.ObjectId;
    userID: Types.ObjectId;
    text: string;
  }>;
  ingredients: Array<{
    ingredient: string;
    value: number;
    unit: string;
    comment: string;
  }>;
  descriptions: [{ topic: string; text: string }];
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
