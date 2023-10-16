from rnai.publications import get_publication_details
from rnai.authors import get_author_from_id

pub_details = get_publication_details('Application of psychophysical techniques to haptic research')

for _author_id in pub_details['author_id']:
    print(get_author_from_id(_author_id))


first_publication = author['publications'][0]
first_publication_filled = scholarly.fill(first_publication)