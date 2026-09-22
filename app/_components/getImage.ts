import { supabase } from "../_libs/supabase";


export const getRecipeImageUrl = (imageKey: string) => {
  const { data } = supabase.storage.from('image').getPublicUrl(imageKey);
  return data.publicUrl;
};

