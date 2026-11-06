# Agent-Anleitung: Bestehendes Skyjo-Spiel zu „Skyjo Action“ erweitern

## 1. Rolle und Auftrag

Du bist ein erfahrener Softwareentwicklungs-Agent mit Schwerpunkt auf JavaScript, HTML, CSS, Spielelogik und testbarer Frontend-Architektur.

Deine Aufgabe ist es, ein **bereits bestehendes, funktionsfähiges Skyjo-Spiel**, das mit **HTML, CSS und JavaScript** umgesetzt wurde, um den Spielmodus **„Skyjo Action“** zu erweitern.

Arbeite im vorhandenen Projekt. Entwickle nicht ungefragt ein neues Spiel und ersetze nicht die bestehende Implementierung. Untersuche zuerst den Code und die vorhandene Architektur. Erhalte bestehende Funktionen, Gestaltung, Bedienbarkeit und Kompatibilität so weit wie möglich.

Das Ergebnis soll ein spielbarer, nachvollziehbarer und stabiler Skyjo-Action-Modus sein, der sich in das vorhandene Spiel integriert.

## 2. Grundsätze für die Umsetzung

1. **Bestand zuerst verstehen:** Untersuche Dateistruktur, Einstiegspunkte, Spielzustand, Zuglogik, Kartenmodell, Rendering, Event-Handler und vorhandene Tests, bevor du Änderungen vornimmst.
2. **Bestehendes erhalten:** Ändere nur, was für Skyjo Action erforderlich ist. Der bisherige Skyjo-Modus muss weiterhin funktionieren, sofern das Projekt ihn bereits anbietet.
3. **Regeln zentral implementieren:** Trenne Spiellogik und Regelentscheidungen von DOM-Manipulation und Darstellung. Vermeide doppelte oder verstreute Regelimplementierungen.
4. **Zustand explizit halten:** Repräsentiere Karten, Spieler, Stapel, Handkarten, Zugphase und Rundenstatus in einem konsistenten Spielzustand.
5. **Keine Regeln erfinden:** Die nachfolgend beschriebenen Regeln sind die fachliche Grundlage. Wo eine konkrete Aktionskarte, ein Kartenwert oder ein Sonderfall nicht spezifiziert ist, untersuche zunächst vorhandene Projektressourcen. Erfinde keine Karteneffekte. Dokumentiere offene Punkte und frage nach, wenn sie für eine korrekte Implementierung entscheidend sind.
6. **Schrittweise arbeiten:** Implementiere in kleinen, überprüfbaren Schritten. Führe nach jeder wesentlichen Änderung die vorhandenen Tests bzw. geeignete manuelle Prüfungen aus.
7. **Keine Regressionen:** Prüfe insbesondere, dass der ursprüngliche Skyjo-Modus durch die Erweiterung nicht beschädigt wird.

## 3. Verbindlicher Ablauf

### Phase A – Projektanalyse

- Lies die vorhandene Dokumentation und untersuche die Projektstruktur.
- Ermittle, wie ein neues Spiel gestartet und ein Spielzug ausgeführt wird.
- Finde heraus, wie Karten und Spieler modelliert werden.
- Ermittle, wie verdeckte und offene Karten dargestellt werden.
- Prüfe, wie Nachzieh- und Ablagestapel funktionieren.
- Prüfe, ob es bereits einen Modus-Schalter, eine Menüführung, Animationen, Soundeffekte oder Persistenz gibt.
- Ermittle, welche Tests und Entwicklungswerkzeuge verfügbar sind.

Erstelle vor größeren Änderungen eine kurze Bestandsaufnahme mit:
- relevanten Dateien und Modulen,
- bestehender Spielzustandsstruktur,
- Stellen, an denen die Skyjo-Action-Logik ergänzt werden sollte,
- möglichen Risiken für den bestehenden Modus.

### Phase B – Regelmodell und offene Fragen

Lege die Regeln als nachvollziehbares Modell fest. Trenne dabei:
- eindeutig vorgegebene Regeln,
- technische Umsetzungsentscheidungen,
- noch ungeklärte Regeldetails.

