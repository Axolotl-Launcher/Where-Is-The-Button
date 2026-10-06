"""Export this project's Claude Code session records into a chronological Markdown log.

    python scripts/export-session-log.py            # writes docs/session-log/

Sources (written by Claude Code itself, on this machine):
  ~/.claude/projects/E--GitHub-Axolotl-animation/<session>.jsonl              main conversation
  ~/.claude/projects/E--GitHub-Axolotl-animation/<session>/subagents/**.jsonl  sub-agents / workflows

Resumed sessions replay earlier records with the same uuid, so records are de-duplicated by
uuid and sorted by timestamp. Output:
  docs/session-log/README.md         index + overview
  docs/session-log/conversation-*.md the conversation in time order: user messages, Claude's
                                     replies, every tool call (commands, file writes/edits) with
                                     a truncated result
  docs/session-log/subagents.md      every sub-agent / workflow run: role, time span, files it
                                     created or edited, its final report
  docs/session-log/file-changes.md   every file created / edited (by whom, when) + deletions
                                     and moves found in shell commands

Not exported: system prompts, internal reasoning, images. Tokens and e-mail addresses are masked.
"""
from __future__ import annotations

import collections
import datetime as dt
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJ = os.path.join(os.path.expanduser('~'), '.claude', 'projects', 'E--GitHub-Axolotl-animation')
OUT = os.path.join(ROOT, 'docs', 'session-log')
TZ = dt.timezone(dt.timedelta(hours=8))  # display in Beijing time
PART_LIMIT = 650_000  # characters per conversation part (GitHub renders large Markdown poorly)
# The log ends just before the user's request to publish the project to GitHub
# (04:05:56 Beijing time); everything from that request on is left out.
CUTOFF = '2026-10-06T20:05:56.000Z'

# ───────────────────────── helpers ─────────────────────────

TOKEN_RE = re.compile(r'\b(gh[opusr]_[A-Za-z0-9]{12,}|sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16})\b')
EMAIL_RE = re.compile(r'\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b')


def redact(s: str) -> str:
	s = TOKEN_RE.sub('[redacted-token]', s)

	def mask(m: re.Match) -> str:
		user, host = m.group(1), m.group(2)
		if host.endswith('anthropic.com') or host.endswith('users.noreply.github.com'):
			return m.group(0)
		return f'{user[:2]}***@{host}'

	return EMAIL_RE.sub(mask, s)


def ts_local(ts: str | None) -> str:
	if not ts:
		return '—'
	t = dt.datetime.fromisoformat(ts.replace('Z', '+00:00')).astimezone(TZ)
	return t.strftime('%m-%d %H:%M:%S')


def clip(s: str, n: int) -> str:
	s = s.rstrip()
	return s if len(s) <= n else s[:n] + f'\n… [{len(s) - n} more characters]'


def fence(s: str, lang: str = '') -> str:
	s = s.replace('```', '`​``')
	return f'```{lang}\n{s}\n```'


def strip_system(text: str) -> str:
	"""Remove system-injected blocks from a user message, keep the human text."""
	text = re.sub(r'<system-reminder>.*?</system-reminder>', '', text, flags=re.S)
	# an invoked slash command / skill injects its whole body after these tags
	m = re.search(r'<command-(message|name)>', text)
	if m:
		names = re.findall(r'<command-name>(.*?)</command-name>', text)
		text = text[: m.start()].rstrip() + (f'\n\n_(invoked {", ".join(names)})_' if names else '')
	return text.strip()


def read_jsonl(path: str) -> list[dict]:
	out = []
	with open(path, encoding='utf-8') as fh:
		for line in fh:
			try:
				out.append(json.loads(line))
			except json.JSONDecodeError:
				pass
	return out


def blocks(content) -> list[dict]:
	if isinstance(content, str):
		return [{'type': 'text', 'text': content}]
	return [b for b in content or [] if isinstance(b, dict)]


def result_text(b: dict) -> str:
	c = b.get('content')
	if isinstance(c, str):
		return c
	parts = []
	for x in c or []:
		if isinstance(x, dict) and x.get('type') == 'text':
			parts.append(x.get('text', ''))
		elif isinstance(x, dict) and x.get('type') == 'image':
			parts.append('[image]')
	return '\n'.join(parts)


