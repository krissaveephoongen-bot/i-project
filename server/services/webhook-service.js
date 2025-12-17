/**
 * Webhook Service
 * Manages webhook integrations with external services
 */

const logger = require('../middleware/logger');

class WebhookService {
  constructor() {
    this.webhooks = new Map();
    this.queue = [];
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 5000 // 5 seconds
    };
    this.startQueueProcessor();
  }

  registerWebhook(id, config) {
    const webhook = {
      id,
      url: config.url,
      events: config.events || ['all'],
      secret: config.secret,
      active: true,
      created: new Date(),
      lastTriggered: null,
      failures: 0,
      successes: 0
    };

    this.webhooks.set(id, webhook);
    logger.info('Webhook registered', { id, url: config.url });
    return webhook;
  }

  removeWebhook(id) {
    const result = this.webhooks.delete(id);
    if (result) {
      logger.info('Webhook removed', { id });
    }
    return result;
  }

  async trigger(eventType, data) {
    for (const [id, webhook] of this.webhooks) {
      if (!webhook.active) continue;
      if (webhook.events !== 'all' && !webhook.events.includes(eventType)) continue;

      const payload = {
        id,
        event: eventType,
        timestamp: new Date().toISOString(),
        data
      };

      // Add to queue for processing
      this.queue.push({
        webhook,
        payload,
        retries: 0
      });
    }
  }

  startQueueProcessor() {
    setInterval(async () => {
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        await this.processWebhook(item);
      }
    }, 1000); // Process queue every second
  }

  async processWebhook(item) {
    const { webhook, payload, retries } = item;

    try {
      await this.sendWebhook(webhook, payload);
      webhook.lastTriggered = new Date();
      webhook.successes++;
      logger.debug('Webhook sent successfully', { id: webhook.id });
    } catch (error) {
      if (retries < this.retryConfig.maxRetries) {
        // Re-queue for retry
        setTimeout(() => {
          this.queue.push({
            webhook,
            payload,
            retries: retries + 1
          });
        }, this.retryConfig.retryDelay * (retries + 1));
      } else {
        webhook.failures++;
        logger.error('Webhook failed after retries', { id: webhook.id, error: error.message });

        if (webhook.failures > 10) {
          webhook.active = false;
          logger.warn('Webhook disabled due to repeated failures', { id: webhook.id });
        }
      }
    }
  }

  async sendWebhook(webhook, payload) {
    // Mock implementation - in production, use axios or node-fetch
    return new Promise((resolve, reject) => {
      logger.debug('Sending webhook', { url: webhook.url, event: payload.event });
      
      // Simulate HTTP request
      if (Math.random() > 0.05) { // 95% success rate for demo
        resolve({ status: 200 });
      } else {
        reject(new Error('Network error'));
      }
    });
  }

  getWebhooks() {
    return Array.from(this.webhooks.values());
  }

  getWebhookStats(id) {
    if (!id) {
      return {
        totalWebhooks: this.webhooks.size,
        activeWebhooks: Array.from(this.webhooks.values()).filter(w => w.active).length,
        queuedEvents: this.queue.length,
        webhooks: Array.from(this.webhooks.values()).map(w => ({
          id: w.id,
          url: w.url,
          active: w.active,
          successes: w.successes,
          failures: w.failures,
          lastTriggered: w.lastTriggered
        }))
      };
    }

    const webhook = this.webhooks.get(id);
    return webhook ? {
      ...webhook,
      events: webhook.events.join(', ')
    } : null;
  }

  testWebhook(id) {
    const webhook = this.webhooks.get(id);
    if (!webhook) return { error: 'Webhook not found' };

    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'Test webhook' }
    };

    this.queue.push({
      webhook,
      payload: testPayload,
      retries: 0
    });

    return { status: 'Test queued' };
  }

  disableWebhook(id) {
    const webhook = this.webhooks.get(id);
    if (webhook) {
      webhook.active = false;
      logger.info('Webhook disabled', { id });
      return true;
    }
    return false;
  }

  enableWebhook(id) {
    const webhook = this.webhooks.get(id);
    if (webhook) {
      webhook.active = true;
      webhook.failures = 0;
      logger.info('Webhook enabled', { id });
      return true;
    }
    return false;
  }
}

module.exports = new WebhookService();
