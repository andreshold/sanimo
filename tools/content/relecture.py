"""Classeurs de relecture (feuille de route D3, étapes 6 et 8).

Lit content-sources/*.csv et produit dans relecture/ :
- Sanimo-relecture-veterinaire-v<version>.xlsx : niveaux, règles, consignes, toxiques, cas ;
- Sanimo-relecture-creole-v<version>.xlsx      : textes créoles à réécrire par un locuteur natif
  (retour : tools/content/import_creole.py) ;
- Sanimo-anrejistreman-ka-v<version>.xlsx      : cas à lire à voix haute, avec l'accord des voix ;
- Sanimo-ekoute-klip-v<version>.xlsx           : écoute des clips audio générés par D2.

Lancement : python -I tools/content/relecture.py
"""
import csv
import json
import os
import sys

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'content-sources')
OUT = os.path.join(ROOT, 'relecture')
VERSION = json.load(open(os.path.join(ROOT, 'content', 'version.json'), encoding='utf-8'))['rulesVersion']

FONT = 'Arial'
BLUE = '0F3D5E'
YELLOW = 'FFF4C2'
LEVEL_FILL = {'ijans': 'F6D5D1', 'konsilte': 'FBE8C8', 'siveye': 'D3EBE1'}
THIN = Side(style='thin', color='DDE4E8')


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f, delimiter=';'))


def sheet(wb, title, intro, columns, rows, review_cols, widths):
    """columns : [(en-tête, clé CSV ou fonction)] ; review_cols : en-têtes des colonnes à remplir."""
    ws = wb.create_sheet(title)
    ws['A1'] = intro
    ws['A1'].font = Font(name=FONT, italic=True, size=10, color='5B6B76')
    ws['A1'].alignment = Alignment(wrap_text=True, vertical='top')
    total = len(columns) + len(review_cols)
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=total)
    ws.row_dimensions[1].height = 45

    headers = [h for h, _ in columns] + review_cols
    for c, h in enumerate(headers, 1):
        cell = ws.cell(row=2, column=c, value=h)
        review = c > len(columns)
        cell.font = Font(name=FONT, bold=True, color='1B2B36' if review else 'FFFFFF')
        cell.fill = PatternFill('solid', fgColor='E8A33D' if review else BLUE)
        cell.alignment = Alignment(wrap_text=True, vertical='center')

    for r, row in enumerate(rows, 3):
        for c, (_, key) in enumerate(columns, 1):
            value = key(row) if callable(key) else row.get(key, '')
            cell = ws.cell(row=r, column=c, value=value)
            cell.font = Font(name=FONT, size=10)
            cell.alignment = Alignment(wrap_text=True, vertical='top')
            cell.border = Border(bottom=THIN)
            if value in LEVEL_FILL:
                cell.fill = PatternFill('solid', fgColor=LEVEL_FILL[value])
        for c in range(len(columns) + 1, total + 1):
            cell = ws.cell(row=r, column=c)
            cell.fill = PatternFill('solid', fgColor=YELLOW)
            cell.font = Font(name=FONT, size=10)
            cell.alignment = Alignment(wrap_text=True, vertical='top')
            cell.border = Border(bottom=THIN)

    if review_cols and rows and review_cols[0].startswith("D'accord"):
        col = get_column_letter(len(columns) + 1)
        dv = DataValidation(type='list', formula1='"Oui,Non,À discuter"', allow_blank=True)
        ws.add_data_validation(dv)
        dv.add(f'{col}3:{col}{len(rows) + 2}')

    for c, w in enumerate(widths + [14] + [40] * (len(review_cols) - 1), 1):
        ws.column_dimensions[get_column_letter(c)].width = w
    ws.freeze_panes = 'B3'
    ws.auto_filter.ref = f'A2:{get_column_letter(total)}{len(rows) + 2}'
    return ws


