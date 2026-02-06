import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { z } from "zod";

// =============================================================================
// POST /api/auth/register
// =============================================================================
// Creates a new auditor account. REQUIRES valid invite code.
// Set REGISTRATION_INVITE_CODE in environment variables.
// =============================================================================

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  inviteCode: z.string().min(1, "Invite code is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, inviteCode } = registerSchema.parse(body);

    // SECURITY: Validate invite code to prevent unauthorized registration
    const validInviteCode = process.env.REGISTRATION_INVITE_CODE;
    if (!validInviteCode) {
      console.error("REGISTRATION_INVITE_CODE not set - registration disabled");
      return NextResponse.json(
        { error: "Registration is currently disabled" },
        { status: 403 }
      );
    }

    if (inviteCode !== validInviteCode) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with default 'auditor' role
    const result = await sql`
      INSERT INTO users (name, email, password_hash, role, created_at)
      VALUES (${name}, ${email}, ${passwordHash}, 'auditor', NOW())
      RETURNING id, name, email, role, created_at
    `;

    const user = result.rows[0];

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