# ───────────────────────── tool-call rendering ─────────────────────────


def describe_call(name: str, inp: dict) -> tuple[str, str]:
	"""(one-line title, body markdown) for a tool call."""
	if name in ('Bash', 'PowerShell'):
		lang = 'bash' if name == 'Bash' else 'powershell'
		return f'{name} — {inp.get("description", "")}', fence(redact(clip(inp.get('command', ''), 2500)), lang)
	if name == 'Write':
		c = inp.get('content', '')
		return f'Write `{rel(inp.get("file_path", ""))}`', f'_{c.count(chr(10)) + 1} lines, {len(c.encode("utf-8")):,} bytes written_'
	if name == 'Edit':
		old, new = inp.get('old_string', ''), inp.get('new_string', '')
		d = new.count('\n') - old.count('\n')
		body = f'_replaced {old.count(chr(10)) + 1} line(s) with {new.count(chr(10)) + 1} line(s) ({d:+d}){" — all occurrences" if inp.get("replace_all") else ""}_'
		return f'Edit `{rel(inp.get("file_path", ""))}`', body + '\n\n' + fence(redact(clip('- ' + old.replace('\n', '\n- ') + '\n+ ' + new.replace('\n', '\n+ '), 1200)), 'diff')
	if name == 'Read':
		extra = ''
		if inp.get('offset') or inp.get('limit'):
			extra = f' (offset {inp.get("offset", 0)}, limit {inp.get("limit", "—")})'
		return f'Read `{rel(inp.get("file_path", ""))}`{extra}', ''
	if name in ('Glob', 'Grep'):
		return f'{name} `{inp.get("pattern", "")}`' + (f' in `{rel(inp.get("path", ""))}`' if inp.get('path') else ''), ''
	if name == 'Workflow':
		script = inp.get('script') or ''
		m = re.search(r"name:\s*'([^']+)'", script)
		d = re.search(r"description:\s*'([^']+)'", script)
		if m:
			return f'Workflow `{m.group(1)}`', f'_{d.group(1) if d else ""}_'
		return 'Workflow (resume)', f'`{rel(inp.get("scriptPath", ""))}` · run `{inp.get("resumeFromRunId", "")}`'
	if name == 'Agent':
		return f'Agent — {inp.get("description", "")}', fence(redact(clip(inp.get('prompt', ''), 900)))
	if name == 'SendMessage':
		return f'SendMessage → `{inp.get("to", "")}`', fence(redact(clip(str(inp.get('message', '')), 900)))
	if name == 'SendUserFile':
		return 'SendUserFile', '\n'.join(f'- `{rel(f)}`' for f in inp.get('files', [])) + (f'\n\n> {inp.get("caption")}' if inp.get('caption') else '')
	if name == 'Skill':
		return f'Skill `{inp.get("skill", "")}`', ''
	if name == 'ToolSearch':
		return f'ToolSearch `{inp.get("query", "")}`', ''
	if name == 'TaskStop':
		return f'TaskStop `{inp.get("task_id", "")}`', ''
	if 'mark_chapter' in name:
		return f'Chapter: {inp.get("title", "")}', ''
	return name, fence(redact(clip(json.dumps(inp, ensure_ascii=False, indent=1), 900)), 'json')


def rel(p: str) -> str:
	p = (p or '').replace('\\', '/')
	r = ROOT.replace('\\', '/')
	if p.lower().startswith(r.lower()):
		return p[len(r):].lstrip('/') or '.'
	return p


# ───────────────────────── main conversation ─────────────────────────


def load_main() -> list[dict]:
	seen: dict[str, dict] = {}
	for f in sorted(glob.glob(os.path.join(PROJ, '*.jsonl'))):
		for e in read_jsonl(f):
			queued = e.get('type') == 'attachment' and (e.get('attachment') or {}).get('type') == 'queued_command'
			if (e.get('type') not in ('user', 'assistant') and not queued) or not e.get('uuid') or not e.get('timestamp'):
				continue
			if e['timestamp'] >= CUTOFF:
				continue
			seen.setdefault(e['uuid'], e)
	return sorted(seen.values(), key=lambda e: e['timestamp'])


