"use client";

import { useFetch } from "@/app/_hooks/useFetch";
import { UserResponse } from "@/app/api/account/route";
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useRouter, useParams } from 'next/navigation';
import { UserUpdateBody } from "@/app/api/account/[id]/route";
import { AccountForm, Data } from "./_components/AccountForm";




export default function Account() {

  const { token } = useSupabaseSession()

  const router = useRouter()
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error, mutate } = useFetch("/api/account")

  const account: UserResponse = data ? data : '';


  if (isLoading) {
    return <div className="mx-auto text-center mt-5">アカウント読み込み中！！！</div>
  }
  else if (error) {
    return <div className="mx-auto text-center mt-5">アカウントを取得できませんでした</div>
  };


  const UserUpdate = async (data: Data) => {
    if (!token) return
    try {

      const body: UserUpdateBody = {
        user: {
          name : data.name,
          email : data.email,
          iconImageKey : data.iconImageKey
        }
      }

      const res: Response = await fetch(`/api/account/${id}`, {
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


      alert('アカウント情報を更新しました。')
      await mutate()
    }
    catch {
      alert('アカウント情報の更新に失敗しました。')
    }
  }


  const UserDelete = async () => {
    if (!token) return
    try {


      const res: Response = await fetch(`/api/account/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }

      alert('アカウントを削除しました。')
      router.push("/")
    }
    catch {
      alert('アカウントの削除に失敗しました。')
    }
  }


  return (
    <AccountForm
      values={account.user ?? undefined}
      onUpdate={UserUpdate}
      onDelete={UserDelete}
    />

  );

}
