// small helper function for selecting element by id
let id = id => document.getElementById(id);

//Establish the WebSocket connection and set up event handlers
let ws = new WebSocket("ws://" + location.hostname + ":" + location.port + "/chat");
ws.onmessage = msg => updateChat(msg);
ws.onclose = () => alert("WebSocket connection closed");

(function(){

  var chat = {
    messageToSend: '',
    init: function() {
      this.cacheDOM();
      this.bindEvents();
    },
    cacheDOM: function() {
      this.$chatHistory = $('.chat-history');
      this.$button = $('button');
      this.$textarea = $('#message-to-send');
      this.$chatHistoryList =  this.$chatHistory.find('ul');
    },
    bindEvents: function() {
      this.$button.on('click', this.addMessage.bind(this));
      this.$textarea.on('keyup', this.addMessageEnter.bind(this));
    },

    addMessage: function() {
      this.messageToSend = this.$textarea.val()
      if (this.messageToSend !== "") {
        ws.send(this.messageToSend);
      }
    },
    addMessageEnter: function(event) {
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
    },

  };

  chat.init();

})();

function updateChat(msg) { // Update chat-panel and list of connected users
    let data = JSON.parse(msg.data);

    id("userlist").innerHTML = data.userlist.map(user => "<li>" + user + "</li>").join("");

    if(data.sender.localeCompare(data.self) == 0){
        var template = Handlebars.compile( $("#message-template").html());
        var context = {
          messageOutput: data.userMessage,
          time: new Date(),
          sender: data.sender,
        };
        $('.chat-history').find('ul').append(template(context));

    }else{
        var templateResponse = Handlebars.compile( $("#message-response-template").html());
        var contextResponse = {
          response: data.userMessage,
          time: new Date(),
          sender: data.sender,
        };

        $('.chat-history').find('ul').append(templateResponse(contextResponse));


    }

    id('message-to-send').value='';
    scrollToBottom();
}

function scrollToBottom() {
    $('.chat-history').scrollTop($('.chat-history')[0].scrollHeight);
}