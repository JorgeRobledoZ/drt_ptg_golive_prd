/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 *@Author Jorge Macias
 *@description script principal que contiene los estados implementados en el Front-End
 */
define([
    'SuiteScripts/drt_custom_module/drt_mapid_cm',
    "N/log",
    "SuiteScripts/SCRIPTS POTOGAS/ptg_module_errors",
    "SuiteScripts/SCRIPTS POTOGAS/ptg_modulos",
    "N/record",
    "N/format",
    "N/search",
  ], function (drt_mapid_cm, log, error, opport, record, format, search) {
    const responseData = {
      isSuccessful: false,
      message: "Some errors occured",
      data: null,
      apiErrorGet: [],
      apiErrorPost: [],
    };
  
    function postPrincipal(request) {
      let status = request.status;
  
      log.debug({
        title: "request",
        details: request,
      });
  
      try {
        if (request === null || request === undefined || request.length === 0) {
          responseData.apiErrorPost.push(error.errorRequestEmpty());
        }
      } catch (error) {
        return responseData;
      }
  
      try {
        var mapObj=drt_mapid_cm.getVariables();
        switch (status) {
          case "1": // oportunidad cancelada
            opport.changeStatusOpportunity(request, responseData,mapObj.statusOpportunityCancelada);
            break;
  
          case "2": // oportunidad se reprograma
            opport.changeStatusOpportunity(request, responseData, mapObj.statusOpportunityReprograma);
            break;
  
          case "3": //confimar
           // opport.createOrder(request, responseData);
            opport.changeStatusOpportunity(request, responseData, mapObj.statusOpportunityResponseData);
            break;
  //
          case "4": //modificar
            opport.modifOpportunity(request, responseData);
            break;
          default:
            throw new Error("Invalid option selected!")
            break;
        }
      } catch (err) {
        responseData.apiErrorPost.push(error.errorNotParameter(err.message));
      }
  
      return responseData;
    }
  
    return {
      post: postPrincipal,
    };
  });
  