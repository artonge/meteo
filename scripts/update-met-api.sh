#!/bin/bash

# MET: https://api.met.no/weatherapi/locationforecast/2.0/documentation
# Weather icons: https://api.met.no/weatherapi/weathericon/2.0/documentation
# Swagger: https://github.com/swagger-api/swagger-codegen/tree/3.0.0

docker run \
	--pull \
	--rm \
	-v ${PWD}:/local \
	--ulimit nofile=122880:122880 \
	-m 3G \
	swaggerapi/swagger-codegen-cli-v3 \
	generate \
		-i https://api.met.no/weatherapi/locationforecast/2.0/swagger \
		-l typescript-fetch \
		-o /local/src/lib/met

sudo chown -R "$USER:$USER" ./src/lib/met