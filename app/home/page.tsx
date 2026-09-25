"use client";

import PlannerData from './_components/PlannerData';
import RecipeData from './_components/RecipeData';
import ListsData from './_components/ListsData';
import BudgetData from './_components/BudgetData';


export default function Home() {

  return (
    <>

      <div className="py-30">

        <div className="flex justify-center gap-10">

          <ListsData />

          <PlannerData />

        </div >

        <div className="flex justify-center gap-10 m-10">

          <RecipeData />

          <BudgetData />

        </div>

      </div>

    </>
  );

}
