import { useForm } from "react-hook-form";
import { getRecipeImageUrl } from "@/app/_components/getImage"
import Link from "next/link";
import Image from 'next/image';
import { Fragment } from "react/jsx-runtime";



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
  onCreateLists: (data: Data) => void
};


export const RecipeForm = ({
  values,
  onUpdate,
  onDelete,
  onCreateLists,
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
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-70">

        <span className="flex items-center gap-5 justify-self-start px-20">
          <label className="px-3 py-2 font-semibold rounded-2xl p-4 cursor-pointer border
                      border-red-500 text-red-500
                       has-[:checked]:bg-red-500 has-[:checked]:text-white">
            <input
              className="border border-b-gray-700 rounded-2xl p-4 sr-only"
              type="checkbox"
              {...register('favorite', {
              })}
              disabled={isSubmitting} />
            お気に入り
          </label>
        </span>

        <span className="text-2xl font-bold text-amber-950">
          {values?.name}
        </span>

        <span className="flex items-center gap-5 justify-self-end ">

          <button className="rounded-2xl bg-amber-700
            px-4 py-1 text-md font-semibold text-white"
            onClick={handleSubmit(onCreateLists)}
            disabled={isSubmitting}
          >
            <Image src="/shoppingLogo.png" alt="ShoppingBag_Logo" width={28} height={50} />
          </button>

          {values?.recipeUrl && (
            <Link href={values?.recipeUrl} className="rounded-2xl bg-orange-500 
            px-2 py-1 text-md font-semibold text-white"
              target="_blank" rel="noopener noreferrer">
              レシピを開く
            </Link>
          )}


          <span className="rounded-2xl bg-green-500 px-2 py-1 text-md font-semibold text-white">
            人数を自動変換
            {/* mastaraからの変換を予定　後にbottonになりそう */}
          </span>
        </span>
      </div>


      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 md:grid-cols-[320px_1fr] md:items-start">

        <section className="flex flex-col justify-center items-center">

          <div className="flex flex-col gap-4">
            {values && (<Image src={getRecipeImageUrl(values?.image)}
              alt="recipe_image" width={300} height={300}
              className="w-full rounded-lg object-cover" />
            )}
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 rounded-lg bg-orange-100 p-4 m-5">
            {values?.recipeingredients.map((elem, index) => (
              <Fragment key={elem.id} >
                <input className="w-full bg-transparent font-bold"
                  {...register(`recipeingredients.${index}.ingredient.name`, {
                    required: '材料名を入力してください',
                    minLength: { value: 1, message: '1文字以上で入力してください' },
                    maxLength: { value: 15, message: '15文字以内で入力してください' },
                  })}
                  disabled={isSubmitting} />

                <input className="w-24 bg-transparent text-right text-gray-500"
                  {...register(`recipeingredients.${index}.quantity`, {
                    required: '分量を入力してください',
                    minLength: { value: 1, message: '1文字以上で入力してください' },
                    maxLength: { value: 10, message: '10文字以内で入力してください' },
                  })}
                  disabled={isSubmitting} />

                {(errors.recipeingredients?.[index]?.ingredient?.name ||
                  errors.recipeingredients?.[index]?.quantity) && (
                    <span className="col-span-2 -mt-1 text-sm text-red-500">
                      {errors.recipeingredients[index]?.ingredient?.name?.message ??
                        errors.recipeingredients[index]?.quantity?.message}
                    </span>
                  )}


              </Fragment>


            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-lg bg-orange-200 p-5">
          {values?.processes.map((elem, index) => (
            <div key={elem.id} className="flex items-center gap-3">
              <span className="w-8 shrink-0 pt-2 text-xl font-bold tabular-nums">
                {`${elem.stepNumber}. `}
              </span>
              <textarea
                rows={2}
                className="field-sizing-content min-h-10 
              flex-1 resize-none rounded 
              px-3 py-2 text-lg font-medium"
                {...register(`processes.${index}.description`, {
                  required: '手順を入力してください',
                  minLength: { value: 1, message: '1文字以上で入力してください' },
                })}
                disabled={isSubmitting} />

              {(errors.processes?.[index]?.description) && (
                <span className="pl-11 text-sm text-red-500">
                  {errors.processes?.[index]?.description.message}
                </span>
              )}

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
