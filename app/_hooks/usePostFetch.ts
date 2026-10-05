import useSWR from 'swr'
import { supabase } from '../_libs/supabase'
import type { UserRequest } from '../api/account/route'
import { useRouter } from 'next/navigation'

export function usePostFetch(url: string) {

  const router = useRouter()

  const fetcher = async () => {

    const { data } = await supabase.auth.getSession()
    if (!data.session?.access_token) return


    const body: UserRequest = {
      user: {
        name: data.session.user.user_metadata.name,
        email: data.session.user.email ?? '',
        iconImageKey: data.session.user.user_metadata.picture,
      }
    }

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: data.session?.access_token ?? ''
      },
      body: JSON.stringify(body)
    })

    router.push('/home')

  }

  return useSWR(url ?? null, fetcher)
}