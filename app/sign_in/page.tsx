'use client'

import { supabase } from '@/app/_libs/supabase'
import { useRouter } from 'next/navigation'
import type { Data } from '../sign_up/page';
import { useForm } from 'react-hook-form';
import Link from 'next/link';


const defaultValues: Data = {
  email: '',
  password: ''
}

export default function Page() {
  const router = useRouter()

  const onSubmit = async (data: Data) => {

    const { data: SessionData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) {
      alert('ログインに失敗しました')
    } else {

      await fetch('/api/account', {
        method: 'POST',
        headers: { Authorization: SessionData.session.access_token },
      })
      router.replace('/home')

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


    if (error)  return alert('ログインに失敗しました')

  }

  const {
    register,
    handleSubmit,
    formState: { isLoading, errors }
  } = useForm<Data>({ defaultValues })

  return (
    <div className="flex justify-center pt-20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 w-full max-w-100">

        <div className='bg-white p-10 rounded-4xl shadow-md shadow-gray-800'>
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
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
              placeholder="name@company.com"
              {...register('email', {
                required: 'メールアドレスは必須です。',
              })}
              disabled={isLoading}
            />
          </div>

          <div className="justify-center mx-auto container items-center text-red-500">{errors.email?.message}</div>

          <div className='mt-5'>
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
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
              {...register('password', {
                required: 'パスワードは必須です。',
              })}
              disabled={isLoading}
            />
          </div>

          <div className="justify-center mx-auto container items-center text-red-500">{errors.password?.message}</div>

          <div className='mt-5'>
            <button
              type="submit"
              className="w-full justify-center text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              disabled={isLoading}
            >
              ログイン
            </button>
            <Link
              href='/send_mail'
              className='flex justify-center items-center text-blue-600 text-sm focus:text-blue-800'
            >
              パスワードを忘れた方はこちら
            </Link>
          </div>

          <div className='flex justify-center items-center mt-5'>
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

        <div className='mt-5 bg-white p-10 rounded-4xl shadow-md shadow-gray-400'>
          <div className='flex justify-center font-bold'>
            新規登録の方はこちら！！
          </div>
          <Link
            href='/sign_up'
            className="mt-5 flex justify-center max-w-3xl text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            会員登録を行う
          </Link>
        </div>

      </form>
    </div>
  )
}
