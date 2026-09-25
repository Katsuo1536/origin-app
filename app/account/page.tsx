"use client";

import { useFetch } from "@/app/_hooks/useFetch";
import { AccountInformation } from './_components/AccountInformation';
import { UserResponse } from '../api/account/route';
import { RecipeArrayResponse } from "../api/recipes/route";



export default function Account() {

  const { data, isLoading, error, mutate } = useFetch("/api/account")

  const account: UserResponse = data ? data : '';
  
  const { data: favoriteRecipe } = useFetch("/api/recipes")

  const favorite: RecipeArrayResponse = favoriteRecipe ? favoriteRecipe : [];


  if (isLoading) {
    return <div className="mx-auto text-center mt-5">アカウント読み込み中！！！</div>
  }
  else if (error) {
    return <div className="mx-auto text-center mt-5">アカウントを取得できませんでした</div>
  };


  return (
    <AccountInformation
      values={account.user ?? undefined}
      recipes={favorite.recipes ?? undefined}
    />

  );

}
