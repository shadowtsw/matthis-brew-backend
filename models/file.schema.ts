import { Schema, model, Types, Document, Model } from 'mongoose';

const fileSchema = new Schema({
  filename: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Number,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

interface FileProps extends Document {
  filename: string;
  date: number;
  user: Types.ObjectId;
}

type StringIndexer<T> = {
  [K in keyof T]: T[K];
};

export type FileInterface = FileProps & StringIndexer<FileProps>;

const File: Model<FileInterface> = model('File', fileSchema);

export default File;
