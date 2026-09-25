"use client";

import Link from 'next/link';
import Image from 'next/image';
import { time } from '@/app/_utils/time'
import { useFetch } from "@/app/_hooks/useFetch";
import { getRecipeImageUrl } from "@/app/_components/getImage";
import { PlannersResponse } from '@/app/planners/page';

export const toJstDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });


export default function PlannerData() {

  const { data: plannerData } = useFetch("/api/planners")

  const planners: PlannersResponse = plannerData ? plannerData.planners : [];

  const todayPlan = planners ? planners.filter(t => toJstDate(t.date) === toJstDate(new Date())) : undefined;

  const randomPlan = todayPlan ? todayPlan.at(Math.floor(Math.random() * todayPlan.length)) : undefined;



  return (
    <>

          <Link href="/planners" >
            <section className="rounded-2xl border-2 border-orange-400 h-60 w-75">
              <span className="flex justify-left m-1">
                <h2 className="font-bold px-2 py-1">
                  献立
                </h2>
                <time className="bg-gray-300 rounded-2xl px-1 py-0.5">
                  {time(new Date)}
                </time>
              </span>
              {randomPlan && (
                <div key={randomPlan.id}
                  className="flex flex-col justify-center items-center py-3">
                  <Image src={getRecipeImageUrl(randomPlan.recipe.image)} alt="planner_image" width={200} height={200} className="flex justify-center items-center rounded-lg" />
                  <span className="rouded-2xl text-center m-3 font-semibold ">
                    {randomPlan.recipe.name}
                  </span>
                </div>
              )}
            </section>
          </Link>

    </>
  );

}
