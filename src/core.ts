/*********
 * Core functionalities
 *   All the processing logics are defined here. In this way, we leave in the
 *   controller all the input/output filtering and selection, and here we write
 *   the "raw" logics. In this way they're also re-usable! :)
 *   Obviously, in a real project, those functionalities should be divided as well.
 *   "Core" is not a fixed word for this type of file, sometimes
 *   people put those functions in a Utils file, sometimes in a Helper
 *   file, sometimes in a Services folder with different files for every service..
 *   It really depends on your project, style and personal preference :)
 */

import { Error, Recipe, Ingredient, RecipeRaw, IngredientRaw, Amount} from './types';
import config from '../config';
import qs from 'qs';

import axios from 'axios';
axios.defaults.paramsSerializer = (params) => {
  return qs.stringify(params, { indices: false });
};

/**
 * Search for recipes matching a certain query
 * @param query the title of the recipes that should be matched
 * @param diet the diet that the recipes have to match
 * @param number the maximum number of recipes returned
 */
export const searchRecipes: (query : string, diet: string, number: number, offset: number) => Promise<Recipe[] | Error> = async (query, diet, number, offset) => {
  try {
    const recipes = await axios.get<{results : RecipeRaw[]}>(`${config.SPOONACULAR_API_ENDPOINT}/recipes/complexSearch`, {
      params: {
        apiKey: config.SPOONACULAR_KEY,
        query: query,
        number: number,
        diet: diet,
        offset: offset
      }
    });
    return recipes.data.results.map((recipe) => new Recipe(recipe));
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};

/**
 * Get extended information about a recipe, including its ingredients
 * @param id id of the recipe
 */
export const getRecipeInformation: (id : number) => Promise<Recipe| Error> = async (id) => {
  try {
    const response = await axios.get<RecipeRaw>(`${config.SPOONACULAR_API_ENDPOINT}/recipes/${id}/information`, {
      params: {
        apiKey: config.SPOONACULAR_KEY
      }
    });
    return new Recipe(response.data);
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};

/**
 * Get information about an ingredient with a certain id
 * @param id the id of the ingredient
 * @return information about the ingredient
 */
export const getIngredientById: (id : number) => Promise<Ingredient| Error> = async (id) => {
  try {
    const response = await axios.get<IngredientRaw>(`${config.SPOONACULAR_API_ENDPOINT}/food/ingredients/${id}/information`, {
      params: {
        apiKey: config.SPOONACULAR_KEY
      }
    });
    return new Ingredient(response.data);
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};

/**
 * Convert amounts from sourceUnit to targetUnit for a certain ingredient
 * @param ingredientName name of the ingredient 
 * @param sourceAmount the amount described in sourceUnit
 * @param sourceUnit source unit
 * @param targetUnit target unit
 * @return an object with a targetAmount described in targetUnit if everything went correctly, otherwise an Error
 */
export const convertAmount: (ingredientName: string, sourceAmount: number, sourceUnit: string, targetUnit: string) => Promise<Object| Error> = async (ingredientName, sourceAmount, sourceUnit, targetUnit) => {
  try {
    const response = await axios.get<Amount>(`${config.SPOONACULAR_API_ENDPOINT}/recipes/convert`, {
      params: {
        apiKey: config.SPOONACULAR_KEY,
        ingredientName: ingredientName,
        sourceAmount: sourceAmount,
        sourceUnit: sourceUnit,
        targetUnit: targetUnit
      }
    });
    if(response.data.hasOwnProperty("status")){
      throw new Error("Cannot convert the amount.");
    }
    return {targetAmount: response.data.targetAmount};
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};