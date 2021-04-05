import { buildSchema } from 'graphql';

//meta entfernt
//        meta: UserMeta

const UserRelated: string = `

    type User {
        _id:ID!
        username:String!
        emailAddress:String!
        followers:[ID]
        following:[ID]
        createdAt:String
        updatedAt:String
        settings:UserSettings
        publicEmail:String
    }

    type UserSettings {
        showPublicEmail:Boolean!
        signature:String
        description:String
        darkmode:Boolean
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
    }

    type FollowerDetail {
        _id:ID!
        username:String!
        publicEmail:String
        avatarURI:String
    }

    type UserFromList {
        _id:ID!
        username:String!
        publicEmail:String
        avatarURI:String
    }

    input InputSettings {
        showPublicEmail:Boolean
        signature:String
        description:String
        darkmode:Boolean
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
        getAllFollowerDetails:[FollowerDetail]!
        getAllFollowingDetails:[FollowerDetail]!
        getUserList(filterByName:String count:Int):[UserFromList]!
    }
    
    type RootMutation {
        createUser(createUserInput:CreateUserInput!):String!
        updateUser(updateUserInput:UpdateUserInput!):User!

        setUserSettings(inputSettings:InputSettings):User!

        followUser(followUserID:ID!):String!
        unFollow(userID:ID!):String!

        login(username:String! password:String!):TokenObject!
        refreshToken(refreshToken:String!):TokenObject!
    }

    schema {
        query:RootQuery
        mutation:RootMutation
    }
`);

export default GraphQLSchema;
