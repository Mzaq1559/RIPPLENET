import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, type Role } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "") as Role;
    let campId = body.campId ? Number(body.campId) : null;

    if (!username || !name || !password || !role) {
      return Response.json(
        { error: "Username, full name, password, and role are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (role === "admin" || role === "camp_manager") {
      return Response.json(
        { error: "This role cannot be created by self-registration." },
        { status: 403 }
      );
    }

    if (role !== "volunteer") {
      return Response.json({ error: "Invalid role specified." }, { status: 400 });
    }

    // Check if username is already taken
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return Response.json(
        { error: "This username is already registered. Please choose another or login." },
        { status: 409 }
      );
    }

    // Assign default base camp if none selected for volunteer/manager
    if ((role === "volunteer" || role === "camp_manager") && !campId) {
      const defaultCamp = await prisma.camp.findFirst();
      campId = defaultCamp?.id ?? 1;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role,
        name,
        phone: phone || "0300 1234567",
        campId,
        available: true,
      },
    });

    // Automatically establish session
    await createSession({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role as Role,
      name: newUser.name,
      campId: newUser.campId,
    });

    return Response.json(
      {
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
          campId: newUser.campId,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Signup error:", e);
    return Response.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
