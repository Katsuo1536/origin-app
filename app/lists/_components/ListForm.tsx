import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from 'next/image';
import type { ListsResponse } from "../page";


type Props = {
  values?: ListsResponse
  onDelete: (id : string) => void
};


export const ListForm = ({
  values,
  onDelete,
}: Props
) => {


  return (
    <>
      <span className="flex items-center translate-x-275 py-5 gap-5">
        <button className="flex justify-center items-center bg-red-500
                            text-xl text-white font-semibold h-10 w-20
                            rounded-lg">
          全削除
        </button>
        <Link href={"/lists/new_lists"} className="flex justify-center items-center
       text-white text-3xl bg-green-400 border-2 border-green-400 rounded-lg h-10 w-10  py-5">
          +
        </Link>
      </span>

      <div className="flex flex-col items-center justify-center gap-3 py-5">

        {values?.map(elem => (
          <div key={elem.id} className="flex flex-col-2 gap-10 justify-center items-center">
            <button key={elem.id} className="flex 
                  h-10 w-10" type="button"
                  onClick={() => onDelete(elem.id)}>
              <Image src="/trashBox.png" alt="イメージ画像＿香味だれ鶏もも肉" width={200} height={200} />
            </button>

            <span className="flex items-center  justify-between
                  border border-gray-300 h-7 w-80 rounded-lg
                  px-3 py-7">

              <span className="text-black  text-2xl">
                {elem.name}
              </span>

              <span className="text-gray-400  text-lg">
                {elem.quantity}
              </span>
            </span>
          </div>
        ))}


      </div>
    </>
  );

}