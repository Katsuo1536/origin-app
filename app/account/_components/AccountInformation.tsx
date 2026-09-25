import { getRecipeImageUrl } from "@/app/_components/getImage"
import Link from "next/link";
import Image from 'next/image';
import { RecipesResponse } from "@/app/recipes/page";



export type Data = {
  id: string
  name: string
  email: string
  icon: string
}

type Props = {
  values?: Data
  recipes?: RecipesResponse
};


export const AccountInformation = ({
  values,
  recipes,
}: Props
) => {


  return (
    <>

      <div className='flex p-10'>

        <aside className="flex flex-col gap-10 sticky top-0 h-screen w-64 shrink-0 bg-amber-50 text-white text-xl font-bold p-8 text-center border-r-4 border-gray-100">

          <Link href={`/account/${values?.id}`} className='p-3 block bg-orange-200 hover:bg-orange-500 rounded-2xl'>アカウント情報</Link>
          <Link href="/forget_password" className='p-3 block bg-orange-200 hover:bg-orange-500 rounded-2xl'>パスワード変更</Link>
          <Link href={`/account/${values?.id}`} className='p-3 block bg-orange-200 hover:bg-orange-500 rounded-2xl'>退会</Link>

        </aside>

        <section className="mx-auto flex max-w-6xl items-start gap-50 px-6 py-10">

          <div className="flex w-80 shrink-0 flex-col items-center gap-6">

            <span className="text-5xl font-bold text-amber-950">
              {values?.name}
              <span className="text-2xl font-semibold text-amber-950">
                さん
              </span>
            </span>


            {values && (<Image src={getRecipeImageUrl(values.icon)}
              alt="icon" width={200} height={200}
              className="w-full rounded-lg object-cover" />
            )}

          </div>

          <div className="flex flex-1 flex-col gap-6 mt-15">

            <h2 className="text-xl font-semibold">お気に入りレシピ</h2>

            <div className="grid grid-cols-2 justify-items-center gap-10 border border-gray-200 rounded-4xl p-10">

              {recipes?.filter(f => f.favorite).slice(0,2).map(elem => (
                <Link key={elem.id} href={`/recipes/${elem.id}`}>
                  <section className="rounded-2xl border-2 border-orange-400 h-45 w-55 py-6">
                    <div className="flex flex-col justify-center items-center">
                      <Image src={getRecipeImageUrl(elem.image)} alt="recipe_image" width={150} height={150} className="rounded-lg" />
                      <span className="text-center m-3 font-semibold">
                        {elem.name}
                      </span>
                    </div>
                  </section>
                </Link>
              ))}
            </div>

          </div>

        </section>

      </div>


    </>
  );

}
