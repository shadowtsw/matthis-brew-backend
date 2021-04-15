import { buildSchema } from 'graphql';

const Save: string = `
    type SingleUser {
        _id:ID!
        username:String
        publicEmail:String
        followers:Int!
        following:Int!
        avatarURI:String
    }

    type FavouriteUser {
        _id:ID!
        username:String
        publicEmail:String
        avatarURI:String
        recipes:[Recipe]!
        followers:[UserPreview]!
        following:[UserPreview]!
    }

    type UserPreview {
        _id:ID!
        username:String
        publicEmail:String
        avatarURI:String
    }
`;

const RecipeRelated: string = `
    type Recipe {
        _id:ID!
        userID:ID!
        recipeName:String!
        picture:String
        ingredients:[Ingredient]!
        totalLikes:Int
        totalDislikes:Int
        comments:[UserComments]!
        createdAt:String
        updatedAt:String
    }

    type Ingredient {
        _id:ID
        ingredient:String!
        value:Int!
        unit:String
        comment:String
    }

    type UserComments {
        _id:ID!
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
        comment:String
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
        avatarURI:String
        theme:String
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

    input InputSettings {
        showPublicEmail:Boolean
        signature:String
        description:String
        darkmode:Boolean
        avatarURI:String
        theme:String
    }


`;

const GraphQLSchema = buildSchema(`

    ${UserRelated}

    ${RecipeRelated}

    ${Save}

    type TokenObject {
        token:String!
        refreshToken:String!
        tokenExpiresIn:Int!
        refreshTokenExpiresIn:Int!
    }

    type RootQuery {
        getUserDetails:User!

        fetchSingleUser(userID:ID!):SingleUser!
        
        logout:String!
        
        getAllFollowerDetails:[UserPreview]!
        getAllFollowingDetails:[UserPreview]!
        
        getUserList(filterByName:String count:Int):[UserPreview]!

        getOwnRecipes:[Recipe]!
        getFavouriteRecipes:[Recipe]!
        getSavedRecipe:[Recipe]!

        getBuddies:[FavouriteUser]!
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
        saveRecipeInFavourites(recipeID:ID!):String!
        saveRecipeToUser(recipeID:ID!):String!

        addComment(comment:String! recipeID:ID!):String!
        removeComment(commentID:ID! recipeID:ID!):String!

        like(recipeID:ID!):String!
        disLike(recipeID:ID!):String!
    }

    schema {
        query:RootQuery
        mutation:RootMutation
    }
`);

export default GraphQLSchema;
