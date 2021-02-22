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

import { Error, MPUser, CaloriesData, MealPlan, SpoonacularRecipe, DailyPlan, Recipe, isError, SpoonacularRecipeRaw} from './types';
import config from '../config';
import qs from 'qs';

import axios from 'axios';
import { computeNeededCalories } from './helper';
axios.defaults.paramsSerializer = (params) => {
  return qs.stringify(params, { indices: false });
};


export const getUserByUsername: (user_name: string) => Promise<MPUser | Error> = async (user_name) => {
  try {
    const response = await axios.get<MPUser>(`${config.INTERNAL_DB_ADAPTER_URL}/users/${user_name}`);
    return response.data;
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};

export const insertUser: (user : MPUser) => Promise<MPUser | Error> = async (user) => {
  try {
    const response = await axios.post<MPUser>(`${config.INTERNAL_DB_ADAPTER_URL}/users/`, user);
    return response.data;
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};

export const updateUser: (id: number, user : MPUser) => Promise<MPUser | Error> = async (id, user) => {
  try {
    const response = await axios.patch<MPUser>(`${config.INTERNAL_DB_ADAPTER_URL}/users/${id}`, user);
    return response.data;
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};

export const computeCalories: (data: CaloriesData) => Promise<Object> = async (data) => {
  return {neededCalories: computeNeededCalories(data)};
};

export const getMealPlans: (userId: number) => Promise<MealPlan[] | Error> = async (userId) => {
  try {
    const response = await axios.get<MealPlan[]>(`${config.INTERNAL_DB_ADAPTER_URL}/users/${userId}/mealPlans`);
    return response.data;
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};

export const getMealPlanById: (userId: number, mealPlanId: number) => Promise<MealPlan | Error> = async (userId, mealPlanId) => {
  try {
    const response = await axios.get<MealPlan>(`${config.INTERNAL_DB_ADAPTER_URL}/users/${userId}/mealPlans/${mealPlanId}`);
    return response.data;
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};

function shuffle(a: any[]) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const computeMealPlan: (calories: number, days: number, mealsPerDay: number, dietType: string) => Promise<MealPlan | Error> = 
  async (calories, days, mealsPerDay, dietType) => {
  const N = 30;
  const MAX_DIFF = 0.15 * calories;
  const MAX_OFFSET = 20;
  const totalRecipes = days * mealsPerDay * N;
  let response = await axios.get<SpoonacularRecipeRaw[]>(`${config.SPOONACULAR_ADAPTER_URL}/recipe`, {
    params: {
      diet: dietType,
      n: totalRecipes,
      q: "",
      offset: Math.floor(Math.random() * MAX_OFFSET),
    }
  });
  if(isError(response)){
    return response;
  }

  let res_recipes = response.data.map(recipe => new SpoonacularRecipe(recipe));
  let sum_calories = 0.0;
  let dailyPlans:DailyPlan[] = [];
  for(let i=0; i<days; i++){
    shuffle(res_recipes);
    let day_recipes:SpoonacularRecipe[] = [];
    let day_calories = 0.0;
    for(let j=0; j<mealsPerDay && j < res_recipes.length; j++){
      day_recipes.push(res_recipes[j]);
      day_calories += res_recipes[j].calories;
    }
    let k = mealsPerDay;

    while(k < res_recipes.length && Math.abs(day_calories - calories) > MAX_DIFF){
      let j_sub = 0;
      if (day_calories - calories > MAX_DIFF){ // remove recipe with highest calories
        for(let j=0; j<mealsPerDay && j < res_recipes.length; j++){
          if (day_recipes[j] > day_recipes[j_sub]){
            j_sub = j;
          }
        }
        while(k < res_recipes.length && res_recipes[k].calories >= day_recipes[j_sub].calories){
          k++;
        }
      } else { // remove recipe with lowest calories
        for(let j=0; j<mealsPerDay && j < res_recipes.length; j++){
          if (day_recipes[j] < day_recipes[j_sub]){
            j_sub = j;
          }
        }
        while(k < res_recipes.length && res_recipes[k].calories <= day_recipes[j_sub].calories){
          k++;
        }
      }
      if (k < res_recipes.length){
        day_calories -= day_recipes[j_sub].calories; 
        day_recipes[j_sub] = res_recipes[k];
        day_calories += res_recipes[k].calories;
      }
    }

    let dailyPlan = {recipes: day_recipes}; 
    sum_calories += day_calories;
    dailyPlans.push(dailyPlan);
  }

  let result:MealPlan = {
    daily_calories: Math.floor(sum_calories / Math.max(1, days)),
    diet_type: dietType,
    daily_plans: dailyPlans
  };
  return result
}

export const generateMealPlan: (calories: number, days: number, mealsPerDay: number, dietType: string) => Promise<MealPlan | Error> = async (calories, days, mealsPerDay, dietType) => {
  try {
    let result = await computeMealPlan(calories, days, mealsPerDay, dietType)

    return result;
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};

export const savePlan: (id : number, plan : MealPlan) => Promise<MealPlan | Error> = async (id, plan) => {
  try {
    const response = await axios.post<MealPlan>(`${config.INTERNAL_DB_ADAPTER_URL}/users/${id}/mealPlans`, plan);
    return response.data;
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};



