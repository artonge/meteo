#!/bin/bash

# Geonames documentation: https://download.geonames.org/export/dump/readme.txt

curl --silent https://download.geonames.org/export/dump/cities1000.zip > "${TMPDIR:-/tmp/}/cities1000.zip"
unzip -qo "${TMPDIR:-/tmp/}/cities1000.zip" -d "${TMPDIR:-/tmp/}"

jq -n --compact-output --raw-input --raw-output '
	[
		inputs
			| split("	")
			| {
				"id": .[0]|tonumber,
				"name": .[1],
				"latitude": .[4]|tonumber,
				"longitude": .[5]|tonumber,
				"countryCode": .[8],
				"population": .[14]|tonumber
			}
			| select(.countryCode == "FR")
	]' "${TMPDIR:-/tmp/}/cities1000.txt" > src/assets/cities1000.json
