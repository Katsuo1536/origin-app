"use client";

import PlannerData from './_components/PlannerData';
import RecipeData from './_components/RecipeData';
import ListsData from './_components/ListsData';
import BudgetData from './_components/BudgetData';


export default function Home() {

  return (
    <>

      <div className="grid grid-cols-1 px-10 py-5 md:py-30 gap-5">

        <div className="grid grid-cols-1 md:flex justify-center gap-5 md:gap-10">

          <ListsData />

          <PlannerData />

        </div >

        <div className="grid grid-cols-1 md:flex justify-center gap-5 md:gap-10 md:m-10">

          <RecipeData />

          <BudgetData />

        </div>

      </div>

    </>
  );

}
