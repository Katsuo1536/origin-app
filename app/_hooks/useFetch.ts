import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import useSWR from 'swr'


export function useFetch(url : string){

  const { token } = useSupabaseSession()

const fetcher = async () => {
  const res: Response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ?? '',
    },
  })
  const data = await res.json()

  return data;
}

const {data, isLoading, error, mutate} = useSWR(token ? url : null , fetcher);

return { data, isLoading, error, mutate}
}