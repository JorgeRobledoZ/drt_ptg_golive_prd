/*******************************************************************************
* * DisrupTT * DisrupTT Developers *
* **************************************************************************
* Date: 01/2022
* Script name: DRT - EI Auto STLT
* Script id: customscript_drt_ei_auto_stlt
* customer Deployment id: customdeploy_drt_ei_auto_stlt
* Applied to:
* File: drt_ei_auto_stlt.js
******************************************************************************/
/**
*@NApiVersion 2.1
*@NScriptType Suitelet
*@NModuleScope Public
*/

//define(['N/search', 'N/record', 'N/format', 'N/runtime', 'N/https', 'N/xml', 'N/encode', 'N/config', 'N/task', 'N/xml', 'N/email', 'N/file','../Bundle 373485/com.netsuite.mexicocompliance/src/electronicInvoicing/PacConnectors/mysuite/signedxml-req/util'], //SBX
define(['N/search', 'N/record', 'N/format', 'N/runtime', 'N/https', 'N/xml', 'N/encode', 'N/config', 'N/task', 'N/xml', 'N/email', 'N/file','../../SuiteBundles/Bundle 373485/com.netsuite.mexicocompliance/src/electronicInvoicing/PacConnectors/mysuite/signedxml-req/util', 'N/render'], //SBX
//define(['N/search', 'N/record', 'N/format', 'N/runtime', 'N/https', 'N/xml', 'N/encode', 'N/config', 'N/task', 'N/xml', 'N/email', 'N/file','../../SuiteBundles/Bundle 373485/com.netsuite.mexicocompliance/src/electronicInvoicing/PacConnectors/mysuite/signedxml-req/util'], //PRD
 function (search, record, format, runtime, https, xml, encode, config, task, xml, email, file, util, render) {

	 const CONST_ARR_CHART = ['&', '"', '<', '>', "'", '´'];
	 const OPERATION = 'CONVERT_NATIVE_XML';
	 //const OPERATION = 'ASYNC_CONVERT_VERIFY';
	 var jsonData = null;

	 function getSerialNumber(id) {
		log.audit("getSerialNumber(id)", id);
		 var schResult = '';

		 if (id === null) {
			 return 'GEN-1000000001';
		 }
		 var source = 'customrecord_drt_setup_serial_gi';
		 var afilters = [{
			 name: 'custrecord_drt_num_subsidiary',
			 operator: search.Operator.ANYOF,
			 values: id
		 }];
		 log.audit("afilters", afilters);
		 var acolumns = ['custrecord_drt_prefix', 'custrecord_drt_suffix', 'custrecord_drt_current', 'custrecord_drt_initial'];
		 log.audit("acolumns", acolumns);
		 var schRecord = search.create({
			 type: source,
			 filters: afilters,
			 columns: acolumns
		 }).run().each(function (result) {
			 if (result.getValue('custrecord_drt_prefix')) {
				 schResult += result.getValue('custrecord_drt_prefix');
			 }
			 if (result.getValue('custrecord_drt_suffix')) {
				 schResult += result.getValue('custrecord_drt_suffix');
			 }
			 if (parseInt(result.getValue('custrecord_drt_current')) == 0) {
				 schResult += result.getValue('custrecord_drt_initial').toString();
			 } else {
				 schResult += (result.getValue('custrecord_drt_current') || 1).toString();
			 }
			 schResult = {
				 serial: schResult,
				 id: result.id
			 };
		 });
		 log.audit("schRecord", schRecord);
		 return schResult;
	 }

	 function getDataSAT(type, id) {

		 var fieldName = 'name';
		 if (type == 'customrecord_mx_sat_payment_term') {
			 fieldName = 'custrecord_mx_sat_pt_code';
		 }
		 // 1 unidad
		 var result = search.lookupFields({
			 type: type,
			 id: id,
			 columns: [fieldName]
		 });
		 return result.name;
	 }

	 function getFormatDateXML(d) {
		 if (!d) {
			 return '';
		 }
		 var dd = (d.getDate() + 100).toString().substr(1, 2);
		 var MM = (d.getMonth() + 101).toString().substr(1, 2);
		 var yy = d.getFullYear();
		 var hh = (parseInt(d.getHours()) + 100).toString().substr(1, 2);
		 var mm = (parseInt(d.getMinutes()) + 100).toString().substr(1, 2);
		 var ss = (parseInt(d.getSeconds()) + 100).toString().substr(1, 2);

		 return yy + '-' + MM + '-' + dd + 'T' + hh + ':' + mm + ':' + ss;
	 }

	 function getSetupCFDI(idsub) {
		 var result = null;
		 // 0 units
		 var SUBSIDIARIES = runtime.isFeatureInEffect({
			 feature: 'SUBSIDIARIES'
		 });

		 if (SUBSIDIARIES && idsub) {
			 // Configuracion de la subsidiaria
			 // 5 Units
			 var subsidiary = record.load({
				 type: 'subsidiary',
				 id: idsub
			 });

			 result = {
				 rfcemisor: subsidiary.getValue('federalidnumber') || 'XAXX010101000',
				 regfiscal: subsidiary.getText('custrecord_mx_sat_industry_type').split('-')[0].trim() || '',
				 razonsoc: subsidiary.getValue('name'),
				 codigoPostalEmisor: subsidiary.getText('mainaddress_text').split('_')[1].trim() || '',
			 };

		 } else if (!SUBSIDIARIES) {
			 // Configuracion de la compania
			 // 10 unidades
			 var configRecObj = config.load({
				 type: config.Type.COMPANY_INFORMATION
			 });

			 result = {
				 rfcemisor: configRecObj.getValue('employerid') || '',
				 regfiscal: configRecObj.getText('custrecord_mx_sat_industry_type').split('-')[0].trim() || '',
				 razonsoc: configRecObj.getValue('legalname'),
				 codigoPostalEmisor: configRecObj.getText('mainaddress_text').split('_')[1].trim() || '',
			 };
		 }
		 return result;
	 }

	 function getXMLHead(userName) {
		 log.audit("getXMLHead(userName)");
		 // Obtengo el folio de la factura
		 if (!jsonData.idsetfol) {
			 var idsetfol = getSerialNumber(jsonData.subsidiary);
			 jsonData.idsetfol = idsetfol.id;
			 log.audit("idsetfol", idsetfol);
		 }

		/*var clienteObj = record.load({
			type: search.Type.CUSTOMER,
			id: jsonData.entityID
		});
		var clienteEspecial = clienteObj.getValue("custentity_ptg_cliente_especial");
		if(clienteEspecial){
			log.debug("cliente especial", clienteEspecial);
			jsonData.rfcrecep = "XAXX010101000";
			jsonData.entity = "Público en General";
		}*/


		 var xmlDoc = '';
		 xmlDoc += '<?xml version="1.0" encoding="UTF-8"?>';
		 xmlDoc += '<fx:FactDocMX ';
		 xmlDoc += 'xmlns:fx="http://www.fact.com.mx/schema/fx" ';
		 xmlDoc += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
		 xmlDoc += 'xsi:schemaLocation="http://www.fact.com.mx/schema/fx http://www.mysuitemex.com/fact/schema/fx_2010_g.xsd">';
		 xmlDoc += '  <fx:Version>8</fx:Version>';
		 xmlDoc += '  <fx:Identificacion>';
		 xmlDoc += '    <fx:CdgPaisEmisor>MX</fx:CdgPaisEmisor>';
		 xmlDoc += '    <fx:TipoDeComprobante>FACTURA</fx:TipoDeComprobante>';
		 xmlDoc += '    <fx:RFCEmisor>' + jsonData.rfcemisor + '</fx:RFCEmisor>';
		  //xmlDoc += '    <fx:RFCEmisor>XAXX010101000</fx:RFCEmisor>';
		 //xmlDoc += '    <fx:RazonSocialEmisor>' + jsonData.razonsoc + '</fx:RazonSocialEmisor>'; //Este es el que estaba originalmente se comenta por pruebas
		 xmlDoc += '    <fx:RazonSocialEmisor>JIMENEZ ESTRADA SALAS A A</fx:RazonSocialEmisor>';
		 xmlDoc += '    <fx:Usuario>' + userName + '</fx:Usuario>';
		 xmlDoc += '    <fx:AsignacionSolicitada>';
		 xmlDoc += '      <fx:Serie>' + jsonData.tranid.substring(0,1) + '</fx:Serie>';
		 xmlDoc += '      <fx:Folio>' + jsonData.tranid.substring(1) + '</fx:Folio>';
		 xmlDoc += '      <fx:TiempoDeEmision>' + jsonData.today + '</fx:TiempoDeEmision>'; // 2020-11-11T00:00:00
		 xmlDoc += '    </fx:AsignacionSolicitada>';
		 //xmlDoc += '	<fx:Exportacion>'+ jsonData.exportacion +'</fx:Exportacion>'
		 xmlDoc += '	<fx:Exportacion>01</fx:Exportacion>'
		 xmlDoc += '    <fx:LugarExpedicion>'+ jsonData.codigoPostalEmisor+ '</fx:LugarExpedicion>';
		 xmlDoc += '  </fx:Identificacion>';
		 xmlDoc += '  <fx:Emisor>';
		 xmlDoc += '    <fx:RegimenFiscal>';
		 xmlDoc += '      <fx:Regimen>' + jsonData.regfiscal.split('-')[0].trim() + '</fx:Regimen>'; //601
		 xmlDoc += '    </fx:RegimenFiscal>';
		 xmlDoc += '  </fx:Emisor>';
		 xmlDoc += '  <fx:Receptor>';
		 xmlDoc += '    <fx:CdgPaisReceptor>MX</fx:CdgPaisReceptor>';
		 xmlDoc += '    <fx:RFCReceptor>' + jsonData.rfcrecepFin + '</fx:RFCReceptor>';
		 xmlDoc += '    <fx:NombreReceptor>' + jsonData.entityFin + '</fx:NombreReceptor>';
		 xmlDoc += '	<fx:DomicilioFiscalReceptor>'+jsonData.codigoPostalReceptor+'</fx:DomicilioFiscalReceptor>';
		 //xmlDoc += '	<fx:DomicilioFiscalReceptor>78139</fx:DomicilioFiscalReceptor>'; //Este es el que estaba originalmente se comenta por pruebas
		 //xmlDoc += '	<fx:DomicilioFiscalReceptor>01030</fx:DomicilioFiscalReceptor>'; //Estaba en pruebas pero se debe quitar
		 //xmlDoc += '	<fx:RegimenFiscalReceptor>'+ jsonData.regimenFiscalReceptor +'</fx:RegimenFiscalReceptor>';
		 xmlDoc += '	<fx:RegimenFiscalReceptor>' + jsonData.tipoIndustria + '</fx:RegimenFiscalReceptor>';
		 xmlDoc += '    <fx:UsoCFDI>' + jsonData.cfdi.split('-')[0].trim() + '</fx:UsoCFDI>'; //P01
		 xmlDoc += '  </fx:Receptor>';
		 xmlDoc += '  <fx:Conceptos>';

		 var totTaxAmount = 0;
		 var totBase = 0;
		 for (var i = 0; i < jsonData.items.length; i++) {

			 var codeItem = jsonData.items[i].itemid;
			 var nameItem = jsonData.items[i].name;

			 for (var t = 0; t < CONST_ARR_CHART.length; t++) {
				 if (nameItem.indexOf(CONST_ARR_CHART[t]) >= 0) {
					 nameItem = xml.escape({
						 xmlText: nameItem
					 });
					 break;
				 }
			 }

			 for (var t = 0; t < CONST_ARR_CHART.length; t++) {
				 if (codeItem.indexOf(CONST_ARR_CHART[t]) >= 0) {
					 codeItem = xml.escape({
						 xmlText: codeItem
					 });
					 break;
				 }
			 }

			var liquidacion = "";
			var descripcionArticulo = "";
			 if(jsonData.oportunidadID){
				liquidacion = "";
				descripcionArticulo = "";
				var oportunidadRec = record.load({
				   type: search.Type.OPPORTUNITY,
				   id: jsonData.oportunidadID,
			   });
			   var folioEstacionario = "";
			   var folioSGC = oportunidadRec.getValue("custbody_ptg_folio_sgc_");
			   if(!folioSGC){
				   folioEstacionario = jsonData.oportunidad.substring(1);
			   } else {
				   folioEstacionario = folioSGC;
			   }
			 }

			 
			 if(jsonData.preliqCilind){
				log.audit("Cilindros");
				var preliqLookup = search.lookupFields({
					type: "customrecord_ptg_preliquicilndros_",
					id: jsonData.preliqCilind,
					columns: ['custrecord_ptg_folio_preliqui_cil_']
				});
				liquidacion = preliqLookup.custrecord_ptg_folio_preliqui_cil_;
				descripcionArticulo = nameItem + " Nota: " + jsonData.oportunidad.substring(1) + " - Liquidación.: " + liquidacion;
			 } else if(jsonData.preliqEstaci){
				log.audit("Estacionarios");
				liquidacion = jsonData.preliqEstaci;
				descripcionArticulo = nameItem + " Nota: " + folioEstacionario + " - Liquidación.: " + liquidacion;
			 } else if(jsonData.preliqCarbur){
				log.audit("Carburacion");
				liquidacion = jsonData.preliqCarbur;
				descripcionArticulo = nameItem + " Nota: " + jsonData.oportunidad.substring(1) + " - Liquidación.: " + liquidacion;
			 } else if(jsonData.preliqVenAnd){
				log.audit("Anden");
				liquidacion = jsonData.preliqVenAnd;
				descripcionArticulo = nameItem + " Nota: " + jsonData.oportunidad.substring(1) + " - Liquidación.: " + liquidacion;
			 } else if(jsonData.preliqViaEsp){
				log.audit("Especial");
				liquidacion = jsonData.preliqViaEsp;
				descripcionArticulo = nameItem + " Nota: " + jsonData.creadoDesde.substring(1) + " - Liquidación.: " + liquidacion;
			 } else {
				log.audit("No entro en nunguno");
			 }
			 log.audit("liquidacion", liquidacion);
			 log.audit("descripcionArticulo", descripcionArticulo);

			 xmlDoc += '    <fx:Concepto>';
			 //xmlDoc += '      <fx:NoIdentificacion>' + jsonData.permiso + '</fx:NoIdentificacion>';
			 xmlDoc += '      <fx:Cantidad>' + jsonData.items[i].quantity.toFixed(6) + '</fx:Cantidad>';
			 xmlDoc += '      <fx:ClaveUnidad>' + jsonData.items[i].ClaveUnidad + '</fx:ClaveUnidad>';
			 xmlDoc += '      <fx:UnidadDeMedida>' + jsonData.items[i].unit + '</fx:UnidadDeMedida>';
			 xmlDoc += '      <fx:ClaveProdServ>' + jsonData.items[i].ClaveProdServ + '</fx:ClaveProdServ>';
			 //xmlDoc += '      <fx:Codigo>' + codeItem + '</fx:Codigo>';
			 xmlDoc += '      <fx:Codigo>' + jsonData.permiso+'-'+ jsonData.consecutivo + '</fx:Codigo>';
			 //xmlDoc += '      <fx:Descripcion>' + nameItem + " Nota: " + jsonData.oportunidad.substring(1) + " - Liquidación.: " + liquidacion +'</fx:Descripcion>';
			 xmlDoc += '      <fx:Descripcion>' + descripcionArticulo +'</fx:Descripcion>';
			 xmlDoc += '      <fx:ValorUnitario>' + jsonData.items[i].rate + '</fx:ValorUnitario>';
			 xmlDoc += '      <fx:Importe>' + jsonData.items[i].amount + '</fx:Importe>';
			 xmlDoc += '      <fx:Descuento>' + jsonData.items[i].discount + '</fx:Descuento>';
			 xmlDoc += '	  <fx:ObjetoImp>' + jsonData.items[i].objetoImp + '</fx:ObjetoImp>';
			 //xmlDoc += '	  <fx:ObjetoImp>02</fx:ObjetoImp>';
			 //xmlDoc += '      <fx:Descuento>11.60</fx:Descuento>';
			 xmlDoc += '      <fx:ImpuestosSAT>';
			 xmlDoc += '        <fx:Traslados>';
			 if (jsonData.items[i].taxcodeid == 307) {
				 xmlDoc += '          <fx:Traslado Base="' + jsonData.items[i].amount + '" Impuesto="002" TipoFactor="Exento" />';
			 } else {
				 xmlDoc += '          <fx:Traslado Base="' + jsonData.items[i].amount + '" Importe="' + jsonData.items[i].taxamt + '" Impuesto="002" TasaOCuota="' + jsonData.items[i].taxrate + '" TipoFactor="Tasa" />';
			 }
			 xmlDoc += '        </fx:Traslados>';
			 xmlDoc += '      </fx:ImpuestosSAT>';
			 xmlDoc += '    </fx:Concepto>';
			 totTaxAmount += parseFloat(jsonData.items[i].taxamt);
			 totBase += parseFloat(jsonData.items[i].amount);
		 }

		 xmlDoc += '  </fx:Conceptos>';
		 xmlDoc += '  <fx:ImpuestosSAT TotalImpuestosTrasladados="' + totTaxAmount.toFixed(2) + '">';
		 xmlDoc += '    <fx:Traslados>';
		 xmlDoc += '      <fx:Traslado Base="' + totBase.toFixed(2) + '" Importe="' + totTaxAmount.toFixed(2) + '" Impuesto="002" TasaOCuota="' + jsonData.items[0].taxrate + '" TipoFactor="Tasa" />';
		 //xmlDoc += '      <fx:Traslado Importe="' + totTaxAmount.toFixed(2) + '" Impuesto="002" TasaOCuota="' + jsonData.items[0].taxrate + '" TipoFactor="Tasa" />';
		 xmlDoc += '    </fx:Traslados>';
		 xmlDoc += '  </fx:ImpuestosSAT>';
		 xmlDoc += '  <fx:Totales>';
		 xmlDoc += '    <fx:Moneda>' + jsonData.currency + '</fx:Moneda>';
		 xmlDoc += '    <fx:TipoDeCambioVenta>' + jsonData.exchange + '</fx:TipoDeCambioVenta>';
		 xmlDoc += '    <fx:SubTotalBruto>' + jsonData.subtot + '</fx:SubTotalBruto>';
		 xmlDoc += '    <fx:SubTotal>' + jsonData.subtot + '</fx:SubTotal>';
		 //xmlDoc += '    <fx:SubTotalBruto>238.62</fx:SubTotalBruto>';
		 //xmlDoc += '    <fx:SubTotal>238.62</fx:SubTotal>';
		 xmlDoc += '    <fx:Descuento>' + jsonData.destot + '</fx:Descuento>';
		 //xmlDoc += '    <fx:Descuento>11.60</fx:Descuento>';
		 xmlDoc += '    <fx:Total>' + jsonData.total + '</fx:Total>';
		 xmlDoc += '    <fx:TotalEnLetra>-</fx:TotalEnLetra>';
		 xmlDoc += '    <fx:FormaDePago>' + jsonData.payform + '</fx:FormaDePago>';
		 xmlDoc += '  </fx:Totales>';
		 xmlDoc += '  <fx:ComprobanteEx>';
		 xmlDoc += '    <fx:TerminosDePago>';
//		 xmlDoc += '      <fx:MetodoDePago>PPD</fx:MetodoDePago>';
		 xmlDoc += '      <fx:MetodoDePago>' + jsonData.paymeth + '</fx:MetodoDePago>';
		 xmlDoc += '    </fx:TerminosDePago>';
		 xmlDoc += '  </fx:ComprobanteEx>';
		 xmlDoc += '</fx:FactDocMX>';

		 return xmlDoc;
	 }

	// function getAllRecords() {
	
	function getAllRecords(id_factura) {
		 log.audit('Remaining Usage init getAllRecords', runtime.getCurrentScript().getRemainingUsage());
		 var isentry = true;

		 log.audit("getAllRecords_id_factura", id_factura);

		 var objItems = {};
		 var totalDescuentos = 0;
		 var lineaDescuentos = 0;
		 var subtotales = 0;
		 var lineaSubtotales = 0;
		 var linea = 0;
		 var arrayItem = [];
		 var arrayItem2 = [];
		 var rec = record.load({
			type: record.Type.INVOICE,
			id: id_factura,
			isDynamic: true,
		  });

		  var zonaPrecioId = rec.getValue("custbody_ptg_zonadeprecioop_");
		  var itemLookup = search.lookupFields({
			type: "customrecord_ptg_zonasdeprecio_",
			id: zonaPrecioId,
			columns: ['custrecord_ptg_factor_conversion', 'custrecord_ptg_precio_']
		 });

		 var factor = itemLookup.custrecord_ptg_factor_conversion;
		 var precioLitro = itemLookup.custrecord_ptg_precio_;

		//jsonData.tranid = rec.getValue({ fieldId: 'tranid'});
		//jsonData.consecutivo = rec.getValue({ fieldId: 'transactionnumber'});
		  log.audit("rec", rec);
		  var itemCount = rec.getLineCount({
			  sublistId : 'item'
			});
		for (var j=0; j<itemCount; j++) {
			log.audit("vuelta j", j);
			var lineaArray = j;
			
			var itemidArray = rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'item',
				line: j
			 }) || "";
			 var nameArray = rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'item_display',
				line: j
			 });
			 var quantityArray = rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'quantity',
				line: j
			});

			var unitArray = rec.getSublistValue({
				sublistId: 'item',
				fieldId: 'units_display',
				line: j
			 });
			/*if(nameArray == "GAS LP TEST UNIDAD GAS LP TEST UNIDAD" || nameArray == "GAS LP - PI GAS LP - PI" || nameArray == "GAS LP - PI" || nameArray == "GAS LP GAS LP" || nameArray == "GAS LP"){
				unitArray = "LTS"
			}*/ //Revisar si así quedará, se comenta por pruebas

			var taxcodeidArray = rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'taxcode',
				line: j
			 });
			var taxcodeArray = rec.getSublistText({
				sublistId: 'item', 
				fieldId: 'taxcode',
				line: j
			 });
			var taxrateArray = '0.160000';
			var rateArray = parseFloat(rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'rate',
				line: j
			 })).toFixed(2);

			 var quantityArrayFinal = 0;
			 var taxrateArrayFinal = 0;
			if(unitArray == "CIL 10 KGS" || unitArray == "CIL 20 KGS" || unitArray == "CIL 30 KGS" || unitArray == "CIL 45 KGS"){
				var cantidad = unitArray.split(" ")[1];
				quantityArrayFinal = cantidad / factor;
				taxrateArrayFinal = precioLitro;
			} else {
				quantityArrayFinal = quantityArray;
				taxrateArrayFinal = rateArray;
			}

			var taxamtArray = parseFloat(rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'tax1amt',
				line: j
			 })).toFixed(2);
			var amountArray = parseFloat(rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'amount',
				line: j
			 })).toFixed(2);
			var discouArray = parseFloat(rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'discountamount',
				line: j
			 }) || 0).toFixed(2);
			var importeBrutoArray = parseFloat(rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'grossamt',
				line: j
			 }) || 0).toFixed(2);
			var idinvoArray = rec.id;
			var typeArray = rec.type;
			var ClaveUArray = (rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'units_display',
				line: j
			}) || ";").split(';')[0];
			//log.audit('ClaveUArray',ClaveUArray);
			if(nameArray == "GAS LP TEST UNIDAD GAS LP TEST UNIDAD" || nameArray == "GAS LP - PI GAS LP - PI" || nameArray == "GAS LP - PI" || nameArray == "GAS LP GAS LP" || nameArray == "GAS LP"){
				ClaveUArray = "LTR"
			}else{
              	ClaveUArray = "H87"
            }
			var ClavePArray = (rec.getSublistValue({
				sublistId: 'item', 
				fieldId: 'custcol_mx_txn_line_sat_item_code_display',
				line: j
			 }) || " ").split(' ')[0];

			 var objetoImpArray = (rec.getSublistText({
				sublistId: 'item', 
				fieldId: 'custcol_mx_txn_line_sat_tax_object',
				line: j
			 }) || " ").split(' ')[0];

			 if(nameArray != "Descuentos, bonificaciones y devoluciones" && nameArray != "PTG - Descuentos, bonificaciones y devoluciones"){

				objItems = {line: lineaArray, itemid: itemidArray, name: nameArray, quantity: quantityArrayFinal, unit: unitArray, taxcodeid: taxcodeidArray, taxcode: taxcodeArray, taxrate: taxrateArray, rate: taxrateArrayFinal,
					taxamt: taxamtArray, amount: amountArray, discount: discouArray, idinvo: idinvoArray, type: typeArray, ClaveUnidad: ClaveUArray, ClaveProdServ: ClavePArray, objetoImp: objetoImpArray}

				lineaSubtotales = amountArray * 1;
				subtotales += lineaSubtotales;

				linea = j;
				//arrayItem.push(objItems);
					//log.audit("arrayItem.push vuelta " +j, arrayItem);

			 } else {
				lineaDescuentos = importeBrutoArray * -1;
				totalDescuentos += lineaDescuentos;
				log.audit("totalDescuentos", totalDescuentos);

				findAndUpdate(linea, "discount", lineaDescuentos.toFixed(2));
			 }

			 if(j == linea){
				arrayItem.push(objItems);
				log.audit("arrayItem.push vuelta " +j, arrayItem);
			 }
			 
			function findAndUpdate(posicion, parametro, nuevoValor){
				log.audit("entra funciona findAndUpdate");
				var foundElement = arrayItem.find(function(articulo){
					return articulo.line === posicion;
				});
				log.audit("foundElement", foundElement);
		
				foundElement[parametro] = nuevoValor;
			}
			 
		}



		//arrayItem.push(objItems);

		log.audit("arrayItem.push", arrayItem);

				 // Busqueda del Permiso de la Ubicación
				 var Objpermiso = search.lookupFields({
					type: search.Type.LOCATION,
					id: rec.getValue('custbody_ptg_planta_factura'),
					//id: 762,
					columns: ['custrecord_ptg_permiso_number']
				});

				var permiso = Objpermiso.custrecord_ptg_permiso_number; 

				 if (isentry == true) {
//					 log.audit("***ENTRA IF***");

					 jsonData = {
						idinvoice: rec.getValue('id'),
						 subsidiary: rec.getValue('subsidiary'),
						 trandate: rec.getValue('trandate'),
						 tranid: rec.getValue('tranid'),
						 entityID: rec.getValue('entity'),
						 entity: rec.getText('custbody_razon_social_para_facturar'),
						 // rfcrecep: 'XAXX010101000', 
						 rfcrecep: rec.getValue('custbody_mx_customer_rfc'),
						 currency: 'MXN',
						 exchange: parseInt(rec.getValue('exchangerate')),
						 permiso: permiso,
						 subtot: subtotales.toFixed(2),
						 //subtot: rec.getText('subtotal').replace(',', ''),
						 //subtot: rec.getValue('subtotal'),
						 //taxtot: 0,
						 total: rec.getText('total').replace(',', ''),
						 //total: rec.getValue('total'),
						 //destot: rec.getText('discounttotal').replace(',', ''),
						 //destot: rec.getValue('discounttotal'),
						 destot: totalDescuentos.toFixed(2),
						 //cfdi: 'G03',
						 cfdi: rec.getText("custbody_mx_cfdi_usage").split(' ')[0],//G03
						 //payform: '',
						 payform: rec.getText("custbody_mx_txn_sat_payment_method").split(' ')[0],//99
						 //paymeth: '',
						 paymeth: rec.getText("custbody_mx_txn_sat_payment_term").split(' ')[0],//PPD
						 oportunidad: rec.getText("opportunity").split(' ')[1],
						 creadoDesde: rec.getText("createdfrom").split(' ')[1],
						 oportunidadID: rec.getValue("opportunity"),
						 preliqCilind: rec.getValue("custbody_ptg_registro_pre_liq"),
						 preliqEstaci: rec.getValue("custbody_ptg_registro_pre_liq_esta"),
						 preliqCarbur: rec.getValue("custbody_ptg_registro_pre_liq_carb"),
						 preliqVenAnd: rec.getValue("custbody_ptg_registro_liq_venta_anden"),
						 preliqViaEsp: rec.getValue("custbody_ptg_liq_viaje_especial"),
						 rfcemisor: '',
						 today: '',
						 regfiscal: '',
						 idsetfol: '',
						 consecutivo: rec.getValue("transactionnumber"),
						 
						 items: arrayItem
			
					 };
					 isentry = false;
					var clienteObj = record.load({
						type: search.Type.CUSTOMER,
						id: jsonData.entityID
					});
					var clienteEspecial = clienteObj.getValue("custentity_ptg_cliente_especial");
					var tipoDeIndustria = clienteObj.getText('custentity_mx_sat_industry_type').split(' ')[0] || '';
					var codigoPostalCliente = clienteObj.getValue('billzip');
					if(clienteEspecial){
						log.debug("cliente especial", clienteEspecial);
						//jsonData.rfcrecepFin = "XAXX010101000"; //Este es el que estaba originalmente se comenta por pruebas
						jsonData.rfcrecepFin = "JES900109Q90";
						//jsonData.entityFin = "Público en General"; //Este es el que estaba originalmente se comenta por pruebas
						jsonData.entityFin = "JIMENEZ ESTRADA SALAS A A";
						jsonData.tipoIndustria = "601";
						jsonData.codigoPostalReceptor = "01030";
					} else {

						jsonData.rfcrecepFin = jsonData.rfcrecep;
						jsonData.entityFin = jsonData.entity;
						jsonData.tipoIndustria = tipoDeIndustria;

						if(jsonData.rfcrecep == "XAXX010101000"){
							var setupConfig = getSetupCFDI(jsonData.subsidiary);
							jsonData.codigoPostalReceptor = setupConfig.codigoPostalEmisor;
						} else {
							jsonData.codigoPostalReceptor = codigoPostalCliente;
						}

					}
					 log.audit("jsonData", jsonData);
					//log.audit("jsonData.items.length", jsonData.items.length);

				 }
		 log.audit('Remaining Usage getAllRecords', runtime.getCurrentScript().getRemainingUsage());
	 }


	 function createFile(param_name, param_fileType, param_contents, param_description, param_encoding, param_folder) {
		 try {
			 log.audit({
				 title: 'createFile',
				 details: ' param_name: ' + JSON.stringify(param_name) +
					 ' param_fileType: ' + JSON.stringify(param_fileType) +
					 ' param_contents: ' + JSON.stringify(param_contents) +
					 ' param_description: ' + JSON.stringify(param_description) +
					 ' param_encoding: ' + JSON.stringify(param_encoding) +
					 ' param_folder: ' + JSON.stringify(param_folder)
			 });
			 var respuesta = {
				 success: false,
				 data: '',
				 error: []
			 };


			 var fileObj = file.create({
				 name: param_name,
				 fileType: param_fileType,
				 contents: param_contents,
				 description: param_description,
				 encoding: param_encoding,
				 folder: param_folder,
				 isOnline: true
			 });
			 respuesta.data = fileObj.save() || '';
			 respuesta.success = respuesta.data != '';

		 } catch (error) {
			 respuesta.error.push(JSON.stringify(error));
			 log.error({
				 title: 'error createFile',
				 details: JSON.stringify(error)
			 });
		 } finally {
			 log.emergency({
				 title: 'respuesta createFile',
				 details: JSON.stringify(respuesta)
			 });
			 return respuesta;
		 }
	 }

	 function parsePACResponse(xmlstr){
			var xmlDocument = xml.Parser.fromString({
				text : xmlstr,
			});
			var resultNode = xml.XPath.select({
				node : xmlDocument,
				xpath : '/soap:Envelope/soap:Body/*[namespace-uri()=\'http://www.fact.com.mx/schema/ws\']', 
			});
				
			var pacResponseObj = util.createPacResponseObject(resultNode[0].childNodes[0]);
			var error = pacResponseObj.error;
	
			// Code 3109 is already Stamped with UUID (TIMBRE_ALREADY_APPLIED) . 
			if (error && error.code === '3109') {
				pacResponseObj.uuidStamped = 'USE_FOLIO';
			}
			log.audit('pacResponseObj',pacResponseObj);
			return pacResponseObj;
	 }

	 function execute(context) {

		 try {
			 log.audit('Remaining Usage init execute', runtime.getCurrentScript().getRemainingUsage());
			 var test = false;
			 log.audit({
				 title: 'execute 536',
				 details: JSON.stringify(context)
			 });
			 var id_factura = context.request.parameters.id_factura;
			 log.audit("id_factura", id_factura);

			 var invoiceObj = record.load({
				id: id_factura,
				type: search.Type.INVOICE,
			 });

			 var nombreInvoice = invoiceObj.getValue("tranid");
			 var subsidiariaInvoice = invoiceObj.getValue("subsidiary");

			 var requestorID = 0;
			 if(subsidiariaInvoice == 22){//subsidiariaCorpoGas
				requestorID = 5;
			 } else if (subsidiariaInvoice == 26){//subsidiariaDistribuidora
				requestorID = 4;
			 } else if (subsidiariaInvoice == 26){//subsidiariaSanLuis
				requestorID = 6;
			}
			 //getAllRecords(id_factura);

			 // obtengo la transaccion
			 var getData = getAllRecords(id_factura);
			 log.audit('getData', getData);
			 // informacion obtenida guardarla en un custom

			 if (!jsonData) {
				 log.debug('Message', 'No se encontraron resultados en la busqueda.');
				 return;
			 }
			 var resultGUID = runtime.getCurrentScript().getParameter('custscript_drt_glb_uuid') || null;
			 if (runtime.getCurrentScript().getParameter('custscript_drt_glb_folio')) {
				 jsonData.idsetfol = runtime.getCurrentScript().getParameter('custscript_drt_glb_folio');
			 }

			 log.debug('resultGUID', resultGUID);

			 //MODIFICAR
//			 jsonData.cfdi = getDataSAT('customrecord_mx_sat_cfdi_usage', runtime.getCurrentScript().getParameter('custscript_drt_glb_usagecfdi'));
//			 jsonData.payform = '99'; //runtime.getCurrentScript().getParameter('custscript_drt_glb_payform_sat');
			 //MODIFICAR
			 //jsonData.paymeth = getDataSAT('customrecord_mx_mapper_values', runtime.getCurrentScript().getParameter('custscript_drt_glb_paymethod_sat'));
			 // formateo la fecha de registro
			 var today = new Date();
			 log.audit("today", today);
			 if (runtime.getCurrentScript().getParameter('custscript_drt_glb_createdate')) {
				 today = runtime.getCurrentScript().getParameter('custscript_drt_glb_createdate');
			 }
			 jsonData.today = getFormatDateXML(today);

			 var setupConfig = getSetupCFDI(jsonData.subsidiary);
			 if (setupConfig) {
				 jsonData.rfcemisor = setupConfig.rfcemisor;
				 jsonData.regfiscal = setupConfig.regfiscal;
				 jsonData.razonsoc = setupConfig.razonsoc;
				 jsonData.codigoPostalEmisor = setupConfig.codigoPostalEmisor;
			 }
			 // Cargo la configuracion del PAC
			 var mySuiteConfig = record.load({
				 type: 'customrecord_mx_pac_connect_info',
				 //MODIFICAR
				 //id: runtime.getCurrentScript().getParameter('custscript_drt_glb_requestor')
				 id: 4
				 //id: requestorID
			 });
			 var url = mySuiteConfig.getValue('custrecord_mx_pacinfo_url') || '';
			 log.audit({
				 title: 'url1',
				 details: JSON.stringify(url)
			 });
			 // var url = 'https://www.mysuitetest.com/mx.com.fact.wsfront/FactWSFront.asmx';
			 var idFiscal = mySuiteConfig.getValue('custrecord_mx_pacinfo_taxid') || '';
			 // var userName = 'ADMIN'; 
			 // var requestor = '0c320b03-d4f1-47bc-9fb4-77995f9bf33e'; 
			 // var user = '0c320b03-d4f1-47bc-9fb4-77995f9bf33e';
			 var userName = mySuiteConfig.getValue('custrecord_mx_pacinfo_username')
			 var requestor = mySuiteConfig.getValue('custrecord_mx_pacinfo_username') || '';
			 var user = mySuiteConfig.getValue('custrecord_mx_pacinfo_username') || '';

			 log.audit({
				 title: 'jsonData',
				 details: JSON.stringify(jsonData)
			 });
			 
			 if (!resultGUID) {
				 // armo el xml
//				 log.audit("!resultGUID");
				 var xmlStr = getXMLHead(userName);
//				 log.audit("xmlStr", xmlStr);
				 var date = new Date();
				 log.audit("date", date);
				 date = getFormatDateXML(date);

				 var idFileXML = createFile(
					 'XML_'+nombreInvoice+'_'+ date,
					 file.Type.XMLDOC,
					 xmlStr,
					 'XML SAT',
					 file.Encoding.UTF8,
					 runtime.getCurrentScript().getParameter('custscript_drt_glb_folder')
				 );
				 log.audit("idFileXML doc", idFileXML);
				 // var idFileXML = createFileXML(xmlStr);
				 log.audit({
					 title: 'xmlStr',
					 details: JSON.stringify(xmlStr)
				 });
				 // convertir el xml a base 64
				 var xmlStrB64 = encode.convert({
					 string: xmlStr,
					 inputEncoding: encode.Encoding.UTF_8,
					 outputEncoding: encode.Encoding.BASE_64
				 });
				 // Envio el xml
				 var req = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://www.fact.com.mx/schema/ws">';
				 req += '   <soapenv:Header/>';
				 req += '   <soapenv:Body>';
				 req += '      <ws:RequestTransaction>';
				 req += '         <ws:Requestor>' + requestor + '</ws:Requestor>';
				 req += '         <ws:Transaction>' + OPERATION + '</ws:Transaction>';
				 req += '         <ws:Country>MX</ws:Country>';
				 req += '         <ws:Entity>' + jsonData.rfcemisor + '</ws:Entity>';
				 // req += '         <ws:Entity>XAXX010101000</ws:Entity>';
				 req += '         <ws:User>' + user + '</ws:User>';
				 req += '         <ws:UserName>' + userName + '</ws:UserName>';
				 req += '         <ws:Data1> ' + xmlStrB64 + ' </ws:Data1>';
				 //req += '         <ws:Data2>COMPROBANTE PDF</ws:Data2>';
				 //req += '         <ws:Data2>XML</ws:Data2>';
				 req += '         <ws:Data2>PDF XML</ws:Data2>';
				 req += '         <ws:Data3></ws:Data3>';
				 req += '      </ws:RequestTransaction>';
				 req += '   </soapenv:Body>';
				 req += '</soapenv:Envelope>';

				 var headers = {
					 'Content-Type': 'text/xml; charset=utf-8',
					 'Content-Length': '"' + req.length + '"',
					 'SOAPAction': 'http://www.fact.com.mx/schema/ws/RequestTransaction',
				 };

				 log.audit({
					 title: 'url2',
					 details: JSON.stringify(url)
				 });
				 log.audit({
					 title: 'req',
					 details: JSON.stringify(req)
				 });
				 log.audit({
					 title: 'headers',
					 details: JSON.stringify(headers)
				 });
				 if (!test) {
					 var serviceResponse = https.post({
						 url: url,
						 body: req,
						 headers: headers
					 });
					 // Obtengo el resultado
					 if(serviceResponse.code == 200){
					 	var parsedResponse = parsePACResponse(serviceResponse.body);
					 }
					 log.audit('parsedResponse',parsedResponse);
					 var responseText = serviceResponse.body;
					 log.audit({
						 title: 'responseText',
						 details: JSON.stringify(responseText)
					 });

					 var resp = createFile(
						 'serviceResponse '+nombreInvoice+'_'+ date,
						 file.Type.PLAINTEXT,
						 responseText,
						 'Respuesta SAT',
						 file.Encoding.UTF8,
						 runtime.getCurrentScript().getParameter('custscript_drt_glb_folder')
					 );
					 log.audit("resp", resp);

					 var xml_response = xml.Parser.fromString({
						 text: responseText
					 });
					 log.audit("xml_response", xml_response);

					 var nodeResponse = xml_response.getElementsByTagName({
						 tagName: 'Response'
					 })[0];
					 log.audit("nodeResponse", nodeResponse);
					 // verifico el resultado de la solicitud
					 var result = nodeResponse.getElementsByTagName({
						 tagName: 'Result'
					 })[0].textContent;
					 log.audit("resultt", result);

					//if (result == 'false' || result == 'true') {
					if (result == 'false') {
						 var description = nodeResponse.getElementsByTagName({
							 tagName: 'Data'
						 })[0].textContent;

						 log.error('FALLA_DE_VALIDACION_SAT', description);
						 log.audit('ID FACTURA ERROR', jsonData.idinvoice);

						 var invoiceObj = record.load({
							type: search.Type.INVOICE,
							id: jsonData.idinvoice,
						});
						var oportunidad = invoiceObj.getValue("opportunity");
						log.audit("OPORTUNIDAD ERROR", oportunidad);
						var preLiqCilindro = invoiceObj.getValue("custbody_ptg_registro_pre_liq");
						log.audit("preLiqCilindro", preLiqCilindro);
						var preLiqEstacionario = invoiceObj.getValue("custbody_ptg_registro_pre_liq_esta");
						log.audit("preLiqEstacionario", preLiqEstacionario);
						var preLiqCarburacion = invoiceObj.getValue("custbody_ptg_registro_pre_liq_carb");
						log.audit("preLiqCarburacion", preLiqCarburacion);
						var ventaAnden = invoiceObj.getValue("custbody_ptg_registro_liq_venta_anden");
						log.audit("ventaAnden", ventaAnden);
						var tipoServicio = invoiceObj.getValue("custbody_ptg_tipo_servicio");
						log.audit("tipoServicio", tipoServicio);
						var tiposDePagos = invoiceObj.getValue("custbody_ptg_tipos_de_pago");
						log.audit("tiposDePagos", tiposDePagos);
						var liqViejaEspecial = invoiceObj.getValue("custbody_ptg_liq_viaje_especial");
						log.audit("liqViejaEspecial", liqViejaEspecial);
						var recIdSaved = invoiceObj.getValue("custbody_ptg_registro_facturacion");
						log.audit("recIdSaved", recIdSaved);


						var objSumbitCR = {
							custrecord_ptg_status: description,
						}

						if(tipoServicio == 1){
							objSumbitCR.custrecord_ptg_num_viaje_fac_ = preLiqCilindro || '';
						}
						else if(tipoServicio == 2){
							objSumbitCR.custrecord_ptg_num_viaje_fac_estac = preLiqEstacionario || '';
						}
						else if(tipoServicio == 3){
							objSumbitCR.custrecord_ptg_registro_fac_carburacion = preLiqCarburacion || '';
						} else if(tipoServicio == 5){
							objSumbitCR.custrecord_ptg_venta_anden = ventaAnden || '';
						} else if(tipoServicio == 7){
							objSumbitCR.custrecord_ptg_registro_fac_viaje_especi = liqViejaEspecial || '';
						}
 
						record.submitFields({
							id: recIdSaved,
							type: "customrecord_drt_ptg_registro_factura",
							values: objSumbitCR,
						})

						var objSubmitError = {
							custbody_psg_ei_template: 123, //PLANTILLA DEL DOCUMENTO ELECTRÓNICO: MySuite outbound invoice template
							custbody_psg_ei_sending_method: 11, //MÉTODO DE ENVÍO DE DOCUMENTOS ELECTRÓNICOS: MySuite
							custbody_psg_ei_status: 5, //ESTADO DEL DOCUMENTO ELECTRÓNICO (Error en la generación)
							//custbody_ptg_registro_facturacion: recIdSaved,
							custbody_ptg_rfc_facturado: jsonData.rfcrecepFin,
						};
						log.audit("objSubmitError aqui salia error", objSubmitError);


						var id = record.submitFields({
							type: record.Type.INVOICE,
							id: jsonData.idinvoice,
							values: objSubmitError,
							options: {
								enableSourcing: true,
								ignoreMandatoryFields: true
							}
						});
						log.audit({
							title: 'id Error Invoice',
							details: JSON.stringify(id)
						});

						 

						//Traza de documento electrónico
/*						var customRecAuditoria = record.create({
							type: "customrecord_psg_ei_audit_trail",
							isDynamic: true,
						  });
						  customRecAuditoria.setValue("custrecord_psg_ei_audit_transaction", objSumbitCR.id_factura);
						  customRecAuditoria.setValue("custrecord_psg_ei_audit_entity", objSumbitCR.entity);
						  customRecAuditoria.setValue("custrecord_psg_ei_audit_event", 21);
						  customRecAuditoria.setValue("custrecord_psg_ei_audit_owner", runtime.getCurrentUser().id);
						  customRecAuditoria.setValue("custrecord_psg_ei_audit_details", objSumbitCR.status);
						  var recIdSavedAuditoria = customRecAuditoria.save();
						  log.debug({
							title: "Registro de traza de facturacion con error creado",
							details: "Id Saved: " + recIdSavedAuditoria,
						  });*/


						 return;
					 } else {

						 var resultGUID = parsedResponse.cfdiUuid;
						var resultTimeStamp = parsedResponse.dateOfCertification;

						 var responseData1 = xml_response.getElementsByTagName({
							 tagName: 'ResponseData1'
						 })[0].textContent;
						 log.audit("responseData1", responseData1);

						 var responseData2 = xml_response.getElementsByTagName({
							 tagName: 'ResponseData3'
						 })[0].textContent;
						 log.audit("responseData2", responseData2);

						 var newRecord = record.create({
							 type: 'customrecord_drt_global_invoice_response',
							 isDynamic: true
						 });
						 log.audit("newRecord", newRecord);
						 
						 if (responseData1) {
							 log.audit("if responseData1");
							var respxml = createFile(
								"XML_"+nombreInvoice+'_'+resultGUID,
								 file.Type.XMLDOC,
								 encode.convert({
									 string: responseData1,
									 inputEncoding: encode.Encoding.BASE_64,
									 outputEncoding: encode.Encoding.UTF_8
								 }),
								 'XML Certificado',
								 file.Encoding.UTF8,
								 runtime.getCurrentScript().getParameter('custscript_drt_glb_folder')
							 ) || '';
							 log.audit("if responseData1 fin XML", respxml);
						 }
						 
						
						 if (respxml.success) {
							newRecord.setValue({
								fieldId: 'custrecord_drt_xml_sat',
								value: respxml.data
							});
						}
						 if (idFileXML.success) {
							 newRecord.setValue({
								 fieldId: 'custrecord_drt_doc_xml',
								 value: idFileXML.data
							 });
							 try {
								 email.send({
									 author: 'jose.fernandez@disruptt.mx',
									 recipients: 'jose.fernandez@disruptt.mx',
									 subject: 'Timbrado PotoGas ' + jsonData.rfcemisor,
									 body: 'Factura ' + resultGUID,
									 attachments: [file.load({
										 id: idFileXML.data
									 })],

								 });
								 log.audit("email success")
							 } catch (error) {
								 log.error({
									 title: 'error email',
									 details: JSON.stringify(error)
								 });
							 }
						 }
						 newRecord.setValue({
							 fieldId: 'custrecord_drt_guid',
							 value: resultGUID
						 });
						 newRecord.setValue({
							fieldId: 'custrecord_drt_factura',
							value: jsonData.idinvoice
						});

						 var recordId = newRecord.save({
							 enableSourcing: true,
							 ignoreMandatoryFields: true
						 });

						 /***Actualiza Datos en el record de Factura ****/
						 var idSubmit = record.submitFields({
							 type: record.Type.INVOICE,
							 id: jsonData.idinvoice,
							 values: {
								 'custbody_mx_cfdi_uuid': parsedResponse.cfdiUuid,
								 'custbody_mx_cfdi_certify_timestamp': parsedResponse.dateOfCertification,
								 'custbody_psg_ei_certified_edoc': respxml.data,
								 'custbody_psg_ei_generated_edoc': "",
								 //'custbody_ptg_registro_facturacion': recIdSaved,
								 'custbody_mx_cfdi_cadena_original': parsedResponse.cfdiCadenaOriginal,
								 'custbody_mx_cfdi_issuer_serial': parsedResponse.noCertificado,
								 'custbody_mx_cfdi_qr_code': parsedResponse.cfdiQrCode,
								 'custbody_mx_cfdi_sat_serial': parsedResponse.noCertificadoSat,
								 'custbody_mx_cfdi_sat_signature': parsedResponse.selloSat,
								 'custbody_mx_cfdi_signature': parsedResponse.selloCfd,
								 'custbody_ptg_rfc_facturado': jsonData.rfcrecepFin,
							 },
							 options: {
								 enableSourcing: false,
								 ignoreMandatoryFields: true
							 }
						 });

						 log.debug("Factura actualizada", idSubmit);

						var transactionFile = render.transaction({
							entityId: Number(jsonData.idinvoice),
							printMode: render.PrintMode.PDF,
							inCustLocale: true
						});

						log.debug("transactionFile", transactionFile);

						transactionFile.name = "PDF_"+nombreInvoice+'_'+resultGUID;
						transactionFile.folder = runtime.getCurrentScript().getParameter('custscript_drt_glb_folder');

						var idPDF = transactionFile.save();

						record.submitFields({
							type: record.Type.INVOICE,
							id: jsonData.idinvoice,
							values: {
								custbody_edoc_generated_pdf: idPDF,
							}
						});


						 log.audit({
							 title: 'id Error Invoice',
							 details: JSON.stringify(id)
							});

					 }
				 }
			 }
			 
			 if (!test) {
				 log.audit("!test, !test");

					var invoiceObj = record.load({
                        type: search.Type.INVOICE,
                        id: jsonData.idinvoice,
                    });
					var preLiqCilindro = invoiceObj.getValue("custbody_ptg_registro_pre_liq");
					log.audit("preLiqCilindro", preLiqCilindro);
					var preLiqEstacionario = invoiceObj.getValue("custbody_ptg_registro_pre_liq_esta");
					log.audit("preLiqEstacionario", preLiqEstacionario);
					var preLiqCarburacion = invoiceObj.getValue("custbody_ptg_registro_pre_liq_carb");
					log.audit("preLiqCarburacion", preLiqCarburacion);
					var ventaAnden = invoiceObj.getValue("custbody_ptg_registro_liq_venta_anden");
					log.audit("ventaAnden", ventaAnden);
					var tipoServicio = invoiceObj.getValue("custbody_ptg_tipo_servicio");
					log.audit("tipoServicio", tipoServicio);
					var tiposDePagos = invoiceObj.getValue("custbody_ptg_tipos_de_pago");
					log.audit("tiposDePagos", tiposDePagos);
					var liqViejaEspecial = invoiceObj.getValue("custbody_ptg_liq_viaje_especial");
					log.audit("liqViejaEspecial", liqViejaEspecial);
					var recIdSaved = invoiceObj.getValue("custbody_ptg_registro_facturacion");
					log.audit("recIdSaved", recIdSaved);

					var objSumbitCR = {
						custrecord_ptg_xml_generado: respxml.data,
						custrecord_ptg_documento_xml: idFileXML.data,
						custrecord_ptg_status: 'Success',
					}

					if(tipoServicio == 1){
						objSumbitCR.custrecord_ptg_num_viaje_fac_ = preLiqCilindro || '';
					}
					else if(tipoServicio == 2){
						objSumbitCR.custrecord_ptg_num_viaje_fac_estac = preLiqEstacionario || '';
					}
					else if(tipoServicio == 3){
						objSumbitCR.custrecord_ptg_registro_fac_carburacion = preLiqCarburacion || '';
					}
					else if(tipoServicio == 5){
						objSumbitCR.custrecord_ptg_venta_anden = ventaAnden || '';
					} else if(tipoServicio == 7){
						objSumbitCR.custrecord_ptg_registro_fac_viaje_especi = liqViejaEspecial || '';
					}

					record.submitFields({
						id: recIdSaved,
						type: "customrecord_drt_ptg_registro_factura",
						values: objSumbitCR,
					})


					  var objSubmit = {
						custbody_mx_cfdi_uuid: resultGUID,
						custbody_drt_psg_ei_generated_edoc: respxml.data, //DRT - DOCUMENTO ELECTRÓNICO GENERADO (CERTIFICADO)
						custbody_psg_ei_certified_edoc: idFileXML.data, //DOCUMENTO ELECTRÓNICO CERTIFICADO (NO CERTIFICADO)
						//custbody_edoc_generated_pdf: resppdf.data, //PDF GENERDO
						custbody_psg_ei_status: 3, //ESTADO DEL DOCUMENTO ELECTRÓNICO (Para generación)
						//custbody_ptg_registro_facturacion: recIdSaved,
						custbody_ptg_rfc_facturado: jsonData.rfcrecepFin,
					};
					log.audit("objSubmit", objSubmit);

					 var id = record.submitFields({
						 type: record.Type.INVOICE,
						 //id: jsonData.items[i].idcashsales,
						 id: jsonData.idinvoice,
						 values: objSubmit,
						 options: {
							 enableSourcing: true,
							 ignoreMandatoryFields: true
						 }
					 });
					 log.audit({
						 title: 'id 900',
						 details: JSON.stringify(id)
					 });

				 //}
				 // actualizo el numero de serie
				 if (jsonData.idsetfol) {
					 var crSerial = search.lookupFields({
						 type: 'customrecord_drt_setup_serial_gi',
						 id: jsonData.idsetfol,
						 columns: ['custrecord_drt_current']
					 });
					 var nextNumber = crSerial.custrecord_drt_current || 1;
					 nextNumber++;
					 var id = record.submitFields({
						 type: 'customrecord_drt_setup_serial_gi',
						 id: jsonData.idsetfol,
						 values: {
							 custrecord_drt_current: nextNumber
						 }
					 });
				 }
			 }
			 log.audit('Remaining Usage end execute', runtime.getCurrentScript().getRemainingUsage());
			 log.audit('Proceso Finalizado...');
			 
		 } catch (err) {
			 log.error({
				 title: 'err',
				 details: JSON.stringify(err)
			 });
		 }
	 }

	 return {
		onRequest: execute
	 };
 });