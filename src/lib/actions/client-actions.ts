"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export async function createClient(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    if (!name) {
      return { success: false, error: "Name is required" };
    }

    await prisma.client.create({
      data: {
        name,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        company: (formData.get("company") as string) || null,
        website: (formData.get("website") as string) || null,
        instagram: (formData.get("instagram") as string) || null,
        youtube: (formData.get("youtube") as string) || null,
        linkedin: (formData.get("linkedin") as string) || null,
        tiktok: (formData.get("tiktok") as string) || null,
        notes: (formData.get("notes") as string) || null,
        type: (formData.get("type") as string) || "lead",
        leadSource: (formData.get("leadSource") as string) || null,
        leadStatus: (formData.get("leadStatus") as string) || "new",
      },
    });

    revalidatePath("/clients");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create client",
    };
  }
}

export async function updateClient(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    if (!name) {
      return { success: false, error: "Name is required" };
    }

    await prisma.client.update({
      where: { id },
      data: {
        name,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        company: (formData.get("company") as string) || null,
        website: (formData.get("website") as string) || null,
        instagram: (formData.get("instagram") as string) || null,
        youtube: (formData.get("youtube") as string) || null,
        linkedin: (formData.get("linkedin") as string) || null,
        tiktok: (formData.get("tiktok") as string) || null,
        notes: (formData.get("notes") as string) || null,
        type: (formData.get("type") as string) || "lead",
        leadSource: (formData.get("leadSource") as string) || null,
        leadStatus: (formData.get("leadStatus") as string) || "new",
      },
    });

    revalidatePath("/clients");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update client",
    };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/clients");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete client",
    };
  }
}
