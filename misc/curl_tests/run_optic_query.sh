curl --anyauth --user admin:admin -i -X POST -d @./optic_query.js \
    -H "Content-type: application/vnd.marklogic.querydsl+javascript" -H "Accept: application/json" \
    "http://localhost:58005/v1/rows?bind:artistparam:string=Eagles"