tx-ingestion-engine WRANGLER service:

- multiple instances of the txie may be running and the txie-wrangler manages their lifecycle, receiving requests to start a new txie instance and turn off others.

- txie-wrangler will also read from the database config on cold-start to validate that all txie instances match the desired state.


# constraints
- must have access to the docker subsystem control in order to manage the running containers.

