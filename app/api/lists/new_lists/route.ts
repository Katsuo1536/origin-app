import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type RecipeListBody = {
  lists: {
    name: string
    quantity: string
    recipeId: string
  }[]
}


export const POST = async (_request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  //フロント側からリクエストの受け取り
  const req: RecipeListBody = await _request.json();

  try {

    //createManyの返り値は件数(count)
    const lists = await prisma.shoppingList.createMany({
      data: req.lists.map((list) => ({
        userId: data.user.id,
        name: list.name,
        quantity: list.quantity,
        recipeId: list.recipeId,
      })),
    })

    return NextResponse.json({ count: lists.count }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
