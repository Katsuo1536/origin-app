import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type UserResponse = {
  user: {
    id: string
    name: string
    email: string
    icon: string
    createdAt: Date
    updatedAt: Date
  }
}

export const GET = async (_request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  console.log("authError:", error);


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
