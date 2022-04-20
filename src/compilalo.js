/*==========================================================================
 *  Compilalo.js  v.1.1                 Assistente Compilazione Timesheet  *
 *--------------------------------------------------------------------------
 *    Logica necessaria all'assistente compilazione timesheet.
 *    Funzioni stateless con compiti precisi da rifattorizzare
 *    in un oggetto unico (che inglobi lo scope) e un'interfaccia
 *    chiara che nasconda i dettagli di dominio più ampio
 *=========================================================================*/

/**
 * Inietta regole css sulla pagina per assistere lo styling
 */
function addStyleRules(){
    let styles = `
   .time_match{
       border: solid 3px green;
       border-radius: 3px;
       padding: 0 4px;
   }
   .time_mismatch{
       border: solid 3px red;
       border-radius: 3px;
       padding: 0 4px;
   }
   .compila_button{
       min-width: 2em;
       min-height: 2em;
       border: solid 2px black;
       display: inline-block;
       position: relative;
       padding: 5px;
       vertical-align: top;
       line-height: 1;
       text-align: center;
       font-size: 13px;
       font-weight: 700;
   }
   .status_panel{
        border: solid 1px gray;
        background: #faad14;
        text-align: center;
        position: absolute;
        width: calc(100% - 15px);
        height: calc(100% - 15px);
   }
   .multiplier{
       display: inline-block;
       background: #d9eff5;
       vertical-align: text-bottom;
       padding: 0 5px;
       border-radius: 4px;
   }
   .panel_header{
       border-bottom: solid 1px gray;
       width: 100%;
       display: block;
       margin: 0 auto 1em auto;
       padding: 0.2em 1em;
   }
   .panel_body{
       text-align: left;
       display: flex;
       justify-content: space-around;
       align-items: center;
   }
   .panel_footer{
        position: absolute;
        bottom: 0;
        border-top: solid 1px gray;
        width: 100%;
        font-size: 10px;
        text-align: right;
        padding: 2px 10px;
        line-height: 1;
        font-family: courier, monospace;
        background: white;
        color: gray;
   }
   .quota{
       font-size: 18px;
       height: 1.3em;
       padding: 10px 5px;
       max-width: 2.75em;
       text-align: center;
       font-family: fantasy;
       border-radius: 4px;
       vertical-align: middle;
   }
   .quota_input_valid{
       border: solid 3px green !important;
   }
   .quota_input_invalid{
       border: solid 3px red !important;
   }
   .quota_boing{
       position: absolute;
       background: #1890ff;
       bottom: 5px;
       right: 0;
       font-size: 10px;
       padding: 0;
       line-height: 1;
       padding: 2px 3px;
       color: white;
   }
   .quota_label{
       font-size: 20px;
       margin-right: 0.3em;
       font-weight: 600;
       line-height: 1;
       vertical-align: bottom;
   }
   .fit{
       border: solid 3px #6c757d;
       padding: 0px 4px 0px 4px;
       display: inline-block;
       cursor: pointer;
       line-height: 1.1;
       font-size: 19px;
       border-radius: 4px;
       vertical-align: middle;
       height: 1.37em;
   }
   .fitEnabled{
       background: white;
   }
   .separator{
       font-size: 30px;
       padding: 0;
       line-height: 1;
       vertical-align: middle;
       margin: 0 8px;
   }
   .aggiorna_ui{
        text-decoration: underline;
        font-size: 12px;
   }

   `;

   let styleSheet = document.getElementById('added_style_for_assistant');
   if(styleSheet == null){
       styleSheet = document.createElement('style');
       styleSheet.id = 'added_style_for_assistant';
       styleSheet.innerText = styles;
       document.body.appendChild(styleSheet);
   }
}

/**
 * Crea un elemento HTML (che ritorna)
 * corredandolo di una lista di attributi e innerText se presente
 */
function createElement(type, attributes, innerText = null){
    const element = document.createElement(type);
    for(const [attributeName, attributeValue] of Object.entries(attributes)){
        element.setAttribute(attributeName, attributeValue);
    }
    if(innerText != null)
        element.innerText = innerText;
    return element;
}

/**
 * Solleva l'evento blur su element dopo avergli cambiato il valore con value
 */
function triggerChangeEvent(element, value){
    if (element == null) return false;
    element.value = value;
    element.dispatchEvent( new Event('blur') );
}

