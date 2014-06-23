<div id="settings-page">
	<div class="module" id="options">
		<ul>
			<li id="option-info" class="active" panel="panel-details">Account Details</li>
			<li id="option-avatar" panel="panel-avatar">Avatar</li>
			<?php
				if (Authenticator::isLoggedInAsAdmin())
				{
					?>
					<li id="option-graveyard" panel="panel-graveyard">Quiz Graveyard</li>
					<?php
				}
			?>
		</ul>
	</div>
	<div class="module module-padded settings-panel" id="panel-details">
		<h1 id="panel-header-details">Account Details: <?php echo $this->user->getUsername(); ?></h1>
		<table class="form-table">
			<tr>
				<th>Username:</th>
				<td><?php echo $this->user->getUsername(); ?></td>
			</tr>
			<tr>
				<th>E-mail Address:</th>
				<td><?php echo $this->user->getEmailAddress(); ?></td>
			</tr>
			<tr>
				<th>Password:</th>
				<td class="field-hidden">Hidden</td>
			</tr>
			<tr>
				<th>Registered:</th>
				<td><span class="time-period"><?php echo $this->user->getJoined(); ?></span> (<span class="time-formal"><?php echo $this->user->getJoined(); ?></span>)</td>
			</tr>
		</table>
	</div>
	<div class="module module-padded settings-panel" id="panel-avatar">
		<h1 id="panel-header-avatar">Change Your Avatar</h1>
		<p>Stuff about changing avatar</p>
	</div>
	<?php
		if (Authenticator::isLoggedInAsAdmin())
		{
			?>
			<div class="module module-padded settings-panel" id="panel-graveyard">
				<h1 id="panel-header-graveyard">Quiz Graveyard</h1>
				<?php
					/** @var Quiz $quiz */
					foreach ($this->deleted_quizzes as $quiz)
						echo '<p id="' . $quiz->getId() . '">' . $quiz->getTitle() . ' in aid of ' . $quiz->getCharity() . ' <a>[Restore]</a></p>';
				?>
			</div>
			<?php
		}
	?>
</div>