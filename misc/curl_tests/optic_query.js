op.fromSPARQL(`
    SELECT ?title ?artist 
    WHERE {
        ?uri <http://top-songs.com/predicate#hasTitle> ?title;
             <http://top-songs.com/predicate#hasArtist> ?artist;
             <http://top-songs.com/predicate#hasArtist> @artistparam;
    }
    LIMIT 10`)