# Betreibssystem Benutzerhandbuch

# Inhaltsverzeichnis

- [1 Systemaufrufe](#1-systemaufrufe)
  - [1.1 Prozess Systemaufrufe](#11-prozess-systemaufrufe)
    - [1.1.1 PROCESS_CREATE](#111-process-create)
    - [1.1.2 PROCESS_EXIT](#112-process-exit)
    - [1.1.3 PROCESS_YIELD](#113-process-yield)
  - [1.2 Timer Systemaufrufe](#12-timer-systemaufrufe)
    - [1.1.3 TIMER_START](#121-timer-start)

# 1 Systemaufrufe

## 1.1 Prozess Systemaufrufe

> ### 1.1.1 PROCESS_CREATE
>
> Der Systemaufruf `PROCESS_CREATE` erzeugt einen neuen Prozess.
>
> **Systemaufrufnummer:** `16`
> 
> **Parameter**
>
> - Zeiger auf einen ASCII Dateipfad, der Pfad muss auf eine Datei im Binärformat verweisen, aus der der Prozess erzeugt werden soll.
>
> **Rückgabewert**
>
> - `0` → Prozess erfolgreich erzeugt  
> - `-1` → Fehler bei der Prozesserzeugung
>
> **Blockierend**
>
> - Nein.



> ### 1.1.2 PROCESS_EXIT
>
> Der Systemaufruf `PROCESS_EXIT` beendet den aktuellen Prozess.
>
> **Systemaufrufnummer:** `17`
> 
> **Parameter**
>
> - Keine.
>
> **Rückgabewert**
>
> - Kein Rückgabewert.
>
> **Blockierend**
>
> - Nein, führt jedoch zu einem Prozesswechsel.




> ### 1.1.3 PROCESS YIELD
>
> Der Systemaufruf `PROCESS_YIELD` führt eine sofortigen Prozesswechsel durch.
>
> **Systemaufrufnummer:** `18`
> 
> **Parameter**
>
> - Keine.
>
> **Rückgabewert**
>
> - Kein Rückgabewert.
>
> **Blockierend**
>
> - Nein, führt jedoch zu einem Prozesswechsel.




## 1.2 Timer Systemaufrufe

> ### 1.2.1 TIMER START
>
> Der Systemaufruf `TIMER_START` startet einen neun Timer.
>
> **Systemaufrufnummer:** `24`
> 
> **Parameter**
>
> - Dauer des Timers, muss `> 0` sein.
>
> **Rückgabewert**
>
> - `0` → Timer erfolgreich angelegt.
> - `-1` → Fehler beim anlegen des Timers.
>
> **Blockierend**
>
> - Ja.


