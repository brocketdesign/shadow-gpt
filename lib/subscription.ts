import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
    const { userId } = await auth();

    if (!userId) {
        return false;
    }

    const user = await prisma.user.findUnique({
        where: {
            clerkId: userId,
        },
        select: {
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true,
        },
    });

    if (!user) {
        return false;
    }

    const isValid =
        user.stripePriceId &&
        user.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    return !!isValid;
};

export const MAX_FREE_TRACKERS = 3;

export const checkTrackerLimit = async () => {
    const { userId } = await auth();

    if (!userId) {
        return false;
    }

    const isPro = await checkSubscription();

    if (isPro) {
        return true;
    }

    const user = await prisma.user.findUnique({
        where: {
            clerkId: userId,
        },
        include: {
            customTrackers: true
        }
    });

    if (!user) {
        return false;
    }

    if (user.customTrackers.length < MAX_FREE_TRACKERS) {
        return true;
    } else {
        return false;
    }
};
