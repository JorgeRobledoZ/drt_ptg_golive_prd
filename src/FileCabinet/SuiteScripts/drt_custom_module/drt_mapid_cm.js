/**
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 */
define(
    [
        'N/runtime'
    ],
    (
        runtime
    ) => {
        const ptg_mr_update_opportunities = () => {
            let respuesta = {};
            try {
                const mapObj = {
                    [runtime.EnvType.PRODUCTION]: {
                        customForm:265,
                        productgasLpId:4216,
                        publicoGeneral:27041,
                    },
                    [runtime.EnvType.SANDBOX]: {
                        customForm:305,
                        productgasLpId:4088,
                        publicoGeneral:14508,
                    }
                }
                respuesta=mapObj[runtime.envType];
            } catch (error) {
                log.error(`error ptg_mr_update_opportunities`, error);
            } finally {
                log.debug(`respuesta ptg_mr_update_opportunities ${runtime.envType}`, respuesta);
                return respuesta;
            }
        }

        return {
            ptg_mr_update_opportunities
        };

    });
