
(async () => {
    try {
        console.log("Verify loader script running...");
        // Dynamic import to Trigger the loader hook
        await import('./loader.mjs');
        console.log("Loader verification successful: process did not crash.");
    } catch (e) {
        console.error("Loader verification failed:", e);
        process.exit(1);
    }
})();
