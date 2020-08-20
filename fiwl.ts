import boot from "./src/boot";

/**
 *  This is entry point for browser
 */
Object.defineProperty(global, 'app', {
    value : boot(),
    writable : false
});