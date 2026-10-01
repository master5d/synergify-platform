#!/usr/bin/env python3
"""Залить учебные tx-шаблоны из workers/email-templates/ в Listmonk (создать или обновить по имени).

Только stdlib: запускается на узле, где живёт Listmonk (hetzner), без node.
Креды — из окружения, не из argv: LISTMONK_URL (по умолчанию http://127.0.0.1:9000),
LISTMONK_API_USER, LISTMONK_API_TOKEN. На узле: `set -a; . /root/sovern/listmonk.env; set +a`.

    python3 sync_listmonk_templates.py <каталог шаблонов> [--dry-run]

Шаблон = _layout-<lang>.html с телом ts-<step>-<lang>.html вместо `<!-- BODY -->`; тема — из первой
строки тела `<!-- subject: … -->`. Выход: 0 — все шаблоны залиты (или dry-run прошёл), 1 — хоть один нет.
"""
import base64
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request

SUBJECT = re.compile(r"^<!--\s*subject:\s*(.+?)\s*-->\s*\n", re.S)
NAME = re.compile(r"^ts-[a-z0-9-]+-(ru|en)$")
TIMEOUT = 20


def build(root: pathlib.Path) -> list[dict]:
    layouts = {lang: (root / f"_layout-{lang}.html").read_text(encoding="utf-8") for lang in ("ru", "en")}
    out = []
    for f in sorted(root.glob("ts-*.html")):
        name = f.stem
        m = NAME.match(name)
        if not m:
            raise SystemExit(f"плохое имя шаблона: {f.name}")
        raw = f.read_text(encoding="utf-8")
        sm = SUBJECT.match(raw)
        if not sm:
            raise SystemExit(f"{f.name}: нет первой строки <!-- subject: … -->")
        layout = layouts[m.group(1)]
        if layout.count("<!-- BODY -->") != 1:
            raise SystemExit(f"_layout-{m.group(1)}.html: маркер <!-- BODY --> должен быть ровно один")
        body = layout.replace("<!-- BODY -->", raw[sm.end():].strip())
        opens = len(re.findall(r"\{\{\s*if\b", body))
        ends = len(re.findall(r"\{\{\s*end\s*\}\}", body))
        if opens != ends:
            raise SystemExit(f"{f.name}: {{{{ if }}}} = {opens}, {{{{ end }}}} = {ends}")
        out.append({"name": name, "type": "tx", "subject": sm.group(1), "body": body})
    return out


def api(method: str, path: str, payload: dict | None = None) -> dict:
    url = os.environ.get("LISTMONK_URL", "http://127.0.0.1:9000").rstrip("/") + path
    user, token = os.environ.get("LISTMONK_API_USER", ""), os.environ.get("LISTMONK_API_TOKEN", "")
    if not user or not token:
        raise SystemExit("нет LISTMONK_API_USER / LISTMONK_API_TOKEN в окружении")
    req = urllib.request.Request(url, method=method, data=json.dumps(payload).encode() if payload else None)
    req.add_header("Authorization", "Basic " + base64.b64encode(f"{user}:{token}".encode()).decode())
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.loads(r.read() or b"{}")


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__)
        return 2
    templates = build(pathlib.Path(args[0]))
    if "--dry-run" in sys.argv:
        for t in templates:
            print(f"{t['name']:<20} {len(t['body']):>6} B  {t['subject']}")
        print(f"dry-run: {len(templates)} шаблонов собраны")
        return 0
    existing = {t["name"]: t for t in api("GET", "/api/templates")["data"]}
    failed = 0
    for t in templates:
        cur = existing.get(t["name"])
        try:
            if cur and cur.get("type") != "tx":
                raise RuntimeError(f"имя занято шаблоном типа {cur.get('type')}")
            if cur:
                api("PUT", f"/api/templates/{cur['id']}", t)
                print(f"обновлён  {t['name']} (id {cur['id']})")
            else:
                res = api("POST", "/api/templates", t)["data"]
                new_id = res["id"] if isinstance(res, dict) else res[-1]["id"]
                print(f"создан    {t['name']} (id {new_id})")
        except (urllib.error.HTTPError, urllib.error.URLError, RuntimeError, KeyError) as e:
            detail = e.read().decode(errors="replace")[:300] if isinstance(e, urllib.error.HTTPError) else str(e)
            print(f"ОШИБКА    {t['name']}: {detail}", file=sys.stderr)
            failed += 1
    print(f"итого: {len(templates) - failed} из {len(templates)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
