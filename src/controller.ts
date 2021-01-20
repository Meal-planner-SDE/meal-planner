/*********
 * Main controller
 *   Here you can define all the processing logics of your endpoints.
 *   It's a good approach to keep in here only the elaboration of the inputs
 *   and outputs, with complex logics inside other functions to improve
 *   reusability and maintainability. In this case, we've defined the complex
 *   logics inside the core.ts file!
 *   In a huge project, you should have multiple controllers, divided
 *   by the domain of the operation.
 */

import { Request, Response } from 'express';

import {
  getUserByUsername,
  insertUser,
  updateUser,
  computeCalories
} from './core';
import {
  getActivityFactor,
  getIdParameter,
  getNumberFromRequest,
  getParameterFromRequest,
  getSexParameterFromRequest,
  getUsernameFromRequest
} from './helper';
import { CaloriesData } from './types';

export const user = async (req: Request, res: Response) => {
  const username = getUsernameFromRequest(req) || "";
  res.send(await getUserByUsername(username));
};

export const postUser = async (req: Request, res: Response) => {
  res.send(await insertUser(req.body));
};

export const patchUser = async (req: Request, res: Response) => {
  const id = getIdParameter(req) || -1;
  res.send(await updateUser(id, req.body));
};

export const calories = async (req: Request, res: Response) => {
  const caloriesData:CaloriesData = {
    height: getNumberFromRequest(req, 'height') || 0,
    weight: getNumberFromRequest(req, 'weight') || 0,
    age: getNumberFromRequest(req, 'age')       || 0,
    sex: getSexParameterFromRequest(req)        || "m",
    activityFactor: getActivityFactor(req)      || "moderate"
  }
  res.send(await computeCalories(caloriesData));
};



// export const recipe = async (req: Request, res: Response) => {
//   const query = getParameterFromRequest(req, 'q')     || "";
//   const diet = getParameterFromRequest(req, 'diet')   || "omni";
//   const n = getNumberFromRequest(req, 'n')            || 1;
//   const offset = getNumberFromRequest(req, 'offset')  || 0;
//   res.send(await searchRecipes(query, diet, n, offset));
// };

// export const recipeInformation = async (req: Request, res: Response) => {
//   let id = getIdParameter(req);
//   if (id !== false) {
//     res.send(await getRecipeInformation(id));
//   } else {
//     res.status(400);
//     res.send({ error: 'Invalid ID format!' });
//   }
// };

// export const ingredient = async (req: Request, res: Response) => {
//   let id = getIdParameter(req);
//   if (id !== false) {
//     res.send(await getIngredientById(id));
//   } else {
//     res.status(400);
//     res.send({ error: 'Invalid ID format!' });
//   }
// };

// export const convert = async (req: Request, res: Response) => {
//   const ingredientName = getParameterFromRequest(req, 'ingredientName') || "";
//   const sourceAmount = getNumberFromRequest(req, 'sourceAmount')        || 1;
//   const sourceUnit = getParameterFromRequest(req, 'sourceUnit')         || "g";
//   const targetUnit = getParameterFromRequest(req, 'targetUnit')         || "g";
//   res.send(await convertAmount(ingredientName, sourceAmount, sourceUnit, targetUnit));
// };