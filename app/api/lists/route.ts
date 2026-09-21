import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";
import type { ListIndexRequest } from "./manual/route";


export type ListsArrayResponse = {
  lists: {
    id: string
    userId: string
    name: string
    quantity: string
    recipeId: string | null
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
    const lists = await prisma.shoppingList.findMany({
      where: {
        userId: data.user.id
      },
      orderBy: {
        createdAt: 'desc',
      },
    })


    return NextResponse.json<ListsArrayResponse>({ lists }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

export type DeleteKeyId = {
  listId: string
}

export const DELETE = async (_request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  //フロント側からリクエストの受け取り
  const req: DeleteKeyId = await _request.json();

  try {
    const lists = await prisma.shoppingList.deleteMany({
      where: {
        //id(listId), 全て削除や選択項目の削除の可能性あり？for文で回す方法もあり
        ...(req.listId ? { id: req.listId } : {}),
        userId: data.user.id,
      }
    })

    return NextResponse.json({ status: 200, count: lists.count })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}