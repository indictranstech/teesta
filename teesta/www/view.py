import frappe

def get_context(context):
	query = """select
		source.name as source_name, source.source_name as message,
		translated.name as translated_name, translated.target_name as translated,
		translated.is_varified as verified, 0 as flagged, ifnull(translated.modified, source.modified) as modified, 
		ifnull(translated.modified_by, source.modified_by) as modified_by, user.first_name, user.last_name
	from `tabUser Translation` source
		left join `tabLanguage Translation` translated on
			(source.name=translated.parent and translated.language = %s)
		left join tabUser user on (ifnull(translated.modified_by, source.modified_by)=user.name)
	where
		{condition}
	order by translated.is_varified, source.source_name"""

	lang = frappe.form_dict.lang

	if frappe.form_dict.search:
		condition = "(source.source_name like %s or translated.target_name like %s)"
		condition_values = ['%' + frappe.db.escape(frappe.form_dict.search) + '%', '%' + frappe.db.escape(frappe.form_dict.search) + '%']

	else:
		if frappe.form_dict.c:
			c = frappe.db.escape(frappe.form_dict.c)
		else:
			c = "*"

		if c == "*":
			condition = "source.source_name REGEXP '^[a-zA-Z]'"
			condition_values = None
			pass

		else:
			condition = "source.source_name like %s"
			condition_values = [c + '%']

	cond_tuple = tuple([lang] + condition_values) if condition_values else (lang,)

	context.messages = frappe.db.sql(query.format(condition=condition), cond_tuple, as_dict=True)

	context.parents = [
		{"title": "Community", "name":"community"},
		{"title": "Languages", "name":"translator"}
	]

