/* global chrome */

(function(g){
    var exportButtonId = 'ts-ext-export-btn';
    var buttonCls = 'ts-btn-container';
    var exportButtonText = '+';
    var startButtonId = 'ts-ext-start-button';
    var stopButtonId = 'ts-ext-stop-button';
    var notFound = 'unknown';
    var store = {};
    try{
        var d;
        d = g.document;

        if ( detectRequestTracker() ) {
            addButtons();
            setListeners();
        }
    }catch(err){
        console.error(err); // disable on prod
        // sad, but safe
    }
    /**
     * Tries to check if this page is a Reuqest Tracker page, which can be
     * a subject of this extension - if we can add a button.
     * @returns {Boolean}
     */
    function detectRequestTracker(){
        var logoEl, linkEl, bodyEl, summaryEl;

        logoEl = d.getElementById('logo');
        if (!logoEl){return false;}

        linkEl = logoEl.getElementsByTagName('a')[0];
        if (!linkEl){return false;}

        bodyEl = document.getElementById('body');
        if (!bodyEl){return false;}

        summaryEl = document.querySelector('.ticket-summary');
        if (!summaryEl){return false;}
         // enough I think
        return linkEl.getAttribute('href').match(/bestpractical/) !== null;
    }

    function setListeners(){
        chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
            var text = msg['text'];
            if (!text || text !== "tsGetDetails") { return; }
            var data = collectTicketData();
            sendResponse(data);
        });

        d.getElementById(exportButtonId).addEventListener('click', onExportButtonClick);
        d.getElementById(startButtonId).addEventListener('click', onStartButtonClick);
    }

    function collectTicketData(){
        var data = {};
        // id
        data['id'] = collectParam('id');
        // queue
        data['queue'] = collectParam('queue');
        // subject
        data['subject'] = store['subject'] || notFound;
        return data;
    }

    function collectParam(className){
        var el = d.querySelector('.' + className + ' .value');
        return !el ? notFound : (el.textContent || notFound).replace(/[\s\t\n]/gim, '');
    }

    function addButtons(){
        addExportButton();
        addStartStopButtons();
    }
    function addExportButton(){
        var header, button;
        header = d.getElementById('header');
        header = header.getElementsByTagName('h1')[0];
        // keep
        store['subject'] = header.textContent.trim().replace(/^#\d+:/gim, '').trim();
        button = d.createElement('div');
        button.setAttribute('id', exportButtonId);
        button.setAttribute('class', buttonCls);
        button.setAttribute('title', 'Form TS record and copy to clipboard');
        button.innerHTML = '<span>' + exportButtonText + '</span>';
        header.appendChild(button);
    }
    function addStartStopButtons(){
        var header, button;
        header = d.getElementById('header');
        header = header.getElementsByTagName('h1')[0];

        button = d.createElement('div');
        button.setAttribute('id', startButtonId);
        button.setAttribute('class', buttonCls);
        button.setAttribute('title', 'Start ticket');
        button.innerHTML = '<span>' + 'start' + '</span>';
        header.appendChild(button);

        button = d.createElement('div');
        button.setAttribute('id', stopButtonId);
        button.setAttribute('class', buttonCls);
        button.setAttribute('title', 'Stop ticket');
        button.innerHTML = '<span>' + 'stop' + '</span>';
        header.appendChild(button);
    }
    function onExportButtonClick(){
        var data = collectTicketData() || {};
        data.action = 'ts_ext_ticketDetails';
        chrome.runtime.sendMessage(data, function(recordString) {
            console.log(recordString);
        });
    }

    function onStartButtonClick(){
        var data = collectTicketData() || {};
        data.action = 'ts_ext_startTicket';
        chrome.runtime.sendMessage(data, function(answer) {
            console.log(answer);
        });
    }

})(window);


/* Slowpoke comments */

function mainSlowpoke(window, $) {

    // FIXME: remove stub from textarea
    var commentForm = '<textarea autocomplete="off" class="messagebox slowpoke-comment" style="width: 98%;" rows="10" wrap="SOFT" name="UpdateContent" id="UpdateContent">' +
        'On Fri Oct 30 15:39:55 2015, tzaripov wrote:\n' +
        '> cause i need to test here\n' +
        '> http://example.com\n' +
        '>\n' +
        '> bold as a highlander\n' +
        '</textarea>';

    var saveBtn = '&nbsp;[<a class="slowpoke-save-link">Save</a>]&nbsp;',
        editBtn  = '&nbsp;[<a class="slowpoke-edit-link">Edit</a>]&nbsp;';

    function replaceCommentButtons(commentForm, saveBtn, editBtn){
        var commentButtons = $('.comment-link');
        commentButtons.click(function(event){
            event.preventDefault();
            event.stopPropagation();

            var historyContainer = $(event.target).closest("#ticket-history"),
                topHistoryElem = $('div ', historyContainer)[0],
                commentClone = $(event.target).closest(".ticket-transaction.message").clone();

            $(".downloadattachment", commentClone).remove();
            $(".metadata .actions", commentClone).html(saveBtn);
            $(".messagebody", commentClone).html(commentForm);
            $(commentClone).prependTo(topHistoryElem);

        });

        $(".ticket-transaction.message .slowpoke-save-link").live('click', function() {
            event.preventDefault();
            event.stopPropagation();

            var comment = $(event.target).closest(".ticket-transaction.message"),
                commentText = $(".slowpoke-comment", comment).text(),
                processedCommentText = commentText.replace(/\n/g, "<br>");

            $(".messagebody", comment).html('<div class="message-stanza slowpoke-message">' + processedCommentText + "</div>");
            $(".metadata .actions", comment).html(editBtn);
        });

        $(".ticket-transaction.message .slowpoke-edit-link").live('click', function() {
            event.preventDefault();
            event.stopPropagation();

            var comment = $(event.target).closest(".ticket-transaction.message"),
                commentText = $(".slowpoke-message", comment).html(),
                processedMessageText = commentText.replace(/<br>/g, "\n");

            $(".messagebody", comment).html(commentForm);
            $("textarea", comment).text(processedMessageText);
            $(".metadata .actions", comment).html(saveBtn);
        });
    }

    $(document).ready(function () {
        replaceCommentButtons(commentForm, saveBtn, editBtn);
    });
}

addJS_Node(null, null, mainSlowpoke);


// code from http://stackoverflow.com/a/9871235/1351314
function addJS_Node (text, s_URL, funcToRun) {
    var D                                   = document;
    var scriptNode                          = D.createElement ('script');
    scriptNode.type                         = "text/javascript";
    if (text)       scriptNode.textContent  = text;
    if (s_URL)      scriptNode.src          = s_URL;
    if (funcToRun)  scriptNode.textContent  = '(' + funcToRun.toString() + ')(window, jQuery)';

    var targ = D.getElementsByTagName ('head')[0] || D.body || D.documentElement;
    targ.appendChild (scriptNode);
}
