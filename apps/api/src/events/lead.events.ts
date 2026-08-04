import { EventEmitter } from "node:events";
import { pinoLogger } from "../utils/logger.js";

export class LeadEventEmitter extends EventEmitter {}

export const leadEventEmitter = new LeadEventEmitter();

export const LEAD_EVENTS = {
  CREATED: "lead:created",
  STATUS_UPDATED: "lead:status_updated",
  RESCHEDULED: "lead:rescheduled",
  VISITED: "lead:visited",
  CONVERTED: "lead:converted",
  CANCELLED: "lead:cancelled",
  FOLLOWUP_ADDED: "lead:followup_added",
} as const;

// Register default event listeners for future notifications / webhooks
leadEventEmitter.on(LEAD_EVENTS.CREATED, (payload) => {
  pinoLogger.info(
    { event: LEAD_EVENTS.CREATED, leadId: payload.leadId, targetType: payload.targetType },
    "Lead Event: New visit request / enquiry created",
  );
});

leadEventEmitter.on(LEAD_EVENTS.STATUS_UPDATED, (payload) => {
  pinoLogger.info(
    {
      event: LEAD_EVENTS.STATUS_UPDATED,
      leadId: payload.leadId,
      status: payload.status,
      actorRole: payload.actorRole,
    },
    "Lead Event: Lead status updated",
  );
});

leadEventEmitter.on(LEAD_EVENTS.CONVERTED, (payload) => {
  pinoLogger.info(
    { event: LEAD_EVENTS.CONVERTED, leadId: payload.leadId },
    "Lead Event: Lead converted successfully!",
  );
});
