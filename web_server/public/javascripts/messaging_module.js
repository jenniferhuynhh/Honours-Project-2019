function MessagingModule() {
	this.ftms_ui;
	this.display;
	this.form;
	this.message_box;
	this.messages;
	this.socket;

	//Declares track types/domains/affilitations and generates display elements
	this.initialise = function(ftms_ui) {
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//Create div for elements to sit in
		this.display = document.createElement("div");
		this.display.classList.add('class', 'messaging_module');
		this.display.classList.add('class', 'scrollable');

		this.form = document.createElement("form");
		this.messages = document.createElement("div");
		this.message_box = document.createElement("input");
		this.message_box.setAttribute("type", "textbox");
		this.message_box.setAttribute("id", "text");
		var sendButton = document.createElement("input");
		sendButton.setAttribute("type", "submit");

		this.form.appendChild(this.messages);
		this.form.appendChild(this.message_box);
		this.form.appendChild(sendButton);
		this.display.appendChild(this.form);

		//Socket config
		this.socket = io();
		// submit text message without reload/refresh the page
		var self = this;
		this.form.addEventListener('submit', function(event) {
			event.preventDefault(); //Prevents page reloading
			self.socket.emit('chat_message', self.message_box.value);
			self.message_box.value = '';
		});
		// append the chat text message
		this.socket.on('chat_message', function(msg){self.displayMessage(msg)});

		// append text if someone is online
		this.socket.on('is_online', function(username) {
			self.displayMessage('🔵 <i>' + username + ' joined the chat.</i>');
		});
		this.socket.on('is_offline', function(username) {
			self.displayMessage('🔴 <i>' + username + ' left the chat.</i>');
		});
		// ask username
		var roles = ['Track Supervisor', 'Warfare Officer', 'Firing Officer'];
		var username = roles[randomInt(0, roles.length)];
		this.socket.emit('username', username);

		this.ftms_ui.window_manager.appendToWindow('Messaging Module', this.display);
	}

	this.sendMessage = function() {
		this.socket.emit('chat_message', this.message_box.value);
	}

	this.displayMessage = function(msg) {
		var new_msg = document.createElement("p");
		new_msg.innerHTML = msg;
		//new_msg.appendChild(document.createTextNode(msg));
		this.messages.appendChild(new_msg);
	}
}