def cover(wb, title, lines, table=None):
    ws = wb.active
    ws.title = 'À lire d’abord'
    ws['A1'] = title
    ws['A1'].font = Font(name=FONT, bold=True, size=16, color=BLUE)
    r = 3
    for line in lines:
        ws.cell(row=r, column=1, value=line).font = Font(name=FONT, size=11, bold=line.endswith(':'))
        ws.cell(row=r, column=1).alignment = Alignment(wrap_text=True, vertical='top')
        r += 1
    if table:
        r += 1
        headers, rows = table
        for c, h in enumerate(headers, 1):
            cell = ws.cell(row=r, column=c, value=h)
            cell.font = Font(name=FONT, bold=True, color='FFFFFF' if c < len(headers) else '1B2B36')
            cell.fill = PatternFill('solid', fgColor=BLUE if c < len(headers) else 'E8A33D')
        for row in rows:
            r += 1
            for c, v in enumerate(row, 1):
                cell = ws.cell(row=r, column=c, value=v)
                cell.font = Font(name=FONT, size=10)
                cell.alignment = Alignment(wrap_text=True, vertical='top')
            ws.cell(row=r, column=len(headers)).fill = PatternFill('solid', fgColor=YELLOW)
    ws.column_dimensions['A'].width = 6 if table else 110
    if table:
        ws.column_dimensions['A'].width = 110
        ws.column_dimensions['B'].width = 60
    return ws


REVIEW = ["D'accord ?", 'Correction / commentaire']
LEVELS_TXT = 'ijans = vétérinaire maintenant · konsilte = vétérinaire sous 24 à 48 h · siveye = surveiller à la maison'


