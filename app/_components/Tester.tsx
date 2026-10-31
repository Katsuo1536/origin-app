'use client'

import { supabase } from "../_libs/supabase"
import { useRouter } from "next/navigation"

const test_email = 'greenboys193+test@gmail.com'
const test_pass = 'taberu_test'

type Props = {
  className?: string;
};

export const Tester = (
  //引数内で分割代入の初期値設定
  { className = "" }: Props
) => {

  const router = useRouter()

  const onTest = async () => {

    const { error } = await supabase.auth.signInWithPassword({
      email: test_email,
      password: test_pass
    })

    if (error) {
      alert('ログインに失敗しました')
    } else {
      router.push('/home')
    }
  }

  return (
    <button onClick={onTest} className={`not-md:whitespace-nowrap text-white bg-orange-400 border-2 border-orange-400 rounded-lg px-1 ${className}`}>
      ゲスト
    </button>
  )

}