"use client";

import { PageWrapper } from "@/app/components/layout/motion-wrapper";
import { ReactNode } from "react";

export function DashboardAnimations({ children }: { children: ReactNode }) {
  return <PageWrapper>{children}</PageWrapper>;
}
