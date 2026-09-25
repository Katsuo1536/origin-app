"use client";

import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useFetch } from "@/app/_hooks/useFetch";
import { RecipesArray } from '@/app/recipes/_components/RecipesArray'
import type { RecipeArrayDeleteBody } from '@/app/api/recipes/route'

export type RecipesResponse = {
 id: string;
 name: string;
 image: string;
 recipeUrl: string;
 favorite: boolean;
 userId: string;
 createdAt: Date;
 updatedAt: Date;
}[]


export default function FavoriteRecipes() {

  const { token } = useSupabaseSession()

  const { data, isLoading, error, mutate } = useFetch("/api/recipes")

  const recipes: RecipesResponse = data ? data.recipes : [];

  const favoriteRecipes : RecipesResponse = recipes ? recipes.filter(f => f.favorite === true) : [];


  if (isLoading) {
    return <div className="mx-auto text-center mt-5">レシピ読み込み中！！！</div>
  }
  else if (error) {
    return <div className="mx-auto text-center mt-5">レシピを取得できませんでした</div>
  };


  const ListDeleteAll = async () => {
    if (!token) return
    try {

      const res: Response = await fetch("/api/recipes", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({})
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }

      alert('レシピ一覧を削除しました。')
      await mutate()
    }
    catch {
      alert('レシピ一覧の削除に失敗しました。')
    }
  }


  return (
    <RecipesArray
      values={favoriteRecipes ?? undefined}
      onDeleteAll={ListDeleteAll}
    />

  );

}
