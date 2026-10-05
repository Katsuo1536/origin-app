import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";
import { connect } from "http2";
import { create } from "domain";


export type RecipePostType = {
  recipe: {
    name: string
    recipeImageKey: string
    recipeUrl: string
    favorite: boolean
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
    }[]
  }
}


export const POST = async (request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  //フロント側からリクエストの受け取り
  const req: RecipePostType = await request.json();

  try {
    const recipe = await prisma.recipe.create({
      data: {
        name: req.recipe.name,
        recipeImageKey: req.recipe.recipeImageKey,
        recipeUrl: req.recipe.recipeUrl,
        favorite: req.recipe.favorite,
        userId: data.user.id,
      }
    })


    for (const recipeingredient of req.recipe.recipeingredients) {
      await prisma.recipeIngredient.create({
        data: {
          quantity: recipeingredient.quantity,
          recipe: {
            connect: {
              id: recipe.id
            }
          },
          ingredient: {
            connectOrCreate: {
              where: { name: recipeingredient.ingredient.name },
              create: {
                name: recipeingredient.ingredient.name,
                quantity: recipeingredient.quantity
              }
            }
          },
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
