import "server-only";

import { z } from "zod";
import { LOCALES } from "./content-schema";

/**
 * Admin–visitor conversation threads for leads.
 *
 * A lead can receive replies from the dashboard. Each reply is stored as a
 * `Message` and grouped by `leadId`. The admin UI renders a simple chat box
 * (thread) so replies are sent via SMTP to the visitor's email with the branded
 * template.
 */

export const messageSchema = z.object({
  /** Parent lead id (Mongo ObjectId as string). */
  leadId: z.string().min(1, "leadId required"),
  /** Sender identity: "admin" (sent from CDA) or "visitor" (original message). */
  from: z.enum(["admin", "visitor"]),
  /** Plain text body. HTML is never stored; it's rendered at send time. */
  body: z
    .string()
    .min(1, "Message body required")
    .max(4000, "Message too long"),
  /** Recipient email for outbound admin replies. Stored for audit. */
  toEmail: z.string().email().max(200).optional(),
  /** Locale of the conversation, used to pick the correct email language. */
  locale: z.enum(LOCALES).default("fr"),
});

export type MessageInput = z.infer<typeof messageSchema>;

export type Message = MessageInput & {
  _id: string;
  /** Has the admin read this visitor message? Visitor messages start unread. */
  read: boolean;
  createdAt: string;
  updatedAt: string;
};
