'use client'

import { usePostFetch } from '@/app/_hooks/usePostFetch';


export default function Page() {

  usePostFetch('/api/account')

  return <div className='flex justify-center items-center'>
    認証中！！！
  </div>

}
