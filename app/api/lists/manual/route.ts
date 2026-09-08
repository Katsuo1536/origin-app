import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type ListIndexRequest = {
  list: {
    id: string
    userId: string
    name: string
    quantity: string
    recipeId: string | null
    createdAt: Date
    updatedAt: Date
  }
}

export const POST = async (request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  // const token = request.headers.get('Authorization') ?? ''

  // const { error } = await supabase.auth.getUser(token)

  // if (error)
  //   return NextResponse.json({ status: error.message }, { status: 401 })

  //フロント側からリクエストの受け取り　バックエンド実装中は、不要なためコメントアウト
  // const req: ListIndexRequest = await request.json();

  try {
    const list = await prisma.shoppingList.create({
      data: {
        userId: "649cadc2-edfe-4e72-a553-d49bfb89a8c5",
        name: "meat",
        quantity: "1 pack",
        // recipeId: "test-1"
      }
    })

    return NextResponse.json({ list }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
