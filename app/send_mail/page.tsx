'use client'

import { supabase } from '@/app/_libs/supabase' // 前の工程で作成したファイル
import { useForm } from "react-hook-form";
import Link from 'next/link';


export type Data = {
  email: string
}

const defaultValues: Data = {
  email: ''
};

export default function Page() {


  const onSubmit = async (data: Data) => {

    const redirectUrl = `${process.env.NEXT_PUBLIC_LOGIN_URL}/forget_password`

    const { error } = await supabase.auth.resetPasswordForEmail(
    data.email, {
      redirectTo: redirectUrl
    })


    if (error) {
      alert('確認メールの送信に失敗しました')
    } else {
      alert('確認メールを送信しました。')
    }

  }

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<Data>({ defaultValues })

  return (
    <div className="flex justify-center pt-20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-100">

        <div className='bg-white p-10 rounded-4xl shadow-md shadow-gray-800'>

          <div className='mt-5'>
            <div
              className="flex font-semibold text-black text-xl justify-center items-center"
            >
              パスワード再設定
            </div>

            <div className='text-sm text-center mt-5 text-gray-800ß'>
              登録したメールアドレスを入力してください。
            </div>

            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-500 mt-10"
            >
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              placeholder="name@company.com"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:outline-none focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 "
              {...register('email', {
                required: 'メールアドレスは必須です。',
              })}
              disabled={isSubmitting}
            />
          </div>

          <div className="justify-center mx-auto container items-center text-red-500">{errors.email?.message}</div>

          <div className='mt-8'>
            <button
              type="submit"
              className="w-full justify-center text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              disabled={isSubmitting}
            >
              メールを送信
            </button>
          </div>

        </div>

      </form>
    </div>

  )
}

