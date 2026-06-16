const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { gtin } = await req.json();

    if (!gtin || String(gtin).replace(/\D/g, "").length < 8) {
      return new Response(JSON.stringify({ error: "GTIN inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gtinClean = String(gtin).replace(/\D/g, "").padStart(14, "0");
    const url = `https://dfe-portal.svrs.rs.gov.br/NFeConsultaGTIN/ConsultaGTIN?GTIN=${gtinClean}`;

    const response = await fetch(url, {
      headers: { Accept: "application/xml, text/xml, */*" },
    });

    const xml = await response.text();

    const cStatMatch = xml.match(/<cStat>(.*?)<\/cStat>/);
    const xProdMatch = xml.match(/<xProd>(.*?)<\/xProd>/);
    const cStat = cStatMatch?.[1]?.trim();

    if (cStat === "9490" && xProdMatch) {
      return new Response(
        JSON.stringify({ found: true, xProd: xProdMatch[1].trim(), cStat }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ found: false, cStat, message: "Produto não encontrado no SEFAZ GTIN" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ found: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