def render_conversation(entries: list[dict]) -> tuple[list[str], dict]:
	results: dict[str, tuple[str, bool]] = {}
	for e in entries:
		if e['type'] == 'user':
			for b in blocks(e.get('message', {}).get('content')):
				if b.get('type') == 'tool_result':
					results[b.get('tool_use_id', '')] = (result_text(b), bool(b.get('is_error')))
	chunks: list[str] = []
	stats = collections.Counter()
	mid_turn_seen: set[str] = set()
	for e in entries:
		t = ts_local(e['timestamp'])
		msg = e.get('message', {})
		if e['type'] == 'attachment':
			# a message the user typed while Claude was mid-turn (delivered with the next tool result)
			u = strip_system(str((e.get('attachment') or {}).get('prompt', '')))
			if u and u not in mid_turn_seen:
				mid_turn_seen.add(u)
				stats['user messages'] += 1
				chunks.append(f'\n### {t} · 👤 User (sent while Claude was working)\n\n{redact(u)}\n')
			continue
		if e['type'] == 'user':
			if e.get('isMeta'):
				continue
			for b in blocks(msg.get('content')):
				if b.get('type') == 'text':
					raw = b.get('text', '')
					if '<task-notification>' in raw:
						summ = re.search(r'<summary>(.*?)</summary>', raw, re.S)
						status = re.search(r'<status>(.*?)</status>', raw, re.S)
						chunks.append(f'> **{t} · background task {status.group(1) if status else ""}** — {summ.group(1).strip() if summ else ""}\n')
						stats['notifications'] += 1
						continue
					text = strip_system(raw)
					if not text:
						continue
					stats['user messages'] += 1
					chunks.append(f'\n### {t} · 👤 User\n\n{redact(text)}\n')
				elif b.get('type') == 'image':
					chunks.append(f'\n_{t} · 👤 User attached an image_\n')
				elif b.get('type') == 'tool_result':
					# messages the user typed while a turn was running arrive with tool results
					txt = result_text(b)
					for m in re.finditer(r'The user sent a new message while you were working:\n(.*?)(?:\n\nThis is how Claude Code surfaces|$)', txt, re.S):
						u = m.group(1).strip()
						if u and u not in mid_turn_seen:
							mid_turn_seen.add(u)
							stats['user messages'] += 1
							chunks.append(f'\n### {t} · 👤 User (sent while Claude was working)\n\n{redact(u)}\n')
			continue
		for b in blocks(msg.get('content')):
			kind = b.get('type')
			if kind == 'text' and b.get('text', '').strip():
				stats['assistant messages'] += 1
				chunks.append(f'\n### {t} · 🤖 Claude\n\n{redact(b["text"].strip())}\n')
			elif kind == 'tool_use':
				name = b.get('name', '')
				title, body = describe_call(name, b.get('input', {}) or {})
				stats[f'tool:{name}'] += 1
				if 'mark_chapter' in name:
					chunks.append(f'\n---\n\n## {t} · {redact(title.replace("Chapter: ", ""))}\n')
					continue
				res, err = results.get(b.get('id', ''), ('', False))
				res_md = ''
				if res.strip():
					res_md = f'\n<details><summary>{"⚠️ error" if err else "result"}</summary>\n\n{fence(redact(clip(res, 700)))}\n\n</details>\n'
				chunks.append(f'\n**{t} · 🛠 {redact(title)}**\n\n{body}\n{res_md}')
	return chunks, stats


# ───────────────────────── sub-agents & workflows ─────────────────────────


def agent_files(path: str) -> tuple[list[tuple[str, str, str]], collections.Counter, str | None, str | None]:
	touched, tools = [], collections.Counter()
	first = last = None
	for e in read_jsonl(path):
		ts = e.get('timestamp')
		if ts:
			first = first or ts
			last = ts
		if e.get('type') != 'assistant':
			continue
		for b in blocks(e.get('message', {}).get('content')):
			if b.get('type') == 'tool_use':
				tools[b.get('name', '')] += 1
				inp = b.get('input', {}) or {}
				if b.get('name') in ('Write', 'Edit', 'NotebookEdit') and inp.get('file_path') and (ts or '') < CUTOFF:
					touched.append((ts or '', b['name'], rel(inp['file_path'])))
	return touched, tools, first, last


