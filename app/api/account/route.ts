import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type UserResponse = {
  user: {
    id: string
    name: string
    email: string
    iconImageKey: string
    createdAt: Date
    updatedAt: Date
  }
}

export type UserRequest = {
  user: {
    name: string,
    email: string,
    iconImageKey: string
  }
}

export const GET = async (request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)


  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })


  try {
    const user = await prisma.user.findUnique({
      where: {
        id: data.user.id,
      }
    })

    if (!user) {
      return NextResponse.json({ message: "アカウントが見つかりません" }, { status: 404 })
    }

    return NextResponse.json<UserResponse>({ user }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}


export const POST = async (request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)


  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  const req: UserRequest = await request.json();


  try {
    const user = await prisma.user.upsert({
      where: {
        id: data.user.id,
      },
      create: {
        id: data.user.id,
        name: data.user.email ?? 'sample_user',
        email: data.user.email ?? 'sample@taberu.com',
        iconImageKey: req.user.iconImageKey ?? '',
      },
      update: {},
    })

    if (!user) {
      return NextResponse.json({ message: "アカウントが見つかりません" }, { status: 404 })
    }

    return NextResponse.json<UserRequest>({ user }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

