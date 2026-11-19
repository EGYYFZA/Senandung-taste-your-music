let remaining = 120;
let resetsAt = 0;

// shortcut: per-process upstream budget; enforce a shared limit at the proxy before scaling instances.
export function takeMusicRequest(now = Date.now()) {
  if (now >= resetsAt) {
    remaining = 120;
    resetsAt = now + 60000;
  }
  if (remaining === 0) return false;
  remaining -= 1;
  return true;
}
