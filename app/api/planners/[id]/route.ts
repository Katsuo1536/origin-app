import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type PlannerIndexResponse = {
  planner: {
    id: string
    recipeId: string
    date: Date
    userId: string
    createdAt: Date
    updatedAt: Date
    recipe: {
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
    const planner = await prisma.planner.findUnique({
      where: {
        id: id,
        userId: data.user.id,
      },
      include: {
        recipe: {
          select: {
            name: true,
            image: true,
            recipeUrl: true,
            favorite: true,
            recipeingredients: {
              select: {
                id: true,
                quantity: true,
                ingredient: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            },
            processes:{
              select:{
                id: true,
                stepNumber: true,
                description: true,
              }
            },
          },
        },
      },
    })

    if (!planner) {
      return NextResponse.json({ message: "献立が見つかりません" }, { status: 404 })
    }

    return NextResponse.json<PlannerIndexResponse>({ planner }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}


export type PlannerUpdateBody = {
  planner: {
    recipeId: string
    date: Date
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
  const req: PlannerUpdateBody = await _request.json();

  try {
    const planner = await prisma.planner.update({
      where: { id: id },
      data: {
        recipeId: req.planner.recipeId,
        date: req.planner.date,
        userId: data.user.id,
      }
    })

    return NextResponse.json({ planner }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}


export type PlannerDeleteBody = {
  planner: {
    id: string
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
    const planner = await prisma.planner.delete({
      where: {
        id: id,
        userId: data.user.id
      }
    })

    return NextResponse.json<PlannerDeleteBody>({ planner }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
