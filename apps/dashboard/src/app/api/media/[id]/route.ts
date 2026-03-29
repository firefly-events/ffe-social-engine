import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const mediaFile = await convex.query(api.media.getMediaFile, { id: id as Id<"mediaFiles"> });

        if (!mediaFile || !mediaFile.url) {
            return new NextResponse("Not found", { status: 404 });
        }

        const response = await fetch(mediaFile.url);
        if (!response.body) {
            return new NextResponse("Not found", { status: 404 });
        }
        
        const headers = new Headers();
        headers.set("Content-Type", mediaFile.mimeType);

        return new NextResponse(response.body, { headers });

    } catch (error) {
        console.error(error);
        return new NextResponse("Error fetching media", { status: 500 });
    }
}
