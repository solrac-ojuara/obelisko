import { createClient } from "npm:@supabase/supabase-js@2";
import { consultarNfeFocus } from "./focus-client.ts";
import { mapFocusResponse } from "./nfe-mapper.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function getFocusToken(userId: string): Promise<string> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data, error } = await supabase
    .from("perfil")
    .select("focusnfe_token")
    .eq("id", userId)
    .single();

  if (error || !data?.focusnfe_token) {
    throw new Error("Token Focus NFe não configurado para este usuário");
  }
  return data.focusnfe_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return json({ message: "Não autorizado" }, 401);
    }

    const { chaveNfe } = await req.json();
    if (!chaveNfe) {
      return json({ message: "chaveNfe é obrigatório" }, 400);
    }
    const chave = String(chaveNfe).replace(/\D/g, "");
    if (chave.length !== 44) {
      return json({ message: "Chave de acesso deve ter 44 dígitos" }, 400);
    }

    const token = await getFocusToken(user.id);
    const focusData = await consultarNfeFocus(chave, token);
    const nfeData = mapFocusResponse(focusData);

    return json(nfeData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return json({ message: msg }, 500);
  }
});
