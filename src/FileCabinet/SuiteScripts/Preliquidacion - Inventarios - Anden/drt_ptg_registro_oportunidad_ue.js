/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 02/2022
 * Script name: PTG - Registro de Oportunidad UE
 * Script id: customscript_drt_registro_oportunidad_ue
 * customer Deployment id: customdeploy_drt_registro_oportunidad_ue
 * Applied to: PTG - Registro de Oportunidad
 * File: drt_ptg_registro_oportunidad_ue.js
 ******************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['SuiteScripts/drt_custom_module/drt_mapid_cm', "N/record", "N/search", "N/runtime", 'N/ui/serverWidget', 'N/redirect'], function (drt_mapid_cm, record, search, runtime, serverWidget, redirect) {
  function afterSubmit(context) {
    try {
      if (context.type == "edit") {
        log.audit("edit");
        var customRec = context.newRecord;
        var recId = customRec.id;
        var numViaje = customRec.getValue("custrecordptg_numviajeoportunidad_");
        var tipoPagoNew = customRec.getValue("custrecord_ptg_tipopago_oportunidad_");
        var clienteOld = context.oldRecord.getValue("custrecord_ptg_cliente_reg_oport");
        var clienteNew = customRec.getValue("custrecord_ptg_cliente_reg_oport");
        var oportunidad = customRec.getValue("custrecord_ptg_oportunidad_");
        var preliquidacion = customRec.getValue("custrecord_ptg_optpreliq_");
        var totalOld = context.oldRecord.getValue("custrecord_ptg_total_");
        var totalNew = customRec.getValue("custrecord_ptg_total_");
        var prepagoForm = customRec.getValue("custpage_prepago");
        var prepagoFormOld = context.oldRecord.getValue("custpage_prepago");
        var prepagoValue = customRec.getValue("custrecord_ptg_prepago_reg_oport");
        var zonaPrecio = customRec.getValue("custrecord_ptg_ro_zona_precio");
        var prepagoBanorteId = 0;
        var prepagoTransferenciaId = 0;
        var prepagoBancomerId = 0;
      	var prepagoHSBCId = 0;
      	var prepagoBanamexId = 0;
      	var prepagoSantanderId = 0;
      	var prepagoScotianId = 0;
        var estatusFacturacion = 0;
        var objMap=drt_mapid_cm.drt_liquidacion();

        if (Object.keys(objMap).length>0) {
          prepagoBanorteId = objMap.prepagoBanorteId;
          prepagoTransferenciaId = objMap.prepagoTransferenciaId;
          prepagoBancomerId = objMap.prepagoBancomerId;
          prepagoHSBCId = objMap.prepagoHSBCId;
          prepagoBanamexId = objMap.prepagoBanamexId;
          prepagoSantanderId = objMap.prepagoSantanderId;
          prepagoScotianId = objMap.prepagoScotianId;
          estatusFacturacion = objMap.estatusFacturacion;
          articuloCilindro = objMap.articuloCilindro;
        }
        
        var preliquidacionObj = record.load({
            type: "customrecord_ptg_preliquicilndros_",
            id: preliquidacion,
        });
        log.debug("preliquidacionObj", preliquidacionObj);
        var statusPreliquidacion = preliquidacionObj.getValue("custrecord_ptg_liquidacion_status");
        log.audit("statusPreliquidacion", statusPreliquidacion);
        var objUpdate = {};
        var objUpdatePreliq = {};

        objUpdate.custrecord_ptg_prepago_reg_oport = prepagoForm;
        if(statusPreliquidacion != estatusFacturacion) {
            if(clienteOld != clienteNew){

              var clienteObj = record.load({
                type: search.Type.CUSTOMER,
                id: clienteNew
              });
              var clienteDescuento = false;
              var descuentoPeso = parseFloat(clienteObj.getValue("custentity_ptg_descuento_asignar"));
              if(descuentoPeso > 0){
                  clienteDescuento = true;
              }
              var descuentoSinIVA = descuentoPeso / 1.16;
              var zonaPrecioObj = record.load({
                type: "customrecord_ptg_zonasdeprecio_",
                id: zonaPrecio,
              });
              var factorConversion = parseFloat(zonaPrecioObj.getValue("custrecord_ptg_factor_conversion"));
              //var descuentoUnitario = (litrosVendidos * descuentoSinIVA) * -1;



                var oportunidadObj = record.load({
                    type: record.Type.OPPORTUNITY,
                    id: oportunidad,
                });

                oportunidadObj.setValue("entity", clienteNew);

                var itemCountLine = oportunidadObj.getLineCount({
                  sublistId: 'item'
                });
                var itemDescuentoLine = itemCountLine + 1;
                var descuentoUnitario = 0;

                for(var i = 0; i < numLines; i++){
                  articulo = oportunidadObj.getSublistValue("item", "item", i);
                  precioUnitario = oportunidadObj.getSublistValue("item", "rate", i);
                  var itemObj = record.load({
                    type: search.Type.INVENTORY_ITEM,
                    id: articulo,
                  });
                  var tipoArticulo = itemObj.getValue("custitem_ptg_tipodearticulo_");
                  var capacidad = parseInt(itemObj.getValue("custitem_ptg_capacidadcilindro_"));
                  if(tipoArticulo == articuloCilindro){
                    var litrosConversion = capacidad / factorConversion;
                    descuentoUnitario = (litrosConversion * descuentoSinIVA) * -1;
                    var nuevoPrecioUnitario = precioUnitario + descuentoUnitario;
                    oportunidadObj.setSublistValue("item", "rate", i, nuevoPrecioUnitario);
                  }
                }

                //Se agrega la línea de descuento en caso que el cliente tenga descuento
                if(clienteDescuento){
                  for (var i = itemCountLine; i < itemDescuentoLine; i++) {
                    oportunidadObj.selectLine("item", i);
                    oportunidadObj.setCurrentSublistValue("item", "item", idArticuloDescuento);
                    oportunidadObj.setCurrentSublistValue("item", "rate", descuentoUnitario);
                    oportunidadObj.commitLine("item");
                  }
                }
      
                var oportunidadSaved = oportunidadObj.save();
                log.debug({
                  title: "Oportunidad updated successfully",
                  details: "Id: " + oportunidadSaved,
                });
                 

             /*   var objUpdate = {
                    entity: clienteNew,
                }

                
                var recOportunidad = record.submitFields({
                    type: record.Type.OPPORTUNITY,
                    id: oportunidad,
                    values: objUpdate,
                });
                log.audit("Oportunidad actualizada", recOportunidad);*/



                var objDetalleResumen = {};

                //SS: PTG - Detalle Resumen SS
                var detalleResumen = search.create({
                    type: "customrecord_ptg_detalle_resumen_",
                    filters:[["custrecord_ptg_oportuni_detalle_resumen_","anyof",oportunidad]],
                    columns:[search.createColumn({name: "internalid", sort: search.Sort.DESC, label: "ID interno"})]
                  });
                  var detalleResumenCount = detalleResumen.runPaged().count;
                  if(detalleResumenCount > 0){
                    var detalleResumenResult = detalleResumen.run().getRange({
                      start: 0,
                      end: 2,
                    });
                    (idDetalleResumen = detalleResumenResult[0].getValue({name: "internalid", sort: search.Sort.DESC, label: "ID interno"}));
                  }
  
                  objDetalleResumen.custrecord_ptg_cliente_detalleresumen_ = clienteNew;
  
                  var detalleResumenUpd = record.submitFields({
                    type: "customrecord_ptg_detalle_resumen_",
                    id: idDetalleResumen,
                    values: objDetalleResumen,
                  });
                  log.audit("Registro actualizado detalleResumenUpd", detalleResumenUpd);
  
            } else {
                log.audit("Mismo Cliente");
                if((tipoPagoNew == prepagoBanorteId || tipoPagoNew == prepagoTransferenciaId || tipoPagoNew == prepagoBancomerId || tipoPagoNew == prepagoHSBCId || tipoPagoNew == prepagoBanamexId || tipoPagoNew == prepagoSantanderId || tipoPagoNew == prepagoScotianId) && !prepagoFormOld && prepagoForm){
                    log.audit("Entra descuento prepagos");
                    objUpdate.custrecord_ptg_prepago_aplicar_oport = false;
                }
            }
        } else {
            log.audit("Liquidación facturada");
                objUpdate.custrecord_ptg_cliente_reg_oport = clienteOld;
            
        }
        record.submitFields({
            type: "customrecord_ptg_registrooportunidad_",
            id: recId,
            values: objUpdate,
        });

        redirect.toRecord({
          type: "customrecord_ptg_preliquicilndros_",
          id: preliquidacion,
          parameters: {
            'reload' : true
          }
        });

      }
    } catch (e) {
      log.error({ title: e.name, details: e.message });
    }
  }

  function beforeLoad(context){
    try {
        var customRec = context.newRecord;
        var recId = customRec.id;
        var idCliente = customRec.getValue("custrecord_ptg_cliente_reg_oport");
        log.audit("idCliente", idCliente);
        var prepagoValue = customRec.getValue("custrecord_ptg_prepago_reg_oport");
        var prepagoText = customRec.getText("custrecord_ptg_prepago_reg_oport");

        var form = context.form;

        var tipodoc = form.addField({
            id: 'custpage_prepago',
            type: serverWidget.FieldType.SELECT,
            label: 'PTG - Prepago',
        });

        if(prepagoValue){
            tipodoc.addSelectOption({value: prepagoValue, text: prepagoText});
          }
        
        // Cambio NC
        //SS: PTG - Pago Prepago SS
        var search_Transac = search.create({
            type: 'customerpayment',
            filters: [
                ["type","anyof","CustPymt"], "AND", 
                ["custbody_ptg_prepago","is","T"], "AND", 
                [["name","anyof",idCliente],"OR",["custbody_ptg_cliente_prepago","anyof",idCliente]], "AND", 
                ["amountremaining","greaterthan","0.00"]
            ],
            columns: ['internalid', 'transactionname', 'amountremaining', 'memo']
        });
        log.audit("search_Transac", search_Transac);
        
        resultSearch = search_Transac.run().getRange(0,1000);
        log.audit("resultSearch", resultSearch);

        if (resultSearch != null && resultSearch.length > 0) {
            tipodoc.addSelectOption({value: '',text: ''});

            for (i = 0; i < resultSearch.length; i++) {
                row = resultSearch[i].columns;
                var reportID2 = resultSearch[i].getValue(row[0]);
                var reportNM2 = resultSearch[i].getValue(row[1]);
                var reportMO2 = resultSearch[i].getValue(row[2]);
                var reportME2 = resultSearch[i].getValue(row[3]);

                tipodoc.addSelectOption({value: reportID2,text: reportNM2 +" Saldo: $"+reportMO2 +" Referencia: "+reportME2});
            }
        }

    } catch (error) {
        log.error("Error beforeLoad", error);
    }
  }

  return {
    afterSubmit: afterSubmit,
    beforeLoad: beforeLoad,
  };
});
