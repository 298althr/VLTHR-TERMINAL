# Railway CPU Optimization & Event-Driven Migration Plan

The high CPU and memory consumption on the Railway instance is caused by a combination of aggressive frontend polling against a single-threaded PHP built-in server and background cron/sync processes. Since Railway uses a single container, constant background tasks and rapid HTTP polling will immediately bottleneck the PHP process, causing it to queue requests and burn compute resources.

Here is the plan to shut down all schedulers/polling and make the entire system **100% Event-Driven**.

## 1. Shut Down Frontend HTTP Polling (The Main CPU Burner)
**The Problem:** 
- `web/templates/agent.php` runs `setInterval(pollMessages, 4000);` (polls every 4 seconds).
- `web/templates/admin/agent_console.php` runs `setInterval(pollMessages, 2000);` (polls every 2 seconds).
When an admin or customer leaves these tabs open, they hammer the single-threaded PHP server with hundreds of requests per minute, locking up the CPU.

**Event-Driven Solution:**
- **Action:** Remove the `setInterval` loops immediately.
- **Replacement:** We already have `TelegramService.php` configured. When a customer sends a message, a webhook is fired to Telegram. The Admin can click the link in Telegram to open the chat only when needed.

## 2. Eliminate Gorfos GitHub Sync Cron Jobs
**The Problem:**
- The documentation (`gorfos_integration_manager.md` and `gorfos_integration_streicher.md`) outlines a cron job running every 2 hours (`0 */2 * * * sync.sh`) to pull updates from the shared GitHub repository. 
- Running cron jobs inside a Railway PHP container requires a process manager (like Supervisord), which competes for CPU with the web server.

**Event-Driven Solution:**
- **Action:** Disable/Remove the cron job schedule from the Railway deployment.
- **Replacement:** Use **GitHub Webhooks**. Since the CSV database is stored on GitHub, we can configure a GitHub Webhook to send a `POST` request to `https://streichergmbh.com/api/github/webhook` whenever Gorfos pushes an update to the repository. The application will execute `GitHubSyncService->pullLatest()` **only** when this webhook is received.

## 3. Remove Background Scrapers / Scripts
**The Problem:**
- Scripts like `scripts/image_scraper.py` contain infinite `while True` loops and `time.sleep()` calls. If these are ever executed on the Railway server via an admin endpoint or startup script, they will run indefinitely and consume background memory.

**Event-Driven Solution:**
- **Action:** Ensure these scripts are strictly isolated to local development/seed environments and are not triggered during the Railway `CMD` startup.

---

## Immediate Next Steps (Ready for Execution)
1. **Modify `agent_console.php` and `agent.php`** to remove `setInterval` and replace it with a manual or webhook-triggered refresh.
2. **Create a GitHub Webhook Listener** in `web/includes/routes_api.php` to listen for pushes from the Gorfos team.
3. **Ensure Railway `CMD`** in the Dockerfile only runs the web server without any background workers.

*Let me know if you approve this plan, and I will immediately execute the code changes to shut down the polling and set up the webhooks!*
