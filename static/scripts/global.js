// Function created by fearphage from stackoverflow.com
// http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.prototype.format)
{
	String.prototype.format = function()
	{
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number)
		{
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

if (!Math.neg)
{
	Math.neg = function(number)
	{
		return Math.abs(number) * -1;
	};
}

function clearFields()
{
	for (var i = 0; i < arguments.length; i++)
	{
		var obj = arguments[i];
		if (!obj.jquery)
			obj = $(obj);

		obj.val('');
	}
}

Date.prototype.daysInMonth = function(month, year)
{
	return new Date(year, month, 0).getDate();
};

Date.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
Date.getMonthName = function(month)
{
	return this.months[month - 1];
};

Date.getPrefix = function(day)
{
	if (day < 11 || day > 13)
	{
		day = day.toString();
		var number = (day.length > 1 ? day[1] : day[0]);

		switch (number)
		{
			case '1': return 'st'; break;
			case '2': return 'nd'; break;
			case '3': return 'rd'; break;
		}
	}
	return 'th';
};

Date.getFormattedFromString = function(date)
{
	date = this.parseSQLDateString(date);
	return "{0}{1} {2} {3}".format(date[0], Date.getPrefix(date[0]), Date.getMonthName(date[1]), date[2]);
};

Date.parseSQLDateString = function(dateString)
{
	var split = dateString.split('-');

	if (split[1][0] == '0')
		split[1] = split[1][1];

	return [parseInt(split[2]), parseInt(split[1]), parseInt(split[0])];
};

Date.prototype.createSelector = function(object, yearsForward, yearsBackward)
{
	var selector_id = object.attr('ID');

	this.daySelector = $('<select class="form-selector" id="{0}_day"></select>'.format(selector_id));
	this.monthSelector = $('<select class="form-selector" id="{0}_month"></select>'.format(selector_id));
	this.yearSelector = $('<select class="form-selector" id="{0}_year"></select>'.format(selector_id));

	for (var i = 0; i < Date.months.length; i++)
		this.monthSelector.append('<option value="{0}">{1}</option>'.format(i + 1, Date.months[i]));

	var currentYear = this.getFullYear();
	for (var y = currentYear - yearsBackward; y < currentYear + yearsForward; y++)
		this.yearSelector.append('<option value="{0}">{0}</option>'.format(y));

	var thing = this;

	this.updateSelector = function()
	{
		var current = thing.daySelector.val(),
			days = thing.daysInMonth(parseInt(thing.monthSelector.val()), thing.yearSelector.val()) + 1;

		thing.daySelector.empty();
		for (var i = 1; i < days; i++)
			thing.daySelector.append('<option value="{0}">{0}</option>'.format(i));

		if (days - 1 < current)
			current = days - 1;

		thing.daySelector.val(current);
	};

	this.setDay = function(day) { thing.daySelector.val(day); };
	this.setMonth = function(month) { thing.monthSelector.val(month); };
	this.setYear = function(year) { thing.yearSelector.val(year); };

	this.setDate = function (dateString)
	{
		var parsedDate = Date.parseSQLDateString(dateString);
		thing.setYear(parsedDate[2]);
		thing.setMonth(parsedDate[1]);
		thing.setDay(parsedDate[0]);
	};

	this.getDateString = function()
	{
		var month = thing.monthSelector.val();
		if (month.length < 2) month = "0" + month;

		var day = thing.daySelector.val();
		if (day.length < 2) day = "0" + day;

		return "{0}-{1}-{2}".format(thing.yearSelector.val(), month, day);
	};

	this.resetValue = function()
	{
		thing.setYear(new Date().getFullYear());
		thing.setMonth(0);
		thing.setDay(1);
	};

	this.monthSelector.change(this.updateSelector);
	this.yearSelector.change(this.updateSelector);
	this.updateSelector();

	object.append(this.daySelector, this.monthSelector, this.yearSelector);

	return this;
};

$(document).ready(function()
{
	$('span.date').each(function()
	{
		var t = $(this);
		t.html(Date.getFormattedFromString(t.html()));
	});
});