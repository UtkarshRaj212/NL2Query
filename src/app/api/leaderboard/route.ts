import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const users = await prisma.user.findMany({
      where: {
        quizzesTaken: {
          gt: 0,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        streak: true,
        totalScore: true,
        quizzesTaken: true,
        createdAt: true,
      },
      orderBy: [
        { totalScore: "desc" },
        { streak: "desc" },
        { quizzesTaken: "desc" },
      ],
      take: 50,
    });

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name || "Anonymous",
      image: u.image,
      streak: u.streak,
      totalScore: u.totalScore,
      quizzesTaken: u.quizzesTaken,
    }));

    let currentUserStats = null;
    if (session?.user) {
      const userRecord = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          image: true,
          streak: true,
          totalScore: true,
          quizzesTaken: true,
          lastQuizDate: true,
        },
      });

      if (userRecord) {
        // Find position
        const betterRankUsersCount = await prisma.user.count({
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

        const rank = betterRankUsersCount + 1;
        const totalUsers = await prisma.user.count({
          where: { quizzesTaken: { gt: 0 } },
        });

        currentUserStats = {
          ...userRecord,
          rank: userRecord.quizzesTaken > 0 ? rank : "-",
          totalParticipants: totalUsers,
        };
      }
    }

    return NextResponse.json({
      leaderboard,
      currentUserStats,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
