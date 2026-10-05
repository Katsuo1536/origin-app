import { useForm, useFieldArray } from "react-hook-form";
import { getRecipeImageUrl } from "@/app/_components/getImage"
import Link from "next/link";
import Image from 'next/image';
import { Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/app/_libs/supabase";


export type Data = {
  id: string
  name: string
  recipeImageKey: string
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
  recipeImageKey: '',
  recipeUrl: '',
  favorite: false,
  recipeingredients: [{
    id: '',
    quantity: '',
    ingredient: {
      id: '',
      name: '',
    }
  }],
  processes: [{
    id: '',
    stepNumber: 1,
    description: ''
  }]
};

type Props = {
  mode: 'new' | 'edit'
  values?: Data
  onSubmit: (data: Data) => void
  onDelete?: (id: string) => void
  onCreateLists?: (data: Data) => void
};


export const RecipeForm = ({
  mode,
  values,
  onSubmit,
  onDelete,
  onCreateLists,
}: Props
) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<Data>({
    defaultValues,
    values,
  });

  const [recipeImageKey, setRecipeImageKey] = useState<string>('');

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || event.target.files.length == 0) {
      return
    }

    const file = event.target.files[0]

    const filePath = `private/${uuidv4()}`


    const { data, error } = await supabase.storage
      .from('image')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      alert(error.message)
      return
    }

    setRecipeImageKey(data.path)
  }

  const [recipeImage, setRecipeImage] = useState<null | string>(null)
  useEffect(() => {
    if (!recipeImageKey) return

    try {
      // アップロード時に取得した、thumbnailImageKeyを用いて画像のURLを取得
      const fetcher = async () => {
        const {
          data: { publicUrl },
        } = await supabase.storage
          .from('image')
          .getPublicUrl(recipeImageKey)

        setRecipeImage(publicUrl)
      }

      fetcher()
    } catch (error) {
      alert('URLの取得に失敗しました。')
    }
  }, [recipeImageKey])


  const handleSubmitData = async (data: Data) => {
    await onSubmit(data)
    reset()
  }

  const new_recipeingredients = useFieldArray({ control, name: 'recipeingredients' })
  const new_processes = useFieldArray({ control, name: 'processes' })


  return (
    <form className="flex w-full flex-col items-center m-10"
      onSubmit={handleSubmit(handleSubmitData)}>
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-70">

        <span className="flex items-center gap-10 justify-self-start px-5">
          <label className="px-3 py-2 font-semibold rounded-2xl p-4 cursor-pointer border
                      border-red-500 text-red-500
                       has-checked:bg-red-500 has-checked:text-white">
            <input
              className="border border-b-gray-700 rounded-2xl p-4 sr-only"
              type="checkbox"
              {...register('favorite', {
              })}
              disabled={isSubmitting} />
            お気に入り
          </label>

          {mode === 'edit' && (
            <Link href={`/planners/new_planner?recipeId=${values?.id}`} className="px-3 py-2 font-semibold rounded-2xl p-4 
          bg-emerald-700 text-white">
              献立に追加
            </Link>
          )}

        </span>

        {mode === 'edit' ? (
          <span className="text-2xl font-bold text-amber-950">
            {values?.name}
          </span>
        ) : (
          <input className="rounded-2xl focus:ring-4 focus:outline-none focus:ring-green-800 text-2xl font-bold text-amber-950 text-center"
            {...register(`name`, {
            })}
            disabled={isSubmitting}
            placeholder="レシピ名" />
        )}

        <span className="flex items-center gap-5 justify-self-end ">

          {onCreateLists && (
            <button className="rounded-2xl bg-amber-700
            px-4 py-1 text-md font-semibold text-white"
              onClick={handleSubmit(onCreateLists)}
              disabled={isSubmitting}
            >
              <Image src="/shoppingLogo.png" alt="ShoppingBag_Logo" width={28} height={50} />
            </button>

          )}


          {mode === 'edit' ? (
            <>
              {values && (
                <Link href={values?.recipeUrl} className="rounded-2xl bg-orange-500 
            px-2 py-1 text-md font-semibold text-white"
                  target="_blank" rel="noopener noreferrer">
                  レシピを開く
                </Link>
              )}
            </>
          ) : (
            <input className="rounded-2xl bg-orange-500 
            px-2 py-1 text-md font-medium text-white text-center"
              {...register(`recipeUrl`, {
              })}
              disabled={isSubmitting}
              placeholder="参考URL" />
          )}


          <span className="rounded-2xl bg-green-500 px-2 py-1 text-md font-semibold text-white">
            人数を自動変換
            {/* mastaraからの変換を予定　後にbottonになりそう */}
          </span>
        </span>
      </div>


      {mode === 'edit' ? (
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 md:grid-cols-[320px_1fr] md:items-start">

          <section className="flex flex-col justify-center items-center">

            <div className="flex flex-col gap-4">
              {values && (<Image src={getRecipeImageUrl(values?.recipeImageKey)}
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

          <section className="flex flex-col gap-3 rounded-lg bg-orange-200 p-5 w-2xl">
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

      ) : (
        /* useFieldArrayと画像選択の関数と表示の部分*/
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 md:grid-cols-[320px_1fr] md:items-start">

          <section className="flex flex-col justify-center items-center">
            <input type='file' id='recipeImageKey' className="bg-amber-400 rounded-2xl px-5 py-2 h-10 w-80"
              accept="image/*"
              {...register('recipeImageKey', {
                onChange: handleImageChange,
                onBlur: () => setValue('recipeImageKey', recipeImageKey)
              })}
              disabled={isSubmitting} />

            <div className="flex flex-col gap-4 mt-5">
              {recipeImage ? (

                <Image
                  src={recipeImage}
                  alt="profile_image"
                  width={300}
                  height={300}
                  className="w-full rounded-lg object-cover"
                />
              ) : (
                <Image src='/recipe_sample.png'
                  alt="recipe_sample" width={300} height={300}
                  className="w-full rounded-lg object-cover" />
              )}
            </div>


            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-2 rounded-lg bg-orange-100 p-4 m-5">

              {new_recipeingredients.fields.map((elem, index) => (
                <Fragment key={elem.id} >
                  {index === 0 ? (
                    <button type="button"
                      className="text-center text-2xl text-red-500 font-semibold "
                      onClick={() => new_recipeingredients.append({
                        id: '',
                        quantity: '',
                        ingredient: {
                          id: '',
                          name: '',
                        }
                      })}>
                      +
                    </button>
                  ) : (
                    <span />
                  )}

                  <input className="w-full bg-transparent font-bold"
                    {...register(`recipeingredients.${index}.ingredient.name`, {
                      required: '材料名を入力してください',
                      minLength: { value: 1, message: '1文字以上で入力してください' },
                      maxLength: { value: 15, message: '15文字以内で入力してください' },
                    })}
                    disabled={isSubmitting}
                    placeholder="食材名" />

                  <input className="w-24 bg-transparent text-right text-gray-500"
                    {...register(`recipeingredients.${index}.quantity`, {
                      required: '分量を入力してください',
                      minLength: { value: 1, message: '1文字以上で入力してください' },
                      maxLength: { value: 10, message: '10文字以内で入力してください' },
                    })}
                    disabled={isSubmitting}
                    placeholder="量" />

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

          <section className="flex flex-col gap-3 rounded-lg bg-orange-200 p-5 w-2xl">
            {new_processes.fields.map((elem, index) => (
              <div key={elem.id} className="flex items-center gap-3">
                {index === 0 ? (
                  <button type="button"
                    className="text-center text-2xl text-red-500 font-semibold "
                    onClick={() => new_processes.append({
                      id: '',
                      stepNumber: index + 2,
                      description: ''
                    })}>
                    +
                  </button>
                ) : (
                  <span className="px-1.5" />
                )}
                <span className="w-8 shrink-0 text-xl font-bold tabular-nums text-center items-center">
                  {index + 1}
                </span>
                <textarea
                  rows={2}
                  className="field-sizing-content min-h-10 
              flex-1 resize-none rounded 
              px-3 py-2 text-lg font-medium w-full"
                  {...register(`processes.${index}.description`, {
                    required: '手順を入力してください',
                    minLength: { value: 1, message: '1文字以上で入力してください' },
                  })}
                  disabled={isSubmitting}
                  placeholder="手順"
                />

                {(errors.processes?.[index]?.description) && (
                  <span className="pl-11 text-sm text-red-500">
                    {errors.processes?.[index]?.description.message}
                  </span>
                )}

              </div>


            ))}

          </section>

        </section>

      )}


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
              onClick={handleSubmit(handleSubmitData)}
              disabled={isSubmitting}
            >
              更新</button>

          </>

        ) : (

          <button className="bg-green-400 text-white text-2xl rounded-2xl font-bold p-3 h-20 w-30"
            onClick={handleSubmit(handleSubmitData)}
            disabled={isSubmitting}
          >
            作成</button>

        )}


      </div>

    </form >
  );

}
