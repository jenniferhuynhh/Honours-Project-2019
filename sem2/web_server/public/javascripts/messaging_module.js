function MessagingModule() {
	this.ftms_ui;
	this.display;
	this.messages;
	this.message_textbox;
	this.send_button;
	this.socket;

	//Declares track types/domains/affilitations and generates display elements
	this.initialise = function(ftms_ui) {
		//Link FTMS UI system
		this.ftms_ui = ftms_ui;

		//Create div for elements to sit in
		this.display = document.createElement("div");
		this.display.classList.add('messaging_module');

		//Create messaging module elements
		this.messages = document.createElement("td");
		this.messages.colSpan = 2;
		this.messages.classList.add('messages_box');

		var message_textbox_td = document.createElement("td");
		message_textbox_td.classList.add('message_textbox_td');
		this.message_textbox = document.createElement("input");
		this.message_textbox.classList.add('message_textbox');
		this.message_textbox.setAttribute("type", "textbox");
		this.message_textbox.setAttribute("id", "text");
		this.message_textbox.setAttribute("placeholder", "Type your message here");
		message_textbox_td.appendChild(this.message_textbox);

		var send_button_td = document.createElement("td");
		this.send_button = document.createElement("input");
		this.send_button.classList.add('send_button');
		this.send_button.setAttribute("type", "submit");
		this.send_button.setAttribute("value", "Send");
		send_button_td.appendChild(this.send_button);

		var form = document.createElement("form");
		form.style.height = "100%";
		var table = document.createElement("table");
		table.classList.add('messaging_table');
		var row1 = document.createElement("tr");
		row1.style.height = "100%";
		var row2 = document.createElement("tr");
		row2.classList.add('input_row');

		row2.appendChild(message_textbox_td);
		row2.appendChild(send_button_td);
		row1.appendChild(this.messages);
		table.appendChild(row1);
		table.appendChild(row2);
		form.appendChild(table);
		this.display.appendChild(form);

		this.ftms_ui.window_manager.appendToWindow('Messaging Module', this.display);

		//Socket config
		this.socket = io();

		//Submit new message
		var self = this;
		this.send_button.addEventListener('click', function(event) {
			event.preventDefault(); //Prevents page reloading
			self.socket.emit('chat_message', self.message_textbox.value);
			self.message_textbox.value = '';
		});

		//Show new message
		this.socket.on('chat_message', function(username, message) {
			self.displayMessage('<strong>' + username + '</strong>: ' + message)
		});

		//Show log/logoff messages
		this.socket.on('is_online', function(username) {
			self.displayMessage('🔵 <i>' + username + ' joined the chat.</i>'); //😭
		});

		this.socket.on('is_offline', function(username) {
			self.displayMessage('🔴 <i>' + username + ' left the chat.</i>');
		});

		//Randomly select username
		var roles = ['Track Supervisor', 'Warfare Officer', 'Firing Officer'];
		var username = roles[randomInt(0, roles.length)];
		this.socket.emit('username', username);
	}

	//Sends a chat message to server
	this.sendMessage = function() {
		this.socket.emit('chat_message', this.message_textbox.value);
	}

	//Appends a message to the bottom of the chat box and scrolls to bottom of chat box
	this.displayMessage = function(msg) {
		var new_msg = document.createElement("p");
		new_msg.classList.add("msg");
		new_msg.innerHTML = msg;
		this.messages.appendChild(new_msg);
		this.messages.scrollTop = this.messages.scrollHeight; //Scroll to bottom of chat feed on new message
	}
}