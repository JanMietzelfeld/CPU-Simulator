# CPU-Simulator Benutzerhandbuch

# Inhaltsverzeichnis

- [1 Befehlssatz](#1-befehlssatz)
  - [1.1 Bit-Shift Befehle](#11-bit-shift-befehle)
    - [1.1.1 SHR](#111-shr)
    - [1.1.2 SHL](#112-shl)
    - [1.1.3 SAR](#113-sar)
    - [1.1.4 SAL](#114-sal)
  - [1.2 Befehle für den TLB](#12-befehle-für-den-tlb)
    - [1.2.1 INVTLB](#121-invtlb)
  - [1.3 Sprungbefehle](#13-sprungbefehle)
    - [1.3.1 JA](#131-ja)
    - [1.3.2 JAE](#132-jae)
    - [1.3.3 JB](#133-jb)
    - [1.3.4 JBE](#134-jbe)
  - [1.4 Präprozessor Befehle](#14-präprozessor-befehle)
    - [1.4.1 .INCLUDE](#141-include)
- [2 DEV Operationen](#2-befehle)
  - [2.1 Operationen für die virtuelle Speicherverwaltung](#21-operationen-für-die-virtuelle-speicherverwaltung)
    - [2.1.1 CPU_IS_MEMORY_VIRTUALIZATION_ENABLED](#211-cpu-is-memory-virtualization-enabled)
    - [2.1.2 CPU_ENABLE_MEMORY_VIRTUALIZATION](#212-cpu-enable-memory-virtualization)
    - [2.1.3 CPU_DISABLE_MEMORY_VIRTUALIZATION](#213-cpu-disable-memory-virtualization)
  - [2.2 Operationen für den Timer](#22-operationen-für-den-timer)
    - [2.2.1 TIMER_GET_FINISHED](#221-timer-get-finished)
    - [2.2.2 TIMER_SET](#222-timer-set)
 
# 1 Befehlssatz

## 1.1 Bit-Shift Befehle

> ### 1.1.1 SHR
>
> `SHR` (Shift Logical Right) führt eine logische bitweise Rechtsverschiebung durch.
>
> **Syntax**
> ```
> SHR <Anzahl>, <Ziel>
> ```
> **Beschreibung**
>
> Verschiebt die Bits im `<Ziel>` um `<Anzahl>` Positionen nach rechts. Bei jeder einzelnen Verschiebung wird das LSB in das Carry-Flag übertragen, während das MSB mit 0 aufgefüllt wird.
>
> Der `<Anzahl>` Operand kann eine Speicheradresse, ein Register oder ein Direktwert sein.    
> Der `<Ziel>` Operand kann eine Speicheradresse oder ein Register sein.
>
> **Beeinflusste Flags**
>
> - **CF (Carry-Flag)** Enthält das zuletzt herausgeschobene Bit.
> - **ZF (Zero-Flag)** Wird auf `1` gesetzt, wenn das Ergebnis `0` ist, andernfalls auf `0`.
> - **SF (Sign-Flag)** Entspricht dem MSB des Ergebnisses.
> - **PF (Parity-Flag)** Entspricht der Parität des niederwertigen Bytes des Ergebnisses.
> - **OF (Overflow-Flag)** Ist nur für `<Anzahl>` = 1 definiert. In diesem Fall wird OF auf den ursprünglichen Wert des MSB vor der Verschiebung gesetzt.
>
> **Mögliche Exceptions**
>
> - **Page Fault** Wenn `<Anzahl>` oder `<Ziel>` eine Speicheradresse ist und der Zugriff einen Page Fault auslöst.
> - **General Protection Fault** Wenn `<Anzahl>` oder `<Ziel>` eine Speicheradresse ist und der Zugriff nicht erlaubt ist.




> ### 1.1.2 SHL
>
> `SHL` (Shift Logical Left) führt eine logische bitweise Linksverschiebung durch.
>
> **Syntax**
> ```
> SHL <Anzahl>, <Ziel>
> ```
> **Beschreibung**
>
> Verschiebt die Bits im `<Ziel>` um `<Anzahl>` Positionen nach links. Bei jeder einzelnen Verschiebung wird das MSB in das Carry-Flag übertragen, während das LSB mit 0 aufgefüllt wird.
>
> Der `<Anzahl>` Operand kann eine Speicheradresse, ein Register oder ein Direktwert sein.    
> Der `<Ziel>` Operand kann eine Speicheradresse oder ein Register sein.
>
> **Beeinflusste Flags**
>
> - **CF (Carry-Flag)** Enthält das zuletzt herausgeschobene Bit.
> - **ZF (Zero-Flag)** Wird auf `1` gesetzt, wenn das Ergebnis `0` ist, andernfalls auf `0`.
> - **SF (Sign-Flag)** Entspricht dem MSB des Ergebnisses.
> - **PF (Parity-Flag)** Entspricht der Parität des niederwertigen Bytes des Ergebnisses.
> - **OF (Overflow-Flag)** Ist nur für `<Anzahl>` = 1 definiert. In diesem Fall wird OF auf `1` gesetzt, wenn nach dem shiften, der MSB ungleich dem Carry-Flag ist, andernfalls wird OF auf `0` gesetzt
>
> **Mögliche Exceptions**
>
> - **Page Fault** Wenn `<Anzahl>` oder `<Ziel>` eine Speicheradresse ist und der Zugriff einen Page Fault auslöst.
> - **General Protection Fault** Wenn `<Anzahl>` oder `<Ziel>` eine Speicheradresse ist und der Zugriff nicht erlaubt ist.




> ### 1.1.3 SAR
>
> `SAR` (Shift Arithmetic Right) führt eine arithmetische bitweise Rechtsverschiebung durch.
>
> **Syntax**
> ```
> SAR <Anzahl>, <Ziel>
> ```
> **Beschreibung**
>
> Verschiebt die Bits im `<Ziel>` um `<Anzahl>` Positionen nach rechts. Bei jeder einzelnen Verschiebung wird das LSB in das Carry-Flag übertragen, während das MSB mit seinem ursprünglichen Wert aufgefüllt wird (Vorzeichen bleibt erhalten).
>
> Der `<Anzahl>` Operand kann eine Speicheradresse, ein Register oder ein Direktwert sein.    
> Der `<Ziel>` Operand kann eine Speicheradresse oder ein Register sein.
>
> **Beeinflusste Flags**
>
> - **CF (Carry-Flag)** Enthält das zuletzt herausgeschobene Bit.
> - **ZF (Zero-Flag)** Wird auf `1` gesetzt, wenn das Ergebnis `0` ist, andernfalls auf `0`.
> - **SF (Sign-Flag)** Entspricht dem MSB des Ergebnisses.
> - **PF (Parity-Flag)** Entspricht der Parität des niederwertigen Bytes des Ergebnisses.
> - **OF (Overflow-Flag)** Wird auf `0` gesetzt.
>
> **Mögliche Exceptions**
>
> - **Page Fault** Wenn `<Anzahl>` oder `<Ziel>` eine Speicheradresse ist und der Zugriff einen Page Fault auslöst.
> - **General Protection Fault** Wenn `<Anzahl>` oder `<Ziel>` eine Speicheradresse ist und der Zugriff nicht erlaubt ist.




> ### 1.1.4 SAL
>
> `SAL` (Shift Arithmetic Left) führt eine arithmetische bitweise Linksverschiebung durch.
>
> **Syntax**
> ```
> SAL <Anzahl>, <Ziel>
> ```
> **Beschreibung**
>
> Verschiebt die Bits im `<Ziel>` um `<Anzahl>` Positionen nach links. Bei jeder einzelnen Verschiebung wird das MSB in das Carry-Flag übertragen, während das LSB mit 0 aufgefüllt wird.
>
> Der `<Anzahl>` Operand kann eine Speicheradresse, ein Register oder ein Direktwert sein.    
> Der `<Ziel>` Operand kann eine Speicheradresse oder ein Register sein.
>
> **Beeinflusste Flags**
>
> - **CF (Carry-Flag)** Enthält das zuletzt herausgeschobene Bit.
> - **ZF (Zero-Flag)** Wird auf `1` gesetzt, wenn das Ergebnis `0` ist, andernfalls auf `0`.
> - **SF (Sign-Flag)** Entspricht dem MSB des Ergebnisses.
> - **PF (Parity-Flag)** Entspricht der Parität des niederwertigen Bytes des Ergebnisses.
> - **OF (Overflow-Flag)** Ist nur für `<Anzahl>` = 1 definiert. In diesem Fall wird OF auf `1` gesetzt, wenn nach dem shiften, der MSB ungleich dem Carry-Flag ist, andernfalls wird OF auf `0` gesetzt
>
> **Mögliche Exceptions**
>
> - **Page Fault** Wenn `<Anzahl>` oder `<Ziel>` eine Speicheradresse ist und der Zugriff einen Page Fault auslöst.
> - **General Protection Fault** Wenn `<Anzahl>` oder `<Ziel>` eine Speicheradresse ist und der Zugriff nicht erlaubt ist.




## 1.2 Befehle für den TLB

> ### 1.2.1 INVTLB
>
> `INVTLB` (Invalidate TLB) leert den kompletten TLB.
>
> **Syntax**
> ```
> INVTLB
> ```
> **Beschreibung**
>
> Leert den gesamten TLB. Dieser Befehl ist privilegiert und darf daher nur im Kernel Mode ausgeführt werden.
>
> **Beeinflusste Flags**
>
> - Keine.
>
> **Mögliche Exceptions**
>
> - **General Protection Fault** Wenn der Befehl im User Mode ausgeführt wird.




## 1.3 Sprungbefehle

> ### 1.3.1 JA
>
> `JA` (Jump Above) führt einen Sprung aus, wenn der Vergleich zweier **vorzeichenloser Zahlen** (`X`, `Y` mit ```CMP Y, X```) ergibt, dass `X > Y` gilt.
>
> **Syntax**
> ```
> JA <Ziel>
> ```
> **Beschreibung**
>
> Springt zur angegebenen Speicheradresse `<Ziel>`, **nur wenn** sowohl das Carry-Flag (CF) als auch das Zero-Flag (ZF) `0` sind. Dies entspricht dem Ergebnis eines Vergleichs zweier vorzeichenloser Zahlen (`X`, `Y` mit ```CMP Y, X```), bei dem `X > Y` gilt.  
>
> Der `<Ziel>` Operand kann ein Register oder eine Speicheradresse sein.
>
> **Beeinflusste Flags**
>
> - Keine.
>
> **Mögliche Exceptions**
>
> - **Page Fault** Wenn `<Ziel>` eine Speicheradresse ist und der Sprung dahin einen Page Fault auslöst.  
> - **General Protection Fault** Wenn `<Ziel>` eine Speicheradresse ist und der Sprung dahin nicht erlaubt ist.




> ### 1.3.2 JAE
>
> `JAE` (Jump Above Equal) führt einen Sprung aus, wenn der Vergleich zweier **vorzeichenloser Zahlen** (`X`, `Y` mit ```CMP Y, X```) ergibt, dass `X >= Y` gilt.
>
> **Syntax**
> ```
> JAE <Ziel>
> ```
> **Beschreibung**
>
> Springt zur angegebenen Speicheradresse `<Ziel>`, **nur wenn** das Carry-Flag (CF) `0` ist. Dies entspricht dem Ergebnis eines Vergleichs zweier vorzeichenloser Zahlen (`X`, `Y` mit ```CMP Y, X```), bei dem `X >= Y` gilt.  
>
> Der `<Ziel>` Operand kann ein Register oder eine Speicheradresse sein.
>
> **Beeinflusste Flags**
>
> - Keine.
>
> **Mögliche Exceptions**
>
> - **Page Fault** Wenn `<Ziel>` eine Speicheradresse ist und der Sprung dahin einen Page Fault auslöst.  
> - **General Protection Fault** Wenn `<Ziel>` eine Speicheradresse ist und der Sprung dahin nicht erlaubt ist.




> ### 1.3.3 JB
>
> `JB` (Jump Below) führt einen Sprung aus, wenn der Vergleich zweier **vorzeichenloser Zahlen** (`X`, `Y` mit ```CMP Y, X```) ergibt, dass `X < Y` gilt.
>
> **Syntax**
> ```
> JB <Ziel>
> ```
> **Beschreibung**
>
> Springt zur angegebenen Speicheradresse `<Ziel>`, **nur wenn** das Carry-Flag (CF) `1` ist. Dies entspricht dem Ergebnis eines Vergleichs zweier vorzeichenloser Zahlen (`X`, `Y` mit ```CMP Y, X```), bei dem `X < Y` gilt.  
>
> Der `<Ziel>` Operand kann ein Register oder eine Speicheradresse sein.
>
> **Beeinflusste Flags**
>
> - Keine.
>
> **Mögliche Exceptions**
>
> - **Page Fault** Wenn `<Ziel>` eine Speicheradresse ist und der Sprung dahin einen Page Fault auslöst.  
> - **General Protection Fault** Wenn `<Ziel>` eine Speicheradresse ist und der Sprung dahin nicht erlaubt ist.




> ### 1.3.4 JBE
>
> `JBE` (Jump Below Equal) führt einen Sprung aus, wenn der Vergleich zweier **vorzeichenloser Zahlen** (`X`, `Y` mit ```CMP Y, X```) ergibt, dass `X <= Y` gilt.
>
> **Syntax**
> ```
> JB <Ziel>
> ```
> **Beschreibung**
>
> Springt zur angegebenen Speicheradresse `<Ziel>`, **nur wenn** sowohl das Carry-Flag (CF) als auch das Zero-Flag (ZF) `1` sind. Dies entspricht dem >Ergebnis eines Vergleichs zweier vorzeichenloser Zahlen (`X`, `Y` mit ```CMP Y, X```), bei dem `X <= Y` gilt.  
>
> Der `<Ziel>` Operand kann ein Register oder eine Speicheradresse sein.
>
> **Beeinflusste Flags**
>
>- Keine.
>
> **Mögliche Exceptions**
>
> - **Page Fault** Wenn `<Ziel>` eine Speicheradresse ist und der Sprung dahin einen Page Fault auslöst.  
> - **General Protection Fault** Wenn `<Ziel>` eine Speicheradresse ist und der Sprung dahin nicht erlaubt ist.




## 1.4 Präprozessor Befehle

> ### 1.4.1 INCLUDE
>
> `INCLUDE` ist ein Präprozessor Befehl, der den Inhalt einer anderen Datei an der Stelle der Deklaration einfügt.
>
> **Syntax**
> ```
> .INCLUDE <Dateifpad>
> ```
> **Beschreibung**
>
> Der `INCLUDE` Befehl ersetzt vor dem Assemblieren die Deklaration durch den Inhalt der Datei, die im Dateisystem des Betriebssystems des CPU-Simulators unter dem Pfad `<Dateipfad>` zu finden ist.
>
> Die Datei muss eine gültige Assemblerdatei sein. Enthält diese Datei weitere `INCLUDE` Befehle, werden diese rekursiv aufgelöst, bevor der Inhalt in >die aktuelle Datei eingefügt wird.




# 2 DEV Operationen

## 2.1 Operationen für die virtuelle Speicherverwaltung

> ### 2.1.1 CPU IS MEMORY VIRTUALIZATION ENABLED
>
> Die DEV Operation `CPU_IS_MEMORY_VIRTUALIZATION_ENABLED` fragt ab, ob die virtuelle Speicherverwaltung aktiviert ist.
>
> **Beschreibung**
>
> Diese Operation belegt die `<command>` Nummer 10. Der `<data>` Operand wird ignoriert.  
>
> - Diese Operation belegt die `<command>` Nummer 10.  
> - Der `<data>` Operand wird ignoriert.  
> - Das Ergebnis wird in das Register `EAX` geschrieben:  
>     - `1` → Virtuelle Speicherverwaltung ist aktiviert  
>     - `0` → Virtuelle Speicherverwaltung ist deaktiviert




> ### 2.1.2 CPU ENABLE MEMORY VIRTUALIZATION
>
> Die DEV Operation `CPU_ENABLE_MEMORY_VIRTUALIZATION` aktiviert die virtuelle Speicherverwaltung.
>
> **Beschreibung**
>
> - Diese Operation belegt die `<command>` Nummer 11.  
> - Der `<data>` Operand wird ignoriert.  
> - Es gibt keinen Rückgabewert.




> ### 2.1.3 CPU DISABLE MEMORY VIRTUALIZATION
>
> Die DEV Operation `CPU_DISABLE_MEMORY_VIRTUALIZATION` deaktiviert die virtuelle Speicherverwaltung.
>
> **Beschreibung**
>
> - Diese Operation belegt die `<command>` Nummer 12.  
> - Der `<data>` Operand wird ignoriert.  
> - Es gibt keinen Rückgabewert.




## 2.2 Operationen für den Timer

> ### 2.2.1 TIMER GET FINISHED
>
> Die DEV Operation `TIMER_GET_FINISHED` gibt die Timer-ID des zuletzt abgelaufenen Timers zurück.
>
> **Beschreibung**
>
> - Diese Operation belegt die `<command>` Nummer 13.  
> - Der `<data>` Operand wird ignoriert.  
> - Die Timer-ID wird in das Register `EAX` geschrieben (0, falls bisher kein Timer abgelaufen ist).




> ### 2.2.2 TIMER SET
>
> Die DEV Operation `TIMER_SET` startet einen neuen Timer.
>
> **Beschreibung**
>
> - Diese Operation belegt die `<command>` Nummer 14.  
> - Der `<data>` Operand wird als Timer-ID des neuen Timers genutzt.  
> - Die Dauer des Timers wird vom Stack geholt.  
> - Es gibt keinen Rückgabewert.
