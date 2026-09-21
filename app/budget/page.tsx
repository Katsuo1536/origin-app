"use client";

import { BudgetForm, Data } from "@/app/budget/_components/BudgetForm";
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useFetch } from "@/app/_hooks/useFetch";
import type { BudgetRequest } from "../api/budget/route";


export type BudgetResponce = {
  id: string
  balance: number
  userId: string
  createdAt: Date
  updatedAt: Date
}


export default function Budget() {

  const { token } = useSupabaseSession()

  const { data, isLoading, error, mutate } = useFetch("/api/budget")

  const budget: BudgetResponce = data ? data.budget : '';

  if (isLoading) {
    return <div className="mx-auto text-center mt-5">予算読み込み中！！！</div>
  }
  else if (error) {
    return <div className="mx-auto text-center mt-5">予算を取得できませんでした</div>
  };




  const BudgetPost = async (data: Data) => {
    if (!token) return
    try {

      const body: BudgetRequest = {
        budget: {
          balance: data.balance
        }
      }

      const res: Response = await fetch("/api/budget", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }

      alert('予算を変更しました。')
      await mutate()
    }
    catch {
      alert('予算の変更に失敗しました。')
    }
  }

  const BudgetUpdate = async (data: Data) => {
    if (!token) return
    try {

      const body: BudgetRequest = {
        budget: {
          balance: data.balance
        }
      }

      const res: Response = await fetch("/api/budget", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }


      alert('予算を記録しました。')
      await mutate()
    }
    catch {
      alert('予算の記録に失敗しました。')
    }
  }


  return (
    <>

      <div className="flex gap-20">

        <BudgetForm
          values={budget ? {
            balance: budget.balance
          } : undefined}
          onPost={BudgetPost}
          onUpdate={BudgetUpdate}

        />

      </div>

    </>
  );

}
