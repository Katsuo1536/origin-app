import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type PlannerPostType = {
  planner: {
    recipeId: string
    date: string
  }
}


export const POST = async (_request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  //フロント側からリクエストの受け取り
  const req: PlannerPostType = await _request.json();

  try {
    const planner = await prisma.planner.create({
      data: {
        recipeId: req.planner.recipeId,
        date: new Date(req.planner.date),
        userId: data.user.id,
      }
    })

    return NextResponse.json({ planner }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
