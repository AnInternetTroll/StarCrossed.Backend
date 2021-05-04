# StarCrossed.Backend

This is the backend/API for StarCrossed, a social media for Star Trek fans.

# Developers

If you wish to work on this then here's how!
(If you are looking for API documentation it should come in the `docs/` folder whenever it will be ready)

## Configuration

The MongoDB server can be configured in `confs/mongod.yaml` (**2 space indent!!!**).

```yaml
systemLog:
  destination: file
  path: "./temp/mongod.log"
  logAppend: true
storage:
  journal:
    enabled: true
  dbPath: ./data
net:
  bindIp: 0.0.0.0
  port: 27017
setParameter:
  enableLocalhostAuthBypass: true
```

The website specific configuration settings may be configured in `src/config.json`.

```json
{
	"secret": "hunter2",
	"port": 4000
}
```

## Dependencies

- Node 15 >
- Yarn 1.22 >
- MongoDB (and mongod) v4.4.5 >

Other dependencies can be installed with yarn with

```sh
yarn install
```

(`npm install` might work haven't tried)
