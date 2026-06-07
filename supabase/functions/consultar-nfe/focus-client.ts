export interface FocusNfeItem {
  descricao: string;
  codigo_produto: string;
  codigo_ncm: string;
  quantidade_comercial: string;
  valor_unitario_comercial: string;
  valor_bruto: string;
}

export interface FocusNfeResponse {
  nome_emitente: string;
  data_emissao: string;
  situacao: string;
  manifestacao_destinatario: string | null;
  nfe_completa: boolean;
  requisicao_nota_fiscal?: {
    itens: FocusNfeItem[];
    nome_emitente: string;
    data_emissao: string;
  };
}

export async function consultarNfeFocus(
  chave: string,
  token: string
): Promise<FocusNfeResponse> {
  const baseUrl = (() => {
    const env = Deno.env.get("FOCUSNFE_ENV") ?? "prod";
    return env === "homolog"
      ? Deno.env.get("FOCUSNFE_URL_HOMOLOG")!
      : Deno.env.get("FOCUSNFE_URL_PROD")!;
  })();

  const url = `${baseUrl}/nfes_recebidas/${chave}.json?completa=1`;
  const credentials = btoa(`${token}:`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Focus NFe retornou ${response.status}: ${body}`);
  }

  return response.json() as Promise<FocusNfeResponse>;
}
