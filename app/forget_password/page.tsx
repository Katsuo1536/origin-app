'use client'

import { supabase } from '@/app/_libs/supabase' // 前の工程で作成したファイル
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';


export type Data = {
  password: string
}

const defaultValues: Data = {
  password: ''
};

export default function Page() {

  const router = useRouter()

  const onSubmit = async (data: Data) => {


    const { error } = await supabase.auth.updateUser({
      password: data.password
    })


    if (error) {
      alert('パスワードの更新に失敗しました')
    } else {
      alert('パスワードを更新しました。')
      router.push('/sign_in')
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

        <div className='bg-white py-20 px-10 rounded-4xl shadow-md shadow-gray-800'>

          <div
            className="flex font-semibold text-black text-xl justify-center items-center"
          >
            新しいパスワードを入力
          </div>

          <div className='mt-8'>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-500"
            >
              新しいパスワード
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




        </div>

      </form>
    </div>

  )
}

