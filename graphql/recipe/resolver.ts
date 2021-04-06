import Recipe from '../../models/recipe.schema';

import { errName } from '../../utils/error/error-handler';
import validator from 'validator';

const GraphQLResolver = {
  addRecipe: async function({},req:any){
    if(!req.user){
      throw new Error(errName.AUTH_FAILED);
    }
    
    const {recipeName} = xxxx
    
    try{
      
      const newRecipe = new Recipe({
        userID:req.user,
        recipeName: recipeName,
        ingredients: xxx,
      })
      
      return await newRecipe.save();
     
    }catch (err){
      throw err
    }
  },
  updateRecipe:async function(){
  },
  like:async function(){
  },
  disLike:async function(){
  },
  addComment:async function(){
  },
  removeComment:async function(){
  },
};

export default GraphQLResolver;
