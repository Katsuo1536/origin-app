import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";
import { convertAgent } from "@/src/mastra/agents/convert-agent";
import { z } from "zod";

export type RecipeConvertBody = {
  recipe: {
    id: string
    name: string
    servings: number
    recipeingredients: {
      id: string
      quantity: string
    }[]
  },
  baseNumber: number
}

export const convertSchema = z.object({
  recipe:
    z.object({
      id: z.string(),
      name: z.string(),
      servings: z.number(),
      recipeingredients: z.array(
        z.object({
          id: z.string(),
          quantity: z.string()
        }),
      ),
    }),
});

export const POST = async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = request.headers.get('Authorization') ?? ''

  const { error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })


  //フロント側からリクエストの受け取り
  const req: RecipeConvertBody = await request.json();

  const prompt = `
                 - baseNumber: ${JSON.stringify(req.baseNumber)}
                 - targetNumber: ${JSON.stringify(req.recipe.servings)}
                 - ingredients: 材料の配列（id, name, quantity）
                                id: ${JSON.stringify(req.recipe.id)}
                                name: ${JSON.stringify(req.recipe.name)}
                                quantity: ${JSON.stringify(req.recipe.recipeingredients)}
                `;

  try {

    const response = await convertAgent.generate(prompt, {
      structuredOutput: { schema: convertSchema },
    });


    return NextResponse.json(response.object, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}



