import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/_libs/supabase";
import { convertAgent } from "@/src/mastra/agents/convert-agent";
import { string, z } from "zod";
import { createRecipeAgent } from "@/src/mastra/agents/create-agent";


export const createRecipeSchema = z.object({
  recipe:
    z.object({
      name: z.string(),
      recipeImageKey: z.string(),
      recipeUrl: z.string(),
      servings: z.number(),
      recipeingredients: z.array(
        z.object({
          quantity: z.string(),
          ingredient:
            z.object({
              name: z.string()
            })
        }),
      ),
      processes: z.array(
        z.object({
          stepNumber: z.number(),
          description: z.string(),
        }),
      ),
    }),
});

export const POST = async (request: NextRequest) => {

  //認証機能(トークン認証によるAPIの制限)
  const token = request.headers.get('Authorization') ?? ''

  const { error } = await supabase.auth.getUser(token)

  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })


  //フロント側からリクエストの受け取り
  const req = await request.formData();
  const image = req.get('image')
  const ingredient = req.get('ingredient')

  const content: any[] = []

  if (image instanceof File) {

    const base64 = Buffer.from(await image.arrayBuffer()).toString('base64');
    const dataUrl = `data:${image.type};base64,${base64}`;

    content.push({ type: "image", image: dataUrl, mimeType: image.type })
  }

  if (ingredient !== null) {

    content.push({ type: "text", text: `ingredient: ${ingredient}` })

  }

  content.push({ type: "text", text: "この食材を使って、レシピを1つ作成してください" })

  try {

    const response = await createRecipeAgent.generate(
      [
        {
          role: "user",
          content: content
        },
      ],
      {
        structuredOutput: { schema: createRecipeSchema },
      });


    return NextResponse.json(response.object, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}



