/**
 * Messaging (SMS, shablonlar, avtomatik triggerlar) modellar.
 */
export type MessageChannel = "sms" | "telegram" | "push";
export type AutomationTrigger = "debt" | "missed_class" | "payment_received" | "group_start" | "trial_end";
export type MessageLogStatus = "queued" | "sent" | "delivered" | "failed";

export interface MessageTemplate {
  id: string;
  tenant_id: string;
  name: string;
  channel: MessageChannel;
  subject?: string | null;
  body: string;
  is_active: boolean;
  created_at: string;
}

export interface AutomationRule {
  id: string;
  tenant_id: string;
  trigger: AutomationTrigger;
  template_id: string;
  channel: MessageChannel;
  is_active: boolean;
  created_at: string;
}

export interface MessageLog {
  id: string;
  tenant_id: string;
  recipient_phone?: string | null;
  channel: MessageChannel;
  body: string;
  status: MessageLogStatus;
  sent_at?: string | null;
  /** Read-only values the list serializer inlines for the log table. */
  recipient_name?: string | null;
  template_name?: string | null;
  created_at: string;
}

export interface SMSSendValues {
  to: string;
  template_id?: string | null;
  body?: string | null;
  placeholders?: Record<string, string> | null;
}

export interface MessageTemplateListParams {
  channel?: MessageChannel;
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface AutomationRuleListParams {
  trigger?: AutomationTrigger;
  channel?: MessageChannel;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface MessageLogListParams {
  channel?: MessageChannel;
  status?: MessageLogStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}
