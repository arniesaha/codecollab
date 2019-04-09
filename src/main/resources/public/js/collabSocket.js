function setupWebSocket() {

    const textArea = document.querySelector("textarea");
    const ws = new WebSocket(`ws://localhost:7070/docs/${window.location.hash.substr(1)}`);
    textArea.onkeyup = () => ws.send(textArea.value);
    ws.onmessage = msg => {
        console.log("typing");
        const offset = msg.data.length - textArea.value.length;
        const selection = {start: textArea.selectionStart, end: textArea.selectionEnd};
        const startsSame = msg.data.startsWith(textArea.value.substring(0, selection.end));
        const endsSame = msg.data.endsWith(textArea.value.substring(selection.start));
        textArea.value = msg.data;
        if (startsSame && !endsSame) {
            textArea.setSelectionRange(selection.start, selection.end);
        } else if (!startsSame && endsSame) {
            textArea.setSelectionRange(selection.start + offset, selection.end + offset);
        } else { // this is what google docs does...
            textArea.setSelectionRange(selection.start, selection.end + offset);
        }
    };
    ws.onclose = setupWebSocket; // should reconnect if connection is closed

}

//function() {
//  document.querySelector('textarea[data-editor]').each(function() {
//    var textarea = $(this);
//    var mode = textarea.data('editor');
//    var editDiv = $('<div>', {
//      position: 'absolute',
//      width: textarea.width(),
//      height: textarea.height(),
//      'class': textarea.attr('class')
//    }).insertBefore(textarea);
//    textarea.css('display', 'none');
//    var editor = ace.edit(editDiv[0]);
//    editor.renderer.setShowGutter(textarea.data('gutter'));
//    editor.getSession().setValue(textarea.val());
//    editor.getSession().setMode("ace/mode/" + mode);
//    editor.setTheme("ace/theme/idle_fingers");
//
//    // copy back to textarea on form submit...
//    textarea.closest('form').submit(function() {
//      textarea.val(editor.getSession().getValue());
//    })
//  });
//}


