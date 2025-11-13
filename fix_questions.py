import json
import re

# Leggi il file JSON
with open('questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Definisci le correzioni per ogni ID
corrections = {
    98: {
        'question': 'Wenn Abgeordnete im Deutschen Bundestag ihre Fraktion wechseln, …',
        'options': [
            'dürfen sie nicht mehr an den Sitzungen des Parlaments teilnehmen.',
            'kann die Regierung ihre Mehrheit verlieren.',
            'muss die Bundespräsidentin/der Bundespräsident zuvor ihr/sein Einverständnis geben.',
            'dürfen die Wählerinnen/Wähler dieser Abgeordneten noch einmal wählen.'
        ],
        'correct': 1
    },
    108: {
        'question': 'Bei einer Bundestagswahl in Deutschland darf jede/jeder wählen, die/der …',
        'options': [
            'in der Bundesrepublik Deutschland wohnt und wählen möchte.',
            'Bürgerin/Bürger der Bundesrepublik Deutschland ist und mindestens 18 Jahre alt ist.',
            'seit mindestens 3 Jahren in der Bundesrepublik Deutschland lebt.',
            'Bürgerin/Bürger der Bundesrepublik Deutschland ist und mindestens 21 Jahre alt ist.'
        ],
        'correct': 1
    },
    113: {
        'question': 'Wahlen in Deutschland gewinnt die Partei, die …',
        'options': [
            'die meisten Stimmen bekommt.',
            'die meisten Männer mehrheitlich gewählt haben.',
            'die meisten Stimmen bei den Arbeiterinnen/Arbeitern bekommen hat.',
            'die meisten Erststimmen für ihre Kanzlerkandidatin/ihren Kanzlerkandidaten erhalten hat.'
        ],
        'correct': 0
    },
    125: {
        'question': 'In einer Demokratie ist eine Funktion von regelmäßigen Wahlen, …',
        'options': [
            'die Bürgerinnen und Bürger zu zwingen, ihre Stimme abzugeben.',
            'nach dem Willen der Wählermehrheit den Wechsel der Regierung zu ermöglichen.',
            'im Land bestehende Gesetze beizubehalten.',
            'den Armen mehr Macht zu geben.'
        ],
        'correct': 1
    },
    127: {
        'question': 'Warum gibt es die 5%-Hürde im Wahlgesetz der Bundesrepublik Deutschland? Es gibt sie, weil …',
        'options': [
            'die Programme von vielen kleinen Parteien viele Gemeinsamkeiten haben.',
            'die Bürgerinnen und Bürger bei vielen kleinen Parteien die Orientierung verlieren können.',
            'viele kleine Parteien die Regierungsbildung erschweren.',
            'die kleinen Parteien nicht so viel Geld haben, um die Politikerinnen und Politiker zu bezahlen.'
        ],
        'correct': 2
    },
    171: {
        'question': 'Soziale Marktwirtschaft bedeutet, die Wirtschaft …',
        'options': [
            'steuert sich allein nach Angebot und Nachfrage.',
            'wird vom Staat geplant und gesteuert, Angebot und Nachfrage werden nicht berücksichtigt.',
            'richtet sich nach der Nachfrage im Ausland.',
            'richtet sich nach Angebot und Nachfrage, aber der Staat sorgt für einen sozialen Ausgleich.'
        ],
        'correct': 3
    },
    252: {
        'question': 'In Deutschland …',
        'options': [
            'darf man zur gleichen Zeit nur mit einer Partnerin/einem Partner verheiratet sein.',
            'kann man mehrere Ehepartnerinnen/Ehepartner gleichzeitig haben.',
            'darf man nicht wieder heiraten, wenn man einmal verheiratet war.',
            'darf eine Frau nicht wieder heiraten, wenn ihr Mann gestorben ist.'
        ],
        'correct': 0
    },
    291: {
        'question': 'Warum muss man in Deutschland bei der Steuererklärung aufschreiben, ob man zu einer Kirche gehört oder nicht? Weil …',
        'options': [
            'es eine Kirchensteuer gibt, die an die Einkommen- und Lohnsteuer geknüpft ist.',
            'das für die Statistik in Deutschland wichtig ist.',
            'man mehr Steuern zahlen muss, wenn man nicht zu einer Kirche gehört.',
            'die Kirche für die Steuererklärung verantwortlich ist.'
        ],
        'correct': 0
    }
}

# Applica le correzioni
corrected_count = 0
for q in questions:
    if q['id'] in corrections:
        correction = corrections[q['id']]
        print(f"Correggendo ID {q['id']}:")
        print(f"  Prima: {q['question'][:80]}...")
        print(f"  Dopo: {correction['question']}")

        q['question'] = correction['question']
        q['options'] = correction['options']
        q['correct'] = correction['correct']
        corrected_count += 1

print(f"\nTotale correzioni applicate: {corrected_count}")

# Salva il file corretto
with open('questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("File questions.json salvato con successo!")
