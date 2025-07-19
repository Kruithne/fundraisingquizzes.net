$(function() {
	var now = new Date();

	if (now.getDate() == 20 && now.getMonth() == 3) {
		var thing = $("<div/>").attr("id", "birdir").addClass("module module-padded").text("Happy birthday to our founder, Oddboddy!");
		thing.insertAfter($("#header"));
	}
});