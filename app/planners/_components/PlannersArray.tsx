import Link from "next/link";
import Image from 'next/image';
import { getRecipeImageUrl } from "@/app/_components/getImage"
import type { PlannersResponse } from "../page";

type Props = {
  values?: PlannersResponse
  onDeleteAll: () => void
};


export const PlannersArray = ({
  values,
  onDeleteAll,
}: Props
) => {

  return (
    <>
      <span className="flex items-center translate-x-275 py-5 gap-5">
        <button className="flex justify-center items-center bg-red-500
                            text-xl text-white font-semibold h-10 w-20
                            rounded-lg" type="button"
          onClick={() => onDeleteAll()}
        >
          全削除
        </button>
        <Link href={"/planners/new_planner"} className="flex justify-center items-center
       text-white text-3xl bg-green-400 border-2 border-green-400 rounded-lg h-10 w-10  py-5">
          +
        </Link>
      </span>

      <div className="grid grid-cols-2 justify-items-center gap-10 w-fit mx-auto">

        {values?.map(elem => (

          <Link href={`/planners/${elem.id}`}>
            <section key={elem.id} className="rounded-2xl border-2 border-orange-400 h-45 w-55 gap-3 py-6">
              <div className="flex flex-col justify-center items-center">
                <Image src={getRecipeImageUrl(elem.recipe.image)} alt="recipe_image" width={150} height={150} className="flex justify-center items-center rounded-lg" />
                <span className="rouded-2xl text-center m-3 font-semibold ">
                  {elem.recipe.name}
                </span>
              </div>
            </section>
          </Link>
        ))}
      </div>

    </>
  );

}
