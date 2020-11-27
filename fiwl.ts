import boot from "./src/boot";

/**
 *  This is entry point for browser
 */
Object.defineProperty(globalThis, "app", {
  value: boot(),
  writable: false,
});
