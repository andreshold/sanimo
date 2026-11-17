"""Import des corrections des locuteurs natifs (feuille de route D3, étape 8).

Lit un ou plusieurs classeurs « Sanimo-relecture-creole-v*.xlsx » remplis (onglet « Tèks »)
et reporte les corrections dans content-sources/*.csv :
- « Kreyòl korije » vide  → rien ne change (pas encore relu) ;
- « OK »                  → texte gardé, statut brouillon → relu_ht ;
- autre texte             → texte remplacé, statut → relu_ht (un texte « valide » modifié repasse en relu_ht :
                             le vétérinaire doit le revoir) ;
- « Kòmantè »             → ajouté à la colonne note (« Relecture HT : … »).

Clips d'écran liés à src/i18n/ht.ts (source_contenu = i18n:<clé>) : le même texte est remplacé dans ht.ts,
pour que l'écran et le clip restent identiques (tests/clips.test.ts).
Deux relecteurs en désaccord sur un même texte : la ligne est ignorée et signalée.

Lancement : python -I tools/content/import_creole.py relecture/rempli-1.xlsx [rempli-2.xlsx …] [--dry-run]
Puis : npm run content && npm test
"""
import csv
import io
import os
import sys

from openpyxl import load_workbook

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'content-sources')
HT_TS = os.path.join(ROOT, 'src', 'i18n', 'ht.ts')

# Colonne « Kote » du classeur → (fichier, colonne de texte)
WHERE = {
    'Sentòm': ('symptomes.csv', 'libelle_ht'),
    'Kesyon': ('questions.csv', 'question_ht'),
    'Konsèy': ('consignes.csv', 'texte_ht'),
    'Rezon': ('regles.csv', 'raison_ht'),
    'Pwazon (non)': ('toxiques.csv', 'nom_ht'),
    'Pwazon (mesaj)': ('toxiques.csv', 'message_ht'),
}


def target(kote):
    if kote in WHERE:
        return WHERE[kote]
    if kote and kote.startswith('Klip ekran'):
        return ('clips.csv', 'texte_ht')
    return None


def load(name):
    raw = open(os.path.join(SRC, name), encoding='utf-8-sig', newline='').read()
    nl = '\r\n' if '\r\n' in raw else '\n'
    reader = csv.DictReader(io.StringIO(raw), delimiter=';')
    return reader.fieldnames, list(reader), nl


def save(name, cols, rows, nl):
    out = io.StringIO()
    w = csv.DictWriter(out, fieldnames=cols, delimiter=';', lineterminator=nl)
    w.writeheader()
    w.writerows(rows)
    open(os.path.join(SRC, name), 'w', encoding='utf-8-sig', newline='').write(out.getvalue())


def clean(v):
    return ' '.join(str(v).split()) if v is not None else ''


def read_workbook(path):
    """[(kote, id, texte_actuel, correction, commentaire)] depuis l'onglet Tèks (en-têtes en ligne 2)."""
    ws = load_workbook(path, read_only=True, data_only=True)['Tèks']
    rows = list(ws.iter_rows(min_row=2, values_only=True))
    head = [clean(h) for h in rows[0]]
    col = {h: i for i, h in enumerate(head)}
    for needed in ('Kote', 'Idantifyan', 'Kreyòl korije', 'Kòmantè'):
        if needed not in col:
            sys.exit(f'{path} : colonne « {needed} » introuvable dans l’onglet Tèks')
    text_col = next(i for h, i in col.items() if h.startswith('Kreyòl (premye'))
    for r in rows[1:]:
        if not r or r[col['Idantifyan']] is None:
            continue
        yield (clean(r[col['Kote']]), clean(r[col['Idantifyan']]), clean(r[text_col]),
               clean(r[col['Kreyòl korije']]), clean(r[col['Kòmantè']]))


