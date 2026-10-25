import { useForm } from "react-hook-form";

export type Data = {
  balance: number
}

type Props = {
  values?: Data
  onPost: (data: Data) => void
  onUpdate: (data: Data) => void
};


export const BudgetForm = ({
  values,
  onPost,
  onUpdate,
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

  const handleUpdate = async (data: Data) => {
    await onUpdate(data)
    reset()
  }
  

  return (
    <form className="flex w-full flex-col items-center my-20 md:m-20"
      onSubmit={handleSubmit(handlePost)}>

      <div className="flex size-70 md:size-100 justify-center items-center rounded-full bg-orange-400">
        <input className="text-2xl md:text-3xl text-center"
          {...register('balance', {
            valueAsNumber: true,
            min: { value: 0, message: '0以上で入力してください' },
            max: { value: 1000000, message: '100万円以下で入力してください' },
          })}
          placeholder={`のこり： ${values?.balance ?? 0}`}
          disabled={isSubmitting} />
      </div>
      <div className="flex justify-center mx-auto items-center text-red-500">{errors.balance?.message}</div>

      <div className="grid grid-cols-2 md:flex justify-center md:mx-auto items-center  mt-20">
        <button className="border border-gray-500 text-gray-500 rounded-2xl font-bold p-3 mx-15 md:mr-30 whitespace-pre-line h-15 md:h-20 w-25 md:w-30 text-sm md:text-base" type="submit" disabled={isSubmitting}>
          {"よさん\nへんこう"}</button>

        <button className="bg-green-400 text-white rounded-2xl font-bold p-3 h-15 md:h-20 w-20 md:w-30 text-lg md:text-2xl mx-12"
          onClick={handleSubmit(handleUpdate)}
          disabled={isSubmitting}
        >
          きろく</button>

      </div>

    </form>
  );

}
