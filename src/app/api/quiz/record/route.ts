import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required to record quiz to leaderboard" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      mode = "sql",
      score = 0,
      total = 0,
      accuracy = 0,
      timeTakenSeconds = 0,
    } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine streak
    const now = new Date();
    let newStreak = user.streak;
    let streakIncreased = false;

    if (!user.lastQuizDate) {
      // First quiz ever
      newStreak = 1;
      streakIncreased = true;
    } else {
      const lastDate = new Date(user.lastQuizDate);
      
      // Compare calendar dates (using UTC to prevent timezone glitches)
      const lastUtc = Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const dayDiff = Math.floor((nowUtc - lastUtc) / (1000 * 60 * 60 * 24));

      if (dayDiff === 0) {
        // Same day - streak remains active, doesn't increment again today
        newStreak = Math.max(1, user.streak);
      } else if (dayDiff === 1) {
        // Consecutive day - streak increments!
        newStreak = user.streak + 1;
        streakIncreased = true;
      } else {
        // Missed one or more days - reset streak to 1
        newStreak = 1;
        streakIncreased = true;
      }
    }

    // Save quiz attempt and update user record in a transaction
    const [updatedUser, attempt] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          streak: newStreak,
          lastQuizDate: now,
          totalScore: {
            increment: Math.max(0, score),
          },
          quizzesTaken: {
            increment: 1,
          },
        },
      }),
      prisma.quizAttempt.create({
        data: {
          userId: user.id,
          mode: String(mode),
          score: Math.max(0, score),
          total: Math.max(0, total),
          accuracy: Number(accuracy) || 0,
          timeTakenSeconds: Math.max(0, timeTakenSeconds),
        },
      }),
    ]);

    // Calculate updated rank
    const betterRankCount = await prisma.user.count({
      where: {
        OR: [
          { totalScore: { gt: updatedUser.totalScore } },
          {
            AND: [
              { totalScore: updatedUser.totalScore },
              { streak: { gt: updatedUser.streak } },
            ],
          },
          {
            AND: [
              { totalScore: updatedUser.totalScore },
              { streak: updatedUser.streak },
              { quizzesTaken: { gt: updatedUser.quizzesTaken } },
            ],
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      streak: updatedUser.streak,
      totalScore: updatedUser.totalScore,
      quizzesTaken: updatedUser.quizzesTaken,
      streakIncreased,
      rank: betterRankCount + 1,
      attemptId: attempt.id,
    });
  } catch (error) {
    console.error("Quiz record error:", error);
    return NextResponse.json(
      { error: "Failed to record quiz results" },
      { status: 500 }
    );
  }
}
