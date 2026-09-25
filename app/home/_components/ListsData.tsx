"use client";

import Link from 'next/link';
import { useFetch } from "@/app/_hooks/useFetch";
import type { ListsResponse } from '@/app/lists/page';


export default function ListsData() {


  const { data: listData } = useFetch("/api/lists")

  const lists: ListsResponse = listData ? listData.lists : [];



  return (
    <>

          <Link href="/lists" >
            <section className="rounded-2xl border-2 border-lime-300 h-60 w-75">
              <h2 className="font-bold px-2 py-1 m-1">買い物リスト</h2>
              <div className="flex flex-col items-center gap-1 m-3">
                {lists.slice(0, 6).map(elem => (
                  <div key={elem.id} className="flex flex-col-2 justify-center items-center">
                    <span className="flex items-center  justify-between
                  border border-gray-300 h-5 w-50 rounded-lg
                  px-2 py-3">

                      <span className="text-black  text-lg">
                        {elem.name}
                      </span>

                      <span className="text-gray-400  text-md">
                        {elem.quantity}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </Link>

    </>
  );

}
