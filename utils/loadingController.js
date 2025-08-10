const subscribers = new Set();
let counter = 0;
// Fail-safe timers to avoid stuck overlay if a request never resolves
const timers = new Set();
const MAX_LOADING_MS = 15000; // 15s safety cap

// Defer notifications to avoid state updates during restricted lifecycle
let scheduled = false;
const scheduleNotify = () => {
  if (scheduled) return;
  scheduled = true;
  const tick = (cb) => (typeof window !== 'undefined' && window.requestAnimationFrame) ? window.requestAnimationFrame(cb) : setTimeout(cb, 0);
  tick(() => {
    scheduled = false;
    subscribers.forEach((fn) => {
      try { fn(counter > 0); } catch (_) {}
    });
  });
};

export function startLoading() {
  counter += 1;
  if (counter === 1) scheduleNotify();
  // schedule a safety stop to avoid deadlock
  const t = setTimeout(() => {
    timers.delete(t);
    if (counter > 0) {
      counter -= 1;
      if (counter === 0) scheduleNotify();
    }
  }, MAX_LOADING_MS);
  timers.add(t);
}

export function stopLoading() {
  if (timers.size) {
    // clear one safety timer corresponding to this stop
    const first = timers.values().next().value;
    if (first) {
      clearTimeout(first);
      timers.delete(first);
    }
  }
  if (counter > 0) counter -= 1;
  if (counter === 0) scheduleNotify();
}

export function subscribeLoading(listener) {
  subscribers.add(listener);
  // Initial call
  try { listener(counter > 0); } catch (_) {}
  return () => subscribers.delete(listener);
}