/**
 * Solleva l'evento click su element
 */
function triggerClickEvent(element){
    element.dispatchEvent( new Event('click'));
}

/**
 * Espande tutte le voci colapsed che inglobano le commesse
 */
function expandAllCollapsed(){
    const delayTime = 100;
    const collapsedMenuItems = document.querySelectorAll('.ant-table-row-expand-icon-collapsed');
    for (collapsedMenuItem of collapsedMenuItems){
        collapsedMenuItem.dispatchEvent( new Event('click') );
        setTimeout(expandAllCollapsed, delayTime);
    }
}

/**
 * Restituisce una lista di oggetti Row
 * {
 *      position: number,
 *      element: htmlElement,
 *      label: string,
 *      children: htmlElement[],
 *      readonly: number
 * }
 *
 * Include tutte le righe trovate, che siano parent o deepest child
 */
function parseRows(){
    const rows = [];
    Array.from( document.querySelectorAll('table')[1].querySelectorAll('tbody tr') )
    .forEach( (row, iRow ) => {
        let falseCounter = 0;
        let trueCounter = 0;
        Array.from(row.children)
        .forEach( (column, iColumn) => {
            if ( column.matches('.isReadOnly') )
                trueCounter++;
            else
                falseCounter++;
        });
        const commessa = {
            position: iRow,
            element: row,
            label: row.children[0].innerText.trim(),
            children: row.children,
            readonly: trueCounter,
            /*editable: falseCounter,*/
        };
        rows.push(commessa);
    });

    return rows;
}

/**
 * Restituisce una lista di oggetti Total
 * {
 *      position: number,
 *      label: string,
 *      element: htmlElement
 * }
 */
function parseTotals(){
    const totals = [];
    Array.from(document.querySelectorAll('table')[0].querySelectorAll('thead tr:nth-child(2) th'))
    .forEach( (o, i) => {
        if(i==0) return;
        totals.push({
            position: i-1,
            label: o.textContent.trim(),
            element: o
        });
    });
    return totals;
}

/**
 * Restituisce un array di oggetti Day
 * {
 *      position: number,
 *      element: htmlElement,
 *      dayOfWeek: string,
 *      dayOfMonth: string,
 *      timeSpent: string
 * }
 *
 * corrispondenti alle colonne sull'intestazione principale del timesheet
 * include solo i giorni che abbiano timeSpent popolato quindi no festivi
 * (da indagare se il lavorato extra eventuale fatto tipo sabato poi scali sull'algoritmo)
 */
function parseDaysInHeader(includeEmptyDays = false){

    const days = [];

    //recupera la riga header principale con i giorni del mese
    const firstHeaderRow = document.querySelectorAll('table')[0].querySelector('thead tr:nth-child(1)');
    const columns = Array.from(firstHeaderRow.children);

    //per ogni sua colonna
    columns.forEach((headerColumn, i) => {
        //criterio lasco per capire se il <th> corrente sia di quelli che
        //contiene il giorno del mese (escluso sabato e domenica)
        const columnChildren = headerColumn.children;

        //costruisce l'oggetto day che forse pusha nell'array days
        const nrOfChildren = columnChildren.length;
        let tempoLavoratoIfAny = null;
        //se il numero di children è 4 e l'ultima colonna contiene uno span valorizzato
        if(nrOfChildren === 4 && columnChildren[3].querySelector('span') != null && columnChildren[3].querySelector('span').textContent.length > 0)
        tempoLavoratoIfAny = columnChildren[3].querySelector('span').textContent;
        //children E (tempoLavoratoIfAny esiste O non esiste ma includeEmptyDays==true)
        if( tempoLavoratoIfAny != null || (tempoLavoratoIfAny == null && includeEmptyDays) ){
            const timeSpentInnerContainer = columnChildren[3].querySelector('i span');
            const day = {
                position: i,
                element: timeSpentInnerContainer/*headerColumn*/,
                dayOfWeek: columnChildren[0].innerText,             //es.: Mar
                dayOfMonth: columnChildren[1].innerText,            //es.: 5
                /*spacer: columnChildren[2],*/                      //es.: [Empty]
                timeSpent: (timeSpentInnerContainer != null) ?
                            timeSpentInnerContainer.innerText : '', //es.: 07:12
            }
            days.push(day);
        }
    });

    return days;
}

