import { createClient } from "npm:@supabase/supabase-js@2";
import { parsePfx } from "./cert-parser.ts";
import { buildSoapEnvelope } from "./soap-builder.ts";
import { postToSefaz } from "./sefaz-client.ts";
import { parseNfeResponse } from "./nfe-parser.ts";

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

async function downloadCert(cnpj: string): Promise<string> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const cnpjLimpo = cnpj.replace(/[.\-\/]/g, "");
  const candidates = [
    `certificado_${cnpjLimpo}.pfx`,
    `certificado_${cnpjLimpo}.p12`,
    `certificado_${cnpjLimpo}`,
  ];

  for (const fileName of candidates) {
    const { data } = await supabase.storage.from("certificados").download(fileName);
    if (data) {
      const buf = await data.arrayBuffer();
      return btoa(String.fromCharCode(...new Uint8Array(buf)));
    }
  }

  throw new Error(`Certificado não encontrado no storage para CNPJ ${cnpjLimpo}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { cnpj, chaveNfe, certPassword } = await req.json();
    if (!cnpj || !chaveNfe || !certPassword) {
      return json({ message: "cnpj, chaveNfe e certPassword são obrigatórios" }, 400);
    }
    if (chaveNfe.length !== 44) {
      return json({ message: "Chave de acesso deve ter 44 dígitos" }, 400);
    }

    const pfxBase64 = await downloadCert(cnpj);
    const cert = parsePfx(pfxBase64, certPassword);
    const soap = buildSoapEnvelope({ cnpj: cnpj.replace(/[.\-\/]/g, ""), chaveNfe });
    const soapResponse = await postToSefaz(soap, cert);
    const nfeData = await parseNfeResponse(soapResponse);

    return json(nfeData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return json({ message: msg }, 500);
  }
});
