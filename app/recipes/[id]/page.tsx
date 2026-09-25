"use client";

import { RecipeForm, Data } from './_components/RecipeForm';
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useFetch } from "@/app/_hooks/useFetch";
import type { RecipeUpdateBody } from '@/app/api/recipes/[id]/route';
import { useRouter, useParams } from 'next/navigation';
import { CreateListsBody } from '@/app/api/lists/new_lists/route';


export default function Recipe() {

  const { token } = useSupabaseSession()

  const router = useRouter()
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error, mutate } = useFetch(`/api/recipes/${id}`)

  const recipe: Data = data ? data.recipe : undefined;

  console.log(recipe)

  if (isLoading) {
    return <div className="mx-auto text-center mt-5">レシピ読み込み中！！！</div>
  }
  else if (error) {
    return <div className="mx-auto text-center mt-5">レシピを取得できませんでした</div>
  };

  const RecipeUpdate = async (data: Data) => {
    if (!token) return
    try {

      const body: RecipeUpdateBody = {
        recipe: {
          id: data.id,
          name: data.name,
          image: data.image,
          recipeUrl: data.recipeUrl,
          favorite: data.favorite,
          recipeingredients: data.recipeingredients,
          processes: data.processes,
        }

      }

      const res: Response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }


      alert('レシピを記録しました。')
      await mutate()
    }
    catch {
      alert('レシピの記録に失敗しました。')
    }
  }


  type RecipeDeleteId = {
    recipeId: string
  }

  const RecipeDelete = async (id: string) => {
    if (!token) return
    try {

      const body: RecipeDeleteId = {
        recipeId: id
      }

      const res: Response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }

      alert('レシピを削除しました。')
      router.push("/recipes")
    }
    catch {
      alert('レシピの削除に失敗しました。')
    }
  }


  const CreateLists = async (data: Data) => {
    if (!token) return
    try {

      const body: CreateListsBody = {
        lists: data.recipeingredients.map(elem => ({
          name: elem.ingredient.name,
          quantity: elem.quantity,
          recipeId: id,
        }))
      }

      const res: Response = await fetch('/api/lists/new_lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }


      alert(`${data.name}から買い物リスト作成しました。`)
      router.push('/lists')
    }
    catch {
      alert(`${data.name}から買い物リスト作成に失敗しました。`)
    }
  }


  return (
    <>

      <div className="flex gap-20">

        <RecipeForm
          values={recipe ? {
            id: recipe.id,
            name: recipe.name,
            image: recipe.image,
            recipeUrl: recipe.recipeUrl,
            favorite: recipe.favorite,
            recipeingredients: recipe.recipeingredients,
            processes: recipe.processes,
          } : undefined}
          onUpdate={RecipeUpdate}
          onDelete={RecipeDelete}
          onCreateLists={CreateLists}

        />

      </div>

    </>
  );

}
