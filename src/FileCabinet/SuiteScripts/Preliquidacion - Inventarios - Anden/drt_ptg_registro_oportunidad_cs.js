/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 06/2022
 * Script name: PTG - Registro de Oportunidad CS
 * Script id: customscript_drt_registro_oportunidad_cs
 * customer Deployment id: customdeploy_drt_registro_oportunidad_cs
 * Applied to: PTG - Registro de Oportunidad
 * File: drt_ptg_registro_oportunidad_cs.js
 ******************************************************************/
/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['SuiteScripts/drt_custom_module/drt_mapid_cm',"N/record", "N/search", "N/error", "N/runtime", "N/ui/dialog"], function (drt_mapid_cm, record, search, error, runtime, dialog) {

  function fieldChanged(context) {
    try {
      var objMap=drt_mapid_cm.drt_liquidacion();
      var currentRecord = context.currentRecord;
      var sublistName = context.sublistId;
      var sublistFieldName = context.fieldId;
      var cliente = currentRecord.getValue("custrecord_ptg_cliente_reg_oport");
      var publicoGeneral = 0;
      if (Object.keys(objMap).length>0) {
        publicoGeneral = objMap.publicoGeneral;
      }

      if(cliente && sublistFieldName === "custrecord_ptg_cliente_reg_oport"){
        var entityLookup = search.lookupFields({
          type: search.Type.CUSTOMER,
          id: cliente,
          columns: [
              'overduebalance',
              'creditlimit',
              'balance'
          ]
        }) || '';
        saldoVencido = parseFloat(entityLookup.overduebalance) || 0;
        limiteCredito = parseFloat(entityLookup.creditlimit) || 0;
        saldo = parseFloat(entityLookup.balance) || 0;

        currentRecord.setValue("custrecord_ptg_saldo_vencido_reg_oport", saldoVencido);
        currentRecord.setValue("custrecord_ptg_limite_credito_reg_oport", limiteCredito);
        currentRecord.setValue("custrecord_ptg_saldo_reg_oport", saldo);

        if(cliente != publicoGeneral){
          if((saldoVencido > 0) || (limiteCredito < saldo)){
            currentRecord.setValue("custrecord_ptg_excede_limite_reg_oport", true);
          } else {
            currentRecord.setValue("custrecord_ptg_excede_limite_reg_oport", false);
          }
      } else {
        currentRecord.setValue("custrecord_ptg_saldo_vencido_reg_oport", 0);
        currentRecord.setValue("custrecord_ptg_limite_credito_reg_oport", 0);
        currentRecord.setValue("custrecord_ptg_saldo_reg_oport", 0);
        currentRecord.setValue("custrecord_ptg_excede_limite_reg_oport", false);
      }
      }


    } catch (error) {
      console.log({
        title: "error fieldChanged",
        details: JSON.stringify(error),
      });
    }
  }


  return {
    fieldChanged: fieldChanged
  };
});
