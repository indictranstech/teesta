import frappe
import teesta

def get_context(context):
	context.get_info = frappe.get_attr("teesta.translator.helpers.get_info")
	context.parents =  [{"title":"Community", "name":"community"}]
