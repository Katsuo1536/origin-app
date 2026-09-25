"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useFetch } from "@/app/_hooks/useFetch";
import type { RecipesResponse } from '@/app/recipes/page';
import { getRecipeImageUrl } from "@/app/_components/getImage";


export default function RecipeData() {

  const { data: recipeData } = useFetch("/api/recipes")

  const recipes: RecipesResponse = recipeData ? recipeData.recipes : [];

  const randomRecipe = recipes ? recipes.at(Math.floor(Math.random() * recipes.length)) : undefined;




  return (
    <>

          <Link href="/recipes" >
            <section className="rounded-2xl border-2 border-orange-400 h-60 w-75">
              <h2 className="font-bold px-2 py-1">
                レシピ
              </h2>
              {randomRecipe && (
                <div key={randomRecipe?.id}
                  className="flex flex-col justify-center items-center py-3">
                  <Image src={getRecipeImageUrl(randomRecipe.image)} alt="recipe_image" width={200} height={200} className="flex justify-center items-center rounded-lg" />
                  <span className="rouded-2xl text-center m-3 font-semibold ">
                    {randomRecipe?.name}
                  </span>
                </div>
              )}
            </section>
          </Link>

    </>
  );

}
