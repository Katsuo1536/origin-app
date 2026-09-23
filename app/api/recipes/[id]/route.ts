import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type RecipeResponse = {
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
    }[]
  }
}

export const GET = async (_request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  console.log("authError:", error);


  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  const { id } = await params;

  try {
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: id,
        userId: data.user.id,
      },
      include: {
        recipeingredients: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        processes: true,
      }
    })

    if (!recipe) {
      return NextResponse.json({ message: "アカウントが見つかりません" }, { status: 404 })
    }

    return NextResponse.json<RecipeResponse>({ recipe }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

export type RecipeUpdateBody = {
  recipe: {
    id: string
    name: string
    image: string
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

export const PUT = async (_request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  const { id } = await params;

  //フロント側からリクエストの受け取り
  const req: RecipeUpdateBody = await _request.json();

  try {
    const recipe = await prisma.recipe.update({
      where: { id: id },
      data: {
        name: req.recipe.name,
        image: req.recipe.image,
        recipeUrl: req.recipe.recipeUrl,
        favorite: req.recipe.favorite,
        userId: data.user.id,
      }
    })


    await prisma.recipeIngredient.deleteMany({
      where: { recipeId: id },
    })

    for (const recipeingredient of req.recipe.recipeingredients) {
      await prisma.recipeIngredient.create({
        data: {
          quantity: recipeingredient.quantity,
          recipeId: id,
          ingredientId: recipeingredient.ingredient.id,
        }
      })
    }


    await prisma.process.deleteMany({
      where: { recipeId: id },
    })

    for (const process of req.recipe.processes) {
      await prisma.process.create({
        data: {
          stepNumber: process.stepNumber,
          description: process.description,
          recipeId: id,
        }
      })
    }

    return NextResponse.json({ recipe }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}


export type RecipeDeleteBody = {
  recipe: {
    id: string
    name: string
    image: string
    recipeUrl: string
    favorite: boolean
    userId: string
    createdAt: Date
    updatedAt: Date
  }
}

export const DELETE = async (_request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  const { id } = await params;

  try {
    const recipe = await prisma.recipe.delete({
      where: {
        id: id,
        userId: data.user.id
      }
    })

    return NextResponse.json<RecipeDeleteBody>({ recipe }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
