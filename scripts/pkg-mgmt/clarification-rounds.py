#!/usr/bin/env python3
"""clarification-rounds.py -- yield batches of 5 packages for the `clarify` tool.

Usage:
    cat crossref-result.json | python3 clarification-rounds.py > clarify-input.json

Reads a JSON object with a "migratable" array (from crossref-apt.py) on stdin
and writes JSON for the `clarify` tool on stdout.  Each "round" is a separate
clarify question, batched 5 packages per round.

Each clarify question maps:
    install via apt as '<apt_name>'?   ->  choices: [Yes, install via apt,
                                                No, keep on winget/choco,
                                                Skip for now]
"""
import json
import sys


def chunk(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def main():
    data = json.load(sys.stdin)
    migratable = data.get("migratable", [])
    rounds = list(chunk(migratable, 5))

    for i, batch in enumerate(rounds, 1):
        print(f"\n=== ROUND {i}/{len(rounds)} ===")
        for j, pkg in enumerate(batch, 1):
            apt_name = pkg.get("apt_name", pkg.get("name", "unknown"))
            print(f"  {j}. {pkg['name']} (v{pkg['version']}) -> apt: {apt_name}")
        questions = []
        for pkg in batch:
            apt_name = pkg.get("apt_name", pkg.get("name", "unknown"))
            questions.append({
                "question": f"Install {pkg['name']} (v{pkg['version']}) via apt as '{apt_name}'?",
                "choices": [
                    "Yes, install via apt",
                    "No, keep on winget/choco",
                    "Skip for now",
                ],
            })
        print(json.dumps({"round": i, "questions": questions}))


if __name__ == "__main__":
    main()
