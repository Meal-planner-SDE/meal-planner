/*********
 * Type definitions
 *   TypeScript interfaces and types should be defined here!
 */

export interface Error {
  error: any;
}

export interface MPUser {
  mp_user_id: number;
  username: string;
  height: number;
  weight: number;
  diet_type: string;
  address: string;
  shopping_list_id: number;
}

export interface MeasureRaw {
  amount: number,
  unitLong: string,
  unitShort: string
}

export class Measure {
  amount: number;
  unitLong: string;
  unitShort: string;

  constructor(measure: MeasureRaw){
    this.amount = measure.amount;
    this.unitLong = measure.unitLong;
    this.unitShort = measure.unitShort;
  }
}

export class RecipeIngredient {
  id: number;
  name: string;
  measures: {
    metric: Measure
  };

  constructor(rec_ingredient: RecipeIngredientRaw){
    this.id = rec_ingredient.id;
    this.name = rec_ingredient.name;
    this.measures = {
      metric : new Measure(rec_ingredient.measures.metric)
    };
  }
}

export interface RecipeIngredientRaw {
  id: number,
  name: string,
  measures: {
    metric: MeasureRaw
  }
}

export class Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  ingredients: RecipeIngredient[];
  summary: string;
  sourceUrl: string;
  servings: number;
  readyInMinutes: number;
  pricePerServing: number;
  glutenFree: boolean;
  vegan: boolean;
  vegetarian: boolean;
  instructions: string;

  constructor(recipe: RecipeRaw){
    this.id = recipe.id;
    this.title = recipe.title;
    this.image = recipe.image;
    this.imageType = recipe.imageType;
    this.summary = recipe.summary;
    this.sourceUrl = recipe.sourceUrl;
    this.servings = recipe.servings;
    this.readyInMinutes = recipe.readyInMinutes;
    this.pricePerServing = recipe.pricePerServing;
    this.glutenFree = recipe.glutenFree;
    this.vegan = recipe.vegan;
    this.vegetarian = recipe.vegetarian;
    this.instructions = recipe.instructions;
    this.ingredients = [];
    if(recipe.extendedIngredients !== undefined){
      for (const ingredient of recipe.extendedIngredients){
        this.ingredients.push(new RecipeIngredient(ingredient));
      }
    }
  }
}

export interface RecipeRaw {
  id: number,
  title: string,
  image: string,
  imageType: string,
  extendedIngredients: RecipeIngredientRaw[],
  summary: string,
  sourceUrl: string,
  servings: number,
  readyInMinutes: number,
  pricePerServing: number,
  glutenFree: boolean,
  vegan: boolean,
  vegetarian: boolean,
  instructions: string
}

export class Ingredient {
  id: number;
  name: string;
  categoryPath: string[];

  constructor(ingredient: IngredientRaw){
    this.id = ingredient.id;
    this.name = ingredient.name;
    this.categoryPath = ingredient.categoryPath;
  }
}

export interface IngredientRaw {
  id: number;
  name: string;
  categoryPath: string[];
}

export interface Amount {
  sourceAmount: number,
  sourceUnit: string,
  targetAmount: number,
  targetUnit: string,
  answer: string
}