import { useForm } from "react-hook-form";
import { getRecipeImageUrl } from "@/app/_components/getImage"
import Link from "next/link";
import Image from 'next/image';
import { Fragment } from "react/jsx-runtime";
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


export const AccountForm = ({
  values,
  recipes,
}: Props
) => {


  return (
    <>

      <div className='flex p-10'>

        <aside className="flex flex-col gap-10 sticky top-0 h-screen w-64 shrink-0 bg-amber-50 text-white text-xl font-bold p-8 text-center border-r-4 border-gray-100">

          <Link href="/home" className='p-3 block bg-orange-200 hover:bg-orange-500 rounded-2xl'>メイン</Link>
          <Link href="/recipes/favorite_recipe" className='p-3 block bg-orange-200 hover:bg-orange-500 rounded-2xl'>お気に入りレシピ</Link>
          <Link href={`/account/${values?.id}`} className='p-3 block bg-orange-200 hover:bg-orange-500 rounded-2xl'>アカウント情報</Link>
          <Link href="/forget_password" className='p-3 block bg-orange-200 hover:bg-orange-500 rounded-2xl'>パスワード変更</Link>
          <Link href={`/account/${values?.id}`} className='p-3 block bg-orange-200 hover:bg-orange-500 rounded-2xl'>退会</Link>

        </aside>

        <section className="mx-auto flex flex-col max-w-6xl">

          <div className="flex justify-start items-start">

            <span className="text-5xl font-bold text-amber-950 mx-20">
              {values?.name}
              <span className="text-2xl font-semibold text-amber-950">
                さん
              </span>
            </span>

            <span className="text-xl font-semibold mx-50">
              お気に入りレシピ
            </span>

          </div>

          <section className="grid grid-cols-2 justify-center items-center">

            <div className="flex flex-col gap-4 size-90">
              {values && (<Image src={getRecipeImageUrl(values.icon)}
                alt="icon" width={200} height={200}
                className="w-full rounded-lg object-cover" />
              )}
            </div>

            <div className="grid grid-cols-2 justify-items-center gap-10 w-fit mx-auto border border-gray-200 rounded-4xl p-10">


              {recipes?.filter(f => f.favorite === true).map(elem => (
                <Link href={`/recipes/${elem.id}`}>
                  <section key={elem.id} className="rounded-2xl border-2 border-orange-400 h-45 w-55 gap-3 py-6">
                    <div className="flex flex-col justify-center items-center">
                      <Image src={getRecipeImageUrl(elem.image)} alt="recipe_image" width={150} height={150} className="flex justify-center items-center rounded-lg" />
                      <span className="rouded-2xl text-center m-3 font-semibold ">
                        {elem.name}
                      </span>
                    </div>
                  </section>
                </Link>
              ))}
            </div>

          </section>

        </section>

      </div>



    </>
  );

}