def vet_workbook():
    wb = Workbook()
    cover(wb, f'Sanimo — relecture vétérinaire (contenu v{VERSION})', [
        "Merci de relire ce contenu. Sanimo n'établit aucun diagnostic et ne donne aucun médicament : "
        "il dit seulement à quel point c'est urgent et ce qu'il faut faire en attendant.",
        f'Les trois niveaux : {LEVELS_TXT}.',
        'Garantie de sûreté : un signe d’alerte confirmé, ou une réponse « oui » à sa question, donne toujours ijans. '
        "Une IA peut relever le niveau, jamais l'abaisser.",
        '',
        'Comment répondre :',
        "• Dans chaque onglet, seules les colonnes orange/jaunes sont à remplir : « D'accord ? » (Oui / Non / À discuter) "
        'et « Correction / commentaire ».',
        '• Exemple : symptôme « oeil_douloureux_ferme », niveau konsilte → D’accord ? = Non ; '
        'Commentaire = « ijans : risque de perdre l’œil en quelques heures ».',
        "• L'application est entièrement en créole : les textes ci-dessous sont ceux affichés et lus à voix haute. "
        'Leur tournure est relue à part par des locuteurs natifs : concentrez-vous sur le sens et les niveaux.',
        '• Les seuils de durée (24 h, 48 h, 1 semaine) sont des propositions : merci de les corriger si besoin.',
        '',
        'Points à trancher en priorité :',
    ], (
        ['Question', 'Votre réponse'],
        [
            ['1. « Chiot qui vomit et a la diarrhée » : ijans (proposé) ou konsilte ?', ''],
            ['2. Œil rouge, douloureux ou gardé fermé : konsilte (actuel) ou ijans ?', ''],
            ['3. Toxiques à niveau discuté : macadamia, caféine, oignon / ail, huiles essentielles : ijans ou konsilte ?', ''],
            ['4. Seuils de durée : vomissements (24 h), diarrhée (48 h), chat sans manger (24 h), chien sans manger (48 h), boiterie (24 h), toux ou nez qui coule (1 semaine). Bons ?', ''],
            ['5. « Je ne sais pas » à une question d’alerte donne konsilte. Pour quels signes faut-il ijans ? '
             'En particulier : respiration, couleur des gencives (beaucoup de propriétaires ne savent pas regarder), '
             'effondrement, ingestion d’un toxique. (Déjà ijans : chat mâle ou de sexe inconnu qui ne sait pas s’il urine.)', ''],
            ['6. Aucun symptôme et que des « non » : siveye avec les signes qui doivent faire revenir. Acceptable ?', ''],
            ['7. Chaton qui vomit et a la diarrhée : konsilte aujourd’hui, alors que le chiot est en ijans. Faut-il ijans aussi ?', ''],
            ['8. Jeune animal qui ne boit plus ou vomit l’eau : konsilte aujourd’hui. Faut-il ijans ? Et combien de vomissements pour « vomit sans arrêt » ?', ''],
            ['9. Coup de chaleur : faut-il poser la question à chaque évaluation (climat d’Haïti) ? Aujourd’hui seulement si le propriétaire en parle.', ''],
            ['10. Questions de base posées à chaque évaluation : respiration, effondrement, toxique, et urine pour le chat mâle. Faut-il en ajouter ou en retirer ?', ''],
            ['11. Toxiques et plantes propres à Haïti à ajouter (pesticides et raticides du marché, plantes…) :', ''],
            ['12. Qui contacter en Haïti après une morsure (centre de santé, numéro) :', ''],
            ['13. Vétérinaires à ajouter à l’annuaire (nom, commune, téléphone, urgences 24 h) :', ''],
            ['14. Écran Toxiques, texte lu à voix haute : « Chèche sa bèt ou a manje oswa bwè nan lis la. Si ou pa sèten, '
             'ale kay yon veterinè kounye a. » (si le produit n’est pas dans la liste → aller tout de suite chez le vétérinaire). D’accord ?', ''],
        ],
    ))

    sheet(wb, 'Symptômes', 'Liste fermée des symptômes que Sanimo reconnaît. « Signe d’alerte = oui » → toujours ijans.', [
        ('Identifiant', 'id'), ('Catégorie', 'categorie'), ('Espèces', 'especes'), ('Libellé (créole)', 'libelle_ht'),
        ("Signe d'alerte", 'signe_alerte'), ('Niveau minimal', 'niveau_min'), ('Source', 'source'), ('Note', 'note'),
    ], read('symptomes.csv'), REVIEW, [28, 14, 12, 45, 12, 12, 28, 40])

    def asked(row):
        parts = []
        if row['toujours'] == 'oui':
            parts.append('à chaque évaluation')
        if row['declenchee_par']:
            parts.append('si : ' + row['declenchee_par'].replace(',', ', '))
        if not parts:
            parts.append('seulement si le symptôme est cité')
        filt = ' · '.join(x for x in [row['especes'], row['sexe'], row['age']] if x)
        return '; '.join(parts) + (f' ({filt})' if filt else '')

    sheet(wb, 'Questions', 'Questions oui / non posées une par une, dans l’ordre de la colonne Ordre. Les questions d’alerte sont toujours posées ; les questions de suivi (durée, évolution) sont limitées à 10.', [
        ('Identifiant', 'id'), ('Type', 'type'), ('Question (créole)', 'question_ht'), ('Posée quand', asked),
        ('Ordre', lambda r: int(r['priorite'])), ('Si « je ne sais pas »', 'niveau_si_mpakonnen'), ('Note', 'note'),
    ], sorted(read('questions.csv'), key=lambda r: int(r['priorite'])), REVIEW, [28, 10, 50, 45, 8, 14, 40])

    def cond(row):
        out = []
        for part in row['conditions'].split('&'):
            k, _, v = part.strip().partition(':')
            out.append({'sym': 'symptôme ', 'rep': 'réponse ', 'espece': 'espèce ', 'sexe': 'sexe ', 'age': 'âge '}.get(k, k) + v)
        return ' ET '.join(out)

    rules = read('regles.csv')
    sheet(wb, 'Règles', 'Règles écrites à la main (durée, âge, combinaisons). Les règles « signe d’alerte → ijans » et '
          '« niveau minimal » sont générées depuis l’onglet Symptômes et ne figurent pas ici.', [
        ('Identifiant', 'id'), ('Si…', cond), ('Alors niveau', 'niveau'), ('Raison affichée (créole)', 'raison_ht'),
        ('Consignes', lambda r: r['consignes'].replace(',', ', ')), ('Source', 'source'), ('Note', 'note'),
    ], rules, REVIEW, [28, 50, 12, 40, 35, 22, 40])

    sheet(wb, 'Consignes', 'Textes affichés et lus à voix haute. Aucun médicament, aucune dose.', [
        ('Identifiant', 'id'), ('Contexte', 'contexte'), ('Type', 'type'), ('Espèces', 'especes'),
        ('Texte (créole)', 'texte_ht'), ('Source', 'source'), ('Note', 'note'),
    ], read('consignes.csv'), REVIEW, [26, 12, 14, 12, 60, 24, 30])

    sheet(wb, 'Toxiques', 'Décision v1 : toute ingestion d’un toxique de la liste → ijans, sans calcul selon le poids.', [
        ('Identifiant', 'id'), ('Catégorie', 'categorie'), ('Nom (créole)', 'nom_ht'), ('Noms locaux', 'noms_locaux_a_completer'),
        ('Espèces', 'especes'), ('Niveau', 'niveau'), ('Message (créole)', 'message_ht'), ('Note', 'note'),
    ], read('toxiques.csv'), REVIEW, [26, 16, 35, 18, 12, 10, 50, 35])

    sheet(wb, 'Cas de test', 'Récits de propriétaires et niveau attendu. Le moteur doit donner exactement ce niveau. '
          'Merci de vérifier surtout les cas non alarmants.', [
        ('Identifiant', 'id'), ('Espèce', 'espece'), ('Âge', 'age'), ('Sexe', 'sexe'),
        ('Récit', 'texte'), ('Symptômes', lambda r: r['symptomes_attendus'].replace(',', ', ')),
        ('Réponses supposées', 'reponses'), ('Niveau attendu', 'niveau_attendu'), ('Type', 'type_cas'), ('Note', 'note'),
    ], read('cas_test.csv'), REVIEW, [9, 8, 9, 9, 55, 30, 24, 12, 11, 30])

    path = os.path.join(OUT, f'Sanimo-relecture-veterinaire-v{VERSION}.xlsx')
    wb.save(path)
    return path