**Wichtig:** Die Beschreibung enthält keine vollständige Liste und keine exakten Effekte aller Aktionskarten. Suche deshalb im bestehenden Projekt nach Kartendaten, Bildern, Beschreibungen oder bereits vorhandenen Definitionen. Falls diese Informationen fehlen, implementiere zunächst die allgemeine Infrastruktur für Aktionskarten und markiere die fehlenden Effekte als offene Punkte. Weise keiner Karte einen selbst erfundenen Effekt zu.

Vor der Implementierung müssen insbesondere folgende Punkte geprüft bzw. geklärt werden, sofern sie nicht aus dem Projekt oder vorhandenen Spieldaten hervorgehen:

- Welche Zahlenwerte und Kartenhäufigkeiten gehören zum Zahlenkartenstapel?
- Welche Aktionskarten gibt es genau und was bewirkt jede einzelne?
- Wie viele Aktionskarten darf ein Spieler maximal auf der Hand halten?
- Gibt es Einschränkungen, wann bestimmte Aktionskarten gespielt werden dürfen?
- Was passiert, wenn der Aktionskartenstapel leer ist?
- Was passiert, wenn der Zahlenkarten-Nachziehstapel leer ist?
- Wie werden mehrere gleichzeitig mögliche Reihen- oder Spaltenauflösungen abgewickelt?
- Wie genau wird der Stern-Joker gewertet, wenn er nicht Teil einer aufgelösten Reihe oder Spalte ist?
- Wie wird die Sternkarte bei der Prüfung identischer Karten mit Zahlenkarten kombiniert?
- Bei einer vollständigen Sternreihe/-spalte: Wie werden die Sonderpunkte verbucht und wie wird verhindert, dass dieselben Sterne zusätzlich als normale Kartenpunkte gezählt werden?
- Wie wird bei Gleichstand der Startspieler bestimmt?
- Bedeutet „gleich viele oder weniger Punkte“ beim Rundenbeender tatsächlich, dass auch ein Gleichstand zur Verdopplung führt? Die vorgegebene Regel sagt ausdrücklich ja; implementiere dies entsprechend.

Halte offene Fragen in einer Datei oder einem Abschnitt `TODO / Regelklärungen` fest. Blockiere nicht die gesamte Entwicklung, wenn sich unabhängige Teile bereits korrekt umsetzen lassen.

### Phase C – Spielmodus integrieren

- Ergänze „Skyjo Action“ als auswählbaren Spielmodus, sofern das bestehende Spiel eine Modusauswahl besitzt.
- Nutze vorhandene Komponenten und Designkonventionen.
- Vermeide es, den ursprünglichen Skyjo-Modus durch Sonderfallprüfungen an beliebigen Stellen unnötig komplex zu machen.
- Bevorzuge eine klare Trennung gemeinsamer Regeln und modusspezifischer Regeln.
- Stelle sicher, dass ein neues Spiel mit einem vollständig zurückgesetzten Zustand beginnt.

### Phase D – Implementierung

Implementiere die Regeln aus Abschnitt 4 in der bestehenden Architektur. Achte auf korrekte Zugreihenfolge, Kartenbewegungen, Sichtbarkeit und Punkteberechnung.

### Phase E – Test und Qualitätssicherung

- Ergänze automatisierte Tests für die Spiellogik, soweit das Projekt dies unterstützt.
- Teste die unten aufgeführten Akzeptanzkriterien.
- Prüfe den normalen Skyjo-Modus auf Regressionen.
- Teste mindestens einen vollständigen Rundenablauf mit mehreren Spielern.
- Prüfe Sonderfälle wie leere Stapel, ungültige Aktionen, Gleichstände und mehrere mögliche Reihen-/Spaltenauflösungen.
- Teste die Bedienung mit Maus und – falls das Projekt dafür ausgelegt ist – Touch-Eingaben.
- Prüfe die Browser-Konsole auf Fehler und Warnungen.

Erstelle keine Erfolgsmeldung, solange nicht tatsächlich getestet wurde. Berichte transparent, welche Tests ausgeführt wurden und welche noch fehlen.

## 4. Fachliche Regeln für Skyjo Action

### 4.1 Spielvorbereitung

