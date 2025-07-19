<div class="module module-padded">
	<h1>Password Reset</h1>
	<p>This is the final step to regaining access to your account again! Simply type in a new password in the fields below and hit enter!</p>
	<p id="reset-error" class="form-error">This is some kind of error.</p>
	<form class="validatable preventDefault" complete="resetComplete" error="resetError" submit="resetSubmit">
		<table class="form-table" id="reset-form">
			<tr>
				<th>Password:</th>
				<td><input type="password" id="reset-password" class="input-text" require="true"/></td>
			</tr>
			<tr>
				<th>Re-type Password:</th>
				<td><input type="password" id="reset-password-check" class="input-text" require="true" validate="password" field="reset-password"/></td>
			</tr>
			<tr>
				<td class="footer" colspan="2">
					<input type="hidden" id="reset-key" value="<?php echo $this->key; ?>"/>
					<input type="submit" value="Change Password" class="input-button"/>
				</td>
			</tr>
		</table>
	</form>
</div>