def creole_workbook():
    wb = Workbook()
    cover(wb, f'Sanimo — relekti kreyòl (kontni v{VERSION})', [
        'Mèsi paske w ap li tèks sa yo. Se yon entèlijans atifisyèl (IA) ki ekri premye vèsyon kreyòl la : '
        'nou bezwen yon moun ki pale kreyòl chak jou pou fè l sonnen natirèl.',
        '',
        'Kijan pou w reponn :',
        '• Kolòn jòn yo sèlman : « Kreyòl korije » (ekri vèsyon pa w) ak « Kòmantè ». Si tèks la bon, ekri « OK ».',
        '• Fraz kout, mo moun itilize chak jou. Tèks sa yo ap li ak vwa : li yo awotvwa.',
        '• Egzanp : « Èske li gen pwoblèm pou l respire ? » → « Èske l ap respire mal ? » ; Kòmantè : « pi kout ».',
    ])
    rows = []
    for r in read('symptomes.csv'):
        rows.append({'ou': 'Sentòm', 'id': r['id'], 'ht': r['libelle_ht']})
    for r in sorted(read('questions.csv'), key=lambda r: int(r['priorite'])):
        rows.append({'ou': 'Kesyon', 'id': r['id'], 'ht': r['question_ht']})
    for r in read('consignes.csv'):
        rows.append({'ou': 'Konsèy', 'id': r['id'], 'ht': r['texte_ht']})
    for r in read('regles.csv'):
        rows.append({'ou': 'Rezon', 'id': r['id'], 'ht': r['raison_ht']})
    for r in read('toxiques.csv'):
        rows.append({'ou': 'Pwazon (non)', 'id': r['id'], 'ht': r['nom_ht']})
        rows.append({'ou': 'Pwazon (mesaj)', 'id': r['id'], 'ht': r['message_ht']})
    # Klip ekran : tèks li awotvwa sou ekran yo (lòt tèks yo deja anlè a)
    for r in read('clips.csv'):
        rows.append({'ou': f"Klip ekran {r['ecran']}", 'id': r['id'], 'ht': r['texte_ht']})
    sheet(wb, 'Tèks', 'Tout tèks aplikasyon an ap montre oswa li awotvwa.', [
        ('Kote', 'ou'), ('Idantifyan', 'id'), ('Kreyòl (premye vèsyon IA)', 'ht'),
    ], rows, ['Kreyòl korije', 'Kòmantè'], [14, 28, 60])
    ws = wb['Tèks']
    ws.column_dimensions[get_column_letter(4)].width = 60

    path = os.path.join(OUT, f'Sanimo-relecture-creole-v{VERSION}.xlsx')
    wb.save(path)
    return path


