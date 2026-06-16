import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { getArtifact } from "@/lib/data/artifacts";
import { htmlToBlocks } from "@/lib/export/blocks";
import { blocksToDocx } from "@/lib/export/docx";
import { blocksToPdf } from "@/lib/export/pdf";
import { fileResponse, parseFormat, slugify } from "@/lib/export/response";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string; id: string }> },
) {
  const { id } = await params;
  const format = parseFormat(request.url);

  if (!supabaseEnv.isConfigured) {
    return new Response("Not found", { status: 404 });
  }
  if (!(await getUser())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const artifact = await getArtifact(id);
  if (!artifact) {
    return new Response("Not found", { status: 404 });
  }

  const blocks = htmlToBlocks(artifact.content);
  const filename = `${slugify(artifact.title)}-v${artifact.version}-${artifact.language}`;
  const buffer =
    format === "docx"
      ? await blocksToDocx(artifact.title, blocks)
      : await blocksToPdf(artifact.title, blocks);

  return fileResponse(buffer, format, filename);
}
