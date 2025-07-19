var timeMachine =
{
	minute: 60,
	hour: 3600,
	day: 86400,
	week: 604800,
	month: 2419200,
	year: 29030400,
	negMinute: -60,
	negHour: -3600,
	negDay: -86400,
	negWeek: -604800,
	negMonth: -2419200,
	negYear: -29030400,
	monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
};

timeMachine.divide = function(difference, period)
{
	return Math.floor(difference / period);
};

timeMachine.suffix = function(day)
{
	var j = day % 10;
	if (j == 1 && day != 11)
		return day + "st";

	if (j == 2 && day != 12)
		return day + "nd";

	if (j == 3 && day != 13)
		return day + "rd";

	return day + "th";
};

timeMachine.sqlToDate = function(date)
{
	return new Date(date * 1000);
};

timeMachine.getFormalDateString = function(date)
{
	return timeMachine.dayNames[date.getDay()] + " " + timeMachine.suffix(date.getDate()) + " " + timeMachine.monthNames[date.getMonth()] + " " + date.getFullYear();
};

timeMachine.getFormalTimePeriod = function(date)
{
	var difference = (date.getTime() - new Date().getTime()) / 1000, value = 0, text;

	switch (true)
	{
		case difference > timeMachine.year:
			value = timeMachine.divide(difference, timeMachine.year);
			text = 'year';
			break;

		case difference > timeMachine.month:
			value = timeMachine.divide(difference, timeMachine.month);
			text = 'month';
			break;

		case difference > timeMachine.week:
			value = timeMachine.divide(difference, timeMachine.week);
			text = 'week';
			break;

		case difference > timeMachine.day:
			value = timeMachine.divide(difference, timeMachine.day);
			text = 'day';
			break;

		case difference > timeMachine.hour:
			value = timeMachine.divide(difference, timeMachine.hour);
			text = 'hour';
			break;

		case difference > timeMachine.minute:
			value = timeMachine.divide(difference, timeMachine.minute);
			text = 'minute';
			break;

		case difference < timeMachine.minute && difference > 0:
			return 'less than a minute';
			break;

		case difference > timeMachine.negMinute && difference < 0:
			return 'less than a minute ago';
			break;

		case difference > timeMachine.negHour:
			value = timeMachine.divide(difference, timeMachine.negMinute);
			text = 'minute';
			break;

		case difference > timeMachine.negDay:
			value = timeMachine.divide(difference, timeMachine.negHour);
			text = 'hour';
			break;

		case difference > timeMachine.negWeek:
			value = timeMachine.divide(difference, timeMachine.negDay);
			text = 'day';
			break;

		case difference > timeMachine.negMonth:
			value = timeMachine.divide(difference, timeMachine.negWeek);
			text = 'week';
			break;

		case difference > timeMachine.negYear:
			value = timeMachine.divide(difference, timeMachine.negMonth);
			text = 'month';
			break;

		case difference < timeMachine.negYear:
			value = timeMachine.divide(difference, timeMachine.negYear);
			text = 'year';
			break;
	}

	if (value > 1)
		text += 's';

	return value + ' ' + text + (difference < 0 ? ' ago' : '');
};

$(function()
{
	var timeManager = {
		load: function()
		{
			$('.time-period').each(function()
			{
				timeManager.formatPeriod($(this));
			});

			$('.time-formal').each(function()
			{
				timeManager.formatFormal($(this));
			});

			$.fn.extend({
				formatPeriods: function()
				{
					this.find('.time-period').each(function()
					{
						timeManager.formatPeriod($(this));
					});
					return this;
				},

				formatFormal: function()
				{
					this.find('.time-formal').each(function()
					{
						timeManager.formatFormal($(this));
					});
					return this;
				},

				formatTime: function()
				{
					return this.formatPeriods().formatFormal();
				}
			});
		},

		formatPeriod: function(t)
		{
			t.html(timeMachine.getFormalTimePeriod(timeMachine.sqlToDate(t.html())));
		},

		formatFormal: function(t)
		{
			t.html(timeMachine.getFormalDateString(timeMachine.sqlToDate(t.html())));
		}
	};

	timeManager.load();
});