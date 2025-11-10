import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// GET - Get all categories and sub-categories
export async function GET(request: Request) {
  try {
    // Get unique categories with their sub-categories
    const result = await sql`
      SELECT 
        category,
        json_agg(DISTINCT sub_category ORDER BY sub_category) as sub_categories
      FROM question_templates
      WHERE is_active = TRUE
      GROUP BY category
      ORDER BY category
    `;

    const categories = result.rows.map((row) => ({
      category: row.category,
      sub_categories: row.sub_categories || [],
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

