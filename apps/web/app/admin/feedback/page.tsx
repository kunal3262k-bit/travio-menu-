import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FeedbackPortalClient from "./FeedbackPortalClient";

export default async function AdminFeedbackPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const feedbacks = await prisma.feedback.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">Customer Feedback & Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Review ratings and private customer comments to monitor service quality.</p>
      </div>

      <FeedbackPortalClient initialFeedbacks={feedbacks} />
    </div>
  );
}
