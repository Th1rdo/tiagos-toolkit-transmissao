# -*- coding: utf-8 -*-
"""Integridade do módulo: caminhos, imports, sintaxe, chaves de i18n, templates."""
import json, re, os, sys, subprocess

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
falhas = []
ler = lambda p: open(p, encoding="utf-8").read()

mod = json.load(open("module.json", encoding="utf-8"))
for campo in ("esmodules", "styles"):
    for c in mod.get(campo, []):
        if not os.path.exists(c):
            falhas.append(f"module.json aponta para {c}, inexistente")
for l in mod.get("languages", []):
    if not os.path.exists(l["path"]):
        falhas.append(f"idioma ausente: {l['path']}")

scripts = {a: ler(f"scripts/{a}") for a in os.listdir("scripts") if a.endswith(".js")}
templates = {a: ler(f"templates/{a}") for a in os.listdir("templates") if a.endswith(".hbs")}

# um erro de sintaxe num script que os testes não importam passa o node --test
for a in scripts:
    r = subprocess.run(["node", "--check", f"scripts/{a}"], capture_output=True, text=True)
    if r.returncode:
        falhas.append(f"sintaxe: {a}: {r.stderr.strip().splitlines()[-1]}")

for arq, src in scripts.items():
    for imp in re.findall(r'from "\./([^"]+)"', src):
        if imp not in scripts:
            falhas.append(f"{arq} importa {imp}, inexistente")

# templates referidos existem
for arq, src in scripts.items():
    for t in re.findall(r'templates/([\w-]+\.hbs)', src):
        if t not in templates:
            falhas.append(f"{arq} usa templates/{t}, inexistente")

# o ApplicationV2 exige uma raiz só em cada template de PARTS (Cinema 0.9.2)
for nome, src in templates.items():
    limpo = re.sub(r"\{\{!--.*?--\}\}", "", src, flags=re.S).strip()
    raiz = re.match(r"<(\w+)", limpo)
    if not raiz or not limpo.endswith(f"</{raiz.group(1)}>") or limpo.count(f"<{raiz.group(1)}") != 1:
        falhas.append(f"{nome}: tem de ter um só elemento na raiz")

pt = json.load(open("lang/pt-BR.json", encoding="utf-8"))
en = json.load(open("lang/en.json", encoding="utf-8"))
usadas = set()
for src in list(scripts.values()) + list(templates.values()):
    usadas |= set(re.findall(r'"(TRANS\.[A-Za-z][\w.]*[A-Za-z])"', src))
for k in sorted(usadas):
    if k not in pt: falhas.append(f"chave {k} ausente em pt-BR")
    if k not in en: falhas.append(f"chave {k} ausente em en")
if set(pt) != set(en):
    falhas.append("pt-BR e en têm conjuntos de chaves diferentes")
sobrando = sorted(set(pt) - usadas)

print("\n".join(f"  ✖ {f}" for f in falhas) if falhas else "  ✓ integridade ok")
if sobrando:
    print("  · chaves declaradas e não usadas:", ", ".join(sobrando))
sys.exit(1 if falhas else 0)
