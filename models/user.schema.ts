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
    publicEmail:{
      type:String,
      required: false,
      default:null
    },
    settings:{
      showPublicEmail:{ 
        type: Boolean,
        required:false,
        default:false
      },
      avatarURI:{
        type:String,
        required:false,
        default:""
      },
      signature:{
        type:String,
        required:false,
        default:""
      },
      description:{
        type:String,
        required:false,
        default:""
      },
      theme:{
        type:Boolean,
        required:false,
        default:false
      },
    },
    recipes:[
      {
        type:Schema.Types.ObjectId,
        ref:'Recipes'
      }
    ],
    favourites:[
      {
        type:Schema.Types.ObjectId,
        ref:'Recipes'
      }
    ],
    savedRecipes:[
      {
        type:Schema.Types.ObjectId,
        ref:'Recipes'
      }
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
  },
  { timestamps: true }
);

interface UserProps extends Document {
  username: string;
  emailAddress: string;
  dateCreated: string;
  publicEmail:string|null;
  settings:{
    showPublicEmail:boolean;
    avatarURI:string;
    signature:string;
    description:string;
    theme:string;
  };
  recipes:Array<Types.ObjectId>;
  favourites:Array<Types.ObjectId>;
  savedRecipes:Array<Types.ObjectId>;
  meta: {
    password: string;
    token?: string;
    refreshToken?: string;
    isVerified: boolean;
    resetToken: string | null;
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
