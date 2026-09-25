"use client";

import Link from 'next/link';
import { useFetch } from "@/app/_hooks/useFetch";
import type { BudgetResponce } from '@/app/budget/page';


export default function BudgetData() {

  const { data: budgetData } = useFetch("/api/budget")

  const budget: BudgetResponce = budgetData ? budgetData.budget : '';

  return (
    <>

          <Link href="/budget" >
            <section className="rounded-2xl border-2 border-lime-300 h-60 w-75">
              <h2 className="font-bold px-2 py-1 m-1">
                予算
              </h2>
              <div className="flex justify-center">
                <span className="flex size-45 justify-center items-center rounded-full bg-orange-400">
                  <span className="text-md text-white mx-2">のこり:</span>
                  <span className="text-xl text-white">{budget?.balance ?? "XXXXX"}</span>
                </span>
              </div>
            </section>
          </Link>

    </>
  );

}