def load_subagents():
	runs = []
	for sess in sorted(glob.glob(os.path.join(PROJ, '*', 'subagents'))):
		for f in sorted(glob.glob(os.path.join(sess, 'agent-*.jsonl'))):
			aid = os.path.basename(f)[6:-6]
			meta = {}
			mp = f[:-6] + '.meta.json'
			if os.path.exists(mp):
				meta = json.load(open(mp, encoding='utf-8'))
			runs.append({'workflow': None, 'agentId': aid, 'label': meta.get('description', aid), 'path': f, 'result': None})
		for wf in sorted(glob.glob(os.path.join(sess, 'workflows', 'wf_*'))):
			journal = os.path.join(wf, 'journal.jsonl')
			labels, res = {}, {}
			if os.path.exists(journal):
				for j in read_jsonl(journal):
					if j.get('type') == 'started':
						labels[j['agentId']] = j.get('label', j['agentId'])
					if j.get('type') == 'result':
						res[j['agentId']] = j.get('result')
			for f in sorted(glob.glob(os.path.join(wf, 'agent-*.jsonl'))):
				aid = os.path.basename(f)[6:-6]
				runs.append({'workflow': os.path.basename(wf), 'agentId': aid, 'label': labels.get(aid, aid), 'path': f, 'result': res.get(aid)})
	return runs


# ───────────────────────── write everything ─────────────────────────


