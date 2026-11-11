/**
 * Messaging moduli — PUBLIC API.
 */
export {
  messageTemplateKeys,
  useMessageTemplateList,
  useMessageTemplateDetail,
  useMessageTemplateCreate,
  useMessageTemplateUpdate,
  useMessageTemplateRemove,
} from "./api/messaging-queries";
export {
  automationRuleKeys,
  useAutomationRuleList,
  useAutomationRuleCreate,
} from "./api/messaging-queries";
export {
  messageLogKeys,
  useMessageLogList,
} from "./api/messaging-queries";
export {
  useSmsSend,
} from "./api/messaging-queries";
export type {
  MessageTemplate,
  AutomationRule,
  MessageLog,
  MessageTemplateListParams,
  AutomationRuleListParams,
  MessageLogListParams,
  MessageChannel,
  AutomationTrigger,
  MessageLogStatus,
} from "./model/types";
export type { MessageTemplateValues, AutomationRuleValues, SMSSendValues } from "./model/schemas";
export { messageTemplateSchema, automationRuleSchema, smsSendSchema } from "./model/schemas";
export { messageTemplateApi, automationRuleApi, messageLogApi, smsSendApi } from "./api/messaging-api";
export { TemplateList } from "./ui/template-list";
export { LogTable } from "./ui/log-table";
