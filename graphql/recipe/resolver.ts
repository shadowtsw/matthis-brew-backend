import Recipe from '../../models/recipe.schema';

import { errName } from '../../utils/error/error-handler';
import validator from 'validator';
import mongoose from 'mongoose';

const GraphQLResolver = {
  addRecipe: async function ({ addRecipeInput }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    const { recipeName } = addRecipeInput;
    const [...ingredients] = addRecipeInput.ingredients;
    const [...descriptions] = addRecipeInput.descriptions;

    try {
      const newRecipe = new Recipe({
        userID: req.user,
        recipeName: recipeName,
        likes: [],
        disLikes: [],
      });

      if (ingredients) {
        newRecipe.ingredients = ingredients;
      }
      if (descriptions) {
        newRecipe.descriptions = descriptions;
      }

      req.user.recipes.push(newRecipe);
      await req.user.save();

      return await newRecipe.save();
    } catch (err) {
      throw err;
    }
  },
  saveRecipeInFavourites: async function ({ recipeID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }
    try {
      const favouriteRecipe = await Recipe.findById(recipeID).exec();
      if (!favouriteRecipe) {
        throw new Error(errName.RECIPE_NOT_FOUND);
      }
      const checkDuplicate = req.user.following.some((entry: any) => {
        return entry._id.toString() === favouriteRecipe._id.toString();
      });

      if (checkDuplicate) {
        throw new Error(errName.RECIPE_ALREADY_IN_LIST);
      }
      if (req.user.favouriteRecipes.length === 10) {
        throw new Error(errName.TOO_MANY_ENTRIES);
      }
      req.user.favouriteRecipes.push(favouriteRecipe);
      await req.user.save();
      return `Successfully saved ${favouriteRecipe.recipeName} to your favourites !`;
    } catch (err) {
      throw err;
    }
  },
  saveRecipeToUser: async function ({ recipeID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }
    try {
      const findRecipe = await Recipe.findById(recipeID).exec();
      if (!findRecipe) {
        throw new Error(errName.RECIPE_NOT_FOUND);
      }
      req.user.savedRecipes.push(findRecipe);
      await req.user.save();
      return `Successfully saved ${findRecipe.recipeName}`;
    } catch (err) {
      throw err;
    }
  },
  updateRecipe: async function () {},
  like: async function ({ recipeID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    try {
      const findRecipe = await Recipe.findById(recipeID).exec();
      if (!findRecipe) {
        throw new Error(errName.RECIPE_NOT_FOUND);
      }
      const alreadyLiked = findRecipe.likes.find((id) => {
        return id.toString() === req.user._id.toString();
      });
      const alreadyDisLiked = findRecipe.disLikes.find((id) => {
        return id.toString() === req.user._id.toString();
      });

      if (!alreadyLiked) {
        findRecipe.likes.push(req.user);
        findRecipe.totalLikes += 1;
      }
      if (alreadyDisLiked) {
        console.log(alreadyDisLiked);
        findRecipe.disLikes = findRecipe.disLikes.filter((id) => {
          return id.toString() !== req.user._id.toString();
        });
        findRecipe.totalDislikes -= 1;
      }

      await findRecipe.save();
      return `Thanks for your vote !`;
    } catch (err) {}
  },
  disLike: async function ({ recipeID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }
    try {
      const findRecipe = await Recipe.findById(recipeID).exec();
      if (!findRecipe) {
        throw new Error(errName.RECIPE_NOT_FOUND);
      }
      const alreadyDisLiked = findRecipe.disLikes.find((id) => {
        return id.toString() === req.user._id.toString();
      });
      const alreadyLiked = findRecipe.likes.find((id) => {
        return id.toString() === req.user._id.toString();
      });

      if (!alreadyDisLiked) {
        findRecipe.disLikes.push(req.user);
        findRecipe.totalDislikes += 1;
      }
      if (alreadyLiked) {
        findRecipe.likes = findRecipe.likes.filter((id) => {
          return id.toString() !== req.user._id.toString();
        });
        findRecipe.totalLikes -= 1;
      }

      await findRecipe.save();
      return `Sorry to hear, but thanks for your vote !`;
    } catch (err) {}
  },
  addComment: async function ({ comment, recipeID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    try {
      const findRecipe = await Recipe.findById(recipeID).exec();
      if (!findRecipe) {
        throw new Error(errName.RECIPE_NOT_FOUND);
      }
      findRecipe.comments.push({
        _id: mongoose.Types.ObjectId(),
        userID: req.user,
        text: comment,
      });
      await findRecipe.save();
      return `Your comment has been stored in ${findRecipe.recipeName}`;
    } catch (err) {
      throw err;
    }
  },
  removeComment: async function ({ commentID, recipeID }: any, req: any) {
    if (!req.user) {
      throw new Error(errName.AUTH_FAILED);
    }

    try {
      const findRecipe = await Recipe.findById(recipeID).exec();
      if (!findRecipe) {
        throw new Error(errName.RECIPE_NOT_FOUND);
      }
      const relatedComment = findRecipe.comments.find((comment: any) => {
        return comment._id.toString() === commentID;
      });
      if (!relatedComment) {
        throw new Error(errName.COMMENT_NOT_FOUND);
      }
      if (relatedComment.userID.toString() !== req.user._id.toString()) {
        throw new Error(errName.OWNER_FAIL);
      }
      const newCommentArray = findRecipe.comments.filter((comment) => {
        return comment._id.toString() !== commentID;
      });

      findRecipe.comments = newCommentArray;

      await findRecipe.save();
      return `Your comment has been removed from ${findRecipe.recipeName}`;
    } catch (err) {
      throw err;
    }
  },
};

export default GraphQLResolver;
