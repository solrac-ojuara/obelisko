export interface NfeProduto {
  cProd: string;
  xProd: string;
  ncm: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface NfeData {
  emitente: string;
  dataEmissao: string;
  produtos: NfeProduto[];
}

async function decodeDocZip(base64Gzip: string): Promise<string> {
  const compressed = Uint8Array.from(atob(base64Gzip), (c) => c.charCodeAt(0));
  const stream = new DecompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  writer.write(compressed);
  writer.close();
  const chunks: Uint8Array[] = [];
  const reader = stream.readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : "";
}

function extractAllTags(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) results.push(m[1]);
  return results;
}

function parseProduto(detXml: string): NfeProduto {
  const prod = extractTag(detXml, "prod");
  return {
    cProd: extractTag(prod, "cProd"),
    xProd: extractTag(prod, "xProd"),
    ncm: extractTag(prod, "NCM"),
    quantidade: parseFloat(extractTag(prod, "qCom") || "0"),
    valorUnitario: parseFloat(extractTag(prod, "vUnCom") || "0"),
    valorTotal: parseFloat(extractTag(prod, "vProd") || "0"),
  };
}

export async function parseNfeResponse(soapXml: string): Promise<NfeData> {
  const docZip = extractTag(soapXml, "docZip");
  if (!docZip) throw new Error("Nota não encontrada ou não autorizada para este CNPJ");

  const nfeXml = await decodeDocZip(docZip.trim());

  const emitente = extractTag(nfeXml, "xNome") || "Desconhecido";
  const dataEmissao = extractTag(nfeXml, "dhEmi") || extractTag(nfeXml, "dEmi");
  const detList = extractAllTags(nfeXml, "det");
  const produtos = detList.map(parseProduto);

  return { emitente, dataEmissao, produtos };
}
