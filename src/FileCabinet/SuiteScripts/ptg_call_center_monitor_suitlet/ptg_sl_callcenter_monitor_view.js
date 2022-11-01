/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/log', 'N/record', 'N/render', 'N/runtime', 'N/search', 'N/url', 'N/https', "SuiteScripts/drt_custom_module/drt_mapid_cm"],
    /**
     * @param{file} file
     * @param{log} log
     * @param{record} record
     * @param{render} render
     * @param{runtime} runtime
     * @param{url} url
     * @param{search} search
     */
    (file, log, record, render, runtime, search, url, https, drt_mapid_cm) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            //Información general del usuario
            const customVars = drt_mapid_cm.ptgSuitletsCallCenterMonitor();
            const genVars    = drt_mapid_cm.getVariables();
            let remainingUsage = runtime.getCurrentScript()
            let remainingUser = runtime.getCurrentUser()
            let remainingSession = runtime.getCurrentSession()
            log.audit('remainingUsage', remainingUsage)
            log.audit('remainingUser', remainingUser)
            log.audit('remainingSession', remainingSession)

            let nameRole = search.lookupFields({
                type: search.Type.ROLE,
                id: remainingUser.role,
                columns: ['name']
            });

            log.audit("nameRole", nameRole);

            let elimCont = search.lookupFields({
                type: 'employee',
                id: remainingUser.id,
                columns: ['custentity_ptg_eliminar_contratos']
            });

            log.audit("elimCont", elimCont);

            //Instacia del DS
            let datasource = {};

            //Peticion de zonas
            //let response = https.request({
            //    method: https.Method.GET,
            //    url: 'https://apisgratis.com/cp/entidades/',              
            //});

            //log.debug('getCitys', response.body)

            //Instancia de RL para consumir
            //Home
            let getPlantas = url.resolveScript({
                scriptId: 'customscript_ptg_consulta_plantas_rs',
                deploymentId: 'customdeploy_ptg_consulta_plantas_rs'
            });

            let createOPP = url.resolveScript({
                scriptId: 'customscript_ptg_rl_post_opport_callcent',
                deploymentId: 'customdeploy_ptg_rl_post_opport_callcent'
            });

            let getOPP = url.resolveScript({
                scriptId: 'customscript_ptg_get_opportunity_rs',
                deploymentId: 'customdeploy_ptg_get_opportunity_rs'
            });

            let getCase = url.resolveScript({
                scriptId: 'customscript_ptg_get_case_rl',
                deploymentId: 'customdeploy_ptg_get_case_rl'
            });

            let getCustomer = url.resolveScript({
                scriptId: 'customscript_ptg_rl_post_consultcustomer',
                deploymentId: 'customdeploy_ptg_rl_post_consultcustomer'
            });

            let getColoniaZona = url.resolveScript({
                scriptId: 'customscript_ptg_consulta_colonia_zonars',
                deploymentId: 'customdeploy_ptg_consulta_colonia_zonars'
            });

            let getZone = url.resolveScript({
                scriptId: 'customscript_drt_ptg_get_zonas_rs',
                deploymentId: 'customdeploy_drt_ptg_get_zonas_rs'
            });

            let postCustomer = url.resolveScript({
                scriptId: 'customscript_ptg_rl_post_customers',
                deploymentId: 'customdeploy_ptg_rl_post_customers'
            });

            let getCities = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_city_country',
                deploymentId: 'customdeploy_ptg_rl_get_city_country'
            });

            //script para la creacion de servicios

            let getItems = url.resolveScript({
                scriptId: 'customscript_ptg_consulta_items_rs',
                deploymentId: 'customdeploy_ptg_consulta_items_rs'
            });

            let getMethodPayments = url.resolveScript({
                scriptId: 'customscript_ptg_sl_get_method_payment',
                deploymentId: 'customdeploy_ptg_sl_get_method_payment'
            });

            let getBusinessType = url.resolveScript({
                scriptId: 'customscript_pt_rl_get_business_type',
                deploymentId: 'customdeploy_pt_rl_get_business_type'
            });

            let getServicesOriginList = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_services_list_ca',
                deploymentId: 'customdeploy_ptg_rl_get_services_list_ca'
            });

            let postFugasQuejas = url.resolveScript({
                scriptId: 'customscript_ptg_post_case_rl',
                deploymentId: 'customdeploy_ptg_post_case_rl'
            });

            let getLisConceptosCasos = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_list_con_cases',
                deploymentId: 'customdeploy_ptg_rl_get_list_con_cases'
            });

            let postNoteandMessage = url.resolveScript({
                scriptId: 'customscript_ptg_post_note_message_rl',
                deploymentId: 'customdeploy_ptg_post_note_message_rl'
            });

            let getListCancellReason = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_list_cancell_rea',
                deploymentId: 'customdeploy_ptg_rl_get_list_cancell_rea'
            });

            let getListStatusOpp = url.resolveScript({
                scriptId: 'customscript_ptg_status_op_rs',
                deploymentId: 'customdeploy_ptg_status_op_rs'
            });

            let putOpp = url.resolveScript({
                scriptId: 'customscript_ptg_rl_post_opport',
                deploymentId: 'customdeploy_ptg_rl_post_opport'
            });

            let getSelectCustomer = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_select_customer',
                deploymentId: 'customdeploy_ptg_rl_get_select_customer'
            });

            let getCustomerV2 = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_customer_v2',
                deploymentId: 'customdeploy_ptg_rl_get_customer_v2'
            });

            let getMessageandNotes = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_msg_note_of_case',
                deploymentId: 'customdeploy_ptg_rl_get_msg_note_of_case'
            });

            let getMessageOpp = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_msg_note_of_opp',
                deploymentId: 'customdeploy_ptg_rl_get_msg_note_of_opp'
            });

            let getItemsOpp = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_items_of_opp',
                deploymentId: 'customdeploy_ptg_rl_get_items_of_opp'
            });

            let getOppV2 = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_opp_filter_v2',
                deploymentId: 'customdeploy_ptg_rl_get_opp_filter_v2'
            });

            let getFugaQuejasV2 = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_cases_filter_v2',
                deploymentId: 'customdeploy_ptg_rl_get_cases_filter_v2'
            });

            let getListCaseReplacement = url.resolveScript({
                scriptId: 'customscript_ptg_rl_list_rep_cilindro',
                deploymentId: 'customdeploy_ptg_rl_list_rep_cilindro'
            });

            let getListCreditMemoCustomer = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_credit_me_call',
                deploymentId: 'customdeploy_ptg_rl_get_credit_me_call'
            });

            let getListRMACustomer = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_rma_app_call',
                deploymentId: 'customdeploy_ptg_rl_get_rma_app_call'
            });

            let ApproveRMACustomer = url.resolveScript({
                scriptId: 'customscript_ptg_rl_approve_rma_call',
                deploymentId: 'customdeploy_ptg_rl_approve_rma_call'
            });

            let getAddressOfZIP = url.resolveScript({
                scriptId: 'customscript_ptg_rl_list_add_of_cp',
                deploymentId: 'customdeploy_ptg_rl_list_add_of_cp'
            });

            let accountsPrepayment = url.resolveScript({
                scriptId: 'customscript_ptg_get_list_of_terminal',
                deploymentId: 'customdeploy_ptg_get_list_of_terminal'
            });

            let makePrepayment = url.resolveScript({
                scriptId: 'customscript_ptg_rl_create_pre_pay_cust',
                deploymentId: 'customdeploy_ptg_rl_create_pre_pay_cust'
            });

            let getEstados = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_estados',
                deploymentId: 'customdeploy_ptg_rl_get_estados'
            });

            let getMunicipios = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_municipios',
                deploymentId: 'customdeploy_ptg_rl_get_municipios'
            });

            let getColonias = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_colonias',
                deploymentId: 'customdeploy_ptg_rl_get_colonias'
            });

            let getHistorico = url.resolveScript({
                scriptId: 'customscript_ptg_cc_changelog',
                deploymentId: 'customdeploy_ptg_cc_changelog_imp'
            });

            let getComoDato = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_comodato',
                deploymentId: 'customdeploy_ptg_rl_get_comodato'
            });

            let getCps = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_codigos_postales',
                deploymentId: 'customdeploy_ptg_rl_get_codigos_postales'
            });

            let getRealHistoric = url.resolveScript({
                scriptId: 'customscript_ptg_rl_get_real_historic',
                deploymentId: 'customdeploy_ptg_rl_get_real_historic'
            });

            let putNotes = url.resolveScript({
                scriptId: 'customscript_ptg_rl_put_notes',
                deploymentId: 'customdeploy_ptg_rl_put_notes'
            });

            let deletePayments = url.resolveScript({
                scriptId: 'customscript_ptg_rl_void_payments_cc',
                deploymentId: 'customdeploy_ptg_rl_void_payments_cc'
            });

            datasource.getPlantas = getPlantas
            datasource.createOPP = createOPP
            datasource.getOPP = getOPP;
            datasource.getCase = getCase
            datasource.getCustomer = getCustomer
            datasource.userName = remainingUser.name
            // datasource.userRole = remainingUser.roleId
            datasource.userRole = nameRole['name']
            datasource.elimCont = elimCont['custentity_ptg_eliminar_contratos']
            datasource.role = nameRole
            datasource.userRoleId = remainingUser['role']
            datasource.userSubsidiary = remainingUser.subsidiary
            datasource.getColoniaZona = getColoniaZona
            datasource.getZone = getZone
            datasource.postCustomer = postCustomer
            datasource.getCities = getCities
            datasource.getItems = getItems
            datasource.getMethodPayments = getMethodPayments
            datasource.getBusinessType = getBusinessType
            datasource.getServicesOriginList = getServicesOriginList
            datasource.userId = remainingUser.id
            datasource.postFugasQuejas = postFugasQuejas
            datasource.getLisConceptosCasos = getLisConceptosCasos
            datasource.postNoteandMessage = postNoteandMessage
            datasource.getListCancellReason = getListCancellReason
            datasource.getListStatusOpp = getListStatusOpp
            datasource.putOpp = putOpp
            datasource.getSelectCustomer = getSelectCustomer
            datasource.getCustomerV2 = getCustomerV2
            datasource.getMessageandNotes = getMessageandNotes
            datasource.getNoteOpp = getMessageOpp
            datasource.getItemsOpp = getItemsOpp
            datasource.getOppV2 = getOppV2
            datasource.getFugaQuejasV2 = getFugaQuejasV2
            datasource.getListCaseReplacement = getListCaseReplacement
            datasource.getListCreditMemoCustomer = getListCreditMemoCustomer
            datasource.getListRMACustomer = getListRMACustomer
            datasource.ApproveRMACustomer = ApproveRMACustomer
            datasource.getAddressOfZIP = getAddressOfZIP
            datasource.accountsPrepayment = accountsPrepayment
            datasource.makePrepayment = makePrepayment
            datasource.getEstados = getEstados
            datasource.getMunicipios = getMunicipios
            datasource.getColonias = getColonias
            datasource.getHistorico = getHistorico
            datasource.getComoDato = getComoDato
            datasource.getCps = getCps
            datasource.getRealHistoric = getRealHistoric
            datasource.putNotes = putNotes
            datasource.deletePayments = deletePayments
            datasource.cusVars = JSON.stringify(genVars)

            log.debug('Role usuario', remainingUser.role);
            log.debug('Roles', customVars.roles);
            if (true) {
                // if (customVars.roles.includes(remainingUser.role)) {
                //Carga de View (html)
                let viewHtml = file.load({
                    id: 'SuiteScripts/ptg_call_center_monitor_suitlet/view/index.html'
                });

                //Creación del Render
                let renderView = render.create();
                renderView.templateContent = viewHtml.getContents();

                //Pase del DS, con información y los restlet
                renderView.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: datasource

                });

                let renderedPage = renderView.renderAsString();
                scriptContext.response.write(renderedPage);

            } else {
                let viewHtml = file.load({
                    id: 'SuiteScripts/ptg_call_center_monitor_suitlet/view/403.html'
                });

                //Creación del Render
                let renderView = render.create();
                renderView.templateContent = viewHtml.getContents();

                let renderedPage = renderView.renderAsString();
                scriptContext.response.write(renderedPage);
            }
        }

        return {
            onRequest
        }

    });