def main() -> None:
	os.makedirs(OUT, exist_ok=True)
	for old in glob.glob(os.path.join(OUT, 'conversation-*.md')):
		os.remove(old)
	entries = load_main()
	chunks, stats = render_conversation(entries)
	parts, cur = [], ''
	for c in chunks:
		if len(cur) + len(c) > PART_LIMIT and cur:
			parts.append(cur)
			cur = ''
		cur += c
	if cur:
		parts.append(cur)
	part_names = []
	for i, p in enumerate(parts, 1):
		name = f'conversation-{i:02d}.md'
		part_names.append(name)
		nav = f'[← index](README.md)' + (f' · [← part {i - 1}](conversation-{i - 1:02d}.md)' if i > 1 else '') + (f' · [part {i + 1} →](conversation-{i + 1:02d}.md)' if i < len(parts) else '')
		with open(os.path.join(OUT, name), 'w', encoding='utf-8') as fh:
			fh.write(f'# Conversation log · part {i} of {len(parts)}\n\n{nav}\n\nTimes are Beijing time (UTC+8). Tool results are truncated; internal reasoning and system text are omitted.\n\n{p}\n\n{nav}\n')

	# sub-agents
	runs = load_subagents()
	all_touch = []  # (ts, actor, op, path)
	sub_md = ['# Sub-agents and workflows\n', '[← index](README.md)\n', 'Every helper agent Claude started, grouped by workflow, with the files it created or edited and its final report (truncated).\n']
	by_wf = collections.OrderedDict()
	for r in runs:
		by_wf.setdefault(r['workflow'] or 'standalone agents', []).append(r)
	for wf, rs in by_wf.items():
		sub_md.append(f'\n## {wf}\n')
		for r in rs:
			touched, tools, first, last = agent_files(r['path'])
			for ts, op, p in touched:
				all_touch.append((ts, f'agent `{r["label"]}`', op, p))
			files = sorted({p for _, _, p in touched})
			ntool = sum(tools.values())
			sub_md.append(f'\n### {r["label"]}\n\n- agent id `{r["agentId"]}` · {ts_local(first)} → {ts_local(last)} · {ntool} tool calls ({", ".join(f"{k} {v}" for k, v in tools.most_common(6))})')
			if files:
				sub_md.append('- files created/edited:\n' + '\n'.join(f'  - `{p}`' for p in files))
			res = r.get('result')
			if res:
				txt = res if isinstance(res, str) else json.dumps(res, ensure_ascii=False, indent=1)
				sub_md.append(f'\n<details><summary>final report</summary>\n\n{fence(redact(clip(txt, 6000)))}\n\n</details>\n')
	with open(os.path.join(OUT, 'subagents.md'), 'w', encoding='utf-8') as fh:
		fh.write('\n'.join(sub_md) + '\n')

	# file changes (main + agents)
	deletions = []
	for e in entries:
		if e['type'] != 'assistant':
			continue
		for b in blocks(e.get('message', {}).get('content')):
			if b.get('type') != 'tool_use':
				continue
			inp = b.get('input', {}) or {}
			if b.get('name') in ('Write', 'Edit') and inp.get('file_path'):
				all_touch.append((e['timestamp'], 'main', b['name'], rel(inp['file_path'])))
			if b.get('name') in ('Bash', 'PowerShell'):
				cmd = inp.get('command', '')
				if re.search(r'(^|[\s;&|(])(rm|mv|Remove-Item|Move-Item|rmdir)\s', cmd):
					deletions.append((e['timestamp'], inp.get('description', ''), cmd))
	all_touch.sort()
	per_file = collections.OrderedDict()
	for ts, actor, op, p in all_touch:
		d = per_file.setdefault(p, {'first': ts, 'last': ts, 'writes': 0, 'edits': 0, 'actors': collections.Counter()})
		d['last'] = ts
		d['writes' if op == 'Write' else 'edits'] += 1
		d['actors'][actor] += 1
	fc = ['# File changes\n', '[← index](README.md)\n', f'{len(per_file)} files were created or edited through Claude\'s file tools (main conversation + sub-agents). Files produced by scripts (renders, generated images, audio, the icon module) appear in the shell commands of the conversation log.\n',
		'\n## Created / edited files (by first touch)\n', '| first | last | file | writes | edits | by |', '|---|---|---|---:|---:|---|']
	for p, d in sorted(per_file.items(), key=lambda kv: kv[1]['first']):
		fc.append(f'| {ts_local(d["first"])} | {ts_local(d["last"])} | `{p}` | {d["writes"]} | {d["edits"]} | {", ".join(a for a, _ in d["actors"].most_common(3))} |')
	fc.append('\n## Deletions and moves (shell commands, main conversation)\n')
	for ts, desc, cmd in deletions:
		fc.append(f'\n**{ts_local(ts)}** — {redact(desc)}\n\n{fence(redact(clip(cmd, 900)), "bash")}')
	with open(os.path.join(OUT, 'file-changes.md'), 'w', encoding='utf-8') as fh:
		fh.write('\n'.join(fc) + '\n')

	# index
	first, last = entries[0]['timestamp'], entries[-1]['timestamp']
	tool_counts = {k[5:]: v for k, v in stats.items() if k.startswith('tool:')}
	idx = [
		'# Session log · 《启动按钮去哪了？》',
		'',
		'A chronological record of how this project was made with Claude Code, exported from Claude Code\'s own session transcripts by `scripts/export-session-log.py` (re-run it to refresh).',
		'',
		f'- Span: {ts_local(first)} → {ts_local(last)} (Beijing time, 2026). The log ends just before the request to publish the project to GitHub.',
		f'- {stats["user messages"]} user messages · {stats["assistant messages"]} Claude replies · {sum(tool_counts.values())} tool calls in the main conversation · {len(runs)} sub-agents',
		'- Tool calls: ' + ', '.join(f'{k} {v}' for k, v in sorted(tool_counts.items(), key=lambda kv: -kv[1])),
		'',
		'## Contents',
		'',
		*[f'- [Conversation part {i}]({n})' for i, n in enumerate(part_names, 1)],
		'- [Sub-agents and workflows](subagents.md) — every helper agent, the files it touched, its report',
		'- [File changes](file-changes.md) — every file created/edited (when, by whom), deletions and moves',
		'',
		'Not included: system prompts, the model\'s internal reasoning, images. Tokens and e-mail addresses are masked.',
	]
	with open(os.path.join(OUT, 'README.md'), 'w', encoding='utf-8') as fh:
		fh.write('\n'.join(idx) + '\n')
	print(f'{len(entries)} records → {len(parts)} conversation parts, {len(runs)} sub-agents, {len(per_file)} files tracked → {rel(OUT)}')


if __name__ == '__main__':
	sys.exit(main())
