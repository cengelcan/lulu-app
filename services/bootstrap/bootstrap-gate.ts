type BootstrapRun = {
  promise: Promise<void>;
  resolve: () => void;
  complete: boolean;
};

let currentRun: BootstrapRun | null = null;

export function beginBootstrap(): void {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });

  currentRun = { promise, resolve, complete: false };
}

export function completeBootstrap(): void {
  if (!currentRun || currentRun.complete) {
    return;
  }

  currentRun.complete = true;
  currentRun.resolve();
}

export async function waitForBootstrap(): Promise<void> {
  if (currentRun?.complete) {
    return;
  }

  if (!currentRun) {
    return;
  }

  await currentRun.promise;
}
