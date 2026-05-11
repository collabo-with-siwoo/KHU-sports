import { NextResponse } from "next/server";
import { canAccessAdmin, getCurrentAdmin } from "@/lib/admin/auth";
import { buildTournamentScoreExport, isScoreExportType } from "@/lib/admin/score-exports";
import { prisma } from "@/lib/prisma";

type ExportRouteProps = {
  params: Promise<{
    tournamentId: string;
    exportType: string;
  }>;
};

function forbidden() {
  return new NextResponse("Forbidden", { status: 403 });
}

function contentDisposition(filename: string) {
  return `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(request: Request, { params }: ExportRouteProps) {
  const { tournamentId, exportType } = await params;

  if (!isScoreExportType(exportType)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const admin = await getCurrentAdmin();

  if (!admin) {
    const url = new URL(request.url);
    const next = `${url.pathname}${url.search}`;
    return NextResponse.redirect(new URL(`/admin?next=${encodeURIComponent(next)}`, request.url));
  }

  const isPrivateExport = exportType === "private";

  if (isPrivateExport) {
    const canExportPrivate = admin.role === "SUPER" || canAccessAdmin(admin, "privacy", "export");

    if (!canExportPrivate) {
      return forbidden();
    }
  } else if (!canAccessAdmin(admin, "scores", "read")) {
    return forbidden();
  }

  const url = new URL(request.url);
  const reason = url.searchParams.get("reason")?.trim() ?? "";

  if (isPrivateExport && !reason) {
    return new NextResponse("Private export reason is required.", { status: 400 });
  }

  const workbook = await buildTournamentScoreExport(tournamentId, exportType);

  if (!workbook) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (isPrivateExport) {
    await prisma.exportLog.create({
      data: {
        adminUserId: admin.id,
        exportType,
        tournamentId,
        rowCount: workbook.rowCount,
        reason
      }
    });
  }

  const body = workbook.body.buffer.slice(
    workbook.body.byteOffset,
    workbook.body.byteOffset + workbook.body.byteLength
  ) as ArrayBuffer;

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": contentDisposition(workbook.filename),
      "Cache-Control": "no-store"
    }
  });
}
