"use client";

import Link from 'next/link';
import Image from 'next/image';
import { time } from '@/app/_utils/time'
import { useFetch } from "@/app/_hooks/useFetch";
import type { BudgetResponce } from "../budget/page";
import type { ListsResponse } from '../lists/page';

export default function Home() {

  const { data: budgetData } = useFetch("/api/budget")

  const budget: BudgetResponce = budgetData ? budgetData.budget : '';

  const { data: listData } = useFetch("/api/lists")

  const lists: ListsResponse = listData ? listData.lists : [];


  return (
    <>

      <div className="py-30">

        <div className="flex justify-center gap-10">

          <Link href="/lists" >
            <section className="rounded-2xl border-2 border-lime-300 h-60 w-75">
              <h2 className="font-bold px-2 py-1 m-1">買い物リスト</h2>
              <div className="flex flex-col items-center gap-1 m-3">
                {lists?.slice(0,6).map(elem => (
                  <div className="flex flex-col-2 justify-center items-center">

                    <span key={elem.id} className="flex items-center  justify-between
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

          <section className="rounded-2xl border-2 border-orange-400 h-60 w-75">
            <span className="flex justify-left m-1">
              <h2 className="font-bold px-2 py-1">
                献立
              </h2>
              <time className="bg-gray-300 rounded-2xl px-1 py-0.5">
                {time(new Date)}
              </time>
            </span>
            <div className="flex justify-center">
              <span className="rouded-2xl text-right m-5 font-semibold">
                <Image src="/Koidare_torimomo.png" alt="イメージ画像＿香味だれ鶏もも肉" width={200} height={200} />
                香味だれ
              </span>
            </div>
          </section>

        </div >

        <div className="flex justify-center gap-10 m-10">

          <section className="rounded-2xl border-2 border-orange-400 h-60 w-75">
            <h2 className="font-bold px-2 py-1 m-1">
              レシピ
            </h2>
            <div className="flex justify-center">
              <span className="rouded-2xl text-right m-3 font-semibold">
                <Image src="/MotsuNabe.png" alt="イメージ画像＿もつ鍋" width={200} height={200} />
                もつ鍋
              </span>
            </div>
          </section>

          <Link href="/budget" >
            <section className="rounded-2xl border-2 border-lime-300 h-60 w-75">
              <h2 className="font-bold px-2 py-1 m-1">
                予算
              </h2>
              <div className="flex justify-center">
                <span className="flex size-45 justify-center items-center rounded-full bg-orange-400">
                  <span className="text-md text-white mx-2">のこり:</span>
                  <span className="text-xl text-white">{budget.balance ?? "XXXXX"}</span>
                </span>
              </div>
            </section>
          </Link>

        </div>

      </div>

    </>
  );

}