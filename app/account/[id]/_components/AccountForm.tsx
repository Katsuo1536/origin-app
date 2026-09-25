import { getRecipeImageUrl } from "@/app/_components/getImage"
import Link from "next/link";
import Image from 'next/image';



export type Data = {
  id: string
  name: string
  email: string
  icon: string
}

type Props = {
  values?: Data
};


export const AccountForm = ({
  values,
}: Props
) => {


  return (
    <>

      <div className='flex p-10'>

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

              {recipes?.filter(f => f.favorite).map(elem => (
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
