import PDFDocument from 'pdfkit';
import { NextResponse } from 'next/server';
import { getCurrentUserId, isClerkConfigured } from '@/app/lib/auth';
import {
  getRecipeForUser,
  isRecipeVaultConfigured,
  recordPdfExport,
  type RecipeSnapshot,
} from '@/app/lib/recipe-vault';
import { FEATURE_KEYS, requireSoapAbacusFeature } from '@/app/lib/soap-abacus-membership';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: 'Recipe vault accounts are not configured yet.' }, { status: 503 });
  }
  if (!isRecipeVaultConfigured()) {
    return NextResponse.json({ error: 'Recipe vault database is not configured yet.' }, { status: 503 });
  }

  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to export recipe PDFs.' }, { status: 401 });
  const access = await requireSoapAbacusFeature(FEATURE_KEYS.PDF_EXPORT);
  if (!access.ok) return access.response;

  const { id } = await params;
  const recipe = await getRecipeForUser(id, userId);
  if (!recipe) return NextResponse.json({ error: 'Recipe not found.' }, { status: 404 });

  const pdf = await renderRecipePdf(recipe);
  const fileName = `${recipe.slug || 'soap-recipe'}-v${recipe.version}.pdf`;
  let fileUrl: string | null = null;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`recipes/${recipe.id}/${fileName}`, pdf, {
      access: 'public',
      contentType: 'application/pdf',
    });
    fileUrl = blob.url;
  }

  await recordPdfExport({
    id: createId('pdf'),
    recipeId: recipe.id,
    versionId: recipe.versionId,
    ownerId: userId,
    fileUrl,
    fileName,
  });

  const body = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}

function renderRecipePdf(recipe: RecipeSnapshot): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 54, size: 'LETTER' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(22).fillColor('#a9792b').text(recipe.name, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').text(`Coldstone Soap Co. Recipe Sheet · Version ${recipe.version}`, { align: 'center' });
    doc.moveDown(1.25);

    if (recipe.description) {
      doc.fontSize(11).fillColor('#222').text(recipe.description);
      doc.moveDown();
    }

    doc.fontSize(14).fillColor('#111').text('Oils and Fats');
    doc.moveDown(0.4);
    for (const oil of recipe.oils as Array<{ oilId?: string; name?: string; percent?: number; weight?: number; unit?: string }>) {
      doc.fontSize(10).fillColor('#222').text(`${oil.name || oil.oilId}: ${oil.percent ?? ''}% ${oil.weight ? `· ${oil.weight} ${oil.unit || ''}` : ''}`);
    }

    if (recipe.fragrances.length > 0) {
      doc.moveDown();
      doc.fontSize(14).fillColor('#111').text('Fragrance');
      doc.moveDown(0.4);
      for (const fragrance of recipe.fragrances as Array<{ fragranceId?: string; usagePercent?: number }>) {
        doc.fontSize(10).fillColor('#222').text(`${fragrance.fragranceId}: ${fragrance.usagePercent ?? 0}% of oils`);
      }
    }

    if (recipe.additives.length > 0) {
      doc.moveDown();
      doc.fontSize(14).fillColor('#111').text('Additives');
      doc.moveDown(0.4);
      for (const additive of recipe.additives as Array<{ additiveId?: string; amount?: string }>) {
        doc.fontSize(10).fillColor('#222').text(`${additive.additiveId}: ${additive.amount || ''}`);
      }
    }

    if (recipe.pricing) {
      doc.moveDown();
      doc.fontSize(14).fillColor('#111').text('Pricing');
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor('#222').text(JSON.stringify(recipe.pricing, null, 2));
    }

    doc.moveDown();
    doc.fontSize(14).fillColor('#111').text('Process');
    doc.moveDown(0.4);
    for (const [index, step] of (recipe.processSteps as Array<{ label?: string; description?: string }>).entries()) {
      doc.fontSize(10).fillColor('#222').text(`${index + 1}. ${step.label || 'Step'}${step.description ? ` — ${step.description}` : ''}`);
    }

    if (recipe.notes) {
      doc.moveDown();
      doc.fontSize(14).fillColor('#111').text('Notes');
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor('#222').text(recipe.notes);
    }

    doc.moveDown();
    doc.fontSize(8).fillColor('#777').text('Always verify SAP values, supplier IFRA documentation, and safe lye handling before making soap.');
    doc.end();
  });
}

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}
