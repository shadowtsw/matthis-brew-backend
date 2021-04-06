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
      });

      if (ingredients) {
        newRecipe.ingredients = ingredients;
      }
      if (descriptions) {
        newRecipe.descriptions = descriptions;
      }

      return await newRecipe.save();
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
      const alreadyDisLiked = findRecipe.likes.find((id) => {
        return id.toString() === req.user._id.toString();
      });

      if (!alreadyLiked) {
        findRecipe.likes.push(req.user);
        findRecipe.totalLikes += 1;
      }
      if (alreadyDisLiked) {
        findRecipe.disLikes = findRecipe.disLikes.filter((id) => {
          return id.toString() !== req.user._id.toString();
        });
        findRecipe.totalDislikes -= 1;
      }

      await findRecipe.save();
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
    } catch (err) {}
  },
  addComment: async function () {},
  removeComment: async function () {},
};

export default GraphQLResolver;
