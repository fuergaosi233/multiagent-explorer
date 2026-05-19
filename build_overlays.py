import re
import json

# Read agent output files and extract translations
def extract_from_agent_output(filepath):
    """Extract pattern translations from agent JSONL output."""
    patterns = {}

    with open(filepath, 'r') as f:
        for line in f:
            try:
                data = json.loads(line)
                if data.get('type') == 'assistant':
                    content = data.get('content', '')
                    # Find all code blocks
                    blocks = re.findall(r"```ts\n(.*?)\n```", content, re.DOTALL)
                    for block in blocks:
                        # Extract pattern id
                        id_match = re.search(r"'([^']+)':\s*\{", block)
                        if id_match:
                            pid = id_match.group(1)
                            patterns[pid] = block
            except:
                continue

    return patterns

# Try to read from agent outputs
import glob
agent_files = glob.glob('/private/tmp/claude-501/-Users-moonshot-Temp-multiagent-explorer/5b77ae53-e57b-4c45-ae93-a837274a1398/subagents/*.jsonl')

all_patterns = {}
for f in agent_files:
    p = extract_from_agent_output(f)
    all_patterns.update(p)

print(f"Extracted {len(all_patterns)} patterns from agent outputs")
for pid in sorted(all_patterns.keys()):
    print(f"  - {pid}")
