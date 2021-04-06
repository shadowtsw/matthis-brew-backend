<<<<<<< HEAD
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
    publicEmail: {
      type: String,
      required: false,
      default: null,
    },
    settings: {
      showPublicEmail: {
        type: Boolean,
        required: false,
        default: false,
      },
      avatarURI: {
        type: String,
        required: false,
        default: '',
      },
      signature: {
        type: String,
        required: false,
        default: '',
      },
      description: {
        type: String,
        required: false,
        default: '',
      },
      darkmode: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    recipes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    favouriteRecipes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    savedRecipes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
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
      isVerified: {
        type: Boolean,
        required: false,
        default: false,
      },
      resetToken: {
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
    favouriteUsers: [
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
  publicEmail: string | null;
  settings: {
    showPublicEmail: boolean;
    avatarURI: string;
    signature: string;
    description: string;
    darkmode: boolean;
  };
  recipes: Array<Types.ObjectId>;
  favouriteRecipes: Array<Types.ObjectId>;
  savedRecipes: Array<Types.ObjectId>;
  meta: {
    password: string;
    token?: string;
    refreshToken?: string;
    isVerified: boolean;
    resetToken: string | null;
  };
  followers: Array<Types.ObjectId>;
  following: Array<Types.ObjectId>;
  favouriteUsers: Array<Types.ObjectId>;
  _doc: Types.EmbeddedDocument;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

type StringIndexer = {
  [K in keyof UserProps]: UserProps[K];
};

export type UserInterface = StringIndexer & UserProps;

const User: Model<UserInterface> = model('User', userSchema);

export default User;
=======
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
    publicEmail: {
      type: String,
      required: false,
      default: null,
    },
    settings: {
      showPublicEmail: {
        type: Boolean,
        required: false,
        default: false,
      },
      avatarURI: {
        type: String,
        required: false,
        default: '',
      },
      signature: {
        type: String,
        required: false,
        default: '',
      },
      description: {
        type: String,
        required: false,
        default: '',
      },
      darkmode: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    recipes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    favouriteRecipes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    savedRecipes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
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
      isVerified: {
        type: Boolean,
        required: false,
        default: false,
      },
      resetToken: {
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
    favouriteUsers: [
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
  publicEmail: string | null;
  settings: {
    showPublicEmail: boolean;
    avatarURI: string;
    signature: string;
    description: string;
    darkmode: boolean;
  };
  recipes: Array<Types.ObjectId>;
  favouriteRecipes: Array<Types.ObjectId>;
  savedRecipes: Array<Types.ObjectId>;
  meta: {
    password: string;
    token?: string;
    refreshToken?: string;
    isVerified: boolean;
    resetToken: string | null;
  };
  followers: Array<Types.ObjectId>;
  following: Array<Types.ObjectId>;
  favouriteUsers: Array<Types.ObjectId>;
  _doc: Types.EmbeddedDocument;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

type StringIndexer = {
  [K in keyof UserProps]: UserProps[K];
};

export type UserInterface = StringIndexer & UserProps;

const User: Model<UserInterface> = model('User', userSchema);

export default User;
>>>>>>> 02ce511552c4ea223bbcf64863fe69fc43a77dba
