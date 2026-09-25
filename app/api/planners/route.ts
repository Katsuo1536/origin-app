import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type PlannerArrayResponse = {
  planners: {
    id: string
    recipeId: string
    date: Date
    userId: string
    createdAt: Date
    updatedAt: Date
    recipe: {
      name: string
      image: string
      favorite: boolean
    }
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
    const planners = await prisma.planner.findMany({
      where: {
        userId: data.user.id,
      },
      include: {
        recipe: {
          select: {
            name: true, image: true, favorite: true
          }
        }
      },
      orderBy: {
        date: 'desc',
      },
    })

    if (!planners) {
      return NextResponse.json({ message: "献立が見つかりません" }, { status: 404 })
    }

    return NextResponse.json<PlannerArrayResponse>({ planners }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

export const DELETE = async (_request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  try {
    const planners = await prisma.planner.deleteMany({
      where: {
        userId: data.user.id
      }
    })

    return NextResponse.json({ status: 200, count: planners.count })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

