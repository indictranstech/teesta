$(document).ready(function() {
	$("body").on("click", ".translated", function(e) {
		translator.activate($(this));
	});

	$("body").on("click", ".btn-verify", function() {
		translator.verify($(this));
	});
});

function get_next_row($row) {
	for(var i=0; i<400; i++) {
		$row = $row.next();
		if ($row.find("a.btn-verify[data-verified=0]").size() > 0) {
			return $row
		}
	}
	return $row;
}

function get_next_translation($currentElement) {
	$row = get_next_row($currentElement.closest('.row'))
	return $row.find('.translated')
}

function get_parameter_by_name(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var translator = {
	next: function($next) {
		var $txt = $(".edit-value")
		if (!$next) {
			$next = get_next_translation($txt)
		}
		$next.trigger('click')
	},
	remove: function() {
		var $txt = $(".edit-value")
		$txt.parent().removeClass("active").html($txt.attr('data-original'));
	},
	update: function(callback) {
		var $txt = $(".edit-value"),
			val = $txt.val();

		if(!$txt.length) {
			return;
		}

		if(val===$txt.attr('data-original')) {
			translator.next()
		}

		if(!val) {
			frappe.msgprint("Please enter translated text");
			return;
		}
		console.log(val, $txt.parents(".row:first").attr("data-message-id"), $txt.parents(".row:first").attr("data-source-message-id"), window.lang)
		frappe.call({
			method: "teesta.translator.helpers.update",
			args: {
				message: $txt.parents(".row:first").attr("data-message-id"),
				source: $txt.parents(".row:first").attr("data-source-message-id"),
				language: window.lang,
				translated: val
			},
			callback: function(data) {
				console.log(data)
				if(!data.exc) {
					$next = get_next_translation($txt)
					$txt.parent().removeClass("active").html(val);
					translator.next($next)
				}
			}
		});
	},
	activate: function($div) {
		if(getCookie("sid")==="Guest") {
			frappe.msgprint("Please <a href='/login'>login</a> to edit / verify");
			return;
		}

		if($div.hasClass("active"))
			return;

		var verified = parseInt($div.attr("data-verified"));

		translator.remove();
		var content = $div.text().trim(),
			$me = $div.empty().addClass("active"),
			$txt = $('<textarea class="edit-value form-control" style="height: 80px;">' + content + '</textarea>')
				.appendTo($me)
				.attr('data-original', content)
				.focus(),
			$p = $('<p class="text-right" style="margin-top: 5px;"></p>').appendTo($me),
			$cancel = $('<button class="btn btn-default btn-small">Next</button>')
				.appendTo($p)
				.on("click", function(e) {
					$next = get_next_translation($txt)
					translator.next()
					translator.next($next)
				});
			$update = $('<button class="btn btn-primary btn-small">Update</button>')
				.appendTo($p)
				.css({"margin-left": "5px"})
				.on("click", function() {
					translator.update();
				});

		if(window.lang=="ar") {
			$txt.addClass('text-right');
		}

	},
	verify: function($btn) {
		frappe.call({
			method: "teesta.translator.helpers.verify",
			args: {
				message: $btn.parents(".row:first").attr("data-message-id"),
				source: $btn.parents(".row:first").attr("data-source-message-id")
			},
			callback: function(data) {
				if(!data.exc) {
					var verified = (parseInt($btn.attr("data-verified")) + 1);
					$btn.html("Verified");
					if(verified===1) {
						$btn.parent().find(".indicator").removeClass("red").addClass("green");
					}
					$btn.attr("data-verified", verified);
				}
			}
		});

	}
}

