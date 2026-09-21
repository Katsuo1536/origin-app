import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from 'next/image';
import type { RecipeArrayResponse } from "@/app/api/recipes/route";
import { getRecipeImageUrl } from "../page";

type Props = {
  values?: RecipeArrayResponse
  onDeleteAll: () => void
};


export const RecipesArray = ({
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
        <Link href={"/lists/new_recipe"} className="flex justify-center items-center
       text-white text-3xl bg-green-400 border-2 border-green-400 rounded-lg h-10 w-10  py-5">
          +
        </Link>
      </span>

      <div className="flex flex-col-2 items-center justify-center gap-3 py-5">

        {values?.recipes?.map(elem => (
          <div key={elem.id} className="flex flex-col-2 gap-10 justify-center items-center">

              <Image src={getRecipeImageUrl(elem.image)} alt="recipe_image" width={200} height={200} />

            <span className="flex items-center  justify-between
                  border border-gray-300 h-7 w-80 rounded-lg
                  px-3 py-7">

              <span className="text-black  text-2xl">
                {elem.name}{elem.id}
              </span>
            </span>
          </div>
        ))}


      </div>
    </>
  );

}
