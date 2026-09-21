import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type RecipeArrayResponse = {
  recipes: {
    id: string
    name: string
    image: string
    recipeUrl: string
    favorite: boolean
    userId: string
    createdAt: Date
    updatedAt: Date
  }[]
}

export const GET = async (_request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  console.log("authError:", error);


  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })


  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        userId: data.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!recipes) {
      return NextResponse.json({ message: "アカウントが見つかりません" }, { status: 404 })
    }

    return NextResponse.json<RecipeArrayResponse>({ recipes }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
