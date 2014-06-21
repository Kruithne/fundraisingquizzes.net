<div class="module module-padded" id="register-left">
	<h1>Account Creation</h1>
	<p class="center" id="status">Creating an account is simple, fill out the form below and hit register!</p>
	<form id="register-form" class="validatable preventDefault" complete="regFormSuccess" submit="regFormSubmit" error="regFormErrors">
		<table id="register-table">
			<tr>
				<th>Username:</th>
				<td><input type="text" class="input-text" id="reg-username" require="true" maxlength="20" validate="^[a-zA-Z0-9_]{4,}$"/></td>
			</tr>
			<tr>
				<th>E-mail Address:</th>
				<td><input type="text" class="input-text" id="reg-email" require="true" validate="email" maxlength="100"/></td>
			</tr>
			<tr>
				<th>Password:</th>
				<td><input type="password" class="input-text" id="reg-password" require="true"/></td>
			</tr>
			<tr>
				<th>Re-type Password:</th>
				<td><input type="password" class="input-text" id="reg-password-confirm" require="true" validate="password" field="reg-password"/></td>
			</tr>
			<tr>
				<td colspan="2" class="footer">
					<input type="button" id="register-button" class="input-button" value="Register Account"/>
					<input type="button" id="reset-button" class="input-button" value="Reset Form"/>
				</td>
			</tr>
		</table>
	</form>
</div>
<div class="module module-padded" id="register-right">
	<ul id="feature-list">
		<li class="feature-quizzes">A feature-rich quiz listing with bookmarking, voting, query viewing/posting and more!</li>
		<li class="feature-forum">Participate in one of the best quizzing communities on the internet dedicated to raising funds for charity!</li>
		<li class="feature-answers">Our site revolves around our popular no-answer policy to ensure a fairer chance for everyone.</li>
	</ul>
</div>
<div class="float-block"></div>