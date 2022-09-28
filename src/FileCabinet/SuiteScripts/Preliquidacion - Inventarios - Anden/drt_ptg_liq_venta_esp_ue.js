/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 07/2022
 * Script name: PTG - Liquidación Viaje especial UE
 * Script id: customscript_drt_ptg_liq_venta_esp_ue
 * customer Deployment id: customdeploy_drt_ptg_liq_venta_esp_ue
 * Applied to: PTG - Liquidación viaje especial
 * File: drt_ptg_liq_venta_esp_ue.js
 ******************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['SuiteScripts/drt_custom_module/drt_mapid_cm', 'N/runtime', 'N/search', 'N/record', 'N/email', 'N/error', 'N/url', 'N/https', 'N/task'], function (drt_mapid_cm, runtime, search, record, email, error, url, https, task) {
  function afterSubmit(context) {
    try {
      var newRecord = context.newRecord;
      var recId = newRecord.id;
      var nombreSublista = "recmachcustrecord_ptg_vta_esp_";
      var lineCount = newRecord.getLineCount({ sublistId: nombreSublista }) || 0;
      var transaccion = newRecord.getValue("custrecord_ptg_factura_vta_especial_");
      var factura = transaccion[0];
      var planta = newRecord.getValue("custrecord_ptg_planta_vta_especial_");
      var localizacionAlmacen = newRecord.getValue("custrecord_ptg_loc_almacen_");
      var gasLP = 0;
      var formularioFacturaPTG = 0;
      var notaLinea = "";
      var formaPago = 0;
      var referencia = "";
      var cliente = 0;
      var direccion = "";
      var litrosVendidos = [];
      var precioUnitario = [];
      var importe = [];
      var impuesto = [];
      var total = [];
      var idTransaccionArray = [];
      var efectivoId = 0;
      var prepagoBanorteId = 0;
      var valeId = 0;
      var cortesiaId = 0;
      var tarjetaCreditoId = 0;
      var tarjetaDebitoId = 0;
      var multipleId = 0;
      var prepagoTransferenciaId = 0;
      var creditoClienteId = 0;
      var reposicionId = 0;
      var saldoAFavorId = 0;
      var consumoInternoId = 0;
      var prepagoBancomerId = 0;
      var prepagoHSBCId = 0;
      var prepagoBanamexId = 0;
      var prepagoSantanderId = 0;
      var prepagoScotianId = 0;
      var bonificacionId = 0;
      var ticketCardId = 0;
      var chequeBancomerId = 0;
      var recirculacionId = 0;
      var canceladoId = 0;
      var rellenoId = 0;
      var transferenciaId = 0;
      var traspasoId = 0;
      var chequeSantanderId = 0;
      var chequeScotianId = 0;
      var chequeHSBCId = 0;
      var chequeBanamexId = 0;
      var chequeBanorteId = 0;
      var tarjetaCreditoBancomerId = 0;
      var tarjetaCreditoHSBCId = 0;
      var tarjetaCreditoBanamexId = 0;
      var tarjetaDebitoBanamexId = 0;
      var tarjetaDebitoBancomerId = 0;
      var tarjetaDebitoHSBCId = 0;
      var servicioViajeEspecial = 0;
      var formularioOrdenVenta = 0;


      var objMap=drt_mapid_cm.drt_liquidacion();
      if (Object.keys(objMap).length>0) {
        efectivoId = objMap.efectivoId;
        prepagoBanorteId = objMap.prepagoBanorteId;
        valeId = objMap.valeId;
        cortesiaId = objMap.cortesiaId;
        tarjetaCreditoId = objMap.tarjetaCreditoId;
        tarjetaDebitoId = objMap.tarjetaDebitoId;
        multipleId = objMap.multipleId;
        prepagoTransferenciaId = objMap.prepagoTransferenciaId;
        creditoClienteId = objMap.creditoClienteId;
        reposicionId = objMap.reposicionId;
        saldoAFavorId = objMap.saldoAFavorId;
        consumoInternoId = objMap.consumoInternoId;
        prepagoBancomerId = objMap.prepagoBancomerId;
        prepagoHSBCId = objMap.prepagoHSBCId;
        prepagoBanamexId = objMap.prepagoBanamexId;
        prepagoSantanderId = objMap.prepagoSantanderId;
        prepagoScotianId = objMap.prepagoScotianId;
        bonificacionId = objMap.bonificacionId;
        ticketCardId = objMap.ticketCardId;
        chequeBancomerId = objMap.chequeBancomerId;
        recirculacionId = objMap.recirculacionId;
        canceladoId = objMap.canceladoId;
        rellenoId = objMap.rellenoId;
        transferenciaId = objMap.transferenciaId;
        traspasoId = objMap.traspasoId;
        chequeSantanderId = objMap.chequeSantanderId;
        chequeScotianId = objMap.chequeScotianId;
        chequeHSBCId = objMap.chequeHSBCId;
        chequeBanamexId = objMap.chequeBanamexId;
        chequeBanorteId = objMap.chequeBanorteId;
        tarjetaCreditoBancomerId = objMap.tarjetaCreditoBancomerId;
        tarjetaCreditoHSBCId = objMap.tarjetaCreditoHSBCId;
        tarjetaCreditoBanamexId = objMap.tarjetaCreditoBanamexId;
        tarjetaDebitoBanamexId = objMap.tarjetaDebitoBanamexId;
        tarjetaDebitoBancomerId = objMap.tarjetaDebitoBancomerId;
        tarjetaDebitoHSBCId = objMap.tarjetaDebitoHSBCId;
        formulario = objMap.formulario;
        gasLP = objMap.gasLP;
        servicioViajeEspecial = objMap.servicioViajeEspecial;
        formularioOrdenVenta = objMap.formularioOrdenVenta;
        plantillaDocumentoElectronico = objMap.plantillaDocumentoElectronico;
        metodoDeEnvio = objMap.metodoDeEnvio;
        formularioFacturaPTG = objMap.formularioFacturaPTG;
      }

      if (!factura) {
        for (var i = 0; i < lineCount; i++) {
          notaLinea = newRecord.getSublistValue({
            sublistId: nombreSublista,
            fieldId: "custrecord_ptg_nota_vta_espc_det_",
            line: 0
          }) || "";

          formaPago = newRecord.getSublistValue({
            sublistId: nombreSublista,
            fieldId: "custrecord_ptg_formapago_det_vta_esp_",
            line: 0
          }) || "";

          referencia = newRecord.getSublistValue({
            sublistId: nombreSublista,
            fieldId: "custrecord_ptg_referencia_vta_esp_det_",
            line: 0
          }) || "";

          cliente = newRecord.getSublistValue({
            sublistId: nombreSublista,
            fieldId: "custrecord_ptg_cliente_vta_esp_",
            line: 0
          }) || "";

          direccion = newRecord.getSublistValue({
            sublistId: nombreSublista,
            fieldId: "custrecord_ptg_direc_emb_vta_esp_",
            line: 0
          }) || "";

          litrosVendidos[i] = newRecord.getSublistValue({
            sublistId: nombreSublista,
            fieldId: "custrecord_ptg_lts_vendidos_vta_esp_",
            line: i
          }) || "";

          precioUnitario[i] = newRecord.getSublistValue({
            sublistId: nombreSublista,
            fieldId: "custrecord_ptg_pu_vta_esp_",
            line: i
          }) || "";

          importe[i] = newRecord.getSublistValue({
            sublistId: nombreSublista,
            fieldId: "custrecord_ptg_importe_",
            line: i
          }) || "";

          impuesto[i] = newRecord.getSublistValue({
            sublistId: nombreSublista,
            fieldId: "custrecord_ptg_impuesto_vta_esp_",
            line: i
          }) || "";

          total[i] = newRecord.getSublistValue({
            sublistId: nombreSublista,
            fieldId: "custrecord_ptg_total_vta_esp_",
            line: i
          }) || "";
        }

        var entityObj = record.load({
          type: search.Type.CUSTOMER,
          id: cliente,
        });
        log.audit("entityObj", entityObj);
        
        var cfdiCliente = entityObj.getValue("custentity_disa_uso_de_cfdi_") || 3;
        log.audit("cfdiCliente solicita", cfdiCliente);
        var clienteTXT = entityObj.getValue("altname");
        var clienteAFacturar = entityObj.getValue("custentity_razon_social_para_facturar");
        var nombreClienteAFacturar = "";
        nombreClienteAFacturar = clienteAFacturar;

        var ubicacionObj = record.load({
          type: search.Type.LOCATION,
          id: localizacionAlmacen,
        });
        log.audit("entityObj", entityObj);
        
        var subsidiaria = ubicacionObj.getValue("subsidiary");
        log.audit("subsidiaria", subsidiaria);


        var recordSalesOrder = record.create({
          type: record.Type.SALES_ORDER,
          isDynamic: true,
        });
        recordSalesOrder.setValue("customform", formularioOrdenVenta);
        recordSalesOrder.setValue("entity", cliente);
        recordSalesOrder.setValue("location", localizacionAlmacen);
        //recordSalesOrder.setValue("inventorylocation", localizacionAlmacen);
        recordSalesOrder.setValue("memo", notaLinea);
        recordSalesOrder.setValue("custbody_ptg_tipo_servicio", servicioViajeEspecial);
        recordSalesOrder.setValue("custbody_ptg_opcion_pago", formaPago);
        recordSalesOrder.setValue("custbody_ptg_liq_viaje_especial", recId);
        recordSalesOrder.setValue("orderstatus", "B");
        recordSalesOrder.setValue("origstatus", "B");
        recordSalesOrder.setValue("salesrep", 14296);
        recordSalesOrder.setValue("custbody_disa_pm_apro_directo", true);
        recordSalesOrder.setValue("custbody_psg_ei_status", 3); //ESTADO DEL DOCUMENTO ELECTRÓNICO
        //recordSalesOrder.setValue("custbody_mx_cfdi_usage", cfdiCliente);
        //recordSalesOrder.setValue("custbody_razon_social_para_facturar", nombreClienteAFacturar);
        //recordSalesOrder.setValue("custbody_psg_ei_template", 123); //PLANTILLA DEL DOCUMENTO ELECTRÓNICO
        //recordSalesOrder.setValue("custbody_psg_ei_sending_method", 11); //MÉTODO DE ENVÍO DE DOCUMENTOS ELECTRÓNICOS

        var formaPagoSAT = searchFormaPagoSAT(subsidiaria, formaPago);
        log.emergency("formaPagoSAT", formaPagoSAT);
        recordSalesOrder.setValue("custbody_mx_txn_sat_payment_method", formaPagoSAT);

        if(formaPago == efectivoId){ //EFECTIVO
          recordSalesOrder.setValue("custbody_mx_txn_sat_payment_term", 3); //PUE - Pago en una Sola Exhibición
        } 
        else if(formaPago == prepagoBanorteId || formaPago == prepagoTransferenciaId || formaPago == prepagoBancomerId || formaPago == prepagoHSBCId || formaPago == prepagoBanamexId || formaPago == prepagoSantanderId || formaPago == prepagoScotianId){ //PREPAGO
          recordSalesOrder.setValue("custbody_mx_txn_sat_payment_term", 4); //PPD - Pago en Parcialidades o Diferido
        }
        else if(formaPago == cortesiaId){ //CORTESIA
          recordSalesOrder.setValue("custbody_mx_txn_sat_payment_term", 4); //PPD - Pago en Parcialidades o Diferido
        }
        else if(formaPago == tarjetaCreditoId || formaPago == tarjetaCreditoBancomerId || formaPago == tarjetaCreditoHSBCId || formaPago == tarjetaCreditoBanamexId){ //TARJETA CREDITO
          recordSalesOrder.setValue("custbody_mx_txn_sat_payment_term", 3); //PUE - Pago en una Sola Exhibición
        }
        else if(formaPago == tarjetaDebitoId || formaPago == tarjetaDebitoBanamexId || formaPago == tarjetaDebitoBancomerId || formaPago == tarjetaDebitoHSBCId){ //TARJETA DEBITO
          recordSalesOrder.setValue("custbody_mx_txn_sat_payment_term", 3); //PUE - Pago en una Sola Exhibición
        } 
        else if(formaPago == creditoClienteId){ //CREDITO CLIENTE
          recordSalesOrder.setValue("custbody_mx_txn_sat_payment_term", 4); //PPD - Pago en Parcialidades o Diferido
        }
        else if(formaPago == reposicionId){ //REPOSICION
          recordSalesOrder.setValue("custbody_mx_txn_sat_payment_term", 4); //PPD - Pago en Parcialidades o Diferido
        }
        else if(formaPago == bonificacionId){ //BONIFICACION
          recordSalesOrder.setValue("custbody_mx_txn_sat_payment_term", 4); //PPD - Pago en Parcialidades o Diferido
        }
        else if(formaPago == chequeBancomerId || formaPago == chequeSantanderId || formaPago == chequeScotianId || formaPago == chequeHSBCId || formaPago == chequeBanamexId || formaPago == chequeBanorteId){ //CHEQUE
          recordSalesOrder.setValue("custbody_mx_txn_sat_payment_term", 3); //PUE - Pago en una Sola ExhibiciónrateArray
        }
        else {
          recordSalesOrder.setValue("custbody_mx_txn_sat_payment_term", 4); //PPD - Pago en Parcialidades o Diferido
        }

        for (var j = 0; j < lineCount; j++) {
          recordSalesOrder.selectLine("item", j);
          recordSalesOrder.setCurrentSublistValue("item", "item", gasLP);
          recordSalesOrder.setCurrentSublistValue("item", "inventorylocation", localizacionAlmacen);
          recordSalesOrder.setCurrentSublistValue("item", "quantity", litrosVendidos[j]);
          recordSalesOrder.setCurrentSublistValue("item", "rate", precioUnitario[j]);
          recordSalesOrder.setCurrentSublistValue("item", "custcol_ptg_cantidad_litros", litrosVendidos[j]);
          recordSalesOrder.setCurrentSublistValue("item", "custcol_ptg_precio_unitario", precioUnitario[j]);
          recordSalesOrder.commitLine("item");
        }

        var idrecordSalesOrder = recordSalesOrder.save({
          ignoreMandatoryFields: true
        });

        log.debug({
          title: "Orden de Venta Creada",
          details: "Id Saved: " + idrecordSalesOrder,
        });

        /*var mrTask = task.create({
          taskType: task.TaskType.MAP_REDUCE,
          scriptId: 'customscript_drt_ptg_load_save_mr',
          params: {
            custscript_drt_ptg_transaccion: idrecordSalesOrder,
          }
        });
        var mrTaskId = mrTask.submit();
        var taskStatus = task.checkStatus(mrTaskId);
        log.audit({title: 'taskStatus', details: JSON.stringify(taskStatus)});*/


        idTransaccionArray.push(idrecordSalesOrder);

        if(idrecordSalesOrder){
          log.audit("Entra ItemF");
          var newRecordItemFulfillment = record.transform({
            fromType: record.Type.SALES_ORDER,
            fromId: idrecordSalesOrder,
            toType: record.Type.ITEM_FULFILLMENT,
            isDynamic: false,
            defaultValues: {
              customform: 291,
              inventorylocation: localizacionAlmacen
            }
          });

          var lineCount = newRecordItemFulfillment.getLineCount('item');
          for (var i = 0; i < lineCount; i++) {
            newRecordItemFulfillment.setSublistValue('item', 'location', i, localizacionAlmacen);
          }
          newRecordItemFulfillment.setValue("shipstatus", "C");
          newRecordItemFulfillment.setValue("custbody_psg_ei_template", plantillaDocumentoElectronico);
          newRecordItemFulfillment.setValue("custbody_psg_ei_sending_method", metodoDeEnvio);
  
          var idItemFulfillment = newRecordItemFulfillment.save({
            enableSourcing: true,
            ignoreMandatoryFields: false,
          }) || "";

          log.debug({
            title: "Ejecución Creada",
            details: "Id Saved: " + idItemFulfillment,
          });
  
          idTransaccionArray.push(idItemFulfillment);
        }

        if(idItemFulfillment){
          var recordFactura = record.transform({
            fromType: record.Type.SALES_ORDER,
            fromId: idrecordSalesOrder,
            toType: record.Type.INVOICE,
            isDynamic: true,
          });

          recordFactura.setValue("customform", formularioFacturaPTG);
          recordFactura.setValue("custbody_mx_cfdi_usage", cfdiCliente);
          recordFactura.setValue("custbody_razon_social_para_facturar", nombreClienteAFacturar);

          var idRecordFactura = recordFactura.save({
            enableSourcing: false,
            ignoreMandatoryFields: true,
          }) || "";

          log.debug({
            title: "Factura Creada",
            details: "Id Saved: " + idRecordFactura,
          });

          idTransaccionArray.push(idRecordFactura);

        }

        var objUpdate = {
          custrecord_ptg_factura_vta_especial_: idTransaccionArray,
        };

        var registroUpd = record.submitFields({
          id: newRecord.id,
          type: newRecord.type,
          values: objUpdate,
        });

        log.debug("Registro Actualizado con factura", registroUpd);

        if(idRecordFactura){
          //SE HACE EL PROCESO DE GENERAR DOCUMENTO Y TIMBRADO
          var urlStlt = url.resolveScript({
            scriptId: "customscript_drt_ei_auto_stlt",
            deploymentId: "customdeploy_drt_global_invoice_suitelet",
            returnExternalUrl: true,
            params: {
              id_factura: idRecordFactura
            }
          });
          log.audit("urlStlt", urlStlt);
          var link = https.get({
            url: urlStlt
          });
          log.audit("link", link);
        }

        if(idRecordFactura && (formaPago == efectivoId || formaPago == tarjetaCreditoId || formaPago == tarjetaDebitoId || formaPago == chequeBancomerId || formaPago == chequeSantanderId || formaPago == chequeScotianId || formaPago == chequeHSBCId || formaPago == chequeBanamexId || formaPago == chequeBanorteId || formaPago == tarjetaCreditoBancomerId || formaPago == tarjetaCreditoHSBCId || formaPago == tarjetaCreditoBanamexId || formaPago == tarjetaDebitoBanamexId || formaPago == tarjetaDebitoBancomerId || formaPago == tarjetaDebitoHSBCId)){
          var pagoObj = record.transform({
            fromType: record.Type.INVOICE,
            fromId: idRecordFactura,
            toType: record.Type.CUSTOMER_PAYMENT,
            isDynamic: false
          });

          var pagoObjID = pagoObj.save({
            ignoreMandatoryFields: true
          });
          log.debug("Pago Creado con: "+formaPago, pagoObjID);
        }


      }
    } catch (e) {
      log.error({
        title: e.name,
        details: e.message,
      });
    }
  }

  function beforeSubmit(context) {
    try {
      if (context.type == "create") {
        var newRecord = context.newRecord;
        var folio = newRecord.getValue("custrecord_ptg_folio_preliq_vtaespecial");
        if (!folio) {
          var numerofolio = search.create({
            type: "customrecord_ptg_liqui_viaje_especial_",
            filters: [],
            columns: [],
          });
          var contadorSearch = numerofolio.runPaged().count;
          log.debug("numero de conteo", contadorSearch);
          var contador = contadorSearch + 1;
          newRecord.setValue("custrecord_ptg_folio_preliq_vtaespecial", contador);
        }
      }
    } catch (error) {
      log.error({
        title: e.name,
        details: e.message,
      });
    }
  }

  function searchFormaPagoSAT(idSubsidiaria, idTipoPago) {
    try {
        var formaDePagoDefault = 0;
        var objMap=drt_mapid_cm.drt_liquidacion();
        if (Object.keys(objMap).length>0) {
            formaDePagoDefault = objMap.formaDePagoDefault;
        }

        //SS: PTG - Mapeo Formas de pago y cuentas SS
        var mapeoCuentaObj = search.create({
            type: "customrecord_mapeo_formasdepago_cuentas",
            filters: [
                ["custrecord_ptg_formadepago_subsidiaria", "anyof", idSubsidiaria], "AND",
                ["custrecord_ptg_forma_pago", "anyof", idTipoPago],
            ],
            columns: [
                search.createColumn({
                    name: "custrecord_ptg_forma_pago_sat",
                    label: "PTG - FORMA DE PAGO SAT",
                }),
            ],
        });

        var mapeoCuentaObjCount = mapeoCuentaObj.runPaged().count;
        var mapeoCuentaObjResult = mapeoCuentaObj.run().getRange({
            start: 0,
            end: mapeoCuentaObjCount,
        });
        if (mapeoCuentaObjCount > 0) {
            idFormaPago = mapeoCuentaObjResult[0].getValue({
                name: "custrecord_ptg_forma_pago_sat",
                label: "PTG - FORMA DE PAGO SAT",
            });
            log.debug("idFormaPago", idFormaPago);
        } else {
            idFormaPago = formaDePagoDefault;
            log.debug("forma de pago no encontrada", idFormaPago);
        }

        return idFormaPago;
    } catch (error) {
        log.error({
            title: "error searchFormaPagoSAT",
            details: JSON.stringify(error),
        });
    }
}

  return {
    afterSubmit: afterSubmit,
    beforeSubmit: beforeSubmit,
  };
});