def yellow_header(ws, row, headers, widths):
    for c, (h, w) in enumerate(zip(headers, widths), 1):
        cell = ws.cell(row=row, column=c, value=h)
        cell.font = Font(name=FONT, bold=True, color='1B2B36')
        cell.fill = PatternFill('solid', fgColor='E8A33D')
        cell.alignment = Alignment(wrap_text=True, vertical='center')
        ws.column_dimensions[get_column_letter(c)].width = w


def dropdown(ws, choices, cell_range):
    dv = DataValidation(type='list', formula1='"' + ','.join(choices) + '"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(cell_range)


def pick_recording_cases(n=24):
    """Cas à enregistrer : pièges et négations, puis un cas d'alerte par signe, puis des cas non alarmants."""
    cases = read('cas_test.csv')
    chosen = [c for c in cases if c['type_cas'] in ('piege', 'negation')]
    signs = set()
    for c in cases:
        first = c['symptomes_attendus'].split(',')[0]
        if c['type_cas'] == 'alerte' and first not in signs and len(chosen) < n - 5:
            signs.add(first)
            chosen.append(c)
    chosen += [c for c in cases if c['type_cas'] == 'non_alerte'][: n - len(chosen)]
    order = {c['id']: i for i, c in enumerate(cases)}
    return sorted(chosen, key=lambda c: order[c['id']])


VOICES = ['v1', 'v2', 'v3', 'v4']


def recording_workbook():
    """Étape 8 : les récits lus à voix haute (3 voix ou plus) pour tester la reconnaissance vocale."""
    wb = Workbook()
    cover(wb, f'Sanimo — anrejistre ka yo (kontni v{VERSION})', [
        'Mèsi paske w ap ede nou. N ap teste si Sanimo konprann moun k ap pale kreyòl. '
        'Nou bezwen tande menm istwa yo nan bouch plizyè moun (omwen 3 vwa : fanm, gason, laj diferan).',
        '',
        'Kijan pou w anrejistre :',
        '• Sèvi ak telefòn ou (aplikasyon anrejistreman vwa a), nan yon chanm nòmal : pa bezwen silans total.',
        '• Kenbe telefòn nan tankou w ap pale nan telefòn. Li istwa a natirèlman, tankou w ap rakonte l bay yon zanmi. '
        'Ou ka chanje kèk mo si se pa konsa ou ta di l.',
        '• Yon fichye pou chak istwa. Non fichye a : idantifyan istwa a + nimewo vwa w (egzanp : ct_001_v1.m4a).',
        '• Make « Wi » nan kolòn vwa w lè w fin anrejistre istwa a.',
        '',
        'Dakò ou (obligatwa anvan nou sèvi ak vwa w) :',
        '• Ekri non w nan onglet « Dakò » epi chwazi si nou ka pibliye vwa w.',
        '• Si w di « Non », anrejistreman w yo ap rete prive : yo p ap janm mete sou entènèt.',
        '• Ou ka chanje lide nenpòt ki lè : n ap efase anrejistreman w yo.',
    ])

    consent = wb.create_sheet('Dakò')
    consent['A1'] = ('Mwen dakò pou ekip Sanimo sèvi ak anrejistreman vwa m yo pou teste aplikasyon an. '
                     'Mwen ka chanje lide nenpòt ki lè : y ap efase anrejistreman m yo.')
    consent['A1'].font = Font(name=FONT, size=11)
    consent['A1'].alignment = Alignment(wrap_text=True, vertical='top')
    consent.merge_cells('A1:E1')
    consent.row_dimensions[1].height = 50
    yellow_header(consent, 3, ['Vwa', 'Non', 'Dat', 'Nou ka pibliye vwa w ? (Wi / Non)', 'Siyati oswa « Dakò »'],
                  [8, 30, 14, 30, 30])
    for r, v in enumerate(VOICES + ['v5', 'v6'], 4):
        consent.cell(row=r, column=1, value=v).font = Font(name=FONT, size=10)
        for c in range(2, 6):
            consent.cell(row=r, column=c).fill = PatternFill('solid', fgColor=YELLOW)
    dropdown(consent, ['Wi', 'Non'], 'D4:D9')

    cases = pick_recording_cases()
    sheet(wb, 'Istwa yo', 'Li chak istwa awotvwa. Yon fichye pou chak istwa, pou chak vwa.', [
        ('Idantifyan', 'id'), ('Bèt', 'espece'), ('Istwa pou w li', 'texte'),
    ], cases, [f'Vwa {v} fini ?' for v in VOICES], [10, 8, 80])
    ws = wb['Istwa yo']
    last = get_column_letter(3 + len(VOICES))
    dropdown(ws, ['Wi'], f'D3:{last}{len(cases) + 2}')
    for c in range(4, 4 + len(VOICES)):
        ws.column_dimensions[get_column_letter(c)].width = 14

    path = os.path.join(OUT, f'Sanimo-anrejistreman-ka-v{VERSION}.xlsx')
    wb.save(path)
    return path


def listening_workbook():
    """Étape 8 : faire écouter les clips générés par D2 (assets/clips/<id>.mp3) à un locuteur natif."""
    with open(os.path.join(ROOT, 'content', 'clips.json'), encoding='utf-8') as f:
        clips = json.load(f)
    wb = Workbook()
    cover(wb, f'Sanimo — koute klip yo (kontni v{VERSION})', [
        'Mèsi paske w ap koute klip yo. Se yon vwa atifisyèl ki li tèks yo : nou bezwen konnen si l pale kreyòl byen.',
        '',
        'Kijan pou w reponn :',
        '• Koute chak klip (fichye ki nan kolòn « Fichye »), epi li tèks la an menm tan.',
        '• « Byen pwononse ? » : Wi oswa Non.',
        '• « Mo ki mal li » : ekri mo a jan vwa a di l, epi jan l ta dwe sonnen.',
        '• « Vitès » : Byen, Twò vit oswa Twò dousman. Si tèks la menm pa bon, ekri sa nan « Kòmantè ».',
    ])
    rows = [{'id': c['id'], 'ecran': c['screen'], 'text': c['text'], 'file': f"assets/clips/{c['id']}.mp3"}
            for c in clips]
    sheet(wb, 'Klip', 'Yon liy pou chak klip.', [
        ('Idantifyan', 'id'), ('Ekran', 'ecran'), ('Tèks', 'text'), ('Fichye', 'file'),
    ], rows, ['Byen pwononse ?', 'Mo ki mal li', 'Vitès', 'Kòmantè'], [26, 7, 60, 30])
    ws = wb['Klip']
    end = len(rows) + 2
    dropdown(ws, ['Wi', 'Non'], f'E3:E{end}')
    dropdown(ws, ['Byen', 'Twò vit', 'Twò dousman'], f'G3:G{end}')
    for col, w in (('E', 14), ('F', 30), ('G', 16), ('H', 40)):
        ws.column_dimensions[col].width = w

    path = os.path.join(OUT, f'Sanimo-ekoute-klip-v{VERSION}.xlsx')
    wb.save(path)
    return path


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for p in (vet_workbook(), creole_workbook(), recording_workbook(), listening_workbook()):
        print('OK', os.path.relpath(p, ROOT))
