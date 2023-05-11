curl --anyauth --user admin:admin -i -X POST \
    --data-binary @./query_Eagles_graph.sparql \
    -H "Content-type: application/sparql-query" \
    -H "Accept: application/json" \
    http://localhost:58005/v1/graphs/sparql