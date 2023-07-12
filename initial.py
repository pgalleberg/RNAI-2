from scholarly import scholarly

vertical_name = 'methane removal from ambient air'

publication_names = ['Atmospheric methane removal: a research agenda' ,'A novel green technology: Reducing carbon dioxide and eliminating methane from the atmosphere', 'Methane removal and atmospheric restoration', 'New Directions: Atmospheric methane removal as a way to mitigate climate change?', 'Methane removal seen as tool to slow warming']

author_details = []
citations_list = []

publication = next(scholarly.search_pubs('Atmospheric methane removal: a research agenda'))
citations = [citation['bib']['title'] for citation in scholarly.citedby(publication)]

print(citations)
sgsgs

for publication_name in publication_names:
    search_results = scholarly.search_pubs(publication_name)

    publication = next(search_results)

    cited_publications = []
    if 'cites_id' in publication.bib:
        cited_ids = publication.bib['cites_id']
        for cited_id in cited_ids:
            cited_publications.append(scholarly.search_pubs_query(cited_id).next())

    print(cited_publications)

    sgsg


    publication_details = list(search_results)[0]

    for author in publication_details['author_id']:
        print(author)
        if len(author) > 1:
            author_details = author_details + [scholarly.search_author_id(author)]
            print(scholarly.search_author_id(author))

    #citations_list = citations_list + [([citation['bib']['title'] for citation in scholarly.citedby(publication_details)])]


print(author_details)
print(citations_list)