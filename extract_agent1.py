import json
import re

with open('/private/tmp/claude-501/-Users-moonshot-Temp-multiagent-explorer/5b77ae53-e57b-4c45-ae93-a837274a1398/subagents/agent-a1b79acef4660672b.jsonl', 'r') as f:
    lines = f.readlines()

# Find the last assistant message with code blocks
for line in reversed(lines):
    data = json.loads(line)
    if data.get('type') == 'assistant':
        msg = data.get('message', {})
        content = msg.get('content', '')
        if '```ts' in str(content):
            # Extract text content
            text_parts = []
            for part in content:
                if isinstance(part, str):
                    text_parts.append(part)
                elif isinstance(part, dict) and part.get('type') == 'text':
                    text_parts.append(part.get('text', ''))
            full_text = ''.join(text_parts)
            print(full_text)
            break
