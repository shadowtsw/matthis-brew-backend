import { buildSchema } from 'graphql';

//meta entfernt
//        meta: UserMeta

const UserRelated: string = `

    type User {
        _id:ID!
        username:String!
        emailAddress:String!
        dateCreated:Int
        followers:[ID]
        following:[ID]
    }
    type UserMeta {
        token:String
        refreshToken:String
        password:String
    }

    input CreateUserInput {
        username:String!
        password:String!
        confirmPassword:String!
        emailAddress:String!
    }

    input UpdateUserInput {
        password:String
        confirmPassword:String
        emailAddress:String
        followers:[ID]
        following:[ID]
    }
`;

const GraphQLSchema = buildSchema(`

    ${UserRelated}

    type TokenObject {
        token:String!
        refreshToken:String!
    }

    type RootQuery {
        getUserDetails:User!
        logout:String!
    }
    
    type RootMutation {
        createUser(createUserInput:CreateUserInput!):String!
        updateUser(updateUserInput:UpdateUserInput!):User!

        login(username:String! password:String!):TokenObject!
        refreshToken(refreshToken:String!):TokenObject!
    }

    schema {
        query:RootQuery
        mutation:RootMutation
    }
`);

export default GraphQLSchema;