1. Jeder Spieler erhält **12 verdeckte Zahlenkarten**.
2. Die Karten werden vor dem Spieler in einem Raster mit **4 Spalten und 3 Reihen** ausgelegt.
3. Alle Spieler decken gleichzeitig **zwei beliebige Karten** ihrer eigenen Auslage auf.
4. Die übrigen Zahlenkarten bilden den verdeckten Zahlenkarten-Nachziehstapel.
5. Die oberste Karte des Zahlenkartenstapels wird offen daneben als Ablagestapel abgelegt.
6. Der Aktionskartenstapel wird separat gemischt.
7. Die obersten **vier Aktionskarten** werden offen in die Tischmitte gelegt.
8. Der Spieler mit der höchsten Summe seiner beiden zu Beginn aufgedeckten Zahlenkarten beginnt.

Achte darauf, dass die Startaufdeckung für jeden Spieler genau zwei Karten umfasst und dass die Startspielerermittlung erst nach dieser Aufdeckung erfolgt.

### 4.2 Zugablauf: genau eine von drei Optionen

Ein Spieler muss in seinem Zug genau eine der folgenden drei Optionen wählen:

#### Option 1 – Zahlenkarte ziehen

Der Spieler zieht entweder:
- die oberste offene Karte vom Zahlenkarten-Ablagestapel oder
- eine verdeckte Karte vom Zahlenkarten-Nachziehstapel.

Anschließend gelten folgende Möglichkeiten:

**Karte tauschen**
- Der Spieler tauscht die gezogene Karte gegen eine beliebige Karte seiner eigenen Auslage.
- Das gilt sowohl für offene als auch für verdeckte Karten in der Auslage.
- Die ersetzte Karte wird offen auf den Zahlenkarten-Ablagestapel gelegt.
- Die gezogene Karte kommt an die Position der ersetzten Karte und ist danach offen.

**Verdeckte Karte nicht behalten**
- Diese Möglichkeit gilt, wenn die Karte verdeckt vom Nachziehstapel gezogen wurde.
- Der Spieler darf die gezogene Karte offen auf den Ablagestapel legen.
- Dafür muss er eine bisher verdeckte Karte aus seiner eigenen Auslage aufdecken.
- Die aufgedeckte Karte bleibt an ihrer Position.

Die Ablehnungsoption darf nicht angeboten werden, wenn die gezogene Karte vom offenen Ablagestapel stammt.

#### Option 2 – Offene Aktionskarte nehmen

- Der Spieler nimmt eine der vier offen ausliegenden Aktionskarten auf seine Hand.
- Die entnommene Karte wird sofort vom Aktionskarten-Nachziehstapel ersetzt, sofern dieser noch Karten enthält.
- Die neue Karte wird offen auf den freien Platz in der Auslage gelegt.
- Das Nehmen einer Aktionskarte ist die gewählte Aktion des Zuges. Es darf nicht zusätzlich eine Zahlenkarte gezogen oder eine andere Aktionskarte gespielt werden.

#### Option 3 – Aktionskarte ausspielen

- Der Spieler spielt eine Aktionskarte aus seiner Hand.
- Der Effekt dieser Karte wird ausgeführt.
- Die ausgespielte Karte wird gemäß dem vorhandenen Kartendesign bzw. der festgelegten Regel abgelegt.
- Das Ausspielen ist die gewählte Aktion des Zuges.

Die konkreten Effekte müssen aus den tatsächlichen Aktionskartendaten oder einer bestätigten Regelliste stammen. Implementiere die Effekte möglichst als getrennte, einzeln testbare Funktionen.

### 4.3 Aktionskarten

Aktionskarten ermöglichen Sonderaktionen, beispielsweise:
- Doppelzüge,
- das Anschauen verdeckter Karten,
- das Stehlen von Karten,
- das Tauschen von Karten mit Mitspielern.

Diese Beispiele sind **keine vollständige Effektdefinition**. Implementiere nur Effekte, die durch konkrete Kartendaten oder bestätigte Regeln belegt sind.

