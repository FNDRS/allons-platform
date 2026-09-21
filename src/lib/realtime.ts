let channelInstanceCount = 0;

/**
 * Builds a Realtime topic that is unique per subscription instance.
 *
 * `supabase.channel(topic)` hands back the existing channel while one with
 * the same topic is still registered, and `removeChannel()` only unregisters
 * it once its async unsubscribe resolves. An effect that re-subscribes inside
 * that window would get an already-joined channel, and adding a
 * `postgres_changes` listener to a joined channel throws. A per-instance
 * suffix keeps overlapping mounts on their own channels.
 */
export function uniqueChannelTopic(prefix: string): string {
  channelInstanceCount += 1;
  return `${prefix}:i${channelInstanceCount}`;
}