/**
 * Prese le righe restituite da parseRows(),
 * ne ritorna il sottoinsieme che corrisponde a commesse rendicontabili
 */
function filterCommesseFromRows(rows){
    //criterio discutibile per stanare le row che rapprsentano commesse compilabili
    return rows.filter(row => row.readonly < 5 && row.position > 0);
}

/**
 * Compila una commessa sull'intero mese (criterio Quota)
 */
function fillCommessa(commessa, daysInHeader, quota = 1){
    //per ogni giorno compilabile
    daysInHeader.forEach((day, i) => {
        //recupera il td contenente la textbox
        const cellToEdit = commessa.children[day.position];
        //fa click sulla cella per attivare l'edit
        triggerClickEvent(cellToEdit);
        //recupera le coordinate totalTimeSpent e rendicontato
        const totalTimeSpent = day.timeSpent;
        const rendicontato = timeGetQuota(totalTimeSpent, quota);
        triggerChangeEvent(cellToEdit.querySelector('input'), rendicontato);
    });
}

/**
 * Compila una commessa sull'intero mese (criterio Fit)
 */
function fillCommessaFit100(commesse, commessaToFill, daysInHeader){
    daysInHeader.forEach((day, iDay) => {
        let sumMinutes = 0;
        commesse.forEach((commessa, iCommessa) => {
            if (commessa.position === commessaToFill.position)
                return;
            const campoCommessaPerGiorno = commessa.children[day.position];
            const value = campoCommessaPerGiorno.querySelector('input').value;
            const minutes = hoursToMinutes(value);
            if(!isNaN(minutes) && minutes > 0)
                sumMinutes += minutes;
        });

        const remainingMinutes = hoursToMinutes(day.timeSpent) - sumMinutes;
        const remainingHours = minutesToHours(remainingMinutes);

        const cellToEdit = commessaToFill.children[day.position];
        triggerClickEvent(cellToEdit);
        triggerChangeEvent(cellToEdit.querySelector('input'), remainingHours);
    });
}

/**
 * Cattura lo stato espresso dalla pagina di rendicontazione,
 *
 * leggendo il calendario mostrato sulla pagina e le commesse caricate
 * da cui vengono estrapolati i seguenti dati:
 *
 *      Il tempo lavorato
 *      Le righe grezze sulla colonna delle commesse
 *      Le righe che corrispondono a commesse rendicontabili
 *      I totali (?)
 *
 * Ritorna quindi un oggetto Page
 * {
 *      daysInHeader: string,
 *      rows: Rows[],
 *      commesse: Comessa[],
 *      totals: Total[]
 * }
 *
 */
function parsePage(){

    const daysInHeader = parseDaysInHeader();
    const rows = parseRows();
    const commesse = filterCommesseFromRows(rows);
    const totals = parseTotals();

    return {
        daysInHeader: daysInHeader,
        rows: rows,
        commesse: commesse,
        totals: totals
    };
}

/**
 * Aggiorna le quote % scritte su ogni tempo rendicontato
 */
function refreshQuotas(daysInHeader, commesse){
    Array.from(document.querySelectorAll('.quota_boing')).forEach( o => o.remove() );
    daysInHeader.forEach((day, iDay) => {
        commesse.forEach((commessa, iCommessa) => {
            const campoCommessaPerGiorno = commessa.children[day.position];
            const value = campoCommessaPerGiorno.querySelector('input')?.value;
            let perc = (hoursToMinutes(value) / hoursToMinutes(day.timeSpent))*100;
            if(!isNaN(perc)){
                let percN = document.createElement('div');
                percN.classList.add('quota_boing');
                perc = Math.round((perc + Number.EPSILON) * 100) / 100;
                percN.innerText = perc;
                campoCommessaPerGiorno.append(percN);
            }
        });
    });
}

/**
 * Aggiorna i totali tempoLavorato sull'header (stile rosso/verde)
 */
function refreshTotals(daysInHeader, totals){
    daysInHeader.forEach((day, i) => {
        if(day.element == null) return;
        let total = totals[day.position-1].label;
        total = (total.length == 4) ? `0${total}` : total;
        day.element.classList.remove('time_match');
        day.element.classList.remove('time_mismatch');
        if (day.timeSpent == total){
            day.element.classList.add('time_match');
        }else{
            day.element.classList.add('time_mismatch');
        }
    });
}

