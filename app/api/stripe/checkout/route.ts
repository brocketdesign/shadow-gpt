import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userSubscription = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        });

        if (userSubscription && userSubscription.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userSubscription.stripeCustomerId,
                return_url: settingsUrl,
            });

            return new NextResponse(JSON.stringify({ url: stripeSession.url }));
        }

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: settingsUrl,
            cancel_url: settingsUrl,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price_data: {
                        currency: "USD",
                        product_data: {
                            name: "Zenith AI Pro",
                            description: "Unlimited AI Coach, Advanced Analytics, and more.",
                        },
                        unit_amount: 999, // $9.99
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
            },
        });

        return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    } catch (error) {
        console.log("[STRIPE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
