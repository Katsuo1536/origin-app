import { getRecipeImageUrl } from "@/app/_components/getImage"
import Image from 'next/image';
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { supabase } from "@/app/_libs/supabase";
import { v4 as uuidv4 } from 'uuid';
import Link from "next/link";

export type Data = {
  id: string
  name: string
  email: string
  iconImageKey: string
}

type Props = {
  values?: Data
  onUpdate: (data: Data) => void
  onDelete: () => void
};

const defaultValues: Data = {
  id: '',
  name: '',
  email: '',
  iconImageKey: ''
};


export const AccountForm = ({
  values,
  onUpdate,
  onDelete,
}: Props
) => {

  const [iconImageKey, setIconImageKey] = useState<string>('');

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

    setIconImageKey(data.path)

  }

  const [iconImage, setIconImage] = useState<null | string>(null)
  useEffect(() => {
    if (!iconImageKey) return

    try {
      // アップロード時に取得した、thumbnailImageKeyを用いて画像のURLを取得
      const fetcher = async () => {
        const {
          data: { publicUrl },
        } = await supabase.storage
          .from('image')
          .getPublicUrl(iconImageKey)

        setIconImage(publicUrl)
      }

      fetcher()
    } catch (error) {
      alert('URLの取得に失敗しました。')
    }
  }, [iconImageKey])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors }
  } = useForm<Data>({
    defaultValues,
    values
  });


  return (
    <>

      <div className='flex p-10'>

        <section className="mx-auto flex max-w-8xl items-center justify-center gap-50 px-6 py-10">

          <div className="flex w-80 shrink-0 flex-col items-center mt-15">

            {iconImage ? (

              <Image
                src={iconImage}
                alt="profile_image"
                width={200}
                height={200}
                className="rounded-full size-80 object-cover"
              />
            ) : (
              values && (<Image src={getRecipeImageUrl(values.iconImageKey)}
                alt="icon" width={200} height={200}
                className="rounded-full size-80 object-cover" />
              )
            )}

          </div>

          <div className="flex flex-1 flex-col gap-20 mt-15">
            <div className=" text-amber-950" >
              <span className="text-xl mx-20">
                お名前（ニックネーム）
              </span>
              <input className="text-2xl font-bold text-center bg-amber-400 rounded-4xl px-5 py-2 h-10 w-50 "
                {...register('name', {
                  required: 'お名前を入力してください。',
                  minLength: { value: 1, message: '1文字以上で入力してください' },
                  maxLength: { value: 30, message: '15文字以内で入力してください' },
                })} />
            </div>

            <div className=" text-amber-950">
              <span className="text-xl mx-20">
                メールアドレス
              </span>
              <span className="text-2xl font-bold text-center bg-amber-400 rounded-4xl px-5 py-2 h-10 w-100">
                {values?.email}
                </span>
            </div>

            <div className=" text-amber-950">
              <span className="text-xl mx-20">
                プロフィール画像
              </span>
              <input type='file' id='iconImageKey' className="bg-amber-400 rounded-2xl px-5 py-2 h-10 w-80"
                accept="image/*"
                {...register('iconImageKey', {
                  onChange: handleImageChange,
                  onBlur: () => setValue('iconImageKey', iconImageKey)
                  })}
                disabled={isSubmitting} />

            </div>

          </div>

        </section>

      </div>

      <div className="flex justify-center mx-auto items-center m-10">
        <Link href={"/"}>
          {values && (
            <button className="border border-gray-500 text-gray-500 rounded-2xl text-2xl font-bold p-3 mr-30  h-20 w-30"
              type="button" onClick={() => onDelete()}
              disabled={isSubmitting}>
              削除
            </button>
          )}
        </Link>

        <button className="bg-green-400 text-white text-2xl rounded-2xl font-bold p-3 h-20 w-30"
          onClick={handleSubmit(onUpdate)}
          disabled={isSubmitting}
        >
          更新</button>

      </div>


    </>
  );

}