/**
 * Aggiorna le etichette affianco ai button AUTO con l'intenzione selezionata
 * e segnala lo stato di validità dell'input box .quota.
 * Viene invocato quando si verificato il blur sull'elemento o quando si vuole
 * forzare il cambiamento perché .quota è stato valorizzato programmaticamente
 */
function onQuotaChanged(){
    const quota =  document.querySelector('.quota').value; //event.target.value;
    let isok = false;
    if( /^[01]\.\d{2}$/.test(quota) ){
        const quotaParsed = parseFloat(quota);
        if( quotaParsed > 0 && quotaParsed <= 1){
            document.getElementById('real_quota').value = quota;
            isok = true;
        }
    }
    const realquota = (isok) ? quota : '1.00';
    Array.from(document.querySelectorAll('.multiplier')).forEach( item => item.innerText = `x${realquota}` );

    document.querySelector('.quota').classList.remove('quota_input_valid');
    document.querySelector('.quota').classList.remove('quota_input_invalid');
    document.querySelector('.quota').classList.add(isok ? 'quota_input_valid' : 'quota_input_invalid');
}

/**
 * Se non esiste ancora, crea e mostra il pannello status
 */
function showStatus(){

    if( document.querySelectorAll('table:nth-child(1) thead tr:nth-child(1) th:nth-child(1) .status_panel').length > 0 )
        return false;

    const panel = createElement( 'div', { class: 'status_panel' } );

    const panelHeader = createElement( 'div', { class: 'panel_header' }, 'L\'assistenza alla compilazione è attiva.' );

    const quotaLabel = createElement( 'label', { class: 'quota_label' }, 'Q' );
    const quotaInput = createElement( 'input', { type: 'text', class:'quota quota_input_valid', value:'1.00' } );
    quotaInput.addEventListener('blur', onQuotaChanged);
    const quotaInputHidden = createElement( 'input', { id: 'real_quota', type: 'hidden', value:' 1.00' } );
    const separator = createElement( 'span', { class: 'separator' }, '/' );
    const fit = createElement( 'div', { class: 'fit' }, 'FIT' );
    fit.addEventListener('click', () => {
        const fit = window.event.target;
        fit.classList.toggle('fitEnabled');
        if( fit.matches('.fitEnabled') ){
            Array.from(document.querySelectorAll('.multiplier')).forEach(item => item.innerText = 'FIT');
            document.querySelector('.quota').setAttribute('disabled', true);
        }else{
            document.querySelector('.quota').removeAttribute('disabled');
            onQuotaChanged();
        }
    });
    const refreshAssistant = createElement( 'a', { class: 'aggiorna_ui' }, 'Aggiorna' );
    refreshAssistant.addEventListener('click', () =>{
        window.event.preventDefault();
        refreshPage();
    });

    const quotaContainer = document.createElement('div');
    quotaContainer.append(quotaLabel);
    quotaContainer.append(quotaInput);
    quotaContainer.append(quotaInputHidden);
    quotaContainer.append(separator);
    quotaContainer.append(fit);

    const panelBody = createElement('div', { class: 'panel_body'});
    panelBody.append(quotaContainer);
    panelBody.append(refreshAssistant);

    const panelFooter = createElement( 'div', { class: 'panel_footer'}, 'Compilalo 1.1');

    panel.append(panelHeader);
    panel.append(panelBody);
    panel.append(panelFooter);

    const areaStatus = document.querySelector('table:nth-child(1) thead tr:nth-child(1) th:nth-child(1)');
    areaStatus.append( panel );
}


/**
 * Aggiunge i pulsanti AUTO compilazione su tutte le commesse
 */
function decoratePage(commesse){
    commesse.forEach((commessa,i)=>{
        const btnCompila = createElement('div', {class: 'compila_button'}, 'AUTO');
        btnCompila.setAttribute('data-commessaindex', `${i}`);
        const labelCompila = createElement('div', {class: 'multiplier'}, 'x1.00');
        const labelCommessa = commessa.element.children[0];
        labelCommessa.style.overflow = 'initial';
        labelCommessa.querySelector('.compila_button')?.remove();
        labelCommessa.querySelector('.multiplier')?.remove();
        labelCommessa.lastElementChild.style.display = 'inline-block';
        labelCommessa.append(btnCompila);
        btnCompila.addEventListener('click', onCompilaClick);
        labelCommessa.append(labelCompila);
    });
}

