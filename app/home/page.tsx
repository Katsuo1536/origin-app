"use client";

import Link from 'next/link';
import Image from 'next/image';
import { time } from '@/app/_utils/time'
import { useFetch } from "@/app/_hooks/useFetch";
import type { BudgetResponce } from "../budget/page";

export default function Home() {

  const { data } = useFetch("/api/budget")

  const budget: BudgetResponce = data ? data.budget : '';

  return (
    <>

      <div className="py-30">

        <div className="flex justify-center gap-10">

          <section className="rounded-2xl border-2 border-lime-300 h-60 w-75">
            <h2 className="font-bold px-2 py-1 m-1">買い物リスト</h2>
            <div className="flex flex-col items-center gap-3 m-5">
              <div className="border border-gray-300 h-7 w-50 rounded-lg px-2">もつ</div>
              <div className="border border-gray-300 h-7 w-50 rounded-lg px-2">にんにく</div>
              <div className="border border-gray-300 h-7 w-50 rounded-lg px-2">みそ</div>
              <div className="border border-gray-300 h-7 w-50 rounded-lg px-2">にら</div>
            </div>
          </section>

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