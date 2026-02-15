import DopplerSDK from '@dopplerhq/node-sdk';

let doppler: any = null;
let loaded = false;

export async function getDopplerClient(): Promise<any> {
    if (!process.env.DOPPLER_PROD_KEY) {
        return;
    }
    if (!doppler) {
        doppler = new DopplerSDK({
            accessToken: process.env.DOPPLER_PROD_KEY,
        });
    }

    if (!loaded) {
        const secrets = await doppler.secrets.list('backend', 'prd');

        // Inject into process.env
        if (secrets.secrets) {
            Object.entries(secrets.secrets).forEach(([key, value]: [string, any]) => {
                if (!process.env[key]) {
                    process.env[key] = value.raw;
                }
            });
        }

        if (process.env.DOPPLER_DEV_KEY) {
            const devDoppler = new DopplerSDK({
                accessToken: process.env.DOPPLER_DEV_KEY,
            });
            const devSecrets = await devDoppler.secrets.list('backend', 'dev');

            // Inject into process.env
            if (devSecrets.secrets) {
                Object.entries(devSecrets.secrets).forEach(([key, value]: [string, any]) => {
                    if (!process.env[key]) {
                        process.env[key] = value.raw;
                    }
                });
            }
        }

        loaded = true;
    }

    return doppler;
}
