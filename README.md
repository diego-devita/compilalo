# ![[C]](src/images/compilalo128.png) Compilalo

Compilalo è una Chrome Extension utile ad assistere l'utente durante la compilazione del suo timesheet, automatizzandone i compiti più dispendiosi e decorando la pagina di informazioni utili all'operazione.

Ma Compilalo è in primo luogo una libreria JS per l'interazione con il timesheet e che viene distribuita all'interno di questa estensione Google Chrome.

## Installazione

Per installare l'estensione è sufficiente scaricare il pacchetto dell'ultima versione dalla cartella `dist/` 

Versione più recente:
https://github.com/diego-devita/compilalo/blob/main/dist/1.1/compilalo_1_1.crx

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
