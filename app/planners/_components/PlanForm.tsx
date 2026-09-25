import { useForm } from "react-hook-form";
import { getRecipeImageUrl } from "@/app/_components/getImage"
import Link from "next/link";
import Image from 'next/image';
import { Fragment } from "react/jsx-runtime";
import { time } from "@/app/_utils/time";
import { RecipesResponse } from "@/app/recipes/page";

export type Data = {
  id: string
  recipeId: string
  date: string
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
  date: new Date().toLocaleDateString('sv-SE'),
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
  mode: 'new' | 'edit',
  values?: Data,
  array?: RecipesResponse,
  onSubmit: (data: Data) => void
  onDelete?: (id: string) => void
  onCreateLists?: (data: Data) => void
  onFetch?: (recipeId: string) => void
};


export const PlanForm = ({
  mode,
  array,
  values,
  onSubmit,
  onDelete,
  onCreateLists,
  onFetch,
}: Props
) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, }
  } = useForm<Data>({
    defaultValues,
    values,
  });


  const Submit = async (data: Data) => {
    await onSubmit(data)
    reset()
  }

  const dateOptions = Array.from({ length: 8 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })



  return (
    <form className="flex w-full flex-col items-center m-10"
      onSubmit={handleSubmit(Submit)}>

      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-80">
        <span />

        {mode === 'edit' ? (
          <span className="text-2xl font-bold text-amber-950">
            {values?.recipe.name}
          </span>
        ) : (
          <>
            {onFetch && (
              <select className="cursor-pointer rounded-2xl bg-amber-950 px-2 py-1 text-2xl font-semibold text-white"
                {...register('recipeId', {
                  onChange: (e) => onFetch(e.target.value)
                })}
                disabled={isSubmitting}
              >
                <option value="">レシピを選択</option>
                {array?.map((r) => {
                  const value = r.id
                  return (
                    <option key={value} value={value}>
                      {r.name}
                    </option>
                  )
                })}
              </select>
            )}

          </>

        )}

        <span className="flex items-center gap-5 justify-self-end ">

          {mode === 'edit' ? (
            <>
              {onCreateLists && (
                <button className="rounded-2xl bg-amber-700
                      px-4 py-1 text-md font-semibold text-white"
                  onClick={handleSubmit(onCreateLists)}
                  disabled={isSubmitting}
                >
                  <Image src="/shoppingLogo.png" alt="ShoppingBag_Logo" width={28} height={50} />
                </button>
              )}
            </>
          ) : null}

          <select className="cursor-pointer rounded-2xl bg-orange-500 px-2 py-1 text-xl font-semibold text-white"
            {...register('date', {
            })}
            disabled={isSubmitting}
          >
            {dateOptions.map((d) => {
              const value = d.toLocaleDateString('sv-SE')
              return (
                <option key={value} value={value}>
                  {time(d)}
                </option>
              )
            })}
          </select>


          <span className="rounded-2xl bg-green-500 px-2 py-1 text-lg font-semibold text-white">
            人数を自動変換
            {/* mastaraからの変換を予定　後にbottonになりそう */}
          </span>
        </span>
      </div>


      {values && (

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 md:grid-cols-[320px_1fr] md:items-start">


          <section className="flex flex-col justify-center items-center">

            {values?.recipe?.image && (

              <div className="flex flex-col gap-4">
                {values && (<Image src={getRecipeImageUrl(values?.recipe.image)}
                  alt="recipe_image" width={300} height={300}
                  className="w-full rounded-lg object-cover" />
                )}
              </div>
            )}

            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 rounded-lg bg-orange-100 p-3 m-5">
              {values?.recipe?.recipeingredients.map((elem, index) => (
                <Fragment key={elem.id} >
                  <span className="w-full bg-transparent font-bold">
                    {values?.recipe?.recipeingredients?.[index].ingredient.name}
                  </span>
                  <span className="w-40 bg-transparent text-right text-gray-500">
                    {values?.recipe?.recipeingredients?.[index].quantity}
                  </span>
                </Fragment>
              ))}
            </div>
          </section>


          <section className="flex flex-col gap-3 rounded-lg bg-orange-200 p-5">
            {values?.recipe?.processes?.map((elem, index) => (
              <div className="flex items-center gap-3">
                <span className="w-8 shrink-0 pt-2 text-xl font-bold tabular-nums">
                  {`${elem.stepNumber}. `}
                </span>
                <span
                  key={elem.id} className="field-sizing-content min-h-10 
              flex-1 resize-none rounded 
              px-3 py-2 text-lg font-medium">
                  {values?.recipe?.processes?.[index].description}
                </span>
              </div>
            ))}
          </section>

        </section>

      )}

      {values && (

        <div className="flex justify-center mx-auto items-center">

          {mode === 'edit' ? (
            <>
              {onDelete && (
                <Link href={"/recipes"}>
                  {values && (
                    <button className="border border-gray-500 text-gray-500 rounded-2xl text-2xl font-bold p-3 mr-30  h-20 w-30"
                      type="button" onClick={() => onDelete(values?.id)}
                      disabled={isSubmitting}>
                      削除
                    </button>
                  )}
                </Link>
              )}

              <button className="bg-green-400 text-white text-2xl rounded-2xl font-bold p-3 h-20 w-30"
                onClick={handleSubmit(Submit)}
                disabled={isSubmitting}
              >
                更新</button>
            </>
          ) : (
            <button className="bg-green-400 text-white text-2xl rounded-2xl font-bold p-3 h-20 w-30"
              onClick={handleSubmit(Submit)}
              disabled={isSubmitting}
            >
              作成
            </button>
          )}

        </div>

      )}


    </form >
  );

}
