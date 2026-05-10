import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DeleteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: DeleteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID registrasi tidak valid.",
        },
        { status: 400 }
      );
    }

    await prisma.registration.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Data registrasi berhasil dihapus.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          message: "Data registrasi tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    console.error("DELETE /api/register/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
