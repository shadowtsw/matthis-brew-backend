import Recipe from '../../models/recipe.schema';

import { errName } from '../../utils/error/error-handler';
import validator from 'validator';

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
  addComment: async function () {},
  removeComment: async function () {},
};

export default GraphQLResolver;
