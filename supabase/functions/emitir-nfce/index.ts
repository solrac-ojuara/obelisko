import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ItemNfce {
  sku: string;
  produto: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

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

    const { itens, formaPagamento, cpfComprador } = await req.json() as {
      itens: ItemNfce[];
      formaPagamento: string;
      cpfComprador?: string;
    };

    if (!itens?.length) {
      return new Response(JSON.stringify({ error: "Itens da venda são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const itensSemNcm = itens.filter((i) => !i.ncm || i.ncm.replace(/\D/g, "").length !== 8);
    if (itensSemNcm.length) {
      return new Response(
        JSON.stringify({ error: `NCM inválido ou ausente: ${itensSemNcm.map((i) => i.produto).join(", ")}` }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("cnpj")
      .eq("id", user.id)
      .single();

    const focusToken = Deno.env.get("FOCUSNFE_TOKEN")!;
    const focusEnv = Deno.env.get("FOCUSNFE_ENV") ?? "prod";
    const baseUrl = focusEnv === "homolog"
      ? Deno.env.get("FOCUSNFE_URL_HOMOLOG")!
      : Deno.env.get("FOCUSNFE_URL_PROD")!;

    const ref = `VENDA-${user.id.slice(0, 8)}-${Date.now()}`;
    const valorTotal = itens.reduce((s, i) => s + i.valorTotal, 0);

    const formaPagamentoMap: Record<string, string> = {
      dinheiro: "01",
      credito: "03",
      debito: "04",
      pix: "17",
    };
    const codPagamento = formaPagamentoMap[formaPagamento] ?? "01";

    const nfcePayload: Record<string, unknown> = {
      natureza_operacao: "VENDA AO CONSUMIDOR",
      forma_pagamento: 0,
      modalidade_frete: 9,
      consumidor_final: 1,
      presenca_comprador: 1,
      ...(cpfComprador ? { cpf_destinatario: cpfComprador.replace(/\D/g, "") } : {}),
      items: itens.map((item, idx) => ({
        numero_item: idx + 1,
        codigo_produto: item.sku,
        descricao: item.produto,
        ncm: item.ncm.replace(/\D/g, ""),
        cfop: item.cfop || "5102",
        unidade_comercial: item.unidade || "UN",
        quantidade_comercial: item.quantidade,
        valor_unitario_comercial: item.valorUnitario,
        valor_bruto: item.valorTotal,
        unidade_tributavel: item.unidade || "UN",
        quantidade_tributavel: item.quantidade,
        valor_unitario_tributavel: item.valorUnitario,
        origem_mercadoria: 0,
        icms_csosn: "102",
        valor_pis: 0,
        valor_cofins: 0,
        inclui_no_total: 1,
      })),
      formas_pagamento: [{ forma_pagamento: codPagamento, valor: valorTotal }],
    };

    const credentials = btoa(`${focusToken}:`);
    const focusResp = await fetch(`${baseUrl}/v2/nfce?ref=${encodeURIComponent(ref)}&sincronizado=1`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nfcePayload),
    });

    const focusData = await focusResp.json();

    if (!focusResp.ok || focusData.status === "erro") {
      const msg = focusData.mensagem ?? focusData.erros?.map((e: any) => e.mensagem).join("; ") ?? "Erro FocusNFe";
      return new Response(JSON.stringify({ error: msg }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        numero: focusData.numero,
        serie: focusData.serie,
        status: focusData.status,
        danfe_url: focusData.caminho_danfe ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