**Wertung ungenutzter Aktionskarten:**
- Jede Aktionskarte, die ein Spieler am Ende der Runde noch auf der Hand hält, zählt **10 zusätzliche Punkte**.
- Die Anzahl der Handkarten muss daher in die Endwertung einfließen.
- Die Handkarten dürfen nicht versehentlich als Zahlenkarten behandelt werden.

### 4.4 Sternkarte / Joker

Die Sternkarte ist ein flexibler Joker:

- Sie kann den Wert einer beliebigen Zahl in derselben Reihe oder Spalte annehmen, um eine Reihe bzw. Spalte aufzulösen.
- Wird ein Stern aufgedeckt, darf der Spieler sofort eine Aktionskarte ziehen.

Implementiere den zusätzlichen Aktionskartenzug als unmittelbaren, eindeutig erkennbaren Spieleffekt. Prüfe dabei, ob die Karte aus dem offenen Angebot oder vom Aktionskartenstapel gezogen werden soll. Diese konkrete Quelle ist in der Regelbeschreibung nicht eindeutig festgelegt und muss anhand vorhandener Projektregeln bzw. einer bestätigten Entscheidung bestimmt werden.

Die genaue Wertung eines nicht aufgelösten Sterns ist nicht angegeben. Lege hierfür keinen willkürlichen Zahlenwert fest.

### 4.5 Reihen und Spalten auflösen

Eine Reihe oder Spalte wird aufgelöst, sobald sie vollständig ist und die erforderliche Kombination enthält:

- **Horizontale Reihe:** drei identische Zahlen in einer Reihe.
- **Vertikale Spalte:** drei identische Zahlen in einer Spalte.
- **Joker-Kombination:** Sterne dürfen den passenden Zahlenwert übernehmen, sodass die Kombination als identisch gilt.

Wird eine gültige Kombination erkannt:
- werden alle Karten der betroffenen Reihe bzw. Spalte aus der Auslage entfernt,
- werden diese Karten auf einen dafür vorgesehenen Ablagebereich gelegt,
- zählen diese Karten am Rundenende nicht mehr als normale Punkte.

Die Prüfung muss nach jedem Spielereignis stattfinden, das eine passende Kombination erzeugen kann – insbesondere nach dem Aufdecken, Tauschen oder Einsetzen einer Karte sowie nach einem Aktionskarteneffekt, der die Auslage verändert.

**Wichtig zur Rasterlogik:** Das Spielfeld beginnt mit 4 Spalten und 3 Reihen. Eine vollständige horizontale Reihe umfasst daher zunächst vier Karten, eine vollständige vertikale Spalte zunächst drei Karten. Die Regelbeschreibung nennt bei der Auflösung jedoch „drei identische Zahlen“ und bei Stern-Sonderpunkten ausdrücklich „drei Sterne“ bzw. „vier Sterne“. Setze deshalb nicht ungeprüft voraus, dass jede horizontale Reihe nur drei Karten enthält. Kläre die genaue Auflösungsbedingung für horizontale Reihen anhand der verbindlichen Spielregel. Die Implementierung muss die tatsächliche Feldgeometrie und die bestätigte Regel konsistent abbilden.

### 4.6 Sonderpunkte für vollständige Sternreihen bzw. Sternspalten

- Eine vollständig aus Sternen bestehende Kombination aus drei Sternen bringt **−10 Punkte**.
- Eine vollständig aus Sternen bestehende Kombination aus vier Sternen bringt **−15 Punkte**.

Die Sonderpunkte müssen als eigener Wertungsbestandteil erfasst werden, damit sie nicht durch das Entfernen der Karten verloren gehen oder doppelt gezählt werden.

Da die Auslage 4 Spalten und 3 Reihen hat, muss die Zuordnung von drei bzw. vier Sternen zu einer konkreten horizontalen oder vertikalen Kombination anhand der bestätigten Regeln erfolgen. Dokumentiere die getroffene Auslegung.

### 4.7 Rundenende

1. Sobald ein Spieler alle **12 Karten seiner Auslage offen** liegen hat, wird das Rundenende eingeläutet.
2. Alle anderen Spieler erhalten danach noch **genau einen letzten Zug**.
3. Nach Abschluss dieser letzten Züge endet die Runde.
4. Alle noch verdeckten Karten werden aufgedeckt.
5. Anschließend wird die Wertung berechnet.

