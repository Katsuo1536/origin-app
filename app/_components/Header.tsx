'use client'

import Link from 'next/link';
import { useSupabaseSession } from '../_hooks/useSupabaseSession'
import { supabase } from '../_libs/supabase'
import { useRouter } from 'next/navigation'
import Image from "next/image";

export const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut()
   router.replace('/')
  }

  const { session, isLoading } = useSupabaseSession()

  return (

    <header className="bg-white">
      <nav className="flex justify-between mx-auto container items-center">
        <Link href="/" ><Image src="/Logo_TABERU.png" alt="" width={125} height={125} /></Link>

        {(!isLoading) && (
          <div className="flex items-center gap-4">
            {session ? (
              <>
                {/* <Link href="/admin" className="text-white text-1.5xl">
                  管理画面
                </Link> */}
                <button onClick={handleLogout} className="text-white bg-green-400 border-2 border-green-400 rounded-lg px-1 py-1">ログアウト</button>
              </>
            ) : (
              <>
                <Link href="/sign_in" className="text-gray-300 border-2 border-gray-300 rounded-lg px-1 py-1">
                 ログイン
                </Link>

                <Link href="/sign_up" className="text-white bg-green-400 border-2 border-green-400 rounded-lg px-1 py-1">
                  新規登録
                </Link>
              </>
            )
            }
          </div>
        )}
      </nav>
    </header>

  );
};