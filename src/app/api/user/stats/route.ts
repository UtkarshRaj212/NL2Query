import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ user: null });
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        streak: true,
        lastQuizDate: true,
        totalScore: true,
        quizzesTaken: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json({ user: null });
    }

    let rank: number | string = "-";
    if (userRecord.quizzesTaken > 0) {
      const betterRankCount = await prisma.user.count({
        where: {
          OR: [
            { totalScore: { gt: userRecord.totalScore } },
            {
              AND: [
                { totalScore: userRecord.totalScore },
                { streak: { gt: userRecord.streak } },
              ],
            },
            {
              AND: [
                { totalScore: userRecord.totalScore },
                { streak: userRecord.streak },
                { quizzesTaken: { gt: userRecord.quizzesTaken } },
              ],
            },
          ],
        },
      });
      rank = betterRankCount + 1;
    }

    const totalParticipants = await prisma.user.count({
      where: { quizzesTaken: { gt: 0 } },
    });

    return NextResponse.json({
      user: {
        ...userRecord,
        rank,
        totalParticipants,
      },
    });
  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
