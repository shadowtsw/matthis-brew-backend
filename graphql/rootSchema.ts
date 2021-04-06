import { buildSchema } from 'graphql';

const RecipeRelated: string = `
    type Recipe {
        _id:ID!
        userID:ID!
        recipeName:String!
        picture:String
        ingredients:[Ingredient]!
        totalLikes:Int
        totalDisLikes:Int
        comments:[Comments]!
        createdAt:String
        updatedAt:String
    }

    type Ingredient {
        ingredient:String!
        value:Int!
        unit:String!
    }

    type Comments {
        userID:ID!
        text:String!
    }

    input RecipeInput{
        recipeName:String!
        ingredients:[IngredientInput]!
        descriptions:[DescriptionInput]
    }

    input IngredientInput {
        ingredient:String
        value:Int
        unit:String
    }

    input DescriptionInput{
        topic:String
        text:String
    }
`;

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

    type FavouriteUser {
        _id:ID!
        username:String
        publicEmail:String
        recipes:[Recipe]!
    }
`;

const GraphQLSchema = buildSchema(`

    ${UserRelated}

    ${RecipeRelated}

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

        getOwnRecipe:[Recipe]!
        getFavouriteRecipes:[Recipe]!
        getSavedRecipe:[Recipe]!

        getBuddies:FavouriteUser!
    }
    
    type RootMutation {
        createUser(createUserInput:CreateUserInput!):String!
        updateUser(updateUserInput:UpdateUserInput!):User!

        setUserSettings(inputSettings:InputSettings):User!

        followUser(followUserID:ID!):String!
        unFollow(userID:ID!):String!

        addUserToFavourites(favouriteID:ID!):String!
        confirmBuddy(requestID:ID!):String!

        login(username:String! password:String!):TokenObject!
        refreshToken(refreshToken:String!):TokenObject!

        addRecipe(addRecipeInput:RecipeInput):Recipe!

        like:(recipeID:ID!):String!
        disLike:(recipeID:ID!):String!
    }

    schema {
        query:RootQuery
        mutation:RootMutation
    }
`);

export default GraphQLSchema;
