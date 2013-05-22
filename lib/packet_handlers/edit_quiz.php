<?php
	class EditQuizPacketHandler extends RestrictedPacketHandler
	{
		public function run()
		{
			$quiz_id = REST::Get('quiz');
			$title = REST::Get('title');
			$closing = REST::Get('closing');
			$description = REST::Get('description');
			$charity = REST::Get('charity');

			$query = null;

			if ($quiz_id > 0)
			{
				// TODO: Move this into Quiz handler controlled functions
				$query = DB::prepare('UPDATE quizzes SET title = :title, closing = :closing, description = :description, charity = :charity, updated_flag = 4 WHERE ID = :id');
				$query->bindValue(':id', $quiz_id);
			}
			else
			{
				$query = DB::prepare('INSERT INTO quizzes (title, closing, description, charity, accepted) VALUES(:title, :closing, :description, :charity, 1)');
			}

			$query->bindValue(':title', $title);
			$query->bindValue(':closing', $closing);
			$query->bindValue(':description', $description);
			$query->bindValue(':charity', $charity);
			$query->execute();

			if ($quiz_id == 0)
			{
				$query = DB::prepare('SELECT LAST_INSERT_ID() AS ID FROM quizzes');
				$query->execute();

				if ($quiz = $query->fetchObject())
				{
					$this->output['new_id'] = $quiz->ID;
					$this->output['title'] = $title;
				}
			}
		}
	}
?>