op.fromSPARQL(`
    SELECT ?songTitle ?artistName
    WHERE {
        ?songID <http://top-songs.com/predicate#hasSongTitle> ?songTitle;
                <http://top-songs.com/predicate#writtenBy> ?artistID .
        ?artistID <http://top-songs.com/predicate#hasArtistName> ?artistName;
                  <http://top-songs.com/predicate#hasArtistName> ?artistparam .
    }
    LIMIT 10
`)