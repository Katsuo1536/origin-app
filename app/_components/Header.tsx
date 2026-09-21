'use client'

import Link from 'next/link';
import { useSupabaseSession } from '../_hooks/useSupabaseSession'
import { supabase } from '../_libs/supabase'
import { useRouter } from 'next/navigation'
import Image from "next/image";
import { usePathname } from 'next/navigation'

export const Header = () => {
  
  const pathname = usePathname()
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const { session, isLoading } = useSupabaseSession()

  const components: { name: string, link: string }[] =
    [{ name: "買い物リスト", link: "lists" },
    { name: "献立", link: "planners" },
    { name: "レシピ", link: "recipe" },
    { name: "予算", link: "budget" },
    { name: "アカウント", link: "account" }];

  return (

    <header className="bg-white">
      <nav className="flex justify-between mx-auto container items-center">

        {(!isLoading) && (
          <>
            {session ? (
              <>
                <Link href="/home" ><Image src="/Logo_TABERU.png" alt="" width={125} height={125} /></Link>


                <span className="text-gray-300  px-1 py-1 text-2xl">
                  {components.map(elem =>
                    <Link key={`${elem.link}`}
                    href={`/${elem.link}`} className={`text-2xl px-2 py-1 ${pathname.startsWith(`/${elem.link}`) ? 'text-orange-500 font-bold' : 'text-gray-300' }`}>
                      {elem.name}
                    </Link>
                  )}
                </span>
              </>
            ) : (
              <Link href="/" ><Image src="/Logo_TABERU.png" alt="" width={125} height={125} /></Link>
            )}
          </>
        )}





        {(!isLoading) && (
          <div className="flex items-center gap-4">
            {session ? (
              <>
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
