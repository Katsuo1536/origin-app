import { useForm } from "react-hook-form";
import { getRecipeImageUrl } from "@/app/_components/getImage"
import Link from "next/link";
import Image from 'next/image';
import { Fragment } from "react/jsx-runtime";
import { time } from "@/app/_utils/time";


export type Data = {
  id: string
  recipeId: string
  date: Date
  recipe: {
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
}

const defaultValues: Data = {
  id: '',
  recipeId: '',
  date: new Date,
  recipe: {
    name: '',
    image: '',
    recipeUrl: '',
    favorite: false,
    recipeingredients: [],
    processes: [],
  }
};

type Props = {
  values?: Data
  onUpdate: (data: Data) => void
  onDelete: (id: string) => void
};


export const PlanForm = ({
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

<div className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-90">
  <span />

  <span className="text-2xl font-bold text-amber-950">
    {values?.recipe.name}
  </span>

  <span className="justify-self-end rounded-2xl bg-orange-500 px-2 py-1 text-lg font-semibold text-white">
    {time(values?.date ?? new Date())}
  </span>
</div>


      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 md:grid-cols-[320px_1fr] md:items-start">

        <section className="flex flex-col justify-center items-center">

          <div className="flex flex-col gap-4">
            {values && (<Image src={getRecipeImageUrl(values?.recipe.image)}
              alt="recipe_image" width={300} height={300}
              className="w-full rounded-lg object-cover" />
            )}
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 rounded-lg bg-orange-100 p-4 m-5">
            {values?.recipe.recipeingredients.map((elem, index) => (
              <Fragment key={elem.id} >
                <span className="w-full bg-transparent font-bold">
                  {values.recipe.recipeingredients?.[index].ingredient.name}
                </span>
                <span className="w-24 bg-transparent text-right text-gray-500">
                  {values.recipe.recipeingredients?.[index].quantity}
                </span>
              </Fragment>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-lg bg-orange-200 p-5">
          {values?.recipe.processes.map((elem, index) => (
            <div className="flex items-center gap-3">
              <span className="w-8 shrink-0 pt-2 text-xl font-bold tabular-nums">
                {`${elem.stepNumber}. `}
              </span>
              <span
                key={elem.id} className="field-sizing-content min-h-10 
              flex-1 resize-none rounded 
              px-3 py-2 text-lg font-medium">
                {values.recipe.processes?.[index].description}
              </span>
            </div>
          ))}
        </section>

      </section>

      <div className="flex justify-center mx-auto items-center">
        <Link href={"/recipes"}>
          {values && (
            <button className="border border-gray-500 text-gray-500 rounded-2xl text-2xl font-bold p-3 mr-30  h-20 w-30"
              type="button" onClick={() => onDelete(values?.id)}
              disabled={isSubmitting}>
              削除
            </button>
          )}
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
