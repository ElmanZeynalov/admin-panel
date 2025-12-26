import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ideally you would upload to S3 here.
        // For now we save to local public folder.
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const path = join(process.cwd(), 'public', 'uploads', fileName);

        await writeFile(path, buffer);
        console.log(`Saved file to ${path}`);

        const publicUrl = `/uploads/${fileName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' : 'file'
        });
    } catch (e: any) {
        console.error('Upload Error:', e);
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
