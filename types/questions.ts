// Dynamic Questions System Types

import { RiskAuditTier } from "./database";

export type QuestionType = 'yes_no' | 'multiple_choice';
export type ScoreLevel = 'low' | 'medium' | 'high';

export interface QuestionTemplate {
  id: number;
  category: string;
  sub_category: string;
  question_number: string;
  question_text: string;
  question_type: QuestionType;
  applicable_tiers: RiskAuditTier[];
  weight: number;
  is_critical: boolean;
  motivation_learning_point: string | null;
  created_by_auditor_id: number | null;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  // Report action columns from CSV import
  red_score_example: string | null;
  orange_score_example: string | null;
  report_action: string | null;
}

export interface AnswerOption {
  id: number;
  question_template_id: number;
  option_text: string;
  score_value: number;
  option_order: number;
  is_example: boolean;
  created_at: Date;
}

export interface ScoreExample {
  id: number;
  question_template_id: number;
  score_level: ScoreLevel;
  reason_text: string;
  report_action: string | null;
  created_at: Date;
}

// Extended type with relations
export interface QuestionTemplateWithOptions extends QuestionTemplate {
  answer_options: AnswerOption[];
  score_examples: ScoreExample[];
}

// Request types for API
export interface CreateQuestionRequest {
  category: string;
  sub_category: string;
  question_text: string;
  question_type: QuestionType;
  applicable_tiers: RiskAuditTier[];
  weight: number;
  is_critical: boolean;
  motivation_learning_point?: string;
  answer_options: {
    option_text: string;
    score_value: number;
    is_example?: boolean;
  }[];
  score_examples: {
    score_level: ScoreLevel;
    reason_text: string;
    report_action?: string;
  }[];
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  is_active?: boolean;
}

