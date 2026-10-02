'use client'

import { supabase } from '@/app/_libs/supabase'
import { useForm } from "react-hook-form";


export type Data = {
  email: string,
  password: string
}

const defaultValues: Data = {
  email: '',
  password: ''
};

export default function Page() {

  const onSubmit = async (data: Data) => {


    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_LOGIN_URL}/login`,
      },
    })


    if (error) {
      alert('登録に失敗しました')
    } else {
      alert('確認メールを送信しました。')
    }

  }

  const onOAuth = async () => {

    const redirectGoogle = `${process.env.NEXT_PUBLIC_LOGIN_URL}/home/auth`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectGoogle
      }
    })


    if (error) return alert('ログインに失敗しました')

  }


  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<Data>({ defaultValues })

  return (
    <div className="flex justify-center pt-20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-100">

        <div className='bg-white py-20 px-10 rounded-4xl shadow-md shadow-gray-800'>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="name@company.com"
              {...register('email', {
                required: 'メールアドレスは必須です。',
              })}
              disabled={isSubmitting}
            />
          </div>

          <div className="justify-center mx-auto container items-center text-red-500">{errors.email?.message}</div>

          <div className='mt-8'>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              パスワード
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              {...register('password', {
                required: 'パスワードは必須です。',
              })}
              disabled={isSubmitting}
            />
          </div>

          <div className="justify-center mx-auto container items-center text-red-500">{errors.password?.message}</div>

          <div className='mt-8'>
            <button
              type="submit"
              className="w-full justify-center text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              disabled={isSubmitting}
            >
              登録
            </button>
          </div>

          <div className='mt-8 flex items-center justify-center font-semibold'>
            または
          </div>

          <div className='flex justify-center items-center w-full mt-5'>
            <button
              type='button'
              onClick={onOAuth}
              className=" text-orange-700 border-2 border-amber-600 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-orange-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Googleでログイン
            </button>
          </div>

        </div>

      </form>
    </div>

  )
}

