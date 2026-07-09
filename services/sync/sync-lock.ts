let syncChain: Promise<unknown> = Promise.resolve();

/** Serializes cloud-to-local SQLite sync so bootstrap and layout hooks cannot interleave writes. */
export function withCloudDataSyncLock<T>(operation: () => Promise<T>): Promise<T> {
  const run = syncChain.then(operation, operation);
  syncChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}
