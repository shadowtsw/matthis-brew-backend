process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const LOGIN_URL = process.env.LOGIN_URL || 'http://localhost:3000/graphql';

console.log('Enviroment:', process.env.NODE_ENV);

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
const bodyParser = require('body-parser');
import path from 'path';
import { getStartTime } from './utils/systemStatus';
import mongoose from 'mongoose';

import { default as SystemRouter } from './routes/system.routes';
import { default as FileRouter } from './routes/fileHandler.routes';
import { default as VerifyRouter } from './routes/verify.routes';
import { graphqlHTTP } from 'express-graphql';
import { default as GraphQLGlobalSchema } from './graphql/rootSchema';
import { default as GraphQLUserResolver } from './graphql/user/resolver';
import { default as GraphQLRecipeResolver } from './graphql/recipe/resolver';
import { mergeSchemas, mergeResolvers } from 'graphql-tools';
import { authMiddleWare } from './middleware/authenticate';
import { getError } from './utils/error/error-handler';

const Server = express();

// Server.use(helmet());

Server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

Server.use(compression());
Server.use(bodyParser.urlencoded({ extended: false }));
Server.use(bodyParser.json());

Server.set('view engine', 'ejs');
Server.set('views', 'pages');
Server.use('/', express.static('build'));

Server.use(authMiddleWare);

Server.get('/fastforward', (req, res, next) => {
  res.status(200).redirect(LOGIN_URL);
});
Server.use('/status', SystemRouter);
Server.use('/verify', VerifyRouter);
Server.use(
  '/graphql',
  graphqlHTTP({
    schema: mergeSchemas({
      schemas: [GraphQLGlobalSchema],
    }),
    rootValue: mergeResolvers([GraphQLUserResolver, GraphQLRecipeResolver]),
    graphiql: true,
    customFormatErrorFn(err: any) {
      let error = getError(err.message);
      if (!error) {
        return err;
      }
      return { message: error.message, status: error.statusCode };
    },
  })
);
Server.use('/file', FileRouter);
Server.get('/service-worker.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'service-worker.js'));
});

Server.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const err = getError(error.message);
  const data = error.data;
  if (!err) {
    res.status(500).json(error);
  }
  res.status(err.statusCode).json({ message: err.message, data: data });
});

mongoose
  .connect(process.env.MONGO_CONNECT!)
  .then(() => {
    Server.listen(process.env.PORT || 3000, () => {
      getStartTime.set(new Date());
      console.log('Server starts with MongoDB-Connection');
    });
  })
  .catch((err) => {
    console.error(err);
    if (process.env.NODE_ENV === 'development') {
      Server.listen(process.env.PORT || 3000, () => {
        getStartTime.set(new Date());
        console.log('Server starts without MongoDB-Support');
      });
    }
  });
