"use client";

import Link from "next/link";




export default function Lists() {


  return (
    <div className="flex flex-col items-center justify-center py-20 gap-30">

      <Link href={"/lists/manual"} className="flex justify-center items-center
       text-black text-3xl bg-yellow-200 rounded-2xl h-20 w-150  py-5">
        手動で作成
      </Link>

      <Link href={"/planners"} className="flex justify-center items-center
       text-black text-3xl bg-orange-300 rounded-2xl h-20 w-150  py-5">
        献立から作成
      </Link>

      <Link href={"/recipes"} className="flex justify-center items-center
       text-black text-3xl bg-lime-200 rounded-2xl h-20 w-150  py-5">
        レシピから作成
      </Link>

    </div>


  );

}
