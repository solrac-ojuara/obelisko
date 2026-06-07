import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { chave } = await req.json();
    if (!chave || String(chave).replace(/\D/g, "").length !== 44) {
      return new Response(JSON.stringify({ error: "Chave de acesso inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("focus_token")
      .eq("id", user.id)
      .single();

    if (!profile?.focus_token) {
      return new Response(JSON.stringify({ error: "Token Focus NFe não configurado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseUrl = (() => {
      const env = Deno.env.get("FOCUSNFE_ENV") ?? "prod";
      return env === "homolog"
        ? Deno.env.get("FOCUSNFE_URL_HOMOLOG")!
        : Deno.env.get("FOCUSNFE_URL_PROD")!;
    })();

    const credentials = btoa(`${profile.focus_token}:`);

    const focusResponse = await fetch(`${baseUrl}/nfes_recebidas/${chave}/manifesto`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tipo: "ciencia" }),
    });

    if (!focusResponse.ok && focusResponse.status !== 422) {
      const body = await focusResponse.text();
      throw new Error(`Focus NFe ${focusResponse.status}: ${body}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