/**
 * Restituisce la quota di time
 */
function timeGetQuota(time, quota){
    const minutes = hoursToMinutes(time);
    return minutesToHours(minutes*quota);
}

/**
 * Restituisce l'equivalente in minuti (number)
 * di hours espresso come HH:mm e che può mancare del trailing zero
 */
function hoursToMinutes(hours){
    if(typeof hours != 'string')
        return '---';
    if(hours.length != 4 && hours.length != 5)
        return '---';
    hours = (hours.length == 4) ? `0${hours}` : hours;
    let parts = hours.split(':');
    let minutes = +parts[0]*60 + +parts[1];

    return minutes;
}

/**
 * Restituisce l'equivalente in ore (HH:mm)
 * di minutes (number)
 */
function minutesToHours(minutes){
    minutes = Math.floor(minutes);
    let hours_p1 = Math.floor(minutes/60);
    let hours_p2 = minutes % 60;
    hours_p1 = (hours_p1+'').padStart(2, '0');
    hours_p2 = (hours_p2+'').padStart(2, '0');
    return `${hours_p1}:${hours_p2}`;
}
//------------------------------

/**
 * Aggiorna la pagina riparsando lo stato del calendario/commesse e
 * facendo il refresh di totals e quotas
 */
function refreshPage(){
    const page = parsePage();
    refreshTotals(page.daysInHeader, page.totals)
    refreshQuotas(page.daysInHeader, page.commesse);
    return page;
}

/**
 * Quando viene scatenato l'event click su autocompila
 * decide il criterio quota/fit e invoce fillCommessa*
 */
function onCompilaClick(){
    const commessa_index = window.event.currentTarget.dataset.commessaindex;
    const page = parsePage();
    const quota = parseFloat( document.getElementById('real_quota').value );
    if ( document.querySelector('.fit').matches('.fitEnabled') ){
        fillCommessaFit100(page.commesse, page.commesse[commessa_index], page.daysInHeader)
    }else{
        fillCommessa(page.commesse[commessa_index], page.daysInHeader, quota);
    }
    /**
     * Questa cosa è assurda! la chiamata a refreshPage che a sua volta scatena l'evento blur sulle input text
     * non funziona come dovrebbe. L'evento viene innescato con dispatchEvent e l'unica modifica correlata
     * che desta il sospetto potrebbe essere il fatto che non usassi new Event come argomento e usassi un
     * paio di parametri che ora non sto usando. Comunque rimane assurdo perché in ogni caso il loop eventi
     * si incastra in un linguaggio single threaded e il dispatchEvent dovrebbe essere sincrono.. ossia
     * quando ritorna l'istruzione significa che tutti gli event handler dell'evento abbiano girato.
     * Tornando alla cronaca, l'invocazione l'avevo spostata qui e sembrava aver dato un frutto ma era un'illusione
     * Tanto vale a questo punto farlo con un delay ma che porcheria.
     */
    setTimeout(refreshPage, 600);
}

/**
 * Fa il primo step di inizializzazione
 * poi aspetta delayTime prima di fare il secondo step
 */
function init(){
    addStyleRules();
    console.log('%cCSS style rules aggiunte.', 'color:yellow;');
    expandAllCollapsed();
    console.log('%cEspanse tutte le voci del menù.', 'color:yellow;');
    const timer = setTimeout(init2, 1000);
}

/**
 * Fa il secondo step di inizializzazione
 */
function init2(){
    let page = refreshPage();
    console.log('%cRaccolte le informazioni sul mese aperto nel timesheet.', 'color:yellow;');
    console.log('%cMostrate le decorazioni extra:', 'color:yellow;');
    console.log('%c  (tempo lavorato match/mismatch e quote % giornaliere).', 'color:yellow;');
    decoratePage(page.commesse);
    console.log('%cAggiunti tasti compilazione automatica.', 'color:yellow;');
    showStatus();
    console.log('%cMostrato il pannello di stato.', 'color:yellow;');
    console.log('%c-------------------------------------------------', 'color:yellow;');
}

console.log('%c---------------[Compilalo.js v1.1]---------------', 'color:yellow;');
console.log('%cInizializzazione in corso...', 'color:orange;font-weight:600;');
init();