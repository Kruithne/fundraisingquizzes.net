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
					<li id="option-broadcast" panel="panel-broadcast">Broadcast</li>
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
				<td id="email-address"><?php echo $this->user->getEmailAddress(); ?></td>
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
		<h2>Change E-mail Address</h2>
		<form class="validatable preventDefault" error="changeEmailError" complete="changeEmailSuccess">
			<p class="error-field" id="email-error"></p>
			<table class="form-table">
				<tr>
					<th>Current Password:</th>
					<td><input type="password" class="input-text  current-password" require="true"/></td>
				</tr>
				<tr>
					<th>New E-mail Address:</th>
					<td><input type="text" class="input-text" id="new-email" validate="email" require="true"/> <input type="submit" class="input-button" value="Change"/></td>
				</tr>
			</table>
		</form>
		<h2>Change Password</h2>
		<form class="validatable preventDefault" error="changePasswordError" complete="changePasswordSuccess">
			<p class="error-field" id="password-error"></p>
			<table class="form-table">
				<tr>
					<th>Current Password:</th>
					<td><input type="password" require="true" class="input-text current-password"/></td>
				</tr>
				<tr>
					<th>New Password:</th>
					<td><input type="password" require="true" class="input-text" id="new-pass"/></td>
				</tr>
				<tr>
					<th>Re-type Password:</th>
					<td><input type="password" require="true" class="input-text" id="new-pass-confirm" validate="password" field="new-pass"/></td>
				</tr>
				<tr>
					<td colspan="2" class="footer"><input type="submit" class="input-button" value="Change Password"/></td>
				</tr>
			</table>
		</form>
		<h2>Change Forum Signature</h2>
		<p class="signature-tip">Tip: If you leave the field blank and hit change, it will remove your signature!</p>
		<table class="form-table">
			<tr>
				<th>Signature:</th>
				<td><input type="text" class="input-text" id="signature" value="<?php echo Authenticator::getLoggedInUser()->getSignature(); ?>"/> <input type="button" class="input-button" id="signature-button" value="Change"/></td>
			</tr>
		</table>
	</div>
	<div class="module module-padded settings-panel" id="panel-avatar">
		<h1 id="panel-header-avatar">Change Your Avatar</h1>
		<p>Changing your avatar is easy, simply click on the one below which you like the look of!</p>
		<div id="avatar-selector">
			<?php
				foreach ($this->avatars as $avatar_id => $avatar_image)
				{
					$class = $avatar_id == $this->user->getAvatar() ? ' class="selected"' : '';
					echo "<img id=\"$avatar_id\" src=\"http://static.fundraisingquizzes.net/images/avatars/$avatar_image\"$class/>";
				}
			?>
		</div>
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
			<div class="module module-padded settings-panel" id="panel-broadcast">
				<h1 id="panel-header-broadcast">Broadcast</h1>
				<p>Broadcast a message that will display at the top of the site.</p>
				<input type="text" class="input-text" id="broadcast-field" value="<?php echo Settings::get('broadcast'); ?>"/> <input type="button" class="input-button" id="broadcast-button" value="Broadcast"/>
			</div>
			<?php
		}
	?>
</div>