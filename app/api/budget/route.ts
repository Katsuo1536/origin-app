import { prisma } from "@/app/_libs/prisma"
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";


export type BudgetRequest = {
  budget: {
    id: string
    balance: number
    userId: string
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
    const budget = await prisma.budget.findUnique({
      where: {
        userId: data.user.id,
      }
    })

    if (!budget) {
      return NextResponse.json({ message: "予算が見つかりません" }, { status: 404 })
    }

    return NextResponse.json<BudgetRequest>({ budget }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

export const POST = async (_request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  //フロント側からリクエストの受け取り
  const req: BudgetRequest = await _request.json();

  try {
    const budget = await prisma.budget.create({
      data: {
        userId: data.user.id,
        balance: req.budget.balance,
      }
    })



    return NextResponse.json<BudgetRequest>({ budget }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}


export const PUT = async (_request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = _request.headers.get('Authorization') ?? ''

  const { data, error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  //フロント側からリクエストの受け取り
  const req: BudgetRequest = await _request.json();

  try {
    const budget = await prisma.budget.update({
      where: { userId: data.user.id },
      data: {
        balance: req.budget.balance,
      }
    })


    return NextResponse.json<BudgetRequest>({ budget }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
