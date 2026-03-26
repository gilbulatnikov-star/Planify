import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const users = await prisma.user.findMany({ select: { id: true } });
  let notificationsCreated = 0;

  for (const user of users) {
    const rules = await prisma.automationRule.findMany({
      where: { userId: user.id, enabled: true },
    });

    for (const rule of rules) {
      const config = rule.config as Record<string, number | undefined>;

      // --- Stale leads (no interaction within delayHours) ---
      if (rule.templateId === "stale_lead_24h" || rule.templateId === "stale_lead_72h") {
        const hoursThreshold = config.delayHours ?? (rule.templateId === "stale_lead_24h" ? 24 : 72);
        const cutoff = new Date(now.getTime() - hoursThreshold * 60 * 60 * 1000);

        const staleLeads = await prisma.client.findMany({
          where: {
            userId: user.id,
            type: "lead",
            leadStatus: { in: ["new", "contacted"] },
            updatedAt: { lt: cutoff },
          },
          select: { id: true, name: true },
        });

        for (const lead of staleLeads) {
          // Don't create duplicate notifications for the same lead in the last 24h
          const existing = await prisma.notification.count({
            where: {
              userId: user.id,
              link: `/leads`,
              title: { contains: lead.name },
              createdAt: { gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            },
          });
          if (existing === 0) {
            const label = rule.templateId === "stale_lead_24h" ? "24 \u05E9\u05E2\u05D5\u05EA" : "3 \u05D9\u05DE\u05D9\u05DD";
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: `\u05DC\u05D9\u05D3 \u05DC\u05DC\u05D0 \u05DE\u05E2\u05E0\u05D4 (${label})`,
                message: `\u05DC\u05D9\u05D3 ${lead.name} \u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05DE\u05E2\u05E0\u05D4 \u05DB\u05D1\u05E8 ${label}`,
                type: rule.templateId === "stale_lead_72h" ? "warning" : "info",
                link: "/leads",
              },
            });
            notificationsCreated++;
          }
        }
      }

      // --- Proposal follow-up ---
      if (rule.templateId === "proposal_followup_3d" || rule.templateId === "proposal_followup_7d") {
        const daysThreshold = config.delayDays ?? (rule.templateId === "proposal_followup_3d" ? 3 : 7);
        const cutoff = new Date(now.getTime() - daysThreshold * 24 * 60 * 60 * 1000);

        const staleQuotes = await prisma.quote.findMany({
          where: {
            userId: user.id,
            status: "sent",
            createdAt: { lt: cutoff },
          },
          include: { client: { select: { name: true } } },
        });

        for (const quote of staleQuotes) {
          const existing = await prisma.notification.count({
            where: {
              userId: user.id,
              link: "/financials",
              title: { contains: quote.quoteNumber },
              createdAt: { gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            },
          });
          if (existing === 0) {
            const label = rule.templateId === "proposal_followup_3d" ? "3 \u05D9\u05DE\u05D9\u05DD" : "\u05E9\u05D1\u05D5\u05E2";
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: `Follow-up \u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8 (${label})`,
                message: `\u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8 \u05DC-${quote.client?.name ?? quote.quoteNumber} \u05DC\u05D0 \u05E0\u05E2\u05E0\u05EA\u05D4 \u05DB\u05D1\u05E8 ${label}`,
                type: "info",
                link: "/financials",
              },
            });
            notificationsCreated++;
          }
        }
      }

      // --- Deadline 24h ---
      if (rule.templateId === "deadline_24h") {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const projects = await prisma.project.findMany({
          where: {
            userId: user.id,
            deadline: { gt: now, lt: tomorrow },
            phase: { not: "delivered" },
          },
          select: { id: true, title: true },
        });

        for (const project of projects) {
          const existing = await prisma.notification.count({
            where: {
              userId: user.id,
              link: `/projects/${project.id}`,
              createdAt: { gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            },
          });
          if (existing === 0) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: "\u05D3\u05D3\u05DC\u05D9\u05D9\u05DF \u05DE\u05EA\u05E7\u05E8\u05D1",
                message: `\u05DC\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8 ${project.title} \u05E0\u05E9\u05D0\u05E8 \u05E4\u05D7\u05D5\u05EA \u05DE-24 \u05E9\u05E2\u05D5\u05EA \u05DC\u05D3\u05D3\u05DC\u05D9\u05D9\u05DF`,
                type: "urgent",
                link: `/projects/${project.id}`,
              },
            });
            notificationsCreated++;
          }
        }
      }

      // --- Overdue invoices ---
      if (rule.templateId === "overdue_invoice") {
        const overdueInvoices = await prisma.invoice.findMany({
          where: {
            userId: user.id,
            status: "sent",
            dueDate: { lt: now },
          },
          select: { id: true, invoiceNumber: true, total: true },
        });

        for (const inv of overdueInvoices) {
          const existing = await prisma.notification.count({
            where: {
              userId: user.id,
              link: "/financials",
              title: { contains: inv.invoiceNumber },
              createdAt: { gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            },
          });
          if (existing === 0) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: `\u05D7\u05E9\u05D1\u05D5\u05E0\u05D9\u05EA \u05D1\u05D0\u05D9\u05D7\u05D5\u05E8`,
                message: `\u05D7\u05E9\u05D1\u05D5\u05E0\u05D9\u05EA #${inv.invoiceNumber} \u2014 \u20AA${inv.total} \u05D1\u05D0\u05D9\u05D7\u05D5\u05E8 \u05EA\u05E9\u05DC\u05D5\u05DD`,
                type: "warning",
                link: "/financials",
              },
            });
            notificationsCreated++;
          }
        }
      }

      // --- Daily tasks reminder ---
      if (rule.templateId === "task_reminder") {
        const openTodos = await prisma.todo.count({
          where: { userId: user.id, completed: false },
        });
        if (openTodos > 0) {
          // Only send once per day
          const todayStart = new Date(now);
          todayStart.setHours(0, 0, 0, 0);
          const existing = await prisma.notification.count({
            where: {
              userId: user.id,
              title: "\u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05DC\u05D4\u05D9\u05D5\u05DD",
              createdAt: { gt: todayStart },
            },
          });
          if (existing === 0) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: "\u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05DC\u05D4\u05D9\u05D5\u05DD",
                message: `\u05D9\u05E9 \u05DC\u05DA ${openTodos} \u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05E4\u05EA\u05D5\u05D7\u05D5\u05EA \u05DC\u05D4\u05D9\u05D5\u05DD`,
                type: "info",
                link: "/tasks",
              },
            });
            notificationsCreated++;
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, processed: users.length, notificationsCreated });
}
