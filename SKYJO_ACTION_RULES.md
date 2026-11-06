# Skyjo Action gegen den Computer

Im Hauptmenü startet **Skyjo Action gegen den Computer** eine neue Partie.
**Skyjo Action weiterspielen** beginnt die nächste Runde einer gespeicherten
Action-Partie. Gespeichert werden die Gesamtpunkte und der Rundenbeender, nicht
der laufende Zug. Klassische Spielstände bleiben davon getrennt.

Zu Beginn zwei eigene verdeckte Karten auswählen. Danach eine Spielkarte direkt
vom Nachzieh- oder Ablagestapel antippen, eine offene oder verdeckte
Aktionskarte nehmen oder eine eigene Aktionskarte antippen. Beim Tauschen und
Aufdecken werden die möglichen Karten im Spielfeld markiert. Weitere
Entscheidungen, etwa zum Sternbonus oder zum Auflösen von Reihen, erscheinen
im Dialog.
Sternkarten sind mit ★ markiert. Nicht ausgespielte Aktionskarten zählen bei der
Wertung je 10 Punkte. Die Partie endet, sobald jemand mindestens 100
Gesamtpunkte erreicht; die niedrigere Gesamtpunktzahl gewinnt.

## Aktionskarten

- **Eigene Karten tauschen:** Zwei eigene Karten tauschen und ihre neue
  Sichtbarkeit wählen.
- **Doppelter Spielzug:** Zwei zusätzliche Spielzüge ausführen.
- **Drei Karten ziehen:** Bis zu eine der drei gezogenen Spielkarten behalten;
  die übrigen ablegen. Wird keine behalten, eine eigene verdeckte Karte öffnen.
- **Erleuchtung:** Verdeckte Karten einer eigenen oder fremden Reihe oder
  Spalte ansehen.
- **Reaktivierung:** Eine spielbare Aktionskarte aus der Aktionskartenablage
  wählen und unmittelbar ausspielen.
- **Verteidigung + zusätzlicher Zug:** Schützt einmal automatisch vor einem
  Angriff; ausgespielt gewährt sie stattdessen einen zusätzlichen Zug.
- **Kartentausch mit Mitspieler:** Eine eigene und eine fremde Karte tauschen
  und deren neue Sichtbarkeit wählen.
- **Aktionskarten-Dieb + zusätzlicher Zug:** Eine fremde Aktionskarte stehlen
  und einen zusätzlichen Zug erhalten. Die gestohlene Karte ist erst nach dem
  nächsten Zug des Mitspielers spielbar.
- **Meteoritenschauer:** Eine fremde Spiel- oder Aktionskarte unter die
  zugehörige Ablage legen und offen ersetzen lassen.

Ist ein Effekt mangels gültigen Ziels oder benötigter Karten nicht ausführbar,
kann die Aktionskarte stattdessen ungespielt abgeworfen werden. Aktionskarten
dürfen im letzten Zug nicht ausgespielt oder abgeworfen werden.

## Regeln und Auslegungen

Maßgeblich ist die [offizielle Anleitung von Magilano](https://magilano.com/pages/download).
Wo `skyjo_action_agent_anleitung.md` davon abweicht, gelten nach
Nutzerentscheidung die Herstellerregeln. Insbesondere zählen einzelne Sterne
null Punkte; Sternboni werden für bei der Wertung verbliebene vollständige
Sternreihen vergeben. Sterne dürfen nur einmal für einen Bonus verwendet werden.
Gleiche Zahlenreihen werden zum Zugende entfernt; Sterne können dabei freiwillig
als Joker eingesetzt werden. Überschneidende Möglichkeiten werden ausgewählt.
Bei der Schlussaufdeckung werden Sterne und Reihen ebenfalls berücksichtigt.

Die drei leeren Ideenkarten bleiben unbenutzt. Bei Gleichstand der ersten
Startkartensummen ziehen beide Spieler für den Vergleich je zwei zusätzliche
Karten; diese werden zurückgemischt und bei erneutem Gleichstand wird der
Vergleich wiederholt. Ein Stern zählt dabei null. Leere Nachziehstapel werden,
soweit möglich, aus der zugehörigen Ablage ohne deren oberste Karte neu gemischt.
Ist eine Aktion danach nicht möglich, wird sie nicht angeboten. Falls überhaupt
kein Zug möglich ist, weist das Spiel darauf hin, statt eine Wertung zu erfinden.
Ein Sternbonus ist freiwillig; eine nicht gewählte Bonuskarte verfällt.

## Entwicklung und Tests

`npm start` startet den bestehenden Server. `npm test` führt die isolierten
Action-Regel- und Zugtests sowie simulierte vollständige Runden aus. Die
Regelmodule sind unabhängig von der Oberfläche; der bisherige klassische und
der Online-Modus verwenden weiterhin ihre eigene Spiellogik.