def ts_quote(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def main(argv):
    sys.stdout.reconfigure(encoding='utf-8')  # console Windows (cp1252)
    dry = '--dry-run' in argv
    paths = [a for a in argv if a != '--dry-run']
    if not paths:
        sys.exit(__doc__)

    # 1. Regrouper les réponses de tous les relecteurs, par (kote, id)
    answers = {}
    for p in paths:
        for kote, ident, current, fix, comment in read_workbook(p):
            if not fix and not comment:
                continue
            if target(kote) is None:
                print(f'? {os.path.basename(p)} : « {kote} » inconnu ({ident}), ignoré')
                continue
            answers.setdefault((kote, ident), []).append((os.path.basename(p), current, fix, comment))

    # 2. Appliquer
    files = {}
    ht_ts = open(HT_TS, encoding='utf-8').read()
    report = {'ok': 0, 'changed': 0, 'conflicts': [], 'stale': [], 'missing': [], 'i18n': []}

    for (kote, ident), given in sorted(answers.items()):
        name, column = target(kote)
        if name not in files:
            files[name] = load(name)
        cols, rows, _ = files[name]
        row = next((r for r in rows if r['id'] == ident), None)
        if row is None:
            report['missing'].append(f'{kote} {ident}')
            continue

        fixes = {('OK' if f.upper() == 'OK' else f) for _, _, f, _ in given if f}
        if len(fixes) > 1:
            report['conflicts'].append(f'{kote} {ident} : ' + ' | '.join(f'{w} → {f}' for w, _, f, _ in given if f))
            continue
        # Le texte a changé depuis l'envoi du classeur : on ne remplace pas à l'aveugle
        if any(cur and cur != clean(row[column]) for _, cur, f, _ in given if f and f.upper() != 'OK'):
            report['stale'].append(f'{kote} {ident} : le texte a changé depuis l’envoi du classeur')
            continue

        for who, _, _, comment in given:
            if comment:
                note = f'Relecture HT ({who}) : {comment}'
                row['note'] = f"{row['note']} · {note}" if row.get('note') else note

        if not fixes:
            continue
        fix = fixes.pop()
        old = row[column]
        if fix != 'OK' and fix != old:
            row[column] = fix
            report['changed'] += 1
            if name == 'clips.csv' and row['source_contenu'].startswith('i18n:'):
                needle = ts_quote(old)
                if ht_ts.count(needle) != 1:
                    report['i18n'].append(f'{ident} : texte introuvable ou en double dans ht.ts, à corriger à la main')
                else:
                    ht_ts = ht_ts.replace(needle, ts_quote(fix))
        else:
            report['ok'] += 1
        # Toxique : le statut ne monte que si le nom ET le message ont été relus
        if name == 'toxiques.csv':
            other = 'Pwazon (mesaj)' if kote == 'Pwazon (non)' else 'Pwazon (non)'
            other_given = answers.get((other, ident), [])
            if not any(f for _, _, f, _ in other_given):
                continue
        if row['statut'] == 'brouillon' or (row['statut'] == 'valide' and fix != 'OK' and fix != old):
            row['statut'] = 'relu_ht'

    # 3. Écrire et résumer
    print(f"{report['changed']} texte(s) corrigé(s), {report['ok']} validé(s) tel(s) quel(s) (OK)")
    for k, title in (('conflicts', 'Désaccords (ignorés)'), ('stale', 'Textes modifiés depuis l’envoi (ignorés)'),
                     ('missing', 'Identifiants inconnus'), ('i18n', 'À reporter à la main dans src/i18n/ht.ts')):
        if report[k]:
            print(f'{title} :')
            for line in report[k]:
                print(f'  - {line}')
    if dry:
        print('--dry-run : rien n’a été écrit.')
        return
    for name, (cols, rows, nl) in files.items():
        save(name, cols, rows, nl)
    if ht_ts != open(HT_TS, encoding='utf-8').read():
        open(HT_TS, 'w', encoding='utf-8').write(ht_ts)
        print('src/i18n/ht.ts mis à jour (clips d’écran) : prévenir D1.')
    print('Écrit. Ensuite : npm run content && npm test')


if __name__ == '__main__':
    main(sys.argv[1:])
