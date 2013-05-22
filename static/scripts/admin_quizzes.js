var qaHandler = {
	handleSelectorChange: function()
	{
		var quiz_id = $(this).val();
		if (quiz_id > 0)
		{
			qaHandler.editor.slideUp(400, function()
			{
				PacketHandler.send(Packet.QuizData, {quiz: quiz_id});
			});
		}
		else
		{
			qaHandler.editor.slideUp();
		}
		qaHandler.hideMessage();
	},
	handleQuizData: function(data)
	{
		if (data.quiz != undefined)
		{
			qaHandler.editID = data.quiz.ID;
			qaHandler.editorTitle.html('Edit Quiz: {0} (#{1})'.format(data.quiz.title, data.quiz.ID));
			qaHandler.inputTitle.val(data.quiz.title);
			qaHandler.inputCharity.val(data.quiz.charity);
			qaHandler.inputDescription.val(data.quiz.description);
			qaHandler.inputClosingDate.setDate(data.quiz.closing);
			qaHandler.deleteButton.show();
			qaHandler.editor.slideDown();
		}
	},
	createNew: function()
	{
		qaHandler.editor.slideUp(400, function()
		{
			qaHandler.selector.val(0);
			qaHandler.editID = 0;
			qaHandler.editorTitle.html('Edit Quiz: Untitled Quiz');
			clearFields(qaHandler.inputTitle, qaHandler.inputCharity, qaHandler.inputDescription);
			qaHandler.inputClosingDate.resetValue();
			qaHandler.deleteButton.hide();
			qaHandler.editor.slideDown();
		});
		qaHandler.hideMessage();
	},
	saveChanges: function()
	{
		PacketHandler.send(Packet.EditQuiz, {
			quiz: qaHandler.editID,
			title: qaHandler.inputTitle.val(),
			charity: qaHandler.inputCharity.val(),
			description: qaHandler.inputDescription.val(),
			closing: qaHandler.inputClosingDate.getDateString()
		});
	},
	cancelChanges: function()
	{
		qaHandler.editor.slideUp(400, function() {
			clearFields(qaHandler.inputTitle, qaHandler.inputCharity, qaHandler.inputDescription);
			qaHandler.inputClosingDate.resetValue();
		});
	},
	postSaveChanges: function(data)
	{
		if (data.new_id !== undefined)
		{
			qaHandler.selector.append('<option value="{0}">{1}</option>'.format(data.new_id, data.title));
			qaHandler.showMessage('Quiz created successfully!');
		}
		else
		{
			qaHandler.showMessage('Changes to quiz saved successfully!');
		}

		qaHandler.cancelChanges();
	},
	deleteQuiz: function()
	{
		if (qaHandler.editID !== null)
			PacketHandler.send(Packet.DeleteQuiz, {quiz: qaHandler.editID});
	},
	postDeleteQuiz: function(data)
	{
		if (data.quiz !== undefined)
		{
			qaHandler.selector.children('option[value=\'{0}\']'.format(data.quiz)).remove();
			qaHandler.showMessage('Quiz deleted successfully');
			qaHandler.cancelChanges();
		}
	},
	showMessage: function(message)
	{
		qaHandler.status.html(message);
		qaHandler.status.slideDown();
	},
	hideMessage: function()
	{
		qaHandler.status.slideUp();
	}
};

$(document).ready(function()
{
	qaHandler.selector = $('#quiz-selector');
	qaHandler.editor = $('#quiz-editor');
	qaHandler.editorTitle = $('#quiz-editor-title');
	qaHandler.inputTitle = $('#quiz-title');
	qaHandler.inputCharity = $('#quiz-charity');
	qaHandler.inputDescription = $('#quiz-description');
	qaHandler.status = $('#acp-quiz-status');
	qaHandler.deleteButton = $('#quiz-delete-button');

	qaHandler.editID = 0;
	$(document).on('click', '#quiz-save-button', qaHandler.saveChanges);
	$(document).on('click', '#quiz-cancel-button', qaHandler.cancelChanges);
	$(document).on('click', '#quiz-delete-button', qaHandler.deleteQuiz);

	qaHandler.inputClosingDate = new Date().createSelector($('#quiz-closing-date'), 4, 0);
	$(document).on('click', '#quiz-new-button', qaHandler.createNew);

	qaHandler.selector.change(qaHandler.handleSelectorChange);
	PacketHandler.hook(Packet.QuizData, qaHandler.handleQuizData);
	PacketHandler.hook(Packet.EditQuiz, qaHandler.postSaveChanges);
	PacketHandler.hook(Packet.DeleteQuiz, qaHandler.postDeleteQuiz);
});