import json

# Leggi il file JSON
with open('questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

special_char = chr(61603)  #

# Definisci le correzioni per ogni ID
# Per ogni domanda: rimuovi tutto dopo  e ricostruisci le opzioni corrette
corrections = {
    119: {
        'question': 'Wahlen in Deutschland sind frei. Was bedeutet das?',
        'options': [
            'Alle verurteilten Straftäterinnen/Straftäter dürfen nicht wählen.',
            'Wenn ich wählen gehen möchte, muss meine Arbeitgeberin/mein Arbeitgeber mir frei geben.',
            'Jede Person kann ohne Zwang entscheiden, ob sie wählen möchte und wen sie wählen möchte.',
            'Ich kann frei entscheiden, wo ich wählen gehen möchte.'
        ],
        'correct': 2
    },
    134: {
        'question': 'Man will die Buslinie abschaffen, mit der Sie immer zur Arbeit fahren. Was können Sie machen, um die Buslinie zu erhalten?',
        'options': [
            'Ich beteilige mich an einer Bürgerinitiative für die Erhaltung der Buslinie oder gründe selber eine Initiative.',
            'Ich werde Mitglied in einem Sportverein und trainiere Radfahren.',
            'Ich wende mich an das Finanzamt, weil ich als Steuerzahlerin/Steuerzahler ein Recht auf die Buslinie habe.',
            'Ich schreibe einen Brief an das Forstamt der Gemeinde.'
        ],
        'correct': 0
    },
    164: {
        'question': 'Was passierte am 9. November 1938 in Deutschland?',
        'options': [
            'Mit dem Angriff auf Polen beginnt der Zweite Weltkrieg.',
            'Die Nationalsozialisten verlieren eine Wahl und lösen den Reichstag auf.',
            'Jüdische Geschäfte und Synagogen werden durch Nationalsozialisten und ihre Anhänger zerstört.',
            'Hitler wird Reichspräsident und lässt alle Parteien verbieten.'
        ],
        'correct': 2
    },
    166: {
        'question': 'Bei welchen Demonstrationen in Deutschland riefen die Menschen "Wir sind das Volk"?',
        'options': [
            'beim Arbeiteraufstand 1953 in der DDR',
            'bei den Demonstrationen 1968 in der Bundesrepublik Deutschland',
            'bei den Anti-Atomkraft-Demonstrationen 1985 in der Bundesrepublik Deutschland',
            'bei den Montagsdemonstrationen 1989 in der DDR'
        ],
        'correct': 3
    },
    178: {
        'question': 'Vom Juni 1948 bis zum Mai 1949 wurden die Bürgerinnen und Bürger von West-Berlin durch eine Luftbrücke versorgt. Welcher Umstand war dafür verantwortlich?',
        'options': [
            'Für Frankreich war eine Versorgung der West-Berliner Bevölkerung mit dem Flugzeug kostengünstiger.',
            'Die amerikanischen Soldatinnen und Soldaten hatten beim Landtransport Angst vor Überfällen.',
            'Für Großbritannien war die Versorgung über die Luftbrücke schneller.',
            'Die Sowjetunion unterbrach den gesamten Verkehr auf dem Landwege.'
        ],
        'correct': 3
    },
    201: {
        'question': 'Welche der folgenden Auflistungen enthält nur Bundesländer, die zum Gebiet der früheren DDR gehörten?',
        'options': [
            'Niedersachsen, Nordrhein-Westfalen, Hessen, Schleswig-Holstein, Brandenburg',
            'Mecklenburg-Vorpommern, Brandenburg, Sachsen, Sachsen-Anhalt, Thüringen',
            'Bayern, Baden-Württemberg, Rheinland-Pfalz, Thüringen, Sachsen',
            'Sachsen, Thüringen, Hessen, Niedersachen, Brandenburg'
        ],
        'correct': 1
    },
    204: {
        'question': 'Wie wurden die Bundesrepublik Deutschland und die DDR zu einem Staat?',
        'options': [
            'Die Bundesrepublik hat die DDR besetzt.',
            'Die heutigen fünf östlichen Bundesländer sind der Bundesrepublik Deutschland beigetreten.',
            'Die westlichen Bundesländer sind der DDR beigetreten.',
            'Die DDR hat die Bundesrepublik Deutschland besetzt.'
        ],
        'correct': 1
    },
    220: {
        'question': 'Der 27. Januar ist in Deutschland ein offizieller Gedenktag. Woran erinnert dieser Tag?',
        'options': [
            'an das Ende des Zweiten Weltkrieges',
            'an die Verabschiedung des Grundgesetzes',
            'an die Wiedervereinigung Deutschlands',
            'an die Opfer des Nationalsozialismus (Tag der Befreiung des Vernichtungslagers Auschwitz)'
        ],
        'correct': 3
    },
    231: {
        'question': 'Was bedeutet der Begriff "europäische Integration"?',
        'options': [
            'Damit sind amerikanische Einwanderinnen und Einwanderer in Europa gemeint.',
            'Der Begriff meint den Einwanderungsstopp nach Europa.',
            'Damit sind europäische Auswanderinnen und Auswanderer in den USA gemeint.',
            'Der Begriff meint den Zusammenschluss europäischer Staaten zur EU.'
        ],
        'correct': 3
    },
    243: {
        'question': 'Maik und Sybille wollen mit Freunden an ihrem deutschen Wohnort eine Demonstration auf der Straße abhalten. Was müssen sie vorher tun?',
        'options': [
            'Sie müssen die Demonstration anmelden.',
            'Sie müssen nichts tun. Man darf in Deutschland jederzeit überall demonstrieren.',
            'Sie können gar nichts tun, denn Demonstrationen sind in Deutschland grundsätzlich verboten.',
            'Maik und Sybille müssen einen neuen Verein gründen, weil nur Vereine demonstrieren dürfen.'
        ],
        'correct': 0
    },
    254: {
        'question': 'In Deutschland dürfen Ehepaare sich scheiden lassen. Meistens müssen sie dazu das "Trennungsjahr" einhalten. Was bedeutet das?',
        'options': [
            'Der Scheidungsprozess dauert ein Jahr.',
            'Die Ehegatten sind ein Jahr verheiratet, dann ist die Scheidung möglich.',
            'Das Besuchsrecht für die Kinder gilt ein Jahr.',
            'Die Ehegatten führen mindestens ein Jahr getrennt ihr eigenes Leben. Danach ist die Scheidung möglich.'
        ],
        'correct': 3
    },
    258: {
        'question': 'Was darf das Jugendamt in Deutschland?',
        'options': [
            'Es entscheidet, welche Schule das Kind besucht.',
            'Es kann ein Kind, das geschlagen wird oder hungern muss, aus der Familie nehmen.',
            'Es bezahlt das Kindergeld an die Eltern.',
            'Es kontrolliert, ob das Kind einen Kindergarten besucht.'
        ],
        'correct': 1
    },
    262: {
        'question': 'Was bedeutet in Deutschland der Grundsatz der Gleichbehandlung?',
        'options': [
            'Niemand darf z.B. wegen einer Behinderung benachteiligt werden.',
            'Man darf andere Personen benachteiligen, wenn ausreichende persönliche Gründe hierfür vorliegen.',
            'Niemand darf gegen Personen klagen, wenn sie benachteiligt wurden.',
            'Es ist für alle Gesetz, benachteiligten Gruppen jährlich Geld zu spenden.'
        ],
        'correct': 0
    },
    268: {
        'question': 'Eine junge Frau will den Führerschein machen. Sie hat Angst vor der Prüfung, weil ihre Muttersprache nicht Deutsch ist. Was ist richtig?',
        'options': [
            'Sie muss mindestens zehn Jahre in Deutschland leben, bevor sie den Führerschein machen kann.',
            'Wenn sie kein Deutsch kann, darf sie keinen Führerschein haben.',
            'Sie muss den Führerschein in dem Land machen, in dem man ihre Sprache spricht.',
            'Sie kann die Theorie-Prüfung vielleicht in ihrer Muttersprache machen. Es gibt mehr als zehn Sprachen zur Auswahl.'
        ],
        'correct': 3
    },
    284: {
        'question': 'Was man für die Arbeit können muss, ändert sich in Zukunft sehr schnell. Was kann man tun?',
        'options': [
            'Es ist egal, was man lernt.',
            'Erwachsene müssen auch nach der Ausbildung immer weiter lernen.',
            'Kinder lernen in der Schule alles, was im Beruf wichtig ist. Nach der Schule muss man nicht weiter lernen.',
            'Alle müssen früher aufhören zu arbeiten, weil sich alles ändert.'
        ],
        'correct': 1
    },
    310: {
        'question': 'Welche Ministerin/welchen Minister hat Sachsen nicht?',
        'options': [
            'Justizministerin/Justizminister',
            'Außenministerin/Außenminister',
            'Finanzministerin/Finanzminister',
            'Innenministerin/Innenminister'
        ],
        'correct': 1
    }
}

# Applica le correzioni
corrected_count = 0
for q in questions:
    if q['id'] in corrections:
        correction = corrections[q['id']]
        print(f"Correggendo ID {q['id']}:")
        print(f"  Prima: {q['question'][:80]}...")
        print(f"  Dopo: {correction['question'][:80]}...")

        q['question'] = correction['question']
        q['options'] = correction['options']
        q['correct'] = correction['correct']
        corrected_count += 1

print(f"\nTotale correzioni applicate: {corrected_count}")

# Salva il file corretto
with open('questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("File questions.json salvato con successo!")
