import { z } from "zod";

export const messageTemplateSchema = z.object({
  name: z.string().min(1, "Nomi majburiy"),
  channel: z.enum(["sms", "telegram", "push"]),
  subject: z.string().optional().nullable(),
  body: z.string().min(1, "Matn majburiy"),
  is_active: z.boolean().default(true),
});

export type MessageTemplateValues = z.infer<typeof messageTemplateSchema>;

export const automationRuleSchema = z.object({
  trigger: z.enum(["debt", "missed_class", "payment_received", "group_start", "trial_end"]),
  template_id: z.string().min(1, "Shablon tanlanishi majburiy"),
  channel: z.enum(["sms", "telegram", "push"]),
  is_active: z.boolean().default(true),
});

export type AutomationRuleValues = z.infer<typeof automationRuleSchema>;

export const smsSendSchema = z.object({
  to: z.string().min(1, "Raqam majburiy"),
  template_id: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  placeholders: z.record(z.string()).optional().nullable(),
});

export type SMSSendValues = z.infer<typeof smsSendSchema>;
