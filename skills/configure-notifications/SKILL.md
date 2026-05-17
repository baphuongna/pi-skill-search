---
name: configure-notifications
description: Configure notification integrations (Telegram, Discord, Slack) via natural language
---

# Configure Notifications

Set up OMC notification integrations so you're alerted when sessions end, need input, or complete background tasks.

## Routing

Detect which provider the user wants based on their request or argument:
- If the trigger or argument contains "telegram" → follow the **Telegram** section
- If the trigger or argument contains "discord" → follow the **Discord** section
- If the trigger or argument contains "slack" → follow the **Slack** section
- If no provider is specified, use AskUserQuestion:

**Question:** "Which notification service would you like to configure?"

**Options:**
1. **Telegram** - Bot token + chat ID. Works on mobile and desktop.
2. **Discord** - Webhook or bot token + channel ID.
3. **Slack** - Incoming webhook URL.

---

## Telegram Setup

Set up Telegram notifications so OMC can message you when sessions end, need input, or complete background tasks.

### How This Skill Works

This is an interactive, natural-language configuration skill. Walk the user through setup by asking questions with AskUserQuestion. Write the result to `${CLAUDE_CONFIG_DIR:-~/.claude}/.omc-config.json`.

### Step 1: Detect Existing Configuration

```bash
CONFIG_FILE="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.omc-config.json"

if [ -f "$CONFIG_FILE" ]; then
  HAS_TELEGRAM=$(jq -r '.notifications.telegram.enabled // false' "$CONFIG_FILE" 2>/dev/null)
  CHAT_ID=$(jq -r '.notifications.telegram.chatId // empty' "$CONFIG_FILE" 2>/dev/null)
  PARSE_MODE=$(jq -r '.notifications.telegram.parseMode // "Markdown"' "$CONFIG_FILE" 2>/dev/null)

  if [ "$HAS_TELEGRAM" = "true" ]; then
    echo "EXISTING_CONFIG=true"
    echo "CHAT_ID=$CHAT_ID"
    echo "PARSE_MODE=$PARSE_MODE"
  else
    echo "EXISTING_CONFIG=false"
  fi
else
  echo "NO_CONFIG_FILE"
fi
```

If existing config is found, show the user what's currently configured and ask if they want to update or reconfigure.

### Step 2: Create a Telegram Bot

Guide the user through creating a bot if they don't have one:

```
To set up Telegram notifications, you need a Telegram bot token and your chat ID.

CREATE A BOT (if you don't have one):
1. Open Telegram and search for @BotFather
2. Send /newbot
3. Choose a name (e.g., "My OMC Notifier")
4. Choose a username (e.g., "my_omc_bot")
5. BotFather will give you a token like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz

GET YOUR CHAT ID:
1. Start a chat with your new bot (send /start)
2. Visit: https://api.telegram.org/bot/getUpdates
3. Look for "chat":{"id":YOUR_CHAT_ID}
   - Personal chat IDs are positive numbers (e.g., 123456789)
   - Group chat IDs are negative numbers (e.g., -1001234567890)
```

### Step 3: Collect Bot Token

Use AskUserQuestion:

