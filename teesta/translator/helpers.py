import frappe

def get_info(lang, this_month = False):
	def _get():
		condition = ""
		if this_month:
			condition = " and modified > DATE_SUB(NOW(), INTERVAL 1 MONTH)"

		return {
			"total": frappe.db.sql("""select count(*) from `tabUser Translation`""")[0][0],
			"verified": frappe.db.sql("""select count(*) from `tabLanguage Translation`
				where language=%s and is_varified > 0 {0}""".format(condition), lang)[0][0],
			"edited": frappe.db.sql("""select count(*) from `tabLanguage Translation`
				where language=%s and modified_by != 'Administrator' {0}""".format(condition),
					lang)[0][0]
		}

	if this_month:
		return _get()
	else:
		return frappe.cache().get_value("lang-data:" + lang, _get)

@frappe.whitelist()
def verify(message, source):
	if not all([message, source]):
		raise frappe.ValidationError("Message not found")
	else:
		frappe.db.set_value("Language Translation", message, "is_varified", 1)
		frappe.db.touch("User Translation", source)

@frappe.whitelist()
def update(message, source, translated, language):
	if not all([source, translated, language]):
		raise frappe.ValidationError("Message not found")
	elif not message:
		message = frappe.get_doc("User Translation", source)
		tr = message.append("translations", {})
		tr.language = language
		tr.target_name = translated
		tr.is_varified = 0
		message.save(ignore_permissions=True)
	else:
		frappe.db.set_value("Language Translation", message, "target_name", translated)
		frappe.db.touch("User Translation", message)
