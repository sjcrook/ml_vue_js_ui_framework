curl --anyauth --user admin:admin -i -X POST -d @./optic_plan.json \
    -H "Content-type: application/json" -H "Accept: application/json" \
    "http://localhost:58005/v1/rows?bind:artistparam:string=Eagles"