Beachte:
- Der auslösende Spieler darf nicht versehentlich einen zusätzlichen Zug erhalten.
- Jeder andere Spieler erhält genau einen letzten Zug.
- Die Reihenfolge der letzten Züge muss eindeutig sein.
- Eine bereits entfernte Reihe oder Spalte darf nicht als verdeckte Karte oder als fehlende Karte behandelt werden.
- Ein durch einen Effekt ausgelöster zusätzlicher Zug ist von der normalen Zugreihenfolge zu unterscheiden und muss mit der bestätigten Aktionskartenregel vereinbar sein.

### 4.8 Rundenwertung und Verdopplungsregel

Berechne für jeden Spieler die Rundensumme aus:
- den Werten aller noch in der Auslage vorhandenen Zahlenkarten,
- den Sonderpunkten für aufgelöste Sternkombinationen,
- **10 Punkten pro ungenutzter Aktionskarte auf der Hand**.

Bereits aufgelöste Reihen und Spalten zählen nicht mehr als normale Kartenpunkte. Nicht aufgelöste Sterne dürfen nur entsprechend einer bestätigten Stern-Wertungsregel bewertet werden.

**Verdopplungsregel für den Rundenbeender:**
- Der Spieler, der das Rundenende ausgelöst hat, muss tatsächlich die niedrigste Punktzahl der Runde haben.
- Hat mindestens ein anderer Spieler eine **kleinere oder gleich hohe** Punktzahl, werden die positiven Punkte des Rundenbeenders verdoppelt.
- Negative Punkte des Rundenbeenders bleiben unverändert.
- Bei einer Rundensumme von null gibt es keine positiven Punkte zu verdoppeln.

Setze die Regel ausdrücklich mit `kleiner oder gleich` um, nicht nur mit `kleiner`. Trenne die Ermittlung der Rundensummen von der Anwendung der Verdopplungsregel, damit beides unabhängig getestet werden kann.

## 5. Anforderungen an Datenmodell und Spiellogik

Passe die Struktur an das vorhandene Projekt an. Die folgenden Angaben sind konzeptionelle Anforderungen und keine Aufforderung, eine bestimmte Architektur gegen den bestehenden Code durchzusetzen.

Der Spielzustand muss mindestens folgende Informationen zuverlässig abbilden können:

- aktiver Spielmodus (`classic` / `action` oder eine zum Projekt passende Entsprechung),
- Spieler und Zugreihenfolge,
- 12 Kartenpositionen pro Spieler,
- Kartenwert und Kartentyp,
- Sichtbarkeit einer Karte,
- entfernte Karten bzw. aufgelöste Reihen und Spalten,
- Zahlenkarten-Nachziehstapel,
- Zahlenkarten-Ablagestapel,
- Aktionskarten-Nachziehstapel,
- vier offene Aktionskarten,
- Aktionskartenhand jedes Spielers,
- Rundensumme und Sonderpunkte,
- Spieler, der das Rundenende ausgelöst hat,
- Status der letzten Züge,
- aktueller Spielstatus (Setup, laufender Zug, letzte Züge, Wertung, Runde beendet).

Nutze eindeutige Kartentypen, damit Zahlenkarten und Aktionskarten nicht verwechselt werden. Vermeide es, Spielregeln ausschließlich aus sichtbarem Text oder CSS-Klassen abzuleiten.

## 6. Anforderungen an Benutzeroberfläche und Bedienung

Integriere die neuen Elemente in das bestehende Design:

- Kennzeichne den Modus **Skyjo Action** sichtbar.
- Zeige den Zahlenkarten-Nachziehstapel und Ablagestapel.
- Zeige die vier offenen Aktionskarten in der Tischmitte.
- Zeige die Aktionskartenhand des aktiven Spielers.
- Mache klar erkennbar, welche Karten offen und welche verdeckt sind.
- Zeige eindeutig an, welche der drei Zugoptionen gerade möglich ist.
- Verhindere ungültige Aktionen bereits in der Oberfläche und prüfe sie zusätzlich in der Spiellogik.
- Zeige aufgelöste Reihen und Spalten nachvollziehbar an, ohne sie weiter in die normale Wertung einzubeziehen.
- Stelle Sternkarten optisch klar als Joker dar.
- Zeige beim Aufdecken eines Sterns den zusätzlichen Aktionskartenzug an.
- Zeige den Status „letzte Züge“ und den Rundenbeender klar an.
- Zeige nach der Runde eine transparente Aufschlüsselung der Wertung einschließlich Aktionskarten-Strafpunkten, Stern-Sonderpunkten und gegebenenfalls Verdopplung.

Die Oberfläche darf keine Informationen preisgeben, die für einen Spieler verdeckt bleiben müssen. Bei einem lokalen Mehrspieler-Spiel ist besonders darauf zu achten, dass verdeckte Karten anderer Spieler nicht durch DOM-Inhalte, Tooltips oder zugängliche Beschriftungen vorzeitig sichtbar werden.

## 7. Validierung und Fehlerbehandlung

Jede Aktion muss vor ihrer Ausführung serverunabhängig in der zentralen Spiellogik validiert werden. Mindestens folgende Fälle sind zu berücksichtigen:

- Es ist nicht der Zug des Spielers.
- Ein Spieler versucht, mehr als eine normale Zugoption auszuführen.
- Ein Spieler versucht, eine Aktionskarte zu spielen, die er nicht besitzt.
- Ein Spieler versucht, eine offene Aktionskarte zu nehmen, die nicht mehr verfügbar ist.
- Ein Spieler versucht, eine gezogene Ablagestapelkarte abzulehnen.
- Ein Spieler versucht, eine verdeckte Karte abzulehnen, ohne dafür eine eigene verdeckte Karte aufzudecken.
- Ein Spieler versucht, eine Karte außerhalb seiner Auslage zu tauschen.
- Ein Stapel ist leer.
- Eine Reihe oder Spalte wurde bereits aufgelöst.
- Die Runde ist bereits beendet.
- Ein Spieler versucht, nach dem Ende seines erlaubten letzten Zuges weiterzuspielen.

Ungültige Aktionen dürfen den Spielzustand nicht teilweise verändern. Verwende nach Möglichkeit atomare Zustandsübergänge: entweder wird die Aktion vollständig ausgeführt oder gar nicht.

## 8. Akzeptanzkriterien

Die Erweiterung gilt erst dann als umgesetzt, wenn mindestens die folgenden Punkte erfüllt und getestet sind:

### Setup
- [ ] Jeder Spieler erhält genau 12 verdeckte Zahlenkarten.
- [ ] Die Auslage wird als 4×3-Raster dargestellt.
- [ ] Jeder Spieler kann genau zwei Startkarten aufdecken.
- [ ] Der Startspieler wird anhand der Summe dieser beiden Karten bestimmt.
- [ ] Der Zahlenkarten- und Aktionskartenstapel sind getrennt.
- [ ] Vier Aktionskarten liegen zu Beginn offen aus.

### Zugoptionen
- [ ] Eine offene Zahlenkarte kann gezogen und gegen eine eigene Karte getauscht werden.
- [ ] Eine verdeckte Zahlenkarte kann gezogen und gegen eine eigene Karte getauscht werden.
- [ ] Eine abgelehnte verdeckte Zahlenkarte wird abgelegt und eine eigene verdeckte Karte wird aufgedeckt.
- [ ] Eine offene Aktionskarte kann genommen und aus dem Stapel nachbesetzt werden.
- [ ] Eine Aktionskarte aus der eigenen Hand kann ausgespielt werden.
- [ ] Pro normalem Zug wird genau eine der drei Zugoptionen gewählt.

### Sterne und Auflösungen
- [ ] Das Aufdecken eines Sterns löst den vorgesehenen zusätzlichen Aktionskartenzug aus.
- [ ] Gültige identische Zahlenkombinationen werden erkannt.
- [ ] Gültige Joker-Kombinationen werden erkannt.
- [ ] Aufgelöste Reihen und Spalten werden aus der normalen Wertung entfernt.
- [ ] Vollständige Sternkombinationen erhalten die vorgesehenen Sonderpunkte.
- [ ] Kombinationen werden nach allen relevanten Änderungen der Auslage erneut geprüft.

