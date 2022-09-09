/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 08/2022
 * Script name: PTG - SERV NO CONCILIADO CS
 * Script id: customscript_ptg_serv_no_conciliados_cs
 * customer Deployment id: customdeploy_ptg_serv_no_conciliados_cs
 * Applied to:
 * File: drt_ptg_serv_no_conciliados_cs.js
 ******************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/currentRecord', 'N/url', 'N/format', 'N/ui/message', 'N/log'],

	function (currentRecord, url, format, message, log) {

		function pageInit() {}

		function saveRecord(context) {
			var rec = currentRecord.get();

			var sublistName = 'custpage_transactions';
			var rows = rec.getLineCount({
				sublistId: sublistName
			});

			if (rows == 0) {
				showMessage('No hay registros a Procesar.');
				return false;
			}
			return true;
		}
		/**
		 * [reloadForm description]
		 * @param  {[type]} scId [description]
		 * @param  {[type]} dpId [description]
		 * @return {[type]}      [description]
		 */
		function reloadForm(scId, dpId) {
			debugger;
			var rec = currentRecord.get();
			// mando los parametros al suitelet
			var trandate = '';
			if (rec.getValue('custpage_dateini')) {
				trandate = format.format({
					value: rec.getValue('custpage_dateini'),
					type: format.Type.DATE
				}) || '';
			}
			var endDate = '';
			if (rec.getValue('custpage_dateinie')) {
				endDate = format.format({
					value: rec.getValue('custpage_dateinie'),
					type: format.Type.DATE
				}) || '';
			}
			var created = '';
			if (rec.getValue('custpage_createdate')) {
				created = format.format({
					value: rec.getValue('custpage_createdate'),
					type: format.Type.DATE
				}) || '';
			}
			var vehiculo = rec.getValue('custpage_vehiculo') || null;
			var planta = rec.getValue('custpage_planta') || null;

			var script = url.resolveScript({
				scriptId: scId,
				deploymentId: dpId,
				returnExternalUrl: false,
				params: {
					vehiculo: vehiculo,
					planta: planta
				}
			});
			// refresco la pantalla
			window.onbeforeunload = false;
			window.location.href = script;
		}
		/**
		 * [showMessage description]
		 * @param  {[type]} msg [description]
		 * @return {[type]}     [description]
		 */
		function showMessage(msg, time) {
			if (!msg) {
				return;
			}
			if (!time) {
				time = 3000;
			}
			var myMessage = message.create({
				title: 'WARNING',
				message: msg,
				type: message.Type.WARNING
			});
			myMessage.show({
				duration: time
			});
		}

		function fieldChanged(context) {
			var currentRecord = context.currentRecord;
			var sublistName = context.sublistId;
			var sublistFieldName = context.fieldId;
			var totalSuma = 0;
			var counter = 0;
			var arregloRegistros = [];
			var objRegistros = {};
			var sublistaName = 'custpage_transactions';

			if (sublistName === sublistaName && sublistFieldName === 'custpage_customer'){
				var lineasTotal = currentRecord.getLineCount(sublistaName);

				for (var i = 0; i < lineasTotal; i++){
					if(currentRecord.getSublistValue({sublistId: sublistaName, fieldId: 'custpage_customer', line: i })){

						var idInterno = currentRecord.getSublistValue({sublistId: sublistaName, fieldId: 'custpage_idinterno', line: i });
						var customer = currentRecord.getSublistValue({sublistId: sublistaName, fieldId: 'custpage_customer', line: i });

						objRegistros = {idInterno: idInterno, customer: customer}
						arregloRegistros.push(objRegistros);
						var objValue = JSON.stringify(arregloRegistros);
						console.log("objValueM", objValue);

						console.log(arregloRegistros);

						currentRecord.setValue({
							fieldId: 'custpage_arreglo',
							value: objValue
						});

					}
				}
			}
		}
		   

		return {
			pageInit: pageInit,
			saveRecord: saveRecord,
			reloadForm: reloadForm,
			fieldChanged: fieldChanged
		};
	});