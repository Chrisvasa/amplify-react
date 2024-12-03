import type { Handler } from 'aws-lambda';

const GRAPHQL_ENDPOINT = process.env.API_ENDPOINT as string;
const GRAPHQL_API_KEY = process.env.API_KEY as string;

export const handler: Handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const headers = {
        'x-api-key': GRAPHQL_API_KEY,
        'Content-Type': 'application/json'
    };

    const payload = event; // Anta att detta innehåller device_id, temperature, humidity, timestamp

    if (!payload.device_id || payload.temperature == null || payload.humidity == null || !payload.timestamp) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid telemetry data" }),
        };
    }

    // Hämta ägare för device_id
    let owner: string | undefined;
    try {
        const request = new Request(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                query: `query GetDeviceOwner {
                    getDevices(device_id: "${payload.device_id}") {
                        owner
                    }
                }`
            }),
        });

        const response = await fetch(request);
        const responseBody = await response.json();
        owner = responseBody.data.getDevices?.owner;

        if (!owner) {
            throw new Error(`No owner found for device_id: ${payload.device_id}`);
        }
    } catch (error) {
        console.error("Error fetching owner:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch owner" }),
        };
    }

    // Skapa telemetridata
    const timestamp = new Date().toISOString();

    try {
        const mutationRequest = new Request(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                query: `mutation CreateTelemetry {
                    createTelemetry(input: {
                        device_id: "${payload.device_id}",
                        temperature: ${payload.temperature},
                        humidity: ${payload.humidity},
                        timestamp: ${payload.timestamp},
                        owner: "${owner}",
                        createdAt: "${timestamp}",
                        updatedAt: "${timestamp}"
                    }) {
                        device_id
                        temperature
                        humidity
                        timestamp
                        owner
                        createdAt
                        updatedAt
                    }
                }`
            }),
        });

        const response = await fetch(mutationRequest);
        const responseBody = await response.json();

        if (responseBody.errors) {
            console.error("GraphQL errors:", responseBody.errors);
            return {
                statusCode: 400,
                body: JSON.stringify(responseBody.errors),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(responseBody.data.createTelemetry),
        };
    } catch (error) {
        console.error("Error creating telemetry:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to create telemetry" }),
        };
    }
};
