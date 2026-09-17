import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type RecipePostType = {
  recipe: {
    id: string
    name: string
    image: string
    recipeUrl: string
    favorite: boolean
    userId: string
    createdAt: Date
    updatedAt: Date
    recipeingredients: {
      id: string
      quantity: string
      ingredient: {
        id: string
        name: string
      }
    }[]
    processes: {
      id: string
      stepNumber: number
      description: string
      recipeId: string
      createdAt: Date
      updatedAt: Date
    }[]
  }
}


export const POST = async (_request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  //フロント側からリクエストの受け取り
  const req: RecipePostType = await _request.json();

  try {
    const recipe = await prisma.recipe.create({
      data: {
        name: req.recipe.name,
        image: req.recipe.image,
        recipeUrl: req.recipe.recipeUrl,
        favorite: req.recipe.favorite,
        userId: data.user.id,
      }
    })

    for (const recipeingredient of req.recipe.recipeingredients) {
      await prisma.recipeIngredient.create({
        data: {
          quantity: recipeingredient.quantity,
          recipeId: recipe.id,
          ingredientId: recipeingredient.ingredient.id,
        }
      })
    }

    for (const process of req.recipe.processes) {
      await prisma.process.create({
        data: {
          stepNumber: process.stepNumber,
          description: process.description,
          recipeId: recipe.id,
        }
      })
    }

    return NextResponse.json({ recipe }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
