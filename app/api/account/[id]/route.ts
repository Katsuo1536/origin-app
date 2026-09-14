import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";
import type { UserResponse } from "@/app/api/account/route";


export const PUT = async (_request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  const { id } = await params;

  //フロント側からリクエストの受け取り
  const req: UserResponse = await _request.json();

  try {
    const user = await prisma.user.update({
      where: { id: id },
      data: {
        name: req.user.name,
        email: req.user.email,
        icon: req.user.icon,

      }
    })


    return NextResponse.json<UserResponse>({ user }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}


export const DELETE = async (_request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  const { id } = await params;

  try {
    const user = await prisma.user.delete({
      where: {
        //id(listId), 全て削除や選択項目の削除の可能性あり？for文で回す方法もあり
        id: id,
      }
    })

    return NextResponse.json<UserResponse>({ user }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}