"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const questionFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  sub_category: z.string().min(1, "Sub-category is required"),
  question_text: z.string().min(10, "Question must be at least 10 characters"),
  question_type: z.enum(["yes_no", "multiple_choice"]),
  applicable_tiers: z.array(z.string()).min(1, "Select at least one tier"),
  weight: z.number().min(0.5).max(2.0),
  is_critical: z.boolean(),
  motivation_learning_point: z.string().optional(),
  answer_options: z.array(
    z.object({
      option_text: z.string().min(1, "Option text required"),
      score_value: z.number().min(1).max(10),
      is_example: z.boolean(),
    })
  ).min(2),
  score_examples: z.object({
    low_reason: z.string().optional(),
    low_action: z.string().optional(),
    medium_reason: z.string().optional(),
    medium_action: z.string().optional(),
    high_reason: z.string().optional(),
    high_action: z.string().optional(),
  }),
});

type FormData = z.infer<typeof questionFormSchema>;

export default function NewQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{category: string; sub_categories: string[]}[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question_type: "multiple_choice",
      weight: 1.0,
      is_critical: false,
      applicable_tiers: ["tier_0"],
      answer_options: [
        { option_text: "", score_value: 10, is_example: false },
        { option_text: "", score_value: 5, is_example: false },
        { option_text: "", score_value: 1, is_example: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "answer_options",
  });

  const questionType = watch("question_type");
  const selectedCategory = watch("category");

  // Fetch categories
  useEffect(() => {
    fetch("/api/questions/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  // Auto-set answer options when type changes
  useEffect(() => {
    if (questionType === "yes_no") {
      setValue("answer_options", [
        { option_text: "Yes", score_value: 10, is_example: false },
        { option_text: "No", score_value: 1, is_example: false },
      ]);
    }
  }, [questionType, setValue]);

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);

    try {
      // Transform score_examples from flat object to array
      const score_examples = [];
      if (data.score_examples.low_reason) {
        score_examples.push({
          score_level: "low" as const,
          reason_text: data.score_examples.low_reason,
          report_action: data.score_examples.low_action || "",
        });
      }
      if (data.score_examples.medium_reason) {
        score_examples.push({
          score_level: "medium" as const,
          reason_text: data.score_examples.medium_reason,
          report_action: data.score_examples.medium_action || "",
        });
      }
      if (data.score_examples.high_reason) {
        score_examples.push({
          score_level: "high" as const,
          reason_text: data.score_examples.high_reason,
          report_action: data.score_examples.high_action || "",
        });
      }

      const payload = {
        ...data,
        score_examples,
      };

      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create question");
        return;
      }

      router.push("/dashboard/questions");
      router.refresh();
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = categories.find((c) => c.category === selectedCategory);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Add New Question</h2>
          <p className="text-gray-600 mt-2">
            Create a new audit question with answer options and scoring
          </p>
        </div>
        <Link href="/dashboard/questions">
          <Button variant="outline">← Back</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub_category">Sub-Category *</Label>
                <select
                  id="sub_category"
                  {...register("sub_category")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!selectedCategory}
                >
                  <option value="">Select sub-category</option>
                  {currentCategory?.sub_categories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="__new__">+ Add New Sub-Category</option>
                </select>
                {errors.sub_category && (
                  <p className="text-sm text-red-600">{errors.sub_category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text *</Label>
              <Textarea
                id="question_text"
                {...register("question_text")}
                placeholder="Enter the audit question..."
                rows={3}
              />
              {errors.question_text && (
                <p className="text-sm text-red-600">{errors.question_text.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_critical"
                {...register("is_critical")}
                className="h-4 w-4 cursor-pointer"
              />
              <Label htmlFor="is_critical" className="cursor-pointer">
                Mark as <Badge variant="destructive" className="ml-1">CRITICAL</Badge> question
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Question Type & Answers */}
        <Card>
          <CardHeader>
            <CardTitle>Answer Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question Type *</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="multiple_choice"
                    {...register("question_type")}
                    className="h-4 w-4"
                  />
                  <span>Multiple Choice</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="yes_no"
                    {...register("question_type")}
                    className="h-4 w-4"
                  />
                  <span>Yes/No</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      {...register(`answer_options.${index}.option_text`)}
                      placeholder="Answer option text"
                      disabled={questionType === "yes_no"}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      {...register(`answer_options.${index}.score_value`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Score"
                      min={1}
                      max={10}
                    />
                  </div>
                  {questionType === "multiple_choice" && fields.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              {errors.answer_options && (
                <p className="text-sm text-red-600">
                  {errors.answer_options.message || "Check answer options"}
                </p>
              )}
            </div>

            {questionType === "multiple_choice" && fields.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ option_text: "", score_value: 5, is_example: false })
                }
              >
                + Add Option
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Tiers & Weight */}
        <Card>
          <CardHeader>
            <CardTitle>Tiers & Weighting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Applicable Tiers *</Label>
              <div className="flex gap-3 flex-wrap">
                {["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"].map((tier) => (
                  <label key={tier} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={tier}
                      {...register("applicable_tiers")}
                      className="h-4 w-4"
                    />
                    <span>{tier.replace("_", " ").toUpperCase()}</span>
                  </label>
                ))}
              </div>
              {errors.applicable_tiers && (
                <p className="text-sm text-red-600">{errors.applicable_tiers.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weighting Factor * (0.5 - 2.0)</Label>
              <Input
                id="weight"
                type="number"
                step="0.5"
                min="0.5"
                max="2.0"
                {...register("weight", { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500">
                Higher weight = more impact on overall score. Standard = 1.0, Critical = 2.0
              </p>
              {errors.weight && (
                <p className="text-sm text-red-600">{errors.weight.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scoring Guidance */}
        <Card>
          <CardHeader>
            <CardTitle>Scoring Guidance</CardTitle>
            <CardDescription>
              Provide context for each score level to guide recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivation">Motivation/Learning Point</Label>
              <Textarea
                id="motivation"
                {...register("motivation_learning_point")}
                placeholder="Why is this question important? What should landlords learn?"
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-red-600">Low Score (1-3)</Label>
                <Textarea
                  {...register("score_examples.low_reason")}
                  placeholder="Reason for low score"
                  rows={2}
                />
                <Textarea
                  {...register("score_examples.low_action")}
                  placeholder="Recommended action"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-yellow-600">Medium Score (4-7)</Label>
                <Textarea
                  {...register("score_examples.medium_reason")}
                  placeholder="Reason for medium score"
                  rows={2}
                />
                <Textarea
                  {...register("score_examples.medium_action")}
                  placeholder="Recommended action"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-600">High Score (8-10)</Label>
                <Textarea
                  {...register("score_examples.high_reason")}
                  placeholder="Reason for high score"
                  rows={2}
                />
                <Textarea
                  {...register("score_examples.high_action")}
                  placeholder="Recommended action"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/questions">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Question"}
          </Button>
        </div>
      </form>
    </div>
  );
}

