/**
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 */
define([
        'SuiteScripts/drt_custom_module/drt_ptg_address_cm',
        'N/search',
        'N/ui/message'
    ],
    (
        drt_ptg_address_cm,
        search,
        message
    ) => {
        const recordMessage = (scriptContext) => {
            try {
                log.debug(`recordMessage ${scriptContext.type}`, `Type: ${scriptContext.newRecord.type} ID: ${scriptContext.newRecord.id}`);
                if (
                    scriptContext.type == scriptContext.UserEventType.VIEW
                ) {
                    const columsCustomRecord = [
                        {
                            name: "name",
                        },
                        {
                            name: "custrecord_drt_ptg_ms_message",
                        },
                        {
                            name: "custrecord_drt_ptg_ms_type",
                        },
                        {
                            name: "custrecord_drt_ptg_ms_duration",
                        },
                        {
                            name: "custrecord_drt_ptg_ms_codigo",
                        },
                        {
                            name: "custrecord_drt_ptg_ms_key",
                        },
                        {
                            name: "custrecord_drt_ptg_ms_field",
                        },
                    ]
                    const arrayCustomRecord = drt_ptg_address_cm.arraySearchRecord(
                        "customrecord_drt_ptg_message_satus",
                        [
                            ["isinactive", search.Operator.IS, "F"]
                        ],
                        columsCustomRecord
                    );
                    arrayCustomRecord.forEach(registro => {
                        const arrayField = (registro.custrecord_drt_ptg_ms_field).split(",");
                        arrayField.forEach(fieldid => {
                            const fieldidValue = scriptContext.newRecord.getValue(fieldid) || "";
                            const fieldidText = scriptContext.newRecord.getText(fieldid) || "";
                            if (
                                fieldidValue == registro.custrecord_drt_ptg_ms_key ||
                                fieldidText == registro.custrecord_drt_ptg_ms_key ||
                                fieldidValue == registro.custrecord_drt_ptg_ms_key_text ||
                                fieldidText == registro.custrecord_drt_ptg_ms_key_text
                            ) {
                                messageCreate(
                                    scriptContext,
                                    {
                                        title: registro.name,
                                        message: registro.custrecord_drt_ptg_ms_message,
                                        type: message.Type[registro.custrecord_drt_ptg_ms_codigo],
                                        duration: parseInt(registro.custrecord_drt_ptg_ms_duration)
                                    },
                                    registro.id
                                );
                            }
                        });
                    });
                }
            } catch (error) {
                log.error(`error recordMessage`, error);
            }
        }

        const messageCreate = (scriptContext, paramMessage, param_id) => {
            log.debug(`messageCreate ${param_id}`, paramMessage);
            try {
                scriptContext.form.addPageInitMessage(paramMessage);
                /*
                let inlineHTMLField = scriptContext.form.addField({
                    id: `custpage_${param_id}`,
                    type: 'INLINEHTML',
                    label: 'Inject Code'
                });


                inlineHTMLField.defaultValue = `<script>
                    require(['N/ui/message'], (m_message) => { 
                       const mssg= m_message.create(paramMessage);
                       mssg.show(); 
                    });
                </script>
                `;
                */
            } catch (error) {
                log.error(`error messageCreate`, error);
            }
        }


        return {
            messageCreate,
            recordMessage
        };

    }
);
