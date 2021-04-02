import { Schema, model, Types, Document, Model } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
    },
    dateCreated: {
      type: String,
      required: false,
      default: null,
    },
    meta: {
      password: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: false,
        default: null,
      },
      refreshToken: {
        type: String,
        required: false,
        default: null,
      },
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

interface UserProps extends Document {
  username: string;
  emailAddress: string;
  dateCreated: string;
  meta: {
    password: string;
    token?: string;
    refreshToken?: string;
  };
  followers: Array<Types.ObjectId>;
  following: Array<Types.ObjectId>;
  _doc: Types.EmbeddedDocument;
  _v: number;
  createdAt: string;
  updatedAt: string;
}

type StringIndexer<T> = {
  [K in keyof T]: T[K];
};

export type UserInterface = StringIndexer<UserProps> & UserProps;

const User: Model<UserInterface> = model('User', userSchema);

export default User;
