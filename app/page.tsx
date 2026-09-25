"use client";

import Image from 'next/image';
import { time } from '@/app/_utils/time'


export default function Home() {

  return (
    <>
      <div className="flex justify-center">
        <span className="text-center text-xl bg-orange-200 m-10 rounded-3xl whitespace-pre-line px-30 py-5">
          <div className="text-lg">
            食卓を囲めていますか、、
          </div>
          <div className="text-red-500 font-bold text-xl">
            買い物リスト・献立・レシピ・予算
          </div>
          <div>
            このアプリで
            <span className="text-2xl te">
              完結!!
            </span>
          </div>
        </span>
      </div>


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

          <section className="rounded-2xl border-2 border-lime-300 h-60 w-75">
            <h2 className="font-bold px-2 py-1 m-1">
              予算
            </h2>
            <div className="flex justify-center">
              <span className="flex size-45 justify-center items-center rounded-full bg-orange-400">
                <span className="text-md text-white mx-2">のこり:</span>
                <span className="text-xl text-white">XXXXX</span>
              </span>
            </div>
          </section>

      </div>

      <div
        className="absolute left-1/2 top-1/2 
          flex size-40 -translate-x-1/2 -translate-y-1/2 
          items-center justify-center text-center
          rounded-full bg-red-600 text-white
          ring-8 ring-amber-50 whitespace-pre-line">
        {"もっと時間を \n あなたに、、"}
      </div>

    </>
  );

}
