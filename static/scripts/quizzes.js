var quizzes = {
	bookmarks: {},
	votes: {},
	MAX_VOTES: 3,
	voteObjects: {
		voted: '<div class="quiz-option-voted" tooltip="You have voted for this quiz"/>',
		disabled: '<div class="quiz-option-vote-disabled" tooltip="You have no more votes left"/>',
		vote: '<div class="quiz-option-vote" tooltip="Vote for this quiz"/>',
		selector: '.quiz-option-voted, .quiz-option-vote, .quiz-option-vote-disabled'
	},
	bookmarkObjects: {
		bookmarked: '<div class="quiz-option-bookmark" tooltip="Un-bookmark this quiz"></div>',
		unbookmarked: '<div class="quiz-option-bookmark" tooltip="Bookmark this quiz"></div>',
		disabled: '<div class="quiz-option-bookmark-disabled" tooltip="You must log-in to bookmark"></div>'
	}
};

quizzes.quiz_format = '<p><span class="bold-text">{0}</span> in aid of <span class="bold-text">{1}</span> - Closes: {3}</p><p>{2}</p>';

quizzes.handleBookmarkResponse = function(data)
{
	if (data.bookmarks !== null)
		quizzes.bookmarks = data.bookmarks;

	PacketHandler.send(Packet.QuizList);
};

quizzes.handleQuizListResponse = function(data)
{
	quizzes.loading_message.hide();
	if (data.quizzes !== undefined)
	{
		for (var dataPointer in data.quizzes)
		{
			var quiz = data.quizzes[dataPointer],
				isBookmarked = $.inArray(quiz.ID, quizzes.bookmarks) > -1,
				holder = (isBookmarked ? quizzes.bookmarked_quiz_list : quizzes.quiz_list),
				quizObject = $('<div class="module module-padded center-align quiz-list-quiz"/>').appendTo(holder);

			quizObject.html(
				quizzes.quiz_format.format(
					quiz.title,
					quiz.charity,
					quiz.description,
					Date.getFormattedFromString(quiz.closing)
				)
			);
			quizObject.attr('ID', 'quiz-' + quiz.ID);
			quizObject.attr('quizID', quiz.ID);

			var quizFlags = $('<div class="quiz-flags"/>').appendTo(quizObject);

			if (quiz.new_flag > 0)
				$('<div class="quiz-flag-new"/>').appendTo(quizFlags).attr('tooltip', 'New!');

			if (quiz.updated_flag > 0)
				$('<div class="quiz-flag-updated"/>').appendTo(quizFlags).attr('tooltip', 'Updated!');

			var quizOptions = $('<div class="quiz-options"/>').appendTo(quizObject);

			if (userLoggedIn)
			{
				quizOptions.append((isBookmarked ? quizzes.bookmarkObjects.bookmarked : quizzes.bookmarkObjects.unbookmarked));
			}
			else
			{
				quizOptions.append(quizzes.bookmarkObjects.disabled);
				$(quizzes.voteObjects.disabled).appendTo(quizOptions).attr('tooltip', 'You must log-in to vote');
			}
		}

		if (userLoggedIn)
			PacketHandler.send(Packet.Votes);
	}
	// TODO: Handle undefined error.
};

quizzes.voteQuiz = function()
{
	var quizID = $(this).parent().parent().attr('quizID');
	if (quizzes.votes.length < quizzes.MAX_VOTES && $.inArray(quizID, quizzes.votes) == -1)
		PacketHandler.send(Packet.VoteQuiz, {quiz: quizID});
};

quizzes.handleVoteQuizResponse = function(data)
{
	if (data.result != undefined)
	{
		switch (data.result)
		{
			case 1: quizzes.setQuizAsVoted(data.quiz); break;

			case 2: quizzes.disableVoting(); break;

			default:
				// TODO: Handle errors here.
			break;
		}
	}
};

quizzes.disableVoting = function()
{
	$('.quiz-option-vote').each(function()
	{
		var t = $(this), h = t.parent();
		t.remove();
		h.append(quizzes.voteObjects.disabled);
	});
};

quizzes.setQuizAsVoted = function(quizID)
{
	var o = $('#quiz-' + quizID).children('.quiz-options');
	o.children(quizzes.voteObjects.selector).remove();
	o.append(quizzes.voteObjects.voted);

	quizzes.votes.push(quizID);

	if (quizzes.votes.length >= quizzes.MAX_VOTES)
		quizzes.disableVoting();
};

quizzes.bookmarkQuiz = function()
{
	var quizID = $(this).parent().parent().attr('quizID');
	PacketHandler.send(Packet.BookmarkQuiz, {quiz: quizID});
};

quizzes.moveQuizToBookmarks = function(quiz_id)
{
	var quiz_object = $('#quiz-' + quiz_id);
	quiz_object.appendTo(quizzes.bookmarked_quiz_list);
	quiz_object.children('.quiz-option-bookmark').attr('tooltip', 'Un-bookmark this quiz');
};

quizzes.removeQuizFromBookmarks = function(quiz_id)
{
	var quiz_object = $('#quiz-' + quiz_id);
	quiz_object.appendTo(quizzes.quiz_list);
	quiz_object.children('.quiz-option-bookmark').attr('tooltip', 'Bookmark this quiz');
};

quizzes.handleBookmarkQuizResponse = function(data)
{
	if (data.result !== undefined)
	{
		switch (data.result)
		{
			case 1: quizzes.removeQuizFromBookmarks(data.quiz); break;
			case 2: quizzes.moveQuizToBookmarks(data.quiz); break;
			default: console.log('We should error here'); break;
		}
	}
	// TODO: Error if we get undefined.
};

quizzes.handleVotesResponse = function(data)
{
	if (data.votes != undefined)
	{
		quizzes.votes = data.votes;

		$('.quiz-list-quiz').each(function()
		{
			var t = $(this), qID = t.attr('quizID'), quizOptions = t.children('.quiz-options');

			if ($.inArray(qID.toString(), quizzes.votes) > -1)
			{
				$(quizzes.voteObjects.voted).appendTo(quizOptions);
			}
			else
			{
				if (quizzes.votes.length >= quizzes.MAX_VOTES)
					$(quizzes.voteObjects.disabled).appendTo(quizOptions);
				else
					$(quizzes.voteObjects.vote).appendTo(quizOptions);
			}
		});
	}
};

$(document).ready(function()
{
	quizzes.loading_message = $('#quizzes-loading-notice');
	quizzes.quiz_list = $('#quizzes-list');
	quizzes.bookmarked_quiz_list = $('#bookmarked-quizzes-list');

	PacketHandler.hook(Packet.QuizList, quizzes.handleQuizListResponse);
	PacketHandler.hook(Packet.Bookmarks, quizzes.handleBookmarkResponse);
	PacketHandler.hook(Packet.BookmarkQuiz, quizzes.handleBookmarkQuizResponse);
	PacketHandler.hook(Packet.Votes, quizzes.handleVotesResponse);
	PacketHandler.hook(Packet.VoteQuiz, quizzes.handleVoteQuizResponse);

	if (userLoggedIn)
		PacketHandler.send(Packet.Bookmarks);
	else
		PacketHandler.send(Packet.QuizList);

	$(document).on('click', '.quiz-option-bookmark', quizzes.bookmarkQuiz);
	$(document).on('click', '.quiz-option-vote', quizzes.voteQuiz);
});