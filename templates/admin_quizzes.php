<script type="text/javascript" src="http://static.fundraisingquizzes.net/scripts/admin_quizzes.js"></script>
<div class="module module-padded">
	<h1>Quiz Management</h1>
	<div id="acp-quiz-list">
		<div id="acp-quiz-status"></div>
		<?php
			if ($this->quizList !== null)
			{
					?>
					Select a quiz to edit:
					<select id="quiz-selector" class="form-selector">
						<option value="0" selected>None selected</option>
						<?php
							foreach ($this->quizList as $quiz)
								echo sprintf('<option value="%s">%s</option>', $quiz->ID, $quiz->title);
						?>
					</select> <a id="quiz-new-button">Create new quiz</a>
					<?php
			}
			else
			{
				?><div>There was an error generating a list of quizzes on the site.</div><?php
			}
		?>
	</div>
</div>
<div class="module module-padded" id="quiz-editor">
	<h1 id="quiz-editor-title"></h1>
	<table id="quiz-editor-table" class="form-table">
		<tr>
			<th>Title:</th>
			<td><input type="text" class="form-text-input form-text-input-long" id="quiz-title" maxlength="100"/></td>
		</tr>
		<tr>
			<th>Charity:</th>
			<td><input type="text" class="form-text-input form-text-input-long" id="quiz-charity" maxlength="100"/></td>
		</tr>
		<tr>
			<th>Description:</th>
			<td><input type="text" class="form-text-input form-text-input-long" id="quiz-description" maxlength="500"/></td>
		</tr>
		<tr>
			<th>Closing Date:</th>
			<td><div id="quiz-closing-date"></div></td>
		</tr>
		<tr>
			<th></th>
			<td>
				<input type="button" id="quiz-save-button" class="form-button" value="Save Changes"/>
				<input type="button" id="quiz-cancel-button" class="form-button" value="Cancel Changes"/>
				<input type="button" id="quiz-delete-button" class="form-button" value="Delete Quiz"/>
			</td>
		</tr>
	</table>
</div>