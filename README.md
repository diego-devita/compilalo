# ![[C]](src/images/compilalo128.png) Compilalo

Compilalo è una Chrome Extension utile ad assistere l'utente durante la compilazione del suo timesheet, automatizzandone i compiti più dispendiosi e decorando la pagina di informazioni utili all'operazione.

Ma Compilalo è in primo luogo una libreria JS per l'interazione con il timesheet e che viene distribuita all'interno di questa estensione Google Chrome.

## Installazione

L'installazione di estensioni esterne al Google Chrome Store, richiede grossi sforzi purtroppo. La richiesta di partecipazione allo store è già stata inviata in data 17 Aprile ma non è dato sapere nè se e nè quando verrà accettata.

https://developer.chrome.com/docs/extensions/mv2/external_extensions/

Ma intanto nell'attesa...

Per installare l'estensione:

1. Scaricare il pacchetto dell'ultima versione dalla cartella `dist/` nella sua forma .zip - [versione più recente][latestversion_zip]
2. Estrarre l'archivio in una cartella utente di cui conservare il percorso.
3. Aprire il browser Chrome e cliccare sul menù > Altri Strumenti > Estensioni
4. Sulla pagina di gestione delle estensioni, abilitare la Modalità sviluppatore
5. Premere il nuovo tasto `Carica estensione non pacchettizzata` apparso in alto a sinistra
6. Riportare il percorso in cui è stato estratto l'archivio

La nuova estensione dovrebbe comparire ora tra quelle disponibili e sarà possibile anche "pinnarla" sulla barra visibile in modo da averla facilmente a disposizione.

## Utilizzo

Dopo una corretta installazione, sarà possibile vedere la sua icona ![[C]](src/images/compilalo16.png) tra le estensioni disponibili.
Per attivare la compilazione automatica:
1. Recarsi alla pagina del timesheet che mostri la rendicontazione di un mese qualunque;
2. Poi fare click sull'icona dell'estensione e scegliere `Avvia qui`.

Una routine js verrà eseguita in un contesto separato ma con il potere di accesso al dom di quella pagina, che:

1. Espanderà tutte le voci menù collapsed, per mostrare tutte le commesse rendicontabili già presenti;
2. Aggiungerà un pannello di stato sull'angolo in alto a sinistra della tabella Mese;
3. Aggiungerà un bottone su ogni commessa rendicontabile, la cui pressione compilerà tutta la riga secondo i criteri impartiti;
4. Aggiungerà un'etichetta su tutte le celle rendicontate, indicando quale sia la percentuale di quella rendicontazione rispetto al tempo lavorato del giorno;
5. Evidenzierà di verde o rosso, il tempo lavorato del giorno, rispettivamente se il tempo rendicontato di quel giorno corrisponde o meno;

<pre>
<b>Attenzione!</b> L'addon lavora solo sul dom della pagina che state consultando.
Nulla sarà permanente finchè non verrà fatto <b>SALVA</b> o <b>INVIA</b> dall'utente.
</pre>

Dopo il suo attivamento, Compilalo avrà iniettato nella pagina tutta la logica necessaria alle sue leve per funzionare.

## Leve d'azione

Ogni commessa rendicontabile avrà un nuovo bottone con l'etichetta `AUTO` e affianco un ulteriore box che indichi quale criterio verrà applicato alla sua pressione. Esistono due criteri: `Quota`, `Fit`. Questi criteri sono selezionabili dal pannello di stato arancione in alto a sinistra. Quando si indica la quota, alla pressione del tasto AUTO, la riga sarà compilata con intervalli di tempo pari alla quota sul totale lavorato. La quota è un numero tra 0.01 e 1.00 (percentuale). Quando invece si seleziona il criterio Fit, la riga viene compilata con le differenze che servono a colmare il tempo lavorato rispetto ad eventuali altre commesse già rendicontate lo stesso giorno.

Ogni volta che viene lanciata una compilazione automatica, alla fine viene aggiornato lo stato delle decorazioni rispetto alle ultime informazioni, ergo etichette % e stato di assolvimento del tempo lavorate rimangono consistenti. Quando però il tempo rendicontato viene inserito manualmente dall'utente, lo stato delle decorazioni sarà necessario aggiornarlo dal link `Aggiorna`.

[latestversion_zip]: https://github.com/diego-devita/compilalo/blob/main/dist/1.1/compilalo_1_1.zip
