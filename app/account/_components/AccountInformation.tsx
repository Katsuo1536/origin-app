import { getRecipeImageUrl } from "@/app/_components/getImage"
import Link from "next/link";
import Image from 'next/image';
import { RecipesResponse } from "@/app/recipes/page";
import { useState } from 'react';



export type Data = {
  id: string
  name: string
  email: string
  iconImageKey: string
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

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const contents: { name: string, link: string }[] = [
    { name: 'アカウント情報', link: `/account/${values?.id}` },
    { name: 'パスワード変更', link: '/forget_password' },
    { name: '退会', link: `/account/${values?.id}` }
  ]

  return (
    <>
      <div className="md:hidden pt-1 px-3 relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-2xl bg-orange-400 p-1 rounded-lg">
          {isOpen ? '✕' : '☰'}
        </button>

        {isOpen && (
          <nav className="absolute left-6 right-6 mt-2 flex flex-col gap-3 rounded-2xl bg-white p-4 text-center font-bold text-white shadow-lg">
            {contents.map(e =>
              <Link href={e.link} className='p-3 block bg-orange-200 hover:bg-orange-500 active:bg-orange-500 rounded-2xl'>{e.name}</Link>
            )}
          </nav>
        )}
      </div>

      <div className='flex md:p-10'>

        <aside className="hidden md:flex flex-col gap-10 sticky top-0 h-screen w-64 shrink-0 bg-amber-50 text-white text-xl font-bold p-8 text-center border-r-4 border-gray-100">

          {contents.map(e =>
            <Link href={e.link} className='p-3 block bg-orange-200 hover:bg-orange-500 active:bg-orange-500 rounded-2xl'>{e.name}</Link>
          )}

        </aside>

        <section className="grid grid-cols-1 mx-auto md:flex md:max-w-6xl items-start md:gap-50 px-6 md:py-10">

          <div className="grid grid-cols-1 md:flex md:w-80 shrink-0 md:flex-col items-center gap-6">

            <span className="text-5xl font-bold text-amber-950 mx-auto">
              {values?.name}
              <span className="text-2xl font-semibold text-amber-950">
                さん
              </span>
            </span>


            {values && (<Image src={getRecipeImageUrl(values.iconImageKey)}
              alt="icon" width={200} height={200}
              className="size-60 md:size-80 rounded-full object-cover bg-amber-50" />
            )}

          </div>

          <div className="flex flex-1 flex-col md:gap-6 mt-15">

            <h2 className="text-xl font-semibold">お気に入りレシピ</h2>

            {recipes && (

              <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center gap-5 md:gap-10 border border-gray-200 rounded-4xl py-5 md:p-10">

                {recipes?.filter(f => f.favorite).slice(0, 2).map(elem => (
                  <Link key={elem.id} href={`/recipes/${elem.id}`}>
                    <section className="rounded-2xl border-2 border-orange-400 h-45 w-55 py-6">
                      <div className="flex flex-col justify-center items-center">
                        <Image src={getRecipeImageUrl(elem.recipeImageKey)} alt="recipe_image" width={150} height={150} className="rounded-lg" />
                        <span className="text-center m-3 font-semibold">
                          {elem.name}
                        </span>
                      </div>
                    </section>
                  </Link>
                ))}

              </div>

            )}

          </div>

        </section>

      </div>


    </>
  );

}
