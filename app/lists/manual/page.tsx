"use client";
import { ManualForm, Data } from "@/app/lists/manual/_components/ManualForm"
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useRouter } from "next/navigation";

export type ManualRequest = {
  list: {
    name: string
    quantity: string
    recipeId: string | null
  }
}


export default function Manual() {

  const { token } = useSupabaseSession()
  const router = useRouter();


  const ManualPost = async (data: Data) => {
    if (!token) return
    try {

      const body: ManualRequest = {
        list: {
          name: data.name,
          quantity: data.quantity,
          recipeId: null
        }
      }

      const res: Response = await fetch("/api/lists/manual", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(body)
      })

      alert('材料を追加しました。')
      router.push('/lists')
    }
    catch {
      alert('材料の追加に失敗しました。')
    }
  }


  return (
    <>

      <div className="flex gap-20">

        <ManualForm
          onPost={ManualPost}
        />

      </div>

    </>
  );

}
