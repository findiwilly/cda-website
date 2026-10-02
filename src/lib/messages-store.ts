import "server-only";

import { ObjectId } from "mongodb";
import { collection, COLLECTIONS } from "@/lib/mongo";
import { serialize } from "@/lib/content";
import type { Message, MessageInput } from "@/lib/message-schema";

/** Mark messages in a lead thread as read. */
export async function markThreadRead(leadId: string): Promise<number> {
  const col = await collection(COLLECTIONS.messages);
  if (!col || !ObjectId.isValid(leadId)) return 0;
  const res = await col.updateMany(
    { leadId, from: "visitor", read: false },
    { $set: { read: true, updatedAt: new Date() } },
  );
  return res.modifiedCount;
}

/** Add a message to a thread. */
export async function addMessage(input: MessageInput): Promise<Message | null> {
  const col = await collection(COLLECTIONS.messages);
  if (!col || !ObjectId.isValid(input.leadId)) return null;
  const now = new Date();
  const doc = {
    ...input,
    read: input.from === "admin",
    createdAt: now,
    updatedAt: now,
  };
  const res = await col.insertOne(doc);
  const inserted = await col.findOne({ _id: res.insertedId });
  return inserted ? serialize<Message>(inserted) : null;
}

/** List messages for a lead, oldest first. */
export async function listMessages(leadId: string): Promise<Message[]> {
  const col = await collection(COLLECTIONS.messages);
  if (!col || !ObjectId.isValid(leadId)) return [];
  const docs = await col
    .find({ leadId })
    .sort({ createdAt: 1 })
    .toArray();
  return docs.map((d) => serialize<Message>(d));
}

/** Count unread visitor messages across all threads. */
export async function countUnreadMessages(): Promise<number> {
  const col = await collection(COLLECTIONS.messages);
  if (!col) return 0;
  return col.countDocuments({ from: "visitor", read: false });
}