### Rundenende und Wertung
- [ ] Das Aufdecken aller 12 Karten eines Spielers löst das Rundenende aus.
- [ ] Alle anderen Spieler erhalten genau einen letzten Zug.
- [ ] Verdeckte Karten werden vor der Wertung aufgedeckt.
- [ ] Ungenutzte Aktionskarten zählen jeweils 10 Punkte.
- [ ] Stern-Sonderpunkte werden korrekt berücksichtigt.
- [ ] Der Rundenbeender wird bei Gleichstand oder höherer Punktzahl eines Mitspielers gemäß Regel verdoppelt.
- [ ] Negative Punkte des Rundenbeenders werden nicht verdoppelt.
- [ ] Die Ergebnisanzeige erklärt die Punkteberechnung nachvollziehbar.

### Qualität
- [ ] Der bestehende Skyjo-Modus funktioniert weiterhin.
- [ ] Es gibt keine unbehandelten JavaScript-Fehler im normalen Spielablauf.
- [ ] Ungültige Aktionen verändern den Spielzustand nicht.
- [ ] Die Kernregeln sind durch automatisierte Tests oder nachvollziehbare manuelle Testfälle abgesichert.

## 9. Empfohlene Testfälle

Ergänze Tests für mindestens diese Szenarien:

1. Setup mit zwei und mit mehreren Spielern.
2. Startspielerermittlung bei unterschiedlichen Startkartensummen.
3. Ziehen vom offenen Ablagestapel und Tauschen.
4. Ziehen vom verdeckten Stapel und Tauschen.
5. Ablehnen einer verdeckten Karte mit anschließendem Aufdecken einer eigenen verdeckten Karte.
6. Ungültiger Ablehnungsversuch nach Ziehen vom Ablagestapel.
7. Aktionskarte nehmen und offene Auslage korrekt nachbesetzen.
8. Aktionskarte ausspielen, einschließlich ungültiger Kartennutzung.
9. Stern aufdecken und zusätzlichen Aktionskartenzug auslösen.
10. Drei passende Zahlen in einer vertikalen Spalte.
11. Gültige horizontale Kombination gemäß abschließend geklärter Regel.
12. Kombination aus Zahlenkarten und Stern-Joker.
13. Drei bzw. vier Sterne in einer auflösbaren Kombination und korrekte Sonderpunkte.
14. Mehrere mögliche Auflösungen nach einer einzigen Aktion.
15. Rundenende mit exakt einem letzten Zug für jeden anderen Spieler.
16. Rundenwertung ohne Verdopplung.
17. Rundenwertung mit Verdopplung wegen niedrigerer Punktzahl eines Mitspielers.
18. Rundenwertung mit Verdopplung bei Gleichstand.
19. Negative Rundensumme des Rundenbeenders ohne Verdopplung.
20. Strafpunkte für mehrere ungenutzte Aktionskarten.
21. Leerer Zahlenkarten- oder Aktionskartenstapel.
22. Neustart einer Runde ohne Übernahme alter Karten oder Punkte.

## 10. Abschluss und Übergabe

Wenn die Implementierung abgeschlossen ist:

1. Fasse die geänderten Dateien und ihre Aufgaben zusammen.
2. Beschreibe, wie Skyjo Action gestartet wird.
3. Liste alle implementierten Aktionskarten mit ihren tatsächlichen Effekten auf.
4. Nenne alle noch offenen oder bewusst nicht implementierten Regeldetails.
5. Berichte die ausgeführten Tests mit Ergebnis.
6. Weise ausdrücklich auf Einschränkungen hin.
7. Bestätige nur Funktionen als fertig, die du tatsächlich im Projekt geprüft hast.

**Arbeitspriorität:** Korrekte und nachvollziehbare Spiellogik hat Vorrang vor Animationen und optischen Effekten. Eine einfache, stabile und regelkonforme Umsetzung ist besser als eine aufwendige Oberfläche mit fehlerhaften Spielregeln.
