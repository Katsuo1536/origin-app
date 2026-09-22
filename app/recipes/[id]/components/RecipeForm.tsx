import { useForm } from "react-hook-form";
import { getRecipeImageUrl } from "@/app/_components/getImage"
import Link from "next/link";
import Image from 'next/image';

export type Data = {
  id: string
  name: string
  image: string
  recipeUrl: string
  favorite: boolean
  recipeingredients: {
    id: string
    quantity: string
    ingredient: {
      id: string
      name: string
    }
  }[]
  processes: {
    id: string
    stepNumber: number
    description: string
  }[]
}

const defaultValues: Data = {
  id: '',
  name: '',
  image: '',
  recipeUrl: '',
  favorite: false,
  recipeingredients: [],
  processes: []
};

type Props = {
  values?: Data
  onUpdate: (data: Data) => void
  onDelete: (id: string) => void
};


export const RecipeForm = ({
  values,
  onUpdate,
  onDelete,
}: Props
) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Data>({
    defaultValues,
    values,
  });


  const handleUpdate = async (data: Data) => {
    await onUpdate(data)
    reset()
  }


  return (
    <form className="flex w-full flex-col items-center m-10"
      onSubmit={handleSubmit(handleUpdate)}>

      <div className="flex justify-center items-center 
      text-2xl text-amber-950 font-bold ">
        {values?.name}
      </div>


      <section className="grid grid-cols-2 m-10">

        <section className="flex flex-col justify-center items-center">

          <div className="flex justify-center items-center">
            {values && (<Image src={getRecipeImageUrl(values?.image)}
              alt="recipe_image" width={300} height={300}
              className="flex justify-center items-center rounded-lg" />
            )}
          </div>
          <div className="m-15 h-auto w-auto bg-orange-100 rounded-lg text-xl p-3">
            {values?.recipeingredients.map((elem, index) => (
              <div key={elem.id} className=" grid grid-cols-2 justify-items-center ">
                <input className="text-center font-bold w-40"
                  {...register(`recipeingredients.${index}.ingredient.name`, {
                  })}
                  disabled={isSubmitting} />
                <input className="text-end text-gray-500 w-30"
                  {...register(`recipeingredients.${index}.quantity`, {
                  })}
                  disabled={isSubmitting} />
              </div>
              //  <div className="flex justify-center mx-auto items-center text-red-500">{errors.elem?.message}</div> 

            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 justify-items-centercenter ">
          {values?.processes.map((elem, index) => (
            <>
              <span className="">
                {elem.stepNumber}
              </span>
              <input key={elem.id} className="text-center w-[64ch] "
                {...register(`processes.${index}.description`, {
                })}
                disabled={isSubmitting} />
            </>

            //  <div className="flex justify-center mx-auto items-center text-red-500">{errors.elem?.message}</div> 

          ))}
        </section>

      </section>

      <div className="flex justify-center mx-auto items-center">
        <Link href={"/recipes"}>
          <button className="border border-gray-500 text-gray-500 rounded-2xl text-2xl font-bold p-3 mr-30  h-20 w-30" type="submit" disabled={isSubmitting}>
            削除
          </button>
        </Link>

        <button className="bg-green-400 text-white text-2xl rounded-2xl font-bold p-3 h-20 w-30"
          onClick={handleSubmit(handleUpdate)}
          disabled={isSubmitting}
        >
          更新</button>


      </div>

    </form >
  );

}
