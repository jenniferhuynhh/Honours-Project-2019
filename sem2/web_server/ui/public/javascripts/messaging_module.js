var MessagingModule = (function() {
	//Private
	var ftms_ui;
	var display;
	var messages;
	//var message_sound;

	//Public
	return {
		initialise: function(ftms) {
			//Link FTMS UI system
			ftms_ui = ftms;

			//Create div for elements to sit in
			display = document.createElement("div");
			display.classList.add('messaging_module');

			//Adding audio 
			message_sound = new Audio('public/resources/messages.mp3');

			//Create messaging module elements
			var messages_td = document.createElement("td");
			messages_td.colSpan = 2;
			messages = document.createElement("div");
			messages.classList.add('messages_box');
			messages_td.appendChild(messages);

			var message_textbox_td = document.createElement("td");
			message_textbox_td.classList.add('message_textbox_td');
			message_textbox = document.createElement("input");
			message_textbox.classList.add('message_textbox');
			message_textbox.setAttribute("type", "textbox");
			message_textbox.setAttribute("id", "text");
			message_textbox.setAttribute("placeholder", "Type your message here");
			message_textbox_td.appendChild(message_textbox);

			var send_button_td = document.createElement("td");
			send_button = document.createElement("input");
			send_button.classList.add('send_button');
			send_button.setAttribute("type", "submit");
			send_button.setAttribute("value", "Send");
			send_button_td.appendChild(send_button);

			var form = document.createElement("form"); //Containing this in a form lets hitting 'enter' send the message
			form.style.height = "100%";
			var table = document.createElement("table");
			table.classList.add('messaging_table');
			var row1 = document.createElement("tr");
			var row2 = document.createElement("tr");
			row2.classList.add('input_row');

			row1.appendChild(messages_td);
			row2.appendChild(message_textbox_td);
			row2.appendChild(send_button_td);
			table.appendChild(row1);
			table.appendChild(row2);
			form.appendChild(table);
			display.appendChild(form);

			//Submit new message
			send_button.addEventListener('click', function(event) {
				event.preventDefault(); //Prevents page reloading
				ftms_ui.event_manager.sendMessage(message_textbox.value);
				message_textbox.value = '';
			});

			//Send username to server
			var username;
			switch(getCookie("role")) {
				case "ts": username = "Track Supervisor";
						   break;
				case "wo": username = "Warfare Officer";
						   break;
				case "fs": username = "Firing Officer";
						   break;
			}
			ftms_ui.event_manager.userConnect(username, getCookie("role"));

			ftms_ui.window_manager.appendToWindow('Messaging Module', display);
		},

		onConnect: function(username) {
			this.displayMessage('🔵 <i>' + username + ' joined the chat.</i>'); //😭
			if(ftms_ui.settings_manager.getSetting("audio_on")) message_sound.play();
		},

		onDisconnect: function(username) {
			this.displayMessage('🔴 <i>' + username + ' left the chat.</i>');
			if(ftms_ui.settings_manager.getSetting("audio_on")) message_sound.play();
		},
		
		onMessage: function(username, message) {
			this.displayMessage('<strong>' + username + '</strong>: ' + message);
			if(ftms_ui.settings_manager.getSetting("audio_on")) message_sound.play();
		},

		displayMessage: function(message) {
			var new_msg = document.createElement("p");
			new_msg.classList.add("msg");
			new_msg.innerHTML = message;
			messages.appendChild(new_msg);
			messages.scrollTop = messages.scrollHeight; //Scroll to bottom of chat feed on new message
		}
	}
}());
