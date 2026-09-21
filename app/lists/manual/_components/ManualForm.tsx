import { useForm } from "react-hook-form";

export type Data = {
  name: string
  quantity: string
}

type Props = {
  values?: Data
  onPost: (data: Data) => void
};


export const ManualForm = ({
  onPost,
}: Props
) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Data>();

  const handlePost = async (data: Data) => {
    await onPost(data)
    reset()
  }


  return (
    <form className="flex w-full flex-col items-center m-20 gap-10"
      onSubmit={handleSubmit(handlePost)}>


      <div className="flex flex-col justify-center items-center  gap-3 font-semibold">
        材料名
        <input className="text-2xl text-center rounded-2xl bg-orange-400 h-15 w-90"
          {...register('name', {
            required: '材料名を入力してください',
            minLength: { value: 1, message: '1文字以上で入力してください' },
            maxLength: { value: 20, message: '20文字以内で入力してください' },
          })}
          placeholder="例： もつ"
          disabled={isSubmitting} />
      </div>
      <div className="flex justify-center mx-auto items-center text-red-500">{errors.name?.message}</div>

      <div className="flex flex-col justify-center items-center gap-3 font-semibold">
        分量
        <input className="text-2xl text-center rounded-2xl bg-amber-300 h-15 w-90"
          {...register('quantity', {
            required: '分量を入力してください',
            minLength: { value: 1, message: '1文字以上で入力してください' },
            maxLength: { value: 10, message: '10文字以内で入力してください' },
          })}
          placeholder="例： 1袋"
          disabled={isSubmitting} />
      </div>
      <div className="flex justify-center mx-auto items-center text-red-500">{errors.name?.message}</div>


      <div className="flex justify-center mx-auto items-center mt-10">
        <button className="bg-green-400/80 text-white text-xl rounded-2xl font-bold p-3 
                           h-20 w-30" type="submit" disabled={isSubmitting}>
          作成</button>

      </div>

    </form>
  );

}
