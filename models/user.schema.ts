import { Schema, model, Types, Document, Model } from 'mongoose';

const userSchema = new Schema({
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
    required: true,
  },
  meta: {
    password: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: false,
      unique: true,
      default: new Date().getTime(),
    },
    refreshToken: {
      type: String,
      required: false,
      unique: true,
      default: new Date().getTime(),
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
});

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
  _doc: Types.Embedded;
}

type StringIndexer<T> = {
  [K in keyof T]: T[K];
};

export type UserInterface = StringIndexer<UserProps> & UserProps;

const User: Model<UserInterface> = model('User', userSchema);

export default User;
