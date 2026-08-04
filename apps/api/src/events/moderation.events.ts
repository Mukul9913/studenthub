import { EventEmitter } from "node:events";
import { logger } from "../utils/logger.js";

export const MODERATION_EVENTS = {
  SUBMITTED: "moderation:submitted",
  APPROVED: "moderation:approved",
  REJECTED: "moderation:rejected",
  SUSPENDED: "moderation:suspended",
  RESTORED: "moderation:restored",
  COMMENT_ADDED: "moderation:comment_added",
} as const;

export class ModerationEventEmitter extends EventEmitter {}

export const moderationEventEmitter = new ModerationEventEmitter();

moderationEventEmitter.on(MODERATION_EVENTS.SUBMITTED, (data) => {
  logger.info("Listing submitted for moderation review", {
    event: MODERATION_EVENTS.SUBMITTED,
    data,
  });
});

moderationEventEmitter.on(MODERATION_EVENTS.APPROVED, (data) => {
  logger.info("Listing approved and published", { event: MODERATION_EVENTS.APPROVED, data });
});

moderationEventEmitter.on(MODERATION_EVENTS.REJECTED, (data) => {
  logger.info("Listing rejected by moderator", { event: MODERATION_EVENTS.REJECTED, data });
});

moderationEventEmitter.on(MODERATION_EVENTS.SUSPENDED, (data) => {
  logger.info("Listing suspended by admin", { event: MODERATION_EVENTS.SUSPENDED, data });
});

moderationEventEmitter.on(MODERATION_EVENTS.RESTORED, (data) => {
  logger.info("Listing restored from suspension/archive", {
    event: MODERATION_EVENTS.RESTORED,
    data,
  });
});
