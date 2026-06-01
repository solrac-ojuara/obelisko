import { ParsedCert } from "./cert-parser.ts";

const SEFAZ_URL =
  "https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx";

const SOAP_ACTION =
  "http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe/nfeDistDFeInteresse";

export async function postToSefaz(
  soapBody: string,
  cert: ParsedCert
): Promise<string> {
  const client = Deno.createHttpClient({
    certChain: cert.pemCert,
    privateKey: cert.pemKey,
    http2: false,
  });

  const response = await fetch(SEFAZ_URL, {
    method: "POST",
    client,
    headers: {
      "Content-Type": "application/soap+xml; charset=utf-8",
      SOAPAction: SOAP_ACTION,
    },
    body: soapBody,
  });

  if (!response.ok) {
    throw new Error(`SEFAZ retornou HTTP ${response.status}`);
  }

  return response.text();
}
